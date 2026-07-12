import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { LogIn, UserPlus, Package, ShieldCheck, ArrowRight, Shield, ShieldAlert, CheckCircle2 } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  // Password strength logic
  const getPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length > 0) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return Math.min(score, 5);
  };

  const strength = getPasswordStrength(password);
  
  const getStrengthDisplay = () => {
    if (password.length === 0) return { label: '', color: 'bg-slate-200 dark:bg-slate-700', text: '' };
    if (strength <= 2) return { label: 'Weak', color: 'bg-accent-rose', text: 'text-accent-rose' };
    if (strength === 3 || strength === 4) return { label: 'Good', color: 'bg-accent-amber', text: 'text-accent-amber' };
    return { label: 'Strong', color: 'bg-brand-500', text: 'text-brand-500' };
  };

  const strengthDisplay = getStrengthDisplay();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Prevent weak passwords on signup
    if (!isLogin && strength < 3) {
      setError('Please use a stronger password.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (isLogin) {
        const res = await login(email, password);
        if (!res.success) setError(res.message);
      } else {
        await axios.post('http://localhost:5000/api/auth/signup', { name, email, password });
        const res = await login(email, password);
        if (!res.success) setError(res.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex relative overflow-hidden transition-colors duration-300">
      
      {/* Left Panel — Image Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden shadow-2xl z-10">
        
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/assets/login_bg.png)' }}
        ></div>
        
        {/* Heavy Glassmorphism Overlay */}
        <div className="absolute inset-0 bg-brand-900/40 backdrop-blur-[2px] bg-gradient-to-t from-brand-950/90 via-brand-900/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 to-indigo-600/30 mix-blend-overlay"></div>

        {/* Content */}
        <div className="relative z-20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-xl">
              <Package size={24} className="text-white drop-shadow-md" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-md">AssetFlow</h1>
          </div>
          <div className="inline-block mt-2 px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full">
            <p className="text-white/90 text-xs font-bold tracking-widest uppercase">Enterprise Platform</p>
          </div>
        </div>

        <div className="relative z-20 space-y-8 mb-10">
          <div>
            <h2 className="text-5xl font-black text-white leading-[1.1] tracking-tight drop-shadow-lg">
              Asset tracking, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-cyan-300">reimagined.</span>
            </h2>
            <p className="text-white/80 mt-6 text-lg leading-relaxed max-w-md font-medium text-shadow-sm">
              Deploy, track, and audit your organization's entire hardware and vehicle fleet from a single, beautiful dashboard.
            </p>
          </div>

          {/* Feature Badges */}
          <div className="flex flex-wrap gap-3 max-w-md">
            {['Real-time Tracking', 'Smart Allocations', 'Maintenance Logs', 'QR Audits'].map((f, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-lg shadow-lg">
                <CheckCircle2 size={16} className="text-brand-300" />
                <span className="text-sm font-bold text-white drop-shadow-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-20">
          <p className="text-white/50 text-sm font-medium">© 2026 AssetFlow Inc. All rights reserved.</p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative bg-slate-50 dark:bg-slate-950">
        
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/5 dark:bg-brand-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

        <div className="w-full max-w-md relative z-10">
          
          {/* Mobile branding */}
          <div className="lg:hidden text-center mb-10">
            <div className="flex flex-col items-center justify-center gap-3 mb-2">
              <div className="w-14 h-14 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center shadow-xl shadow-brand-500/30">
                <Package size={28} className="text-white" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-2">AssetFlow</h1>
            </div>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-base font-medium">
              {isLogin ? 'Enter your credentials to access your dashboard' : 'Join thousands of companies tracking their assets'}
            </p>
          </div>

          {/* Tab Toggle */}
          <div className="flex mb-8 bg-slate-200/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 p-1.5 rounded-xl">
            <button
              onClick={() => { setIsLogin(true); setError(''); setPassword(''); }}
              className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                isLogin ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-md border border-slate-100 dark:border-slate-700' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <LogIn size={16} /> Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); setPassword(''); }}
              className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                !isLogin ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-md border border-slate-100 dark:border-slate-700' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <UserPlus size={16} /> Sign Up
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Full Name</label>
                <input
                  type="text" required value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all shadow-sm"
                  placeholder="e.g. John Doe"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Email Address</label>
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all shadow-sm"
                placeholder="you@company.com"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-end">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Password</label>
                {isLogin && <a href="#" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300">Forgot password?</a>}
              </div>
              <input
                type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all shadow-sm"
                placeholder="••••••••"
              />
              
              {/* Password Strength Meter (Only for Signup) */}
              {!isLogin && (
                <div className="pt-2">
                  <div className="flex gap-1 h-1.5 w-full mb-1.5">
                    {[1, 2, 3, 4, 5].map(level => (
                      <div 
                        key={level} 
                        className={`flex-1 rounded-full transition-colors duration-300 ${
                          password.length === 0 ? 'bg-slate-200 dark:bg-slate-800' :
                          strength >= level ? strengthDisplay.color : 'bg-slate-200 dark:bg-slate-800'
                        }`}
                      ></div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-slate-500 dark:text-slate-400">Password strength</span>
                    {password.length > 0 && (
                      <span className={`${strengthDisplay.text}`}>{strengthDisplay.label}</span>
                    )}
                  </div>
                  {!isLogin && strength < 3 && password.length > 0 && (
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                      Use 8+ chars with uppercase, numbers & symbols.
                    </p>
                  )}
                </div>
              )}
            </div>

            {error && (
              <div className="text-accent-rose text-sm bg-accent-rose/10 border border-accent-rose/20 rounded-xl p-4 font-medium flex items-center gap-3">
                <ShieldAlert size={18} className="flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || (!isLogin && strength < 3 && password.length > 0)}
              className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-brand-600 text-white text-sm font-bold rounded-xl hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-950 transition-all shadow-xl shadow-brand-600/20 disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
            >
              {isSubmitting ? 'Processing...' : (
                <>
                  {isLogin ? 'Sign In to Dashboard' : 'Create Account'}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Demo Accounts Section */}
          {isLogin && (
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 text-center">Fast Login (Demo)</p>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => { setEmail('admin@assetflow.com'); setPassword('password123'); }}
                  className="text-xs py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
                >
                  Admin
                </button>
                <button 
                  onClick={() => { setEmail('dwight.s@assetflow.com'); setPassword('password123'); }}
                  className="text-xs py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
                >
                  Asset Mgr
                </button>
                <button 
                  onClick={() => { setEmail('michael.s@assetflow.com'); setPassword('password123'); }}
                  className="text-xs py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
                >
                  Dept Head
                </button>
                <button 
                  onClick={() => { setEmail('jim.h@assetflow.com'); setPassword('password123'); }}
                  className="text-xs py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
                >
                  Employee
                </button>
              </div>
            </div>
          )}

          {/* Added Trust Badges */}
          <div className={`${isLogin ? 'mt-6' : 'mt-10'} pt-6 border-t border-slate-200 dark:border-slate-800`}>
            <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-bold">
              <Shield size={14} className="text-brand-500" />
              <span>Enterprise-grade security</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
