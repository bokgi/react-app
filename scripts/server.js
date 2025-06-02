// 필요한 라이브러리를 불러옵니다.
import express from 'express';
import cors from 'cors'; // CORS 미들웨어
import { get } from 'axios';
import { load } from 'cheerio';

const app = express();
const port = 3000; // 서버 포트 번호 (원하시는 번호로 변경 가능)

// CORS 미들웨어를 사용하여 모든 출처에서의 요청을 허용합니다.
// 실제 서비스에서는 특정 출처만 허용하도록 설정하는 것이 보안상 좋습니다.
app.use(cors());

// 특정 URL에서 별점 텍스트를 크롤링하는 비동기 함수 (이전 코드와 동일)
async function crawlStarRating(url) {
    try {
        const { data } = await get(url);
        const $ = load(data);
        const starRatingElement = $('#mainContent > div.top_basic > div.info_main > div:nth-child(2) > div:nth-child(1) > a > span > span.num_star');

        if (starRatingElement.length > 0) {
            const starText = starRatingElement.text().trim();
            return { url, starRating: starText };
        } else {
            // 요소를 찾지 못한 경우에도 해당 URL 정보를 포함하여 반환
            return { url, starRating: null, error: '지정된 요소를 찾을 수 없습니다.' };
        }

    } catch (error) {
        // 오류 발생 시에도 해당 URL 정보를 포함하여 반환
        console.error(`URL ${url} 처리 중 오류 발생: ${error.message}`);
        return { url, starRating: null, error: `크롤링 실패: ${error.message}` };
    }
}

// URL 배열을 처리하는 비동기 함수 (이전 코드와 동일하지만, 콘솔 출력 대신 결과를 반환)
async function processUrls(urls) {
    console.log('크롤링을 시작합니다...');
    const results = [];

    for (const url of urls) {
        console.log(`URL 처리 중: ${url}`);
        const result = await crawlStarRating(url);
        results.push(result);
        // 필요에 따라 요청 간에 지연 시간을 줄 수 있습니다.
        // await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('크롤링이 완료되었습니다.');
    return results;
}

// 크롤링 결과를 제공하는 API 엔드포인트
app.get('/crawl', async (req, res) => {
    // 크롤링할 URL 배열입니다. 실제 사용할 URL 배열을 여기에 정의하거나,
    // 요청의 쿼리 파라미터 등으로 받아올 수 있습니다.
    const targetUrls = [
        'https://place.map.kakao.com/742422852',
        // 다른 카카오맵 상세 페이지 URL을 추가하세요.
        // 'https://place.map.kakao.com/다른ID',
    ];

    try {
        const crawlingResults = await processUrls(targetUrls);
        // 결과를 JSON 형태로 응답합니다.
        res.json(crawlingResults);
    } catch (error) {
        console.error('API 처리 중 오류 발생:', error);
        // 오류 발생 시 500 상태 코드와 함께 오류 메시지를 응답합니다.
        res.status(500).json({ error: '크롤링 중 서버 오류가 발생했습니다.' });
    }
});

// 서버 시작
app.listen(port, () => {
    console.log(`크롤링 서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
