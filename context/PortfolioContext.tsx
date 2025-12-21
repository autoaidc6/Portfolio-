import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { PROFILE as DEFAULT_PROFILE, PROJECTS as DEFAULT_PROJECTS, BLOG_POSTS as DEFAULT_BLOGS, SKILLS as DEFAULT_SKILLS } from '../constants';
import { Profile, Project, BlogPost, Skill } from '../types';

interface PortfolioContextType {
  profile: Profile;
  projects: Project[];
  blogs: BlogPost[];
  skills: Skill[];
  loading: boolean;
  refreshData: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType>({
  profile: DEFAULT_PROFILE,
  projects: DEFAULT_PROJECTS,
  blogs: DEFAULT_BLOGS,
  skills: DEFAULT_SKILLS,
  loading: false,
  refreshData: async () => {},
});

export const usePortfolio = () => useContext(PortfolioContext);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const [blogs, setBlogs] = useState<BlogPost[]>(DEFAULT_BLOGS);
  const [skills, setSkills] = useState<Skill[]>(DEFAULT_SKILLS); // Skills usually static or part of profile
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch Profile
      // We assume a table 'profile' with a column 'data' containing the JSON
      const { data: profileData } = await supabase.from('profile').select('*').limit(1).single();
      if (profileData?.data) {
        setProfile(profileData.data as Profile);
      }

      // Fetch Projects
      const { data: projectsData } = await supabase.from('projects').select('*').order('id', { ascending: true });
      if (projectsData && projectsData.length > 0) {
        setProjects(projectsData as Project[]);
      }

      // Fetch Blogs
      const { data: blogsData } = await supabase.from('blogs').select('*').order('date', { ascending: false });
      if (blogsData && blogsData.length > 0) {
        setBlogs(blogsData as BlogPost[]);
      }

    } catch (error) {
      console.error("Error fetching data from Supabase, falling back to constants:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <PortfolioContext.Provider value={{ profile, projects, blogs, skills, loading, refreshData: fetchData }}>
      {children}
    </PortfolioContext.Provider>
  );
};