import React, { useState } from 'react';
import { Github, Maximize2 } from 'lucide-react';
import ProjectModal from './ProjectModal';
import { Project } from '../types';
import { usePortfolio } from '../context/PortfolioContext';

const formatUrl = (url: string) => {
  if (!url) return '#';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:')) return url;
  if (url.startsWith('#')) return url;
  if (url.startsWith('/')) return url;
  return `https://${url}`;
};

interface ProjectCardProps {
  project: Project;
  onClick: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  // Prevent event bubbling for direct link clicks
  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      onClick={() => onClick(project)}
      className="group/card w-[85vw] md:w-[45vw] lg:w-[30vw] flex-shrink-0 bg-white dark:bg-dark-card rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800 transition-all hover:shadow-2xl hover:-translate-y-1 cursor-pointer"
    >
      <div className="relative h-48 sm:h-64 overflow-hidden">
        <img 
          src={project.image} 
          alt={project.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
          <span className="text-white font-medium flex items-center gap-2 px-4 py-2 border-2 border-white rounded-full">
            <Maximize2 size={16} /> View Details
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover/card:text-primary-600 transition-colors">{project.title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{project.description}</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {project.tags.map((tag) => (
            <span 
              key={tag} 
              className="px-3 py-1 text-xs font-medium text-primary-600 bg-primary-50 dark:bg-primary-900/20 dark:text-primary-400 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex gap-4">
          <a 
            href={formatUrl(project.demoUrl)} 
            onClick={handleLinkClick}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium hover:opacity-90 transition-opacity"
          >
            Live Demo
          </a>
          <a 
            href={formatUrl(project.githubUrl)}
            onClick={handleLinkClick} 
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Source
          </a>
        </div>
      </div>
    </div>
  );
};

const Projects: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { projects } = usePortfolio();

  const handleCardClick = (project: Project) => {
    setSelectedProject(project);
  };

  if (projects.length === 0) return null;

  return (
    <section id="projects" className="py-24 bg-gray-50 dark:bg-dark-bg transition-colors duration-300 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Featured Projects</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl">
            A selection of recent work involving full-stack development, UI design, and complex problem solving.
          </p>
        </div>
      </div>

      {/* Looping Carousel Container */}
      <div className="flex overflow-hidden group pb-8">
        {/* Strip 1 */}
        <div className="flex gap-6 pr-6 animate-scroll min-w-full shrink-0 items-stretch">
          {projects.map((project) => (
            <ProjectCard key={`p1-${project.id}`} project={project} onClick={handleCardClick} />
          ))}
        </div>
        {/* Strip 2 (Duplicate for infinite effect) */}
        <div className="flex gap-6 pr-6 animate-scroll min-w-full shrink-0 items-stretch" aria-hidden="true">
          {projects.map((project) => (
            <ProjectCard key={`p2-${project.id}`} project={project} onClick={handleCardClick} />
          ))}
        </div>
      </div>

      <ProjectModal 
        project={selectedProject} 
        isOpen={!!selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />
    </section>
  );
};

export default Projects;