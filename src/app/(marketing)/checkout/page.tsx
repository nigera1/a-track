'use client';

import Link from 'next/link';
import { Lock, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
    const router = useRouter();
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); router.push('/dashboard'); };

    return (
        <div className="flex-1 bg-[#0A0A0A] flex flex-col justify-center py-10 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm mb-6">
                <Link href="/" className="flex items-center justify-center gap-2 text-[#F9F9F9] group mb-5">
                    <div className="w-6 h-6 flex items-center justify-center bg-[#E07A5F] text-white text-[10px]" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800 }}>A</div>
                    <span className="text-[15px]" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>A-Track</span>
                </Link>
                <h2 className="text-center text-xl font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>Voltooi uw bestelling</h2>
                <p className="mt-1 text-center text-[12px] text-[#6C757D]" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>A-Track Pro — €79,00/maand</p>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-[#111] py-6 px-5 sm:px-8 border border-[#1a1a1a]">
                    <div className="flex items-center gap-1.5 text-[#E07A5F] mb-6 border-b border-[#1a1a1a] pb-3">
                        <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>Beveiligde checkout</span>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit} style={{ fontFamily: 'Source Sans 3, sans-serif' }}>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="card-name" className="text-[12px] font-medium text-[#9ca3af]">Naam op Kaart</label>
                            <input id="card-name" name="card-name" type="text" required aria-required="true"
                                className="w-full px-3 py-2 text-[13px] border border-[#2a2a2a] bg-[#1a1a1a] text-white focus:ring-2 focus:ring-[#E07A5F] focus:border-[#E07A5F] outline-none transition-shadow"
                                placeholder="Jan Jansen" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="card-number" className="text-[12px] font-medium text-[#9ca3af]">Kaartnummer</label>
                            <div className="relative">
                                <input id="card-number" name="card-number" type="text" inputMode="numeric" maxLength={19} required aria-required="true"
                                    className="w-full pl-9 pr-3 py-2 text-[13px] border border-[#2a2a2a] bg-[#1a1a1a] text-white focus:ring-2 focus:ring-[#E07A5F] focus:border-[#E07A5F] outline-none transition-shadow"
                                    placeholder="0000 0000 0000 0000" />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-3.5 w-3.5 text-[#6C757D]" aria-hidden="true" />
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1">
                                <label htmlFor="card-expiry" className="text-[12px] font-medium text-[#9ca3af]">Vervaldatum</label>
                                <input id="card-expiry" name="card-expiry" type="text" required aria-required="true"
                                    className="w-full px-3 py-2 text-[13px] border border-[#2a2a2a] bg-[#1a1a1a] text-white focus:ring-2 focus:ring-[#E07A5F] focus:border-[#E07A5F] outline-none transition-shadow"
                                    placeholder="MM/JJ" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label htmlFor="card-cvc" className="text-[12px] font-medium text-[#9ca3af]">CVC</label>
                                <input id="card-cvc" name="card-cvc" type="text" required aria-required="true"
                                    className="w-full px-3 py-2 text-[13px] border border-[#2a2a2a] bg-[#1a1a1a] text-white focus:ring-2 focus:ring-[#E07A5F] focus:border-[#E07A5F] outline-none transition-shadow"
                                    placeholder="123" />
                            </div>
                        </div>
                        <button type="submit"
                            className="w-full flex items-center justify-center gap-1.5 mt-4 px-4 py-2.5 bg-[#E07A5F] hover:bg-[#c96a52] text-white text-[13px] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[#E07A5F]"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                            Betaal €79,00
                        </button>
                    </form>
                    <p className="mt-4 text-center text-[10px] text-[#6C757D]" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>
                        Door te bevestigen geeft u toestemming om uw kaart te belasten.
                    </p>
                </div>
            </div>
        </div>
    );
}
