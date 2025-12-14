import React from 'react';
import { SKILLS, PROFILE } from '../constants';
import { Briefcase, GraduationCap } from 'lucide-react';

const About: React.FC = () => {
  return (
    <section id="about" className="py-24 bg-white dark:bg-dark-bg transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* Left Column: Bio */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">About Me</h2>
            <div className="prose dark:prose-invert text-gray-600 dark:text-gray-400 mb-8">
              {PROFILE.about.description.map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="space-y-6">
              {PROFILE.experience.map((exp, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-lg">
                      <Briefcase size={24} />
                  </div>
                  <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">{index === 0 ? "Experience" : ""}</h4>
                      <p className="font-medium text-gray-800 dark:text-gray-200">{exp.role} at {exp.company}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{exp.period}</p>
                  </div>
                </div>
              ))}
              
              {PROFILE.education.map((edu, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
                      <GraduationCap size={24} />
                  </div>
                  <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">{index === 0 ? "Education" : ""}</h4>
                      <p className="font-medium text-gray-800 dark:text-gray-200">{edu.degree}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{edu.school} {edu.year ? `(${edu.year})` : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Skills */}
          <div className="bg-gray-50 dark:bg-dark-card rounded-2xl p-8 border border-gray-100 dark:border-gray-800">
             <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Technical Skills</h3>
             
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {SKILLS.map((skill) => (
                  <div key={skill.name} className="flex flex-col items-center justify-center p-4 bg-white dark:bg-dark-bg rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-colors group">
                    <div className="text-gray-400 group-hover:text-primary-500 mb-3 transition-colors">
                      {skill.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">{skill.name}</span>
                  </div>
                ))}
             </div>

             <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
               <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Currently Learning</h4>
               <div className="flex gap-3">
                 <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Rust</span>
                 <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">WebAssembly</span>
                 <span className="px-3 py-1 text-xs rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">Gemini 1.5 Pro</span>
               </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;