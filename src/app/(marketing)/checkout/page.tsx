'use client';

import Link from 'next/link';
import { Lock, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.push('/dashboard');
    };

    return (
        <div className="flex-1 bg-[#0A0A0A] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
                <Link href="/" className="flex items-center justify-center gap-2 text-[#F9F9F9] group mb-6">
                    <div className="w-8 h-8 flex items-center justify-center bg-[#E07A5F] text-white transition-transform group-hover:rotate-3" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 14 }}>
                        A
                    </div>
                    <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 20 }}>A-TRACK</span>
                </Link>
                <h2 className="mt-2 text-center text-3xl font-extrabold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Voltooi uw bestelling
                </h2>
                <p className="mt-2 text-center text-sm text-[#6C757D]" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>
                    A-Track Pro — €79,00/maand
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
                <div className="bg-[#1a1a1a] py-8 px-4 shadow-2xl sm:px-10 border border-[#2a2a2a]">
                    
                    <div className="flex items-center gap-2 text-[#E07A5F] mb-8 border-b border-[#2a2a2a] pb-4">
                        <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                        <span className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>Beveiligde 256-bit Checkout</span>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="card-name" className="text-sm font-medium text-[#9ca3af]" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>Naam op Kaart</label>
                            <input
                                id="card-name" name="card-name" type="text" required aria-required="true"
                                className="w-full px-4 py-3 border border-[#3A3A3A] bg-[#212121] text-white focus:ring-2 focus:ring-[#E07A5F] focus:border-[#E07A5F] outline-none transition-shadow"
                                placeholder="Jan Jansen"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="card-number" className="text-sm font-medium text-[#9ca3af]" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>Kaartnummer</label>
                            <div className="relative">
                                <input
                                    id="card-number" name="card-number" type="text" pattern="[0-9 ]*" inputMode="numeric" maxLength={19} required aria-required="true" aria-describedby="card-hint"
                                    className="w-full pl-12 pr-4 py-3 border border-[#3A3A3A] bg-[#212121] text-white focus:ring-2 focus:ring-[#E07A5F] focus:border-[#E07A5F] outline-none transition-shadow"
                                    placeholder="0000 0000 0000 0000"
                                />
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-[#6C757D]" aria-hidden="true" />
                                </div>
                            </div>
                            <span id="card-hint" className="sr-only">Vul uw 16-cijferig kaartnummer in</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="card-expiry" className="text-sm font-medium text-[#9ca3af]" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>Vervaldatum (MM/JJ)</label>
                                <input id="card-expiry" name="card-expiry" type="text" pattern="(0[1-9]|1[0-2])\/[0-9]{2}" required aria-required="true"
                                    className="w-full px-4 py-3 border border-[#3A3A3A] bg-[#212121] text-white focus:ring-2 focus:ring-[#E07A5F] focus:border-[#E07A5F] outline-none transition-shadow"
                                    placeholder="MM/JJ"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="card-cvc" className="text-sm font-medium text-[#9ca3af]" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>CVC</label>
                                <input id="card-cvc" name="card-cvc" type="text" pattern="[0-9]{3,4}" required aria-required="true"
                                    className="w-full px-4 py-3 border border-[#3A3A3A] bg-[#212121] text-white focus:ring-2 focus:ring-[#E07A5F] focus:border-[#E07A5F] outline-none transition-shadow"
                                    placeholder="123"
                                />
                            </div>
                        </div>

                        <button type="submit"
                            className="w-full flex items-center justify-center gap-2 mt-8 px-4 py-4 bg-[#E07A5F] hover:bg-[#c96a52] text-white font-extrabold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1a] focus-visible:ring-[#E07A5F] text-lg"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                            <Lock className="w-5 h-5" aria-hidden="true" />
                            Betaal €79,00 Veilig
                        </button>
                    </form>
                    
                    <p className="mt-6 text-center text-xs text-[#6C757D]" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>
                        Door te bevestigen geeft u A-Track toestemming om uw kaart te belasten volgens onze voorwaarden.
                    </p>
                </div>
            </div>
        </div>
    );
}
