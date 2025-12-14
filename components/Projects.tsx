import React, { useRef, useState } from 'react';
import { Github, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import ProjectModal from './ProjectModal';
import { Project } from '../types';
import { usePortfolio } from '../context/PortfolioContext';

const Projects: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { projects } = usePortfolio();

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = current.clientWidth * 0.8; // Scroll 80% of view width
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const handleCardClick = (project: Project) => {
    setSelectedProject(project);
  };

  // Prevent event bubbling for direct link clicks
  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (projects.length === 0) return null;

  return (
    <section id="projects" className="py-24 bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Featured Projects</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl">
              A selection of recent work involving full-stack development, UI design, and complex problem solving.
            </p>
          </div>
          <div className="hidden md:flex gap-2">
            <button 
              onClick={() => scroll('left')}
              className="p-2 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="p-2 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory no-scrollbar"
        >
          {projects.map((project) => (
            <div 
              key={project.id} 
              onClick={() => handleCardClick(project)}
              className="group min-w-[85vw] md:min-w-[45vw] lg:min-w-[30vw] snap-start bg-white dark:bg-dark-card rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800 transition-all hover:shadow-2xl hover:-translate-y-1 cursor-pointer"
            >
              <div className="relative h-48 sm:h-64 overflow-hidden">
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                  <span className="text-white font-medium flex items-center gap-2 px-4 py-2 border-2 border-white rounded-full">
                    <Maximize2 size={16} /> View Details
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors">{project.title}</h3>
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
                    href={project.demoUrl} 
                    onClick={handleLinkClick}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium hover:opacity-90 transition-opacity"
                  >
                    Live Demo
                  </a>
                  <a 
                    href={project.githubUrl}
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
          ))}
          
          {/* Spacer for right padding in scroll view */}
          <div className="min-w-[1px] opacity-0"></div>
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