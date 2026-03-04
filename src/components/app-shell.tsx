'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { LayoutDashboard, Package, Users, BarChart3, LogOut, Menu, X, Plus, ScanLine } from 'lucide-react';

const NAV = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/orders', label: 'Orders' },
    { href: '/customers', label: 'Customers' },
    { href: '/suppliers', label: 'Suppliers' },
    { href: '/analytics', label: 'Analytics' },
    { href: '/scan', label: '▣ Scan QR' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { currentUser, logout, orders } = useStore();
    const [menuOpen, setMenuOpen] = useState(false);

    const urgent = orders.filter(o => {
        if (!o.due_date || o.status === 'completed') return false;
        return Math.ceil((new Date(o.due_date).getTime() - Date.now()) / 86400000) <= 3;
    }).length;

    useEffect(() => { if (!currentUser) router.push('/login'); }, [currentUser, router]);
    if (!currentUser) return null;

    function doLogout() { logout(); toast.success('Signed out'); router.push('/login'); }

    return (
        <div className="flex flex-col min-h-screen min-h-[100dvh]" style={{ background: 'var(--background)' }}>

            {/* ── Top Navbar ── */}
            <header style={{ background: 'var(--nav-bg)', borderBottom: '3px solid #000' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 48px', display: 'flex', alignItems: 'center', height: 48, gap: 24 }}>

                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-2 mr-2">
                        <span className="font-black text-white italic text-lg tracking-tight">A-TRACK</span>
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-1 flex-1">
                        {NAV.map(item => (
                            <Link key={item.href} href={item.href}
                                className={`nav-link ${pathname.startsWith(item.href) ? 'active' : ''}`}>
                                {item.label}
                                {item.href === '/dashboard' && urgent > 0 && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-black" style={{ background: '#ef4444', color: '#fff' }}>{urgent}</span>
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* Right side */}
                    <div className="ml-auto flex items-center gap-2">
                        <Link href="/orders/new" className="hidden md:flex neo-btn neo-btn-gold text-[11px]">
                            <Plus style={{ width: 12, height: 12 }} /> New Order
                        </Link>
                        <div className="hidden md:flex items-center gap-2 px-2 py-1 rounded-md" style={{ background: 'rgba(255,255,255,0.08)' }}>
                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black" style={{ background: '#d4a832', color: '#111' }}>
                                {currentUser.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="text-xs font-semibold text-white">{currentUser.name.split(' ')[0]}</span>
                        </div>
                        <button onClick={doLogout} className="hidden md:flex items-center gap-1.5 text-[11px] font-bold uppercase px-2 py-1 rounded" style={{ color: 'rgba(255,255,255,0.5)' }}
                            title="Sign out">
                            <LogOut style={{ width: 13, height: 13 }} /> Out
                        </button>

                        {/* Mobile hamburger */}
                        <button className="md:hidden p-1 text-white" onClick={() => setMenuOpen(!menuOpen)}>
                            {menuOpen ? <X style={{ width: 20, height: 20 }} /> : <Menu style={{ width: 20, height: 20 }} />}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {menuOpen && (
                    <div className="md:hidden px-8 pb-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        {NAV.map(item => (
                            <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                                className={`nav-link block py-2 ${pathname.startsWith(item.href) ? 'active' : ''}`}>
                                {item.label}
                            </Link>
                        ))}
                        <Link href="/orders/new" onClick={() => setMenuOpen(false)} className="nav-link block py-2" style={{ color: '#d4a832' }}>
                            + New Order
                        </Link>
                        <button onClick={doLogout} className="nav-link w-full text-left py-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                            Sign Out
                        </button>
                    </div>
                )}
            </header>

            {/* ── Main content ── */}
            <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 48px' }} className="page-enter">
                    {children}
                </div>
            </main>
        </div>
    );
}
