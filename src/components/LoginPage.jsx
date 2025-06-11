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



    const handleLogin = async (e) => {
        e.preventDefault();
        const userCredentials = { id, password };
        setLoginMessage('');
        setMessageType('');

        try {
            const response = await ApiClient.login(userCredentials);

            if (response.ok) {
                const data = await response.json();
                if (data.code === 0) {
                    login(data);
                    displayMessage(`환영합니다, ${data.name}님!`, 'success');
                    navigate('/', { replace: true });
                } else {
                    // 서버에서 정의한 애플리케이션 레벨 오류 (code가 0이 아닐 때)
                    displayMessage('아이디 또는 비밀번호가 잘못되었습니다.', 'error');
                }
            } else {
                // HTTP 상태 코드가 200번대가 아닐 때 (예: 401, 403, 502 등)
                const statusCode = response.status; // 여기서 Status Code를 가져옵니다.
                let errorMessage = `로그인 실패: Status ${statusCode}`;

                // 특정 Status Code에 따른 메시지 또는 로직 분기
                if (statusCode === 401) {
                    errorMessage = '인증에 실패했습니다. 아이디와 비밀번호를 확인해주세요.';
                } else if (statusCode === 403) {
                    errorMessage = '접근 권한이 없습니다.';
                } else if (statusCode === 502) {
                    errorMessage = '로그인 서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
                    console.error("502 Bad Gateway 오류 발생:", response); // 502 오류 발생 시 콘솔에 기록
                    // 502 오류에 대한 추가적인 특정 처리 로직을 여기에 넣을 수 있습니다.
                } else {
                    // 그 외 다른 HTTP 오류
                    try {
                         const errorData = await response.json();
                         errorMessage = errorData.message || errorMessage;
                    } catch (jsonError) {
                         // 응답 본문이 JSON이 아닐 경우
                         console.error("오류 응답 본문 파싱 실패:", jsonError);
                    }
                }

                displayMessage(errorMessage, 'error');
            }
        } catch (error) {
            // 네트워크 연결 문제, 요청 자체의 실패 등 응답을 받지 못한 경우
            console.error('로그인 중 네트워크 또는 기타 오류 발생:', error);
            displayMessage('로그인 중 오류가 발생했습니다. 인터넷 연결 상태를 확인해주세요.', 'error');
            // 이 catch 블록에서는 일반적으로 HTTP Status Code를 직접 얻기 어렵습니다.
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
                    src="/images/kakao_login_large_wide.png"
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
