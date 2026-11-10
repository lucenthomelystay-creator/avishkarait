export type DomainChallenge = {
  id: string;
  name: string;
  summary: string;
  requirements: string[];
  evaluation: string[];
  minTeamSize?: number;
  maxTeamSize?: number;
  duration?: string;
  provisional?: boolean;
};

export type EventDomain = {
  number: string;
  code: string;
  slug: string;
  name: string;
  short: string;
  description: string;
  focus: string[];
  minTeamSize?: number;
  maxTeamSize?: number;
  duration?: string;
  registrationOpen?: boolean;
  challenges: DomainChallenge[];
};

export const eventDomains: EventDomain[] = [
  {
    number: '01', code: 'CYB', slug: 'ai-cybersecurity-fintech', name: 'AI in Cybersecurity & FinTech',
    short: 'Intelligent systems built for trust and financial security.',
    description: 'Artificial intelligence applications in cybersecurity, financial technology, intelligent security systems and innovative financial solutions.',
    focus: ['AI-based cybersecurity solutions', 'Fraud detection and financial security', 'Intelligent financial applications', 'Threat detection and analysis', 'Secure digital systems'],
    challenges: [{id:'ai-cybersecurity-fintech',name:'AI in Cybersecurity & FinTech',summary:'Develop the assigned problem statement during the hackathon.',provisional:true,requirements:['Team size: To be announced.','No pre-built complete project.','Disclose external libraries, APIs and AI tools.','Submit source code, README or documentation, and a working demonstration.','Plagiarism and copied submissions are prohibited.'],evaluation:['Additional evaluation criteria: To be announced.']}],
  },
  {
    number: '02', code: 'FSD', slug: 'full-stack', name: 'Full Stack Development',
    short: 'Functional software from polished interface to connected data.',
    description: 'Develop functional, innovative and user-oriented digital applications using frontend and backend technologies.',
    focus: ['Web application development', 'Backend and API integration', 'Database-driven applications', 'UI/UX design', 'Functional software solutions'],
    challenges: [{id:'full-stack',name:'Full Stack Development',summary:'Develop the assigned problem statement during the hackathon.',provisional:true,requirements:['Team size: To be announced.','No pre-built complete projects.','Disclose APIs, libraries and AI tools.','Submit source code, a working demo and documentation.','Plagiarism is prohibited.'],evaluation:['Additional evaluation criteria: To be announced.']}],
  },
  {
    number: '03', code: 'IOT', slug: 'iot-embedded', name: 'IoT & Embedded Systems',
    short: 'Connect software, sensing and the physical world.',
    description: 'Build a complete connected or embedded project during the hackathon.', minTeamSize:2,maxTeamSize:4,
    focus: ['Connected devices', 'Embedded systems', 'Intelligent sensing'],
    challenges: [{id:'iot-embedded',name:'IoT & Embedded Systems',summary:'Build and demonstrate a complete IoT or embedded project.',minTeamSize:2,maxTeamSize:4,requirements:['Teams must have 2 to 4 members.','Participants must bring all required components, sensors, microcontrollers and hardware tools. The college will not provide components.','Build the complete hardware and software prototype during the hackathon.','Pre-built complete projects or ready-made circuits are not permitted.'],evaluation:['Demonstrate the complete working prototype.','Additional evaluation criteria: To be announced.']}],
  },
  {
    number: '04', code: 'MEC', slug: 'mechspark', name: 'MECHSPARK 2K26', short: 'IDEAS THAT MOVE THE WORLD.',
    description: 'MECHSPARK 2K26 - Mechanical Engineering. IDEAS THAT MOVE THE WORLD.',maxTeamSize:4,duration:'8 hours',
    focus: ['Mechanical design', 'Applied engineering', 'Fabrication and modelling'],
    challenges: [
      {id:'lathe-machine-operating',name:'Lathe Machine Operating',summary:'Practical machining and lathe operation.',maxTeamSize:4,duration:'8 hours',requirements:['Faculty supervision is required.','Use required PPE and follow workshop safety instructions.','Organisers provide required machines, materials and equipment.','Unsafe behaviour or equipment misuse may result in disqualification.'],evaluation:['Dimensional accuracy','Surface finish','Machine handling','Time management','Safety']},
      {id:'solid-edge-cad-design',name:'Solid Edge CAD Design',summary:'Complete the assigned 3D model announced at the venue.',maxTeamSize:4,duration:'8 hours',requirements:['Previously prepared models are not permitted.','Submit the final design files.'],evaluation:['Design accuracy','Creativity','Modelling skills','Dimensions','Completion time']},
      {id:'cardboard-mechanical-model',name:'Cardboard Mechanical Model Making',summary:'Build and demonstrate a working mechanical model using organiser-provided cardboard and permitted materials.',maxTeamSize:4,duration:'8 hours',requirements:['No pre-built models.','Demonstrate the working mechanism and engineering principle.'],evaluation:['Innovation','Working mechanism','Strength and stability','Engineering application','Presentation']},
    ],
  },
  {
    number: '05', code: 'CIV', slug: 'civilx', name: 'CIVILX - Civil Engineering & Structural Innovation',
    short: 'Structural thinking, drafting and field engineering.',
    description: 'Apply civil engineering skills to structural design, drafting and surveying challenges.',
    focus: ['Structural innovation', 'CAD and building design', 'Surveying and field levelling'],
    challenges: [
      {id:'bridge-x',name:'BRIDGE-X',summary:'Build a bridge using organiser-provided materials. Completed bridges undergo gradual load testing.',minTeamSize:4,maxTeamSize:4,requirements:['Team size: exactly 4 members.','Bridge materials are provided by organisers.'],evaluation:['Load capacity: 30%','Structural stability: 25%','Material efficiency: 15%','Innovation/design: 15%','Construction quality: 15%']},
      {id:'cadathon',name:'CADATHON',summary:'An offline quiz of approximately 20-30 MCQs in 20-30 minutes, followed by a 90-minute AutoCAD residential building design challenge for the top 10 teams.',minTeamSize:2,maxTeamSize:2,duration:'90 minutes',requirements:['Team size: exactly 2 members.','Submit a floor plan, elevation, cross-section and schedule of openings.','No pre-made drawings or pre-drafted geometry.','No internet access. Basic AutoCAD templates without pre-drawn geometry are permitted.'],evaluation:['Planning and space utilisation: 25%','Vastu: 15%','Sustainability: 15%','Drawing accuracy: 20%','Elevation/section quality: 15%','Presentation: 10%']},
      {id:'surveyor-x',name:'SURVEYOR-X',summary:'An offline quiz of approximately 20-30 MCQs in 20-30 minutes, followed by practical field levelling.',minTeamSize:4,maxTeamSize:4,requirements:['Team size: exactly 4 members.','Record staff readings and calculate reduced levels and elevation differences.','Participants bring a calculator.','Organisers provide a Dumpy/Auto Level, levelling staff, tripod and field sheet.'],evaluation:['Accuracy: 30%','RL/HI calculations: 25%','Instrument handling: 15%','Field book: 15%','Time: 10%','Coordination: 5%']},
    ],
  },
];

export const registrationFeePerTeam = 1500;
