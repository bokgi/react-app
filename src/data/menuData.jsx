const MenuData = [
  "김치찌개", "된장찌개", "제육볶음", "돈까스", "초밥", "파스타", "비빔밥",
  "칼국수", "짜장면", "짬뽕", "순두부찌개", "삼겹살", "치킨", "피자",
  "족발", "보쌈", "부대찌개", "육개장", "닭갈비", "갈비찜", "해물찜",
  "아구찜", "감자탕", "추어탕", "삼계탕", "백반", "김밥", "떡볶이",
  "순대", "튀김", "만두", "라면", "쫄면", "냉면", "밀면", "콩국수",
  "막국수", "잔치국수", "칼비빔면", "우동", "소바", "오므라이스", "김치볶음밥",
  "새우볶음밥", "카레라이스", "짜장밥", "짬뽕밥", "덮밥", "회덮밥", "육회비빔밥",
  "알밥", "스테이크", "햄버거", "샌드위치", "샐러드", "타코", "케밥",
  "쌀국수", "팟타이", "마라탕", "훠궈", "양꼬치", "꿔바로우", "깐풍기",
  "팔보채", "유린기", "고추잡채", "마파두부", "딤섬", "스시", "라멘",
  "규동", "오코노미야키", "타코야키", "야끼소바", "스키야키", "샤브샤브", "돈부리",
  "텐동", "함바그", "나베", "조개구이", "장어구이", "산낙지", "게장",
  "대하구이", "물회", "회무침", "생선구이", "해물파전", "김치전", "파전",
  "부추전", "감자전", "빈대떡", "갈치조림", "고등어조림", "닭볶음탕", "찜닭",
  "코다리찜", "돼지갈비찜", "소갈비찜", "도가니탕", "꼬리곰탕", "소등심",
  "핫도그", "시리얼", "수프", "국밥", "콩나물국밥", "순대국밥",
  "돼지국밥", "뼈해장국", "선지해장국", "내장탕", "쭈꾸미볶음", "낙지볶음",
  "오징어볶음", "두루치기", "동태탕", "알탕", "대구탕", "복어탕", "청국장",
  "비빔국수", "사케동", "생선까스", "치킨까스", "함박스테이크", "스파게티",
  "리조또", "닭강정", "떡갈비", "쭈삼", "쭈꾸미삼겹살", "곱도리탕", "닭한마리",
  "옻닭", "백숙", "오리백숙", "훈제오리", "냉채족발", "불족발", "마늘보쌈",
  "굴보쌈", "등갈비찜", "대구뽈찜", "간장게장", "양념게장", "새우장", "전복장",
  "꼬막비빔밥", "멍게비빔밥", "육사시미", "문어숙회", "골뱅이무침", "홍어무침",
  "과메기", "모듬회", "광어", "우럭", "참돔", "연어", "방어",
  "참치", "새우", "문어", "해삼", "개불", "멍게", "굴",
  "꼼장어", "염통꼬치", "닭똥집튀김", "무뼈닭발", "국물닭발", "오돌뼈",
  "막창구이", "곱창구이", "대창구이", "양구이", "소곱창전골", "안심", "살치살",
  "부채살", "토시살", "제비추리", "안창살", "등갈비", "LA갈비", "돼지갈비",
  "소갈비", "갈매기살", "가브리살", "항정살", "막창", "대창", "곱창",
  "양갈비", "벌집", "염통", "오겹살", "볼살", "덜미살",
  "꼬들살", "뒷고기", "껍데기", "닭목살", "무릎연골", "닭염통", "통닭",
  "김치찜", "코다리조림", "묵은지찜", "만둣국",
  "갈비탕", "도가니수육", "꼬리찜", "아롱사태수육", "수육백반", "곱창전골",
  "대창전골", "막창전골", "양곱창", "돼지김치찜", "묵은지김치찜",
  "차돌된장찌개", "바지락순두부찌개", "짬뽕순두부", "부대볶음", "닭도리탕", "콩비지찌개",
  "김치콩나물국밥", "순대국", "뼈다귀해장국", "북엇국", "황태해장국", "재첩국",
  "추어튀김", "새우튀김", "오징어튀김", "김말이", "야채튀김", "고구마튀김",
  "깻잎튀김", "녹두빈대떡", "도토리묵", "메밀묵", "탕수육", "깐쇼새우",
  "라조기", "고추잡채밥", "마파두부밥", "쟁반짜장", "볶음짬뽕", "우육면",
  "탄탄면", "양장피", "유산슬", "크림새우", "칠리새우", "송이덮밥",
  "류산슬밥", "잡채밥", "게살볶음밥", "멘보샤", "고기만두", "김치만두",
  "갈비만두", "군만두", "짜파게티", "라볶이",
  "어묵탕", "소고기무국", "미역국", "황태국", "배추된장국", "아욱된장국", "냉이된장국", "달래된장국",
  "쑥된장국", "시래기된장국", "된장국", "콩나물국", "미역냉국", "오이냉국",
  "김칫국", "시래기국", "떡만둣국", "짜장라면",
  "밀푀유나베", "곱창볶음밥", "오징어덮밥", "제육덮밥", "김치제육덮밥", "돈까스덮밥",
  "새우장덮밥", "연어덮밥", "장어덮밥", "카레덮밥", "마파두부덮밥", "잡채덮밥",
  "치킨마요덮밥", "참치마요덮밥", "김치날치알밥", "육회덮밥", "스테이크덮밥", "햄버거스테이크",
  "파니니", "브리또", "퀘사디아", "엔칠라다", "부리토볼", "샐러드파스타",
  "콜드파스타", "봉골레파스타", "알리오올리오", "크림파스타", "토마토파스타", "로제파스타",
  "해물파스타", "오징어먹물리조또", "버섯리조또", "새우리조또", "김치리조또",
  "만두전골", "버섯전골", "소불고기전골", "닭한마리칼국수", "닭곰탕",
  "육개장칼국수", "볶음짬뽕밥", "간짜장", "삼선짜장", "쟁반짬뽕",
  "냉짬뽕", "차돌짬뽕", "백짬뽕", "중화냉면", "중화비빔밥", "마라샹궈",
  "양갈비", "양다리구이", "족발볶음", "보쌈김치찜", "감자옹심이", "메밀전병",
  "배추전", "동태전", "육전", "굴전", "호박전", "버섯전",
  "꼬치구이", "닭꼬치", "삼겹살꼬치", "닭발볶음", "닭똥집볶음",
  "오돌뼈볶음", "돼지껍데기볶음", "막창볶음", "곱창볶음", "대창볶음",
  "쭈꾸미삼겹살볶음", "낙곱새", "두부김치", "골뱅이소면", "번데기탕",
  "홍어삼합", "해물찜닭", "치즈찜닭", "간장찜닭", "매콤찜닭", "아귀찜",
  "해물탕", "아귀탕", "동태찌개", "고등어찌개", "꽁치찌개",
  "부대찌개라면", "짬뽕라면", "해물라면", "파김치라면", "콩나물라면", "떡만두라면",
  "오징어짬뽕", "나가사끼짬뽕", "마제소바", "츠케멘", "아부라소바", "소유라멘",
  "미소라멘", "시오라멘", "새우카레", "돈까스카레",
  "스프카레", "냉모밀", "온모밀", "판모밀", "비빔모밀",
  "알리오올리오파스타", "까르보나라파스타", "새우크림파스타", "게살크림파스타",
  "해산물토마토파스타", "치킨토마토파스타", "바질페스토파스타", "라자냐", "뇨끼", "아란치니",
  "마르게리따피자", "페퍼로니피자", "불고기피자", "콤비네이션피자", "고구마피자",
  "쉬림프골드피자", "포테이토피자", "시카고피자", "디트로이트피자", "칼조네", "포카치아",
  "감바스", "스페인오믈렛", "빠에야", "족발덮밥", "보쌈정식", "불고기정식", "갈비정식"
];


export default MenuData;
