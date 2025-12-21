import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import { LogOut, Database, Save, Loader2, Plus, ArrowLeft, Trash2, X, AlertCircle, FileText, Mail, Layout, User } from 'lucide-react';
import { PROFILE, PROJECTS, BLOG_POSTS } from '../constants';
import { Project, Profile, BlogPost } from '../types';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { profile, projects, blogs, refreshData } = usePortfolio();
  
  // UI State
  const [activeTab, setActiveTab] = useState<'overview' | 'main' | 'projects' | 'blog' | 'contact'>('main');
  const [authLoading, setAuthLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Project Form State
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Partial<Project>>({});

  // Blog Form State
  const [isBlogFormOpen, setIsBlogFormOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Partial<BlogPost>>({});

  // Main Section Form State
  const [mainForm, setMainForm] = useState({
    name: '',
    role: '',
    title: '',
    summary: '',
    description: '',
    technicalSkills: '',
    currentlyLearning: ''
  });

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    email: '',
    github: '',
    linkedin: '',
    twitter: ''
  });

  // Profile Form State (Raw JSON)
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
      
      setMainForm({
        name: profile.name || '',
        role: profile.role || '',
        title: profile.title || '',
        summary: profile.about?.summary || '',
        description: profile.about?.description?.join('\n\n') || '',
        technicalSkills: profile.technicalSkills || '',
        currentlyLearning: profile.currentlyLearning || ''
      });

      setContactForm({
        email: profile.email || '',
        github: profile.social?.github || '',
        linkedin: profile.social?.linkedin || '',
        twitter: profile.social?.twitter || ''
      });
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
      // Seed Profile
      const { error: profileError } = await supabase
        .from('profile')
        .upsert({ id: 1, data: PROFILE });

      // Seed Projects
      await supabase.from('projects').delete().neq('id', 0);
      const { error: projectsError } = await supabase
        .from('projects')
        .insert(PROJECTS);

      // Seed Blogs
      await supabase.from('blogs').delete().neq('id', 0);
      const { error: blogsError } = await supabase
        .from('blogs')
        .insert(BLOG_POSTS);

      if (profileError || projectsError || blogsError) throw new Error('Failed to seed data');
      
      showMessage('success', 'Database seeded successfully!');
      refreshData();
    } catch (e: any) {
      console.error('Seeding error:', e);
      showMessage('error', e.message || 'Error seeding database');
    } finally {
      setActionLoading(false);
    }
  };

  // --- Profile/Main/Contact Logic ---
  const handleSaveProfileRaw = async () => {
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

  const handleSaveMain = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const newProfile: Profile = {
        ...profile,
        name: mainForm.name,
        role: mainForm.role,
        title: mainForm.title,
        technicalSkills: mainForm.technicalSkills,
        currentlyLearning: mainForm.currentlyLearning,
        about: {
          ...profile.about,
          summary: mainForm.summary,
          description: mainForm.description.split('\n\n').filter(p => p.trim() !== '')
        }
      };

      const { error } = await supabase
        .from('profile')
        .upsert({ id: 1, data: newProfile });

      if (error) throw error;
      
      showMessage('success', 'Main section updated successfully!');
      refreshData();
    } catch (e: any) {
      showMessage('error', e.message || 'Error updating main section');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const newProfile = {
        ...profile,
        email: contactForm.email,
        social: {
          ...profile.social,
          github: contactForm.github,
          linkedin: contactForm.linkedin,
          twitter: contactForm.twitter
        }
      };

      const { error } = await supabase
        .from('profile')
        .upsert({ id: 1, data: newProfile });

      if (error) throw error;
      
      showMessage('success', 'Contact info updated successfully!');
      refreshData();
    } catch (e: any) {
      showMessage('error', e.message || 'Error updating contact info');
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
      // Explicitly pick fields to avoid sending extra properties like 'created_at'
      const { id, title, description, longDescription, image, demoUrl, githubUrl, caseStudyUrl } = editingProject;
      
      const projectData: any = {
        title: title || '',
        description: description || '',
        longDescription: longDescription || null,
        image: image || '',
        demoUrl: demoUrl || null,
        githubUrl: githubUrl || null,
        caseStudyUrl: caseStudyUrl || null,
        tags: Array.isArray(editingProject.tags) ? editingProject.tags : [],
        features: Array.isArray(editingProject.features) ? editingProject.features : [],
        gallery: Array.isArray(editingProject.gallery) ? editingProject.gallery : [],
      };

      if (id) {
        projectData.id = id;
      }

      const { error } = await supabase.from('projects').upsert(projectData);

      if (error) throw error;

      showMessage('success', `Project ${editingProject.id ? 'updated' : 'created'} successfully!`);
      setIsProjectFormOpen(false);
      refreshData();
    } catch (e: any) {
      console.error('Project save error:', e);
      showMessage('error', e.message || 'Error saving project');
    } finally {
      setActionLoading(false);
    }
  };

  const updateProjectField = (field: keyof Project, value: any) => {
    setEditingProject(prev => ({ ...prev, [field]: value }));
  };

  const updateProjectArrayField = (field: 'tags' | 'features', value: string) => {
    const separator = field === 'features' ? '\n' : ',';
    const array = value.split(separator).map(item => item.trim()).filter(item => item !== '');
    updateProjectField(field, array);
  };

  // --- Blog Logic ---
  const openNewBlogForm = () => {
    setEditingBlog({ date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) });
    setIsBlogFormOpen(true);
  };

  const openEditBlogForm = (blog: BlogPost) => {
    setEditingBlog({ ...blog });
    setIsBlogFormOpen(true);
  };

  const handleDeleteBlog = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    setActionLoading(true);
    try {
      const { error } = await supabase.from('blogs').delete().eq('id', id);
      if (error) throw error;
      
      showMessage('success', 'Post deleted successfully');
      refreshData();
    } catch (e: any) {
      showMessage('error', e.message || 'Error deleting post');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      // Explicitly pick fields to avoid sending extra properties like 'created_at'
      const { id, title, excerpt, date, readTime, slug, link } = editingBlog;
      
      const blogData: any = {
        title: title || '',
        excerpt: excerpt || '',
        date: date || '',
        readTime: readTime || '',
        slug: slug || '',
        link: link || null
      };

      if (id) {
        blogData.id = id;
      }

      const { error } = await supabase.from('blogs').upsert(blogData);

      if (error) throw error;

      showMessage('success', `Post ${editingBlog.id ? 'updated' : 'created'} successfully!`);
      setIsBlogFormOpen(false);
      refreshData();
    } catch (e: any) {
      console.error('Blog save error:', e);
      showMessage('error', e.message || 'Error saving post');
    } finally {
      setActionLoading(false);
    }
  };

  const updateBlogField = (field: keyof BlogPost, value: any) => {
    setEditingBlog(prev => ({ ...prev, [field]: value }));
  };


  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
        <Loader2 className="animate-spin text-primary-600" size={32} />
      </div>
    );
  }

  // --- Forms Rendering ---

  // Project Form
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
                  onChange={e => updateProjectArrayField('tags', e.target.value)}
                  placeholder="React, TypeScript, Tailwind"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Features (one per line)</label>
                <textarea 
                  rows={4}
                  value={editingProject.features?.join('\n') || ''}
                  onChange={e => updateProjectArrayField('features', e.target.value)}
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

  // Blog Form
  if (isBlogFormOpen) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-dark-bg text-gray-900 dark:text-white p-6">
        <div className="max-w-2xl mx-auto bg-white dark:bg-dark-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
            <h2 className="text-xl font-bold">{editingBlog.id ? 'Edit Post' : 'New Post'}</h2>
            <button 
              onClick={() => setIsBlogFormOpen(false)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSaveBlog} className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
              <input 
                type="text" 
                required
                value={editingBlog.title || ''}
                onChange={e => updateBlogField('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Excerpt</label>
              <textarea 
                required
                rows={3}
                value={editingBlog.excerpt || ''}
                onChange={e => updateBlogField('excerpt', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                <input 
                  type="text" 
                  required
                  value={editingBlog.date || ''}
                  onChange={e => updateBlogField('date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Read Time</label>
                <input 
                  type="text" 
                  required
                  value={editingBlog.readTime || ''}
                  onChange={e => updateBlogField('readTime', e.target.value)}
                  placeholder="5 min read"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Slug</label>
              <input 
                type="text" 
                required
                value={editingBlog.slug || ''}
                onChange={e => updateBlogField('slug', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">External Link (Optional)</label>
              <input 
                type="text" 
                value={editingBlog.link || ''}
                onChange={e => updateBlogField('link', e.target.value)}
                placeholder="https://medium.com/..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 outline-none"
              />
              <p className="text-xs text-gray-500">If provided, clicking the post will navigate to this URL.</p>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700">
              <button 
                type="button" 
                onClick={() => setIsBlogFormOpen(false)}
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
                Save Post
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
                  onClick={() => setActiveTab('main')}
                  className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-3 ${activeTab === 'main' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                  <Layout size={16} /> Main Section
                </button>
                <button
                  onClick={() => setActiveTab('projects')}
                  className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-3 ${activeTab === 'projects' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                  <FileText size={16} /> Projects
                </button>
                <button
                  onClick={() => setActiveTab('blog')}
                  className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-3 ${activeTab === 'blog' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                  <FileText size={16} /> Blog Posts
                </button>
                <button
                  onClick={() => setActiveTab('contact')}
                  className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-3 ${activeTab === 'contact' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                  <Mail size={16} /> Contact Info
                </button>
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 mt-4">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-3 ${activeTab === 'overview' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                  >
                    <Database size={16} /> Advanced (JSON)
                  </button>
                </div>
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
            
            {activeTab === 'main' && (
              <div className="bg-white dark:bg-dark-card shadow rounded-lg p-6">
                <h2 className="text-lg font-medium mb-6">Main Page Configuration</h2>
                <form onSubmit={handleSaveMain} className="space-y-6 max-w-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <User size={16} /> Full Name
                      </label>
                      <input 
                        type="text" 
                        value={mainForm.name}
                        onChange={e => setMainForm({...mainForm, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Professional Role
                      </label>
                      <input 
                        type="text" 
                        value={mainForm.role}
                        onChange={e => setMainForm({...mainForm, role: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Brand/Title (Navbar Logo Text)
                    </label>
                    <input 
                      type="text" 
                      value={mainForm.title}
                      onChange={e => setMainForm({...mainForm, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Hero Summary
                    </label>
                    <textarea 
                      rows={3}
                      value={mainForm.summary}
                      onChange={e => setMainForm({...mainForm, summary: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      About Me Description (Separate paragraphs with double enter)
                    </label>
                    <textarea 
                      rows={8}
                      value={mainForm.description}
                      onChange={e => setMainForm({...mainForm, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 outline-none font-sans"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Technical Skills (comma separated)
                    </label>
                    <input 
                      type="text" 
                      value={mainForm.technicalSkills}
                      onChange={e => setMainForm({...mainForm, technicalSkills: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Currently Learning
                    </label>
                    <input 
                      type="text" 
                      value={mainForm.currentlyLearning}
                      onChange={e => setMainForm({...mainForm, currentlyLearning: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit" 
                      disabled={actionLoading}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                      Update Main Page
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-dark-card shadow rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium">Raw Profile Data</h2>
                    <button 
                      onClick={handleSaveProfileRaw}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                      Save JSON
                    </button>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800 dark:text-blue-300 flex gap-2">
                      <AlertCircle size={18} className="flex-shrink-0" />
                      <span>Advanced: Edit the raw JSON below for full control over experience, education, etc.</span>
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
                    No projects found.
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
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 max-w-xs">{project.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => openEditProjectForm(project)}
                            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteProject(project.id)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
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

            {activeTab === 'blog' && (
              <div className="bg-white dark:bg-dark-card shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                  <h3 className="text-lg font-medium">Blog Posts ({blogs.length})</h3>
                  <button 
                    onClick={openNewBlogForm}
                    className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors flex items-center gap-2"
                  >
                    <Plus size={16} /> Add New
                  </button>
                </div>
                
                {blogs.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No blog posts found.
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {blogs.map((blog) => (
                      <li key={blog.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{blog.title}</p>
                          <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <span>{blog.date}</span>
                            <span>{blog.readTime}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => openEditBlogForm(blog)}
                            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteBlog(blog.id)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
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

            {activeTab === 'contact' && (
              <div className="bg-white dark:bg-dark-card shadow rounded-lg p-6">
                <h2 className="text-lg font-medium mb-6">Contact Information</h2>
                <form onSubmit={handleSaveContact} className="space-y-6 max-w-2xl">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Mail size={16} /> Email Address
                    </label>
                    <input 
                      type="email" 
                      value={contactForm.email}
                      onChange={e => setContactForm({...contactForm, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Social Links</h3>
                    
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                         GitHub URL
                      </label>
                      <input 
                        type="text" 
                        value={contactForm.github}
                        onChange={e => setContactForm({...contactForm, github: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                         LinkedIn URL
                      </label>
                      <input 
                        type="text" 
                        value={contactForm.linkedin}
                        onChange={e => setContactForm({...contactForm, linkedin: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                         Twitter URL
                      </label>
                      <input 
                        type="text" 
                        value={contactForm.twitter}
                        onChange={e => setContactForm({...contactForm, twitter: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit" 
                      disabled={actionLoading}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                      Update Contact Info
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;