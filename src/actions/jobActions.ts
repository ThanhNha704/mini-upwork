"use server";

import { createClient } from "@/src/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getClientJobs() {
  const supabase = await createClient();
  
  // Lấy user hiện tại từ session
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

  revalidatePath("/dashboard/client/manage-jobs");
  return { success: true, jobId: job.id };
}

export async function updateJob(jobId: string, formData: any) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("job")
    .update({
      title: formData.title,
      description: formData.description,
      budget: parseFloat(formData.budget),
      status: formData.status, // Giữ nguyên hoặc cập nhật nếu cần
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

export async function getJobDetails(jobId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("job")
    .select("*")
    .eq("id", jobId)
    .single();

  if (error) {
    console.error("Lỗi lấy chi tiết Job:", error.message);
    // return null;
  }
  return data;
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