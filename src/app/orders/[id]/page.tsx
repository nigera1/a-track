'use client';

import { AppShell } from '@/components/app-shell';
import { useStore } from '@/lib/store';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, Edit3, Save, X, Trash2, Gem, ChevronRight, Printer, QrCode, Clock, Building2 } from 'lucide-react';
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

    function handlePrint() {
        window.print();
    }

    const inputCls = "w-full px-3 py-2 rounded-lg border text-sm";
    const inputStyle = { border: '2px solid #111', background: '#fff' };
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
            {/* ── Print-only header (hidden normally) ── */}
            <div className="print-only" style={{ display: 'none' }}>
                <style>{`
                    @media print {
                        .no-print { display: none !important; }
                        .print-only { display: block !important; }
                        body { background: white !important; color: black !important; }
                        .neo-card, .glass-card { box-shadow: none !important; border: 1px solid #ccc !important; }
                    }
                `}</style>
                <div style={{ padding: '0 0 16px', borderBottom: '3px solid #111', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-1px' }}>A-TRACK</div>
                        <div style={{ fontSize: 12, color: '#888', letterSpacing: '2px', textTransform: 'uppercase' }}>Order Sheet</div>
                    </div>
                    <QRCodeSVG value={orderUrl || `order-${order.order_number}`} size={72} />
                </div>
            </div>

            <div style={{ maxWidth: 700, margin: '0 auto' }} className="flex flex-col gap-5">

                {/* Back + Actions */}
                <div className="flex items-center justify-between no-print">
                    <Link href="/orders" className="flex items-center gap-2 text-sm font-bold hover:opacity-80 transition-opacity" style={{ color: '#888' }}>
                        <ArrowLeft style={{ width: 16, height: 16 }} /> Orders
                    </Link>
                    <div className="flex gap-2">
                        {/* Print & QR always visible */}
                        <button onClick={() => setShowQR(!showQR)} className="neo-btn" title="Show QR Code">
                            <QrCode style={{ width: 13, height: 13 }} /> QR
                        </button>
                        <button onClick={handlePrint} className="neo-btn" title="Print Order Sheet">
                            <Printer style={{ width: 13, height: 13 }} /> Print
                        </button>
                        {!editing ? (
                            <>
                                <button onClick={startEdit} className="neo-btn">
                                    <Edit3 style={{ width: 13, height: 13 }} /> Edit
                                </button>
                                <button onClick={handleDelete} className="neo-btn" style={{ color: '#ef4444', borderColor: '#ef4444', boxShadow: '2px 2px 0 0 #ef4444' }}>
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
                        style={{ borderColor: '#3b82f6', boxShadow: '4px 4px 0 0 #3b82f6' }}>
                        <div className="section-label">Scan to open this order</div>
                        <div className="p-4 bg-white rounded-lg" style={{ border: '2px solid #111' }}>
                            <QRCodeSVG value={orderUrl || `order-${order.order_number}`} size={160} />
                        </div>
                        <div className="text-xs font-mono font-bold text-center px-4 py-2 rounded" style={{ background: '#f0f0f0', border: '1px solid #ddd', wordBreak: 'break-all' }}>
                            {order.order_number}
                        </div>
                        <button onClick={() => setShowQR(false)} className="neo-btn text-xs">Close</button>
                    </div>
                )}

                {/* Order Header */}
                <div className="neo-card p-5" style={{ borderColor: stageColor, boxShadow: `4px 4px 0 0 ${stageColor}` }}>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                            <div className="section-label mb-1">Order Number</div>
                            <div className="text-2xl font-black">{order.order_number}</div>
                            <div className="text-xs font-semibold mt-1" style={{ color: '#888' }}>
                                Created {formatDate(order.created_at)} · Updated {formatDate(order.updated_at)}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="section-label mb-1">Current Stage</div>
                            <span className="status-pill text-sm font-black" style={{ color: stageColor }}>
                                {getStatusLabel(order.status)}
                            </span>
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
                                    className="flex-1 min-w-[70px] flex flex-col items-center gap-1.5 py-2 px-1 rounded-lg text-center transition-all"
                                    title={`Move to ${stage.label}`}
                                    style={{
                                        background: isCurrent ? `${stage.color}20` : 'transparent',
                                        border: `2px solid ${isCurrent ? stage.color : isPast ? stage.color + '60' : '#ddd'}`,
                                        boxShadow: isCurrent ? `2px 2px 0 0 ${stage.color}` : 'none',
                                        cursor: 'pointer',
                                    }}>
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: isPast || isCurrent ? stage.color : '#ddd' }} />
                                    <div className="text-[10px] font-black uppercase leading-tight"
                                        style={{ color: isCurrent ? stage.color : isPast ? '#555' : '#bbb' }}>
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
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                            {field('Item Type', ITEM_TYPE_LABELS[order.item_type])}
                            {field('Item ID', order.item_id)}
                            {field('Materials', order.materials?.map(m => MATERIAL_LABELS[m]).join(', ') || '—')}
                            {field('Start Weight', order.starting_weight ? `${order.starting_weight} g` : '—')}
                            {field('End Weight', order.end_weight ? `${order.end_weight} g` : '—')}
                            {field('Price', formatCurrency(order.price))}
                            {field('Due Date', formatDate(order.due_date))}
                            {order.notes && <div className="col-span-2 md:col-span-3">{field('Notes', order.notes)}</div>}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
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
                            <div className="col-span-2">
                                <label className="section-label mb-1.5 block">Materials</label>
                                <div className="flex flex-wrap gap-2">
                                    {(Object.keys(MATERIAL_LABELS) as MaterialType[]).map(m => (
                                        <button key={m} type="button" onClick={() => toggleMaterial(m)} className="px-3 py-1 rounded-lg text-sm font-bold transition-all"
                                            style={{ background: editData.materials?.includes(m) ? '#111' : '#f0f0f0', color: editData.materials?.includes(m) ? '#fff' : '#555', border: '2px solid #111' }}>
                                            {MATERIAL_LABELS[m]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="col-span-2">
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
                        <table className="w-full text-sm">
                            <thead>
                                <tr style={{ borderBottom: '2px solid #111' }}>
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
                )}

                {/* Supplier — available at every stage */}
                <div className="neo-card p-5">
                    <div className="section-label mb-3 flex items-center gap-2">
                        <Building2 style={{ width: 13, height: 13, color: '#8b5cf6' }} /> Assigned Supplier
                    </div>
                    <select
                        value={order.supplier_id ?? ''}
                        onChange={e => updateOrder(id, { supplier_id: e.target.value || undefined })}
                        style={{ width: '100%', border: '2px solid #111', borderRadius: 8, padding: '8px 12px', fontSize: 13, fontWeight: 600, background: '#fff' }}>
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
        </AppShell>
    );
}
