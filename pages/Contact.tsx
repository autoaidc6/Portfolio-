import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, MapPin, Send, Github, Linkedin, Twitter, CheckCircle, Loader2, Globe, AlertTriangle } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { motion } from 'framer-motion';

const Contact: React.FC = () => {
  const { profile } = usePortfolio();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const configured = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configured) {
      alert('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.');
      return;
    }
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('messages')
        .insert([formData]);

      if (error) throw error;
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
      <Navbar />
      
      <main className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Get In Touch</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Ready to start your next project or have a question? Drop me a message below.
            </p>
          </div>

          {!configured && (
            <div className="mb-12 max-w-4xl mx-auto bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-2xl flex items-center gap-4 text-amber-800 dark:text-amber-300">
              <AlertTriangle className="flex-shrink-0" />
              <p className="text-sm">
                <strong>Backend not connected:</strong> The contact form requires Supabase configuration to function. Please see the <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">SUPABASE_SETUP.md</code> file for instructions.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Contact Information Side */}
            <div className="lg:col-span-5 space-y-8">
              <div className="bg-white dark:bg-dark-card p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Information</h2>
                
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="p-4 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-2xl">
                      <Mail size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Email Me</h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">{profile.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-4 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-2xl">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Location</h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">{profile.location || 'Remote / Worldwide'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-2xl">
                      <Globe size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Availability</h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">Open to new opportunities</p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Socials</h3>
                  <div className="flex gap-4">
                    <a href={profile.social.github} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-50 dark:bg-dark-bg text-gray-500 hover:text-primary-600 hover:scale-110 transition-all rounded-xl border border-gray-200 dark:border-gray-700">
                      <Github size={20} />
                    </a>
                    <a href={profile.social.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-50 dark:bg-dark-bg text-gray-500 hover:text-primary-600 hover:scale-110 transition-all rounded-xl border border-gray-200 dark:border-gray-700">
                      <Linkedin size={20} />
                    </a>
                    <a href={profile.social.twitter} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-50 dark:bg-dark-bg text-gray-500 hover:text-primary-600 hover:scale-110 transition-all rounded-xl border border-gray-200 dark:border-gray-700">
                      <Twitter size={20} />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Side */}
            <div className="lg:col-span-7">
              <div className="bg-white dark:bg-dark-card p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 h-full">
                {submitted ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="h-full flex flex-col items-center justify-center text-center py-12"
                  >
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Message Sent!</h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-sm">
                      Thank you for reaching out. I'll get back to you as soon as I can.
                    </p>
                    <button 
                      onClick={() => setSubmitted(false)}
                      className="mt-8 px-8 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors"
                    >
                      Send Another
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                        <input 
                          type="text"
                          required
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          placeholder="Alex Johnson"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <input 
                          type="email"
                          required
                          value={formData.email}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                          placeholder="alex@example.com"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
                      <input 
                        type="text"
                        required
                        value={formData.subject}
                        onChange={e => setFormData({...formData, subject: e.target.value})}
                        placeholder="Project Inquiry"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
                      <textarea 
                        required
                        rows={6}
                        value={formData.message}
                        onChange={e => setFormData({...formData, message: e.target.value})}
                        placeholder="Hi Alex, I'd love to discuss..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white resize-none"
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={loading || !configured}
                      className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <>
                          <Send size={20} />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;