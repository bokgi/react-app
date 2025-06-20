class ApiClient {

    static SERVER_URL1 = "http://localhost:8083";
    static SERVER_URL = "http://14.63.178.159";

    static async signUp(user) {
        
        const { id, password, name } = user;

        try {
            const response = await fetch(ApiClient.SERVER_URL + "/api/sign-api" + "/sign-up", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: id,
                    password: password,
                    name: name,
                }),
            });

            return response;

        } catch (error) {
            console.error('로그인 요청 중 오류 발생:', error);
            throw error;
        }
    }

    static async login(user) {

        const { id, password } = user;

        try {
            const response = await fetch(ApiClient.SERVER_URL + "/api/sign-api" + "/sign-in", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: id,
                    password: password,
                }),
            });

            return response;

        } catch (error) {
            console.error('로그인 요청 중 오류 발생:', error);
            throw error;
        }
    }

    
    static async search(searchTerm, token){

        const input = searchTerm;
        const searchEndpoint = ApiClient.SERVER_URL + "/api/gpt" + "/input";

        try {
            const response = await fetch(searchEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    input: input,
                }),
            });

            return response;

        } catch (error) {
            console.error('추천 식당을 불러오는 중 오류 발생:', error);
            throw error;
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////////

        
    static async addWish(restaurantId, token){ // 찜 목록 추가

        const addEndpoint = ApiClient.SERVER_URL + "/api/wish" + "/add" + "?id=" + restaurantId;

        try {
            const response = await fetch(addEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                }),
            });

            return response;

        } catch (error) {
            console.error('찜 처리 중 오류 발생:', error);
            throw error;
        }
    }


    static async viewWish(token){ // 찜 목록 불러오기

        const wishEndpoint = ApiClient.SERVER_URL + "/api/wish" + "/view";

        try {
            const response = await fetch(wishEndpoint, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

            });
            
            return response;

        } catch (error) {
            console.error('찜 목록을 불러오는 중 오류 발생:', error);
            throw error;
        }
    }


    static async deleteWish(restaurantId, token){ // 찜 목록 해제

        const deleteEndpoint = ApiClient.SERVER_URL + "/api/wish" + "/delete" + "?id=" + restaurantId;

        try {
            const response = await fetch(deleteEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                }),
            });

            return response;

        } catch (error) {
            console.error('찜 목록을 제거하는 중 오류 발생:', error);
            throw error;
        }
    }


    static async addtext(restaurantId, text, token){ // 주석 작성 및 저장

        const addEndpoint = ApiClient.SERVER_URL + "/api/wish" + "/description"

        try {
            const response = await fetch(addEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    description: text,
                    restaurantId: restaurantId
                }),
            });

            return response;

        } catch (error) {
            console.error('주석을 저장하는 중 오류 발생:', error);
            throw error;
        }
    }

    // 찜 목록 링크=============================================================================================


    // 로그인 token 전송 -> userId -> 찜 목록 링크 토큰 받아오기
    static async WishListToken(token){ 

        const TokenEndpoint = ApiClient.SERVER_URL + "/api/wish" + "/getToken";
        try {
             const response = await fetch(TokenEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                }),
            });

            return response;

        } catch (error) {
            console.error('찜 목록을 불러오는 중 오류 발생:', error);
            throw error;
        }
    }


    // 찜 목록 링크 토큰 전송 -> userId -> 공유를 위한 사용자 찜 목록 불러오기
    static async ShareWish(wishListToken){ 

        const ShareEndpoint = ApiClient.SERVER_URL + "/api/wish" + "/share" + "?token=" + wishListToken

        try {
             const response = await fetch(ShareEndpoint, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            return response;

        } catch (error) {
            console.error('찜 목록을 불러오는 중 오류 발생:', error);
            throw error;
        }
    }

    
// 카카오 회원가입 및 로그인 =============================================================================================    

    static async KakaoLogin(code){ 

        const KakaoEndpoint = ApiClient.SERVER_URL + "/api/sign-api/kakao-sign-in?code=" + code

        try {
            const response = await fetch(KakaoEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                }),
            });

            return response; // user login 정보 (AuthContext)

        } catch (error) {
            console.error('카카오 로그인 중 오류 발생:', error);
            throw error;
        }
    }


}


export default ApiClient;