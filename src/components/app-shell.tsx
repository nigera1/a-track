'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { LayoutDashboard, Package, Users, BarChart3, LogOut, Menu, X } from 'lucide-react';

const NAV = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/orders', icon: Package, label: 'Orders' },
    { href: '/customers', icon: Users, label: 'Customers' },
    { href: '/analytics', icon: BarChart3, label: 'Analytics' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { currentUser, logout, orders } = useStore();
    const [open, setOpen] = useState(false);

    const urgent = orders.filter(o => {
        if (!o.due_date || o.status === 'completed') return false;
        return Math.ceil((new Date(o.due_date).getTime() - Date.now()) / 86400000) <= 3;
    }).length;

    useEffect(() => { if (!currentUser) router.push('/login'); }, [currentUser, router]);
    if (!currentUser) return null;

    function doLogout() { logout(); toast.success('Signed out'); router.push('/login'); }

    const Sidebar = () => (
        <div className="flex flex-col h-full">
            <div className="px-4 py-4 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs" style={{ background: 'var(--gold)', color: '#111' }}>A</div>
                <span className="font-semibold text-sm">A-Track</span>
            </div>
            <div className="mx-3 mb-2" style={{ borderTop: '1px solid var(--border)' }} />
            <nav className="flex-1 px-2 flex flex-col gap-0.5">
                {NAV.map(item => (
                    <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                        className={`nav-link ${pathname.startsWith(item.href) ? 'active' : ''}`}>
                        <item.icon style={{ width: 16, height: 16 }} />
                        <span>{item.label}</span>
                        {item.href === '/dashboard' && urgent > 0 && (
                            <span className="ml-auto text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold" style={{ background: '#d4432015', color: '#d44' }}>{urgent}</span>
                        )}
                    </Link>
                ))}
            </nav>
            <div className="px-2 pb-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-md" style={{ background: 'var(--muted)' }}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: 'rgba(212,168,50,0.15)', color: 'var(--gold)' }}>
                        {currentUser.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{currentUser.name}</div>
                    </div>
                    <button onClick={doLogout} className="p-1 rounded opacity-50 hover:opacity-100" title="Sign out">
                        <LogOut style={{ width: 13, height: 13 }} />
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen h-[100dvh] overflow-hidden">
            {/* Desktop sidebar */}
            <aside className="hidden md:flex flex-col w-52 flex-shrink-0 h-full" style={{ background: 'var(--card)', borderRight: '1px solid var(--border)' }}>
                <Sidebar />
            </aside>

            {/* Mobile overlay */}
            {open && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
                    <aside className="absolute left-0 top-0 bottom-0 w-52" style={{ background: 'var(--card)', borderRight: '1px solid var(--border)' }}>
                        <Sidebar />
                    </aside>
                </div>
            )}

            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                {/* Mobile header */}
                <header className="md:hidden flex items-center gap-3 px-3 py-2.5 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)', background: 'var(--card)' }}>
                    <button onClick={() => setOpen(true)} className="p-1"><Menu style={{ width: 20, height: 20 }} /></button>
                    <span className="font-semibold text-sm flex-1">A-Track</span>
                    {urgent > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: '#d4432015', color: '#d44' }}>{urgent}</span>}
                </header>
                <main className="flex-1 overflow-y-auto p-4 md:p-6 page-enter">
                    {children}
                </main>
            </div>
        </div>
    );
}
