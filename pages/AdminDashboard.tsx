import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import { LogOut, Database, Save, Loader2, Plus, ArrowLeft, Trash2, X, AlertCircle } from 'lucide-react';
import { PROFILE, PROJECTS } from '../constants';
import { Project, Profile } from '../types';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { profile, projects, refreshData } = usePortfolio();
  
  // UI State
  const [activeTab, setActiveTab] = useState<'overview' | 'projects'>('overview');
  const [authLoading, setAuthLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Project Form State
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Partial<Project>>({});

  // Profile Form State
  const [profileJson, setProfileJson] = useState<string>('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/login');
      } else {
        setAuthLoading(false);
      }
    });
  }, [navigate]);

  useEffect(() => {
    if (profile) {
      setProfileJson(JSON.stringify(profile, null, 2));
    }
  }, [profile]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // --- Database Seeding ---
  const seedDatabase = async () => {
    if (!window.confirm('This will overwrite database content with local constants. Continue?')) return;
    
    setActionLoading(true);
    try {
      const { error: profileError } = await supabase
        .from('profile')
        .upsert({ id: 1, data: PROFILE });

      await supabase.from('projects').delete().neq('id', 0);
      const { error: projectsError } = await supabase
        .from('projects')
        .insert(PROJECTS);

      if (profileError || projectsError) throw new Error('Failed to seed data');
      
      showMessage('success', 'Database seeded successfully!');
      refreshData();
    } catch (e: any) {
      showMessage('error', e.message || 'Error seeding database');
    } finally {
      setActionLoading(false);
    }
  };

  // --- Profile Logic ---
  const handleSaveProfile = async () => {
    setActionLoading(true);
    try {
      let parsedProfile;
      try {
        parsedProfile = JSON.parse(profileJson);
      } catch (e) {
        throw new Error('Invalid JSON format');
      }

      const { error } = await supabase
        .from('profile')
        .upsert({ id: 1, data: parsedProfile });

      if (error) throw error;
      
      showMessage('success', 'Profile updated successfully!');
      refreshData();
    } catch (e: any) {
      showMessage('error', e.message || 'Error updating profile');
    } finally {
      setActionLoading(false);
    }
  };

  // --- Project Logic ---
  const openNewProjectForm = () => {
    setEditingProject({});
    setIsProjectFormOpen(true);
  };

  const openEditProjectForm = (project: Project) => {
    setEditingProject({ ...project });
    setIsProjectFormOpen(true);
  };

  const handleDeleteProject = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    
    setActionLoading(true);
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      
      showMessage('success', 'Project deleted successfully');
      refreshData();
    } catch (e: any) {
      showMessage('error', e.message || 'Error deleting project');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      // Prepare data for submission
      const projectData = {
        ...editingProject,
        // Ensure arrays are arrays
        tags: Array.isArray(editingProject.tags) ? editingProject.tags : [],
        features: Array.isArray(editingProject.features) ? editingProject.features : [],
        gallery: Array.isArray(editingProject.gallery) ? editingProject.gallery : [],
      };

      // Remove ID if it's undefined (for new creation)
      if (!projectData.id) {
        delete projectData.id;
      }

      const { error } = await supabase
        .from('projects')
        .upsert(projectData as any); // Type assertion needed for partial updates

      if (error) throw error;

      showMessage('success', `Project ${editingProject.id ? 'updated' : 'created'} successfully!`);
      setIsProjectFormOpen(false);
      refreshData();
    } catch (e: any) {
      showMessage('error', e.message || 'Error saving project');
    } finally {
      setActionLoading(false);
    }
  };

  const updateProjectField = (field: keyof Project, value: any) => {
    setEditingProject(prev => ({ ...prev, [field]: value }));
  };

  const updateArrayField = (field: 'tags' | 'features', value: string) => {
    // Split by comma or newline depending on field
    const separator = field === 'features' ? '\n' : ',';
    const array = value.split(separator).map(item => item.trim()).filter(item => item !== '');
    updateProjectField(field, array);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
        <Loader2 className="animate-spin text-primary-600" size={32} />
      </div>
    );
  }

  // --- Project Form Render ---
  if (isProjectFormOpen) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-dark-bg text-gray-900 dark:text-white p-6">
        <div className="max-w-4xl mx-auto bg-white dark:bg-dark-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
            <h2 className="text-xl font-bold">{editingProject.id ? 'Edit Project' : 'New Project'}</h2>
            <button 
              onClick={() => setIsProjectFormOpen(false)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSaveProject} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                <input 
                  type="text" 
                  required
                  value={editingProject.title || ''}
                  onChange={e => updateProjectField('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Image URL</label>
                <input 
                  type="text" 
                  required
                  value={editingProject.image || ''}
                  onChange={e => updateProjectField('image', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Short Description</label>
              <textarea 
                required
                rows={2}
                value={editingProject.description || ''}
                onChange={e => updateProjectField('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Long Description (Optional)</label>
              <textarea 
                rows={4}
                value={editingProject.longDescription || ''}
                onChange={e => updateProjectField('longDescription', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Demo URL</label>
                <input 
                  type="text" 
                  value={editingProject.demoUrl || ''}
                  onChange={e => updateProjectField('demoUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">GitHub URL</label>
                <input 
                  type="text" 
                  value={editingProject.githubUrl || ''}
                  onChange={e => updateProjectField('githubUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Case Study URL</label>
                <input 
                  type="text" 
                  value={editingProject.caseStudyUrl || ''}
                  onChange={e => updateProjectField('caseStudyUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags (comma separated)</label>
                <input 
                  type="text" 
                  value={editingProject.tags?.join(', ') || ''}
                  onChange={e => updateArrayField('tags', e.target.value)}
                  placeholder="React, TypeScript, Tailwind"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Features (one per line)</label>
                <textarea 
                  rows={4}
                  value={editingProject.features?.join('\n') || ''}
                  onChange={e => updateArrayField('features', e.target.value)}
                  placeholder="Real-time tracking&#10;Dark mode support"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700">
              <button 
                type="button" 
                onClick={() => setIsProjectFormOpen(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={actionLoading}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Save Project
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --- Main Dashboard Render ---
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-bg text-gray-900 dark:text-white pb-20">
      
      {/* Toast Message */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
           {message.type === 'error' && <AlertCircle size={18} />}
           {message.text}
        </div>
      )}

      <nav className="bg-white dark:bg-dark-card shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/')} className="md:hidden text-gray-500"><ArrowLeft size={20} /></button>
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleLogout}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                title="Logout"
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
            <div className="bg-white dark:bg-dark-card shadow rounded-lg p-4 sticky top-24">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                  Overview & Profile
                </button>
                <button
                  onClick={() => setActiveTab('projects')}
                  className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'projects' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                  Projects
                </button>
              </nav>
              
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                 <button
                    onClick={seedDatabase}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? <Loader2 className="animate-spin" size={16} /> : <Database size={16} />}
                    Reset / Seed DB
                  </button>
                  <p className="text-xs text-center mt-2 text-gray-500">Resets all data to constants</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-12 md:col-span-9">
            
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-dark-card shadow rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium">Profile Configuration</h2>
                    <button 
                      onClick={handleSaveProfile}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                      Save Profile
                    </button>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800 dark:text-blue-300 flex gap-2">
                      <AlertCircle size={18} className="flex-shrink-0" />
                      <span>Edit the raw JSON below to update your profile information, experience, education, and social links. This gives you full control over the data structure.</span>
                    </p>
                  </div>

                  <textarea 
                    value={profileJson}
                    onChange={(e) => setProfileJson(e.target.value)}
                    className="w-full h-[600px] font-mono text-sm p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                    spellCheck={false}
                  />
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="bg-white dark:bg-dark-card shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                  <h3 className="text-lg font-medium">Projects ({projects.length})</h3>
                  <button 
                    onClick={openNewProjectForm}
                    className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors flex items-center gap-2"
                  >
                    <Plus size={16} /> Add New
                  </button>
                </div>
                
                {projects.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No projects found. Click "Add New" to create one.
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {projects.map((project) => (
                      <li key={project.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <img 
                            src={project.image} 
                            alt="" 
                            className="h-16 w-16 rounded-md object-cover border border-gray-200 dark:border-gray-700" 
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=Img'; }}
                          />
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{project.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 max-w-xs md:max-w-md">{project.description}</p>
                            <div className="flex gap-2 mt-1">
                              {project.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-400">{tag}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 self-end sm:self-auto">
                          <button 
                            onClick={() => openEditProjectForm(project)}
                            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteProject(project.id)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;