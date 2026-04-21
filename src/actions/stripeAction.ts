"use server";

import Stripe from "stripe";
import { redirect } from "next/navigation";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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
            unit_amount: amount * 100, // Stripe dùng cent
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: { userId }, // Metadata cực kỳ quan trọng để Webhook đọc
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/client/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/client/billing?canceled=true`,
    });

    sessionUrl = session.url!;
  } catch (error) {
    console.error("Stripe Error:", error);
    throw new Error("Không thể tạo phiên thanh toán");
  }

  // Chuyển hướng người dùng sang Stripe
  redirect(sessionUrl);
}