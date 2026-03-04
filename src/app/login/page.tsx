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
        await new Promise(r => setTimeout(r, 400));
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
        <div className="min-h-screen min-h-[100dvh] flex items-center justify-center p-4" style={{ background: 'var(--background)' }}>
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg mb-3 font-bold text-lg" style={{ background: 'var(--gold)', color: '#111' }}>A</div>
                    <h1 className="text-xl font-bold">A-Track</h1>
                    <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Order tracking for workshops</p>
                </div>

                {/* Card */}
                <div className="glass-card p-5">
                    {/* Tabs */}
                    <div className="flex rounded-md p-0.5 mb-5" style={{ background: 'var(--muted)' }}>
                        {(['login', 'register'] as const).map(m => (
                            <button key={m} onClick={() => setMode(m)} className="flex-1 py-1.5 rounded text-xs font-medium"
                                style={{ background: mode === m ? 'var(--gold)' : 'transparent', color: mode === m ? '#111' : 'var(--muted-foreground)' }}>
                                {m === 'login' ? 'Sign In' : 'Register'}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                        {mode === 'register' && (
                            <>
                                <div>
                                    <label className="section-label mb-1 block">Name</label>
                                    <input value={name} onChange={e => setName(e.target.value)} required placeholder="Your name"
                                        className="w-full px-3 py-2 rounded-md text-sm" style={{ border: '1px solid var(--border)' }} />
                                </div>
                                <div>
                                    <label className="section-label mb-1 block">Role</label>
                                    <select value={role} onChange={e => setRole(e.target.value as any)}
                                        className="w-full px-3 py-2 rounded-md text-sm" style={{ border: '1px solid var(--border)' }}>
                                        <option value="admin">Admin</option>
                                        <option value="artisan">Artisan</option>
                                    </select>
                                </div>
                            </>
                        )}
                        <div>
                            <label className="section-label mb-1 block">Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@atelier.com"
                                className="w-full px-3 py-2 rounded-md text-sm" style={{ border: '1px solid var(--border)' }} />
                        </div>
                        <div>
                            <label className="section-label mb-1 block">Password</label>
                            <div className="relative">
                                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••"
                                    className="w-full px-3 py-2 rounded-md text-sm pr-9" style={{ border: '1px solid var(--border)' }} />
                                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-80">
                                    {showPw ? <EyeOff style={{ width: 14, height: 14 }} /> : <Eye style={{ width: 14, height: 14 }} />}
                                </button>
                            </div>
                            {mode === 'login' && <p className="text-[11px] mt-1.5" style={{ color: 'var(--muted-foreground)' }}>Demo: <span style={{ color: 'var(--gold)' }}>admin@atelier.com</span> / any password</p>}
                        </div>
                        <button type="submit" disabled={loading} className="w-full py-2 rounded-md font-semibold text-sm mt-1"
                            style={{ background: 'var(--gold)', color: '#111', opacity: loading ? 0.7 : 1 }}>
                            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
