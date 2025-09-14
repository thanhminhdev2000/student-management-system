import React, { useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { supabase } from './lib/supabase';

// Pages
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ExamShuffler from './pages/ExamShuffler';
import Login from './pages/Login';
import QuestionBank from './pages/QuestionBank';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Students from './pages/Students';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Kiểm tra session Supabase khi app khởi chạy
  useEffect(() => {
    const initAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!error && profile) {
          localStorage.setItem('user', JSON.stringify(profile));
          setIsAuthenticated(true);
          setUserProfile(profile);
        }
      }
      setIsLoading(false);
    };

    initAuth();

    // Lắng nghe sự kiện login / logout
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem('user');
        }
      },
    );

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  const handleLoginSuccess = (profile: any) => {
    setUserProfile(profile); // Cập nhật state khi đăng nhập thành công
    setIsAuthenticated(true);
  };

  // Xử lý logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  // Loading khi đang kiểm tra session
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <Router basename="/student-management-system/">
      {!isAuthenticated ? (
        <Routes>
          <Route
            path="*"
            element={<Login onLoginSuccess={handleLoginSuccess} />}
          />
        </Routes>
      ) : (
        <Layout onLogout={handleLogout} user={userProfile}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/question-bank" element={<QuestionBank />} />
            <Route path="/exam" element={<ExamShuffler />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </Layout>
      )}
    </Router>
  );
};

export default App;
