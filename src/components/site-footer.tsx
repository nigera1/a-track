'use client';

import Link from 'next/link';
import { Gem } from 'lucide-react';

export function SiteFooter() {
    return (
        <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-1">
                    <Link href="/" className="flex items-center gap-2 text-slate-50 mb-4">
                        <div className="w-6 h-6 flex items-center justify-center rounded bg-amber-500 text-slate-900">
                            <Gem style={{ width: 14, height: 14, strokeWidth: 3 }} aria-hidden="true" />
                        </div>
                        <span className="font-bold text-sm tracking-tight">A-TRACK <span className="text-amber-500">PRO</span></span>
                    </Link>
                    <p className="text-sm">The ultimate SaaS platform to scale your jewelry atelier. Precision production tracking for modern goldsmiths.</p>
                </div>
                <div>
                    <h3 className="text-white font-bold mb-4">Product</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/pricing" className="hover:text-amber-400 transition-colors">Pricing</Link></li>
                        <li><Link href="#" className="hover:text-amber-400 transition-colors">Features</Link></li>
                        <li><Link href="#" className="hover:text-amber-400 transition-colors">Case Studies</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-white font-bold mb-4">Company</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="#" className="hover:text-amber-400 transition-colors">About</Link></li>
                        <li><Link href="#" className="hover:text-amber-400 transition-colors">Blog</Link></li>
                        <li><Link href="#" className="hover:text-amber-400 transition-colors">Careers</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-white font-bold mb-4">Legal</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="#" className="hover:text-amber-400 transition-colors">Privacy Policy</Link></li>
                        <li><Link href="#" className="hover:text-amber-400 transition-colors">Terms of Service</Link></li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-slate-800/50 text-sm flex flex-col md:flex-row items-center justify-between">
                <p>&copy; {new Date().getFullYear()} A-Track Pro. All rights reserved.</p>
                <div className="flex gap-4 mt-4 md:mt-0">
                    <span className="w-2 h-2 rounded-full bg-green-500 block relative top-1.5" aria-hidden="true"></span>
                    <span>All systems operational</span>
                </div>
            </div>
        </footer>
    );
}
