import React, { useState } from 'react';
import { Send, Mail, User, MessageSquare, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

interface ContactFormProps {
  className?: string;
}

export function ContactForm({ className }: ContactFormProps) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Feedback',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to send');

      setStatus('success');
      setFormData({ name: '', email: '', subject: 'Feedback', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      console.error('Contact error:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <div className={cn('w-full max-w-2xl mx-auto', className)}>
      <motion.div 
        layout
        className='relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-800/40 p-8 md:p-12 backdrop-blur-xl shadow-2xl'
      >
        {/* Background glow */}
        <div className='absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl' />
        
        <AnimatePresence mode='wait'>
          {status === 'success' ? (
            <motion.div 
              key='success'
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className='flex flex-col items-center justify-center py-12 text-center'
            >
              <div className='mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500'>
                <CheckCircle2 className='h-12 w-12' />
              </div>
              <h3 className='text-3xl font-black text-white mb-2'>Message Sent!</h3>
              <p className='text-slate-400'>Thanks for your feedback. We'll get back to you shortly.</p>
            </motion.div>
          ) : status === 'error' ? (
            <motion.div 
              key='error'
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className='flex flex-col items-center justify-center py-12 text-center'
            >
              <div className='mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-500/20 text-rose-500'>
                <AlertCircle className='h-12 w-12' />
              </div>
              <h3 className='text-3xl font-black text-white mb-2'>Something went wrong</h3>
              <p className='text-slate-400'>We couldn't send your message. Please try again later.</p>
              <button 
                onClick={() => setStatus('idle')}
                className='mt-6 text-sm font-bold text-blue-500 hover:underline'
              >
                Try again
              </button>
            </motion.div>
          ) : (
            <motion.form 
              key='form'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className='relative z-10 space-y-6'
            >
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-2'>
                  <label className='text-xs font-black uppercase tracking-widest text-slate-400 ml-1'>Name</label>
                  <div className='relative group'>
                    <User className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 transition-colors group-focus-within:text-blue-500' />
                    <input 
                      required
                      type='text' 
                      placeholder='John Doe'
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className='w-full rounded-2xl bg-slate-900/50 border border-white/5 py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all'
                    />
                  </div>
                </div>
                <div className='space-y-2'>
                  <label className='text-xs font-black uppercase tracking-widest text-slate-400 ml-1'>Email</label>
                  <div className='relative group'>
                    <Mail className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 transition-colors group-focus-within:text-blue-500' />
                    <input 
                      required
                      type='email' 
                      placeholder='john@example.com'
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className='w-full rounded-2xl bg-slate-900/50 border border-white/5 py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all'
                    />
                  </div>
                </div>
              </div>

              <div className='space-y-2'>
                <label className='text-xs font-black uppercase tracking-widest text-slate-400 ml-1'>Message</label>
                <div className='relative group'>
                  <MessageSquare className='absolute left-4 top-6 h-5 w-5 text-slate-500 transition-colors group-focus-within:text-blue-500' />
                  <textarea 
                    required
                    rows={4}
                    placeholder='How can we improve DriveDE?'
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className='w-full rounded-2xl bg-slate-900/50 border border-white/5 py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none'
                  />
                </div>
              </div>

              <button 
                type='submit'
                disabled={status === 'submitting'}
                className={cn(
                  'w-full flex items-center justify-center gap-3 rounded-2xl bg-blue-600 py-5 text-lg font-black text-white shadow-2xl transition-all active:scale-[0.98]',
                  status === 'submitting' ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700 hover:shadow-blue-500/20'
                )}
              >
                {status === 'submitting' ? (
                  <div className='h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white' />
                ) : (
                  <>
                    Send Feedback
                    <Send className='h-5 w-5' />
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
