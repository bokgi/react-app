import React, { useState } from 'react';
import ApiClient from '../services/ApiClient';
import '../css/LoginPage.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const LoginPage = () => {
    
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [loginMessage, setLoginMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const navigate = useNavigate();
    const { login } = useAuth();

    const displayMessage = (message, type) => {
        setLoginMessage(message);
        setMessageType(type); // 'success' 또는 'error' 등으로 설정 가능
        setTimeout(() => {
        setLoginMessage('');
        setMessageType('');
        }, 2000);
    };


    // 로그인
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginMessage('');
        setMessageType('');
        const user = { id, password };

        try {
            const response = await ApiClient.login(user);

            if (response.ok) {
                const data = await response.json();

                if (data.code === 0) {
                    login(data);
                    displayMessage(`환영합니다, ${data.name}님!`, 'success');
                    navigate('/', { replace: true });
                } else {
                    displayMessage('아이디 또는 비밀번호가 잘못되었습니다.', 'error');
                }

            } else {
                let errorMessage = "예상치 못한 오류 발생";

                if (response.status >= 400 && response.status <= 499) {
                    errorMessage = '로그인 중 클라이언트 오류가 발생했습니다. 나중에 다시 시도해주세요.';
                    console.error(response.status + " 오류 발생: ", response);
                } else if (response.status >= 500 && response.status <= 599) {
                    errorMessage = '서버가 로그인을 처리할 수 없는 상태입니다. 나중에 다시 시도해주세요.';
                    console.error(response.status + " 오류 발생: ", response);
                }

                displayMessage(errorMessage, 'error');
                
            }
        } catch (error) {
            console.error('로그인 중 네트워크 또는 기타 오류 발생:', error);
            displayMessage('로그인 중 예기치 못한 오류가 발생했습니다. 네트워크 연결 상태를 확인해주세요.', 'error');
        }
    };


    const goToSignup = () => {
        navigate('/signUp');
    };

    const goToSearch = () => {
        navigate('/');
    };


    const KAKAO_REST_API_KEY = '55d2a867b5b86ca3c3b738518c2e03c5';
    const KAKAO_REDIRECT_URI = 'http://14.63.178.159/kakao';
    // 카카오 인증 서버로 요청할 URL
    const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code`;


    // 카카오 로그인 버튼 클릭 핸들러 함수
    const handleKakaoLogin = () => {
        // 카카오 인증 페이지로 리다이렉트
        window.location.href = KAKAO_AUTH_URL;
    };



  return (
    <div className='main-content-login'>
        <header className="app-header">
            <div onClick={goToSearch} style={{ cursor: 'pointer' }} className="header-left">맛 GPT</div>
            <div className="header-right"></div>
        </header>    

        {/* 로그인 실패 메시지 */}
        {loginMessage && (
            <div className={`message ${messageType}`}>
                <p>{loginMessage}</p>
            </div>
        )}
        <p></p>

        <form onSubmit={handleLogin} className='form'>
            <h2 className='title'>로그인</h2>
            <input
                type="text"
                placeholder="아이디"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className='input'
                required
            />
            <input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='input'
                required
            />

            <button type="submit" className='Loginbutton'>로그인</button>

            <button
                type="button"
                className='KakaoLoginImageButton'
                onClick={handleKakaoLogin}
                style={{ border: 'none', padding: 0, backgroundColor: 'transparent', cursor: 'pointer', display: 'block', width: 'auto' }}
            >
                <img
                    src="/images/kakao_login.png"
                    alt="카카오 로그인"
                    style={{ display: 'block', width: '100%', maxWidth: '400px', height: 'auto' }}
                />
            </button>

            <button type="button" onClick={goToSignup} className='goToSignupButton'>
                아직 계정이 없으신가요? 회원가입하기
            </button>
        </form>
    </div>
  );
};

export default LoginPage;
