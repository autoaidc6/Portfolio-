import React from 'react';
import { Github, Linkedin, Mail, Twitter, Lock } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { profile } = usePortfolio();

  return (
    <footer id="contact" className="bg-white dark:bg-dark-card border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{profile.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Building the web, one component at a time.
            </p>
          </div>

          <div className="flex gap-6">
            <a href={profile.social.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-600 dark:hover:text-white transition-colors">
              <span className="sr-only">GitHub</span>
              <Github size={24} />
            </a>
            <a href={profile.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 dark:hover:text-white transition-colors">
              <span className="sr-only">LinkedIn</span>
              <Linkedin size={24} />
            </a>
            <a href={profile.social.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-sky-500 dark:hover:text-white transition-colors">
              <span className="sr-only">Twitter</span>
              <Twitter size={24} />
            </a>
            <a href={`mailto:${profile.email}`} className="text-gray-400 hover:text-red-500 dark:hover:text-white transition-colors">
              <span className="sr-only">Email</span>
              <Mail size={24} />
            </a>
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {currentYear} {profile.name}. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0 items-center">
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy Policy</a>
            <a href="/login" className="flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors" aria-label="Admin Login">
              <Lock size={12} />
              <span>Admin</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;