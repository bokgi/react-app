import React, { useState, useEffect } from 'react';
import ApiClient from '../services/ApiClient';
import { useNavigate } from 'react-router-dom';
import '../css/SignUpPage.css';

const SignupPage = () => {

    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [signupMessage, setSignupMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [showPopup, setShowPopup] = useState(false);

    const navigate = useNavigate();

    // 메시지 종류 설정 / 팝업 표시 헬퍼
    const displayMessage = (message, type) => {
        setSignupMessage(message);
        setMessageType(type);
        setShowPopup(true); // 메시지가 설정되면 팝업 표시
    };

    // 팝업 재출력 useEffect
    useEffect(() => {
        if (showPopup) {

        const timer = setTimeout(() => {
            setShowPopup(false); // 팝업 숨김
            setSignupMessage('');
            setMessageType('');

            // 회원가입 성공 메시지 후 로그인 페이지로 이동
            if (messageType === 'success') {
                navigate('/login');
            }
        }, 2000);

        return () => clearTimeout(timer); // 컴포넌트 언마운트 시 타이머 정리
        }
    }, [showPopup, messageType, navigate]);


    const handleIdChange = (e) => {
        setId(e.target.value);
        setSignupMessage('');
        setMessageType('');
        setShowPopup(false);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        setSignupMessage('');
        setMessageType('');
        setShowPopup(false);
    };

    const handleNameChange = (e) => {
        setName(e.target.value);
        setSignupMessage('');
        setMessageType('');
        setShowPopup(false);
    };


    // 회원가입
    const handleSubmit = async (e) => { 
        e.preventDefault();
        setSignupMessage('');
        setMessageType('');
        setShowPopup(false);
        const user = { id, password, name };

        // 유효성 검사 
        if (id.length < 2 || password.length < 4) {
            displayMessage('아이디는 두 글자, 비밀번호는 네 글자 이상이어야 합니다.', 'error');
            return;
        }

        try {
            const response = await ApiClient.signUp(user);

            if (response.ok) {

                const result = await response.json();

                if (result.code == -2) {
                    displayMessage('이미 사용중인 아이디입니다.', 'error');
                } else {
                    displayMessage('회원가입 성공! 로그인 페이지로 이동합니다.', 'success');
                } 

            } else {

                let errorMessage = "예상치 못한 오류가 발생했습니다. 나중에 다시 시도해주세요.";

                if (response.status >= 400 && response.status <= 499) {
                    errorMessage = '회원가입 중 클라이언트 오류가 발생했습니다. 나중에 다시 시도해주세요.';
                    console.error(response.status + " 오류 발생: ", response);
                } else if (response.status >= 500 && response.status <= 599) {
                    errorMessage = '서버가 회원가입을 처리할 수 없는 상태입니다. 나중에 다시 시도해주세요.';
                    console.error(response.status + " 오류 발생: ", response);
                }

                displayMessage(errorMessage, 'error');
                
            }
            
        } catch (error) {
            console.error('회원가입 중 네트워크 또는 기타 오류 발생:', error);
            displayMessage('회원가입 중 예기치 못한 오류가 발생했습니다. 네트워크 연결 상태를 확인해주세요.', 'error');
        }
    };


    const GoToLogin = () => {
        navigate('/login');
    };

    const goToSearch = () => {
        navigate('/');
    };


    return (
        <div className='main-content-signup'>

            <header className="app-header">
            <div onClick={goToSearch} style={{ cursor: 'pointer' }} className="header-left">맛 GPT</div>
            </header>
            
            {/* 팝업 메시지 및 오버레이 표시 영역 */}
            {showPopup && (
                <>
                <div className={`popup-message ${messageType}`}>
                    <p>{signupMessage}</p>
                </div>
                </>
            )}

            <form onSubmit={handleSubmit} className='form'>

                <h2 className='title'>회원가입</h2>

                <input type="text" placeholder="아이디" value={id} onChange={handleIdChange} className='input' required />
                <input type="password" placeholder="비밀번호" value={password} onChange={handlePasswordChange} className='input' required />
                <input type="text" placeholder="이름" value={name} onChange={handleNameChange} className='input' required />

                <button type="submit" className='button'>회원가입</button>
                <button type="button" onClick={GoToLogin} className='goToLoginButton'>이미 계정이 있으신가요?&nbsp;&nbsp;로그인하기</button>
                
            </form>

        </div>
    );
};

export default SignupPage;
