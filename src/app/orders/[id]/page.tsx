'use client';

import { AppShell } from '@/components/app-shell';
import { useStore } from '@/lib/store';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, Edit3, Save, X, Trash2, Gem, ChevronRight, Printer, QrCode, Clock, Building2, Package, FileText } from 'lucide-react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
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
                <div className="text-4xl font-black">404</div>
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
    const inputStyle = { border: '1px solid var(--border)', background: '#fff' };
    const field = (label: string, value: React.ReactNode) => (
        <div>
            <div className="section-label mb-1">{label}</div>
            <div className="text-sm font-semibold">{value ?? '—'}</div>
        </div>
    );

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
                    <Link href="/orders" className="flex items-center gap-2 text-sm font-bold hover:opacity-80 transition-opacity" style={{ color: '#888' }}>
                        <ArrowLeft style={{ width: 16, height: 16 }} /> Orders
                    </Link>
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Print & QR always visible */}
                        <button onClick={() => setShowQR(!showQR)} className="neo-btn" title="Show QR Code">
                            <QrCode style={{ width: 13, height: 13 }} /> QR
                        </button>
                        <button onClick={() => handlePrint('sheet')} className="neo-btn" title="Print Internal Order Sheet">
                            <Printer style={{ width: 13, height: 13 }} /> Print
                        </button>
                        <button onClick={() => handlePrint('invoice')} className="neo-btn" title="Generate Customer Invoice" style={{ background: '#111', color: '#fff' }}>
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
                        <div className="text-xs font-mono font-bold text-center px-4 py-2 rounded" style={{ background: '#f0f0f0', border: '1px solid #ddd', wordBreak: 'break-all' }}>
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
                            <div className="text-2xl font-black">{order.order_number}</div>
                            <div className="text-xs font-semibold mt-1" style={{ color: '#888' }}>
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
                                        textTransform: 'uppercase', border: '3px solid #000' 
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
                                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-black uppercase tracking-wide transition-all mt-1"
                                        style={{ 
                                            background: order.is_ready_for_pickup ? '#3b82f6' : '#f0f0f0', 
                                            color: order.is_ready_for_pickup ? '#fff' : '#666',
                                            border: `1.5px solid ${order.is_ready_for_pickup ? '#3b82f6' : '#ddd'}`
                                        }}>
                                        <Package style={{ width: 12, height: 12 }} />
                                        {order.is_ready_for_pickup ? 'Ready for Pickup' : 'Mark for Pickup'}
                                    </button>
                                )}
                            </div>
                            
                            {order.price != null && (
                                <div className="text-xl font-black mt-2">{formatCurrency(order.price)}</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stage Timeline */}
                <div className="neo-card p-5 no-print">
                    <div className="section-label mb-4">Production Stage — click to move</div>
                    <div className="flex gap-1 overflow-x-auto pb-1">
                        {ORDER_STAGES.map((stage, i) => {
                            const isPast = i < currentStageIndex;
                            const isCurrent = i === currentStageIndex;
                            return (
                                <button key={stage.key} onClick={() => { updateOrderStatus(id, stage.key); toast.success(`Moved to ${stage.label}`); }}
                                    className="flex-1 min-w-[70px] flex flex-col items-center gap-2 py-3 px-1 text-center transition-all"
                                    title={`Move to ${stage.label}`}
                                    style={{
                                        background: isCurrent ? stage.color : isPast ? '#000' : '#fff',
                                        border: `3px solid #000`,
                                        cursor: 'pointer',
                                    }}>
                                    <div className="text-[11px] font-black uppercase leading-tight"
                                        style={{ color: isCurrent || isPast ? '#fff' : '#000' }}>
                                        {stage.label}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Customer */}
                <div className="neo-card p-5">
                    <div className="section-label mb-3">Customer</div>
                    {customer ? (
                        <Link href={`/customers/${customer.id}`} className="flex items-center justify-between group no-print">
                            <div>
                                <div className="font-black text-base">{customer.name}</div>
                                <div className="text-sm font-semibold mt-0.5" style={{ color: '#888' }}>{customer.phone}</div>
                                {customer.email && <div className="text-sm" style={{ color: '#888' }}>{customer.email}</div>}
                            </div>
                            <ChevronRight style={{ width: 16, height: 16, color: '#3b82f6' }} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    ) : <div style={{ color: '#888' }}>No customer assigned</div>}
                </div>

                {/* Item Details */}
                <div className="neo-card p-5">
                    <div className="section-label mb-4">Item Details</div>
                    {!editing ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                            {field('Item Type', ITEM_TYPE_LABELS[order.item_type])}
                            {field('Item ID', order.item_id)}
                            {field('Materials', order.materials?.map(m => MATERIAL_LABELS[m]).join(', ') || '—')}
                            {field('Start Weight', order.starting_weight ? `${order.starting_weight} g` : '—')}
                            {field('End Weight', order.end_weight ? `${order.end_weight} g` : '—')}
                            {field('Price', formatCurrency(order.price))}
                            {field('Due Date', formatDate(order.due_date))}
                            {order.notes && <div className="sm:col-span-2 md:col-span-3">{field('Notes', order.notes)}</div>}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="section-label mb-1.5 block">Item Type</label>
                                <select value={editData.item_type} onChange={e => setEditData(d => ({ ...d, item_type: e.target.value as ItemType }))} className={inputCls} style={inputStyle}>
                                    {Object.entries(ITEM_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="section-label mb-1.5 block">Item ID</label>
                                <input value={editData.item_id ?? ''} onChange={e => setEditData(d => ({ ...d, item_id: e.target.value }))} className={inputCls} style={inputStyle} />
                            </div>
                            <div>
                                <label className="section-label mb-1.5 block">Start Weight (g)</label>
                                <input type="number" step="0.01" value={editData.starting_weight ?? ''} onChange={e => setEditData(d => ({ ...d, starting_weight: parseFloat(e.target.value) || undefined }))} className={inputCls} style={inputStyle} />
                            </div>
                            <div>
                                <label className="section-label mb-1.5 block">End Weight (g)</label>
                                <input type="number" step="0.01" value={editData.end_weight ?? ''} onChange={e => setEditData(d => ({ ...d, end_weight: parseFloat(e.target.value) || undefined }))} className={inputCls} style={inputStyle} />
                            </div>
                            <div>
                                <label className="section-label mb-1.5 block">Price (€)</label>
                                <input type="number" step="0.01" value={editData.price ?? ''} onChange={e => setEditData(d => ({ ...d, price: parseFloat(e.target.value) || undefined }))} className={inputCls} style={inputStyle} />
                            </div>
                            <div>
                                <label className="section-label mb-1.5 block">Due Date</label>
                                <input type="date" value={editData.due_date ?? ''} onChange={e => setEditData(d => ({ ...d, due_date: e.target.value }))} className={inputCls} style={inputStyle} />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="section-label mb-1.5 block">Materials</label>
                                <div className="flex flex-wrap gap-2">
                                    {(Object.keys(MATERIAL_LABELS) as MaterialType[]).map(m => (
                                        <button key={m} type="button" onClick={() => toggleMaterial(m)} className="px-3 py-1 rounded-lg text-sm font-bold transition-all"
                                            style={{ background: editData.materials?.includes(m) ? '#111' : '#f0f0f0', color: editData.materials?.includes(m) ? '#fff' : '#555', border: '1px solid var(--border)' }}>
                                            {MATERIAL_LABELS[m]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="section-label mb-1.5 block">Notes</label>
                                <textarea value={editData.notes ?? ''} onChange={e => setEditData(d => ({ ...d, notes: e.target.value }))} rows={3}
                                    className="w-full px-3 py-2 rounded-lg text-sm resize-none" style={inputStyle} />
                            </div>
                        </div>
                    )}
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
                                    <tr key={gem.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td className="py-2 pr-4">
                                            <span className="status-pill" style={{ color: gem.category === 'central' ? '#f97316' : '#8b5cf6' }}>
                                                {gem.category}
                                            </span>
                                        </td>
                                        <td className="py-2 pr-4 font-semibold">{STONE_TYPE_LABELS[gem.stone_type]}</td>
                                        <td className="py-2 pr-4">{gem.carat} ct</td>
                                        <td className="py-2 pr-4" style={{ color: '#888' }}>{gem.diameter_mm ? `${gem.diameter_mm} mm` : '—'}</td>
                                        <td className="py-2 pr-4 font-black">{gem.quantity}</td>
                                        <td className="py-2 pr-4 text-xs" style={{ color: '#888' }}>{gem.notes ?? '—'}</td>
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
                        style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 13, fontWeight: 600, background: '#fff' }}>
                        <option value="">— No supplier assigned</option>
                        {suppliers.map(s => (
                            <option key={s.id} value={s.id}>{s.name}{s.contact ? ` · ${s.contact}` : ''}</option>
                        ))}
                    </select>
                    {supplier && (
                        <div className="mt-2 text-xs font-semibold" style={{ color: '#888' }}>{supplier.notes}</div>
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
                                        style={{ borderBottom: '1px solid #eee' }}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: stageInfo?.color ?? '#888' }} />
                                            <span className="text-xs font-bold" style={{ color: stageInfo?.color }}>{stageInfo?.label}</span>
                                        </div>
                                        <span className="text-xs font-black" style={{ color: isOpen ? '#3b82f6' : '#111' }}>
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
