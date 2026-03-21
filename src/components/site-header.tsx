'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gem } from 'lucide-react';

export function SiteHeader() {
    const pathname = usePathname();
    if (pathname === '/checkout') return null;

    return (
        <header className="sticky top-0 z-50 w-full border-b backdrop-blur-md bg-[#0A0A0A]/90 border-[#2a2a2a]">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2.5 text-[#F9F9F9] group">
                    <div className="w-8 h-8 flex items-center justify-center bg-[#E07A5F] text-white transition-transform group-hover:rotate-3" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 14 }}>
                        A
                    </div>
                    <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>
                        A-TRACK
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-6">
                    <Link href="/pricing" className="text-sm font-medium text-[#9ca3af] hover:text-white transition-colors" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>Prijzen</Link>
                    <Link href="/login" className="text-sm font-medium text-[#9ca3af] hover:text-white transition-colors" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>Inloggen</Link>
                    <Link href="/pricing" className="text-sm font-bold bg-[#E07A5F] text-white px-5 py-2 hover:bg-[#c96a52] transition-colors focus-visible:ring-2 focus-visible:ring-[#E07A5F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Start Gratis
                    </Link>
                </nav>
            </div>
        </header>
    );
}
