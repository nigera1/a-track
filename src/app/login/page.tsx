'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, EyeOff, Sun, Moon } from 'lucide-react';

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
            if (ok) { toast.success('Welkom terug'); router.push('/dashboard'); }
            else toast.error('Ongeldige inloggegevens');
        } else {
            const ok = register(name, email, password, role);
            if (ok) { toast.success('Account aangemaakt'); router.push('/dashboard'); }
            else toast.error('E-mail al in gebruik');
        }
        setLoading(false);
    }

    const inpClass = "w-full border px-3.5 py-2.5 text-[14px] transition-all appearance-none focus:outline-none focus:ring-2 focus:ring-[#E07A5F] focus:border-[#E07A5F]";
    const inpLight = `${inpClass} bg-white border-[#e0e0e0] text-[#0A0A0A] placeholder-[#6C757D]`;
    const inpDark = `${inpClass} bg-[#1a1a1a] border-[#2a2a2a] text-[#f0f0f0] placeholder-[#6C757D]`;

    return (
        <div className="min-h-screen min-h-[100dvh] flex flex-col" style={{ background: 'var(--background)' }}>
            {/* Top bar */}
            <div className="px-6 py-4 flex items-center border-b" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0 text-white mr-2" style={{ background: '#E07A5F', fontFamily: 'Montserrat, sans-serif', fontWeight: 800 }}>A</div>
                <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 20, color: 'var(--foreground)', letterSpacing: '-0.02em' }}>A-TRACK</span>
                <span className="ml-3 flex-1" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-foreground)', fontFamily: 'Montserrat, sans-serif' }}>Atelier Systems</span>
                
                <button onClick={toggleTheme} className="p-2 transition-colors" style={{ color: 'var(--muted-foreground)' }} title="Thema wisselen">
                    {dark ? <Sun style={{ width: 18, height: 18 }} /> : <Moon style={{ width: 18, height: 18 }} />}
                </button>
            </div>

            {/* Center card */}
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-sm p-6 md:p-8 border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                    <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 22, color: 'var(--foreground)', marginBottom: 4 }}>
                        {mode === 'login' ? 'WELKOM TERUG' : 'ACCOUNT AANMAKEN'}
                    </h1>
                    <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)', fontFamily: 'Source Sans 3, sans-serif' }}>
                        {mode === 'login' ? 'Log in op uw werkplaats' : 'Stel uw atelier account in'}
                    </p>

                    {/* Toggle */}
                    <div className="flex p-1 mb-6 border" style={{ borderColor: 'var(--border)', background: 'var(--muted)' }}>
                        {(['login', 'register'] as const).map(m => (
                            <button key={m} onClick={() => setMode(m)} className="flex-1 py-1.5 text-xs font-bold uppercase tracking-wide transition-all"
                                style={{ 
                                    background: mode === m ? 'var(--foreground)' : 'transparent', 
                                    color: mode === m ? 'var(--background)' : 'var(--muted-foreground)',
                                    fontFamily: 'Montserrat, sans-serif',
                                }}>
                                {m === 'login' ? 'Inloggen' : 'Registreren'}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>
                        {mode === 'register' && (
                            <>
                                <div>
                                    <label htmlFor="reg-name" className="text-[13px] font-bold mb-1.5 block" style={{ color: 'var(--foreground)' }}>Naam</label>
                                    <input id="reg-name" value={name} onChange={e => setName(e.target.value)} required placeholder="Uw naam" className={inpLight} style={{ background: 'var(--input)', color: 'var(--foreground)', borderColor: 'var(--border)' }} />
                                </div>
                                <div>
                                    <label htmlFor="reg-role" className="text-[13px] font-bold mb-1.5 block" style={{ color: 'var(--foreground)' }}>Rol</label>
                                    <select id="reg-role" value={role} onChange={e => setRole(e.target.value as any)} className={inpLight} style={{ background: 'var(--input)', color: 'var(--foreground)', borderColor: 'var(--border)' }}>
                                        <option value="admin">Admin</option>
                                        <option value="artisan">Ambachtsman</option>
                                    </select>
                                </div>
                            </>
                        )}
                        <div>
                            <label htmlFor="login-email" className="text-[13px] font-bold mb-1.5 block" style={{ color: 'var(--foreground)' }}>E-mail</label>
                            <input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="u@voorbeeld.nl" className={inpLight} style={{ background: 'var(--input)', color: 'var(--foreground)', borderColor: 'var(--border)' }} />
                        </div>
                        <div>
                            <label htmlFor="login-pw" className="text-[13px] font-bold mb-1.5 block" style={{ color: 'var(--foreground)' }}>Wachtwoord</label>
                            <div className="relative">
                                <input id="login-pw" type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••" className={`${inpLight} pr-10`} style={{ background: 'var(--input)', color: 'var(--foreground)', borderColor: 'var(--border)' }} />
                                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: 'var(--muted-foreground)' }}>
                                    {showPw ? <EyeOff style={{ width: 14, height: 14 }} /> : <Eye style={{ width: 14, height: 14 }} />}
                                </button>
                            </div>
                            {mode === 'login' && (
                                <p className="text-[12px] mt-2 font-medium" style={{ color: 'var(--muted-foreground)' }}>
                                    Demo: <span className="font-bold cursor-pointer hover:underline" style={{ color: '#E07A5F' }} onClick={() => {setEmail('admin@atelier.com'); setPassword('admin');}}>admin@atelier.com</span>
                                </p>
                            )}
                        </div>
                        <button type="submit" disabled={loading} className="w-full py-2.5 font-bold text-[14px] transition-all mt-2 text-white disabled:opacity-70 disabled:cursor-not-allowed" style={{ background: '#E07A5F', fontFamily: 'Montserrat, sans-serif' }}>
                            {loading ? 'Even geduld…' : mode === 'login' ? 'INLOGGEN' : 'ACCOUNT AANMAKEN'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
