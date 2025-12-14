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