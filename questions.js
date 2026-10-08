/* 문항 데이터. 전역 변수 QUIZ_DATA 하나만 노출한다.
   script.js 보다 먼저 로드되어야 한다. */

var QUIZ_DATA = {
  version: 1,
  categories: [
    {
      id: "korean-history",
      name: "한국사",
      questions: [
        {
          id: "kh-01",
          text: "조선 세종이 훈민정음을 백성에게 반포한 해는?",
          choices: ["1418년", "1443년", "1446년", "1450년"],
          answer: 2,
          explanation: "1443년에 창제하고 1446년에 반포했다.",
          source: { name: "국사편찬위원회 한국사데이터베이스", url: "https://db.history.go.kr" },
          verifiedAt: null
        },
        {
          id: "kh-02",
          text: "금속활자로 인쇄된 책 가운데, 현재까지 전해지는 것 중 가장 오래된 것은?",
          choices: ["직지심체요절", "팔만대장경", "무구정광대다라니경", "삼국사기"],
          answer: 0,
          explanation: "1377년 청주 흥덕사에서 인쇄됐다. 무구정광대다라니경은 목판본이다.",
          source: { name: "국립중앙박물관", url: "https://www.museum.go.kr" },
          verifiedAt: null
        }
      ]
    },
    {
      id: "world-geography",
      name: "세계지리",
      questions: [
        {
          id: "wg-01",
          text: "브리태니커 백과사전이 세계에서 가장 긴 강으로 기재한 강은?",
          choices: ["나일강", "아마존강", "양쯔강", "미시시피강"],
          answer: 0,
          explanation: "측정 방식에 따라 아마존강을 더 길게 보는 자료도 있어 답이 갈린다.",
          source: { name: "Encyclopaedia Britannica", url: "https://www.britannica.com" },
          verifiedAt: null
        },
        {
          id: "wg-02",
          text: "다음 네 나라 중 적도가 지나는 나라는?",
          choices: ["에콰도르", "페루", "칠레", "볼리비아"],
          answer: 0,
          explanation: "나머지 세 나라는 모두 적도 남쪽에 있다.",
          source: { name: "CIA World Factbook", url: "https://www.cia.gov/the-world-factbook" },
          verifiedAt: null
        }
      ]
    },
    {
      id: "science",
      name: "과학",
      questions: [
        {
          id: "sc-01",
          text: "건조 공기의 부피 기준으로, 지구 대기에서 가장 많은 비율을 차지하는 기체는?",
          choices: ["질소", "산소", "아르곤", "이산화탄소"],
          answer: 0,
          explanation: "질소가 약 78%, 산소가 약 21%를 차지한다.",
          source: { name: "기상청", url: "https://www.weather.go.kr" },
          verifiedAt: null
        },
        {
          id: "sc-02",
          text: "진공에서 빛이 1초 동안 가는 거리에 가장 가까운 값은?",
          choices: ["3천 km", "3만 km", "30만 km", "300만 km"],
          answer: 2,
          explanation: "진공에서의 빛의 속력은 299,792,458 m/s로 정의되어 있다.",
          source: { name: "한국표준과학연구원", url: "https://www.kriss.re.kr" },
          verifiedAt: null
        }
      ]
    },
    {
      id: "arts-culture",
      name: "예술과 문화",
      questions: [
        {
          id: "ac-01",
          text: "그림 〈별이 빛나는 밤〉을 그린 화가는?",
          choices: ["빈센트 반 고흐", "클로드 모네", "폴 세잔", "폴 고갱"],
          answer: 0,
          explanation: "1889년 작품으로 뉴욕 현대미술관이 소장하고 있다.",
          source: { name: "The Museum of Modern Art", url: "https://www.moma.org" },
          verifiedAt: null
        },
        {
          id: "ac-02",
          text: "판소리에서 북을 치며 소리꾼의 장단을 맞추는 사람을 무엇이라 하는가?",
          choices: ["고수", "명창", "광대", "재담꾼"],
          answer: 0,
          explanation: "소리를 하는 사람은 명창, 북을 치는 사람은 고수라고 한다.",
          source: { name: "국립국악원", url: "https://www.gugak.go.kr" },
          verifiedAt: null
        }
      ]
    }
  ]
};
