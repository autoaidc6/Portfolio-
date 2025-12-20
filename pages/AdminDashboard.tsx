import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import { LogOut, Database, Save, Loader2, Plus, ArrowLeft, Trash2, X, AlertCircle, FileText, Mail, Layout, User, Inbox, Eye } from 'lucide-react';
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
  const [messages, setMessages] = useState<ContactMessage[]>([]);
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
        fetchMessages();
      }
    });
  }, [navigate]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setMessages(data);
  };

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // --- Messages Management ---
  const markMessageAsRead = async (id: number) => {
    const { error } = await supabase.from('messages').update({ is_read: true }).eq('id', id);
    if (!error) fetchMessages();
  };

  const handleDeleteMessage = async (id: number) => {
    if (!window.confirm('Delete this message?')) return;
    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (!error) {
      showMessage('success', 'Message deleted');
      fetchMessages();
      if (selectedMessage?.id === id) setSelectedMessage(null);
    }
  };

  // --- Database Seeding ---
  const seedDatabase = async () => {
    if (!window.confirm('This will overwrite database content with local constants. Continue?')) return;
    
    setActionLoading(true);
    try {
      const { error: profileError } = await supabase.from('profile').upsert({ id: 1, data: PROFILE });
      await supabase.from('projects').delete().neq('id', 0);
      const { error: projectsError } = await supabase.from('projects').insert(PROJECTS);
      await supabase.from('blogs').delete().neq('id', 0);
      const { error: blogsError } = await supabase.from('blogs').insert(BLOG_POSTS);

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

      const { error } = await supabase.from('profile').upsert({ id: 1, data: newProfile });
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
      const { error } = await supabase.from('profile').upsert({ id: 1, data: newProfile });
      if (error) throw error;
      showMessage('success', 'Contact info updated successfully!');
      refreshData();
    } catch (e: any) {
      showMessage('error', e.message || 'Error updating contact info');
    } finally {
      setActionLoading(false);
    }
  };

  // Project/Blog handlers remain the same as previous version...
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault(); setActionLoading(true);
    try {
      const projectData = { ...editingProject, tags: Array.isArray(editingProject.tags) ? editingProject.tags : [], features: Array.isArray(editingProject.features) ? editingProject.features : [] };
      if (!projectData.id) delete projectData.id;
      const { error } = await supabase.from('projects').upsert(projectData as any);
      if (error) throw error;
      showMessage('success', `Project ${editingProject.id ? 'updated' : 'created'} successfully!`);
      setIsProjectFormOpen(false); refreshData();
    } catch (e: any) { showMessage('error', e.message || 'Error saving project'); } 
    finally { setActionLoading(false); }
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault(); setActionLoading(true);
    try {
      const blogData = { ...editingBlog }; if (!blogData.id) delete blogData.id;
      const { error } = await supabase.from('blogs').upsert(blogData as any);
      if (error) throw error;
      showMessage('success', `Post ${editingBlog.id ? 'updated' : 'created'} successfully!`);
      setIsBlogFormOpen(false); refreshData();
    } catch (e: any) { showMessage('error', e.message || 'Error saving post'); } 
    finally { setActionLoading(false); }
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
            <h1 className="text-xl font-bold flex items-center">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <button onClick={handleLogout} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"><LogOut size={20} /></button>
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
                <button onClick={() => setActiveTab('main')} className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-3 ${activeTab === 'main' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}><Layout size={16} /> Main Section</button>
                <button onClick={() => setActiveTab('messages')} className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-3 ${activeTab === 'messages' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                  <Inbox size={16} /> Inbox
                  {messages.filter(m => !m.is_read).length > 0 && <span className="ml-auto bg-primary-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{messages.filter(m => !m.is_read).length}</span>}
                </button>
                <button onClick={() => setActiveTab('projects')} className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-3 ${activeTab === 'projects' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}><FileText size={16} /> Projects</button>
                <button onClick={() => setActiveTab('blog')} className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-3 ${activeTab === 'blog' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}><FileText size={16} /> Blog Posts</button>
                <button onClick={() => setActiveTab('contact')} className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-3 ${activeTab === 'contact' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}><Mail size={16} /> Contact Info</button>
              </nav>
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button onClick={seedDatabase} disabled={actionLoading} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium transition-colors disabled:opacity-50">
                  {actionLoading ? <Loader2 className="animate-spin" size={16} /> : <Database size={16} />} Reset DB
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-12 md:col-span-9">
            
            {activeTab === 'messages' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-5 bg-white dark:bg-dark-card shadow rounded-lg overflow-hidden">
                   <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                     <h2 className="font-bold flex items-center gap-2"><Inbox size={18} /> Inbox</h2>
                   </div>
                   <div className="divide-y divide-gray-100 dark:divide-gray-800 h-[600px] overflow-y-auto">
                     {messages.length === 0 ? (
                       <div className="p-8 text-center text-gray-400">No messages.</div>
                     ) : (
                       messages.map(m => (
                         <div 
                           key={m.id} 
                           onClick={() => { setSelectedMessage(m); if(!m.is_read) markMessageAsRead(m.id); }}
                           className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${selectedMessage?.id === m.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''} ${!m.is_read ? 'border-l-4 border-primary-600' : ''}`}
                         >
                            <div className="flex justify-between items-start mb-1">
                              <span className={`text-sm ${!m.is_read ? 'font-bold' : 'font-medium'}`}>{m.name}</span>
                              <span className="text-[10px] text-gray-500">{new Date(m.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-1">{m.subject}</p>
                         </div>
                       ))
                     )}
                   </div>
                </div>

                <div className="md:col-span-7">
                  {selectedMessage ? (
                    <div className="bg-white dark:bg-dark-card shadow rounded-lg p-6 min-h-[400px]">
                       <div className="flex justify-between items-start mb-6">
                          <div>
                            <h2 className="text-xl font-bold mb-1">{selectedMessage.subject}</h2>
                            <div className="flex flex-col text-sm text-gray-500">
                               <span>From: {selectedMessage.name} &lt;{selectedMessage.email}&gt;</span>
                               <span>Date: {new Date(selectedMessage.created_at).toLocaleString()}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDeleteMessage(selectedMessage.id)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                          >
                            <Trash2 size={20} />
                          </button>
                       </div>
                       <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-100 dark:border-gray-800 whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                         {selectedMessage.message}
                       </div>
                       <div className="mt-8 flex gap-4">
                          <a href={`mailto:${selectedMessage.email}`} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">Reply via Email</a>
                       </div>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-dark-card shadow rounded-lg p-12 flex flex-col items-center justify-center text-center text-gray-400">
                      <Inbox size={48} className="mb-4 opacity-20" />
                      <p>Select a message to view details</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'main' && (
              <div className="bg-white dark:bg-dark-card shadow rounded-lg p-6">
                <h2 className="text-lg font-medium mb-6">Main Page Configuration</h2>
                <form onSubmit={handleSaveMain} className="space-y-6 max-w-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                      <input type="text" value={mainForm.name} onChange={e => setMainForm({...mainForm, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Professional Role</label>
                      <input type="text" value={mainForm.role} onChange={e => setMainForm({...mainForm, role: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                    <input type="text" value={mainForm.location} onChange={e => setMainForm({...mainForm, location: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg" placeholder="e.g. San Francisco, CA" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Hero Summary</label>
                    <textarea rows={3} value={mainForm.summary} onChange={e => setMainForm({...mainForm, summary: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg" />
                  </div>
                  <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium flex items-center gap-2">{actionLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Update Page</button>
                </form>
              </div>
            )}

            {/* Other tabs logic remains the same... */}
            {activeTab === 'contact' && (
              <div className="bg-white dark:bg-dark-card shadow rounded-lg p-6">
                <h2 className="text-lg font-medium mb-6">Contact Information</h2>
                <form onSubmit={handleSaveContact} className="space-y-6 max-w-2xl">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                    <input type="email" value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg" />
                  </div>
                  <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium">Social Links</h3>
                    <input type="text" value={contactForm.github} onChange={e => setContactForm({...contactForm, github: e.target.value})} className="w-full px-3 py-2 mb-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg" placeholder="GitHub URL" />
                    <input type="text" value={contactForm.linkedin} onChange={e => setContactForm({...contactForm, linkedin: e.target.value})} className="w-full px-3 py-2 mb-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg" placeholder="LinkedIn URL" />
                    <input type="text" value={contactForm.twitter} onChange={e => setContactForm({...contactForm, twitter: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg" placeholder="Twitter URL" />
                  </div>
                  <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium flex items-center gap-2">{actionLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Update Contact</button>
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