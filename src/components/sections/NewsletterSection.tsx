'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle, Loader2 } from 'lucide-react';
import { FadeIn } from '@/components/motion';
import { subscribe } from '@/server/actions/subscribe';

/**
 * Newsletter Section for homepage
 */
export const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === 'loading') return;

    setStatus('loading');
    
    try {
      // Create FormData from form
      const formData = new FormData();
      formData.append('email', email);
      
      const result = await subscribe(formData);
      
      if (result.success) {
        setStatus('success');
        setMessage(result.message || 'Thanks for subscribing!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(result.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }

    // Reset after a few seconds
    setTimeout(() => {
      setStatus((current) => current === 'loading' ? current : 'idle');
      setMessage('');
    }, 5000);
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--accent-subtle)]/30 to-transparent pointer-events-none" />
      
      <div className="container-narrow relative">
        <FadeIn>
          <div className="glass-card rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
            {/* Decorative Gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[var(--sphere-1)] blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-[var(--sphere-2)] blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <span className="label text-[var(--accent)] mb-4 block">Newsletter</span>
              <h2 className="heading-2 text-[var(--fg)] mb-4">
                Stay Updated
              </h2>
              <p className="body-large text-[var(--fg-muted)] max-w-lg mx-auto mb-8">
                Get the latest articles, tutorials, and updates delivered straight to your inbox. 
                No spam, unsubscribe anytime.
              </p>

              <form ref={formRef} onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    disabled={status === 'loading' || status === 'success'}
                    className="flex-1 px-4 py-3 rounded-xl bg-[var(--bg)] border border-[var(--border-color)] text-[var(--fg)] placeholder:text-[var(--fg-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all disabled:opacity-50"
                  />
                  <motion.button
                    type="submit"
                    disabled={status === 'loading' || status === 'success'}
                    whileHover={{ scale: status === 'idle' ? 1.02 : 1 }}
                    whileTap={{ scale: status === 'idle' ? 0.98 : 1 }}
                    className="btn-primary whitespace-nowrap disabled:opacity-50"
                  >
                    {status === 'loading' ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : status === 'success' ? (
                      <>
                        <CheckCircle className="size-5" />
                        Subscribed!
                      </>
                    ) : (
                      <>
                        Subscribe
                        <Send className="size-4" />
                      </>
                    )}
                  </motion.button>
                </div>

                {message && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 body-small ${
                      status === 'success' ? 'text-[var(--success)]' : 'text-[var(--error)]'
                    }`}
                  >
                    {message}
                  </motion.p>
                )}
              </form>

              <p className="mt-6 body-small text-[var(--fg-subtle)]">
                Join 500+ subscribers
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default NewsletterSection;
