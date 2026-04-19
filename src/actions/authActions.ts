import { SupabaseClient } from "@supabase/supabase-js";

export const verifyOtpAction = async (
  supabase: SupabaseClient,
  email: string,
  token: string
) => {
  return await supabase.auth.verifyOtp({
    email,
    token,
    type: 'signup',
  });
};