import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import { LogOut, Database, Save, Loader2, Plus, ArrowLeft, Trash2, X, AlertCircle, FileText, Mail, Layout, User, Inbox, Eye, Cpu, Code2, Globe, Terminal, GitBranch, Smartphone, Layers } from 'lucide-react';
import { PROFILE, PROJECTS, BLOG_POSTS } from '../constants';
import { Project, Profile, BlogPost, ContactMessage, Skill } from '../types';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { profile, projects, blogs, refreshData } = usePortfolio();
  
  // UI State
  const [activeTab, setActiveTab] = useState<'overview' | 'main' | 'projects' | 'blog' | 'contact' | 'messages' | 'skills'>('main');
  const [authLoading, setAuthLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Inbox Messages
  const [inboxMessages, setInboxMessages] = useState<ContactMessage[]>([]);
  const [selectedInboxMsg, setSelectedInboxMsg] = useState<ContactMessage | null>(null);

  // Project/Blog editing states
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Partial<Project>>({});
  const [isBlogFormOpen, setIsBlogFormOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Partial<BlogPost>>({});

  // Main Section & Skills Form State
  const [mainForm, setMainForm] = useState({
    name: '',
    role: '',
    title: '',
    summary: '',
    description: '',
    location: '',
    currentlyLearning: ''
  });

  const [contactForm, setContactForm] = useState({
    email: '',
    github: '',
    linkedin: '',
    twitter: ''
  });

  const [skills, setSkills] = useState<Skill[]>([]);
  const [newSkill, setNewSkill] = useState<Skill>({ name: '', icon: 'Code2', category: 'frontend' });

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

  useEffect(() => {
    if (profile) {
      setMainForm({
        name: profile.name || '',
        role: profile.role || '',
        title: profile.title || '',
        summary: profile.about?.summary || '',
        description: profile.about?.description?.join('\n\n') || '',
        location: profile.location || '',
        currentlyLearning: profile.currentlyLearning?.join(', ') || ''
      });

      setContactForm({
        email: profile.email || '',
        github: profile.social?.github || '',
        linkedin: profile.social?.linkedin || '',
        twitter: profile.social?.twitter || ''
      });

      setSkills(profile.skills || []);
    }
  }, [profile]);

  const fetchMessages = async () => {
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
    if (data) setInboxMessages(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
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
        currentlyLearning: mainForm.currentlyLearning.split(',').map(s => s.trim()).filter(s => s !== ''),
        about: {
          ...profile.about,
          summary: mainForm.summary,
          description: mainForm.description.split('\n\n').filter(p => p.trim() !== '')
        }
      };
      const { error } = await supabase.from('profile').upsert({ id: 1, data: newProfile });
      if (error) throw error;
      showMessage('success', 'Main settings updated!');
      refreshData();
    } catch (e: any) {
      showMessage('error', e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveSkills = async () => {
    setActionLoading(true);
    try {
      const newProfile = { ...profile, skills };
      const { error } = await supabase.from('profile').upsert({ id: 1, data: newProfile });
      if (error) throw error;
      showMessage('success', 'Skills updated!');
      refreshData();
    } catch (e: any) {
      showMessage('error', e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const addSkill = () => {
    if (!newSkill.name) return;
    setSkills([...skills, newSkill]);
    setNewSkill({ name: '', icon: 'Code2', category: 'frontend' });
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const deleteMsg = async (id: number) => {
    if (!window.confirm('Delete this message?')) return;
    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (!error) {
      fetchMessages();
      if (selectedInboxMsg?.id === id) setSelectedInboxMsg(null);
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-bg text-gray-900 dark:text-white pb-20">
      {message && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {message.text}
        </div>
      )}

      <nav className="bg-white dark:bg-dark-card shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center gap-2"><Layout className="text-primary-600" /> Admin</h1>
          <button onClick={handleLogout} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><LogOut size={20} /></button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-10 px-4">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white dark:bg-dark-card shadow rounded-2xl p-4 sticky top-24 space-y-1">
              {[
                { id: 'main', icon: <User size={18} />, label: 'Main' },
                { id: 'skills', icon: <Cpu size={18} />, label: 'Skills & Learning' },
                { id: 'messages', icon: <Inbox size={18} />, label: 'Inbox', badge: inboxMessages.length },
                { id: 'projects', icon: <Layers size={18} />, label: 'Projects' },
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors ${activeTab === tab.id ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                  {tab.icon} {tab.label} {tab.badge ? <span className="ml-auto bg-primary-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{tab.badge}</span> : null}
                </button>
              ))}
            </div>
          </div>

          <div className="col-span-12 md:col-span-9 space-y-6">
            {activeTab === 'main' && (
              <div className="bg-white dark:bg-dark-card shadow rounded-2xl p-8 space-y-6">
                <h2 className="text-xl font-bold">Main Configuration</h2>
                <form onSubmit={handleSaveMain} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input value={mainForm.name} onChange={e => setMainForm({...mainForm, name: e.target.value})} placeholder="Name" className="w-full px-4 py-2 rounded-xl border dark:bg-dark-bg" />
                    <input value={mainForm.role} onChange={e => setMainForm({...mainForm, role: e.target.value})} placeholder="Role" className="w-full px-4 py-2 rounded-xl border dark:bg-dark-bg" />
                  </div>
                  <input value={mainForm.location} onChange={e => setMainForm({...mainForm, location: e.target.value})} placeholder="Location" className="w-full px-4 py-2 rounded-xl border dark:bg-dark-bg" />
                  <textarea rows={2} value={mainForm.summary} onChange={e => setMainForm({...mainForm, summary: e.target.value})} placeholder="Summary" className="w-full px-4 py-2 rounded-xl border dark:bg-dark-bg" />
                  <textarea rows={6} value={mainForm.description} onChange={e => setMainForm({...mainForm, description: e.target.value})} placeholder="About Description" className="w-full px-4 py-2 rounded-xl border dark:bg-dark-bg" />
                  <input value={mainForm.currentlyLearning} onChange={e => setMainForm({...mainForm, currentlyLearning: e.target.value})} placeholder="Currently Learning (comma separated)" className="w-full px-4 py-2 rounded-xl border dark:bg-dark-bg" />
                  <button type="submit" disabled={actionLoading} className="px-6 py-2 bg-primary-600 text-white rounded-xl flex items-center gap-2">{actionLoading ? <Loader2 className="animate-spin" /> : <Save />} Save Changes</button>
                </form>
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="bg-white dark:bg-dark-card shadow rounded-2xl p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Skills Management</h2>
                  <button onClick={handleSaveSkills} disabled={actionLoading} className="px-6 py-2 bg-primary-600 text-white rounded-xl flex items-center gap-2"><Save /> Save All Skills</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl">
                   <input value={newSkill.name} onChange={e => setNewSkill({...newSkill, name: e.target.value})} placeholder="Skill Name" className="px-4 py-2 rounded-xl border dark:bg-dark-bg" />
                   <select value={newSkill.category} onChange={e => setNewSkill({...newSkill, category: e.target.value as any})} className="px-4 py-2 rounded-xl border dark:bg-dark-bg">
                     <option value="frontend">Frontend</option>
                     <option value="backend">Backend</option>
                     <option value="tools">Tools</option>
                   </select>
                   <select value={newSkill.icon} onChange={e => setNewSkill({...newSkill, icon: e.target.value})} className="px-4 py-2 rounded-xl border dark:bg-dark-bg">
                     <option value="Code2">Code</option>
                     <option value="Globe">Globe</option>
                     <option value="Database">Database</option>
                     <option value="Terminal">Terminal</option>
                     <option value="Layout">Layout</option>
                     <option value="Smartphone">Mobile</option>
                     <option value="Cpu">CPU</option>
                     <option value="GitBranch">Git</option>
                   </select>
                   <button onClick={addSkill} className="md:col-span-3 py-2 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl font-bold flex items-center justify-center gap-2"><Plus /> Add Skill</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {skills.map((skill, idx) => (
                    <div key={idx} className="p-4 border rounded-2xl flex items-center justify-between dark:bg-dark-bg">
                      <div className="flex items-center gap-3">
                         <div className="text-primary-600"><Code2 size={16}/></div>
                         <div>
                            <p className="text-sm font-bold">{skill.name}</p>
                            <p className="text-[10px] uppercase text-gray-500">{skill.category}</p>
                         </div>
                      </div>
                      <button onClick={() => removeSkill(idx)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="bg-white dark:bg-dark-card shadow rounded-2xl overflow-hidden h-[600px] flex">
                <div className="w-1/3 border-r overflow-y-auto divide-y">
                  {inboxMessages.map(m => (
                    <div key={m.id} onClick={() => setSelectedInboxMsg(m)} className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${selectedInboxMsg?.id === m.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}>
                      <p className="font-bold text-sm">{m.name}</p>
                      <p className="text-xs text-gray-500 truncate">{m.subject}</p>
                    </div>
                  ))}
                </div>
                <div className="flex-1 p-8 overflow-y-auto">
                  {selectedInboxMsg ? (
                    <div className="space-y-6">
                       <div className="flex justify-between items-start">
                          <div>
                             <h2 className="text-2xl font-bold">{selectedInboxMsg.subject}</h2>
                             <p className="text-sm text-gray-500">{selectedInboxMsg.name} ({selectedInboxMsg.email})</p>
                          </div>
                          <button onClick={() => deleteMsg(selectedInboxMsg.id)} className="text-red-500 p-2 hover:bg-red-50 rounded-xl"><Trash2 /></button>
                       </div>
                       <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {selectedInboxMsg.message}
                       </div>
                    </div>
                  ) : <div className="h-full flex items-center justify-center text-gray-400">Select a message</div>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;