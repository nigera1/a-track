'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gem, Lock } from 'lucide-react';

export function SiteHeader() {
    const pathname = usePathname();
    
    // Hide header on checkout for an enclosed flow (best practice)
    if (pathname === '/checkout') return null;

    return (
        <header className="sticky top-0 z-50 w-full border-b backdrop-blur-md bg-slate-900/80 border-slate-800">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 text-slate-50 group">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-500 text-slate-900 transition-transform group-hover:scale-105">
                        <Gem style={{ width: 16, height: 16, strokeWidth: 3 }} />
                    </div>
                    <span className="font-bold text-lg tracking-tight">A-TRACK <span className="text-amber-500">PRO</span></span>
                </Link>

                <nav className="hidden md:flex items-center gap-6">
                    <Link href="/pricing" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Pricing</Link>
                    <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Log In</Link>
                    <Link href="/pricing" className="text-sm font-bold bg-amber-500 text-slate-900 px-4 py-2 rounded-md hover:bg-amber-400 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">
                        Start Free Trial
                    </Link>
                </nav>
            </div>
        </header>
    );
}
