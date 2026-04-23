import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  // Xác thực Webhook từ Stripe
  try {
    if (!sig || !endpointSecret) {
      console.error("❌ Thiếu signature hoặc endpoint secret");
      return new NextResponse("Missing signature or secret", { status: 400 });
    }
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error(`❌ Webhook Error: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Xử lý sự kiện nạp tiền thành công
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Khởi tạo Supabase Admin (dùng Service Role Key) để bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const userId = session.metadata?.userId;
    const amount = (session.amount_total || 0) / 100;
    const stripeSessionId = session.id;

    if (!userId) {
      console.error("❌ Webhook Error: Không tìm thấy userId trong metadata");
      return new NextResponse("User ID missing", { status: 200 });
    }

    try {
      // CHỐNG TRÙNG LẶP: Kiểm tra xem giao dịch này đã xử lý chưa
      const { data: existingTx } = await supabaseAdmin
        .from("transaction")
        .select("id")
        .eq("stripe_session_id", stripeSessionId)
        .single();

      if (existingTx) {
        console.log("⚠️ Giao dịch đã được xử lý trước đó:", stripeSessionId);
        return new NextResponse("Already processed", { status: 200 });
      }
      
      // Ghi log giao dịch kèm stripe_session_id
      const { error: txError } = await supabaseAdmin.from("transaction").insert({
        userId: userId, 
        amount: amount,
        type: "deposit",
        status: "completed",
        description: "Nạp tiền qua Stripe",
        stripe_session_id: stripeSessionId // Cần thêm cột này vào bảng transaction
      });

      if (txError) throw txError;

      // Cộng tiền vào balance
      const { error: rpcError } = await supabaseAdmin.rpc("increment_balance", {
        user_id: userId,
        amount_to_add: amount
      });

      if (rpcError) throw rpcError;

      console.log(`✨ Thành công: Đã nạp $${amount} cho user ${userId}`);

    } catch (dbError: any) {
      console.error("❌ DB Error:", dbError.message);
      // Trả về 500 để Stripe tự động gửi lại (retry) nếu lỗi database tạm thời
      return new NextResponse("Database update failed", { status: 500 });
    }
  }

  // Luôn trả về 200 cho các event khác
  return new NextResponse("Success", { status: 200 });
}