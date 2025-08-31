import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const authHelpers = {
  // Đăng ký
  signUp: (email: string, password: string, profile: any) =>
    supabase.auth.signUp({
      email,
      password,
      options: { data: profile }, // metadata
    }),

  // Đăng nhập
  signIn: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),

  // Lấy profile
  getUserProfile: (id: string) =>
    supabase.from('profiles').select('*').eq('id', id).single(),

  // Đăng xuất
  signOut: () => supabase.auth.signOut(),
};
