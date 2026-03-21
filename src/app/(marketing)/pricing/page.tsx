'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PricingPage() {
    const [isAnnual, setIsAnnual] = useState(true);

    return (
        <div className="flex-1 bg-[#0A0A0A] pt-24 pb-32 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-[#F9F9F9] tracking-tight mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Eenvoudige, transparante <span className="text-[#E07A5F]">prijzen.</span>
                    </h1>
                    <p className="text-lg text-[#6C757D] max-w-2xl mx-auto" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>
                        Of u nu een solist bent of een volledig atelier runt — wij hebben een plan dat bij uw werkstroom past.
                    </p>
                </div>

                {/* TOGGLE */}
                <div className="flex justify-center mb-16">
                    <div className="flex bg-[#1a1a1a] p-1.5 border border-[#2a2a2a]">
                        <button
                            onClick={() => setIsAnnual(false)}
                            aria-pressed={!isAnnual}
                            className={`px-6 py-2.5 text-sm font-bold transition-all focus-visible:ring-2 focus-visible:ring-[#E07A5F] outline-none ${!isAnnual ? 'bg-[#3A3A3A] text-white' : 'text-[#6C757D] hover:text-white'}`}
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                            Maandelijks
                        </button>
                        <button
                            onClick={() => setIsAnnual(true)}
                            aria-pressed={isAnnual}
                            className={`px-6 py-2.5 text-sm font-bold transition-all focus-visible:ring-2 focus-visible:ring-[#E07A5F] outline-none flex items-center gap-2 ${isAnnual ? 'bg-[#3A3A3A] text-white' : 'text-[#6C757D] hover:text-white'}`}
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                            Jaarlijks <span className="text-[#E07A5F] font-extrabold">-20%</span>
                        </button>
                    </div>
                </div>

                {/* CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    
                    {/* Starter */}
                    <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-8 flex flex-col">
                        <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>Starter</h3>
                        <p className="text-[#6C757D] text-sm mb-6 h-10" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>Perfect voor solo juweliers die willen organiseren.</p>
                        <div className="flex items-baseline gap-1 mb-8">
                            <span className="text-5xl font-extrabold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>€{isAnnual ? '29' : '39'}</span>
                            <span className="text-[#6C757D] font-medium">/mo</span>
                        </div>
                        <Link href="/checkout?plan=starter" className="w-full py-3.5 bg-[#3A3A3A] hover:bg-[#4a4a4a] text-white font-bold transition-colors text-center focus-visible:ring-2 focus-visible:ring-[#E07A5F] mb-8 border border-[#4a4a4a]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            Start Gratis
                        </Link>
                        <ul className="space-y-4 text-[#9ca3af] text-sm flex-1" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>
                            <li className="flex gap-3 items-start"><span className="text-[#E07A5F] font-bold">✓</span> Tot 50 actieve orders</li>
                            <li className="flex gap-3 items-start"><span className="text-[#E07A5F] font-bold">✓</span> Basis Kanban-bord</li>
                            <li className="flex gap-3 items-start"><span className="text-[#E07A5F] font-bold">✓</span> 1 medewerker</li>
                        </ul>
                    </div>

                    {/* Pro (Highlighted) */}
                    <div className="bg-[#1a1a1a] border-2 border-[#E07A5F] p-8 flex flex-col relative transform md:-translate-y-4 shadow-[0_0_40px_-10px_rgba(224,122,95,0.4)]">
                        <div className="absolute top-0 right-8 -translate-y-1/2 bg-[#E07A5F] text-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            Populairste
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>Pro</h3>
                        <p className="text-[#E07A5F]/70 text-sm mb-6 h-10" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>Voor groeiende ateliers met geavanceerde analyses.</p>
                        <div className="flex items-baseline gap-1 mb-8">
                            <span className="text-5xl font-extrabold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>€{isAnnual ? '79' : '99'}</span>
                            <span className="text-[#E07A5F]/50 font-medium">/mo</span>
                        </div>
                        <Link href="/checkout?plan=pro" className="w-full py-3.5 bg-[#E07A5F] hover:bg-[#c96a52] text-white font-bold transition-colors text-center focus-visible:ring-2 focus-visible:ring-[#E07A5F] mb-8" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            Start Nu
                        </Link>
                        <ul className="space-y-4 text-[#d1d5db] text-sm flex-1" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>
                            <li className="flex gap-3 items-start"><span className="text-[#E07A5F] font-bold">✓</span> Onbeperkt actieve orders</li>
                            <li className="flex gap-3 items-start"><span className="text-[#E07A5F] font-bold">✓</span> Geavanceerde werkplaats analyses</li>
                            <li className="flex gap-3 items-start"><span className="text-[#E07A5F] font-bold">✓</span> Tot 5 medewerkers</li>
                            <li className="flex gap-3 items-start"><span className="text-[#E07A5F] font-bold">✓</span> Prioriteit 24/7 support</li>
                        </ul>
                    </div>

                    {/* Enterprise */}
                    <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-8 flex flex-col">
                        <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>Enterprise</h3>
                        <p className="text-[#6C757D] text-sm mb-6 h-10" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>Aangepaste workflows voor meerdere locaties.</p>
                        <div className="flex items-baseline gap-1 mb-8">
                            <span className="text-5xl font-extrabold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>Op Maat</span>
                        </div>
                        <Link href="mailto:info@a-track.nl" className="w-full py-3.5 bg-[#3A3A3A] hover:bg-[#4a4a4a] text-white font-bold transition-colors text-center focus-visible:ring-2 focus-visible:ring-[#E07A5F] mb-8 border border-[#4a4a4a]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            Neem Contact Op
                        </Link>
                        <ul className="space-y-4 text-[#9ca3af] text-sm flex-1" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>
                            <li className="flex gap-3 items-start"><span className="text-[#E07A5F] font-bold">✓</span> Alles in Pro</li>
                            <li className="flex gap-3 items-start"><span className="text-[#E07A5F] font-bold">✓</span> Aangepaste integraties (ERP/CRM)</li>
                            <li className="flex gap-3 items-start"><span className="text-[#E07A5F] font-bold">✓</span> Onbeperkt medewerkers</li>
                            <li className="flex gap-3 items-start"><span className="text-[#E07A5F] font-bold">✓</span> Toegewezen accountmanager</li>
                        </ul>
                    </div>

                </div>
            </div>
        </div>
    );
}
