import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get("Stripe-Signature");
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  // 1. Xác thực Webhook
  try {
    if (!sig || !endpointSecret) {
      return new NextResponse("Missing signature or secret", { status: 400 });
    }
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error(`❌ Webhook Error: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // 2. Xử lý sự kiện thành công
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // SỬA LỖI Ở ĐÂY: Dùng NEXT_PUBLIC_SUPABASE_URL (https://...)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const userId = session.metadata?.userId;
    const amount = (session.amount_total || 0) / 100;

    if (userId) {
      try {
        // Ghi log giao dịch
        const { error: txError } = await supabase.from("transaction").insert({
          userId: userId, 
          amount: amount,
          type: "deposit",
          status: "completed",
          description: "Nạp tiền qua Stripe"
        });
        if (txError) throw txError;

        // Cộng tiền vào balance
        const { error: rpcError } = await supabase.rpc("increment_balance", {
          user_id: userId,
          amount_to_add: amount
        });
        if (rpcError) throw rpcError;

        console.log("✨ Thành công: Đã nạp tiền cho user", userId);
      } catch (dbError: any) {
        console.error("❌ DB Error:", dbError.message);
        // Trả về 500 nếu lỗi DB để Stripe gửi lại sau
        return new NextResponse("Database update failed", { status: 500 });
      }
    }
  }

  // 3. QUAN TRỌNG: Luôn trả về 200 cho các event khác hoặc khi hoàn tất thành công
  return new NextResponse("Success", { status: 200 });
}