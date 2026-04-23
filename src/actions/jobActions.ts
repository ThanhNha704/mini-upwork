"use server";

import { createClient } from "@/src/utils/supabase/server";
import { revalidatePath } from "next/cache";

// lấy tất cả job của Client tạo
export async function getClientJobs() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("job")
    .select("*")
    .eq("clientId", user.id)
    .order("createdAt", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

// Hành động tạo job
export async function createJobAction(formData: {
  title: string;
  budget: number;
  description: string;
  skillIds: string[];
}) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Bạn cần đăng nhập" };

  // Chèn dữ liệu vào bảng 'job'
  const { data: job, error: jobError } = await supabase
    .from("job")
    .insert([{
      title: formData.title,
      description: formData.description,
      budget: formData.budget,
      status: "OPEN",
      clientId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }])
    .select()
    .single();

  if (jobError) {
    console.error("Job Creation Error:", jobError);
    return { error: "Không thể tạo dự án. Vui lòng thử lại." };
  }

  // Xử lý chèn vào bảng trung gian 'job_required_skills'
  if (formData.skillIds && formData.skillIds.length > 0) {
    const skillLinks = formData.skillIds.map((skillId) => ({
      job_id: job.id,
      skill_id: skillId,
    }));

    const { error: skillError } = await supabase
      .from("job_required_skills")
      .insert(skillLinks);

    // NẾU LỖI SKILL -> XÓA JOB VỪA TẠO (ROLLBACK)
    if (skillError) {
      console.error("Skill Linking Error:", skillError);

      await supabase.from("job").delete().eq("id", job.id);

      return { error: "Lỗi hệ thống khi lưu kỹ năng. Dự án chưa được đăng." };
    }
  }

  revalidatePath("/dashboard/client");
  return { success: true, jobId: job.id };
}

// Cập nhật job
export async function updateJob(jobId: string, formData: any) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("job")
    .update({
      title: formData.title,
      description: formData.description,
      budget: parseFloat(formData.budget),
      status: formData.status,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", jobId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { success: true, data };
}

// Lấy chi tiết job
export async function getJobDetails(jobId: string) {
  const supabase = await createClient();

  // Lấy thông tin user đang đăng nhập
  const { data: { user } } = await supabase.auth.getUser();

  // Truy vấn lồng ghép để lấy thông tin Job, Client, Skills và Kiểm tra ứng tuyển trong 1 lần gọi
  const { data, error } = await supabase
    .from("job")
    .select(`
      *,
      client:users!clientId(
        id,
        full_name,
        avatar_url,
        email,
        client_profiles!user_id(*) 
      ),
      skills:job_required_skills(
        skill:skills(id, name)
      ),
      applications:application(freelancerId)
    `)
    .eq("id", jobId)
    .single();

  if (error) {
    console.error("Lỗi lấy chi tiết Job:", error.message);
    return null;
  }

  // Xử lý dữ liệu thô thành cấu trúc gọn đẹp cho Frontend
  const formattedJob = {
    ...data,
    // Trích xuất kỹ năng thành mảng đơn giản
    skills: data.skills?.map((s: any) => s.skill) || [],
    // Kiểm tra xem freelancer hiện tại đã ứng tuyển chưa
    hasApplied: data.applications?.some((app: any) => app.freelancerId === user?.id) || false
  };

  // Trả về object chứa đầy đủ các "mảnh ghép" dữ liệu
  return {
    job: formattedJob,
    client: data.client,
    hasApplied: formattedJob.hasApplied
  };
}

// Hàm lấy danh sách ứng viên
export async function getJobProposals(jobId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("application")
      .select(`
        *,
        freelancer:users (
          full_name,
          avatar_url,
          email
        )
      `)
      .eq("jobId", jobId);

    if (error) {
      console.error("Lỗi truy vấn Supabase:", error.message);
      return [];
    }

    return data || [];
  } catch (e) {
    console.error("Lỗi hệ thống:", e);
    return [];
  }
}

// Hàm cập nhật trạng thái dự án
export async function updateJobStatus(jobId: string, status: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("job")
    .update({
      status: status,
      updatedAt: new Date().toISOString()
    })
    .eq("id", jobId);

  if (error) return { error: error.message };

  // Làm mới cache để giao diện cập nhật dữ liệu mới nhất
  revalidatePath(`/client/jobs/${jobId}`);
  return { success: true };
}

// Hàm chấp nhận ứng viên (Accept Proposal)
export async function acceptProposal(jobId: string, applicationId: string) {
  const supabase = await createClient();

  try {
    // 1. Lấy thông tin chi tiết ứng tuyển (để biết freelancer và số tiền bid)
    const { data: application, error: appFetchErr } = await supabase
      .from("application")
      .select("*, freelancerId, bidAmount")
      .eq("id", applicationId)
      .single();

    if (appFetchErr || !application) throw new Error("Không tìm thấy thông tin ứng tuyển.");

    // Lấy thông tin user hiện tại (Client)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Bạn cần đăng nhập.");

    // Gọi hàm RPC để thực hiện giao dịch tài chính 
    const { error: rpcError } = await supabase.rpc('accept_freelancer_proposal', {
      p_job_id: jobId,
      p_proposal_id: applicationId,
      p_client_id: user.id,
      p_freelancer_id: application.freelancerId,
      p_amount: application.bidAmount
    });

    if (rpcError) throw new Error(rpcError.message);

    revalidatePath(`/dashboard/client/manage-jobs/${jobId}`);
    return { success: true };

  } catch (error: any) {
    console.error("Accept Proposal Error:", error.message);
    return { error: error.message };
  }
}

// Lấy danh sách Job công khai kèm Filter & Sort
export async function getAllJobsAction(filters: {
  query?: string;
  maxPrice?: number;
  sortBy?: string;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("job")
    .select(`
      *,
      client:users!clientId(full_name, avatar_url),
      job_required_skills(skills(name)),
      application(freelancerId) // Thêm dòng này để lấy danh sách ID đã ứng tuyển
    `)
    .eq("status", "OPEN");

  if (filters.query) {
    query = query.ilike("title", `%${filters.query}%`);
  }
  if (filters.maxPrice) {
    query = query.lte("budget", filters.maxPrice);
  }

  // Sắp xếp
  if (filters.sortBy === "newest") query = query.order("createdAt", { ascending: false });
  else if (filters.sortBy === "price_desc") query = query.order("budget", { ascending: false });
  else if (filters.sortBy === "price_asc") query = query.order("budget", { ascending: true });

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

// Hành động Apply cho Freelancer
export async function applyJobAction(formData: {
  jobId: string;
  budget: number;
  bidAmount: number;
  proposal: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Vui lòng đăng nhập để ứng tuyển" };
  if (formData.bidAmount > formData.budget) return { error: "Báo giá không vượt quá ngân sách"}

  const { error } = await supabase.from("application").insert([{
    jobId: formData.jobId,
    freelancerId: user.id,
    bidAmount: formData.bidAmount,
    proposal: formData.proposal,
    status: "PENDING",
    createdAt: new Date().toISOString(),
  }]);

  if (error) return { error: "Bạn đã ứng tuyển dự án này rồi hoặc có lỗi xảy ra." };

  revalidatePath("/jobs");
  return { success: true };
}

export async function completeJobAndPay(jobId: string) {
  const supabase = await createClient();

  // Lấy thông tin Job và Freelancer
  const { data: job, error: jobErr } = await supabase
    .from("job")
    .select(`*, application!jobId(*)` )
    .eq("id", jobId)
    .eq("application.status", "ACCEPTED")
    .single();

  if (jobErr || !job) return { error: "Không tìm thấy dự án hoặc ứng viên hợp lệ." };

  const freelancerId = job.application[0].freelancerId;
  const amount = job.budget;
  const clientId = job.clientId;

  // Gọi RPC giải ngân (Chuyển tiền từ Client sang Freelancer)
  const { error: txError } = await supabase.rpc('handle_job_payment', {
    p_job_id: jobId,
    p_client_id: clientId,
    p_freelancer_id: freelancerId,
    p_amount: amount
  });

  if (txError) return { error: txError.message };

  // CẬP NHẬT TRẠNG THÁI JOB THÀNH HOÀN THÀNH (BỔ SUNG)
  const { error: updateJobError } = await supabase
    .from("job")
    .update({ 
      status: "COMPLETED",
      updatedAt: new Date().toISOString() 
    })
    .eq("id", jobId);

  if (updateJobError) {
    console.error("Lỗi cập nhật trạng thái Job:", updateJobError);
    return { error: "Tiền đã chuyển nhưng trạng thái dự án chưa cập nhật." };
  }

  revalidatePath(`/dashboard/client/manage-jobs/${jobId}`);
  return { success: true };
}

// Lấy danh sách việc làm mà Freelancer đã ứng tuyển
export async function getFreelancerApplications() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("application")
    .select(`
      *,
      job:job (
        id,
        title,
        budget,
        status,
        client:users!clientId (
          full_name,
          avatar_url
        )
      )
    `)
    .eq("freelancerId", user.id)
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("Error fetching applications:", error.message);
    return [];
  }
  return data;
}

// Thêm hành động Hủy Apply
export async function cancelApplyAction(jobId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Vui lòng đăng nhập" };

  const { error } = await supabase
    .from("application")
    .delete()
    .eq("jobId", jobId)
    .eq("freelancerId", user.id);

  if (error) return { error: "Không thể hủy ứng tuyển" };

  revalidatePath(`/jobs/${jobId}`);
  return { success: true };
}