import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // sessionStorage 초기 사용자 정보 로드
    const storedUser = sessionStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    // user 상태 변경 시 sessionStorage 업데이트
    if (user) {
      sessionStorage.setItem('user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('user');
    }
  }, [user]);

  const login = (userData) => {
    // 로그인 성공 후 호출: user 상태 업데이트 (useEffect에 의해 sessionStorage 자동 업데이트)
    setUser(userData);
  };

  const logout = () => {
    // 로그아웃 시 호출: user 상태 초기화 (useEffect에 의해 sessionStorage 자동 삭제)
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// App.js 에서 AuthProvider로 감쌈 (이전 예시와 동일)
// ResponsePage.jsx 에서 useAuth() 사용
