import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import "../css/SearchPage.css";
import { useAuth } from '../contexts/AuthContext.jsx';
import ApiClient from '../services/ApiClient';
import menuData from '../data/menuData';

function SearchPage() {

    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    const { user, logout } = useAuth();


    const totalBackgroundImages = 2;
    const backgroundImageList = Array.from({ length: totalBackgroundImages }, (_, i) =>
        `/images/Search_background/bg${i + 1}.jpg`
    );

    useEffect(() => {
        // 랜덤으로 이미지 파일 선택, 배경으로 출력
        const randomIndex = Math.floor(Math.random() * backgroundImageList.length);
        const selectedImageUrl = backgroundImageList[randomIndex];
        const originalBackgroundImage = document.body.style.backgroundImage;
        document.body.style.backgroundImage = `url('${selectedImageUrl}')`;

        return () => {
        document.body.style.backgroundImage = originalBackgroundImage;
        };
    }, []);


    const galleryItems = [
        { id: 1, title: "한식", imageUrl: "/images/gallary/비빔밥.avif", search: "맛있는 한식당"},
        { id: 2, title: "양식", imageUrl: "/images/gallary/파스타.avif", search: "맛있는 파스타"},
        { id: 3, title: "중식", imageUrl: "/images/gallary/짜장면.avif", search: "맛있는 중식당"},
        { id: 4, title: "일식", imageUrl: "/images/gallary/라멘.avif", search: "라멘, 초밥" },
        { id: 5, title: "분식", imageUrl: "/images/gallary/떡볶이.avif", search: "분식집"},
        { id: 6, title: "치킨", imageUrl: "/images/gallary/치킨.avif", search: "치킨" },
        { id: 7, title: "피자", imageUrl: "/images/gallary/피자.avif", search: "피자" },
        { id: 8, title: "햄버거", imageUrl: "/images/gallary/햄버거.avif", search: "햄버거" },
        { id: 9, title: "족발", imageUrl: "/images/gallary/족발.avif", search: "족발" },
        { id: 10, title: "보쌈", imageUrl: "/images/gallary/보쌈.avif", search: "보쌈" },
        { id: 11, title: "회 / 초밥", imageUrl: "/images/gallary/초밥.avif", search: "회, 초밥" },
        { id: 12, title: "찜 / 탕", imageUrl: "/images/gallary/김치찌개.avif", search: "찜, 탕" },
        { id: 13, title: "카페", imageUrl: "/images/gallary/커피.avif", search: "커피" },
        { id: 14, title: "디저트", imageUrl: "/images/gallary/디저트.avif", search: "디저트" },
        { id: 15, title: "샐러드", imageUrl: "/images/gallary/샐러드.avif", search: "샐러드" },
    ];



    const itemGalleryRef = useRef(null);
    const scrollToGallery = () => {
        if (itemGalleryRef.current) {
        itemGalleryRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const rouletteRef = useRef(null);
    const scrollToRoulette = () => {
        if (rouletteRef.current) {
        rouletteRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const containerRef  = useRef(null);
    const scrollToTop = () => {
        if (containerRef.current) {
        containerRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // 로그인 상태 확인
    const handleInputChange = (event) => {
        if (!user) {
            alert('로그인 후 검색하실 수 있습니다.');
            return;
        }
        setSearchTerm(event.target.value);
    };


    const [isLoading, setIsLoading] = useState(false);

    // 갤러리 아이템 클릭 -> 검색
    const handleItemClick = async (item) => {
        if (!user) {
            alert("로그인 후 이용하실 수 있습니다.");
            return;
        }
        console.log(`${item.title} 클릭됨`, item);

        setIsLoading(true); // API 호출 전 로딩 상태를 true로 설정

        try {
            const result = await ApiClient.search(item.search, user.token);
            console.log("검색결과: ", result);

            if (result && result.code === -1) {
                alert("로그인이 만료되었습니다. 다시 로그인 해 주시기 바랍니다.");
                setIsLoading(false); // 로딩 상태 해제
                logout();
                return; 
            }

            navigate('/response', { state: { searchTerm: item.title, user: user, result: result } });
            setSearchTerm("");
        } catch (error) {
            console.error("검색 중 오류 발생:", error);
            alert("검색 중 오류가 발생했습니다.\n다시 검색하시거나, 다시 로그인 해 주세요.");
            logout();
            navigate("/login");
        } finally {
            setIsLoading(false); // API 호출 완료 후 (성공 또는 실패) 로딩 상태를 false로 설정
        }
    };

    // 검색 
    const handleSearchSubmit = async (event) => {
        event.preventDefault();
        if (!user) {
            alert("로그인 후 검색하실 수 있습니다.");
            return;
        }
        if (searchTerm.length < 2) {
            alert("두 글자 이상의 검색이 필요합니다");
            return;
        }

        console.log("검색어:", searchTerm);
        setIsLoading(true); // API 호출 전 로딩 상태를 true로 설정
        try {
            const result = await ApiClient.search(searchTerm, user.token);
            console.log("검색결과: ", result);

            if (result && result.code === -1) {
                alert("로그인이 만료되었습니다. 다시 로그인 해 주시기 바랍니다.");
                setIsLoading(false); // 로딩 상태 해제
                logout();
                return; 
            }
            
            navigate('/response', { state: { searchTerm: searchTerm, user: user, result: result } });
            setSearchTerm("");
        } catch (error) {
            console.error("검색 중 오류 발생:", error);
            alert("검색 중 오류가 발생했습니다.\n다시 검색하시거나, 다시 로그인 해 주세요.");
            logout();
            navigate("/login");
        } finally {
            setIsLoading(false); // API 호출 완료 후 로딩 상태를 false로 설정
        }
    };



    const goToLogin = () => {
        navigate('/login');
    };
    const goToSignUp = () => {
        navigate('/signUp');
    };

    const handleLogout = () => {
        logout();
        alert("로그아웃 되었습니다.");
        navigate('/login');
    };

    const goToWish = () => {
        navigate('/wish', { state: { user: user } });
    }



    // 룰렛
    const [rouletteState, setRouletteState] = useState('initial'); // 'initial', 'selecting', 'result'
    const [displayedText, setDisplayedText] = useState('오늘의 메뉴를 선정해보세요!'); // 룰렛 상단 텍스트
    const [displayedImageSrc, setDisplayedImageSrc] = useState(''); // 선정 중 표시될 이미지
    const [finalSelectedMenu, setFinalSelectedMenu] = useState(''); // 최종 메뉴
    const [isRouletteButtonDisabled, setIsRouletteButtonDisabled] = useState(false); // 룰렛 버튼 활성화/비활성화
    
    // 룰렛 타이머 관리를 위한 ref
    const imageIntervalRef = useRef(null);
    const selectionTimeoutRef = useRef(null);

    // 메뉴 선정 이미지
    const selectionImages = [
        '/images/icon/food1.png',
        '/images/icon/food2.png',
        '/images/icon/food3.png',
        '/images/icon/food4.png',
        '/images/icon/food5.png',
        '/images/icon/food6.png',
        '/images/icon/food7.png',
        '/images/icon/food8.png',
        '/images/icon/food9.png'
    ];


    // 룰렛
    const startRoulette = () => {
        // 버튼 비활성화
        setIsRouletteButtonDisabled(true);
        setRouletteState('selecting');
        setDisplayedText('메뉴를 선정하는 중...');
        setDisplayedImageSrc(''); // 선정 시작 시 이미지 초기화

        let lastIndex;

        // 이미지 전환 시작
        imageIntervalRef.current = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * selectionImages.length);
            if (lastIndex === randomIndex) {
                const randomIndex = Math.floor(Math.random() * selectionImages.length)
                lastIndex = randomIndex;
                setDisplayedImageSrc(selectionImages[randomIndex]);
            }else {
                lastIndex = randomIndex;
                setDisplayedImageSrc(selectionImages[randomIndex]);
            }
        }, 200); // 이미지 전환 속도 

        // 3초 후에 최종 메뉴 선택 및 표시
        selectionTimeoutRef.current = setTimeout(() => {
            // 이미지 전환 중지
            clearInterval(imageIntervalRef.current);

            const randomIndex = Math.floor(Math.random() * menuData.length);
            const selectedMenu = menuData[randomIndex];

            setFinalSelectedMenu(selectedMenu);
            setDisplayedText('오늘의 메뉴는?');
            setRouletteState('result');
            setDisplayedImageSrc(''); // 결과 표시 시 이미지 숨김

            setIsRouletteButtonDisabled(false);

        }, 3000); // 3000밀리초 = 3초
    };

    // 화면에서 사라질 때 cleanup
    useEffect(() => {
        return () => {
        // setInterval과 setTimeout 모두 중지
        if (imageIntervalRef.current) {
            clearInterval(imageIntervalRef.current);
        }
        if (selectionTimeoutRef.current) {
            clearTimeout(selectionTimeoutRef.current);
        }
        };
    }, []);


  
    return (
        <div className="page-wrapper" >

        <header className="app-header">
            <div onClick={scrollToTop} style={{ cursor: 'pointer' }} className="header-left">맛 GPT</div>
            <div className="header-right">

            {user ? ( // 로그인 상태
                <>
                {user.name} 님, 환영합니다!
                <button className="logout-button" onClick={goToWish}>찜 목록</button>
                <button className="logout-button" onClick={handleLogout}>로그아웃</button>
                </>
            ) : ( // 로그인 상태가 아닌 경우
                <>
                <button className="logout-button" onClick={goToLogin}>로그인</button>
                <button className="logout-button" onClick={goToSignUp}>회원가입</button>
                </>
            )}
            </div>
        </header>

        {/* 검색 페이지 내용 */}
        <main className="main-content-search" ref={containerRef}>

            <div className="title-section">
            <h1 className="main-title">맛 GPT</h1>
            <p className="sub-title">AI와 함께하는 리뷰 데이터 기반 맛집 탐방</p>
            </div>
        
            <div className="container">
            <form className="search-form" onSubmit={handleSearchSubmit}>
                <div className="search-input-group">
                <input
                    type="text"
                    className="search-input"
                    placeholder={user ? "주변 맛집을 검색해보세요!  ex) 혼밥하기 좋은 음식점" : "로그인 후 검색해보세요!"}
                    value={searchTerm}
                    onChange={handleInputChange}
                />
                {/* 돋보기 아이콘 */}
                <button type="submit" className="search-button"></button>
                </div>
            </form>
            </div>

            <div className="item-gallery" ref={itemGalleryRef}>
                <h2>이미지로 골라보는 추천 맛집</h2>
                
                <div className="item-row">
                    <span>&nbsp;</span>
                </div>
                
                <h3>원하는 메뉴를 눌러 맛집을 검색해보세요!</h3>
                <div className="gallery-grid">
                    {galleryItems.map(item => (
                        <div key={item.id} className="gallery-item" onClick={() => handleItemClick(item)}>
                            <img src={item.imageUrl} alt={item.title} className="item-image"/>
                            <div className="item-title">{item.title}</div>
                        </div>
                    ))}
                </div>
            </div>
            
            <p ref={rouletteRef}></p>

            <div className="roulette" >
                <h2>메뉴 추천 룰렛</h2>
                <div className="roulette-display">
                    {/* 상태에 따라 텍스트와 이미지, 결과 메뉴를 표시 */}
                    <p className="displayedText">{displayedText}</p>
                    {rouletteState === 'selecting' && displayedImageSrc && (
                        <img src={displayedImageSrc} alt="메뉴 선정 중" className="roulette-image" />
                    )}
                    {rouletteState === 'result' && finalSelectedMenu && (
                        <p className="final-menu-result">{finalSelectedMenu}</p>
                    )}
                </div>
                <div className="roulette-button-area">
                    {/* 버튼 클릭 시 startRoulette 함수 호출, 선정 중에는 비활성화 */}
                    <button onClick={startRoulette} disabled={isRouletteButtonDisabled}>
                        뽑기 시작!
                    </button>
                </div>
            </div>

            <div className="bottonRow" doz_type="row" doz_grid="12">
                <span>&nbsp;</span>
                <span><p>Copyright ⓒ Jeon Min-Gyu / Shin bok-gi, All Rights Reserved </p></span>
                <span><p>해당 사이트는 비영리 무료공유 사이트입니다. 전체 화면 사용을 권장합니다.</p></span>
                <span>&nbsp;</span>
            </div>

        </main>


            {isLoading && (
            <div className="overlay-loading-container">
                <div className="loading-box-container">
                    <div className="loading-box">
                        <p>검색을 진행하는 중...</p>
                        <div className="loading-spinner"></div>
                    </div>
                </div>
            </div>
            )}


        <button className="scroll-to-gallery-button" onClick={scrollToGallery}>
            추천 메뉴 보러가기
        </button>
        <button className="scroll-to-roulette-button" onClick={scrollToRoulette}>
            메뉴가 고민된다면?
        </button>  
        </div>
    );
}

export default SearchPage;
