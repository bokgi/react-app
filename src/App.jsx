import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate  } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext'; 

import SignUpPage from './components/SignUpPage';
import LoginPage from './components/LoginPage';
import SearchPage from './components/SearchPage';
import ResponsePage from './components/ResponsePage';
import WishListPage from './components/WishListPage';
import SharePage from './components/SharePage';
import KakaoCallbackPage from './components/KakaoCallBackPage';


function ProtectedRoute({ element }) { // 보호 페이지 조정

    const { user } = useAuth();
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    return element;
}

function AuthRedirect({ element }) {

    const { user } = useAuth();
    if (user) {
        return <Navigate to="/" replace />;
    }
    return element;
}


function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
            {/* 회원가입 페이지 */}
            <Route path="/signUp" element={<AuthRedirect element={<SignUpPage />} />} />
            {/* 로그인 페이지 */}
            <Route path="/login" element={<AuthRedirect element={<LoginPage />} />} />
            {/* 검색 페이지 */}
            <Route path="/" element={<SearchPage />} />
            {/* 결과 페이지 */}
            <Route
                path="/response" element={<ResponsePage />}
            />
            {/* 찜 목록 페이지 */}
            <Route
                path="/wish"
                element={<ProtectedRoute element={<WishListPage />} />}
            />
            {/* 찜 목록 공유 페이지 */}
            <Route
                path="/wish/share" element={<SharePage />}
            />
            {/* 카카오 로그인 대기 페이지 */}
            <Route
                path="/kakao" element={<AuthRedirect element={<KakaoCallbackPage />} />} 
            />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;