import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Download } from 'lucide-react';
import { PROFILE } from '../constants';

const Hero: React.FC = () => {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center pt-16 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-20 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-primary-500/10 blur-3xl -z-10"></div>
      <div className="absolute bottom-20 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 text-center md:text-left"
          >
            <h2 className="text-sm uppercase tracking-wider text-primary-600 font-semibold mb-4">
              {PROFILE.role}
            </h2>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gray-900 dark:text-white tight-leading">
              Building digital <br className="hidden md:block"/>
              <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                experiences
              </span> that matter.
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto md:mx-0">
              {PROFILE.about.summary}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <a 
                href="#projects"
                className="group inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-full transition-all duration-200 shadow-lg shadow-primary-500/30"
              >
                View Projects
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a 
                href="#"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition-all duration-200"
              >
                Download Resume
                <Download className="ml-2 h-5 w-5" />
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 relative"
          >
            <div className="relative w-72 h-72 md:w-96 md:h-96 mx-auto">
               <div className="absolute inset-0 bg-gradient-to-tr from-primary-500 to-purple-500 rounded-[2rem] rotate-6 opacity-20 animate-pulse"></div>
               <img 
                 src="https://picsum.photos/600/600?random=10" 
                 alt="Portrait" 
                 className="relative w-full h-full object-cover rounded-[2rem] shadow-2xl border-4 border-white dark:border-gray-800 grayscale hover:grayscale-0 transition-all duration-500"
               />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;