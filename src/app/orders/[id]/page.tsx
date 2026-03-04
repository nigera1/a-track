'use client';

import { AppShell } from '@/components/app-shell';
import { useStore } from '@/lib/store';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, Edit3, Save, X, Trash2, Gem, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import {
    Order, OrderStatus, ItemType, MaterialType, StoneType, StoneCategory,
    ORDER_STAGES, ITEM_TYPE_LABELS, MATERIAL_LABELS, STONE_TYPE_LABELS,
} from '@/types';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/helpers';

export default function OrderDetailPage() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const { orders, customers, updateOrder, updateOrderStatus, deleteOrder } = useStore();
    const order = orders.find(o => o.id === id);
    const customer = order ? customers.find(c => c.id === order.customer_id) : null;
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState<Partial<Order>>({});

    if (!order) return (
        <AppShell>
            <div className="flex flex-col items-center justify-center h-64 gap-4" style={{ color: 'var(--muted-foreground)' }}>
                <div className="text-4xl">404</div>
                <div>Order not found</div>
                <Link href="/orders" className="text-sm" style={{ color: 'var(--gold)' }}>← Back to Orders</Link>
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

    const inputCls = "w-full px-3 py-2 rounded-lg border text-sm";
    const inputStyle = { border: '1px solid var(--border)', background: 'var(--input)' };
    const field = (label: string, value: React.ReactNode) => (
        <div>
            <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--muted-foreground)' }}>{label}</div>
            <div className="text-sm font-medium">{value ?? '—'}</div>
        </div>
    );

    const toggleMaterial = (m: MaterialType) => {
        const cur = editData.materials ?? [];
        setEditData(d => ({ ...d, materials: cur.includes(m) ? cur.filter(x => x !== m) : [...cur, m] }));
    };

    const currentStageIndex = ORDER_STAGES.findIndex(s => s.key === order.status);

    return (
        <AppShell>
            <div className="max-w-3xl mx-auto flex flex-col gap-6">
                {/* Back */}
                <div className="flex items-center justify-between">
                    <Link href="/orders" className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity" style={{ color: 'var(--muted-foreground)' }}>
                        <ArrowLeft className="w-4 h-4" /> Orders
                    </Link>
                    <div className="flex gap-2">
                        {!editing ? (
                            <>
                                <button onClick={startEdit} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm" style={{ background: 'var(--muted)', color: 'var(--foreground)' }}>
                                    <Edit3 className="w-4 h-4" /> Edit
                                </button>
                                <button onClick={handleDelete} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>
                                    <Trash2 className="w-4 h-4" /> Delete
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={saveEdit} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm" style={{ background: 'var(--gold)', color: '#0a0a0f' }}>
                                    <Save className="w-4 h-4" /> Save
                                </button>
                                <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                                    <X className="w-4 h-4" /> Cancel
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Header */}
                <div className="glass-card p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                            <div className="text-xs font-mono" style={{ color: 'var(--muted-foreground)' }}>Order</div>
                            <div className="text-xl font-bold" style={{ color: 'var(--gold)' }}>{order.order_number}</div>
                            <div className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                                Created {formatDate(order.created_at)} · Last updated {formatDate(order.updated_at)}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--muted-foreground)' }}>Current Stage</div>
                            <span className="status-pill text-sm" style={{ background: `${getStatusColor(order.status)}25`, color: getStatusColor(order.status) }}>
                                {getStatusLabel(order.status)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stage Timeline */}
                <div className="glass-card p-5">
                    <div className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--muted-foreground)' }}>Production Stage</div>
                    <div className="flex gap-1 overflow-x-auto pb-2">
                        {ORDER_STAGES.map((stage, i) => {
                            const isPast = i < currentStageIndex;
                            const isCurrent = i === currentStageIndex;
                            const isFuture = i > currentStageIndex;
                            return (
                                <button key={stage.key} onClick={() => { updateOrderStatus(id, stage.key); toast.success(`Moved to ${stage.label}`); }}
                                    className="flex-1 min-w-[70px] flex flex-col items-center gap-1.5 py-2 px-1 rounded-xl text-center transition-all"
                                    title={`Move to ${stage.label}`}
                                    style={{
                                        background: isCurrent ? `${stage.color}25` : isPast ? 'rgba(255,255,255,0.04)' : 'transparent',
                                        border: `1px solid ${isCurrent ? stage.color : isPast ? 'rgba(255,255,255,0.08)' : 'transparent'}`,
                                        cursor: 'pointer',
                                    }}>
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: isPast || isCurrent ? stage.color : 'var(--border)' }} />
                                    <div className="text-xs font-medium leading-tight" style={{ color: isCurrent ? stage.color : isPast ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
                                        {stage.label}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    <div className="text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>Click any stage to move the order there</div>
                </div>

                {/* Customer */}
                <div className="glass-card p-5">
                    <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--muted-foreground)' }}>Customer</div>
                    {customer ? (
                        <Link href={`/customers/${customer.id}`} className="flex items-center justify-between group">
                            <div>
                                <div className="font-semibold">{customer.name}</div>
                                <div className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{customer.phone}</div>
                                {customer.email && <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{customer.email}</div>}
                            </div>
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" style={{ color: 'var(--gold)' }} />
                        </Link>
                    ) : <div style={{ color: 'var(--muted-foreground)' }}>—</div>}
                </div>

                {/* Details grid */}
                <div className="glass-card p-5">
                    <div className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--muted-foreground)' }}>Item Details</div>
                    {!editing ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                            {field('Item Type', ITEM_TYPE_LABELS[order.item_type])}
                            {field('Item ID', order.item_id)}
                            {field('Materials', order.materials?.map(m => MATERIAL_LABELS[m]).join(', ') || '—')}
                            {field('Starting Weight', order.starting_weight ? `${order.starting_weight} g` : '—')}
                            {field('End Weight', order.end_weight ? `${order.end_weight} g` : '—')}
                            {field('Price', formatCurrency(order.price))}
                            {field('Due Date', formatDate(order.due_date))}
                            {field('Notes', order.notes)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Item Type</label>
                                <select value={editData.item_type} onChange={e => setEditData(d => ({ ...d, item_type: e.target.value as ItemType }))} className={inputCls} style={inputStyle}>
                                    {Object.entries(ITEM_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Item ID</label>
                                <input value={editData.item_id ?? ''} onChange={e => setEditData(d => ({ ...d, item_id: e.target.value }))} className={inputCls} style={inputStyle} />
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Starting Weight (g)</label>
                                <input type="number" step="0.01" value={editData.starting_weight ?? ''} onChange={e => setEditData(d => ({ ...d, starting_weight: parseFloat(e.target.value) || undefined }))} className={inputCls} style={inputStyle} />
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>End Weight (g)</label>
                                <input type="number" step="0.01" value={editData.end_weight ?? ''} onChange={e => setEditData(d => ({ ...d, end_weight: parseFloat(e.target.value) || undefined }))} className={inputCls} style={inputStyle} />
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Price (€)</label>
                                <input type="number" step="0.01" value={editData.price ?? ''} onChange={e => setEditData(d => ({ ...d, price: parseFloat(e.target.value) || undefined }))} className={inputCls} style={inputStyle} />
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Due Date</label>
                                <input type="date" value={editData.due_date ?? ''} onChange={e => setEditData(d => ({ ...d, due_date: e.target.value }))} className={inputCls} style={inputStyle} />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Materials</label>
                                <div className="flex flex-wrap gap-2">
                                    {(Object.keys(MATERIAL_LABELS) as MaterialType[]).map(m => (
                                        <button key={m} type="button" onClick={() => toggleMaterial(m)} className="px-3 py-1 rounded-lg text-sm transition-all"
                                            style={{ background: editData.materials?.includes(m) ? 'rgba(212,168,50,0.2)' : 'var(--muted)', color: editData.materials?.includes(m) ? 'var(--gold)' : 'var(--muted-foreground)', border: `1px solid ${editData.materials?.includes(m) ? 'rgba(212,168,50,0.4)' : 'transparent'}` }}>
                                            {MATERIAL_LABELS[m]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Notes</label>
                                <textarea value={editData.notes ?? ''} onChange={e => setEditData(d => ({ ...d, notes: e.target.value }))} rows={3}
                                    className="w-full px-3 py-2 rounded-lg border text-sm resize-none" style={{ border: '1px solid var(--border)', background: 'var(--input)' }} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Gemstones */}
                {(order.gemstones?.length ?? 0) > 0 && (
                    <div className="glass-card p-5">
                        <div className="text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: 'var(--muted-foreground)' }}>
                            <Gem className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} /> Gemstones
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    {['Category', 'Stone', 'Carat', 'Qty', 'Notes'].map(h => (
                                        <th key={h} className="text-left pb-2 pr-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {order.gemstones?.map(gem => (
                                    <tr key={gem.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                        <td className="py-2 pr-4">
                                            <span className="status-pill" style={{ background: gem.category === 'central' ? 'rgba(212,168,50,0.15)' : 'rgba(99,102,241,0.15)', color: gem.category === 'central' ? 'var(--gold)' : '#818cf8' }}>
                                                {gem.category}
                                            </span>
                                        </td>
                                        <td className="py-2 pr-4">{STONE_TYPE_LABELS[gem.stone_type]}</td>
                                        <td className="py-2 pr-4">{gem.carat} ct</td>
                                        <td className="py-2 pr-4">{gem.quantity}</td>
                                        <td className="py-2 pr-4 text-xs" style={{ color: 'var(--muted-foreground)' }}>{gem.notes ?? '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AppShell>
    );
}
