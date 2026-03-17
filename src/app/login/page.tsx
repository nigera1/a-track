'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, EyeOff, Sun, Moon } from 'lucide-react';

const inpClass = "w-full rounded-[6px] border border-slate-200 dark:border-slate-700 px-3 py-[9px] text-[14px] text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#1C7ED6] bg-white dark:bg-slate-800 transition-colors appearance-none";

export default function LoginPage() {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'admin' | 'artisan'>('artisan');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login, register } = useStore();
    const router = useRouter();
    const [dark, setDark] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('a-track-theme');
        if (saved === 'dark') { setDark(true); document.documentElement.setAttribute('data-theme', 'dark'); }
    }, []);

    function toggleTheme() {
        const next = !dark;
        setDark(next);
        document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
        localStorage.setItem('a-track-theme', next ? 'dark' : 'light');
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        await new Promise(r => setTimeout(r, 300));
        if (mode === 'login') {
            const ok = login(email, password);
            if (ok) { toast.success('Welcome back'); router.push('/dashboard'); }
            else toast.error('Invalid credentials');
        } else {
            const ok = register(name, email, password, role);
            if (ok) { toast.success('Account created'); router.push('/dashboard'); }
            else toast.error('Email already in use');
        }
        setLoading(false);
    }

    return (
        <div className="min-h-screen min-h-[100dvh] flex flex-col bg-slate-50 dark:bg-slate-950">
            {/* Top bar */}
            <div className="px-6 py-4 flex items-center border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="w-8 h-8 flex items-center justify-center font-black text-sm flex-shrink-0 bg-red-500 text-white mr-2">A</div>
                <span className="font-black text-slate-900 dark:text-white italic text-xl tracking-tight">A-TRACK</span>
                <span className="ml-3 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex-1">Order Tracking</span>
                
                <button onClick={toggleTheme} className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400" title="Toggle Theme">
                    {dark ? <Sun style={{ width: 18, height: 18 }} /> : <Moon style={{ width: 18, height: 18 }} />}
                </button>
            </div>

            {/* Center card */}
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[12px] border border-slate-200 dark:border-slate-800 shadow-sm p-6 md:p-8">
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                        {mode === 'login' ? 'WELCOME BACK' : 'CREATE ACCOUNT'}
                    </h1>
                    <p className="text-sm mb-6 text-slate-500 dark:text-slate-400">
                        {mode === 'login' ? 'Sign in to your account' : 'Set up your workshop account'}
                    </p>

                    {/* Toggle */}
                    <div className="flex rounded-[8px] p-1 mb-6 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        {(['login', 'register'] as const).map(m => (
                            <button key={m} onClick={() => setMode(m)} className="flex-1 py-1.5 rounded-[6px] text-xs font-black uppercase tracking-wide transition-all"
                                style={{ 
                                    background: mode === m ? 'var(--primary)' : 'transparent', 
                                    color: mode === m ? '#fff' : 'var(--muted-foreground)',
                                    boxShadow: mode === m ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                                }}>
                                {m === 'login' ? 'Sign In' : 'Register'}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {mode === 'register' && (
                            <>
                                <div>
                                    <div className="text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">Name</div>
                                    <input value={name} onChange={e => setName(e.target.value)} required placeholder="Your name" className={inpClass} />
                                </div>
                                <div>
                                    <div className="text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">Role</div>
                                    <select value={role} onChange={e => setRole(e.target.value as any)} className={inpClass}>
                                        <option value="admin">Admin</option>
                                        <option value="artisan">Artisan</option>
                                    </select>
                                </div>
                            </>
                        )}
                        <div>
                            <div className="text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">Email</div>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className={inpClass} />
                        </div>
                        <div>
                            <div className="text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">Password</div>
                            <div className="relative">
                                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••" className={`${inpClass} pr-10`} />
                                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                                    {showPw ? <EyeOff style={{ width: 14, height: 14 }} /> : <Eye style={{ width: 14, height: 14 }} />}
                                </button>
                            </div>
                            {mode === 'login' && (
                                <p className="text-[12px] mt-2 text-slate-500 dark:text-slate-400 font-medium">
                                    Demo: <span className="text-[#1C7ED6] font-bold cursor-pointer hover:underline" onClick={() => {setEmail('admin@atelier.com'); setPassword('admin');}}>admin@atelier.com</span>
                                </p>
                            )}
                        </div>
                        <button type="submit" disabled={loading} className="w-full py-[10px] rounded-[6px] font-bold text-[14px] transition-all mt-2 bg-[#1C7ED6] hover:bg-[#1971c2] text-white shadow-sm disabled:opacity-70 disabled:cursor-not-allowed">
                            {loading ? 'Please wait…' : mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
