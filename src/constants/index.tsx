import {
  BarChart3,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
} from 'lucide-react';

export const menuItems = [
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    label: 'Tổng quan',
    path: '/dashboard',
    color: 'text-blue-600',
  },
  {
    id: 'students',
    icon: Users,
    label: 'Quản lý học viên',
    path: '/students',
    color: 'text-green-600',
  },
  {
    id: 'exam',
    icon: FileText,
    label: 'Thi & Kiểm tra',
    path: '/exam',
    color: 'text-orange-600',
  },
  {
    id: 'reports',
    icon: BarChart3,
    label: 'Báo cáo',
    path: '/reports',
    color: 'text-red-600',
  },
  {
    id: 'settings',
    icon: Settings,
    label: 'Cài đặt',
    path: '/settings',
    color: 'text-gray-600',
  },
];
