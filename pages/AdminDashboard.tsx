import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import { LogOut, Database, Save } from 'lucide-react';
import { PROFILE, PROJECTS } from '../constants';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { profile, projects, refreshData } = usePortfolio();
  const [activeTab, setActiveTab] = useState<'overview' | 'projects'>('overview');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/login');
      }
    });
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const seedDatabase = async () => {
    if (!window.confirm('This will overwrite database content with local constants. Continue?')) return;
    
    setLoading(true);
    setMessage('');
    
    try {
      // Seed Profile
      const { error: profileError } = await supabase
        .from('profile')
        .upsert({ id: 1, data: PROFILE }); // Single row ID 1

      // Seed Projects
      // First delete all
      await supabase.from('projects').delete().neq('id', 0);
      
      const { error: projectsError } = await supabase
        .from('projects')
        .insert(PROJECTS);

      if (profileError || projectsError) throw new Error('Failed to seed data');
      
      setMessage('Database seeded successfully!');
      refreshData();
    } catch (e) {
      console.error(e);
      setMessage('Error seeding database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-bg text-gray-900 dark:text-white">
      <nav className="bg-white dark:bg-dark-card shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Logged in</span>
              <button
                onClick={handleLogout}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white dark:bg-dark-card shadow rounded-lg p-4">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'overview' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('projects')}
                  className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'projects' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                  Projects
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-12 md:col-span-9">
            {activeTab === 'overview' && (
              <div className="bg-white dark:bg-dark-card shadow rounded-lg p-6">
                <h2 className="text-lg font-medium mb-4">Database Management</h2>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-6">
                  <h3 className="text-sm font-bold text-yellow-800 dark:text-yellow-400 mb-2">Initial Setup</h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
                    If your database is empty, you can seed it with the data from your local configuration file.
                  </p>
                  <button
                    onClick={seedDatabase}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md text-sm font-medium transition-colors"
                  >
                    <Database size={16} />
                    {loading ? 'Seeding...' : 'Seed Database from Constants'}
                  </button>
                  {message && <p className="mt-2 text-sm font-medium">{message}</p>}
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="bg-white dark:bg-dark-card shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h3 className="text-lg font-medium">Projects ({projects.length})</h3>
                  <button className="px-3 py-1.5 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700">
                    Add New
                  </button>
                </div>
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {projects.map((project) => (
                    <li key={project.id} className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img src={project.image} alt="" className="h-10 w-10 rounded object-cover" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{project.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{project.description}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-primary-600 hover:text-primary-800 text-sm font-medium">Edit</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;