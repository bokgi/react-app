import React, { useState, useEffect } from "react";
import "../css/SharePage.css";
import { Rating } from 'react-simple-star-rating';
import ApiClient from '../services/ApiClient';
import { useNavigate, useSearchParams } from 'react-router-dom';

const SharePage = () => {

    const [searchParams] = useSearchParams();
    const wishListToken = searchParams.get('token'); //  쿼리 파라미터

    const navigate = useNavigate();

    // 쿼리 파라미터가 없는 경우 리디렉션
    useEffect(() => {
        if (!wishListToken) {
            console.warn("잘못된 접근입니다. 홈페이지로 리디렉션합니다.");
            navigate('/', { replace: true });
        }
    }, [wishListToken, navigate]);


    const openKakaoMapInNewWindow = (restaurant) => {
        const encodedPlaceName = encodeURIComponent(restaurant.address + " " + restaurant.placeName);
        const kakaoMapUrl = `https://map.kakao.com/?q=${encodedPlaceName}`;
        window.open(kakaoMapUrl, '_blank');
    };

    const openInfoInNewWindow = (restaurant) => {
        const kakaoMapUrl = restaurant.placeUrl;
        window.open(kakaoMapUrl, '_blank');
    };

    const [userName, setUserName] = useState(''); // 사용자 이름
    const [userWishList, setUserWishList] = useState([]); // 사용자의 찜 목록
    const [wishListLoading, setWishListLoading] = useState(true); // 찜 목록 로딩 상태
    const [selectedRestaurantIndex, setSelectedRestaurantIndex] = useState(null); // 선택 목록 인덱스

    // 공유 링크 찜 목록 불러오기 / address, description, imgUrl, phone, placeName, placeUrl, rating, restaurantId, userId
    useEffect(() => {
        const fetchUserWishList = async () => {

            if (wishListToken) {
                setWishListLoading(true);
                try {
                    const response = await ApiClient.ShareWish(wishListToken);

                    if (!response.ok) {
                        if (response.status == 500) {
                            alert('올바르지 않은 링크입니다.\n발급된 링크를 다시 확인하시거나, 재발급해 주세요.');
                            console.error(response.status + " 오류 발생: ", response);
                            navigate('/', { replace: true });
                            return;
                        } else if (response.status >= 400 && response.status <= 499) {
                            alert('목록을 불러오는 중 클라이언트 오류가 발생했습니다.\n나중에 다시 시도해주세요.');
                            console.error(response.status + " 오류 발생: ", response);
                            return;
                        } else if (response.status >= 500 && response.status <= 599) {
                            alert('서버가 목록을 불러올 수 없는 상태입니다.\n나중에 다시 시도해주세요.');
                            console.error(response.status + " 오류 발생: ", response);
                            return;
                        } else {
                            alert('예상치 못한 오류가 발생했습니다.\n나중에 다시 시도해주세요.');
                            console.error(response.status + " 오류 발생: ", response);
                            return;
                        }
                    }

                    const result = await response.json(); 

                    console.log(result);

                    if (result && typeof result === 'object' && Array.isArray(result.wishList) && result.userName !== undefined) {
                        setUserWishList(result.wishList);
                        setUserName(result.userName);

                    } else {
                        console.error('찜 목록 API 응답 형태가 예상과 다릅니다:', result);
                        setUserWishList([]);
                        setUserName('');
                    }

                } catch (error) {
                    setUserWishList([]);
                    setUserName('');
                    alert("잘못된 접근입니다. 홈페이지로 리디렉션합니다.");
                    console.error("찜 목록 불러오는 중 오류:", error);
                    navigate('/', { replace: true });
                } finally {
                    setWishListLoading(false);
                }
            } else {
                console.log("userId 쿼리 파라미터가 없습니다.");
                setUserWishList([]);
                setUserName('');
                setWishListLoading(false);
                alert("잘못된 접근입니다. 홈페이지로 리디렉션합니다.");
                navigate('/', { replace: true });
            }
        };

        fetchUserWishList();

    }, [wishListToken]);


    // 목록 항목 클릭 핸들러
    const handleListItemClick = (index) => {
        if (selectedRestaurantIndex === index) {
            setSelectedRestaurantIndex(null);
        } else {
            setSelectedRestaurantIndex(index);
        }
    };

    const goToSearch = () => {
        navigate('/');
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
            <div className="header-left" onClick={goToSearch} style={{ cursor: 'pointer' }}>맛 GPT</div>
            <div className="header-right"></div>
        </header>

        <main className="main-content-wish">
            <div className="list-area">

                <div className="header-container">
                    <h3 className="context">{userName} 님의 찜 목록</h3>
                    <h3 className="right-context">지도 / 상세보기</h3>
                </div>
                {wishListLoading ? (
                    <p>찜 목록을 불러오는 중입니다...</p>
                ) : (
                    userWishList.length === 0 ? (
                        <p>표시할 위치 정보가 없습니다.</p>
                    ) : (
                        <ul>
                            {userWishList.map((restaurant, index) => (
                                <React.Fragment key={index}>
                                    <li
                                        className={selectedRestaurantIndex === index ? 'highlighted' : ''}
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
                                            e.stopPropagation();
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

                                    </li>

                                    {selectedRestaurantIndex === index && (
                                        <li className="share-blank-placeholder">
                                            <textarea
                                                readOnly
                                                value={restaurant.description || '저장된 메모가 없습니다.'}
                                            />
                                        </li>
                                    )}
                                </React.Fragment>
                            ))}
                        </ul>
                    )
                )}
            </div>
        </main>
    </div>
  );
};

export default SharePage;
