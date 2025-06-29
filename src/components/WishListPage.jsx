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
        const encodedPlaceName = encodeURIComponent(restaurant.address + " " + restaurant.placeName);
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

    //  찜 목록 불러오기 / address, description, imgUrl, phone, placeName, placeUrl, rating, restaurantId, userId
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

                // 오류 확인
                if (!result.ok) {
                    if (result.status == 403) {
                        alert('로그인이 만료되었습니다.\n다시 로그인 해 주시기 바랍니다.');
                        console.error(result.status + " 오류 발생: ", result);
                        logout();
                        navigate('/login');
                        return;
                    } else if (result.status >= 400 && result.status <= 499) {
                        alert('찜 목록을 불러오는 중 클라이언트 오류가 발생했습니다.\n나중에 다시 시도해주세요.');
                        console.error(result.status + " 오류 발생: ", result);
                        return;
                    } else if (result.status >= 500 && result.status <= 599) {
                        alert('서버가 찜 목록을 불러올 수 없는 상태입니다.\n나중에 다시 시도해주세요.');
                        console.error(result.status + " 오류 발생: ", result);
                        return;
                    } else {
                        alert('예상치 못한 오류가 발생했습니다.\n나중에 다시 시도해주세요.');
                        console.error(result.status + " 오류 발생: ", result);
                        return;
                    }
                }

                const response = await result.json();

                if (response && Array.isArray(response)) {
                    setUserWishList(response);
                    console.log("사용자 찜 목록:", response);
                } else {
                    console.error('찜 목록 API 응답 형태가 예상과 다릅니다:', response);
                    setUserWishList([]);
                    return;
                }

            } catch (error) {
                setUserWishList([]);
                console.error('찜 목록을 불러오는 중 네트워크 또는 기타 오류 발생:', error);
                alert("찜 목록을 불러오는 중 예상치 못한 오류가 발생했습니다.\n네트워크 연결 상태를 확인해주세요.");
                return;

            } finally {
                setWishListLoading(false); // 로딩 종료
            }
        };

        // user 객체가 null이 아니게 될 때 이 effect가 실행
        if (user) {
            fetchUserWishList();
        }

    }, [user]);



    // 찜 해제
    const handleRemoveWish = async (restaurant) => {

        if (!user) {
            alert("로그인이 필요한 기능입니다.");
            navigate('/login');
            return;
        }

        try {

            const result = await ApiClient.deleteWish(restaurant.restaurantId, user.token);

            // 오류 확인
            if (!result.ok) {
                if (result.status == 403) {
                    alert('로그인이 만료되었습니다.\n다시 로그인 해 주시기 바랍니다.');
                    console.error(result.status + " 오류 발생: ", result);
                    logout();
                    navigate('/login');
                    return;
                } else if (result.status >= 400 && result.status <= 499) {
                    alert('찜 목록 해제 중 클라이언트 오류가 발생했습니다.\n나중에 다시 시도해주세요.');
                    console.error(result.status + " 오류 발생: ", result);
                    return;
                } else if (result.status >= 500 && result.status <= 599) {
                    alert('서버가 찜 목록 해제를 처리할 수 없는 상태입니다.\n나중에 다시 시도해주세요.');
                    console.error(result.status + " 오류 발생: ", result);
                    return;
                } else {
                    alert('예상치 못한 오류가 발생했습니다.\n나중에 다시 시도해주세요.');
                    console.error(result.status + " 오류 발생: ", result);
                    return;
                }
            }

            console.log("찜 해제 성공:", restaurant.placeName);

            setUserWishList(prevList => prevList.filter(item => {
                return item.restaurantId !== restaurant.restaurantId;
            }));

            alert(`〔${restaurant.placeName}〕을(를) 찜 목록에서 제거했습니다.`);


        } catch (error) {
            console.error('찜을 해제하는 중 네트워크 또는 기타 오류 발생:', error);
            alert("찜을 해제하는 중 예상치 못한 오류가 발생했습니다.\n네트워크 연결 상태를 확인해주세요.");
            return;
        }
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
            const result = await ApiClient.addtext(restaurantId, annotationText, user.token);
            
            // 오류 확인
            if (!result.ok) {
                if (result.status == 403) {
                    alert('로그인이 만료되었습니다.\n다시 로그인 해 주시기 바랍니다.');
                    console.error(result.status + " 오류 발생: ", result);
                    logout();
                    navigate('/login');
                    return;
                } else if (result.status >= 400 && result.status <= 499) {
                    alert('메모 저장 중 클라이언트 오류가 발생했습니다.\n나중에 다시 시도해주세요.');
                    console.error(result.status + " 오류 발생: ", result);
                    return;
                } else if (result.status >= 500 && result.status <= 599) {
                    alert('서버가 메모 저장을 처리할 수 없는 상태입니다.\n나중에 다시 시도해주세요.');
                    console.error(result.status + " 오류 발생: ", result);
                    return;
                } else {
                    alert('예상치 못한 오류가 발생했습니다.\n나중에 다시 시도해주세요.');
                    console.error(result.status + " 오류 발생: ", result);
                    return;
                }
            }

            console.log(`주석 저장 성공: 식당 ID ${restaurantId}`);
        } catch (error) {
            console.error('메모 저장 중 네트워크 또는 기타 오류 발생:', error);
            alert("메모를 저장하는 중 예상치 못한 오류가 발생했습니다.\n네트워크 연결 상태를 확인해주세요.");
            return;
        }
    };
 

    // 찜 목록 링크 복사
    const handleCopyToken = async (token) => {
        try {
            const result = await ApiClient.WishListToken(token);

            // 오류 확인
            if (!result.ok) {
                if (result.status == 403) {
                    alert('로그인이 만료되었습니다.\n다시 로그인 해 주시기 바랍니다.');
                    console.error(result.status + " 오류 발생: ", result);
                    logout();
                    navigate('/login');
                    return;
                } else if (result.status >= 400 && result.status <= 499) {
                    alert('공유 링크를 복사하는 중 클라이언트 오류가 발생했습니다.\n나중에 다시 시도해주세요.');
                    console.error(result.status + " 오류 발생: ", result);
                    return;
                } else if (result.status >= 500 && result.status <= 599) {
                    alert('서버가 링크를 처리할 수 없는 상태입니다.\n나중에 다시 시도해주세요.');
                    console.error(result.status + " 오류 발생: ", result);
                    return;
                } else {
                    alert('예상치 못한 오류가 발생했습니다.\n나중에 다시 시도해주세요.');
                    console.error(result.status + " 오류 발생: ", result);
                    return;
                }
            }

            const wishListToken = await result.text();

            const linkToCopy = 'https://matgpt.p-e.kr/wish/share?token=' + wishListToken;
            ClipboardJS.copy(linkToCopy);
            alert(user.name + '님의 찜 목록 공유 링크가 클립보드에 복사되었습니다.');

        } catch (error) {
            console.error('링크 복사 중 네트워크 또는 기타 오류 발생:', error);
            alert("공유 링크를 복사하는 중 예상치 못한 오류가 발생했습니다.\n네트워크 연결 상태를 확인해주세요.");
            return;;
        }
    };


    const [imageLoadError, setImageLoadError] = React.useState({});

    // 이미지 로딩 실패
    const handleImageError = (index) => {
    setImageLoadError(prevErrors => ({
        ...prevErrors,
        [index]: true // 해당 인덱스의 이미지 로딩 실패 상태를 true로 설정
    }));
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
                                {restaurant.imgUrl && !imageLoadError[index] ? (
                                    <img
                                        className="existing-image"
                                        src={restaurant.imgUrl}
                                        alt="식당 이미지"
                                        onError={() => handleImageError(index)} // 이미지 로딩 실패 시
                                    />
                                ) : (
                                    <img className="null-image" src="/images/icon/image_null.png" alt="이미지 없음" />
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


                            {/* 찜 해제 버튼 */}
                            {user && !wishListLoading && restaurant.restaurantId !== undefined ? ( // restaurant 객체에 ID가 있는지 확인
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
