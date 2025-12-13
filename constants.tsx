import React from 'react';
import { Project, BlogPost, Skill } from './types';
import { Code2, Globe, Database, Cpu, Layout, Smartphone, Terminal, GitBranch } from 'lucide-react';

export const PROJECTS: Project[] = [
  {
    id: 1,
    title: "E-Commerce Dashboard",
    description: "A comprehensive analytics dashboard for online retailers featuring real-time data visualization and inventory management.",
    image: "https://picsum.photos/800/600?random=1",
    tags: ["React", "TypeScript", "D3.js", "Tailwind"],
    demoUrl: "#",
    githubUrl: "#"
  },
  {
    id: 2,
    title: "AI Task Manager",
    description: "Smart task prioritization tool utilizing Gemini API to categorize and schedule daily engineering tasks automatically.",
    image: "https://picsum.photos/800/600?random=2",
    tags: ["Next.js", "Gemini API", "Prisma", "PostgreSQL"],
    demoUrl: "#",
    githubUrl: "#"
  },
  {
    id: 3,
    title: "Crypto Portfolio Tracker",
    description: "Real-time cryptocurrency tracking application with price alerts and portfolio performance charts.",
    image: "https://picsum.photos/800/600?random=3",
    tags: ["React Native", "Redux", "Node.js", "WebSockets"],
    demoUrl: "#",
    githubUrl: "#"
  },
  {
    id: 4,
    title: "Social Media Scheduler",
    description: "A platform to schedule and automate posts across Twitter, LinkedIn, and Instagram with built-in image editor.",
    image: "https://picsum.photos/800/600?random=4",
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
    slug: "react-server-components"
  },
  {
    id: 2,
    title: "The Future of CSS: Tailwind vs. CSS-in-JS",
    excerpt: "Analyzing the performance and developer experience trade-offs between utility-first CSS and styled-components.",
    date: "Nov 03, 2023",
    readTime: "4 min read",
    slug: "tailwind-vs-css-in-js"
  },
  {
    id: 3,
    title: "Optimizing Web Performance in 2024",
    excerpt: "Key strategies for improving Core Web Vitals, from image optimization to code splitting strategies.",
    date: "Dec 15, 2023",
    readTime: "7 min read",
    slug: "web-performance-2024"
  }
];

export const SKILLS: Skill[] = [
  { name: "React / Next.js", icon: <Code2 size={20} />, category: 'frontend' },
  { name: "TypeScript", icon: <Terminal size={20} />, category: 'frontend' },
  { name: "Tailwind CSS", icon: <Layout size={20} />, category: 'frontend' },
  { name: "Node.js", icon: <Database size={20} />, category: 'backend' },
  { name: "GraphQL", icon: <Globe size={20} />, category: 'backend' },
  { name: "PostgreSQL", icon: <Database size={20} />, category: 'backend' },
  { name: "Docker", icon: <Cpu size={20} />, category: 'tools' },
  { name: "Git / CI/CD", icon: <GitBranch size={20} />, category: 'tools' },
  { name: "Mobile First", icon: <Smartphone size={20} />, category: 'frontend' },
];