'use client';

import { AppShell } from '@/components/app-shell';
import { useStore } from '@/lib/store';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { 
    ChevronLeft, ChevronRight, Edit3, Trash2, Printer, Save, X, Plus, 
    AlertTriangle, Scale, Gem, Clock, Timer, CheckCircle2, 
    QrCode, FileText, Package, Building2 
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
const QRCodeSVG = dynamic(() => import('qrcode.react').then(mod => mod.QRCodeSVG), { ssr: false });
import {
    Order, OrderStatus, ItemType, MaterialType,
    ORDER_STAGES, ITEM_TYPE_LABELS, MATERIAL_LABELS, STONE_TYPE_LABELS,
} from '@/types';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/helpers';

export default function OrderDetailPage() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const { orders, customers, suppliers, updateOrder, updateOrderStatus, deleteOrder } = useStore();
    const order = orders.find(o => o.id === id);
    const customer = order ? customers.find(c => c.id === order.customer_id) : null;
    const supplier = order?.supplier_id ? suppliers.find(s => s.id === order.supplier_id) : null;
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState<Partial<Order>>({});
    const [showQR, setShowQR] = useState(false);
    const [printMode, setPrintMode] = useState<'sheet' | 'invoice' | null>(null);

    const handlePrint = (mode: 'sheet' | 'invoice') => {
        setPrintMode(mode);
        setTimeout(() => {
            window.print();
            setPrintMode(null);
        }, 150);
    };

    const orderUrl = typeof window !== 'undefined' ? `${window.location.origin}/orders/${id}` : '';

    if (!order) return (
        <AppShell>
            <div className="flex flex-col items-center justify-center h-64 gap-4" style={{ color: 'var(--muted-foreground)' }}>
                <div className="text-4xl font-bold">404</div>
                <div>Order not found</div>
                <Link href="/orders" className="neo-btn">← Back to Orders</Link>
            </div>
        </AppShell>
    );

    function startEdit() {
        setEditData({
            item_type: order!.item_type,
            item_id: order!.item_id,
            materials: [...(order!.materials ?? [])],
            starting_weight: order!.starting_weight,
            end_weight: order!.end_weight,
            price: order!.price,
            due_date: order!.due_date,
            notes: order!.notes,
        });
        setEditing(true);
    }

    function saveEdit() {
        updateOrder(id, editData);
        toast.success('Order updated');
        setEditing(false);
    }

    function handleDelete() {
        if (!confirm('Delete this order? This cannot be undone.')) return;
        deleteOrder(id);
        toast.success('Order deleted');
        router.push('/orders');
    }

    // Old handlePrint removed

    const inputCls = "w-full px-3 py-2 rounded-lg border text-sm";
    const inputStyle = { border: '1px solid var(--border)', background: 'var(--input)' };
    function specTile(label: string, value: React.ReactNode) {
        return (
            <div className="flex flex-col gap-1">
                <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">{label}</div>
                <div className="text-[13px] font-bold tracking-tight">{value || '—'}</div>
            </div>
        );
    }
    const toggleMaterial = (m: MaterialType) => {
        const cur = editData.materials ?? [];
        setEditData(d => ({ ...d, materials: cur.includes(m) ? cur.filter(x => x !== m) : [...cur, m] }));
    };

    const currentStageIndex = ORDER_STAGES.findIndex(s => s.key === order.status);
    const stageColor = getStatusColor(order.status);

    return (
        <AppShell>
            {/* ── Print-only header (Order Sheet) ── */}
            {printMode === 'sheet' && (
                <div className="print-only" style={{ display: 'none' }}>
                    <div style={{ padding: '0 0 16px', borderBottom: '3px solid #111', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                            <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-1px' }}>A-TRACK</div>
                            <div style={{ fontSize: 12, color: '#888', letterSpacing: '2px', textTransform: 'uppercase' }}>Order Sheet</div>
                        </div>
                        <QRCodeSVG value={orderUrl || `order-${order.order_number}`} size={72} />
                    </div>
                </div>
            )}

            <div style={{ maxWidth: 700, margin: '0 auto' }} className="flex flex-col gap-5">

                {/* Back + Actions */}
                <div className="flex items-center justify-between no-print">
                    <Link href="/orders" className="flex items-center gap-2 text-sm font-bold hover:opacity-80 transition-opacity" style={{ color: 'var(--muted-foreground)' }}>
                        <ChevronLeft style={{ width: 16, height: 16 }} /> Monitor
                    </Link>
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Print & QR always visible */}
                        <button onClick={() => setShowQR(!showQR)} className="neo-btn" title="Show QR Code">
                            <QrCode style={{ width: 13, height: 13 }} /> QR
                        </button>
                        <button onClick={() => handlePrint('sheet')} className="neo-btn" title="Print Internal Order Sheet">
                            <Printer style={{ width: 13, height: 13 }} /> Print
                        </button>
                        <button onClick={() => handlePrint('invoice')} className="neo-btn" title="Generate Customer Invoice" style={{ background: 'var(--foreground)', color: 'var(--background)' }}>
                            <FileText style={{ width: 13, height: 13 }} /> Invoice
                        </button>
                        {!editing ? (
                            <>
                                <button onClick={startEdit} className="neo-btn">
                                    <Edit3 style={{ width: 13, height: 13 }} /> Edit
                                </button>
                                <button onClick={handleDelete} className="neo-btn" style={{ color: '#ef4444', borderColor: '#fecaca' }}>
                                    <Trash2 style={{ width: 13, height: 13 }} /> Delete
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={saveEdit} className="neo-btn neo-btn-primary">
                                    <Save style={{ width: 13, height: 13 }} /> Save
                                </button>
                                <button onClick={() => setEditing(false)} className="neo-btn">
                                    <X style={{ width: 13, height: 13 }} /> Cancel
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* QR Code Modal */}
                {showQR && (
                    <div className="neo-card p-5 flex flex-col items-center gap-3 no-print"
                        style={{ borderColor: '#93c5fd' }}>
                        <div className="section-label">Scan to open this order</div>
                        <div className="p-4 bg-white rounded-lg" style={{ border: '1px solid var(--border)' }}>
                            <QRCodeSVG value={orderUrl || `order-${order.order_number}`} size={160} />
                        </div>
                        <div className="text-xs font-mono font-bold text-center px-4 py-2 rounded" style={{ background: 'var(--muted)', border: '1px solid var(--border)', wordBreak: 'break-all' }}>
                            {order.order_number}
                        </div>
                        <button onClick={() => setShowQR(false)} className="neo-btn text-xs">Close</button>
                    </div>
                )}

                {/* Order Header */}
                <div className="neo-card p-5" style={{ borderTopWidth: 8, borderTopColor: stageColor }}>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                            <div className="section-label mb-1">Order Number</div>
                            <div className="text-2xl font-bold">{order.order_number}</div>
                            <div className="text-xs font-semibold mt-1" style={{ color: 'var(--muted-foreground)' }}>
                                Created {formatDate(order.created_at)} · Updated {formatDate(order.updated_at)}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex flex-col items-end gap-2">
                                <div>
                                    <div className="section-label mb-1">Current Stage</div>
                                    <span style={{ 
                                        background: stageColor, color: '#fff', 
                                        padding: '4px 12px', fontSize: 13, fontWeight: 900, 
                                        textTransform: 'uppercase', border: '3px solid var(--foreground)' 
                                    }}>
                                        {getStatusLabel(order.status)}
                                    </span>
                                </div>
                                
                                {/* Pickup Toggle for Completed Orders */}
                                {order.status === 'completed' && (
                                    <button 
                                        onClick={() => updateOrder(id, { 
                                            is_ready_for_pickup: !order.is_ready_for_pickup,
                                            pickup_reminder_date: !order.is_ready_for_pickup ? new Date().toISOString() : undefined 
                                        })}
                                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all mt-1"
                                        style={{ 
                                            background: order.is_ready_for_pickup ? '#3b82f6' : 'var(--muted)', 
                                            color: order.is_ready_for_pickup ? '#fff' : 'var(--muted-foreground)',
                                            border: `1.5px solid ${order.is_ready_for_pickup ? '#3b82f6' : 'var(--border)'}`
                                        }}>
                                        <Package style={{ width: 12, height: 12 }} />
                                        {order.is_ready_for_pickup ? 'Ready for Pickup' : 'Mark for Pickup'}
                                    </button>
                                )}
                            </div>
                            
                            {order.price != null && (
                                <div className="text-xl font-bold mt-2">{formatCurrency(order.price)}</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Status Stepper */}
                <div className="neo-card p-6 no-print overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <div className="text-[10px] font-bold uppercase tracking-widest opacity-60" style={{ fontFamily: 'Montserrat, sans-serif' }}>Production Pipeline</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: stageColor, fontFamily: 'Montserrat, sans-serif' }}>{getStatusLabel(order.status)}</div>
                    </div>
                    <div className="relative flex justify-between items-start pt-2">
                        {/* Background track */}
                        <div className="absolute top-[13px] left-[20px] right-[20px] h-[2px]" style={{ background: 'var(--border)' }} />
                        {/* Progress fill */}
                        <div className="absolute top-[13px] left-[20px] h-[2px] transition-all duration-500" style={{ 
                            width: `${currentStageIndex / (ORDER_STAGES.length - 1) * 100}%`, 
                            maxWidth: 'calc(100% - 40px)',
                            background: 'var(--accent, #E07A5F)' 
                        }} />
                        
                        {ORDER_STAGES.map((stage, i) => {
                            const isPast = i < currentStageIndex;
                            const isCurrent = i === currentStageIndex;
                            const isFuture = i > currentStageIndex;
                            return (
                                <button key={stage.key} 
                                    onClick={() => { updateOrderStatus(id, stage.key); toast.success(`Moved to ${stage.label}`); }}
                                    className="relative z-10 flex flex-col items-center group flex-1"
                                    title={`Move to ${stage.label}`}>
                                    <div className="w-7 h-7 rounded-sm border-2 flex items-center justify-center transition-all"
                                        style={{
                                            background: isCurrent ? stage.color : isPast ? stage.color : 'var(--card)',
                                            borderColor: isCurrent ? stage.color : isPast ? stage.color : 'var(--border)',
                                            transform: isCurrent ? 'scale(1.15)' : 'scale(1)',
                                            opacity: isFuture ? 0.4 : 1,
                                        }}>
                                        {isPast && <CheckCircle2 style={{ width: 14, height: 14, color: '#fff' }} />}
                                        {isCurrent && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                                    </div>
                                    <div className="mt-3 text-[9px] font-bold uppercase tracking-wide text-center px-1 transition-all"
                                        style={{ 
                                            color: isCurrent ? stage.color : isPast ? stage.color : 'var(--foreground)', 
                                            opacity: isCurrent ? 1 : isPast ? 0.8 : 0.3,
                                            fontFamily: 'Montserrat, sans-serif',
                                        }}>
                                        {stage.label.split(' ')[0]}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Main Data Split */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Left Column: Customer & Basic Specs */}
                    <div className="md:col-span-2 flex flex-col gap-5">
                        {/* Customer */}
                        <div className="neo-card p-6">
                            <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-4">Client Representative</div>
                            {customer ? (
                                <Link href={`/customers/${customer.id}`} className="flex items-center justify-between group no-print">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 flex items-center justify-center font-bold text-xs"
                                            style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                                            {customer.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm tracking-tight">{customer.name}</div>
                                            <div className="text-[11px] font-bold opacity-50 uppercase tracking-wider mt-0.5">{customer.phone}</div>
                                        </div>
                                    </div>
                                    <ChevronRight style={{ width: 14, height: 14 }} className="opacity-30 group-hover:opacity-100 transition-all" />
                                </Link>
                            ) : <div className="text-sm font-bold opacity-30">No client assigned</div>}
                        </div>

                        {/* Specs Grid */}
                        <div className="neo-card p-6">
                            <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-6">Technical Specifications</div>
                            {!editing ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-8 gap-x-4">
                                    {specTile('Reference', order.item_id || 'TBD')}
                                    {specTile('Type', ITEM_TYPE_LABELS[order.item_type])}
                                    {specTile('Materials', order.materials?.map(m => MATERIAL_LABELS[m]).join(', ') || 'N/A')}
                                    {specTile('Start Wt.', order.starting_weight ? `${order.starting_weight}g` : 'TBD')}
                                    {specTile('Final Wt.', order.end_weight ? `${order.end_weight}g` : 'TBD')}
                                    {specTile('Delivery', formatDate(order.due_date))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* ... (keep editing inputs similarly but in the new layout) ... */}
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1.5 block">Item Type</label>
                                        <select value={editData.item_type} onChange={e => setEditData(d => ({ ...d, item_type: e.target.value as ItemType }))} style={{ fontSize: 13, fontWeight: 600 }}>
                                            {Object.entries(ITEM_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1.5 block">Reference ID</label>
                                        <input value={editData.item_id ?? ''} onChange={e => setEditData(d => ({ ...d, item_id: e.target.value }))} style={{ fontSize: 13, fontWeight: 600 }} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1.5 block">Entry Weight (g)</label>
                                        <input type="number" step="0.01" value={editData.starting_weight ?? ''} onChange={e => setEditData(d => ({ ...d, starting_weight: parseFloat(e.target.value) || undefined }))} style={{ fontSize: 13, fontWeight: 600 }} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1.5 block">Exit Weight (g)</label>
                                        <input type="number" step="0.01" value={editData.end_weight ?? ''} onChange={e => setEditData(d => ({ ...d, end_weight: parseFloat(e.target.value) || undefined }))} style={{ fontSize: 13, fontWeight: 600 }} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1.5 block">Contract Price (€)</label>
                                        <input type="number" step="0.01" value={editData.price ?? ''} onChange={e => setEditData(d => ({ ...d, price: parseFloat(e.target.value) || undefined }))} style={{ fontSize: 13, fontWeight: 600 }} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1.5 block">Target Date</label>
                                        <input type="date" value={editData.due_date ?? ''} onChange={e => setEditData(d => ({ ...d, due_date: e.target.value }))} style={{ fontSize: 13, fontWeight: 600 }} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: QR & Notes */}
                    <div className="flex flex-col gap-5">
                        {/* QR Card */}
                        <div className="neo-card p-6 flex flex-col items-center gap-4 text-center">
                            <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">Digital Passport</div>
                            <div className="p-3 bg-white" style={{ border: '1px solid var(--border)' }}>
                                <QRCodeSVG value={orderUrl || `order-${order.order_number}`} size={120} />
                            </div>
                            <div className="text-[10px] font-mono font-bold py-1 px-3 border border-dashed border-border opacity-50">
                                {order.order_number}
                            </div>
                        </div>

                        {/* Financials / Notes */}
                        <div className="neo-card p-6">
                            <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-4">Contract Notes</div>
                            <p className="text-xs leading-relaxed opacity-70">
                                {order.notes || 'No project notes available for this order.'}
                            </p>
                            <div className="mt-8 pt-4 border-t border-dashed border-border">
                                <div className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Contract Total</div>
                                <div className="text-xl font-bold">{formatCurrency(order.price)}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gemstones */}
                {(order.gemstones?.length ?? 0) > 0 && (
                    <div className="neo-card p-5">
                        <div className="section-label mb-4 flex items-center gap-2">
                            <Gem style={{ width: 13, height: 13, color: '#8b5cf6' }} /> Gemstones
                        </div>
                        <div className="overflow-x-auto">
                        <table className="w-full text-sm" style={{ minWidth: 450 }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    {['Category', 'Stone', 'Carat', 'Ø mm', 'Qty', 'Notes'].map(h => (
                                        <th key={h} className="text-left pb-2 pr-4 section-label">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {order.gemstones?.map(gem => (
                                    <tr key={gem.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td className="py-2 pr-4">
                                            <span className="status-pill" style={{ color: gem.category === 'central' ? '#f97316' : '#8b5cf6' }}>
                                                {gem.category}
                                            </span>
                                        </td>
                                        <td className="py-2 pr-4 font-semibold">{STONE_TYPE_LABELS[gem.stone_type]}</td>
                                        <td className="py-2 pr-4">{gem.carat} ct</td>
                                        <td className="py-2 pr-4" style={{ color: 'var(--muted-foreground)' }}>{gem.diameter_mm ? `${gem.diameter_mm} mm` : '—'}</td>
                                        <td className="py-2 pr-4 font-bold">{gem.quantity}</td>
                                        <td className="py-2 pr-4 text-xs" style={{ color: 'var(--muted-foreground)' }}>{gem.notes ?? '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    </div>
                )}

                {/* Supplier — available at every stage */}
                <div className="neo-card p-5">
                    <div className="section-label mb-3 flex items-center gap-2">
                        <Building2 style={{ width: 13, height: 13, color: '#8b5cf6' }} /> Assigned Supplier
                    </div>
                    <select
                        value={order.supplier_id ?? ''}
                        onChange={e => updateOrder(id, { supplier_id: e.target.value || undefined })}
                        style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 13, fontWeight: 600, background: 'var(--input)' }}>
                        <option value="">— No supplier assigned</option>
                        {suppliers.map(s => (
                            <option key={s.id} value={s.id}>{s.name}{s.contact ? ` · ${s.contact}` : ''}</option>
                        ))}
                    </select>
                    {supplier && (
                        <div className="mt-2 text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>{supplier.notes}</div>
                    )}
                </div>

                {/* Stage Time Log */}
                {(order.stage_times?.length ?? 0) > 0 && (
                    <div className="neo-card p-5">
                        <div className="section-label mb-3 flex items-center gap-2">
                            <Clock style={{ width: 13, height: 13, color: '#14b8a6' }} /> Stage Time Log
                        </div>
                        <div className="flex flex-col gap-1">
                            {order.stage_times!.map((t, i) => {
                                const stageInfo = ORDER_STAGES.find(s => s.key === t.stage);
                                const isOpen = !t.finished_at;
                                const dur = t.duration_minutes;
                                const durText = dur == null ? '…'
                                    : dur >= 1440 ? `${(dur / 1440).toFixed(1)}d`
                                        : `${dur}min`;
                                return (
                                    <div key={i} className="flex items-center justify-between py-1.5"
                                        style={{ borderBottom: '1px solid var(--border)' }}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: stageInfo?.color ?? 'var(--muted-foreground)' }} />
                                            <span className="text-xs font-bold" style={{ color: stageInfo?.color }}>{stageInfo?.label}</span>
                                        </div>
                                        <span className="text-xs font-bold" style={{ color: isOpen ? '#3b82f6' : 'var(--foreground)' }}>
                                            {isOpen ? '⏱ In progress' : durText}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Print footer */}
                <div className="print-only" style={{ display: 'none', marginTop: 24, paddingTop: 16, borderTop: '2px solid #111', fontSize: 11, color: '#888' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Printed from A-Track — {new Date().toLocaleDateString()}</span>
                        <span>{order.order_number} · {customer?.name ?? 'No customer'}</span>
                    </div>
                </div>
            </div>

            {/* ── Printable Invoice Component ── */}
            {printMode === 'invoice' && (
                <div className="print-only" style={{ display: 'none', fontFamily: 'system-ui, sans-serif' }}>
                    {/* Invoice Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #111', paddingBottom: 32, marginBottom: 32 }}>
                        <div>
                            <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-1px', marginBottom: 8 }}>A-TRACK ATELIER</div>
                            <div style={{ color: '#555', fontSize: 14, lineHeight: 1.5 }}>
                                Via Orefici, 12<br />
                                20123 Milano (MI), Italy<br />
                                IT12345678901<br />
                                info@atelier.com
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 32, fontWeight: 200, color: '#111', textTransform: 'uppercase', marginBottom: 8 }}>Invoice</div>
                            <div style={{ color: '#555', fontSize: 14 }}>
                                <strong>Date:</strong> {new Date().toLocaleDateString()}<br />
                                <strong>Order #:</strong> {order.order_number}<br />
                                <strong>Due Date:</strong> {formatDate(order.due_date)}
                            </div>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div style={{ display: 'flex', gap: 64, marginBottom: 48 }}>
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#888', marginBottom: 8 }}>Bill To</div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>{customer?.name || 'Walk-in Customer'}</div>
                            {customer?.email && <div style={{ color: '#555', fontSize: 14, marginTop: 4 }}>{customer.email}</div>}
                            {customer?.phone && <div style={{ color: '#555', fontSize: 14, marginTop: 4 }}>{customer.phone}</div>}
                        </div>
                    </div>

                    {/* Line Items */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 48 }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #111' }}>
                                <th style={{ textAlign: 'left', padding: '12px 0', fontSize: 12, textTransform: 'uppercase', color: '#888' }}>Description</th>
                                <th style={{ textAlign: 'right', padding: '12px 0', fontSize: 12, textTransform: 'uppercase', color: '#888' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ borderBottom: '1px solid #ccc' }}>
                                <td style={{ padding: '24px 0' }}>
                                    <div style={{ fontSize: 16, fontWeight: 600, color: '#111', textTransform: 'capitalize' }}>
                                        Custom Jewelry Production - {ITEM_TYPE_LABELS[order.item_type]}
                                    </div>
                                    <div style={{ color: '#555', fontSize: 14, marginTop: 8 }}>
                                        Materials used: {order.materials?.map(m => MATERIAL_LABELS[m]).join(', ') || 'N/A'}
                                    </div>
                                    <div style={{ color: '#555', fontSize: 14, marginTop: 4 }}>
                                        Weight: {order.end_weight ? `${order.end_weight}g` : (order.starting_weight ? `${order.starting_weight}g (est)` : 'TBD')}
                                    </div>
                                </td>
                                <td style={{ textAlign: 'right', padding: '24px 0', fontSize: 16, fontWeight: 600 }}>
                                    {formatCurrency(order.price)}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{ width: 300 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #ccc', color: '#555' }}>
                                <span>Subtotal</span>
                                <span>{formatCurrency((order.price || 0) * 0.82)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #111', color: '#555' }}>
                                <span>VAT (22%)</span>
                                <span>{formatCurrency((order.price || 0) * 0.18)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', fontSize: 20, fontWeight: 900 }}>
                                <span>Total due</span>
                                <span>{formatCurrency(order.price || 0)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{ marginTop: 64, paddingTop: 24, borderTop: '1px solid #ccc', color: '#888', fontSize: 12, textAlign: 'center' }}>
                        Thank you for your business. Payment is due upon completion of the order.
                    </div>
                </div>
            )}
        </AppShell>
    );
}
