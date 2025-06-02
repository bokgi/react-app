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

  const handleSubmit = async (e) => { // 검색
    e.preventDefault();
    setSignupMessage('');
    setMessageType('');
    setShowPopup(false);
    // 유효성 검사 
    if (id.length < 2 || password.length < 4) {
        displayMessage('아이디는 두 글자, 비밀번호는 네 글자 이상이어야 합니다.', 'error');
        return; // 유효성 검사 실패 시 함수 종료
    }

    const user = { id, password, name };

    try {
      const response = await ApiClient.signUp(user);

      console.log(response);
      
      if (response.code == -2) {
        displayMessage('이미 사용중인 아이디입니다.', 'error');
      } else if (response.code !== -2) {
        displayMessage('회원가입 성공! 로그인 페이지로 이동합니다.', 'success');
      } else {
         const errorData = await response.json(); 
         const errorMessage = errorData.message || '회원가입 실패, 다시 시도해주세요.';
         displayMessage(errorMessage, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      displayMessage('서버 오류 발생', 'error'); // 오류 메시지 표시
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
                <input
                type="text"
                placeholder="아이디"
                value={id}
                onChange={handleIdChange}
                className='input'
                required
                />
                <input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={handlePasswordChange}
                className='input'
                required
                />
                <input
                type="text"
                placeholder="이름"
                value={name}
                onChange={handleNameChange}
                className='input'
                required
                />
                <button type="submit" className='button'>회원가입</button>

                <button type="button" onClick={GoToLogin} className='goToLoginButton'>
                이미 계정이 있으신가요? 로그인하기
                </button>
            </form>
            
    </div>
  );
};

export default SignupPage;
