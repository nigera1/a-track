'use client';

import Link from 'next/link';

export function SiteFooter() {
    return (
        <footer className="bg-[#0A0A0A] text-[#6C757D] py-10 border-t border-[#1a1a1a]" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>
            <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-[12px]">
                <div className="col-span-2 md:col-span-1">
                    <Link href="/" className="flex items-center gap-1.5 text-[#F9F9F9] mb-3">
                        <div className="w-5 h-5 flex items-center justify-center bg-[#E07A5F] text-white text-[9px]" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800 }}>A</div>
                        <span className="text-[13px]" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>A-Track</span>
                    </Link>
                    <p className="leading-relaxed">Robuust, betrouwbaar, schoon<br />order-tracking voor ateliers.</p>
                </div>
                <div>
                    <h3 className="text-white font-semibold mb-2.5 text-[11px] uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>Product</h3>
                    <ul className="space-y-1.5">
                        <li><Link href="/pricing" className="hover:text-[#E07A5F] transition-colors">Prijzen</Link></li>
                        <li><Link href="#" className="hover:text-[#E07A5F] transition-colors">Functies</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-white font-semibold mb-2.5 text-[11px] uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>Bedrijf</h3>
                    <ul className="space-y-1.5">
                        <li><Link href="#" className="hover:text-[#E07A5F] transition-colors">Over Ons</Link></li>
                        <li><Link href="#" className="hover:text-[#E07A5F] transition-colors">Blog</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-white font-semibold mb-2.5 text-[11px] uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>Juridisch</h3>
                    <ul className="space-y-1.5">
                        <li><Link href="#" className="hover:text-[#E07A5F] transition-colors">Privacy</Link></li>
                        <li><Link href="#" className="hover:text-[#E07A5F] transition-colors">Voorwaarden</Link></li>
                    </ul>
                </div>
            </div>
            <div className="max-w-5xl mx-auto px-6 mt-8 pt-6 border-t border-[#1a1a1a]/50 text-[11px] flex items-center justify-between">
                <p>&copy; {new Date().getFullYear()} A-Track</p>
                <div className="flex gap-2 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 block" aria-hidden="true"></span>
                    <span>Operationeel</span>
                </div>
            </div>
        </footer>
    );
}
