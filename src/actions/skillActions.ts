import { SupabaseClient } from "@supabase/supabase-js";

// Lấy danh sách tất cả kỹ năng có sẵn để gợi ý
export const fetchAllAvailableSkills = async (supabase: SupabaseClient) => {
  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .order("name");
  
  if (error) throw error;
  return data || [];
};

// Cập nhật danh sách kỹ năng ưu tiên của Client
export const updateClientSkills = async (
  supabase: SupabaseClient, 
  clientId: string, 
  skillIds: string[]
) => {
  // Xóa các kỹ năng cũ
  const { error: deleteError } = await supabase
    .from("client_preferred_skills")
    .delete()
    .eq("client_id", clientId);

  if (deleteError) throw deleteError;

  // Nếu có kỹ năng mới thì thêm vào
  if (skillIds.length > 0) {
    const inserts = skillIds.map((sid) => ({
      client_id: clientId,
      skill_id: sid,
    }));

    const { error: insertError } = await supabase
      .from("client_preferred_skills")
      .insert(inserts);

    if (insertError) throw insertError;
  }
  
  return { success: true };
};

// Cập nhật kỹ năng cho freelancer
export async function updateFreelancerSkills(supabase: any, userId: string, skillIds: string[]) {
    // Xóa tất cả kỹ năng cũ của freelancer này
    const { error: deleteError } = await supabase
        .from("freelancer_skills")
        .delete()
        .eq("user_id", userId);

    if (deleteError) throw deleteError;

    // Thêm danh sách kỹ năng mới
    if (skillIds.length > 0) {
        const insertData = skillIds.map(id => ({
            user_id: userId,
            skill_id: id
        }));
        const { error: insertError } = await supabase
            .from("freelancer_skills")
            .insert(insertData);
            
        if (insertError) throw insertError;
    }
}

// Hàm lọc kỹ năng dựa trên từ khóa tìm kiếm và loại trừ những kỹ năng đã chọn
export const filterSkills = (
  allSkills: any[],
  searchTerm: string,
  selectedSkills: any[]
) => {
  if (!searchTerm.trim()) return [];

  return allSkills.filter((skill) => {
    const matchesSearch = skill.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    
    const isNotSelected = !selectedSkills.some(
      (selected) => selected.id === skill.id
    );

    return matchesSearch && isNotSelected;
  })
};