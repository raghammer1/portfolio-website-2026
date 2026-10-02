export const links = {
  github: 'https://github.com/raghammer1',
  linkedin: 'https://www.linkedin.com/in/raghav-agarwal-84a59822b/',
  sudoku: 'https://raghammer1.github.io/sudoku2/',
  sudokuSource: 'https://github.com/raghammer1/sudoku2',
  transport: 'https://github.com/raghammer1/Server-and-receiver-sim',
  recommender: 'https://github.com/raghammer1/recommenderSystem',
  curiosity: 'https://www.youtube.com/@unwindingcuriosity',
  email: 'mailto:raghagarwal@gmail.com',
};

export const identity = {
  name: 'Raghav Agarwal',
  role: 'Software Engineer',
  location: 'Sydney, Australia',
  email: 'raghagarwal@gmail.com',
  introduction:
    'I build software across Python, applied AI and full-stack development—currently working in retail credit decisioning at Commonwealth Bank.',
};

export type CaseStudy = {
  id: string;
  number: string;
  discipline: string;
  company: string;
  title: string;
  description: string;
  outcome: string;
  tags: string[];
  status: string;
  details: { title: string; body: string }[];
};

export const caseStudies: CaseStudy[] = [
  {
    id: 'python-performance',
    number: '01',
    discipline: 'PYTHON & DATA',
    company: 'Commonwealth Bank',
    title: 'Less time processing.\nMore room to think.',
    description:
      'An expensive processing workflow, rethought with Python and Polars. A practical performance improvement where execution time matters.',
    outcome: 'Substantially reduced execution time',
    tags: ['Python', 'Polars', 'Data processing'],
    status: 'Engineering contribution',
    details: [
      {
        title: 'The problem',
        body: 'Data-processing work in retail credit decisioning included a workflow with expensive execution. The engineering task was to make that processing more efficient.',
      },
      {
        title: 'My contribution',
        body: 'I designed and developed a Python solution using Polars to change the processing approach and substantially reduce execution time.',
      },
      {
        title: 'The engineering choice',
        body: 'The work centred on the data-processing approach itself, using Polars within Python. The illustration explores that idea: bringing processing paths together into a more efficient workflow.',
      },
      {
        title: 'The outcome',
        body: 'A substantially faster processing workflow. Related work includes a framework that translates Polars rules into readable pseudocode and supports updates back into code.',
      },
    ],
  },
  {
    id: 'applied-ai',
    number: '02',
    discipline: 'APPLIED AI',
    company: 'Commonwealth Bank',
    title: 'Intelligence, with\na human in the loop.',
    description:
      'Developing LLM-assisted analysis for retail credit decisioning, with context, interpretability and human review at the centre.',
    outcome: 'Context → retrieval → workflow → review',
    tags: ['Agent workflows', 'RAG', 'Langfuse'],
    status: 'In development',
    details: [
      {
        title: 'The context',
        body: 'LLM-assisted analysis needs useful context and a clear review process. This development work explores those needs in retail credit decisioning.',
      },
      {
        title: 'My contribution',
        body: 'I work on context-aware agent workflows and retrieval-augmented generation, alongside interpretability, human review and observability through Langfuse.',
      },
      {
        title: 'The engineering focus',
        body: 'Retrieval supplies relevant context; structured workflows organise the analysis; human review keeps people involved. Traceability and observation make the workflow easier to examine.',
      },
      {
        title: 'Current stage',
        body: 'This work is in development. The current focus is LLM-assisted analysis with interpretable workflows, traceability and human review.',
      },
    ],
  },
  {
    id: 'full-stack',
    number: '03',
    discipline: 'FULL-STACK ENGINEERING',
    company: 'Axiom Technologies',
    title: 'One system.\nEvery layer considered.',
    description:
      'A replacement timesheet management system, connecting front-end state, REST APIs and backend persistence into a complete application.',
    outcome: 'From interface to persistence',
    tags: ['React', 'Redux', 'Node.js', 'MongoDB'],
    status: 'Engineering contribution',
    details: [
      {
        title: 'The problem',
        body: 'Axiom Technologies needed a replacement timesheet management system. The work spanned the interface, application state and backend data handling.',
      },
      {
        title: 'My contribution',
        body: 'I developed the replacement system using React, Redux and JavaScript, with REST APIs, Node.js and MongoDB.',
      },
      {
        title: 'How the layers connect',
        body: 'React and Redux support the interface and front-end state. REST APIs connect that client to the Node.js backend and MongoDB persistence. The illustration explains these roles at a conceptual level.',
      },
      {
        title: 'The result',
        body: 'A replacement timesheet application developed across the full stack during my June 2024 – December 2024 role.',
      },
    ],
  },
];

export const experience = [
  {
    company: 'Commonwealth Bank',
    role: 'Associate Software Engineer',
    dates: 'March 2025 – Present',
    detail:
      'Python performance engineering and LLM-assisted analysis in retail credit decisioning. Built a framework translating Polars rules into readable pseudocode, with updates back into code.',
    recognition: 'Quarterly MVP recognition',
  },
  {
    company: 'Axiom Technologies',
    role: 'Software Engineer',
    dates: 'June 2024 – December 2024',
    detail:
      'Developed a replacement timesheet management system across React, Redux, REST APIs, Node.js and MongoDB.',
  },
  {
    company: 'ABN AMRO Clearing Bank',
    role: 'Junior Developer',
    dates: 'December 2021 – April 2022',
    detail: 'Contributed to Python and SQL automation supporting daily transaction reporting.',
  },
];

export const capabilities = [
  {
    number: '01',
    title: 'Python & data',
    tools: 'Python · Polars · SQL',
    description: 'Making data-processing workflows more efficient and easier to work with.',
  },
  {
    number: '02',
    title: 'Applied AI',
    tools: 'RAG · Agent workflows · Langfuse',
    description:
      'Building contextual analysis with interpretability, human review and observability.',
  },
  {
    number: '03',
    title: 'Full-stack systems',
    tools: 'React · Redux · Node.js · REST · MongoDB',
    description:
      'Connecting interfaces, application state and persistence into practical software.',
  },
];

export type PersonalProject = {
  kind: 'sudoku' | 'transport' | 'movies';
  category: string;
  title: string;
  description: string;
  technologies: string;
  actions: { label: string; url: string }[];
};

export const personalProjects: PersonalProject[] = [
  {
    kind: 'sudoku',
    category: 'ALGORITHMS · LIVE DEMO',
    title: 'Sudoku Generator & Solver',
    description:
      'From preset puzzles to custom boards. A recursive backtracking solver turns a grid of constraints into a complete solution, with hints along the way.',
    technologies: 'JavaScript · HTML · CSS',
    actions: [
      { label: 'Try the puzzle', url: links.sudoku },
      { label: 'Source', url: links.sudokuSource },
    ],
  },
  {
    kind: 'transport',
    category: 'NETWORKING · SOURCE AVAILABLE',
    title: 'Reliable Transport Simulation',
    description:
      'Exploring reliability over UDP: sequence numbers, acknowledgements and retransmission, with simulated packet loss in both directions.',
    technologies: 'Python · UDP sockets · Networking',
    actions: [{ label: 'Explore the source', url: links.transport }],
  },
  {
    kind: 'movies',
    category: 'MACHINE LEARNING · SOURCE AVAILABLE',
    title: 'Movie Recommendation System',
    description:
      'Finding the next film through content similarity. TF-IDF and cosine similarity connect movie genres and keywords to a full-stack browsing experience.',
    technologies: 'Python · React · Node.js · MongoDB',
    actions: [{ label: 'Explore the source', url: links.recommender }],
  },
];
