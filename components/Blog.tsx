import React from 'react';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

const Blog: React.FC = () => {
  const { blogs } = usePortfolio();

  if (blogs.length === 0) return null;

  return (
    <section id="blog" className="py-24 bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Latest Insights</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Thoughts on software engineering, architecture, and the evolving tech landscape.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((post) => (
            <article 
              key={post.id} 
              className="bg-white dark:bg-dark-card p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
            >
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                <span className="flex items-center gap-1">
                  <Calendar size={14} /> {post.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} /> {post.readTime}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 transition-colors">
                <a href={`#blog/${post.slug}`}>{post.title}</a>
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6 flex-grow">
                {post.excerpt}
              </p>
              
              <a 
                href={`#blog/${post.slug}`} 
                className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors mt-auto"
              >
                Read Article <ArrowRight size={16} className="ml-1" />
              </a>
            </article>
          ))}
        </div>

        <div className="text-center mt-12">
          <a href="#" className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 uppercase tracking-widest transition-colors">
            View All Posts
          </a>
        </div>
      </div>
    </section>
  );
};

export default Blog;