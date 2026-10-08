/* 문항 데이터. 전역 변수 QUIZ_DATA 하나만 노출한다.
   script.js 보다 먼저 로드되어야 한다.

   출처는 기관 대표 주소가 아니라 사실을 확인한 항목 페이지 주소를 적는다.
   verifiedAt 은 그 페이지를 열어 사실을 확인한 날짜다. */

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
          source: { name: "국가기록원 「기록으로 보는 한글」", url: "https://theme.archives.go.kr/next/koreaOfRecord/hangul.do" },
          verifiedAt: "2026-10-08"
        },
        {
          id: "kh-02",
          text: "2001년 유네스코 세계기록유산 등재 기준으로, 현존하는 금속활자 인쇄본 가운데 가장 오래된 책은?",
          choices: ["직지심체요절", "팔만대장경", "무구정광대다라니경", "삼국사기"],
          answer: 0,
          explanation: "1377년 청주 흥덕사에서 인쇄됐다. 무구정광대다라니경은 목판본이다.",
          source: { name: "한국민족문화대백과사전 「불조직지심체요절」", url: "https://encykorea.aks.ac.kr/Article/E0025035" },
          verifiedAt: "2026-10-08"
        },
        {
          id: "kh-03",
          text: "고려를 세운 사람은?",
          choices: ["왕건", "궁예", "견훤", "이성계"],
          answer: 0,
          explanation: "918년 궁예를 몰아내고 고려를 세워 936년 후삼국을 통합했다.",
          source: { name: "한국민족문화대백과사전 「고려」", url: "https://encykorea.aks.ac.kr/Article/E0003424" },
          verifiedAt: "2026-10-08"
        },
        {
          id: "kh-04",
          text: "이성계가 조선을 세우고 왕위에 오른 해는?",
          choices: ["1388년", "1392년", "1394년", "1398년"],
          answer: 1,
          explanation: "1392년 7월 공양왕을 내쫓고 새 왕조의 태조로 즉위했다.",
          source: { name: "한국민족문화대백과사전 「태조」", url: "https://encykorea.aks.ac.kr/Article/E0059033" },
          verifiedAt: "2026-10-08"
        },
        {
          id: "kh-05",
          text: "임진왜란이 일어난 해는?",
          choices: ["1555년", "1592년", "1598년", "1636년"],
          answer: 1,
          explanation: "1592년부터 1598년까지 두 차례에 걸친 일본의 침입이다.",
          source: { name: "한국민족문화대백과사전 「임진왜란」", url: "https://encykorea.aks.ac.kr/Article/E0047674" },
          verifiedAt: "2026-10-08"
        },
        {
          id: "kh-06",
          text: "조선의 의관 허준이 완성한 의학서는?",
          choices: ["동의보감", "향약집성방", "의방유취", "방약합편"],
          answer: 0,
          explanation: "1610년에 완성해 1613년 내의원에서 처음 간행했다.",
          source: { name: "한국민족문화대백과사전 「동의보감」", url: "https://encykorea.aks.ac.kr/Article/E0016731" },
          verifiedAt: "2026-10-08"
        },
        {
          id: "kh-07",
          text: "대동여지도를 만든 사람은?",
          choices: ["김정호", "정약용", "박지원", "김홍도"],
          answer: 0,
          explanation: "1861년 목판본 22첩으로 찍어 낸 전국 지도첩이다.",
          source: { name: "한국민족문화대백과사전 「대동여지도」", url: "https://encykorea.aks.ac.kr/Article/E0014266" },
          verifiedAt: "2026-10-08"
        },
        {
          id: "kh-08",
          text: "안중근이 이토 히로부미를 처단한 곳은?",
          choices: ["하얼빈", "뤼순", "상하이", "도쿄"],
          answer: 0,
          explanation: "1909년 10월 26일 하얼빈에서였고, 체포된 뒤 뤼순 감옥에 갇혔다.",
          source: { name: "한국민족문화대백과사전 「이토 포살 의거」", url: "https://encykorea.aks.ac.kr/Article/E0046347" },
          verifiedAt: "2026-10-08"
        },
        {
          id: "kh-09",
          text: "3·1운동이 일어난 해는?",
          choices: ["1910년", "1919년", "1926년", "1945년"],
          answer: 1,
          explanation: "1919년 3월 1일 전국에서 일어난 독립만세운동이다.",
          source: { name: "한국민족문화대백과사전 「3·1운동」", url: "https://encykorea.aks.ac.kr/Article/E0026772" },
          verifiedAt: "2026-10-08"
        },
        {
          id: "kh-10",
          text: "대한민국 정부가 수립된 해는?",
          choices: ["1945년", "1948년", "1950년", "1953년"],
          answer: 1,
          explanation: "1945년 8월 15일은 광복, 1948년 8월 15일은 정부 수립일이다.",
          source: { name: "한국민족문화대백과사전 「광복절」", url: "https://encykorea.aks.ac.kr/Article/E0005138" },
          verifiedAt: "2026-10-08"
        }
      ]
    },
    {
      id: "world-geography",
      name: "세계지리",
      questions: [
        {
          id: "wg-01",
          text: "2026년 브리태니커 백과사전 기재 기준으로, 세계에서 가장 긴 강은?",
          choices: ["나일강", "아마존강", "양쯔강", "미시시피강"],
          answer: 0,
          explanation: "측정 방식에 따라 아마존강을 더 길게 보는 자료도 있어 답이 갈린다.",
          source: { name: "Encyclopaedia Britannica 「Nile River」", url: "https://www.britannica.com/place/Nile-River" },
          verifiedAt: "2026-10-08"
        },
        {
          id: "wg-02",
          text: "다음 네 나라 중 적도가 지나는 나라는?",
          choices: ["에콰도르", "페루", "칠레", "볼리비아"],
          answer: 0,
          explanation: "나머지 세 나라는 모두 적도 남쪽에 있다.",
          source: { name: "Encyclopaedia Britannica 「Ecuador」", url: "https://www.britannica.com/place/Ecuador" },
          verifiedAt: "2026-10-08"
        },
        {
          id: "wg-03",
          text: "2026년 브리태니커 백과사전 기재 기준으로, 해발고도가 가장 높은 산은?",
          choices: ["에베레스트산", "K2", "칸첸중가", "킬리만자로산"],
          answer: 0,
          explanation: "2020년 네팔과 중국이 공동 측량으로 8,848.86m라고 발표했다.",
          source: { name: "Encyclopaedia Britannica 「Mount Everest」", url: "https://www.britannica.com/place/Mount-Everest" },
          verifiedAt: "2026-10-08"
        },
        {
          id: "wg-04",
          text: "오스트레일리아의 수도는?",
          choices: ["캔버라", "시드니", "멜버른", "브리즈번"],
          answer: 0,
          explanation: "시드니에서 남서쪽으로 약 240km 떨어진 수도특별지역에 있다.",
          source: { name: "Encyclopaedia Britannica 「Canberra」", url: "https://www.britannica.com/place/Canberra" },
          verifiedAt: "2026-10-08"
        },
        {
          id: "wg-05",
          text: "2026년 브리태니커 백과사전 기재 기준으로, 국토 면적이 가장 넓은 나라는?",
          choices: ["러시아", "캐나다", "중국", "미국"],
          answer: 0,
          explanation: "유럽 동부와 아시아 북부에 걸쳐 있다.",
          source: { name: "Encyclopaedia Britannica 「Russia」", url: "https://www.britannica.com/place/Russia" },
          verifiedAt: "2026-10-08"
        },
        {
          id: "wg-06",
          text: "2026년 브리태니커 백과사전 기재 기준으로, 최대 수심이 가장 깊은 호수는?",
          choices: ["바이칼호", "탕가니카호", "말라위호", "슈피리어호"],
          answer: 0,
          explanation: "러시아 시베리아 남부에 있으며 수심 값은 자료마다 다르게 적는다.",
          source: { name: "Encyclopaedia Britannica 「Lake Baikal」", url: "https://www.britannica.com/place/Lake-Baikal" },
          verifiedAt: "2026-10-08"
        },
        {
          id: "wg-07",
          text: "나일강이 흘러드는 바다는?",
          choices: ["지중해", "홍해", "아라비아해", "흑해"],
          answer: 0,
          explanation: "적도 남쪽에서 시작해 북쪽으로 흘러 지중해로 들어간다.",
          source: { name: "Encyclopaedia Britannica 「Nile River」", url: "https://www.britannica.com/place/Nile-River" },
          verifiedAt: "2026-10-08"
        },
        {
          id: "wg-08",
          text: "사하라 사막이 있는 대륙은?",
          choices: ["아프리카", "아시아", "남아메리카", "오세아니아"],
          answer: 0,
          explanation: "아프리카 북부 대부분에 걸쳐 있다.",
          source: { name: "Encyclopaedia Britannica 「Sahara」", url: "https://www.britannica.com/place/Sahara-desert-Africa" },
          verifiedAt: "2026-10-08"
        },
        {
          id: "wg-09",
          text: "이스탄불이 걸쳐 있는 두 대륙은?",
          choices: ["유럽과 아시아", "유럽과 아프리카", "아시아와 아프리카", "유럽과 북아메리카"],
          answer: 0,
          explanation: "보스포루스 해협을 사이에 두고 유럽과 아시아에 걸쳐 있다.",
          source: { name: "Encyclopaedia Britannica 「Istanbul」", url: "https://www.britannica.com/place/Istanbul" },
          verifiedAt: "2026-10-08"
        },
        {
          id: "wg-10",
          text: "2026년 브리태니커 백과사전 기재 기준으로, 면적이 가장 넓은 대양은?",
          choices: ["태평양", "대서양", "인도양", "북극해"],
          answer: 0,
          explanation: "지구 표면의 약 3분의 1을 차지한다.",
          source: { name: "Encyclopaedia Britannica 「Pacific Ocean」", url: "https://www.britannica.com/place/Pacific-Ocean" },
          verifiedAt: "2026-10-08"
        }
      ]
    },
    {
      id: "science",
      name: "과학",
      questions: [
        {
          id: "sc-01",
          text: "2026년 브리태니커 백과사전 기재 기준으로, 건조 공기의 부피에서 가장 많은 비율을 차지하는 기체는?",
          choices: ["질소", "산소", "아르곤", "이산화탄소"],
          answer: 0,
          explanation: "질소가 약 78.08%, 산소가 약 20.95%를 차지한다.",
          source: { name: "Encyclopaedia Britannica 「Atmosphere」", url: "https://www.britannica.com/science/atmosphere" },
          verifiedAt: "2026-10-08"
        },
        {
          id: "sc-02",
          text: "1983년에 고정된 빛의 속력 정의값 기준으로, 진공에서 빛이 1초 동안 가는 거리에 가장 가까운 값은?",
          choices: ["3천 km", "3만 km", "30만 km", "300만 km"],
          answer: 2,
          explanation: "진공에서의 빛의 속력은 299,792,458 m/s로 정의되어 있다.",
          source: { name: "Encyclopaedia Britannica 「Speed of light」", url: "https://www.britannica.com/science/speed-of-light" },
          verifiedAt: "2026-10-08"
        },
        {
          id: "sc-03",
          text: "물 분자의 화학식은?",
          choices: ["H2O", "CO2", "O2", "NaCl"],
          answer: 0,
          explanation: "수소 원자 2개와 산소 원자 1개로 이루어져 있다.",
          source: { name: "Encyclopaedia Britannica 「Water」", url: "https://www.britannica.com/science/water" },
          verifiedAt: "2026-10-08"
        },
        {
          id: "sc-04",
          text: "2026년 NASA 자료 기준으로, 태양과의 평균 거리가 가장 가까운 행성은?",
          choices: ["수성", "금성", "지구", "화성"],
          answer: 0,
          explanation: "태양 둘레를 약 88일 만에 한 바퀴 돈다.",
          source: { name: "NASA Science 「Mercury」", url: "https://science.nasa.gov/mercury/" },
          verifiedAt: "2026-10-08"
        },
        {
          id: "sc-05",
          text: "혈액에서 산소를 실어 나르는 단백질은?",
          choices: ["헤모글로빈", "인슐린", "콜라겐", "케라틴"],
          answer: 0,
          explanation: "적혈구 안에서 폐의 산소를 온몸 조직으로 옮긴다.",
          source: { name: "Encyclopaedia Britannica 「Hemoglobin」", url: "https://www.britannica.com/science/hemoglobin" },
          verifiedAt: "2026-10-08"
        },
        {
          id: "sc-06",
          text: "원소기호가 Fe인 원소는?",
          choices: ["철", "납", "주석", "구리"],
          answer: 0,
          explanation: "라틴어 이름 ferrum 에서 기호를 따왔다.",
          source: { name: "Encyclopaedia Britannica 「Iron」", url: "https://www.britannica.com/science/iron-chemical-element" },
          verifiedAt: "2026-10-08"
        },
        {
          id: "sc-07",
          text: "녹색식물이 빛 에너지로 양분을 만드는 과정은?",
          choices: ["광합성", "호흡", "발효", "증산"],
          answer: 0,
          explanation: "빛 에너지로 이산화탄소와 물에서 당을 만들고 산소를 내놓는다.",
          source: { name: "Encyclopaedia Britannica 「Photosynthesis」", url: "https://www.britannica.com/science/photosynthesis" },
          verifiedAt: "2026-10-08"
        },
        {
          id: "sc-08",
          text: "DNA의 이중나선 구조를 제안한 사람은?",
          choices: ["왓슨과 크릭", "멘델과 모건", "다윈과 월리스", "파스퇴르와 코흐"],
          answer: 0,
          explanation: "제임스 왓슨과 프랜시스 크릭이 제안한 구조다.",
          source: { name: "Encyclopaedia Britannica 「DNA」", url: "https://www.britannica.com/science/DNA" },
          verifiedAt: "2026-10-08"
        },
        {
          id: "sc-09",
          text: "2026년 미국 지질조사국(USGS) 자료 기준으로, 지구 표면에서 물이 덮고 있는 비율에 가장 가까운 값은?",
          choices: ["약 31%", "약 51%", "약 71%", "약 91%"],
          answer: 2,
          explanation: "지구 표면의 약 71%가 물로 덮여 있다.",
          source: { name: "U.S. Geological Survey 「How Much Water is There on Earth?」", url: "https://www.usgs.gov/water-science-school/science/how-much-water-there-earth" },
          verifiedAt: "2026-10-08"
        },
        {
          id: "sc-10",
          text: "국제단위계(SI)에서 전류의 단위는?",
          choices: ["암페어", "볼트", "와트", "옴"],
          answer: 0,
          explanation: "기호는 A 이고, 기본전하 e 의 값을 고정해 정의한다.",
          source: { name: "BIPM 「SI base unit: ampere」", url: "https://www.bipm.org/en/si-base-units/ampere" },
          verifiedAt: "2026-10-08"
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
          explanation: "1889년 생레미에서 그렸고 뉴욕 현대미술관이 소장하고 있다.",
          source: { name: "The Museum of Modern Art 「The Starry Night」", url: "https://www.moma.org/collection/works/79802" },
          verifiedAt: "2026-10-08"
        },
        {
          id: "ac-02",
          text: "그림 〈모나리자〉를 그린 화가는?",
          choices: ["레오나르도 다 빈치", "미켈란젤로", "라파엘로", "산드로 보티첼리"],
          answer: 0,
          explanation: "리자 게라르디니를 그린 초상으로 루브르박물관이 소장하고 있다.",
          source: { name: "Musée du Louvre 「La Joconde」", url: "https://collections.louvre.fr/en/ark:/53355/cl010062370" },
          verifiedAt: "2026-10-08"
        },
        {
          id: "ac-03",
          text: "그림 〈진주 귀고리를 한 소녀〉를 그린 화가는?",
          choices: ["요하네스 페르메이르", "렘브란트 반 레인", "페테르 파울 루벤스", "안토니 반 다이크"],
          answer: 0,
          explanation: "네덜란드 헤이그의 마우리츠하위스가 소장하고 있다.",
          source: { name: "Mauritshuis 「Girl with a Pearl Earring」", url: "https://www.mauritshuis.nl/en/our-collection/artworks/670-girl-with-a-pearl-earring" },
          verifiedAt: "2026-10-08"
        },
        {
          id: "ac-04",
          text: "조각 〈생각하는 사람〉을 만든 조각가는?",
          choices: ["오귀스트 로댕", "카미유 클로델", "알베르토 자코메티", "콩스탕탱 브랑쿠시"],
          answer: 0,
          explanation: "프랑스 조각가 로댕의 대표작이다.",
          source: { name: "Encyclopaedia Britannica 「The Thinker」", url: "https://www.britannica.com/topic/The-Thinker-sculpture-by-Rodin" },
          verifiedAt: "2026-10-08"
        },
        {
          id: "ac-05",
          text: "그림 〈게르니카〉를 그린 화가는?",
          choices: ["파블로 피카소", "살바도르 달리", "호안 미로", "프란시스코 고야"],
          answer: 0,
          explanation: "1937년에 그린 흑백 유화로 마드리드 레이나 소피아 미술관이 소장하고 있다.",
          source: { name: "Encyclopaedia Britannica 「Guernica」", url: "https://www.britannica.com/topic/Guernica-by-Picasso" },
          verifiedAt: "2026-10-08"
        },
        {
          id: "ac-06",
          text: "베토벤 교향곡 9번의 별칭은?",
          choices: ["합창", "영웅", "운명", "전원"],
          answer: 0,
          explanation: "4악장에 합창과 독창이 들어가 합창 교향곡으로 불린다.",
          source: { name: "Encyclopaedia Britannica 「Symphony No. 9 in D Minor, Op. 125」", url: "https://www.britannica.com/topic/Symphony-No-9-in-D-Minor" },
          verifiedAt: "2026-10-08"
        },
        {
          id: "ac-07",
          text: "오페라 〈마술피리〉를 작곡한 사람은?",
          choices: ["모차르트", "베토벤", "바흐", "하이든"],
          answer: 0,
          explanation: "1791년 빈 근교에서 초연된 모차르트의 마지막 오페라다.",
          source: { name: "Encyclopaedia Britannica 「The Magic Flute」", url: "https://www.britannica.com/topic/The-Magic-Flute" },
          verifiedAt: "2026-10-08"
        },
        {
          id: "ac-08",
          text: "판소리에서 북을 치며 장단을 맞추는 사람은?",
          choices: ["고수", "명창", "광대", "재담꾼"],
          answer: 0,
          explanation: "소리를 하는 사람은 명창, 북을 치는 사람은 고수라고 한다.",
          source: { name: "한국민족문화대백과사전 「고수」", url: "https://encykorea.aks.ac.kr/Article/E0003767" },
          verifiedAt: "2026-10-08"
        },
        {
          id: "ac-09",
          text: "사물놀이에서 꽹과리·장구·북과 함께 쓰이는 나머지 한 악기는?",
          choices: ["징", "가야금", "해금", "아쟁"],
          answer: 0,
          explanation: "사물놀이는 꽹과리·징·장구·북 네 가지 농악기로 연주한다.",
          source: { name: "한국민족문화대백과사전 「사물놀이」", url: "https://encykorea.aks.ac.kr/Article/E0025605" },
          verifiedAt: "2026-10-08"
        },
        {
          id: "ac-10",
          text: "조선 왕실이 종묘 제사에서 연주하던 음악은?",
          choices: ["종묘제례악", "수제천", "영산회상", "가곡"],
          answer: 0,
          explanation: "2001년 유네스코 인류구전 및 무형유산 걸작으로 선정됐다.",
          source: { name: "한국민족문화대백과사전 「종묘제례악」", url: "https://encykorea.aks.ac.kr/Article/E0052934" },
          verifiedAt: "2026-10-08"
        }
      ]
    }
  ]
};
