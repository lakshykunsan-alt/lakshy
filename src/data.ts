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
  limitations: string;
  codeUrl?: string;
  paperUrl?: string;
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
    limitations: 'Project-specific limitations have not been documented yet.',
  },
  {
    slug: 'facial-expression-analysis',
    number: '02',
    title: 'Facial Expression Analysis',
    shortTitle: 'Expression analysis',
    category: 'Computer vision',
    summary: 'Studying facial action-unit dynamics across different emotional conditions.',
    problem: 'Facial expressions unfold over time; this project focuses on how action-unit dynamics vary across emotional conditions.',
    approach: 'An ongoing analysis of facial action-unit dynamics across emotional conditions.',
    methods: ['Facial action units', 'Temporal dynamics', 'Emotional conditions'],
    limitations: 'Project-specific limitations have not been documented yet.',
  },
  {
    slug: 'worldripple',
    number: '03',
    title: 'WorldRipple',
    shortTitle: 'WorldRipple',
    category: 'Applied AI',
    summary: 'Exploring geopolitical early-warning signals through event data and temporal modeling.',
    problem: 'Geopolitical developments can emerge through changing patterns in event data over time.',
    approach: 'This ongoing project explores early-warning signals using event data and temporal modeling.',
    methods: ['Event data', 'Temporal modeling', 'Early-warning signals'],
    limitations: 'Project-specific limitations have not been documented yet.',
  },
];

export const categories = ['All', ...new Set(projects.map((project) => project.category))];

export const researchAreas = [
  'AI & applied machine learning',
  'Robot manipulation',
  'Computer vision',
  'Vision-language models',
  'Neuro AI & brain imaging',
  'Cognitive signal processing',
];

export const journey = [
  { date: 'Sep 2025 — present', title: 'PhD Scholar', detail: 'Pursuing a PhD in Artificial Intelligence at Kunsan National University as a Global Korea Scholarship scholar.' },
  { date: 'Sep 2024 — Sep 2025', title: 'Language Program Student', detail: 'Studied at Kunsan National University in Gunsan, South Korea.' },
  { date: 'Jan — May 2024', title: 'Project Intern', detail: 'Amrita Vishwa Vidyapeetham, Coimbatore, India.' },
  { date: 'Jun — Jul 2023', title: 'Summer Project Intern', detail: 'Birla Institute of Technology and Science, Pilani, India.' },
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
    location: 'Pilani, India',
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
