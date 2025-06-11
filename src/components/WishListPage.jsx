import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/WishListPage.css";
import { useAuth } from '../contexts/AuthContext.jsx';
import { Rating } from 'react-simple-star-rating';
import ApiClient from '../services/ApiClient';
import ClipboardJS from 'clipboard';

const WishListPage = () => {

    const navigate = useNavigate();
    const { user, logout } = useAuth();

    useEffect(() => {

        if (!user) {
            alert("잘못된 접근입니다. 검색 페이지로 이동합니다.");
            navigate('/', { replace: true });
        }
    }, [navigate]);


    const handleLogout = () => {
        logout();
        alert("로그아웃 되었습니다.");
        navigate('/');
    };

    const goToLogin = () => {
        navigate('/login');
    };
    const goToSearch = () => {
        navigate('/');
    };


    // 새 창으로 카카오맵 열기
    const openKakaoMapInNewWindow = (restaurant) => {
        // 카카오맵 URL (이름 검색 상태)
        const encodedPlaceName = encodeURIComponent(restaurant.placeName);
        const kakaoMapUrl = `https://map.kakao.com/?q=${encodedPlaceName}`;
        window.open(kakaoMapUrl, '_blank');
    };

    // 새 창으로 상세보기 페이지 열기
    const openInfoInNewWindow = (restaurant) => {
        const kakaoMapUrl = restaurant.placeUrl;
        window.open(kakaoMapUrl, '_blank');
    };


    const [userWishList, setUserWishList] = useState([]); //  사용자의 찜 목록
    const [wishListLoading, setWishListLoading] = useState(true); // 찜 목록 로딩 상태

     //  찜 목록 불러오기 / address, description, ingUrl, phone, placeName, placeUrl, rating, restaurantId, userId
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
                    navigate('/login')
                }

            } finally {
                setWishListLoading(false); // 로딩 종료
            }
        };

        // user 객체가 null이 아니게 될 때 이 effect가 실행되도록 함
        if (user) {
            fetchUserWishList();
        }

    }, [user]);


    // 찜 추가 - ResponcePage와 동일, 사용하지는 않음
    const handleAddWish = async (restaurant) => {

        if (!user) {
            alert("로그인이 필요한 기능입니다.");
            navigate('/login');
            return;
        }

        try {
            await ApiClient.addWish(restaurant.restaurantId, user.token);

            console.log("찜 추가 성공:", restaurant.name);

            setUserWishList(prevList => [...prevList, { restaurantId: restaurant.restaurantId }]);
            
            alert(`${restaurant.placeName}을(를) 찜 목록에 추가했습니다.`);

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

            await ApiClient.deleteWish(restaurant.restaurantId, user.token);

            console.log("찜 해제 성공:", restaurant.placeName);

            setUserWishList(prevList => prevList.filter(item => {
                return item.restaurantId !== restaurant.restaurantId;
            }));

            alert(`${restaurant.placeName}을(를) 찜 목록에서 제거했습니다.`);


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


    const [selectedRestaurantIndex, setSelectedRestaurantIndex] = useState(null); // 선택된 목록 인덱스

    // 목록 항목 클릭 핸들러
    const handleListItemClick = (index) => {
        // 이미 선택된 항목을 다시 클릭하면 선택 해제
        if (selectedRestaurantIndex === index) {
            setSelectedRestaurantIndex(null);
        } else {
            setSelectedRestaurantIndex(index);
        }
    };

    // 사용자가 작성한 각 식당의 주석
    const handleSaveAnnotation = async (restaurantId, annotationText) => {
        if (!user) {
            alert("로그인이 필요한 기능입니다.");
            return;
        }

        if (annotationText === undefined) {
        console.warn(`주석 내용이 없습니다. 식당 ID: ${restaurantId}`);
        return;
        }

        console.log(`주석 저장 시도: 식당 ID ${restaurantId}, 내용: ${annotationText}`);

        try {

            await ApiClient.addtext(restaurantId, annotationText, user.token);
            console.log(`주석 저장 성공: 식당 ID ${restaurantId}`);
            // 서버 응답에 따라 userWishList의 해당 항목을 다시 업데이트하는 로직을 추가할 수도 있습니다.
        } catch (error) {
            console.error(`주석 저장 중 오류 발생: 식당 ID ${restaurantId}`, error);
            alert('주석 저장에 실패했습니다.');
        }
    };
 

    // 찜 목록 링크 복사
    const handleCopyToken = async (token) => {
        try {
            const wishListToken = await ApiClient.WishListToken(token);
            const linkToCopy = 'http://14.63.178.159/wish/share?token=' + wishListToken;
            ClipboardJS.copy(linkToCopy);
            alert(user.name + '님의 찜 목록 공유 링크가 클립보드에 복사되었습니다.');
        } catch (err) {
            alert('공유 링크 복사에 실패했습니다.');
            console.error('Failed to copy text: ', err);
        }
    };
    


  return (
    <div className="page-wrapper">

        <header className="app-header">
            <div onClick={goToSearch} style={{ cursor: 'pointer' }} className="header-left">맛 GPT</div>
            <div className="header-right">
            { user ? ( // user 객체가 존재하는 경우 (로그인 상태)
                <>
                {user.name} 님, 환영합니다!
                <button className="logout-button" onClick={handleLogout}>로그아웃</button>
                </>
            ) : ( // user 객체가 null인 경우 (로그인 상태가 아님)
                <>
                <button className="logout-button" onClick={goToLogin}>로그인</button>
                </>
            )}
            </div>
        </header>

        <main className="main-content-wish">

            <div className="list-area">
            <div className="header-container">
                <h3 className="context">{user.name} 님의 찜 목록</h3>
                    <button onClick={() => handleCopyToken(user.token)} className="copylink-button">
                        공유 링크 복사
                    </button>
            </div>
            {userWishList.length === 0 ? (
                <p>표시할 위치 정보가 없습니다.</p>
            ) : (
                <ul>
                    {userWishList.map((restaurant, index) => (

                        <React.Fragment key={index}>
                        <li
                            key={index}
                            className={selectedRestaurantIndex === index ? 'highlighted' : ''} // 조건부 클래스 적용
                            onClick={() => handleListItemClick(index)}
                        >
                            <div className="restaurant-image">
                                {restaurant.imgUrl ? (
                                    <img className="existing-image" src={restaurant.imgUrl} alt="식당 이미지" />
                                ) : (
                                    <img className="null-image" src="/images/icon/image_null.png"/>
                                )} 
                            </div>

                            <div className="restaurant-item-content" title={"〔" + restaurant.placeName + "〕" + " / " + Number(restaurant.rating).toFixed(1) + " / " + restaurant.address + " / " + (restaurant.phone === null ? "저장된 연락처 없음" : restaurant.phone)}>
                                <strong className="restaurant_name">
                                    〔&nbsp;{restaurant.placeName || `위치 ${index + 1}`}&nbsp;〕
                                </strong><br />
                                <strong className="restaurant-rating">&nbsp;&nbsp;&nbsp;{Number(restaurant.rating).toFixed(1)}&nbsp;&nbsp;</strong>
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
                            {user && !wishListLoading && restaurant.restaurantId !== undefined ? ( // restaurant 객체에 ID가 있는지 확인
                                isRestaurantWished(restaurant.restaurantId) ? (
                                    // 찜한 상태
                                    <button
                                        className="view-on-map-button"
                                        title="찜 목록에서 해제하기"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (window.confirm("〔" + restaurant.placeName + "〕" + "을(를) 찜 목록에서 해제하시겠습니까? \n찜을 해제하시면 목록에서 사라집니다."  )) {
                                                handleRemoveWish(restaurant);
                                            }
                                        }}
                                    >
                                        <img src="/images/icon/wish_on.png" width="50" height="50" />
                                    </button>
                                ) : (
                                    // 찜 안 한 상태, 목록에서 사라짐
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
                                <textarea
                                    value={restaurant.description || ''}
                                    // 텍스트가 변경될 때마다 호출
                                    onChange={(e) => {
                                        const newDescription = e.target.value;
                                        // 해당 항목의 description 변경
                                        setUserWishList(prevList => {
                                            return prevList.map((item, i) => {
                                                // 현재 맵핑 중인 항목(index)의 description만 업데이트
                                                if (i === index) {
                                                    return { ...item, description: newDescription };
                                                }
                                                return item; // 다른 항목은 그대로
                                            });
                                        });

                                    }}

                                    onBlur={(e) => {
                                        // 현재 입력된 주석 내용 저장
                                        const annotationText = e.target.value;
                                        if (restaurant.restaurantId) {
                                            handleSaveAnnotation(restaurant.restaurantId, annotationText);
                                        } else {
                                            console.error("식당 ID가 없어 주석을 저장할 수 없습니다.");
                                        }
                                    }}

                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            e.target.blur();
                                        }
                                    }}
                                    
                                    placeholder={restaurant.description || "필요한 메모를 입력하세요!"}
                                />
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

export default WishListPage;
