import { Project, BlogPost, Profile } from './types';

export const PROFILE: Profile = {
  name: "Alex Dev",
  role: "Senior Frontend Engineer",
  title: "AlexDev.",
  email: "hello@alexdev.com",
  location: "San Francisco, CA",
  social: {
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    twitter: "https://twitter.com",
  },
  about: {
    summary: "I specialize in building accessible, pixel-perfect, and performant web applications using modern technologies like React, TypeScript, and Tailwind CSS.",
    description: [
      "I'm a passionate Senior Frontend Engineer with over 6 years of experience in building scalable web applications. My journey started with a curiosity for how things work on the internet, which quickly evolved into a career obsession with clean code and user-centric design.",
      "I've worked with startups and Fortune 500 companies, helping teams adopt modern frontend architecture and improve web performance. I love solving complex UI challenges and mentoring junior developers.",
      "When I'm not coding, you can find me hiking, reading sci-fi novels, or experimenting with new coffee brewing methods."
    ]
  },
  experience: [
    {
      company: "Tech Corp",
      role: "Senior Engineer",
      period: "2020 - Present"
    },
    {
      company: "Startup Inc",
      role: "Frontend Dev",
      period: "2017 - 2020"
    }
  ],
  education: [
    {
      school: "University of Tech",
      degree: "BS Computer Science",
      year: "2016"
    }
  ],
  skills: [
    { name: "React / Next.js", icon: "Code2", category: 'frontend' },
    { name: "TypeScript", icon: "Terminal", category: 'frontend' },
    { name: "Tailwind CSS", icon: "Layout", category: 'frontend' },
    { name: "Node.js", icon: "Database", category: 'backend' },
    { name: "GraphQL", icon: "Globe", category: 'backend' },
    { name: "PostgreSQL", icon: "Database", category: 'backend' },
    { name: "Docker", icon: "Cpu", category: 'tools' },
    { name: "Git / CI/CD", icon: "GitBranch", category: 'tools' },
    { name: "Mobile First", icon: "Smartphone", category: 'frontend' },
  ],
  currentlyLearning: ["Rust", "WebAssembly", "Cloud Native Architecture"]
};

export const PROJECTS: Project[] = [
  {
    id: 1,
    title: "E-Commerce Dashboard",
    description: "A comprehensive analytics dashboard for online retailers featuring real-time data visualization and inventory management.",
    longDescription: "This project is a high-performance admin dashboard designed for high-volume e-commerce stores. It aggregates data from multiple sales channels to provide real-time insights into revenue, customer acquisition cost, and inventory levels. We utilized D3.js for complex data visualization and implemented a custom caching layer to handle large datasets efficiently.",
    features: [
      "Real-time revenue tracking with WebSocket updates",
      "Interactive heatmaps for regional sales analysis",
      "Automated inventory low-stock alerts",
      "Role-based access control (RBAC) for team management"
    ],
    image: "https://picsum.photos/800/600?random=1",
    gallery: [
      "https://picsum.photos/800/600?random=101",
      "https://picsum.photos/800/600?random=102",
      "https://picsum.photos/800/600?random=103"
    ],
    tags: ["React", "TypeScript", "D3.js", "Tailwind"],
    demoUrl: "#",
    githubUrl: "#",
    caseStudyUrl: "#"
  },
  {
    id: 2,
    title: "AI Task Manager",
    description: "Smart task prioritization tool utilizing Gemini API to categorize and schedule daily engineering tasks automatically.",
    longDescription: "An intelligent productivity tool that uses Generative AI to parse unstructured brain dumps into structured tasks. The system analyzes task complexity and urgency to auto-schedule the developer's day. It features a natural language interface where users can simply speak or type their thoughts, and the AI organizes them into a kanban board.",
    features: [
      "Natural Language Processing for task entry",
      "Auto-categorization using Gemini 1.5 Pro",
      "Smart scheduling algorithm based on estimated effort",
      "Daily stand-up summary generation"
    ],
    image: "https://picsum.photos/800/600?random=2",
    gallery: [
      "https://picsum.photos/800/600?random=104",
      "https://picsum.photos/800/600?random=105"
    ],
    tags: ["Next.js", "Gemini API", "Prisma", "PostgreSQL"],
    demoUrl: "#",
    githubUrl: "#"
  },
  {
    id: 3,
    title: "Crypto Portfolio Tracker",
    description: "Real-time cryptocurrency tracking application with price alerts and portfolio performance charts.",
    longDescription: "A mobile-first progressive web app (PWA) that allows users to track their cryptocurrency investments across multiple wallets and exchanges. It connects to various public APIs to fetch live prices and calculates profit/loss in real-time. The app includes a customizable alert system that pushes notifications via Web Workers.",
    features: [
      "Multi-exchange API integration",
      "Real-time price WebSocket feeds",
      "Push notifications for price thresholds",
      "Offline mode support with PWA caching"
    ],
    image: "https://picsum.photos/800/600?random=3",
    gallery: [
      "https://picsum.photos/800/600?random=106",
      "https://picsum.photos/800/600?random=107"
    ],
    tags: ["React Native", "Redux", "Node.js", "WebSockets"],
    demoUrl: "#",
    githubUrl: "#",
    caseStudyUrl: "#"
  },
  {
    id: 4,
    title: "Social Media Scheduler",
    description: "A platform to schedule and automate posts across Twitter, LinkedIn, and Instagram with built-in image editor.",
    longDescription: "A SaaS platform designed for social media managers to streamline their workflow. It supports scheduling posts for multiple platforms from a single calendar view. The built-in image editor allows for quick cropping and filtering using WebGL, ensuring images are optimized for each platform's requirements before posting.",
    features: [
      "Drag-and-drop calendar interface",
      "In-browser image editing with WebGL",
      "Team collaboration and approval workflows",
      "Analytics reporting for post engagement"
    ],
    image: "https://picsum.photos/800/600?random=4",
    gallery: [
      "https://picsum.photos/800/600?random=108",
      "https://picsum.photos/800/600?random=109"
    ],
    tags: ["Vue.js", "Firebase", "Cloud Functions"],
    demoUrl: "#",
    githubUrl: "#"
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    title: "Mastering React Server Components",
    excerpt: "A deep dive into the architecture of RSC and how it changes the way we build modern web applications.",
    date: "Oct 12, 2023",
    readTime: "5 min read",
    slug: "react-server-components",
    link: "https://react.dev/blog"
  },
  {
    id: 2,
    title: "The Future of CSS: Tailwind vs. CSS-in-JS",
    excerpt: "Analyzing the performance and developer experience trade-offs between utility-first CSS and styled-components.",
    date: "Nov 03, 2023",
    readTime: "4 min read",
    slug: "tailwind-vs-css-in-js",
    link: "https://tailwindcss.com/blog"
  },
  {
    id: 3,
    title: "Optimizing Web Performance in 2024",
    excerpt: "Key strategies for improving Core Web Vitals, from image optimization to code splitting strategies.",
    date: "Dec 15, 2023",
    readTime: "7 min read",
    slug: "web-performance-2024",
    link: "https://web.dev/blog"
  }
];