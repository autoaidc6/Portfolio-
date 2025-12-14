import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Github, ExternalLink, FileText, CheckCircle2 } from 'lucide-react';
import { Project } from '../types';

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ project, isOpen, onClose }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!project) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-all"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              layoutId={`project-${project.id}`}
              className="bg-white dark:bg-dark-card w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto border border-gray-200 dark:border-gray-700"
            >
              {/* Modal Header / Main Image */}
              <div className="relative h-48 sm:h-72 lg:h-80 flex-shrink-0">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-colors"
                >
                  <X size={24} />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 sm:p-8">
                  <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">{project.title}</h2>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 text-xs font-medium text-white bg-primary-600/80 rounded-full backdrop-blur-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto flex-1 p-6 sm:p-8 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                  
                  {/* Left Column: Description & Gallery */}
                  <div className="lg:col-span-2 space-y-8">
                    <section>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">About the Project</h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                        {project.longDescription || project.description}
                      </p>
                    </section>

                    {project.gallery && project.gallery.length > 0 && (
                      <section>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Project Gallery</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {project.gallery.map((img, idx) => (
                            <img 
                              key={idx}
                              src={img}
                              alt={`Gallery ${idx + 1}`}
                              className="rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700 object-cover w-full h-48"
                            />
                          ))}
                        </div>
                      </section>
                    )}
                  </div>

                  {/* Right Column: Key Features & Links */}
                  <div className="space-y-8">
                    {project.features && (
                      <section className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Key Features</h3>
                        <ul className="space-y-3">
                          {project.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-gray-600 dark:text-gray-300 text-sm">
                              <CheckCircle2 size={18} className="text-primary-500 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}

                    <section className="flex flex-col gap-3">
                      <a 
                        href={project.demoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
                      >
                        <ExternalLink size={20} /> View Live Demo
                      </a>
                      <a 
                        href={project.githubUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold transition-colors border border-gray-200 dark:border-gray-600"
                      >
                        <Github size={20} /> View Source Code
                      </a>
                      {project.caseStudyUrl && (
                        <a 
                          href={project.caseStudyUrl}
                          className="flex items-center justify-center gap-2 w-full py-3 border-2 border-primary-100 dark:border-primary-900/30 hover:border-primary-500 dark:hover:border-primary-500 text-primary-600 dark:text-primary-400 rounded-lg font-semibold transition-colors"
                        >
                          <FileText size={20} /> Read Case Study
                        </a>
                      )}
                    </section>
                  </div>

                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProjectModal;