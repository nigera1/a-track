'use client';

import Link from 'next/link';
import { Gem, Lock, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.push('/dashboard');
    };

    return (
        <div className="flex-1 bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
                <Link href="/" className="flex items-center justify-center gap-2 text-slate-50 group mb-6">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-500 text-slate-900 transition-transform group-hover:scale-105">
                        <Gem style={{ width: 16, height: 16, strokeWidth: 3 }} aria-hidden="true" />
                    </div>
                    <span className="font-bold text-xl tracking-tight">A-TRACK <span className="text-amber-500">PRO</span></span>
                </Link>
                <h2 className="mt-2 text-center text-3xl font-extrabold text-white">
                    Complete your checkout
                </h2>
                <p className="mt-2 text-center text-sm text-slate-400">
                    A-Track Pro Plan — $79.00/month
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
                <div className="bg-slate-900 py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-slate-800">
                    
                    <div className="flex items-center gap-2 text-amber-500 mb-8 border-b border-slate-800 pb-4">
                        <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                        <span className="text-sm font-bold uppercase tracking-wider">Secure 256-bit Checkout</span>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        
                        {/* Name Input */}
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="card-name" className="text-sm font-medium text-slate-300">Name on Card</label>
                            <input
                                id="card-name"
                                name="card-name"
                                type="text"
                                required
                                aria-required="true"
                                className="w-full px-4 py-3 border border-slate-700 rounded-lg bg-slate-800 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-shadow"
                                placeholder="Jane Doe"
                            />
                        </div>

                        {/* Card Number Input */}
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="card-number" className="text-sm font-medium text-slate-300">Card Number</label>
                            <div className="relative">
                                <input
                                    id="card-number"
                                    name="card-number"
                                    type="text"
                                    pattern="[0-9]{13,19}"
                                    inputMode="numeric"
                                    maxLength={19}
                                    required
                                    aria-required="true"
                                    aria-describedby="card-hint"
                                    className="w-full pl-12 pr-4 py-3 border border-slate-700 rounded-lg bg-slate-800 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-shadow"
                                    placeholder="0000 0000 0000 0000"
                                />
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-slate-500" aria-hidden="true" />
                                </div>
                            </div>
                            <span id="card-hint" className="sr-only">Enter your 16 digit credit card number without spaces or dashes</span>
                        </div>

                        {/* Expiry and CVC */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="card-expiry" className="text-sm font-medium text-slate-300">Expiry (MM/YY)</label>
                                <input
                                    id="card-expiry"
                                    name="card-expiry"
                                    type="text"
                                    pattern="(0[1-9]|1[0-2])\/[0-9]{2}"
                                    required
                                    aria-required="true"
                                    className="w-full px-4 py-3 border border-slate-700 rounded-lg bg-slate-800 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-shadow"
                                    placeholder="MM/YY"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="card-cvc" className="text-sm font-medium text-slate-300">CVC</label>
                                <input
                                    id="card-cvc"
                                    name="card-cvc"
                                    type="text"
                                    pattern="[0-9]{3,4}"
                                    required
                                    aria-required="true"
                                    className="w-full px-4 py-3 border border-slate-700 rounded-lg bg-slate-800 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-shadow"
                                    placeholder="123"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 mt-8 px-4 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-amber-500 text-lg shadow-lg"
                        >
                            <Lock className="w-5 h-5" aria-hidden="true" />
                            Pay $79.00 Securely
                        </button>
                    </form>
                    
                    <p className="mt-6 text-center text-xs text-slate-500">
                        By confirming your subscription, you allow A-Track to charge your card for this payment and future payments in accordance with our terms.
                    </p>
                </div>
            </div>
        </div>
    );
}
