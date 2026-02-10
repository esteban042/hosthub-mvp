
import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<string | null>;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please provide valid credentials.');
      return;
    }

    const errorMessage = await onLogin(email, password);
    if (errorMessage) {
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-1000 font-dm">
      <div className="bg-stone-900 border border-stone-800 p-12 rounded-[3.5rem] shadow-2xl max-w-md w-full text-center">
        <div className="w-16 h-16 bg-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-amber-900/40">
           <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        </div>
        <h2 className="text-3xl font-black text-white mb-3">HostHub Studio</h2>
        <p className="text-stone-500 text-sm mb-12 font-medium">Authorized access only.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-200 ml-1">Email address</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-2xl py-4 px-6 text-sm text-white focus:ring-1 focus:ring-coral-500 outline-none"
              placeholder="admin@hosthub.com"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-200 ml-1">Secure Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-2xl py-4 px-6 text-sm text-white focus:ring-1 focus:ring-coral-500 outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-rose-500 text-xs font-bold px-1">{error}</p>}
          
          <button 
            type="submit"
            className="w-full bg-transparent border border-white text-white hover:bg-white hover:text-black font-black py-5 rounded-2xl transition-all active:scale-95 shadow-xl uppercase text-[10px] tracking-[0.2em] mt-4"
          >
            Authenticate
          </button>
        </form>
        
        <div className="mt-12 flex items-center justify-center space-x-3 opacity-30">
          <div className="h-px w-8 bg-stone-500" />
          <p className="text-stone-500 text-[9px] font-black uppercase tracking-[0.4em]">Entry gate</p>
          <div className="h-px w-8 bg-stone-500" />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;