export type Project = {
  slug: string;
  number: string;
  title: string;
  shortTitle: string;
  category: string;
  summary: string;
  problem: string;
  approach: string;
  methods: string[];
  /** Leave empty until real limitations are documented; the section is hidden while empty. */
  limitations: string;
  /** Indexes into researchAreas that this project relates to. */
  areas: number[];
  codeUrl?: string;
  paperUrl?: string;
  /** Representative stock photo, credited — not research media. */
  image: string;
  imageAlt: string;
  imageCreditUrl: string;
};

export const projects: Project[] = [
  {
    slug: 'vision-guided-robot-manipulation',
    number: '01',
    title: 'Vision-Guided Robot Manipulation',
    shortTitle: 'Robot manipulation',
    category: 'Robotics',
    summary: 'Connecting language-guided intent with visual observations for FR5 robot manipulation.',
    problem: 'How can a robot act on a task when its understanding must be grounded in what its camera observes?',
    approach: 'This ongoing project explores FR5 manipulation using vision-language models, segmentation, and camera observations.',
    methods: ['FR5 robot manipulation', 'Vision-language models', 'Segmentation', 'Camera observations'],
    limitations: '',
    areas: [3, 5],
    image: 'images/robot-lab.jpg',
    imageAlt: 'An automated gripper working behind glass in a blue-lit laboratory',
    imageCreditUrl: 'https://unsplash.com/photos/9xHsWmh3m_4',
  },
  {
    slug: 'facial-expression-analysis',
    number: '02',
    title: 'Facial Expression Analysis',
    shortTitle: 'Expression analysis',
    category: 'Computer vision',
    summary: 'Studying facial action-unit dynamics across different emotional conditions.',
    problem: 'Facial expressions unfold over time — so how do action-unit dynamics vary across emotional conditions?',
    approach: 'An ongoing analysis of facial action-unit dynamics across emotional conditions.',
    methods: ['Facial action units', 'Temporal dynamics', 'Emotional conditions'],
    limitations: '',
    areas: [4],
    image: 'images/expression.jpg',
    imageAlt: 'A woman with a surprised, delighted expression holding her face in her hands',
    imageCreditUrl: 'https://unsplash.com/photos/kIWecTxaoNI',
  },
  {
    slug: 'worldripple',
    number: '03',
    title: 'WorldRipple',
    shortTitle: 'WorldRipple',
    category: 'Applied AI',
    summary: 'Exploring geopolitical early-warning signals through event data and temporal modeling.',
    problem: 'Can changing patterns in event data, modeled over time, serve as early-warning signals of geopolitical developments?',
    approach: 'This ongoing project explores early-warning signals using event data and temporal modeling.',
    methods: ['Event data', 'Temporal modeling', 'Early-warning signals'],
    limitations: '',
    areas: [2],
    image: 'images/newspapers.jpg',
    imageAlt: 'Morning newspapers spread across a dark wooden table',
    imageCreditUrl: 'https://unsplash.com/photos/hWJsOnaWTqs',
  },
];

export const categories = ['All', ...new Set(projects.map((project) => project.category))];

/* The first two are the doctoral focus; the rest are broader interests. Projects refer to these by index. */
export const researchAreas = [
  'Neuro AI & brain imaging',
  'Cognitive signal processing',
  'AI & applied machine learning',
  'Robot manipulation',
  'Computer vision',
  'Vision-language models',
];

/* A journey through places, oldest first. Unknown dates stay blank. */
export const journey = [
  { date: '', title: 'Meerut, India', detail: 'Where I’m from.' },
  { date: 'Jun 2019 — Jun 2024', title: 'Rajasthan, India', detail: 'Integrated M.Sc. in Computer Science at the Central University of Rajasthan.' },
  { date: 'Jun — Jul 2023', title: 'Pilani, India', detail: 'A summer project internship at BITS Pilani.' },
  { date: 'Jan — May 2024', title: 'Coimbatore, India', detail: 'A project internship at Amrita Vishwa Vidyapeetham.' },
  { date: 'Sep 2024 — present', title: 'Gunsan, South Korea', detail: 'A year in Kunsan National University’s language program, then a PhD in Artificial Intelligence from September 2025 as a Global Korea Scholarship scholar.' },
];

export const experience = [
  {
    organization: 'Kunsan National University',
    role: 'PhD Scholar',
    date: 'September 2025 — Present',
    location: 'Gunsan, South Korea',
    detail: 'I am pursuing a PhD in Artificial Intelligence (Brain Imaging Data / Neuro AI) under Professor Han-Gue Jo in the AI Convergence Lab. My work focuses on brain imaging data, including EEG/fMRI, deep learning, and cognitive signal processing, within interdisciplinary neurotechnology and mental-health research.',
  },
  {
    organization: 'Kunsan National University',
    role: 'Language Program Student',
    date: 'September 2024 — September 2025',
    location: 'Gunsan, South Korea',
    detail: '',
  },
  {
    organization: 'Amrita Vishwa Vidyapeetham',
    role: 'Project Intern',
    date: 'January 2024 — May 2024',
    location: 'Coimbatore, India',
    detail: '',
  },
  {
    organization: 'Birla Institute of Technology and Science, Pilani',
    role: 'Summer Project Intern',
    date: 'June 2023 — July 2023',
    location: 'Rajasthan, India',
    detail: '',
  },
];

export const education = [
  {
    institution: 'Kunsan National University',
    qualification: 'Doctor of Philosophy, Artificial Intelligence',
    date: 'September 2025 — expected June 2028',
    location: 'Gunsan, South Korea',
  },
  {
    institution: 'Central University of Rajasthan',
    qualification: 'Integrated M.Sc., Computer Science',
    date: 'June 2019 — June 2024',
    location: 'India',
  },
];

export const certifications = [
  'Supervised Machine Learning: Regression and Classification',
  'AI Fluency for Students — Certificate of Completion',
];

export const additionalExperience = [
  { organization: 'GDSC WOW', role: 'Internship', date: '' },
];

export const topSkills = ['Scholarly research', 'Educational research', 'Amazon DynamoDB'];
