import { createContext, useContext } from 'react';
import { additionalExperience, certifications, education, experience, journey, projects, researchAreas, topSkills } from './data';

export type Lang = 'en' | 'ko' | 'hi';

export const languages: { code: Lang; label: string; short: string }[] = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ko', label: '한국어', short: '한' },
  { code: 'hi', label: 'हिन्दी', short: 'हि' },
];

const STORAGE_KEY = 'lakshy-lang';
const isLang = (value: unknown): value is Lang => languages.some((language) => language.code === value);

/* ?lang= in the URL wins, then the visitor's last choice, then their browser language. */
export function initialLang(): Lang {
  const fromUrl = new URLSearchParams(window.location.search).get('lang');
  if (isLang(fromUrl)) return fromUrl;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isLang(stored)) return stored;
  } catch { /* Storage can be unavailable; fall through. */ }
  const browser = (navigator.languages ?? [navigator.language]).map((tag) => tag.slice(0, 2).toLowerCase()).find(isLang);
  return browser ?? 'en';
}

export function rememberLang(lang: Lang) {
  try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* The choice still applies for this visit. */ }
  // Keep a shared ?lang= link in step with the choice, so a reload does not undo it.
  const url = new URL(window.location.href);
  if (url.searchParams.has('lang') && url.searchParams.get('lang') !== lang) {
    url.searchParams.set('lang', lang);
    window.history.replaceState(window.history.state, '', url);
  }
}

/* Hangul and Devanagari need their own faces; they are only fetched when that language is picked. */
const fontSheets: Partial<Record<Lang, string>> = {
  ko: 'https://fonts.googleapis.com/css2?family=Gaegu:wght@400&family=Noto+Sans+KR:wght@400;600&family=Noto+Serif+KR:wght@400;500&display=swap',
  hi: 'https://fonts.googleapis.com/css2?family=Kalam:wght@400&family=Noto+Sans+Devanagari:wght@400;600&family=Noto+Serif+Devanagari:wght@400;500&display=swap',
};

export function loadFonts(lang: Lang) {
  const href = fontSheets[lang];
  if (!href || document.querySelector(`link[data-lang-fonts="${lang}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.dataset.langFonts = lang;
  document.head.appendChild(link);
}

type ProjectText = { title: string; category: string; summary: string; problem: string; approach: string; methods: string[]; limitations: string; imageAlt: string };
type Heading = readonly [plain: string, emphasis: string];
/* A topic links to a project page when it has one, otherwise it opens an email with the topic as subject. */
type Topic = { text: string; project?: string };

const en = {
  meta: {
    title: 'Lakshy Chaudhary — AI, Neuro AI & Robotics',
    description: 'Lakshy Chaudhary is a GKS PhD scholar at Kunsan National University exploring Neuro AI, brain imaging, robotics, computer vision, and machine learning.',
    ogLocale: 'en_US',
  },
  nav: {
    work: 'Work', about: 'About', experience: 'Experience', research: 'Research', journey: 'Journey', sayHello: 'Say hello',
    label: 'Main navigation', menu: 'Menu', close: 'Close', toLight: 'Switch to light theme', toDark: 'Switch to dark theme',
    language: 'Language', skip: 'Skip to content', home: 'Lakshy Chaudhary, home',
  },
  hero: {
    hello: 'Hi, I’m Lucky —',
    title: ['I build AI systems that ', 'see, reason,', ' and act.'] as readonly [string, string, string],
    intro: 'I’m Lakshy Chaudhary, a PhD scholar in Artificial Intelligence at Kunsan National University in South Korea. These days I spend most of my time with brain imaging data — EEG, fMRI and the signals in between — and the rest wondering how machines could perceive and act a little more like we do.',
    cta: 'See what I’m working on', sayHello: 'or just say hello',
    photoAlt: 'Lakshy Chaudhary standing by a seaside railing on a sunny day',
    caption: 'out by the sea, on a good day',
    facts: [['Currently', 'PhD, Artificial Intelligence'], ['Lab', 'AI Convergence Lab, Prof. Han-Gue Jo'], ['Focus', 'Brain imaging & Neuro AI'], ['Supported by', 'Global Korea Scholarship']] as [string, string][],
    year: (year: number) => `year ${year} of the PhD · expected 2028`,
  },
  marquee: { pause: 'Pause the moving list', play: 'Play the moving list' },
  process: {
    eyebrow: 'How I think about it', title: ['From seeing ', 'to doing.'] as Heading,
    lede: 'Most of the systems I find interesting move through the same small loop: look at the world, make sense of it, then do something about it.',
    steps: [
      { title: 'Observe', theme: 'Perception', detail: 'Take in camera observations and make sense of the scene.' },
      { title: 'Approach', theme: 'Reasoning', detail: 'Relate an instruction to objects and possible actions.' },
      { title: 'Grasp', theme: 'Action', detail: 'Translate an intention into a physical interaction.' },
      { title: 'Place', theme: 'Action', detail: 'Complete the sequence with a deliberate placement.' },
    ],
    note: 'A way of framing the research, not a summary of results.',
  },
  work: {
    eyebrow: 'Selected work', title: ['Questions worth ', 'getting hands-on with.'] as Heading,
    lede: 'Three ongoing projects across embodied AI, perception and patterns in messy real-world data.',
    number: 'No.', methods: 'Methods', read: 'Read about the project', credit: 'Stock photo · Unsplash', view: 'View', ongoing: 'Ongoing',
  },
  locale: 'en-US',
  time: { label: 'Local time in Gunsan', zone: 'KST', cta: 'Let’s talk', ctaEm: 'about it.' },
  explorer: {
    eyebrow: 'Index', title: 'Everything, in one list', period: '.', lede: 'Search by theme or method.',
    search: 'Search projects', placeholder: 'Try “segmentation” or “temporal”', filter: 'Filter projects by category', all: 'All',
    found: (count: number) => `${count} ${count === 1 ? 'project' : 'projects'} found`,
    empty: 'Nothing matches that yet.', clear: 'Clear the search',
    ongoing: 'All of these are ongoing — work in progress, not finished results.',
  },
  about: {
    photoAlt: 'Lakshy Chaudhary by the sea', caption: 'that’s me ↑ (also answers to “Lucky”)',
    eyebrow: 'A little about me', title: ['Research that doesn’t stop at ', 'the screen.'] as Heading,
    lead: 'I’m originally from Meerut, India. I studied computer science at the Central University of Rajasthan, and now live in Gunsan, South Korea, where I’m doing my PhD as a Global Korea Scholarship scholar.',
    body: [
      'My doctoral work sits in the AI Convergence Lab under Professor Han-Gue Jo, looking at brain imaging data — EEG and fMRI — through deep learning and cognitive signal processing, as part of interdisciplinary neurotechnology and mental-health research.',
      'Outside of that, I keep coming back to robots that can pick things up, computer vision, vision-language models, and machine learning that’s useful in the real world.',
    ],
    experienceLink: 'Experience & education', contactLink: 'Start a conversation',
  },
  career: {
    eyebrow: 'Experience & education', title: ['A path through ', 'people and ideas.'] as Heading,
    experience: 'Experience', now: 'now', education: 'Education', certificates: 'Certificates', also: 'Also',
  },
  research: {
    eyebrow: 'Research & toolkit', title: ['Curiosity, with ', 'room to move.'] as Heading,
    lede: 'My doctoral work is on brain imaging data — EEG and fMRI — in the AI Convergence Lab. Alongside it I keep up broader interests in robots, vision and applied machine learning.',
    focus: 'Doctoral focus', interests: 'Broader interests', publications: 'Publications & notes',
    publicationNote: 'Nothing to list yet — papers and field notes will appear here once there’s something confirmed to share.',
  },
  journeySection: {
    eyebrow: 'Research journey', title: ['Still ', 'becoming.'] as Heading,
    lede: 'A few coordinates so far — from Meerut, through Rajasthan, Pilani and Coimbatore, then a long flight to Gunsan.',
  },
  contact: {
    eyebrow: 'Get in touch', title: ['Have a good ', 'question?'] as Heading,
    intro: 'I’m always happy to hear from people thinking about intelligent systems, brains, robots — or just about doing a PhD in Korea. My inbox is open.',
    topicsLabel: 'Good things to write to me about',
    topics: [
      { text: 'Brain imaging data — EEG, fMRI and cognitive signal processing' },
      { text: 'Robot manipulation with vision-language models', project: 'vision-guided-robot-manipulation' },
      { text: 'Facial action units and how expressions change over time', project: 'facial-expression-analysis' },
      { text: 'Event data and early-warning signals', project: 'worldripple' },
      { text: 'Doing a PhD in Korea on a Global Korea Scholarship' },
    ] as Topic[],
    write: 'Write me an email', copied: 'Copied — talk soon!', copyHint: 'click to copy', tapHint: 'tap to copy', copyLabel: 'Copy email address', signoff: '— Lucky',
  },
  footer: { place: 'Gunsan, South Korea', email: 'Email', label: 'Footer', top: 'Back to top', topLabel: 'Back to top' },
  detail: {
    all: 'All projects', status: 'Status', ongoing: 'Ongoing', ongoingText: 'Work in progress. More detail will follow as the work develops and there’s confirmed information to share.',
    photoNote: 'Representative stock photo, not project media.',
    question: 'The question', approach: 'Approach', methods: 'Methods', related: 'Related research areas',
    limitations: 'Limitations', code: 'Code', paper: 'Paper', previous: 'Previous', next: 'Next', others: 'More projects',
    mailSubject: (title: string) => `About ${title}`,
  },
  notFound: { eyebrow: 'Project not found', title: ['That page isn’t ', 'in the index.'] as Heading, back: 'Back to projects' },
  categories: Object.fromEntries(projects.map((project) => [project.category, project.category])) as Record<string, string>,
  projects: Object.fromEntries(projects.map(({ slug, title, category, summary, problem, approach, methods, limitations, imageAlt }) => [slug, { title, category, summary, problem, approach, methods, limitations, imageAlt }])) as Record<string, ProjectText>,
  researchAreas,
  skillGroups: [
    { title: 'Neuro AI', items: ['Brain imaging data', 'EEG / fMRI', 'Cognitive signal processing', 'Deep learning'] },
    { title: 'Perception', items: ['Computer vision', 'Vision-language models', 'Segmentation', 'Facial action units'] },
    { title: 'Action & modeling', items: ['Robot manipulation', 'Camera observations', 'Temporal modeling', 'Event data', 'Applied machine learning'] },
    { title: 'Also', items: topSkills },
  ],
  journey,
  experience,
  additionalExperience,
  education,
  certifications,
};

export type Dictionary = typeof en;

const ko: Dictionary = {
  meta: {
    title: 'Lakshy Chaudhary — AI, 뉴로 AI & 로보틱스',
    description: 'Lakshy Chaudhary는 국립군산대학교의 한국정부초청장학생(GKS) 박사과정생으로, 뉴로 AI, 뇌 영상, 로보틱스, 컴퓨터 비전, 머신러닝을 탐구합니다.',
    ogLocale: 'ko_KR',
  },
  nav: {
    work: '작업', about: '소개', experience: '경력', research: '연구', journey: '여정', sayHello: '연락하기',
    label: '주 메뉴', menu: '메뉴', close: '닫기', toLight: '밝은 테마로 전환', toDark: '어두운 테마로 전환',
    language: '언어', skip: '본문으로 건너뛰기', home: 'Lakshy Chaudhary, 홈',
  },
  hero: {
    hello: '안녕하세요, 럭키예요 —',
    title: ['저는 ', '보고, 추론하고,', ' 행동하는 AI 시스템을 만듭니다.'],
    intro: '저는 대한민국 국립군산대학교에서 인공지능을 전공하는 박사과정생 Lakshy Chaudhary입니다. 요즘은 대부분의 시간을 EEG, fMRI 같은 뇌 영상 데이터, 그리고 그 사이의 신호들과 함께 보내고, 나머지 시간에는 기계가 어떻게 하면 조금 더 우리처럼 지각하고 행동할 수 있을지 고민합니다.',
    cta: '진행 중인 연구 보기', sayHello: '아니면 편하게 인사하기',
    photoAlt: '화창한 날 바닷가 난간 옆에 서 있는 Lakshy Chaudhary',
    caption: '날 좋은 날, 바닷가에서',
    facts: [['현재', '인공지능 박사과정'], ['연구실', 'AI Convergence Lab, Han-Gue Jo 교수님'], ['관심 분야', '뇌 영상 & 뉴로 AI'], ['지원', '한국정부초청장학금(GKS)']],
    year: (year: number) => `박사과정 ${year}년차 · 2028년 졸업 예정`,
  },
  marquee: { pause: '움직이는 목록 멈추기', play: '움직이는 목록 재생하기' },
  process: {
    eyebrow: '제가 생각하는 방식', title: ['보는 것에서 ', '행동으로.'],
    lede: '제가 흥미롭게 여기는 시스템들은 대부분 같은 작은 고리를 따라 움직입니다. 세상을 보고, 이해하고, 그다음 무언가를 합니다.',
    steps: [
      { title: '관찰', theme: '지각', detail: '카메라로 본 정보를 받아들여 장면을 이해합니다.' },
      { title: '접근', theme: '추론', detail: '지시를 사물과 가능한 행동에 연결합니다.' },
      { title: '잡기', theme: '행동', detail: '의도를 물리적인 상호작용으로 옮깁니다.' },
      { title: '놓기', theme: '행동', detail: '의도한 위치에 내려놓으며 동작을 마무리합니다.' },
    ],
    note: '연구를 바라보는 하나의 틀이며, 결과 요약이 아닙니다.',
  },
  work: {
    eyebrow: '주요 작업', title: ['직접 ', '파고들 만한 질문들.'],
    lede: '체화된 AI, 지각, 그리고 복잡한 실제 데이터 속 패턴에 걸친 세 가지 진행 중인 프로젝트입니다.',
    number: 'No.', methods: '방법', read: '프로젝트 자세히 보기', credit: '스톡 사진 · Unsplash', view: '보기', ongoing: '진행 중',
  },
  locale: 'ko-KR',
  time: { label: '군산 현지 시각', zone: 'KST', cta: '함께', ctaEm: '이야기해요.' },
  explorer: {
    eyebrow: '색인', title: '모든 프로젝트를 한 목록에', period: '.', lede: '주제나 방법으로 검색해 보세요.',
    search: '프로젝트 검색', placeholder: '예: “세그멘테이션”, “시계열”', filter: '카테고리별 프로젝트 필터', all: '전체',
    found: (count: number) => `프로젝트 ${count}개를 찾았어요`,
    empty: '아직 일치하는 항목이 없어요.', clear: '검색 지우기',
    ongoing: '모두 진행 중인 프로젝트예요. 완성된 결과가 아니라 아직 다듬어 가는 작업이에요.',
  },
  about: {
    photoAlt: '바닷가의 Lakshy Chaudhary', caption: '저예요 ↑ (“럭키”라고 불러도 돼요)',
    eyebrow: '저에 대해 조금', title: ['화면 밖으로 ', '나아가는 연구.'],
    lead: '저는 인도 메루트 출신입니다. 라자스탄 중앙대학교에서 컴퓨터 과학을 공부했고, 지금은 대한민국 군산에 살며 한국정부초청장학생(GKS)으로 박사과정을 밟고 있습니다.',
    body: [
      '박사 연구는 Han-Gue Jo 교수님의 AI Convergence Lab에서 진행하고 있습니다. 학제 간 뉴로테크놀로지 및 정신건강 연구의 일환으로, 딥러닝과 인지 신호 처리를 통해 EEG와 fMRI 같은 뇌 영상 데이터를 살펴봅니다.',
      '그 밖에도 물건을 집을 수 있는 로봇, 컴퓨터 비전, 비전-언어 모델, 그리고 실제 세상에서 쓸모 있는 머신러닝에 자꾸 마음이 갑니다.',
    ],
    experienceLink: '경력 & 학력', contactLink: '대화 시작하기',
  },
  career: {
    eyebrow: '경력 & 학력', title: ['사람과 아이디어를 ', '만나며 걸어온 길.'],
    experience: '경력', now: '지금', education: '학력', certificates: '수료증', also: '그 외',
  },
  research: {
    eyebrow: '연구 & 도구', title: ['호기심, 그리고 ', '자유로운 탐구.'],
    lede: '박사 연구에서는 AI Convergence Lab에서 EEG와 fMRI 같은 뇌 영상 데이터를 다룹니다. 그와 함께 로봇, 비전, 응용 머신러닝에도 꾸준히 관심을 두고 있습니다.',
    focus: '박사 연구 주제', interests: '더 넓은 관심사', publications: '논문 & 노트',
    publicationNote: '아직 올릴 내용은 없어요 — 확정된 논문이나 연구 노트가 생기면 여기에 추가할게요.',
  },
  journeySection: {
    eyebrow: '연구 여정', title: ['아직 ', '성장하는 중.'],
    lede: '지금까지의 몇 가지 좌표 — 메루트에서 라자스탄, 필라니, 코임바토르를 거쳐, 군산까지의 긴 비행.',
  },
  contact: {
    eyebrow: '연락하기', title: ['좋은 ', '질문이 있나요?'],
    intro: '지능형 시스템, 뇌, 로봇에 대해 고민하는 분들 — 혹은 한국에서의 박사과정이 궁금한 분들의 이야기는 언제나 반가워요. 메일함은 늘 열려 있어요.',
    topicsLabel: '이런 이야기라면 언제든 환영해요',
    topics: [
      { text: '뇌 영상 데이터 — EEG, fMRI, 인지 신호 처리' },
      { text: '비전-언어 모델을 활용한 로봇 매니퓰레이션', project: 'vision-guided-robot-manipulation' },
      { text: '얼굴 행동 단위와 시간에 따른 표정 변화', project: 'facial-expression-analysis' },
      { text: '이벤트 데이터와 조기 경보 신호', project: 'worldripple' },
      { text: '한국정부초청장학금(GKS)으로 한국에서 박사과정 하기' },
    ],
    write: '이메일 보내기', copied: '복사했어요 — 곧 이야기해요!', copyHint: '클릭해서 복사', tapHint: '탭해서 복사', copyLabel: '이메일 주소 복사', signoff: '— 럭키',
  },
  footer: { place: '대한민국 군산', email: '이메일', label: '바닥글', top: '맨 위로', topLabel: '맨 위로' },
  detail: {
    all: '모든 프로젝트', status: '상태', ongoing: '진행 중', ongoingText: '아직 진행 중인 작업이에요. 작업이 진전되고 공유할 수 있는 확정된 정보가 생기면 내용을 더 추가할게요.',
    photoNote: '프로젝트 자료가 아닌 참고용 스톡 사진입니다.',
    question: '질문', approach: '접근 방식', methods: '방법', related: '관련 연구 분야',
    limitations: '한계', code: '코드', paper: '논문', previous: '이전', next: '다음', others: '다른 프로젝트',
    mailSubject: (title: string) => `${title} 관련 문의`,
  },
  notFound: { eyebrow: '프로젝트를 찾을 수 없어요', title: ['그 페이지는 ', '색인에 없어요.'], back: '프로젝트로 돌아가기' },
  categories: { Robotics: '로보틱스', 'Computer vision': '컴퓨터 비전', 'Applied AI': '응용 AI' },
  projects: {
    'vision-guided-robot-manipulation': {
      title: '비전 기반 로봇 매니퓰레이션', category: '로보틱스',
      summary: 'FR5 로봇 매니퓰레이션을 위해 언어로 주어진 의도와 시각 관측을 연결합니다.',
      problem: '로봇의 이해가 카메라로 관측한 것에 근거해야 할 때, 로봇은 어떻게 작업을 수행할 수 있을까?',
      approach: '이 진행 중인 프로젝트는 비전-언어 모델, 세그멘테이션, 카메라 관측을 활용한 FR5 매니퓰레이션을 탐구합니다.',
      methods: ['FR5 로봇 매니퓰레이션', '비전-언어 모델', '세그멘테이션', '카메라 관측'],
      limitations: '',
      imageAlt: '푸른 조명의 실험실, 유리 너머에서 작동하는 자동 그리퍼',
    },
    'facial-expression-analysis': {
      title: '얼굴 표정 분석', category: '컴퓨터 비전',
      summary: '다양한 감정 조건에서 얼굴 행동 단위(AU)의 동역학을 연구합니다.',
      problem: '얼굴 표정은 시간에 따라 펼쳐집니다. 그렇다면 감정 조건에 따라 행동 단위의 동역학은 어떻게 달라질까?',
      approach: '감정 조건에 따른 얼굴 행동 단위 동역학에 대한 진행 중인 분석입니다.',
      methods: ['얼굴 행동 단위(AU)', '시계열 동역학', '감정 조건'],
      limitations: '',
      imageAlt: '두 손으로 얼굴을 감싼 채 놀라고 기뻐하는 표정의 여성',
    },
    worldripple: {
      title: 'WorldRipple', category: '응용 AI',
      summary: '이벤트 데이터와 시계열 모델링으로 지정학적 조기 경보 신호를 탐구합니다.',
      problem: '시간에 따라 모델링한 이벤트 데이터 패턴의 변화가 지정학적 변화의 조기 경보 신호가 될 수 있을까?',
      approach: '이 진행 중인 프로젝트는 이벤트 데이터와 시계열 모델링을 활용해 조기 경보 신호를 탐구합니다.',
      methods: ['이벤트 데이터', '시계열 모델링', '조기 경보 신호'],
      limitations: '',
      imageAlt: '어두운 나무 탁자 위에 펼쳐진 조간신문들',
    },
  },
  researchAreas: ['뉴로 AI & 뇌 영상', '인지 신호 처리', 'AI & 응용 머신러닝', '로봇 매니퓰레이션', '컴퓨터 비전', '비전-언어 모델'],
  skillGroups: [
    { title: '뉴로 AI', items: ['뇌 영상 데이터', 'EEG / fMRI', '인지 신호 처리', '딥러닝'] },
    { title: '지각', items: ['컴퓨터 비전', '비전-언어 모델', '세그멘테이션', '얼굴 행동 단위(AU)'] },
    { title: '행동 & 모델링', items: ['로봇 매니퓰레이션', '카메라 관측', '시계열 모델링', '이벤트 데이터', '응용 머신러닝'] },
    { title: '그 외', items: ['학술 연구', '교육 연구', 'Amazon DynamoDB'] },
  ],
  journey: [
    { date: '', title: '인도 메루트', detail: '제가 태어나고 자란 곳.' },
    { date: '2019년 6월 ~ 2024년 6월', title: '인도 라자스탄', detail: '라자스탄 중앙대학교에서 컴퓨터 과학 학·석사 통합과정(Integrated M.Sc.).' },
    { date: '2023년 6월 ~ 7월', title: '인도 필라니', detail: 'BITS Pilani에서 하계 프로젝트 인턴십.' },
    { date: '2024년 1월 ~ 5월', title: '인도 코임바토르', detail: 'Amrita Vishwa Vidyapeetham에서 프로젝트 인턴십.' },
    { date: '2024년 9월 ~ 현재', title: '대한민국 군산', detail: '국립군산대학교 어학 과정에서 1년을 보낸 뒤, 2025년 9월부터 한국정부초청장학생(GKS)으로 인공지능 박사과정을 밟고 있습니다.' },
  ],
  experience: [
    {
      organization: '국립군산대학교', role: '박사과정생', date: '2025년 9월 ~ 현재', location: '대한민국 군산',
      detail: 'Han-Gue Jo 교수님의 지도 아래 AI Convergence Lab에서 인공지능(뇌 영상 데이터 / 뉴로 AI) 박사과정을 밟고 있습니다. EEG/fMRI를 포함한 뇌 영상 데이터, 딥러닝, 인지 신호 처리를 중심으로 학제 간 뉴로테크놀로지 및 정신건강 연구를 하고 있습니다.',
    },
    { organization: '국립군산대학교', role: '어학연수생', date: '2024년 9월 ~ 2025년 9월', location: '대한민국 군산', detail: '' },
    { organization: 'Amrita Vishwa Vidyapeetham', role: '프로젝트 인턴', date: '2024년 1월 ~ 2024년 5월', location: '인도 코임바토르', detail: '' },
    { organization: 'Birla Institute of Technology and Science, Pilani', role: '하계 프로젝트 인턴', date: '2023년 6월 ~ 2023년 7월', location: '인도 라자스탄', detail: '' },
  ],
  additionalExperience: [{ organization: 'GDSC WOW', role: '인턴십', date: '' }],
  education: [
    { institution: '국립군산대학교', qualification: '인공지능 박사(Ph.D.)', date: '2025년 9월 ~ 2028년 6월(졸업 예정)', location: '대한민국 군산' },
    { institution: '라자스탄 중앙대학교', qualification: '컴퓨터 과학 학·석사 통합과정(Integrated M.Sc.)', date: '2019년 6월 ~ 2024년 6월', location: '인도' },
  ],
  certifications,
};

const hi: Dictionary = {
  meta: {
    title: 'Lakshy Chaudhary — AI, न्यूरो AI और रोबोटिक्स',
    description: 'Lakshy Chaudhary कुनसान नेशनल यूनिवर्सिटी में GKS PhD स्कॉलर हैं, जो न्यूरो AI, ब्रेन इमेजिंग, रोबोटिक्स, कंप्यूटर विज़न और मशीन लर्निंग को एक्सप्लोर कर रहे हैं।',
    ogLocale: 'hi_IN',
  },
  nav: {
    work: 'काम', about: 'परिचय', experience: 'अनुभव', research: 'शोध', journey: 'सफ़र', sayHello: 'संपर्क करें',
    label: 'मुख्य नेविगेशन', menu: 'मेन्यू', close: 'बंद करें', toLight: 'लाइट थीम पर जाएँ', toDark: 'डार्क थीम पर जाएँ',
    language: 'भाषा', skip: 'सामग्री पर जाएँ', home: 'Lakshy Chaudhary, होम',
  },
  hero: {
    hello: 'नमस्ते, मैं लकी हूँ —',
    title: ['मेरा काम ऐसे AI सिस्टम बनाना है जो ', 'देखें, सोचें', ' और फिर कदम उठाएँ।'],
    intro: 'मैं Lakshy Chaudhary हूँ, दक्षिण कोरिया की कुनसान नेशनल यूनिवर्सिटी में आर्टिफ़िशियल इंटेलिजेंस में PhD स्कॉलर। आजकल मेरा ज़्यादातर समय ब्रेन इमेजिंग डेटा — EEG, fMRI और उनके बीच के सिग्नल — के साथ गुज़रता है, और बाकी समय यह सोचने में बीतता है कि मशीनें कैसे थोड़ा और हमारी तरह देख-समझकर काम कर सकती हैं।',
    cta: 'मेरा मौजूदा काम देखें', sayHello: 'या बस नमस्ते कहें',
    photoAlt: 'धूप भरे दिन समुद्र किनारे रेलिंग के पास खड़े Lakshy Chaudhary',
    caption: 'समुंदर किनारे, एक अच्छे दिन',
    facts: [['अभी', 'PhD, आर्टिफ़िशियल इंटेलिजेंस'], ['लैब', 'AI Convergence Lab, प्रो. Han-Gue Jo'], ['फ़ोकस', 'ब्रेन इमेजिंग और न्यूरो AI'], ['छात्रवृत्ति', 'ग्लोबल कोरिया स्कॉलरशिप (GKS)']],
    year: (year: number) => `PhD का वर्ष ${year} · 2028 तक पूरी होने की उम्मीद`,
  },
  marquee: { pause: 'चलती सूची रोकें', play: 'चलती सूची चलाएँ' },
  process: {
    eyebrow: 'मेरा नज़रिया', title: ['देखने से ', 'करने तक।'],
    lede: 'जिन सिस्टम्स में मेरी दिलचस्पी है, उनमें से ज़्यादातर एक ही छोटे चक्र से गुज़रते हैं: दुनिया को देखना, उसे समझना, और फिर उस पर कुछ करना।',
    steps: [
      { title: 'देखना', theme: 'बोध', detail: 'कैमरे से मिले ऑब्ज़र्वेशन लेना और दृश्य को समझना।' },
      { title: 'पहुँचना', theme: 'तर्क', detail: 'किसी निर्देश को वस्तुओं और संभावित क्रियाओं से जोड़ना।' },
      { title: 'पकड़ना', theme: 'क्रिया', detail: 'इरादे को एक भौतिक क्रिया में बदलना।' },
      { title: 'रखना', theme: 'क्रिया', detail: 'सोच-समझकर चीज़ रखते हुए क्रम पूरा करना।' },
    ],
    note: 'यह शोध को देखने का एक तरीका है, नतीजों का सारांश नहीं।',
  },
  work: {
    eyebrow: 'चुनिंदा काम', title: ['ऐसे सवाल जिन पर ', 'हाथ आज़माना बनता है।'],
    lede: 'एम्बॉडिड AI, बोध और असल दुनिया के उलझे डेटा के पैटर्न पर तीन जारी प्रोजेक्ट।',
    number: 'नं.', methods: 'विधियाँ', read: 'प्रोजेक्ट के बारे में पढ़ें', credit: 'स्टॉक फ़ोटो · Unsplash', view: 'देखें', ongoing: 'जारी',
  },
  locale: 'hi-IN',
  time: { label: 'गुनसान का स्थानीय समय', zone: 'KST', cta: 'चलिए', ctaEm: 'बात करते हैं।' },
  explorer: {
    eyebrow: 'इंडेक्स', title: 'सब कुछ, एक ही सूची में', period: '।', lede: 'थीम या विधि से खोजें।',
    search: 'प्रोजेक्ट खोजें', placeholder: '“सेगमेंटेशन” या “टेम्पोरल” खोजकर देखें', filter: 'श्रेणी के अनुसार प्रोजेक्ट छाँटें', all: 'सभी',
    found: (count: number) => `${count} प्रोजेक्ट ${count === 1 ? 'मिला' : 'मिले'}`,
    empty: 'अभी इससे कुछ मेल नहीं खाता।', clear: 'खोज साफ़ करें',
    ongoing: 'ये सभी प्रोजेक्ट जारी हैं — काम अभी चल रहा है, ये अंतिम नतीजे नहीं हैं।',
  },
  about: {
    photoAlt: 'समुद्र किनारे Lakshy Chaudhary', caption: 'ये मैं हूँ ↑ (“लकी” भी चलेगा)',
    eyebrow: 'मेरे बारे में थोड़ा', title: ['ऐसा शोध जो ', 'स्क्रीन पर नहीं रुकता।'],
    lead: 'मूल रूप से मैं मेरठ, भारत से हूँ। मैंने सेंट्रल यूनिवर्सिटी ऑफ़ राजस्थान से कंप्यूटर साइंस की पढ़ाई की, और अब दक्षिण कोरिया के गुनसान में ग्लोबल कोरिया स्कॉलरशिप स्कॉलर के रूप में मेरी PhD चल रही है।',
    body: [
      'मेरा डॉक्टरेट शोध प्रोफ़ेसर Han-Gue Jo की AI Convergence Lab में होता है। अंतर्विषयक न्यूरोटेक्नोलॉजी और मानसिक-स्वास्थ्य शोध के हिस्से के रूप में, इसमें डीप लर्निंग और कॉग्निटिव सिग्नल प्रोसेसिंग के ज़रिए ब्रेन इमेजिंग डेटा — EEG और fMRI — को समझा जाता है।',
      'इसके अलावा, मेरा मन बार-बार उन रोबोट्स की ओर जाता है जो चीज़ें उठा सकते हैं — और कंप्यूटर विज़न, विज़न-लैंग्वेज मॉडल्स, और ऐसी मशीन लर्निंग की ओर जो असल दुनिया में काम आए।',
    ],
    experienceLink: 'अनुभव और शिक्षा', contactLink: 'बातचीत शुरू करें',
  },
  career: {
    eyebrow: 'अनुभव और शिक्षा', title: ['लोगों और विचारों से ', 'होकर गुज़रता रास्ता।'],
    experience: 'अनुभव', now: 'अभी', education: 'शिक्षा', certificates: 'प्रमाणपत्र', also: 'इसके अलावा',
  },
  research: {
    eyebrow: 'शोध और टूलकिट', title: ['जिज्ञासा, ', 'और खुलकर सोचने की आज़ादी।'],
    lede: 'मेरा डॉक्टरेट शोध AI Convergence Lab में ब्रेन इमेजिंग डेटा — EEG और fMRI — पर है। इसके साथ रोबोट्स, विज़न और एप्लाइड मशीन लर्निंग में भी मेरी दिलचस्पी बनी रहती है।',
    focus: 'डॉक्टरेट शोध का फ़ोकस', interests: 'दूसरी रुचियाँ', publications: 'प्रकाशन और नोट्स',
    publicationNote: 'अभी सूची में कुछ नहीं है — कुछ पक्का होते ही पेपर और फ़ील्ड नोट्स यहाँ जोड़े जाएँगे।',
  },
  journeySection: {
    eyebrow: 'शोध का सफ़र', title: ['सफ़र ', 'अभी जारी है।'],
    lede: 'अब तक के कुछ पड़ाव — मेरठ से राजस्थान, पिलानी और कोयंबटूर होते हुए, फिर गुनसान तक की लंबी उड़ान।',
  },
  contact: {
    eyebrow: 'संपर्क', title: ['कोई अच्छा ', 'सवाल है?'],
    intro: 'बुद्धिमान सिस्टम, दिमाग़, रोबोट — या कोरिया में PhD करने के बारे में सोचने वालों से बात करके हमेशा खुशी होती है। मेरा इनबॉक्स खुला है।',
    topicsLabel: 'इन विषयों पर लिखना हो तो ज़रूर लिखें',
    topics: [
      { text: 'ब्रेन इमेजिंग डेटा — EEG, fMRI और कॉग्निटिव सिग्नल प्रोसेसिंग' },
      { text: 'विज़न-लैंग्वेज मॉडल्स के साथ रोबोट मैनिपुलेशन', project: 'vision-guided-robot-manipulation' },
      { text: 'फ़ेशियल एक्शन यूनिट्स और समय के साथ बदलते भाव', project: 'facial-expression-analysis' },
      { text: 'इवेंट डेटा और अर्ली-वॉर्निंग संकेत', project: 'worldripple' },
      { text: 'ग्लोबल कोरिया स्कॉलरशिप पर कोरिया में PhD' },
    ],
    write: 'मुझे ईमेल लिखें', copied: 'कॉपी हो गया — जल्द बात करते हैं!', copyHint: 'कॉपी करने के लिए क्लिक करें', tapHint: 'कॉपी करने के लिए टैप करें', copyLabel: 'ईमेल पता कॉपी करें', signoff: '— लकी',
  },
  footer: { place: 'गुनसान, दक्षिण कोरिया', email: 'ईमेल', label: 'फ़ुटर', top: 'ऊपर जाएँ', topLabel: 'ऊपर जाएँ' },
  detail: {
    all: 'सभी प्रोजेक्ट', status: 'स्थिति', ongoing: 'जारी', ongoingText: 'काम अभी चल रहा है। काम आगे बढ़ने और पक्की जानकारी आने पर यहाँ और विवरण जोड़ा जाएगा।',
    photoNote: 'यह प्रतीकात्मक स्टॉक फ़ोटो है, प्रोजेक्ट की असली तस्वीर नहीं।',
    question: 'सवाल', approach: 'दृष्टिकोण', methods: 'विधियाँ', related: 'संबंधित शोध क्षेत्र',
    limitations: 'सीमाएँ', code: 'कोड', paper: 'पेपर', previous: 'पिछला', next: 'अगला', others: 'और प्रोजेक्ट',
    mailSubject: (title: string) => `${title} के बारे में`,
  },
  notFound: { eyebrow: 'प्रोजेक्ट नहीं मिला', title: ['यह पेज ', 'सूची में नहीं है।'], back: 'प्रोजेक्ट पर वापस जाएँ' },
  categories: { Robotics: 'रोबोटिक्स', 'Computer vision': 'कंप्यूटर विज़न', 'Applied AI': 'एप्लाइड AI' },
  projects: {
    'vision-guided-robot-manipulation': {
      title: 'विज़न-गाइडेड रोबोट मैनिपुलेशन', category: 'रोबोटिक्स',
      summary: 'FR5 रोबोट मैनिपुलेशन के लिए भाषा से मिले इरादे को विज़ुअल ऑब्ज़र्वेशन से जोड़ना।',
      problem: 'जब किसी रोबोट की समझ इस पर टिकी हो कि उसका कैमरा क्या देखता है, तो वह किसी काम को कैसे अंजाम दे?',
      approach: 'यह जारी प्रोजेक्ट विज़न-लैंग्वेज मॉडल्स, सेगमेंटेशन और कैमरा ऑब्ज़र्वेशन की मदद से FR5 मैनिपुलेशन को एक्सप्लोर करता है।',
      methods: ['FR5 रोबोट मैनिपुलेशन', 'विज़न-लैंग्वेज मॉडल्स', 'सेगमेंटेशन', 'कैमरा ऑब्ज़र्वेशन'],
      limitations: '',
      imageAlt: 'नीली रोशनी वाली लैब में काँच के पीछे काम करता एक ऑटोमेटेड ग्रिपर',
    },
    'facial-expression-analysis': {
      title: 'फ़ेशियल एक्सप्रेशन एनालिसिस', category: 'कंप्यूटर विज़न',
      summary: 'अलग-अलग भावनात्मक स्थितियों में फ़ेशियल एक्शन यूनिट्स की गतिशीलता का अध्ययन।',
      problem: 'चेहरे के भाव समय के साथ उभरते हैं — तो भावनात्मक स्थितियों के साथ एक्शन यूनिट्स की गतिशीलता कैसे बदलती है?',
      approach: 'भावनात्मक स्थितियों में फ़ेशियल एक्शन यूनिट्स की गतिशीलता का जारी विश्लेषण।',
      methods: ['फ़ेशियल एक्शन यूनिट्स', 'टेम्पोरल डायनैमिक्स', 'भावनात्मक स्थितियाँ'],
      limitations: '',
      imageAlt: 'दोनों हाथों में चेहरा थामे, हैरान और खुश दिखती एक महिला',
    },
    worldripple: {
      title: 'WorldRipple', category: 'एप्लाइड AI',
      summary: 'इवेंट डेटा और टेम्पोरल मॉडलिंग के ज़रिए भू-राजनीतिक अर्ली-वॉर्निंग संकेतों की खोज।',
      problem: 'क्या समय के साथ मॉडल किए गए इवेंट डेटा के बदलते पैटर्न भू-राजनीतिक घटनाक्रमों के अर्ली-वॉर्निंग संकेत बन सकते हैं?',
      approach: 'यह जारी प्रोजेक्ट इवेंट डेटा और टेम्पोरल मॉडलिंग की मदद से अर्ली-वॉर्निंग संकेतों को एक्सप्लोर करता है।',
      methods: ['इवेंट डेटा', 'टेम्पोरल मॉडलिंग', 'अर्ली-वॉर्निंग संकेत'],
      limitations: '',
      imageAlt: 'गहरे रंग की लकड़ी की मेज़ पर फैले सुबह के अख़बार',
    },
  },
  researchAreas: ['न्यूरो AI और ब्रेन इमेजिंग', 'कॉग्निटिव सिग्नल प्रोसेसिंग', 'AI और एप्लाइड मशीन लर्निंग', 'रोबोट मैनिपुलेशन', 'कंप्यूटर विज़न', 'विज़न-लैंग्वेज मॉडल्स'],
  skillGroups: [
    { title: 'न्यूरो AI', items: ['ब्रेन इमेजिंग डेटा', 'EEG / fMRI', 'कॉग्निटिव सिग्नल प्रोसेसिंग', 'डीप लर्निंग'] },
    { title: 'बोध', items: ['कंप्यूटर विज़न', 'विज़न-लैंग्वेज मॉडल्स', 'सेगमेंटेशन', 'फ़ेशियल एक्शन यूनिट्स'] },
    { title: 'क्रिया और मॉडलिंग', items: ['रोबोट मैनिपुलेशन', 'कैमरा ऑब्ज़र्वेशन', 'टेम्पोरल मॉडलिंग', 'इवेंट डेटा', 'एप्लाइड मशीन लर्निंग'] },
    { title: 'और भी', items: ['अकादमिक शोध', 'शैक्षिक शोध', 'Amazon DynamoDB'] },
  ],
  journey: [
    { date: '', title: 'मेरठ, भारत', detail: 'जहाँ से मैं हूँ।' },
    { date: 'जून 2019 — जून 2024', title: 'राजस्थान, भारत', detail: 'सेंट्रल यूनिवर्सिटी ऑफ़ राजस्थान से कंप्यूटर साइंस में इंटीग्रेटेड M.Sc.।' },
    { date: 'जून — जुलाई 2023', title: 'पिलानी, भारत', detail: 'BITS पिलानी में समर प्रोजेक्ट इंटर्नशिप।' },
    { date: 'जनवरी — मई 2024', title: 'कोयंबटूर, भारत', detail: 'अमृता विश्व विद्यापीठम् में प्रोजेक्ट इंटर्नशिप।' },
    { date: 'सितंबर 2024 — अब तक', title: 'गुनसान, दक्षिण कोरिया', detail: 'कुनसान नेशनल यूनिवर्सिटी के लैंग्वेज प्रोग्राम में एक साल, फिर सितंबर 2025 से ग्लोबल कोरिया स्कॉलरशिप स्कॉलर के रूप में आर्टिफ़िशियल इंटेलिजेंस में PhD।' },
  ],
  experience: [
    {
      organization: 'कुनसान नेशनल यूनिवर्सिटी', role: 'PhD स्कॉलर', date: 'सितंबर 2025 — अब तक', location: 'गुनसान, दक्षिण कोरिया',
      detail: 'प्रोफ़ेसर Han-Gue Jo के मार्गदर्शन में AI Convergence Lab में आर्टिफ़िशियल इंटेलिजेंस (ब्रेन इमेजिंग डेटा / न्यूरो AI) में मेरी PhD चल रही है। मेरा काम EEG/fMRI समेत ब्रेन इमेजिंग डेटा, डीप लर्निंग और कॉग्निटिव सिग्नल प्रोसेसिंग पर केंद्रित है, जो अंतर्विषयक न्यूरोटेक्नोलॉजी और मानसिक-स्वास्थ्य शोध का हिस्सा है।',
    },
    { organization: 'कुनसान नेशनल यूनिवर्सिटी', role: 'लैंग्वेज प्रोग्राम स्टूडेंट', date: 'सितंबर 2024 — सितंबर 2025', location: 'गुनसान, दक्षिण कोरिया', detail: '' },
    { organization: 'अमृता विश्व विद्यापीठम्', role: 'प्रोजेक्ट इंटर्न', date: 'जनवरी 2024 — मई 2024', location: 'कोयंबटूर, भारत', detail: '' },
    { organization: 'बिड़ला इंस्टीट्यूट ऑफ़ टेक्नोलॉजी एंड साइंस, पिलानी', role: 'समर प्रोजेक्ट इंटर्न', date: 'जून 2023 — जुलाई 2023', location: 'राजस्थान, भारत', detail: '' },
  ],
  additionalExperience: [{ organization: 'GDSC WOW', role: 'इंटर्नशिप', date: '' }],
  education: [
    { institution: 'कुनसान नेशनल यूनिवर्सिटी', qualification: 'डॉक्टर ऑफ़ फ़िलॉसफ़ी, आर्टिफ़िशियल इंटेलिजेंस', date: 'सितंबर 2025 — जून 2028 (अपेक्षित)', location: 'गुनसान, दक्षिण कोरिया' },
    { institution: 'सेंट्रल यूनिवर्सिटी ऑफ़ राजस्थान', qualification: 'इंटीग्रेटेड M.Sc., कंप्यूटर साइंस', date: 'जून 2019 — जून 2024', location: 'भारत' },
  ],
  certifications,
};

export const dictionaries: Record<Lang, Dictionary> = { en, ko, hi };

export const I18nContext = createContext<{ lang: Lang; t: Dictionary; setLang: (lang: Lang) => void }>({ lang: 'en', t: en, setLang: () => {} });
export const useI18n = () => useContext(I18nContext);
