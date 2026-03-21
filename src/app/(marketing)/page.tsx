'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function MarketingHome() {
    return (
        <div className="flex flex-col min-h-screen bg-[#0A0A0A]">
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "A-Track",
                        "applicationCategory": "BusinessApplication",
                        "operatingSystem": "All",
                        "offers": {
                            "@type": "Offer",
                            "price": "79.00",
                            "priceCurrency": "EUR"
                        }
                    })
                }}
            />

            {/* HERO SECTION */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden px-6">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[#0A0A0A]/85 z-10"></div>
                    <Image
                        src="/saas-hero.png"
                        alt="Abstracte werkplaatsomgeving"
                        fill
                        className="object-cover opacity-40"
                        priority
                    />
                </div>
                
                <div className="relative z-20 max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-[#F9F9F9] tracking-tight mb-6 leading-[1.1]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Robuust. Betrouwbaar.<br />
                        <span className="text-[#E07A5F]">Schoon.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-[#9ca3af] max-w-xl mb-10" style={{ fontFamily: 'Source Sans 3, sans-serif', lineHeight: 1.7 }}>
                        Order-tracking voor kleine juweliers ateliers die geen Excel-papieren meer willen. Bouw, scan, volg — alles op één plek.
                    </p>
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                        <Link href="/pricing" className="px-8 py-4 bg-[#E07A5F] hover:bg-[#c96a52] text-white font-bold transition-colors focus-visible:ring-2 focus-visible:ring-[#E07A5F] text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            Bekijk Demo
                        </Link>
                        <Link href="/login" className="px-8 py-4 bg-transparent hover:bg-[#1a1a1a] text-[#9ca3af] hover:text-white font-medium border border-[#3A3A3A] transition-colors text-lg" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>
                            Inloggen
                        </Link>
                    </div>
                </div>
            </section>

            {/* FEATURES — 3 CARD GRID */}
            <section className="py-24 bg-[#121212] border-y border-[#2a2a2a] px-6">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#F9F9F9] mb-16 text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Gebouwd voor precisie.
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: '🔒', title: 'Robuust', desc: 'Veilige opslag van al uw ordergegevens. Geen Excel meer, geen papier meer.' },
                            { icon: '✓', title: 'Betrouwbaar', desc: 'Realtime updates zonder vertraging. Weet altijd waar elk stuk zich in productie bevindt.' },
                            { icon: '◻', title: 'Schoon', desc: 'Minimalistisch design, geen rommel. Focus op wat telt: uw werkplaats.' },
                        ].map((f, i) => (
                            <div key={i} className="bg-[#1a1a1a] p-8 border border-[#2a2a2a] hover:border-[#E07A5F]/40 transition-colors group">
                                <div className="text-3xl mb-4">{f.icon}</div>
                                <h3 className="text-xl font-bold text-[#F9F9F9] mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>{f.title}</h3>
                                <p className="text-[#6C757D] leading-relaxed" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="py-24 bg-[#0A0A0A] px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#F9F9F9] mb-16 text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Hoe het werkt
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { step: '01', title: 'Upload', desc: 'Voer uw orderinformatie in via CSV of handmatig.' },
                            { step: '02', title: 'Genereer QR', desc: 'Maak een QR-code per bestelling met één klik.' },
                            { step: '03', title: 'Scan & Volg', desc: 'Scan de QR om de status te bekijken of bij te werken.' },
                        ].map((s, i) => (
                            <div key={i} className="text-center">
                                <div className="text-5xl font-black text-[#E07A5F] mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>{s.step}</div>
                                <h3 className="text-lg font-bold text-[#F9F9F9] mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>{s.title}</h3>
                                <p className="text-[#6C757D]" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="py-20 bg-[#E07A5F] px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Klaar om uw werkplaats te upgraden?
                    </h2>
                    <p className="text-white/80 mb-8 text-lg" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>
                        Geen creditcard nodig. Probeer 14 dagen gratis.
                    </p>
                    <Link href="/pricing" className="inline-block px-10 py-4 bg-[#0A0A0A] text-white font-bold hover:bg-[#1a1a1a] transition-colors text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Start Gratis Proefperiode
                    </Link>
                </div>
            </section>
        </div>
    );
}
