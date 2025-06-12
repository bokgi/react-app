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
            const data = await ApiClient.KakaoLogin(code);

            if (data) {
                const response = await data.json();

                if (response.status >= 400 && response.status <= 499) {
                    console.error(response.status + " 오류 발생: ", response);
                    alert('로그인 중 클라이언트 오류가 발생했습니다. 나중에 다시 시도해주세요.');
                    navigate('/login', { replace: true });
                } else if (response.status >= 500 && response.status <= 599) {
                    console.error(response.status + " 오류 발생: ", response);
                    alert('서버가 로그인을 처리할 수 없는 상태입니다. 나중에 다시 시도해주세요.');
                    navigate('/login', { replace: true });
                }
            }

            if (data && data.success) { 
                login(data);
                navigate('/', { replace: true });
            } else {
                console.error('백엔드 카카오 로그인 처리 실패:', data.msg);
                navigate('/login', { replace: true });
            }

        } catch (error) {
            console.error('로그인 중 네트워크 또는 기타 오류 발생:', error);
            navigate('/login', { replace: true });
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
