"use server"

import { createClient } from "@/src/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * 1. Action ứng tuyển vào công việc (Apply)
 */
export async function applyJobAction(formData: {
  jobId: string;
  bidAmount: number;
  proposal: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, message: "Bạn cần đăng nhập để apply." };
  const { error } = await supabase.from('applications').insert({
    job_id: formData.jobId,
    freelancer_id: user.id,
    bid_amount: formData.bidAmount,
    content: formData.proposal,
    status: 'pending'
  });

  if (error) return { success: false, message: "Lỗi ứng tuyển: " + error.message };

  revalidatePath(`/jobs/${formData.jobId}`);
  return { success: true, message: "Ứng tuyển thành công!" };
}

/**
 * 2. Action giải ngân tiền từ Escrow về ví Freelancer
 * Dùng khi Client xác nhận hoàn thành công việc
 */
export async function releasePaymentAction(contractId: string, amount: number, freelancerId: string) {
  const supabase = await createClient();

  // Gọi một hàm RPC trên Supabase để thực hiện transaction: 
  // Trừ tiền ở Escrow của Contract và cộng vào Balance của Freelancer
  const { error } = await supabase.rpc('handle_release_payment', {
    p_contract_id: contractId,
    p_freelancer_id: freelancerId,
    p_amount: amount
  });

  if (error) return { success: false, message: "Thanh toán thất bại: " + error.message };

  revalidatePath('/dashboard/client/finance');
  return { success: true, message: "Đã giải ngân tiền thành công." };
}

/**
 * 3. Action yêu cầu rút tiền về ngân hàng
 */
export async function requestWithdrawAction(amount: number, bankDetails: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Phiên đăng nhập hết hạn." };
  if (amount <= 0) return { success: false, error: "Số tiền không hợp lệ." };

  // 1. Kiểm tra số dư hiện tại
  const { data: userData } = await supabase
    .from("users")
    .select("balance")
    .eq("id", user.id)
    .single();

  if (!userData || userData.balance < amount) {
    return { success: false, error: "Số dư không đủ để thực hiện giao dịch." };
  }

  // 2. Thực hiện trừ tiền và tạo lệnh rút (Nên dùng RPC/Transaction để an toàn)
  // Ở đây dùng logic đơn giản:
  const { error: withdrawError } = await supabase.from('withdrawals').insert({
    user_id: user.id,
    amount: amount,
    bank_info: bankDetails,
    status: 'pending'
  });

  if (withdrawError) return { success: false, error: withdrawError.message };

  // 3. Trừ số dư trong bảng users
  await supabase
    .from("users")
    .update({ balance: userData.balance - amount })
    .eq("id", user.id);

  revalidatePath('/dashboard/freelancer/earnings');
  return { success: true, message: "Yêu cầu rút tiền đã được gửi tới Admin." };
}

export async function getFreelancerStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Lấy số lượng đã apply
  const { count: appliedCount } = await supabase
    .from("application")
    .select("*", { count: 'exact', head: true })
    .eq("freelancerId", user.id);

  // 2. Lấy số lượng đang thực hiện (Dựa trên bảng contracts)
  const { count: inProgressCount } = await supabase
    .from("contracts")
    .select("*", { count: 'exact', head: true })
    .eq("freelancer_id", user.id)
    .eq("status", "in_progress");

  // 3. Lấy số lượng đã hoàn thành
  const { count: completedCount } = await supabase
    .from("contracts")
    .select("*", { count: 'exact', head: true })
    .eq("freelancer_id", user.id)
    .eq("status", "completed");

  // 4. Lấy số dư hiện tại (Tổng thu nhập khả dụng)
  const { data: userData } = await supabase
    .from("users")
    .select("balance, full_name")
    .eq("id", user.id)
    .single();

  return {
    applied: appliedCount || 0,
    inProgress: inProgressCount || 0,
    completed: completedCount || 0,
    balance: userData?.balance || 0,
    name: userData?.full_name || "Freelancer"
  };
}