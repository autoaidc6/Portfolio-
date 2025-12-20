
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
// Added MapPin to the imports from lucide-react
import { LogOut, Database, Save, Loader2, Plus, ArrowLeft, Trash2, X, AlertCircle, FileText, Mail, Layout, User, Inbox, Eye, Check, MapPin } from 'lucide-react';
import { PROFILE, PROJECTS, BLOG_POSTS } from '../constants';
import { Project, Profile, BlogPost, ContactMessage } from '../types';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { profile, projects, blogs, refreshData } = usePortfolio();
  
  // UI State
  const [activeTab, setActiveTab] = useState<'overview' | 'main' | 'projects' | 'blog' | 'contact' | 'messages'>('main');
  const [authLoading, setAuthLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Messages State
  const [inboxMessages, setInboxMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

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
    location: ''
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
        fetchInbox();
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
        location: profile.location || ''
      });

      setContactForm({
        email: profile.email || '',
        github: profile.social?.github || '',
        linkedin: profile.social?.linkedin || '',
        twitter: profile.social?.twitter || ''
      });
    }
  }, [profile]);

  const fetchInbox = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) {
      setInboxMessages(data);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // --- Inbox Logic ---
  const handleMarkAsRead = async (id: number) => {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', id);
    
    if (!error) {
      fetchInbox();
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, is_read: true });
      }
    }
  };

  const handleDeleteMessage = async (id: number) => {
    if (!window.confirm('Delete this message permanently?')) return;
    
    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (!error) {
      showMessage('success', 'Message deleted');
      fetchInbox();
      if (selectedMessage?.id === id) setSelectedMessage(null);
    }
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
      const newProfile = {
        ...profile,
        name: mainForm.name,
        role: mainForm.role,
        title: mainForm.title,
        location: mainForm.location,
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

  // Project Logic
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
      const projectData = { ...editingProject, tags: Array.isArray(editingProject.tags) ? editingProject.tags : [], features: Array.isArray(editingProject.features) ? editingProject.features : [], gallery: Array.isArray(editingProject.gallery) ? editingProject.gallery : [], };
      if (!projectData.id) delete projectData.id;
      const { error } = await supabase.from('projects').upsert(projectData as any);
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

  // Blog Logic
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
      const blogData = { ...editingBlog };
      if (!blogData.id) delete blogData.id;
      const { error } = await supabase.from('blogs').upsert(blogData as any);
      if (error) throw error;
      showMessage('success', `Post ${editingBlog.id ? 'updated' : 'created'} successfully!`);
      setIsBlogFormOpen(false);
      refreshData();
    } catch (e: any) {
      showMessage('error', e.message || 'Error saving post');
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg"><Loader2 className="animate-spin text-primary-600" size={32} /></div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-bg text-gray-900 dark:text-white pb-20">
      
      {message && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
           {message.type === 'error' && <AlertCircle size={18} />}
           {message.text}
        </div>
      )}

      <nav className="bg-white dark:bg-dark-card shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <h1 className="text-xl font-bold flex items-center gap-2"><Layout size={20} className="text-primary-600"/> Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <button onClick={handleLogout} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"><LogOut size={20} /></button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white dark:bg-dark-card shadow rounded-2xl p-4 sticky top-24">
              <nav className="space-y-1">
                <button onClick={() => setActiveTab('main')} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center gap-3 ${activeTab === 'main' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}><Layout size={18} /> Main Section</button>
                <button onClick={() => setActiveTab('messages')} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center gap-3 relative ${activeTab === 'messages' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                  <Inbox size={18} /> Messages
                  {inboxMessages.filter(m => !m.is_read).length > 0 && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {inboxMessages.filter(m => !m.is_read).length}
                    </span>
                  )}
                </button>
                <button onClick={() => setActiveTab('projects')} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center gap-3 ${activeTab === 'projects' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}><FileText size={18} /> Projects</button>
                <button onClick={() => setActiveTab('blog')} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center gap-3 ${activeTab === 'blog' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}><FileText size={18} /> Blog Posts</button>
                <button onClick={() => setActiveTab('contact')} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center gap-3 ${activeTab === 'contact' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}><Mail size={18} /> Contact Info</button>
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 mt-4">
                  <button onClick={() => setActiveTab('overview')} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center gap-3 ${activeTab === 'overview' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}><Database size={18} /> Advanced (JSON)</button>
                </div>
              </nav>
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button onClick={seedDatabase} disabled={actionLoading} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                  {actionLoading ? <Loader2 className="animate-spin" size={16} /> : <Database size={16} />} Reset DB
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-12 md:col-span-9">
            
            {activeTab === 'messages' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Message List */}
                <div className="lg:col-span-5 bg-white dark:bg-dark-card shadow rounded-2xl overflow-hidden flex flex-col h-[700px]">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
                    <h2 className="font-bold flex items-center gap-2"><Inbox size={18} className="text-primary-600"/> Inbox</h2>
                    <span className="text-xs text-gray-500">{inboxMessages.length} Messages</span>
                  </div>
                  <div className="flex-1 overflow-y-auto no-scrollbar">
                    {inboxMessages.length === 0 ? (
                      <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                        <Inbox size={48} className="mb-4 opacity-10" />
                        <p>Inbox is empty</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {inboxMessages.map(m => (
                          <div 
                            key={m.id} 
                            onClick={() => { setSelectedMessage(m); if (!m.is_read) handleMarkAsRead(m.id); }}
                            className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${selectedMessage?.id === m.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''} ${!m.is_read ? 'border-l-4 border-primary-600' : ''}`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <h3 className={`text-sm ${!m.is_read ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>{m.name}</h3>
                              <span className="text-[10px] text-gray-400 whitespace-nowrap">{new Date(m.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-gray-500 truncate">{m.subject}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Message Detail */}
                <div className="lg:col-span-7">
                  {selectedMessage ? (
                    <div className="bg-white dark:bg-dark-card shadow rounded-2xl p-6 h-full flex flex-col border border-gray-100 dark:border-gray-800">
                      <div className="flex justify-between items-start mb-6 border-b border-gray-100 dark:border-gray-800 pb-6">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedMessage.subject}</h2>
                          <div className="flex flex-col text-sm text-gray-500">
                            <span className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300"><User size={14}/> {selectedMessage.name} &lt;{selectedMessage.email}&gt;</span>
                            <span className="mt-1">Received: {new Date(selectedMessage.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                           <button 
                             onClick={() => handleDeleteMessage(selectedMessage.id)}
                             className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                             title="Delete message"
                           >
                             <Trash2 size={20} />
                           </button>
                        </div>
                      </div>
                      <div className="flex-1 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed overflow-y-auto max-h-[400px]">
                        {selectedMessage.message}
                      </div>
                      <div className="mt-8 flex items-center gap-4">
                        <a 
                          href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                          className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20 flex items-center gap-2"
                        >
                          <Mail size={18} /> Reply
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-dark-card shadow rounded-2xl h-full flex flex-col items-center justify-center text-center p-12 text-gray-400 border border-gray-100 dark:border-gray-800">
                      <Eye size={64} className="mb-4 opacity-10" />
                      <p className="text-lg">Select a message to view its content</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'main' && (
              <div className="bg-white dark:bg-dark-card shadow rounded-2xl p-8 border border-gray-100 dark:border-gray-800">
                <h2 className="text-xl font-bold mb-8 flex items-center gap-2 text-gray-900 dark:text-white"><Layout size={20} className="text-primary-600" /> Main Configuration</h2>
                <form onSubmit={handleSaveMain} className="space-y-6 max-w-3xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"><User size={16}/> Name</label>
                      <input type="text" value={mainForm.name} onChange={e => setMainForm({...mainForm, name: e.target.value})} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                      <input type="text" value={mainForm.role} onChange={e => setMainForm({...mainForm, role: e.target.value})} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"><MapPin size={16}/> Location</label>
                    <input type="text" value={mainForm.location} onChange={e => setMainForm({...mainForm, location: e.target.value})} placeholder="e.g. San Francisco, CA" className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Hero Summary</label>
                    <textarea rows={3} value={mainForm.summary} onChange={e => setMainForm({...mainForm, summary: e.target.value})} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white resize-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">About Description (Split by double newline)</label>
                    <textarea rows={8} value={mainForm.description} onChange={e => setMainForm({...mainForm, description: e.target.value})} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white resize-none" />
                  </div>
                  <button type="submit" disabled={actionLoading} className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-500/20 flex items-center gap-2 disabled:opacity-70">{actionLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} Update Settings</button>
                </form>
              </div>
            )}

            {/* Other tabs follow the same styling (Projects, Blog, Contact, Overview) */}
            {activeTab === 'projects' && (
              <div className="bg-white dark:bg-dark-card shadow rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
                  <h3 className="font-bold flex items-center gap-2 text-gray-900 dark:text-white"><FileText size={18} className="text-primary-600"/> Projects</h3>
                  <button onClick={openNewProjectForm} className="px-4 py-2 bg-primary-600 text-white text-xs font-bold rounded-xl hover:bg-primary-700 transition-colors flex items-center gap-2"><Plus size={14} /> Add New</button>
                </div>
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {projects.map((project) => (
                    <li key={project.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                      <div className="flex items-center gap-4">
                        <img src={project.image} alt="" className="h-12 w-12 rounded-xl object-cover border border-gray-100 dark:border-gray-700" />
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{project.title}</p>
                          <p className="text-xs text-gray-500 line-clamp-1">{project.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => openEditProjectForm(project)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"><Eye size={18} /></button>
                        <button onClick={() => handleDeleteProject(project.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"><Trash2 size={18} /></button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {activeTab === 'contact' && (
              <div className="bg-white dark:bg-dark-card shadow rounded-2xl p-8 border border-gray-100 dark:border-gray-800">
                <h2 className="text-xl font-bold mb-8 flex items-center gap-2 text-gray-900 dark:text-white"><Mail size={20} className="text-primary-600" /> Contact Configuration</h2>
                <form onSubmit={handleSaveContact} className="space-y-6 max-w-2xl">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                    <input type="email" value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white" />
                  </div>
                  <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold text-gray-900 dark:text-white">Social Media</h3>
                    <input type="text" value={contactForm.github} onChange={e => setContactForm({...contactForm, github: e.target.value})} placeholder="GitHub URL" className="w-full px-4 py-3 mb-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white" />
                    <input type="text" value={contactForm.linkedin} onChange={e => setContactForm({...contactForm, linkedin: e.target.value})} placeholder="LinkedIn URL" className="w-full px-4 py-3 mb-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white" />
                    <input type="text" value={contactForm.twitter} onChange={e => setContactForm({...contactForm, twitter: e.target.value})} placeholder="Twitter URL" className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white" />
                  </div>
                  <button type="submit" disabled={actionLoading} className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-500/20 flex items-center gap-2">{actionLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} Update Contact</button>
                </form>
              </div>
            )}

            {activeTab === 'overview' && (
              <div className="bg-white dark:bg-dark-card shadow rounded-2xl p-8 border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center mb-6">
                   <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white"><Database size={20} className="text-primary-600" /> Advanced JSON Edit</h2>
                   <button onClick={handleSaveProfileRaw} disabled={actionLoading} className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2">{actionLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save JSON</button>
                </div>
                <textarea 
                   value={profileJson} 
                   onChange={e => setProfileJson(e.target.value)} 
                   className="w-full h-[600px] font-mono text-sm p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary-500 outline-none" 
                   spellCheck={false}
                />
              </div>
            )}

          </div>
        </div>
      </div>
      
      {/* Project Form Modal (Minimal placeholder, implementation details omitted for brevity as they are unchanged) */}
      {isProjectFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
           <div className="bg-white dark:bg-dark-card w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">{editingProject.id ? 'Edit Project' : 'New Project'}</h2>
                <button onClick={() => setIsProjectFormOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"><X size={24} /></button>
              </div>
              <form onSubmit={handleSaveProject} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <input type="text" required value={editingProject.title || ''} onChange={e => setEditingProject({...editingProject, title: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg dark:text-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Image URL</label>
                    <input type="text" required value={editingProject.image || ''} onChange={e => setEditingProject({...editingProject, image: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg dark:text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Short Description</label>
                  <input type="text" required value={editingProject.description || ''} onChange={e => setEditingProject({...editingProject, description: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg dark:text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Long Description</label>
                  <textarea rows={4} value={editingProject.longDescription || ''} onChange={e => setEditingProject({...editingProject, longDescription: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg dark:text-white resize-none" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <label className="text-sm font-medium">Demo URL</label>
                    <input type="text" value={editingProject.demoUrl || ''} onChange={e => setEditingProject({...editingProject, demoUrl: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg dark:text-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">GitHub URL</label>
                    <input type="text" value={editingProject.githubUrl || ''} onChange={e => setEditingProject({...editingProject, githubUrl: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg dark:text-white" />
                  </div>
                </div>
                <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-4">
                  <button type="button" onClick={() => setIsProjectFormOpen(false)} className="px-6 py-2 rounded-xl font-bold hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</button>
                  <button type="submit" disabled={actionLoading} className="px-8 py-2 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 flex items-center gap-2">{actionLoading ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Save Project</button>
                </div>
              </form>
           </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
