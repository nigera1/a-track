'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { LayoutDashboard, Package, Users, BarChart3, LogOut, Menu, X, Plus, ScanLine, Handshake, Building2 } from 'lucide-react';

const NAV = [
    { href: '/dashboard', label: 'Orders', icon: LayoutDashboard },
    { href: '/orders', label: 'Order List', icon: Package },
    { href: '/deals', label: 'Deals', icon: Handshake },
    { href: '/customers', label: 'Customers', icon: Users },
    { href: '/suppliers', label: 'Suppliers', icon: Building2 },
    { href: '/analytics', label: 'Statistics', icon: BarChart3 },
    { href: '/scan', label: 'Scan QR', icon: ScanLine },
];

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { currentUser, logout, orders } = useStore();
    const [drawerOpen, setDrawerOpen] = useState(false);

    const urgent = orders.filter(o => {
        if (!o.due_date || o.status === 'completed') return false;
        return Math.ceil((new Date(o.due_date).getTime() - Date.now()) / 86400000) <= 3;
    }).length;

    useEffect(() => { if (!currentUser) router.push('/login'); }, [currentUser, router]);
    useEffect(() => { setDrawerOpen(false); }, [pathname]);
    if (!currentUser) return null;

    function doLogout() { logout(); toast.success('Signed out'); router.push('/login'); }

    const initials = currentUser.name.split(' ').map(n => n[0]).join('');

    return (
        <div className="flex min-h-screen min-h-[100dvh]" style={{ background: 'var(--background)' }}>

            {/* ── Desktop Sidebar ── */}
            <aside className="sidebar hidden md:flex flex-col w-[220px] flex-shrink-0">
                {/* Logo */}
                <div className="sidebar-logo">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm"
                            style={{ background: '#2563eb', color: '#fff' }}>A</div>
                        <div>
                            <div className="font-bold text-sm text-gray-900 leading-tight">A-Track</div>
                            <div className="text-[10px] text-gray-400 font-medium">Backoffice</div>
                        </div>
                    </Link>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-2 flex flex-col gap-0.5">
                    {NAV.map(item => {
                        const Icon = item.icon;
                        const active = pathname.startsWith(item.href);
                        return (
                            <Link key={item.href} href={item.href}
                                className={`sidebar-link ${active ? 'active' : ''}`}>
                                <Icon style={{ width: 16, height: 16 }} />
                                <span>{item.label}</span>
                                {item.href === '/dashboard' && urgent > 0 && (
                                    <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                                        style={{ background: '#fee2e2', color: '#ef4444' }}>{urgent}</span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User + Logout */}
                <div className="sidebar-footer">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold"
                            style={{ background: '#e0e7ff', color: '#4338ca' }}>
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-800 truncate">{currentUser.name}</div>
                            <div className="text-[11px] text-gray-400">Backoffice</div>
                        </div>
                    </div>
                    <button onClick={doLogout} className="sidebar-logout" title="Sign out">
                        <LogOut style={{ width: 14, height: 14 }} />
                    </button>
                </div>
            </aside>

            {/* ── Mobile Top Bar + Drawer ── */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 mobile-topbar">
                <div className="flex items-center justify-between px-4 h-12">
                    <button onClick={() => setDrawerOpen(!drawerOpen)} className="p-1.5 -ml-1.5 rounded-md hover:bg-gray-100 transition-colors">
                        {drawerOpen ? <X style={{ width: 20, height: 20, color: '#374151' }} /> : <Menu style={{ width: 20, height: 20, color: '#374151' }} />}
                    </button>
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded flex items-center justify-center font-black text-[10px]"
                            style={{ background: '#2563eb', color: '#fff' }}>A</div>
                        <span className="font-bold text-sm text-gray-900">A-Track</span>
                    </Link>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                        style={{ background: '#e0e7ff', color: '#4338ca' }}>
                        {initials}
                    </div>
                </div>
            </div>

            {/* ── Mobile Drawer Overlay ── */}
            {drawerOpen && (
                <>
                    <div className="md:hidden fixed inset-0 bg-black/30 z-40" onClick={() => setDrawerOpen(false)} />
                    <div className="md:hidden fixed left-0 top-0 bottom-0 w-[260px] z-50 bg-white shadow-xl flex flex-col drawer-slide-in">
                        {/* Drawer header */}
                        <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs"
                                    style={{ background: '#2563eb', color: '#fff' }}>A</div>
                                <span className="font-bold text-sm text-gray-900">A-Track Backoffice</span>
                            </div>
                            <button onClick={() => setDrawerOpen(false)} className="p-1 rounded hover:bg-gray-100">
                                <X style={{ width: 18, height: 18, color: '#6b7280' }} />
                            </button>
                        </div>

                        {/* Drawer nav */}
                        <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5 overflow-y-auto">
                            {NAV.map(item => {
                                const Icon = item.icon;
                                const active = pathname.startsWith(item.href);
                                return (
                                    <Link key={item.href} href={item.href}
                                        className={`sidebar-link ${active ? 'active' : ''}`}>
                                        <Icon style={{ width: 16, height: 16 }} />
                                        <span>{item.label}</span>
                                        {item.href === '/dashboard' && urgent > 0 && (
                                            <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                                                style={{ background: '#fee2e2', color: '#ef4444' }}>{urgent}</span>
                                        )}
                                    </Link>
                                );
                            })}
                            <Link href="/orders/new" className="sidebar-link mt-2" style={{ color: '#2563eb' }}>
                                <Plus style={{ width: 16, height: 16 }} />
                                <span>New Order</span>
                            </Link>
                        </nav>

                        {/* Drawer footer */}
                        <div className="sidebar-footer">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold"
                                    style={{ background: '#e0e7ff', color: '#4338ca' }}>
                                    {initials}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-gray-800 truncate">{currentUser.name}</div>
                                    <div className="text-[11px] text-gray-400">Backoffice</div>
                                </div>
                            </div>
                            <button onClick={doLogout} className="sidebar-logout" title="Sign out">
                                <LogOut style={{ width: 14, height: 14 }} />
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* ── Main Content ── */}
            <div className="flex-1 flex flex-col min-w-0">
                <main className="flex-1 overflow-y-auto overflow-x-hidden">
                    <div className="main-content page-enter pt-14 md:pt-0">
                        {children}
                    </div>
                </main>

                {/* Footer */}
                <footer className="no-print border-t border-gray-100" style={{ background: 'var(--card)' }}>
                    <div className="main-content py-3 flex items-center justify-between">
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted-foreground)' }}>
                            © {new Date().getFullYear()} A-Track · Jewelry Workshop
                        </span>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', color: 'var(--muted-foreground)', opacity: 0.6 }}>
                            v1.0 POC
                        </span>
                    </div>
                </footer>
            </div>
        </div>
    );
}
