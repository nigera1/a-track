'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SiteHeader() {
    const pathname = usePathname();
    if (pathname === '/checkout') return null;

    return (
        <header className="sticky top-0 z-50 w-full border-b backdrop-blur-md bg-[#0A0A0A]/90 border-[#1a1a1a]">
            <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 text-[#F9F9F9] group">
                    <div className="w-6 h-6 flex items-center justify-center bg-[#E07A5F] text-white text-[10px]" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800 }}>A</div>
                    <span className="text-[15px]" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, letterSpacing: '-0.01em' }}>A-Track</span>
                </Link>

                <nav className="hidden md:flex items-center gap-5">
                    <Link href="/pricing" className="text-[13px] text-[#9ca3af] hover:text-white transition-colors" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>Prijzen</Link>
                    <Link href="/login" className="text-[13px] text-[#9ca3af] hover:text-white transition-colors" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>Inloggen</Link>
                    <Link href="/pricing" className="text-[12px] font-semibold bg-[#E07A5F] text-white px-4 py-1.5 hover:bg-[#c96a52] transition-colors focus-visible:ring-2 focus-visible:ring-[#E07A5F]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Start Gratis
                    </Link>
                </nav>
            </div>
        </header>
    );
}
