"use server";

import Stripe from "stripe";
import { redirect } from "next/navigation";
import { createClient } from "@/src/utils/supabase/server";
import { revalidatePath } from "next/cache";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// NẠP TIỀN (STRIPE CHECKOUT) - Dành cho Client
export async function createCheckoutSession(formData: FormData) {
  const amount = Number(formData.get("amount"));
  const userId = formData.get("userId") as string;

  if (!amount || amount < 1) return;

  let sessionUrl = "";

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Nạp tiền vào ví hệ thống",
              description: "Tiền sẽ được cộng vào số dư tài khoản của bạn",
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: { userId, type: "deposit" }, 
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/client/finance?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/client/finance?canceled=true`,
    });

    sessionUrl = session.url!;
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    throw new Error("Không thể tạo phiên thanh toán");
  }

  redirect(sessionUrl);
}

// RÚT TIỀN (STRIPE CONNECT) - Dành cho Freelancer

// Tạo link Onboarding để Freelancer đăng ký thông tin ngân hàng với Stripe
export async function getStripeConnectLink() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Chưa đăng nhập");

  // Lấy profile hiện tại
  const { data: profile } = await supabase
    .from('users')
    .select('stripe_connect_id')
    .eq('id', user.id)
    .single();

  let stripeAccountId = profile?.stripe_connect_id;

  if (!stripeAccountId) {
    const account = await stripe.accounts.create({ type: 'express' });
    stripeAccountId = account.id;

    // QUAN TRỌNG: Phải có dòng này để lưu vào DB ngay lập tức
    const { error } = await supabase
      .from('users')
      .update({ stripe_connect_id: stripeAccountId })
      .eq('id', user.id);
      
    if (error) console.error("Lỗi lưu ID:", error.message);
  }

  // Tạo link trả về
  const accountLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/freelancer/earnings`,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/freelancer/earnings`,
    type: 'account_onboarding',
  });

  return { url: accountLink.url };
}

// Thực hiện lệnh chuyển tiền từ ví sàn sang ví Stripe Freelancer
export async function withdrawToStripeAction(amount: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Phiên đăng nhập hết hạn" };

  const { data: userData } = await supabase
    .from('users')
    .select('balance, stripe_connect_id')
    .eq('id', user.id)
    .single();

  if (!userData?.stripe_connect_id) return { success: false, error: "Chưa kết nối Stripe" };
  if (userData.balance < amount) return { success: false, error: "Số dư ví hệ thống không đủ" };

  try {
    // Thực hiện lệnh chuyển tiền trên Stripe
    await stripe.transfers.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      destination: userData.stripe_connect_id,
      metadata: { userId: user.id }
    });

    // Trừ tiền trong bảng users
    await supabase
      .from('users')
      .update({ balance: userData.balance - amount })
      .eq('id', user.id);

    // LƯU LỊCH SỬ VÀO BẢNG transaction
    const { error: txError } = await supabase
      .from('transaction')
      .insert({
        userId: user.id,
        amount: amount,
        type: 'withdrawal',
        status: 'completed',
        description: `Rút tiền về Stripe (ID: ${userData.stripe_connect_id})`,
        createdAt: new Date().toISOString()
      });

    if (txError) {
        console.error("Lỗi insert transaction:", txError.message);
    }

    revalidatePath('/dashboard/freelancer/earnings');
    return { success: true };

  } catch (err: any) {
    console.error("Stripe Transfer Error:", err);
    // Trả về lỗi trực tiếp từ Stripe (ví dụ: Insufficient funds) để hiển thị setMessage
    return { success: false, error: err.message };
  }
}