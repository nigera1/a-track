'use client';

import { AppShell } from '@/components/app-shell';
import { useStore } from '@/lib/store';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Html5Qrcode } from 'html5-qrcode';
import { ScanLine, CheckCircle, AlertCircle, Camera, Clock, Play, Square } from 'lucide-react';
import { toast } from 'sonner';
import { getStatusLabel, getStatusColor } from '@/lib/helpers';

export default function ScanPage() {
    const router = useRouter();
    const { orders, recordStageScan } = useStore();
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
    const [scanResult, setScanResult] = useState<{ action: 'started' | 'finished'; orderNum: string; stage: string; duration?: number } | null>(null);
    const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
    const [selectedCam, setSelectedCam] = useState('');
    const scannerDivId = 'qr-reader';

    useEffect(() => {
        let mounted = true;
        import('html5-qrcode').then(({ Html5Qrcode }) => {
            if (!mounted) return;
            Html5Qrcode.getCameras().then(devices => {
                if (devices?.length) { setCameras(devices); setSelectedCam(devices[0].id); }
            }).catch(() => toast.error('Camera access denied'));
        });
        return () => { mounted = false; scannerRef.current?.stop().catch(() => { }); };
    }, []);

    function startScan() {
        if (!selectedCam) { toast.error('No camera found'); return; }
        setStatus('scanning');

        import('html5-qrcode').then(({ Html5Qrcode }) => {
            const scanner = new Html5Qrcode(scannerDivId);
            scannerRef.current = scanner;

            scanner.start(selectedCam, { fps: 10, qrbox: { width: 220, height: 220 } },
            (decodedText) => {
                scanner.stop().then(() => {
                    // Extract order ID from URL
                    let orderId: string | null = null;
                    try {
                        const url = new URL(decodedText);
                        const parts = url.pathname.split('/');
                        orderId = parts[parts.indexOf('orders') + 1] ?? null;
                    } catch { orderId = decodedText; }

                    const order = orders.find(o => o.id === orderId);
                    if (!order) {
                        setStatus('error');
                        toast.error('Order not found for this QR code');
                        return;
                    }

                    const action = recordStageScan(order.id);
                    const currentStage = getStatusLabel(order.status);
                    const stageTimes = orders.find(o => o.id === order.id)?.stage_times ?? [];
                    const lastEntry = stageTimes.findLast(t => t.stage === order.status);

                    setScanResult({
                        action,
                        orderNum: order.order_number,
                        stage: currentStage,
                        duration: action === 'finished' ? lastEntry?.duration_minutes : undefined,
                    });
                    setStatus('success');
                    toast.success(action === 'started'
                        ? `⏱️ Timer started for ${order.order_number} — ${currentStage}`
                        : `✅ Stage complete! ${order.order_number} — ${currentStage}`
                    );
                });
            },
            () => { }
        ).catch(() => { setStatus('error'); toast.error('Failed to start camera'); });
        });
    }

    function stopScan() {
        scannerRef.current?.stop().catch(() => { });
        setStatus('idle');
        setScanResult(null);
    }

    function reset() {
        setStatus('idle');
        setScanResult(null);
    }

    return (
        <AppShell>
            <div style={{ maxWidth: 480, margin: '0 auto' }} className="flex flex-col gap-5">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight">QR Scanner</h1>
                    <p className="text-sm font-semibold" style={{ color: 'var(--muted-foreground)' }}>
                        Scan 1 = start stage timer · Scan 2 = finish and record time
                    </p>
                </div>

                {/* Scanner */}
                <div className="neo-card p-4 flex flex-col items-center gap-4"
                    style={{ borderColor: '#3b82f6', boxShadow: '4px 4px 0 0 #3b82f6' }}>

                    <div style={{ position: 'relative', width: '100%', borderRadius: 8, overflow: 'hidden', background: 'var(--card)', minHeight: 260 }}>
                        <div id={scannerDivId} style={{ width: '100%' }} />
                        {status === 'idle' && (
                            <div className="flex flex-col items-center justify-center gap-3 absolute inset-0">
                                <Camera style={{ width: 36, height: 36, color: 'rgba(255,255,255,0.25)' }} />
                                <span className="text-xs font-bold uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>Camera preview</span>
                            </div>
                        )}
                        {status === 'scanning' && (
                            <div className="absolute" style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 220, height: 220, border: '3px solid #3b82f6', borderRadius: 8, pointerEvents: 'none' }}>
                                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, background: '#3b82f6', animation: 'scanline 2s ease-in-out infinite' }} />
                            </div>
                        )}
                        {status === 'success' && scanResult && (
                            <div className="flex flex-col items-center justify-center gap-2 absolute inset-0"
                                style={{ background: scanResult.action === 'started' ? 'rgba(59,130,246,0.15)' : 'rgba(34,197,94,0.15)' }}>
                                {scanResult.action === 'started'
                                    ? <Play style={{ width: 40, height: 40, color: '#3b82f6' }} />
                                    : <CheckCircle style={{ width: 40, height: 40, color: '#22c55e' }} />
                                }
                                <span className="font-black text-sm" style={{ color: scanResult.action === 'started' ? '#3b82f6' : '#22c55e' }}>
                                    {scanResult.action === 'started' ? 'TIMER STARTED' : 'STAGE COMPLETE'}
                                </span>
                            </div>
                        )}
                        {status === 'error' && (
                            <div className="flex flex-col items-center justify-center gap-2 absolute inset-0" style={{ background: 'rgba(239,68,68,0.15)' }}>
                                <AlertCircle style={{ width: 40, height: 40, color: '#ef4444' }} />
                                <span className="font-black text-sm" style={{ color: '#ef4444' }}>ORDER NOT FOUND</span>
                            </div>
                        )}
                    </div>

                    {/* Camera selector */}
                    {cameras.length > 1 && status === 'idle' && (
                        <select value={selectedCam} onChange={e => setSelectedCam(e.target.value)} className="w-full text-sm"
                            style={{ background: 'var(--input)', border: '2px solid var(--border)', borderRadius: 8, padding: '8px 12px' }}>
                            {cameras.map(c => <option key={c.id} value={c.id}>{c.label || `Camera ${c.id}`}</option>)}
                        </select>
                    )}

                    {/* Scan result */}
                    {status === 'success' && scanResult && (
                        <div className="w-full neo-card p-4 flex flex-col gap-2"
                            style={{ borderColor: scanResult.action === 'started' ? '#3b82f6' : '#22c55e' }}>
                            <div className="flex justify-between items-center">
                                <span className="font-black">{scanResult.orderNum}</span>
                                <span className="section-label">{scanResult.stage}</span>
                            </div>
                            {scanResult.action === 'started' ? (
                                <div className="flex items-center gap-2 text-sm" style={{ color: '#3b82f6' }}>
                                    <Clock style={{ width: 12, height: 12 }} /> Timer running…
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-sm font-bold" style={{ color: '#22c55e' }}>
                                    <CheckCircle style={{ width: 12, height: 12 }} />
                                    {scanResult.duration != null
                                        ? `Completed in ${scanResult.duration >= 1440
                                            ? `${(scanResult.duration / 1440).toFixed(1)} days`
                                            : `${scanResult.duration} min`}`
                                        : 'Stage recorded'}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Controls */}
                    {status === 'idle' && (
                        <button onClick={startScan} className="neo-btn neo-btn-primary w-full justify-center" style={{ padding: '10px' }}>
                            <Camera style={{ width: 14, height: 14 }} /> Start Scanning
                        </button>
                    )}
                    {status === 'scanning' && (
                        <button onClick={stopScan} className="neo-btn w-full justify-center" style={{ padding: '10px', borderColor: '#ef4444', color: '#ef4444', boxShadow: '2px 2px 0 0 #ef4444' }}>
                            <Square style={{ width: 12, height: 12 }} /> Stop
                        </button>
                    )}
                    {(status === 'success' || status === 'error') && (
                        <button onClick={reset} className="neo-btn w-full justify-center" style={{ padding: '10px' }}>
                            Scan Another
                        </button>
                    )}
                </div>

                {/* How it works */}
                <div className="neo-card p-4">
                    <div className="section-label mb-3">How it works</div>
                    <ol className="flex flex-col gap-2">
                        {[
                            { icon: '①', text: 'Open an order → click QR to show its code' },
                            { icon: '②', text: 'Scan here when the piece enters a stage — timer starts' },
                            { icon: '③', text: 'Scan again when the stage finishes — time is recorded' },
                            { icon: '④', text: 'View average stage times in Analytics' },
                        ].map((step, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm">
                                <span className="font-black text-xs w-6 h-5 flex-shrink-0 flex items-center">{step.icon}</span>
                                <span style={{ color: 'var(--muted-foreground)' }}>{step.text}</span>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
            <style>{`@keyframes scanline { 0%,100%{top:10%} 50%{top:85%} }`}</style>
        </AppShell>
    );
}
