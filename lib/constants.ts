// ==============================================================================
// STRICT DESIGN SYSTEM & BRAND CONSTANTS
// No other colors or gradients are permitted anywhere across the application.
// ==============================================================================
export const BRAND_COLORS = {
  white: '#FFFFFF',
  black: '#171717',
  primaryRed: '#D71935',
  darkRed: '#8F1026',
  lightGrey: '#E8EAED',
} as const;

export const REGISTRATION_FEE_INR = 1500;
export const TOTAL_PRIZE_POOL = '₹1,00,000';

export interface EventDomain {
  slug: string;
  code: string;
  name: string;
  tagline?: string;
  category: string;
  description: string;
  teamSizeMin: number;
  teamSizeMax: number;
  exactTeamSize?: number;
  duration?: string;
  rules: string[];
  challenges?: {
    name: string;
    description: string;
    exactTeamSize?: number;
    teamSizeMin?: number;
    teamSizeMax?: number;
    details?: string[];
  }[];
}

export const EVENT_DOMAINS: Record<string, EventDomain> = {
  'ai-cybersecurity-fintech': {
    slug: 'ai-cybersecurity-fintech',
    code: 'CYB',
    name: 'AI IN CYBERSECURITY AND FINTECH',
    category: 'Artificial Intelligence, Cybersecurity and Financial Technology',
    description: 'Build intelligent solutions for digital security, financial technology, fraud detection and emerging cyber threats.',
    teamSizeMin: 2,
    teamSizeMax: 4,
    rules: [
      'Develop a solution based on the given problem statement.',
      'Complete project development within the hackathon duration.',
      'Pre-built complete projects are not allowed.',
      'External libraries, APIs and AI tools must be disclosed during submission.',
      'Submit source repository and demonstrate a live working solution to the judging panel.',
    ],
  },
  'full-stack': {
    slug: 'full-stack',
    code: 'FSD',
    name: 'FULL STACK DEVELOPMENT',
    category: 'Software Development and Web Technologies',
    description: 'Transform ideas into functional digital products through frontend, backend and database development.',
    teamSizeMin: 2,
    teamSizeMax: 4,
    rules: [
      'Build a functional application based on the given problem statement.',
      'Complete all development during the hackathon timeline.',
      'Pre-built complete projects or boilerplate products are not allowed.',
      'External frameworks, open-source libraries and public APIs are permitted.',
      'Submit complete source code with clean commit history and demonstrate the live working application.',
    ],
  },
  'iot-embedded': {
    slug: 'iot-embedded',
    code: 'IOT',
    name: 'IOT AND EMBEDDED SYSTEMS',
    category: 'Internet of Things and Embedded Engineering',
    description: 'Create practical hardware-based innovations by integrating sensors, electronics, embedded systems and intelligent technology.',
    teamSizeMin: 2,
    teamSizeMax: 4,
    rules: [
      'Team size: 2 to 4 members.',
      'Participants must bring all required components, sensors, microcontrollers and hardware tools.',
      'Components will not be provided by the college.',
      'The complete hardware-software prototype must be built during the hackathon.',
      'Pre-built complete projects or ready circuits are not permitted.',
    ],
  },
  'theodo': {
    slug: 'theodo',
    code: 'THE',
    name: 'THEODO',
    category: 'Civil Engineering and Structural Innovation',
    description: 'Three challenges. Three ways to engineer the future.',
    teamSizeMin: 2,
    teamSizeMax: 4,
    rules: [
      'Each team must select exactly one challenge during registration.',
      'Team size constraints are strictly enforced per challenge: BRIDGE-X (4 members), CADATHON (2 members), SURVEYOR-X (4 members).',
      'Participants must report to designated testing and field arenas on schedule.',
      'All submissions and physical models will be tested according to technical standards.',
    ],
    challenges: [
      {
        name: 'BRIDGE-X',
        description: 'Structural Bridge Challenge',
        exactTeamSize: 4,
        details: [
          'Team size: exactly 4 members.',
          'Construct a bridge using organizer-provided materials.',
          'Complete construction within the allotted time.',
          'Bridge performance will be evaluated through rigorous load testing until failure.',
        ],
      },
      {
        name: 'CADATHON',
        description: 'Civil CAD Design Challenge',
        exactTeamSize: 2,
        details: [
          'Team size: exactly 2 members.',
          'Two rounds: technical CAD quiz and AutoCAD design challenge.',
          'Top 10 teams qualify for the final design round.',
          'Pre-prepared drawings or templates are not permitted.',
        ],
      },
      {
        name: 'SURVEYOR-X',
        description: 'Surveying Challenge',
        exactTeamSize: 4,
        details: [
          'Team size: exactly 4 members.',
          'Two rounds: surveying quiz and practical field levelling.',
          'Bring your own scientific calculator.',
          'Accuracy of readings and calculations is paramount.',
        ],
      },
    ],
  },
  'mechspark': {
    slug: 'mechspark',
    code: 'MEC',
    name: 'MECHSPARK',
    tagline: 'THINK. DESIGN. BUILD. WIN.',
    category: 'Mechanical Engineering Challenge',
    description: 'MECHSPARK 2K26 – Mechanical Engineering Challenge. THINK. DESIGN. BUILD. WIN.',
    teamSizeMin: 2,
    teamSizeMax: 4,
    duration: '8 Hours',
    rules: [
      'Complete all assigned tasks within the 8-hour event duration.',
      'Materials, machines and workshop equipment will be provided by the organizers.',
      'Judging focuses on engineering innovation, practical skills, dimensional accuracy and safety protocol adherence.',
    ],
    challenges: [
      {
        name: 'Lathe Machine Operating Challenge',
        description: 'Precision machining, metal turning and dimensional tolerance evaluation on workshop lathe machines.',
      },
      {
        name: 'Solid Edge CAD Design Challenge',
        description: 'Parametric 3D mechanical modeling, assembly constraints and drafting under timed conditions.',
      },
      {
        name: 'Cardboard Model Making Challenge',
        description: 'Rapid physical mechanism prototyping, structural stability and kinematics using cardboard fabrication.',
      },
    ],
  },
};

export const DEPARTMENTS = [
  {
    name: 'Artificial Intelligence and Machine Learning',
    domain: 'Intelligent Systems & Neural Computing',
    description: 'Pioneering research and practical training in deep learning, autonomous systems, NLP, and computer vision.',
  },
  {
    name: 'Computer Science (Data Science)',
    domain: 'Big Data & Predictive Analytics',
    description: 'Empowering students with advanced big data architecture, statistical modeling, data visualization, and ML pipelines.',
  },
  {
    name: 'Information Science and Engineering',
    domain: 'Software Engineering & Enterprise Information',
    description: 'Specializing in enterprise software systems, cloud computing, cybersecurity paradigms, and distributed data.',
  },
  {
    name: 'Computer Science and Engineering',
    domain: 'Core Computing & Algorithmic Design',
    description: 'The foundation of modern computing with rigorous focus on algorithms, operating systems, compilers, and architectures.',
  },
  {
    name: 'Robotics and Artificial Intelligence Engineering',
    domain: 'Mechatronics & Autonomous Robotics',
    description: 'Interdisciplinary convergence of mechanical kinematics, embedded sensors, ROS, and intelligent robot controls.',
  },
  {
    name: 'Civil Engineering',
    domain: 'Structural Design & Urban Infrastructure',
    description: 'Fostering expertise in advanced structural analysis, environmental engineering, geotechnical analysis, and modern surveying.',
  },
  {
    name: 'Mechanical Engineering',
    domain: 'Thermal, Design & Manufacturing Systems',
    description: 'State-of-the-art workshops, CNC machining, thermodynamics, CAD/CAM simulation, and sustainable product design.',
  },
  {
    name: 'Electrical and Electronics Engineering',
    domain: 'Power Systems, Drives & Renewable Energy',
    description: 'Advancing smart grid technology, power electronics, renewable energy integration, and high-voltage transmission.',
  },
  {
    name: 'Electronics and Communication Engineering',
    domain: 'VLSI, Embedded Systems & Wireless Networks',
    description: 'Mastering microelectronics, RF communications, digital signal processing, IoT integration, and embedded firmware.',
  },
];

export const TECHNICAL_CLUBS = [
  {
    name: 'ALGOX Technical Club',
    type: 'Core Technical Club',
    description: 'A technical club responsible for promoting technical development through technical sessions, workshops, competitions, innovation activities and collaborative development initiatives.',
    focusAreas: ['Technical Sessions', 'Hands-on Workshops', 'Competitive Programming', 'Collaborative Hackathons'],
  },
  {
    name: 'ADVITIYA',
    type: 'Interdepartmental Technical Club',
    description: 'A student club that conducts various interdepartmental technical events, encourages participation across engineering branches and promotes technical collaboration.',
    focusAreas: ['Interdepartmental Challenges', 'Multi-disciplinary Innovation', 'Peer Mentorship', 'Technical Exhibitions'],
  },
];

export const COMMON_RULES = [
  'Open to eligible college students with valid institutional identification.',
  'Intercollege participation and multidisciplinary team compositions are welcome.',
  'Participants must register within the specified registration deadline.',
  'Teams must strictly follow the team-size limits of their respective domains and challenges.',
  'All challenges and project implementations must be completed within the allotted hackathon duration.',
  'Pre-built projects, copied submissions, or commercial templates are strictly prohibited and lead to immediate disqualification.',
  'Participants must follow the instructions of event coordinators, laboratory technicians, and judges at all times.',
  'Maintain professional discipline, laboratory hygiene, and handle all college machinery and equipment responsibly.',
  'The decisions of the judging panel will be final and binding on all participating teams.',
];
