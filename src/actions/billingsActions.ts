"use server";

import Stripe from "stripe";
import { redirect } from "next/navigation";
import { createClient } from "@/src/utils/supabase/server";

// Khởi tạo Stripe với Secret Key từ biến môi trường
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
// , {
//   apiVersion: "2024-12-18.acacia", 
// });

/**
 * Lấy dữ liệu tài chính cho trang Billing
 */
export async function getBillingData(userId: string) {
  const supabase = await createClient();

  // 1. Lấy số dư từ bảng users (cột balance kiểu numeric)
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("balance")
    .eq("id", userId)
    .single();

  if (userError) console.error("Error fetching balance:", userError);

  // 2. Lấy lịch sử giao dịch (Sắp xếp mới nhất lên đầu)
  const { data: transactions, error: txError } = await supabase
    .from("transaction")
    .select("*")
    .eq("userId", userId)
    .order("createdAt", { ascending: false });

  if (txError) console.error("Error fetching transactions:", txError);

  // 3. Tính toán tiền đang treo (Escrow) từ bảng payment
  const { data: escrow } = await supabase
    .from("payment")
    .select("amount")
    .eq("userId", userId)
    .eq("status", "pending");

  const pendingAmount = escrow?.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) || 0;

  return {
    balance: Number(user?.balance) || 0,
    transactions: transactions || [],
    pendingAmount
  };
}

/**
 * Tạo phiên thanh toán Stripe Checkout
 */
export async function createDeposit(formData: FormData) {
  let checkoutUrl = "";

  try {
    const amount = Number(formData.get("amount"));
    const userId = formData.get("userId") as string;

    // Validation cơ bản
    if (!amount || amount < 1) {
      throw new Error("Số tiền nạp tối thiểu là $1");
    }

    if (!userId) {
      throw new Error("Không tìm thấy ID người dùng để thực hiện nạp tiền");
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) {
      throw new Error("Thiếu cấu hình NEXT_PUBLIC_SITE_URL trong file .env");
    }

    // Tạo Stripe Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Nạp tiền vào ví hệ thống",
              description: "Tiền sẽ khả dụng ngay sau khi thanh toán thành công",
            },
            // Stripe tính theo đơn vị nhỏ nhất (cent), nên phải nhân 100
            unit_amount: Math.round(amount * 100), 
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      // Metadata này cực kỳ quan trọng để Webhook biết cộng tiền cho ai
      metadata: { 
        userId: userId 
      },
      success_url: `${siteUrl}/dashboard/client/billing?success=true`,
      cancel_url: `${siteUrl}/dashboard/client/billing?canceled=true`,
    });

    if (!session.url) {
      throw new Error("Stripe không tạo được đường dẫn thanh toán");
    }

    checkoutUrl = session.url;
  } catch (error: any) {
    console.error("❌ Lỗi createDeposit Action:", error.message);
    // Lưu ý: redirect không hoạt động bên trong khối try-catch của Next.js
    throw error;
  }

  // Thực hiện chuyển hướng người dùng sang trang thanh toán của Stripe
  if (checkoutUrl) {
    redirect(checkoutUrl);
  }
}