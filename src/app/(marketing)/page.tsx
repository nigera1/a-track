'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function MarketingHome() {
    return (
        <div className="flex flex-col min-h-screen bg-slate-950">
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "A-Track Pro",
                        "applicationCategory": "BusinessApplication",
                        "operatingSystem": "All",
                        "offers": {
                            "@type": "Offer",
                            "price": "79.00",
                            "priceCurrency": "USD"
                        }
                    })
                }}
            />

            {/* HERO SECTION */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden px-6">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-slate-950/80 z-10 mix-blend-multiply"></div>
                    <Image
                        src="/saas-hero.png"
                        alt="Abstract geometric shapes in navy and amber workspace"
                        fill
                        className="object-cover opacity-60"
                        priority
                    />
                </div>
                
                <div className="relative z-20 max-w-5xl mx-auto text-center">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8">
                        Master Your <span className="text-amber-500">Workshop.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto mb-12 font-medium">
                        The ultimate cloud platform to scale your jewelry atelier. Start saving 10 hours a week, today.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/pricing" className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 text-lg shadow-[0_0_30px_-5px_theme(colors.amber.500)]">
                            Start 14-Day Free Trial
                        </Link>
                        <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-slate-800/80 hover:bg-slate-700/80 text-white font-medium rounded-lg border border-slate-700 transition-colors backdrop-blur-sm text-lg">
                            Log in to Workspace
                        </Link>
                    </div>
                </div>
            </section>

            {/* FEATURES ZIG-ZAG */}
            <section className="py-24 bg-slate-900 border-y border-slate-800 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Built for precision.</h2>
                        <p className="text-lg text-slate-400 max-w-2xl mx-auto">Everything you need to orchestrate production, manage clients, and track stages without skipping a beat.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
                        <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 shadow-2xl h-[400px] flex items-center justify-center relative overflow-hidden group">
                           <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                           <div className="text-9xl">📊</div>
                        </div>
                        <div>
                            <div className="text-amber-500 font-bold tracking-widest uppercase text-sm mb-3">Kanban Operations</div>
                            <h3 className="text-3xl font-bold text-white mb-6">Visual Pipeline Control</h3>
                            <p className="text-slate-400 text-lg leading-relaxed">
                                Instantly see where every custom piece is in production. Drag and drop orders from casting to polishing with real-time sync across your entire atelier.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div className="order-2 md:order-1">
                            <div className="text-amber-500 font-bold tracking-widest uppercase text-sm mb-3">Client Management</div>
                            <h3 className="text-3xl font-bold text-white mb-6">Centralized Directory</h3>
                            <p className="text-slate-400 text-lg leading-relaxed">
                                Keep all customer dimensions, preferences, and historic orders in one secure vault. Serve your VIPs faster with instant context on every call.
                            </p>
                        </div>
                        <div className="order-1 md:order-2 bg-slate-800/50 rounded-2xl p-8 border border-slate-700 shadow-2xl h-[400px] flex items-center justify-center relative overflow-hidden group">
                           <div className="absolute inset-0 bg-gradient-to-bl from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                           <div className="text-9xl">👥</div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
