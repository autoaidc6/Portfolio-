import React from 'react';

export interface Project {
  id: number;
  title: string;
  description: string;
  longDescription?: string;
  features?: string[];
  image: string;
  gallery?: string[];
  tags: string[];
  demoUrl: string;
  githubUrl: string;
  caseStudyUrl?: string;
}

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  slug: string;
  link?: string;
}

export interface Skill {
  name: string;
  icon: React.ReactNode;
  category: 'frontend' | 'backend' | 'tools';
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: React.ReactNode;
}

export interface Experience {
  company: string;
  role: string;
  period: string;
}

export interface Education {
  school: string;
  degree: string;
  year?: string;
}

export interface Profile {
  name: string;
  role: string;
  title: string;
  email: string;
  social: {
    github: string;
    linkedin: string;
    twitter: string;
  };
  about: {
    summary: string;
    description: string[];
  };
  experience: Experience[];
  education: Education[];
}