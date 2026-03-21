'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function MarketingHome() {
    return (
        <div className="flex flex-col min-h-screen bg-[#0A0A0A]">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "A-Track",
                        "applicationCategory": "BusinessApplication",
                        "operatingSystem": "All",
                        "offers": { "@type": "Offer", "price": "79.00", "priceCurrency": "EUR" }
                    })
                }}
            />

            {/* HERO */}
            <section className="relative pt-24 pb-16 lg:pt-36 lg:pb-24 overflow-hidden px-6">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[#0A0A0A]/85 z-10"></div>
                    <Image src="/saas-hero.png" alt="" fill className="object-cover opacity-30" priority />
                </div>
                <div className="relative z-20 max-w-3xl mx-auto">
                    <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#E07A5F] mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>Atelier Systems</p>
                    <h1 className="text-3xl md:text-5xl font-bold text-[#F9F9F9] tracking-tight mb-5 leading-[1.15]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Robuust. Betrouwbaar.<br /><span className="text-[#E07A5F]">Schoon.</span>
                    </h1>
                    <p className="text-[15px] md:text-[17px] text-[#9ca3af] max-w-md mb-8 leading-relaxed" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>
                        Order-tracking voor juweliers ateliers die geen Excel meer willen. Scan, volg, lever — alles op één plek.
                    </p>
                    <div className="flex flex-col sm:flex-row items-start gap-3">
                        <Link href="/pricing" className="px-6 py-2.5 bg-[#E07A5F] hover:bg-[#c96a52] text-white text-[13px] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[#E07A5F]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            Bekijk Demo
                        </Link>
                        <Link href="/login" className="px-6 py-2.5 bg-transparent hover:bg-[#1a1a1a] text-[#6C757D] hover:text-white text-[13px] font-medium border border-[#2a2a2a] transition-colors" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>
                            Inloggen
                        </Link>
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section className="py-16 bg-[#111] border-y border-[#1a1a1a] px-6">
                <div className="max-w-4xl mx-auto">
                    <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#E07A5F] mb-2 text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>Waarom A-Track</p>
                    <h2 className="text-2xl md:text-3xl font-bold text-[#F9F9F9] mb-12 text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>Gebouwd voor precisie.</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: '🔒', title: 'Robuust', desc: 'Veilige opslag. Geen Excel, geen papier.' },
                            { icon: '✓', title: 'Betrouwbaar', desc: 'Realtime updates. Altijd weten waar elk stuk is.' },
                            { icon: '◻', title: 'Schoon', desc: 'Minimalistisch. Focus op uw werkplaats.' },
                        ].map((f, i) => (
                            <div key={i} className="p-5 border border-[#1a1a1a] hover:border-[#E07A5F]/30 transition-colors">
                                <div className="text-xl mb-3">{f.icon}</div>
                                <h3 className="text-[14px] font-semibold text-[#F9F9F9] mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>{f.title}</h3>
                                <p className="text-[13px] text-[#6C757D] leading-relaxed" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="py-16 bg-[#0A0A0A] px-6">
                <div className="max-w-3xl mx-auto">
                    <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#E07A5F] mb-2 text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>Workflow</p>
                    <h2 className="text-2xl md:text-3xl font-bold text-[#F9F9F9] mb-12 text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>Hoe het werkt</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { step: '01', title: 'Upload', desc: 'Voer orders in via CSV of handmatig.' },
                            { step: '02', title: 'Genereer QR', desc: 'Maak een QR-code per bestelling.' },
                            { step: '03', title: 'Scan & Volg', desc: 'Scan om status te bekijken of bijwerken.' },
                        ].map((s, i) => (
                            <div key={i} className="text-center">
                                <div className="text-3xl font-bold text-[#E07A5F]/60 mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>{s.step}</div>
                                <h3 className="text-[14px] font-semibold text-[#F9F9F9] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>{s.title}</h3>
                                <p className="text-[13px] text-[#6C757D]" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA BAND */}
            <section className="py-12 bg-[#E07A5F] px-6">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>Klaar om te starten?</h2>
                    <p className="text-white/70 mb-6 text-[14px]" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>Geen creditcard nodig · 14 dagen gratis</p>
                    <Link href="/pricing" className="inline-block px-6 py-2.5 bg-[#0A0A0A] text-white text-[13px] font-semibold hover:bg-[#1a1a1a] transition-colors" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Start Proefperiode
                    </Link>
                </div>
            </section>
        </div>
    );
}
