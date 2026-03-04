'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

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
        <div className="min-h-screen min-h-[100dvh] flex flex-col" style={{ background: 'var(--nav-bg)' }}>
            {/* Top bar */}
            <div className="px-6 py-4 flex items-center" style={{ borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
                <span className="font-black text-white italic text-xl tracking-tight">A-TRACK</span>
                <span className="ml-3 text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>Order Tracking</span>
            </div>

            {/* Center card */}
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-sm neo-card p-6" style={{ background: 'var(--nav-bg)', border: '2px solid rgba(255,255,255,0.15)', boxShadow: 'none' }}>
                    <h1 className="text-2xl font-black text-white mb-1">
                        {mode === 'login' ? 'WELCOME BACK' : 'CREATE ACCOUNT'}
                    </h1>
                    <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        {mode === 'login' ? 'Sign in to your account' : 'Set up your workshop account'}
                    </p>

                    {/* Toggle */}
                    <div className="flex rounded-lg p-0.5 mb-5" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        {(['login', 'register'] as const).map(m => (
                            <button key={m} onClick={() => setMode(m)} className="flex-1 py-1.5 rounded text-xs font-black uppercase tracking-wide transition-all"
                                style={{ background: mode === m ? '#d4a832' : 'transparent', color: mode === m ? '#111' : 'rgba(255,255,255,0.5)' }}>
                                {m === 'login' ? 'Sign In' : 'Register'}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                        {mode === 'register' && (
                            <>
                                <div>
                                    <div className="section-label mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Name</div>
                                    <input value={name} onChange={e => setName(e.target.value)} required placeholder="Your name"
                                        className="w-full" style={{ background: 'rgba(255,255,255,0.08) !important', color: '#fff !important', border: '2px solid rgba(255,255,255,0.2) !important' }} />
                                </div>
                                <div>
                                    <div className="section-label mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Role</div>
                                    <select value={role} onChange={e => setRole(e.target.value as any)}
                                        className="w-full" style={{ background: 'rgba(255,255,255,0.08) !important', color: '#fff !important', border: '2px solid rgba(255,255,255,0.2) !important' }}>
                                        <option value="admin">Admin</option>
                                        <option value="artisan">Artisan</option>
                                    </select>
                                </div>
                            </>
                        )}
                        <div>
                            <div className="section-label mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Email</div>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"
                                className="w-full" style={{ background: 'rgba(255,255,255,0.08) !important', color: '#fff !important', border: '2px solid rgba(255,255,255,0.2) !important' }} />
                        </div>
                        <div>
                            <div className="section-label mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Password</div>
                            <div className="relative">
                                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••"
                                    className="w-full pr-10" style={{ background: 'rgba(255,255,255,0.08) !important', color: '#fff !important', border: '2px solid rgba(255,255,255,0.2) !important' }} />
                                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-80 text-white">
                                    {showPw ? <EyeOff style={{ width: 14, height: 14 }} /> : <Eye style={{ width: 14, height: 14 }} />}
                                </button>
                            </div>
                            {mode === 'login' && (
                                <p className="text-[11px] mt-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                                    Demo: <span style={{ color: '#d4a832' }}>admin@atelier.com</span> / any password
                                </p>
                            )}
                        </div>
                        <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg font-black text-sm uppercase tracking-wide mt-1"
                            style={{ background: '#fff', color: '#111', border: '2px solid rgba(255,255,255,0.3)', opacity: loading ? 0.7 : 1 }}>
                            {loading ? 'Please wait…' : mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
