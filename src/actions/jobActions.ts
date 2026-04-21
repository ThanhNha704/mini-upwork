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
  
  // 1. Lấy thông tin user đang đăng nhập (để check hasApplied)
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Truy vấn lồng ghép (Join nhiều cấp)
  const { data, error } = await supabase
    .from("job")
    .select(`
      *,
      client:users!clientId(
        *,
        client_profiles(*) 
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

  // 3. Xử lý dữ liệu thô thành cấu trúc gọn đẹp cho Frontend
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
    client: data.client, // Trong này đã có client_profiles nhờ câu select trên
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

  // Cập nhật trạng thái ứng tuyển thành 'ACCEPTED'
  const { error: appError } = await supabase
    .from("application")
    .update({ status: "ACCEPTED" })
    .eq("id", applicationId);

  if (appError) return { error: appError.message };

  // Đồng thời chuyển trạng thái Job sang 'IN_PROGRESS'
  const { error: jobError } = await supabase
    .from("job")
    .update({ status: "IN_PROGRESS" })
    .eq("id", jobId);

  revalidatePath(`/client/jobs/${jobId}`);
  return { success: true };
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
      job_required_skills(skills(name))
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
  bidAmount: number;
  proposal: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Vui lòng đăng nhập để ứng tuyển" };

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

  // Lấy thông tin Job và Application (Freelancer đã được chọn)
  const { data: job, error: jobErr } = await supabase
    .from("job")
    .select(`*, application!jobId(*)` )
    .eq("id", jobId)
    .eq("application.status", "ACCEPTED")
    .single();

  if (jobErr || !job) return { error: "Không tìm thấy dự án hoặc ứng viên." };

  const freelancerId = job.application[0].freelancerId;
  const amount = job.budget;
  const clientId = job.clientId;

  // Thực hiện giao dịch (Sử dụng RPC để đảm bảo tính toàn vẹn dữ liệu)
  const { data, error: txError } = await supabase.rpc('handle_job_payment', {
    p_job_id: jobId,
    p_client_id: clientId,
    p_freelancer_id: freelancerId,
    p_amount: amount
  });

  if (txError) return { error: txError.message };

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