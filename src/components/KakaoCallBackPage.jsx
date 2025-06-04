import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ApiClient from '../services/ApiClient.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import '../css/LoginPage.css';

const KakaoCallbackPage = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        // URL에서 'code' 쿼리 파라미터 추출
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('code');

        if (code) {
            console.log('카카오 인증 코드:', code);
            // 추출한 코드 -> 코드 전송
            sendCodeToBackend(code);
        } else {
            console.error('카카오 인증 코드 받기 실패');
            navigate('/login');
        }
    }, [location, navigate]);


    // 코드 전송 함수
    const sendCodeToBackend = async (code) => {
        try {

        const response = await ApiClient.KakaoLogin(code);

        console.log(response);

            if (response.ok) {
                const data = await response.json();
                console.log('백엔드 카카오 로그인 처리 결과:', data);

                if (data.success) { 
                    login(data);
                    navigate('/');
                } else {
                    console.error('백엔드 카카오 로그인 처리 실패:', data.message);
                    navigate('/login');
                }
            } else {
                const errorData = await response.json();
                console.error('백엔드 API 호출 실패:', errorData.message || `Status ${response.status}`);
                navigate('/login');
        }
        } catch (error) {
            console.error('백엔드 통신 중 오류 발생:', error);
            navigate('/login');
        }
    };


    return (
        <div className="page-wrapper">

            <header className="app-header">
                <div className="header-left">맛 GPT</div>
                <div className="header-right"></div>
            </header>

            <main className="main-content-callback">
                <p>카카오 로그인 처리 중입니다. 잠시만 기다려 주세요...</p>
            </main>
        </div>
    );
};

export default KakaoCallbackPage;
