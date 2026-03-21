'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PricingPage() {
    const [isAnnual, setIsAnnual] = useState(true);

    return (
        <div className="flex-1 bg-[#0A0A0A] pt-20 pb-24 px-6">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#E07A5F] mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>Prijzen</p>
                    <h1 className="text-2xl md:text-4xl font-bold text-[#F9F9F9] tracking-tight mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Eenvoudig en <span className="text-[#E07A5F]">transparant.</span>
                    </h1>
                    <p className="text-[14px] text-[#6C757D] max-w-lg mx-auto" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>
                        Of u solo werkt of een volledig atelier runt — er is een plan voor u.
                    </p>
                </div>

                {/* Toggle */}
                <div className="flex justify-center mb-12">
                    <div className="inline-flex bg-[#111] p-1 border border-[#1a1a1a]">
                        <button onClick={() => setIsAnnual(false)} aria-pressed={!isAnnual}
                            className={`px-4 py-1.5 text-[12px] font-semibold transition-all focus-visible:ring-2 focus-visible:ring-[#E07A5F] outline-none ${!isAnnual ? 'bg-[#2a2a2a] text-white' : 'text-[#6C757D] hover:text-white'}`}
                            style={{ fontFamily: 'Montserrat, sans-serif' }}>Maandelijks</button>
                        <button onClick={() => setIsAnnual(true)} aria-pressed={isAnnual}
                            className={`px-4 py-1.5 text-[12px] font-semibold transition-all focus-visible:ring-2 focus-visible:ring-[#E07A5F] outline-none flex items-center gap-1.5 ${isAnnual ? 'bg-[#2a2a2a] text-white' : 'text-[#6C757D] hover:text-white'}`}
                            style={{ fontFamily: 'Montserrat, sans-serif' }}>Jaarlijks <span className="text-[#E07A5F] font-bold">-20%</span></button>
                    </div>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
                    {/* Starter */}
                    <div className="bg-[#111] border border-[#1a1a1a] p-6 flex flex-col">
                        <h3 className="text-[15px] font-semibold text-white mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Starter</h3>
                        <p className="text-[12px] text-[#6C757D] mb-5" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>Solo juweliers die willen organiseren.</p>
                        <div className="flex items-baseline gap-0.5 mb-6">
                            <span className="text-3xl font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>€{isAnnual ? '29' : '39'}</span>
                            <span className="text-[12px] text-[#6C757D]">/mo</span>
                        </div>
                        <Link href="/checkout?plan=starter" className="w-full py-2 bg-[#2a2a2a] hover:bg-[#3A3A3A] text-white text-[12px] font-semibold transition-colors text-center focus-visible:ring-2 focus-visible:ring-[#E07A5F] mb-5 border border-[#3A3A3A]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Start Gratis</Link>
                        <ul className="space-y-2.5 text-[#9ca3af] text-[12px] flex-1" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>
                            <li className="flex gap-2 items-start"><span className="text-[#E07A5F]">✓</span> Tot 50 actieve orders</li>
                            <li className="flex gap-2 items-start"><span className="text-[#E07A5F]">✓</span> Basis Kanban-bord</li>
                            <li className="flex gap-2 items-start"><span className="text-[#E07A5F]">✓</span> 1 medewerker</li>
                        </ul>
                    </div>

                    {/* Pro */}
                    <div className="bg-[#111] border-2 border-[#E07A5F] p-6 flex flex-col relative md:-translate-y-3 shadow-[0_0_30px_-8px_rgba(224,122,95,0.3)]">
                        <div className="absolute top-0 right-6 -translate-y-1/2 bg-[#E07A5F] text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest" style={{ fontFamily: 'Montserrat, sans-serif' }}>Populairste</div>
                        <h3 className="text-[17px] font-semibold text-white mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Pro</h3>
                        <p className="text-[12px] text-[#E07A5F]/60 mb-5" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>Groeiende ateliers met geavanceerde analyses.</p>
                        <div className="flex items-baseline gap-0.5 mb-6">
                            <span className="text-3xl font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>€{isAnnual ? '79' : '99'}</span>
                            <span className="text-[12px] text-[#E07A5F]/40">/mo</span>
                        </div>
                        <Link href="/checkout?plan=pro" className="w-full py-2 bg-[#E07A5F] hover:bg-[#c96a52] text-white text-[12px] font-semibold transition-colors text-center focus-visible:ring-2 focus-visible:ring-[#E07A5F] mb-5" style={{ fontFamily: 'Montserrat, sans-serif' }}>Start Nu</Link>
                        <ul className="space-y-2.5 text-[#d1d5db] text-[12px] flex-1" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>
                            <li className="flex gap-2 items-start"><span className="text-[#E07A5F]">✓</span> Onbeperkt actieve orders</li>
                            <li className="flex gap-2 items-start"><span className="text-[#E07A5F]">✓</span> Geavanceerde analyses</li>
                            <li className="flex gap-2 items-start"><span className="text-[#E07A5F]">✓</span> Tot 5 medewerkers</li>
                            <li className="flex gap-2 items-start"><span className="text-[#E07A5F]">✓</span> 24/7 support</li>
                        </ul>
                    </div>

                    {/* Enterprise */}
                    <div className="bg-[#111] border border-[#1a1a1a] p-6 flex flex-col">
                        <h3 className="text-[15px] font-semibold text-white mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Enterprise</h3>
                        <p className="text-[12px] text-[#6C757D] mb-5" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>Meerdere locaties, aangepaste workflows.</p>
                        <div className="flex items-baseline gap-0.5 mb-6">
                            <span className="text-3xl font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>Op Maat</span>
                        </div>
                        <Link href="mailto:info@a-track.nl" className="w-full py-2 bg-[#2a2a2a] hover:bg-[#3A3A3A] text-white text-[12px] font-semibold transition-colors text-center focus-visible:ring-2 focus-visible:ring-[#E07A5F] mb-5 border border-[#3A3A3A]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Contact</Link>
                        <ul className="space-y-2.5 text-[#9ca3af] text-[12px] flex-1" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>
                            <li className="flex gap-2 items-start"><span className="text-[#E07A5F]">✓</span> Alles in Pro</li>
                            <li className="flex gap-2 items-start"><span className="text-[#E07A5F]">✓</span> ERP/CRM integraties</li>
                            <li className="flex gap-2 items-start"><span className="text-[#E07A5F]">✓</span> Onbeperkt medewerkers</li>
                            <li className="flex gap-2 items-start"><span className="text-[#E07A5F]">✓</span> Accountmanager</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
