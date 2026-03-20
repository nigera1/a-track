'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
    const [isAnnual, setIsAnnual] = useState(true);

    return (
        <div className="flex-1 bg-slate-950 pt-24 pb-32 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
                        Simple, transparent <span className="text-amber-500">pricing.</span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Whether you are a solo artisan or a scaled production house, we have a plan to fit your workflow.
                    </p>
                </div>

                {/* TOGGLE */}
                <div className="flex justify-center mb-16">
                    <div className="flex bg-slate-900 p-1.5 rounded-xl border border-slate-800 shadow-inner">
                        <button
                            onClick={() => setIsAnnual(false)}
                            aria-pressed={!isAnnual}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all focus-visible:ring-2 focus-visible:ring-amber-500 outline-none ${!isAnnual ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setIsAnnual(true)}
                            aria-pressed={isAnnual}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all focus-visible:ring-2 focus-visible:ring-amber-500 outline-none flex items-center gap-2 ${isAnnual ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                        >
                            Annually <span className="text-amber-500 font-extrabold">-20%</span>
                        </button>
                    </div>
                </div>

                {/* CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    
                    {/* Starter */}
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col">
                        <h3 className="text-xl font-bold text-white mb-2">Starter</h3>
                        <p className="text-slate-400 text-sm mb-6 h-10">Perfect for solo jewelers starting to organize.</p>
                        <div className="flex items-baseline gap-1 mb-8">
                            <span className="text-5xl font-extrabold text-white">${isAnnual ? '29' : '39'}</span>
                            <span className="text-slate-400 font-medium">/mo</span>
                        </div>
                        <Link href="/checkout?plan=starter" className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors text-center focus-visible:ring-2 focus-visible:ring-amber-500 mb-8 border border-slate-700">
                            Start Free Trial
                        </Link>
                        <ul className="space-y-4 text-slate-300 text-sm flex-1">
                            <li className="flex gap-3 items-start"><Check className="w-5 h-5 text-amber-500 shrink-0" /> Up to 50 active orders</li>
                            <li className="flex gap-3 items-start"><Check className="w-5 h-5 text-amber-500 shrink-0" /> Basic Kanban board</li>
                            <li className="flex gap-3 items-start"><Check className="w-5 h-5 text-amber-500 shrink-0" /> 1 staff member</li>
                        </ul>
                    </div>

                    {/* Pro (Highlighted) */}
                    <div className="bg-slate-800 border-2 border-amber-500 rounded-3xl p-8 flex flex-col relative transform md:-translate-y-4 shadow-[0_0_40px_-10px_theme(colors.amber.500)]">
                        <div className="absolute top-0 right-8 -translate-y-1/2 bg-amber-500 text-slate-950 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                            Most Popular
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                        <p className="text-amber-200/80 text-sm mb-6 h-10">For growing ateliers that need advanced analytics.</p>
                        <div className="flex items-baseline gap-1 mb-8">
                            <span className="text-5xl font-extrabold text-white">${isAnnual ? '79' : '99'}</span>
                            <span className="text-amber-200/50 font-medium">/mo</span>
                        </div>
                        <Link href="/checkout?plan=pro" className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-colors text-center focus-visible:ring-2 focus-visible:ring-amber-500 mb-8 shadow-lg">
                            Get Started
                        </Link>
                        <ul className="space-y-4 text-slate-200 text-sm flex-1">
                            <li className="flex gap-3 items-start"><Check className="w-5 h-5 text-amber-500 shrink-0" /> Unlimited active orders</li>
                            <li className="flex gap-3 items-start"><Check className="w-5 h-5 text-amber-500 shrink-0" /> Advanced Workshop Analytics</li>
                            <li className="flex gap-3 items-start"><Check className="w-5 h-5 text-amber-500 shrink-0" /> Up to 5 staff members</li>
                            <li className="flex gap-3 items-start"><Check className="w-5 h-5 text-amber-500 shrink-0" /> Priority 24/7 support</li>
                        </ul>
                    </div>

                    {/* Enterprise */}
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col">
                        <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
                        <p className="text-slate-400 text-sm mb-6 h-10">Custom workflows for multi-location operations.</p>
                        <div className="flex items-baseline gap-1 mb-8">
                            <span className="text-5xl font-extrabold text-white">Custom</span>
                        </div>
                        <Link href="mailto:sales@atrack.com" className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors text-center focus-visible:ring-2 focus-visible:ring-amber-500 mb-8 border border-slate-700">
                            Contact Sales
                        </Link>
                        <ul className="space-y-4 text-slate-300 text-sm flex-1">
                            <li className="flex gap-3 items-start"><Check className="w-5 h-5 text-amber-500 shrink-0" /> Everything in Pro</li>
                            <li className="flex gap-3 items-start"><Check className="w-5 h-5 text-amber-500 shrink-0" /> Custom integrations (ERP/CRM)</li>
                            <li className="flex gap-3 items-start"><Check className="w-5 h-5 text-amber-500 shrink-0" /> Unlimited staff members</li>
                            <li className="flex gap-3 items-start"><Check className="w-5 h-5 text-amber-500 shrink-0" /> Dedicated account manager</li>
                        </ul>
                    </div>

                </div>
            </div>
        </div>
    );
}
