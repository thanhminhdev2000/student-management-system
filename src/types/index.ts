export interface UserData {
  id: string;
  username: string;
  full_name: string;
  role: string;
  unit: string;
  avatar_url?: string;
}

export interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
  user: UserData | null;
}
