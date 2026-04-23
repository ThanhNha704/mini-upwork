"use server";

import Stripe from "stripe";
import { redirect } from "next/navigation";
import { createClient } from "@/src/utils/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function getClientBillingData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [userRes, contractsRes, transRes] = await Promise.all([
    supabase.from("users").select("balance").eq("id", user.id).single(),
    supabase.from("contracts")
      .select(`
        *,
        job:job_id (title) 
      `)
      .eq("client_id", user.id)
      .eq("status", "in_progress"),
    supabase.from("transaction").select("*").eq("userId", user.id).order("createdAt", { ascending: false })
  ]);

  return {
    balance: userRes.data?.balance || 0,
    pendingContracts: contractsRes.data || [],
    transactions: transRes.data || []
  };
}

export async function getFreelancerBillingData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Lấy thông tin user
  const { data: userData } = await supabase
    .from("users")
    .select("balance, stripe_connect_id")
    .eq("id", user.id)
    .single();

  // Lấy transactions
  const { data: transactions } = await supabase
    .from("transaction")
    .select("*")
    .eq("userId", user.id)
    .order("createdAt", { ascending: false });

  // Trả về object chứa đầy đủ thông tin
  return {
    balance: userData?.balance || 0,
    stripe_connect_id: userData?.stripe_connect_id || null,
    pendingAmount: 0,
    transactions: transactions || []
  };
}

// Action giải ngân tiền cho Freelancer
export async function payFreelancerAction(contractId: string) {
  const supabase = await createClient();

  // Gọi hàm RPC handle_job_payment
  const { error } = await supabase.rpc('handle_job_payment', {
    p_contract_id: contractId

  });

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function createDeposit(formData: FormData) {
  const amount = Number(formData.get("amount"));
  const userId = formData.get("userId") as string;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{
      price_data: {
        currency: "usd",
        product_data: { name: "Nạp tiền ví hệ thống" },
        unit_amount: Math.round(amount * 100),
      },
      quantity: 1,
    }],
    mode: "payment",
    metadata: { userId },
    success_url: `${siteUrl}/dashboard/client/finance?success=true`,
    cancel_url: `${siteUrl}/dashboard/client/finance?canceled=true`,
  });

  if (session.url) redirect(session.url);
}