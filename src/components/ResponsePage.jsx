import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Map, MapMarker, CustomOverlayMap } from 'react-kakao-maps-sdk';
import "../css/ResponsePage.css";
import { useAuth } from '../contexts/AuthContext.jsx';
import { Rating } from 'react-simple-star-rating';
import ApiClient from '../services/ApiClient';

const ResponsePage = () => {

    const location = useLocation();
    const navigate = useNavigate();

    const { searchTerm, result } = location.state || {}; // 검색어, 검색 내용 location
    const { user, logout } = useAuth();

    useEffect(() => {

        if (!searchTerm || searchTerm.length === 0) {
            alert("잘못된 접근이거나 유효한 검색 결과가 없습니다. 검색 페이지로 이동합니다.");
            navigate('/', { replace: true });
        }
    }, [searchTerm, navigate]);


    let RestaurantList = [];
    let ResponseList = [];

    // result 식당 정보 / 출력할 추천 문장 -> 두 개의 배열로 변경
    try {
    RestaurantList = result.filteredRestaurantList;
    ResponseList = result.gptResponseList;
    } catch (error) {
    console.error("JSON 파싱 중 오류 발생:", error);
    }

    // result 식당 정보를 리스트 형태로 저장
    const RestaurantData = RestaurantList.map(item => ({
        name: item.placeName,
        rating: Number(item.rating).toFixed(1),
        id: item.id,
        lat: item.y,
        lng: item.x,
        url: item.url,
        address: item.address,
        phone: item.phone,
        imgUrl: item.imgUrl,
    }));


    let extractedResponseList = []; // 각 식당 추천 문구

    for (let i = 0; i < ResponseList.length; i++) {
        let item = ResponseList[i];
        let parts = item.split(":"); // ":"를 기준으로 문자열 나누기
        if (parts.length > 1) { 
            let textAfterColon = parts.slice(1).join(':').trim(); // 첫 번째 ":" 이후 부분을 합치고 공백 제거
            extractedResponseList.push(textAfterColon);
        } else {
            extractedResponseList.push(item.trim());
        }
    }


    const [center, setCenter] = useState(RestaurantData[0] || { lat: 37.5642135, lng: 127.0016985 }); // 서울 중앙 위도/경도
    const [level, setLevel] = useState(7); // 배율
    const [markers] = useState(RestaurantData); // 마커
    const [restaurantList] = useState(RestaurantData); // 목록
    const [hoveredMarkerIndex, setHoveredMarkerIndex] = useState(null); // 오버레이
    const [selectedRestaurantIndex, setSelectedRestaurantIndex] = useState(null); // 선택된 목록 인덱스

    // 목록 항목 <li> 요소들을 참조하기 위한 ref 배열
    const restaurantRefs = useRef([]);

    // 음식점들의 중앙 위치에 처음 지도 출력
    useEffect(() => {
        if (RestaurantData && RestaurantData.length > 0) {
            let totalLat = 0;
            let totalLng = 0;
            const count = RestaurantData.length;

            RestaurantData.forEach(restaurant => {
                totalLat += parseFloat(restaurant.lat);
                totalLng += parseFloat(restaurant.lng);
            });

            const averageLat = totalLat / count;
            const averageLng = totalLng / count;

            const newCenter = { lat: averageLat, lng: averageLng };

            setCenter(prevCenter => {
                if (prevCenter.lat === newCenter.lat && prevCenter.lng === newCenter.lng) {
                    return prevCenter; // 변경이 없으면 이전 상태 그대로 반환하여 리렌더링 방지
                }
                return newCenter;
            });
        }
    }, []);



    // 지도 마커 클릭 시 해당 목록 항목으로 스크롤
    useEffect(() => {
        if (selectedRestaurantIndex !== null && restaurantRefs.current[selectedRestaurantIndex]) {
        restaurantRefs.current[selectedRestaurantIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
        }
    }, [selectedRestaurantIndex]);

    // 마커 클릭 핸들러 함수
    const handleMarkerClick = (index) => {
        setSelectedRestaurantIndex(index); // 클릭된 마커의 인덱스 저장
    };

    // 목록 항목 클릭 핸들러 함수
    const handleListItemClick = (index) => {
        setSelectedRestaurantIndex(index); // 클릭된 목록의 인덱스 저장
        setCenter(restaurantList[index]); // 클릭된 목록의 마커 위치로 지도 중심 이동
        setLevel(5);
    };

    const handleLogout = () => {
        logout(); // AuthContext의 logout 함수 호출
        alert("로그아웃 되었습니다.");
        navigate('/');
      };

    const goToLogin = () => {
        navigate('/login');
    };
    const goToSearch = () => {
        navigate('/');
    };

    const goToWish = () => {
        if (!user) {
            alert("로그인이 필요한 기능입니다.");
            navigate('/login');
            return;
        }
        navigate('/wish');
    }


    // 새 창으로 카카오맵 열기
    const openKakaoMapInNewWindow = (restaurant) => {
        // 카카오맵 URL (이름 검색 상태)
        const encodedPlaceName = encodeURIComponent(restaurant.name);
        const kakaoMapUrl = `https://map.kakao.com/?q=${encodedPlaceName}`;
        window.open(kakaoMapUrl, '_blank');
    };

    // 새 창으로 상세보기 페이지 열기
    const openInfoInNewWindow = (restaurant) => {
        const kakaoMapUrl = restaurant.url;
        window.open(kakaoMapUrl, '_blank');
    };




    const [userWishList, setUserWishList] = useState([]); //  사용자의 찜 목록 상태
    const [wishListLoading, setWishListLoading] = useState(true); // 찜 목록 로딩 상태

     //  찜 목록 불러오기
    useEffect(() => {
        const fetchUserWishList = async () => {
            
            if (!user) {
                setUserWishList([]);
                setWishListLoading(false); 
                return;
            }

            setWishListLoading(true);
            try {
                const result = await ApiClient.viewWish(user.token); // 받아 온 사용자 찜 목록

                if (result && Array.isArray(result)) {
                    setUserWishList(result);
                    console.log("사용자 찜 목록:", result);
                } else {
                    console.error('찜 목록 API 응답 형태가 예상과 다릅니다:', result);
                    setUserWishList([]);
                }

            } catch (error) {
                setUserWishList([]);
                if (error.message.includes('403')) {
                    alert('로그인이 만료되었거나 권한이 없습니다.');
                    navigate('/login'); // 로그인 페이지로 리다이렉트
                } else {
                    alert('로그인이 만료되었습니다. 다시 로그인 해 주세요.');
                    logout();
                    navigate('/login');
                }

            } finally {
                setWishListLoading(false); // 로딩 종료
            }
        };

        // user 객체가 null이 아니게 될 때 이 effect가 실행되도록 함
        if (user) {
            fetchUserWishList();
        }

    }, [user, navigate]);


    // 찜 추가 
    const handleAddWish = async (restaurant) => {

        if (!user) {
            alert("로그인이 필요한 기능입니다.");
            navigate('/login');
            return;
        }

        try {
            await ApiClient.addWish(restaurant.id, user.token);

            console.log("찜 추가 성공:", restaurant.name);

            setUserWishList(prevList => [...prevList, { restaurantId: restaurant.id }]);
            
            alert(`${restaurant.name}을(를) 찜 목록에 추가했습니다.`);

        } catch (error) {
            console.error('찜 추가 처리 중 오류 발생:', error);
            alert('찜 추가에 실패했습니다.');
        }
    };

    // 찜 해제
    const handleRemoveWish = async (restaurant) => {

        if (!user) {
            alert("로그인이 필요한 기능입니다.");
            navigate('/login');
            return;
        }

        try {

            await ApiClient.deleteWish(restaurant.id, user.token);

            console.log("찜 해제 성공:", restaurant.name);

            setUserWishList(prevList => prevList.filter(item => {
                return item.restaurantId !== restaurant.id;
            }));

            alert(`${restaurant.name}을(를) 찜 목록에서 제거했습니다.`);


        } catch (error) {
            console.error('찜 해제 처리 중 오류 발생:', error);
            alert('찜 해제에 실패했습니다.');
        }
    };

    // 특정 식당이 사용자의 찜 목록에 있는지 확인
    const isRestaurantWished = (ListId) => {
        if (wishListLoading) return false; 
        if (!user) return false; 

        return userWishList.some(item => item.restaurantId === ListId);
    };





  return (
    <div className="page-wrapper">

        <header className="app-header">
            <div onClick={goToSearch} style={{ cursor: 'pointer' }} className="header-left">맛 GPT</div>
            <div className="header-right">
            { user ? ( // user 객체가 존재하는 경우 (로그인 상태)
                <>
                {user.name} 님, 환영합니다!
                <button className="logout-button" onClick={goToWish}>찜 목록</button>
                <button className="logout-button" onClick={handleLogout}>로그아웃</button>
                </>
            ) : ( // user 객체가 null인 경우 (로그인 상태가 아님)
                <>
                <button className="logout-button" onClick={goToLogin}>로그인</button>
                </>
            )}
            </div>
        </header>

        <main className="main-content-response">
            <div className="map-area">
                <h2>
                    {extractedResponseList[0]
                    .split(/([.?])/g)
                    .map((part, index) => {
                        if (part === '.' || part === '?') {
                            return (
                                <React.Fragment key={index}>
                                    {part} <br />
                                </React.Fragment>
                            );
                        }
                        return <React.Fragment key={index}>{part}</React.Fragment>;
                    })}
                </h2>
            <p></p>
            
            <div className="map-container">
                <Map center={center} style={{width: "100%", height: "100%"}} level={level}>
                {markers.map((position, index) => (
                    <React.Fragment key={index}>
                        <MapMarker
                            position={position}
                            onMouseOver={() => setHoveredMarkerIndex(index)}
                            onMouseOut={() => setHoveredMarkerIndex(null)}
                            onClick={() => handleMarkerClick(index)}
                        />

                        {/* 마우스가 올라와 있거나 클릭된 마커일 경우에만 CustomOverlayMap 렌더링 */}
                        {(hoveredMarkerIndex === index || selectedRestaurantIndex === index) && (
                            <CustomOverlayMap
                                position={position}
                                xAnchor={0.5}
                                yAnchor={1.5}
                            >
                                <div className="map-overlay-info">
                                    {position.name || `위치 ${index + 1}`}
                                </div>
                            </CustomOverlayMap>
                        )}
                    </React.Fragment>
                ))}
                </Map>
            </div>
            </div>

            <div className="list-area">
            <div className="header-container">
                <h3 className="context">추천 목록</h3>
                <h3 className="right-context">지도 / 상세보기 / 찜</h3>
            </div>
            {restaurantList.length === 0 ? (
                <p>표시할 위치 정보가 없습니다.</p>
            ) : (
                <ul>
                    {restaurantList.map((restaurant, index) => (

                        <React.Fragment key={index}>
                        <li
                            key={index}
                            ref={el => (restaurantRefs.current[index] = el)} // ref 할당
                            className={selectedRestaurantIndex === index ? 'highlighted' : ''} // 조건부 클래스 적용
                            onClick={() => handleListItemClick(index)} // 목록 항목 클릭
                        >
                            <div className="restaurant-image">
                                {restaurant.imgUrl ? (
                                    <img className="existing-image" src={restaurant.imgUrl} alt="식당 이미지" />
                                ) : (
                                    <img className="null-image" src="/images/icon/image_null.png"/>
                                )} 
                            </div>

                            <div className="restaurant-item-content" title={"〔" + restaurant.name + "〕" + " / " + restaurant.rating + " / " + restaurant.address + " / " + (restaurant.phone === null ? "저장된 연락처 없음" : restaurant.phone)}>
                            <strong className="restaurant_name">
                                〔&nbsp;{restaurant.name || `위치 ${index + 1}`}&nbsp;〕
                            </strong><br />
                            <strong className="restaurant-rating">&nbsp;&nbsp;&nbsp;{restaurant.rating}&nbsp;&nbsp;</strong>
                            <Rating readonly initialValue={restaurant.rating} fillColor="orange" allowFraction={true} size={30}/><br />
                            &nbsp;&nbsp;&nbsp;&nbsp;{restaurant.address} <br />
                            &nbsp;&nbsp;&nbsp;&nbsp;{restaurant.phone === null ? "저장된 연락처 없음" : restaurant.phone}
                            </div>


                            <button
                            className="view-on-map-button"
                            title="카카오맵에서 보기"
                            onClick={(e) => {
                                e.stopPropagation(); // li 클릭 이벤트가 발생하지 않도록 전파 중지
                                openKakaoMapInNewWindow(restaurant);
                            }}
                            >
                                <img src="/images/icon/kakaomap_basic.png" alt="카카오맵에서 보기" width="50" height="50" />
                            </button>

                            <button
                            className="view-on-map-button"
                            title="상세보기 페이지"
                            onClick={(e) => {
                                e.stopPropagation();
                                openInfoInNewWindow(restaurant);
                            }}
                            >
                                <img src="/images/icon/note.png" alt="상세보기 페이지" width="50" height="50" />
                            </button>


                            {/*  찜/찜 해제 버튼 */}
                            {user && !wishListLoading && restaurant.id !== undefined ? ( // restaurant 객체에 ID가 있는지 확인
                                isRestaurantWished(restaurant.id) ? (
                                    // 찜한 상태
                                    <button
                                        className="view-on-map-button"
                                        title="찜 목록에서 해제하기"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveWish(restaurant);
                                        }}
                                    >
                                        <img src="/images/icon/wish_on.png" width="50" height="50" />
                                    </button>
                                ) : (
                                    // 찜 안 한 상태
                                    <button
                                        className="view-on-map-button"
                                        title="찜 목록에 추가하기"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddWish(restaurant);
                                        }}
                                    >
                                        <img src="/images/icon/wish_off.png" width="50" height="50" />
                                    </button>
                                )
                            ) : (
                                // 비로그인 / 로딩 상태인 경우
                                <button
                                    className="view-on-map-button"
                                    disabled={true}
                                    title={!user ? "로그인이 필요합니다" : (wishListLoading ? "찜 상태 로딩 중" : "ID 정보 없음")}
                                >
                                    { !user ? "찜" : "?"} 
                                    <img src="/images/icon/wish_off.png" width="50" height="50" />
                                </button>
                            )}


                        </li>

                        {selectedRestaurantIndex === index && (
                            <li className="blank-placeholder">
                                {extractedResponseList && extractedResponseList[index] ? (
                                    <p className="response-content"
                                       dangerouslySetInnerHTML={{
                                           __html: extractedResponseList[index + 1]
                                           .replace(/감사합니다./g, '')
                                           .replace(/\.(?![0-9])/g, '.<br/>')
                                       }}
                                    />
                                ) : (
                                    <p>추가 정보가 없습니다.</p>
                                )}
                            </li>
                        )}
                        </React.Fragment>
                    ))}
                </ul>
            )}
            </div>
        </main>
    </div>
  );
};

export default ResponsePage;
