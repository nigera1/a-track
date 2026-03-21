'use client';

import Link from 'next/link';

export function SiteFooter() {
    return (
        <footer className="bg-[#0A0A0A] text-[#6C757D] py-12 border-t border-[#2a2a2a]">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>
                <div className="md:col-span-1">
                    <Link href="/" className="flex items-center gap-2 text-[#F9F9F9] mb-4">
                        <div className="w-6 h-6 flex items-center justify-center bg-[#E07A5F] text-white" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 11 }}>A</div>
                        <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 14 }}>A-TRACK</span>
                    </Link>
                    <p className="text-sm leading-relaxed">Robuust, betrouwbaar, schoon order-tracking voor juweliers ateliers.</p>
                </div>
                <div>
                    <h3 className="text-white font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>Product</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/pricing" className="hover:text-[#E07A5F] transition-colors">Prijzen</Link></li>
                        <li><Link href="#" className="hover:text-[#E07A5F] transition-colors">Functies</Link></li>
                        <li><Link href="#" className="hover:text-[#E07A5F] transition-colors">Casestudies</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-white font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>Bedrijf</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="#" className="hover:text-[#E07A5F] transition-colors">Over Ons</Link></li>
                        <li><Link href="#" className="hover:text-[#E07A5F] transition-colors">Blog</Link></li>
                        <li><Link href="#" className="hover:text-[#E07A5F] transition-colors">Vacatures</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-white font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>Juridisch</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="#" className="hover:text-[#E07A5F] transition-colors">Privacybeleid</Link></li>
                        <li><Link href="#" className="hover:text-[#E07A5F] transition-colors">Algemene Voorwaarden</Link></li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-[#2a2a2a]/50 text-sm flex flex-col md:flex-row items-center justify-between">
                <p>&copy; {new Date().getFullYear()} A-Track. Alle rechten voorbehouden.</p>
                <div className="flex gap-4 mt-4 md:mt-0 items-center">
                    <span className="w-2 h-2 rounded-full bg-green-500 block" aria-hidden="true"></span>
                    <span>Alle systemen operationeel</span>
                </div>
            </div>
        </footer>
    );
}
