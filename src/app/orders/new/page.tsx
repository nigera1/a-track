'use client';

import { AppShell } from '@/components/app-shell';
import { useStore } from '@/lib/store';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Trash2, Gem, ArrowLeft } from 'lucide-react';
import {
    ItemType, MaterialType, OrderStatus, StoneCategory, StoneType,
    ITEM_TYPE_LABELS, MATERIAL_LABELS, STONE_TYPE_LABELS, ORDER_STAGES, Gemstone
} from '@/types';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';

const ITEM_TYPES = Object.keys(ITEM_TYPE_LABELS) as ItemType[];
const MATERIAL_TYPES = Object.keys(MATERIAL_LABELS) as MaterialType[];
const STONE_TYPES = Object.keys(STONE_TYPE_LABELS) as StoneType[];

function GemstoneRow({ gem, onChange, onRemove }: {
    gem: Gemstone;
    onChange: (g: Gemstone) => void;
    onRemove: () => void;
}) {
    return (
        <div className="grid gap-2 p-3 rounded-xl" style={{ gridTemplateColumns: '1fr 1fr auto auto auto', background: 'var(--muted)', border: '1px solid var(--border)' }}>
            <select value={gem.stone_type} onChange={e => onChange({ ...gem, stone_type: e.target.value as StoneType })}
                className="px-2 py-1.5 rounded-lg text-sm" style={{ border: '1px solid var(--border)' }}>
                {STONE_TYPES.map(t => <option key={t} value={t}>{STONE_TYPE_LABELS[t]}</option>)}
            </select>
            <select value={gem.category} onChange={e => onChange({ ...gem, category: e.target.value as StoneCategory })}
                className="px-2 py-1.5 rounded-lg text-sm" style={{ border: '1px solid var(--border)' }}>
                <option value="central">Central</option>
                <option value="side">Side</option>
            </select>
            <input type="number" step="0.01" min="0" placeholder="ct" value={gem.carat || ''} onChange={e => onChange({ ...gem, carat: parseFloat(e.target.value) || 0 })}
                className="px-2 py-1.5 rounded-lg text-sm w-20" style={{ border: '1px solid var(--border)' }} />
            <input type="number" min="1" placeholder="qty" value={gem.quantity || ''} onChange={e => onChange({ ...gem, quantity: parseInt(e.target.value) || 1 })}
                className="px-2 py-1.5 rounded-lg text-sm w-16" style={{ border: '1px solid var(--border)' }} />
            <button type="button" onClick={onRemove} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                <Trash2 className="w-4 h-4" style={{ color: '#f87171' }} />
            </button>
        </div>
    );
}

export default function NewOrderPage() {
    const router = useRouter();
    const { addOrder, customers, addCustomer } = useStore();

    const [customerId, setCustomerId] = useState('');
    const [newCustomerName, setNewCustomerName] = useState('');
    const [newCustomerPhone, setNewCustomerPhone] = useState('');
    const [isNewCustomer, setIsNewCustomer] = useState(false);

    const [itemType, setItemType] = useState<ItemType>('ring');
    const [itemId, setItemId] = useState('');
    const [status, setStatus] = useState<OrderStatus>('3d_modeling');
    const [materials, setMaterials] = useState<MaterialType[]>([]);
    const [startWeight, setStartWeight] = useState('');
    const [price, setPrice] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [notes, setNotes] = useState('');
    const [gemstones, setGemstones] = useState<Gemstone[]>([]);
    const [loading, setLoading] = useState(false);

    function toggleMaterial(m: MaterialType) {
        setMaterials(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
    }

    function addGemstone() {
        setGemstones(prev => [...prev, {
            id: uuidv4(), order_id: '', category: 'central', stone_type: 'diamond', carat: 0, quantity: 1
        }]);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!isNewCustomer && !customerId) { toast.error('Please select or add a customer'); return; }
        if (isNewCustomer && !newCustomerName) { toast.error('Customer name is required'); return; }
        setLoading(true);

        let finalCustomerId = customerId;
        if (isNewCustomer) {
            const c = addCustomer({ name: newCustomerName, phone: newCustomerPhone });
            finalCustomerId = c.id;
        }

        const order = addOrder({
            customer_id: finalCustomerId,
            item_type: itemType,
            item_id: itemId || undefined,
            status,
            materials,
            starting_weight: startWeight ? parseFloat(startWeight) : undefined,
            price: price ? parseFloat(price) : undefined,
            due_date: dueDate || undefined,
            notes: notes || undefined,
            gemstones: gemstones.map(g => ({ ...g, order_id: '' })),
        });

        toast.success(`${order.order_number} created!`);
        router.push(`/orders/${order.id}`);
    }

    const inputCls = "w-full px-3 py-2 rounded-lg border text-sm";
    const inputStyle = { border: '1px solid var(--border)', background: 'var(--input)' };
    const labelCls = "text-xs font-semibold uppercase tracking-wider mb-1.5 block";
    const labelStyle = { color: 'var(--muted-foreground)' };

    return (
        <AppShell>
            <div className="max-w-2xl mx-auto">
                <Link href="/orders" className="flex items-center gap-2 text-sm mb-5 hover:opacity-80 transition-opacity" style={{ color: 'var(--muted-foreground)' }}>
                    <ArrowLeft className="w-4 h-4" /> Back to Orders
                </Link>
                <h1 className="text-lg font-semibold mb-5">New Order</h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                    {/* Customer */}
                    <div className="glass-card p-5 flex flex-col gap-4">
                        <h2 className="font-semibold">Customer</h2>
                        <div className="flex gap-2 mb-1">
                            <button type="button" onClick={() => setIsNewCustomer(false)} className="flex-1 py-1.5 rounded-lg text-sm transition-all"
                                style={{ background: !isNewCustomer ? 'var(--gold)' : 'var(--muted)', color: !isNewCustomer ? '#0a0a0f' : 'var(--muted-foreground)' }}>
                                Existing
                            </button>
                            <button type="button" onClick={() => setIsNewCustomer(true)} className="flex-1 py-1.5 rounded-lg text-sm transition-all"
                                style={{ background: isNewCustomer ? 'var(--gold)' : 'var(--muted)', color: isNewCustomer ? '#0a0a0f' : 'var(--muted-foreground)' }}>
                                New Customer
                            </button>
                        </div>
                        {!isNewCustomer ? (
                            <div>
                                <label className={labelCls} style={labelStyle}>Select Customer</label>
                                <select value={customerId} onChange={e => setCustomerId(e.target.value)} className={inputCls} style={inputStyle}>
                                    <option value="">— Select customer —</option>
                                    {customers.map(c => <option key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>)}
                                </select>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelCls} style={labelStyle}>Name *</label>
                                    <input value={newCustomerName} onChange={e => setNewCustomerName(e.target.value)} placeholder="Full name" className={inputCls} style={inputStyle} />
                                </div>
                                <div>
                                    <label className={labelCls} style={labelStyle}>Phone</label>
                                    <input value={newCustomerPhone} onChange={e => setNewCustomerPhone(e.target.value)} placeholder="+39 02 …" className={inputCls} style={inputStyle} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Item Details */}
                    <div className="glass-card p-5 flex flex-col gap-4">
                        <h2 className="font-semibold">Item Details</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelCls} style={labelStyle}>Item Type</label>
                                <select value={itemType} onChange={e => setItemType(e.target.value as ItemType)} className={inputCls} style={inputStyle}>
                                    {ITEM_TYPES.map(t => <option key={t} value={t}>{ITEM_TYPE_LABELS[t]}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelCls} style={labelStyle}>Item ID (optional)</label>
                                <input value={itemId} onChange={e => setItemId(e.target.value)} placeholder="e.g. RING-042" className={inputCls} style={inputStyle} />
                            </div>
                            <div>
                                <label className={labelCls} style={labelStyle}>Starting Weight (g)</label>
                                <input type="number" step="0.01" value={startWeight} onChange={e => setStartWeight(e.target.value)} placeholder="0.00" className={inputCls} style={inputStyle} />
                            </div>
                            <div>
                                <label className={labelCls} style={labelStyle}>Starting Stage</label>
                                <select value={status} onChange={e => setStatus(e.target.value as OrderStatus)} className={inputCls} style={inputStyle}>
                                    {ORDER_STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelCls} style={labelStyle}>Price (€)</label>
                                <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" className={inputCls} style={inputStyle} />
                            </div>
                            <div>
                                <label className={labelCls} style={labelStyle}>Due Date</label>
                                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inputCls} style={inputStyle} />
                            </div>
                        </div>

                        {/* Materials */}
                        <div>
                            <label className={labelCls} style={labelStyle}>Materials</label>
                            <div className="flex flex-wrap gap-2">
                                {MATERIAL_TYPES.map(m => (
                                    <button key={m} type="button" onClick={() => toggleMaterial(m)}
                                        className="px-3 py-1 rounded-lg text-sm font-medium transition-all"
                                        style={{ background: materials.includes(m) ? 'rgba(212,168,50,0.2)' : 'var(--muted)', color: materials.includes(m) ? 'var(--gold)' : 'var(--muted-foreground)', border: `1px solid ${materials.includes(m) ? 'rgba(212,168,50,0.4)' : 'transparent'}` }}>
                                        {MATERIAL_LABELS[m]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className={labelCls} style={labelStyle}>Notes</label>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Special instructions, client preferences…" rows={3}
                                className="w-full px-3 py-2 rounded-lg border text-sm resize-none" style={{ border: '1px solid var(--border)', background: 'var(--input)' }} />
                        </div>
                    </div>

                    {/* Gemstones */}
                    <div className="glass-card p-5 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold flex items-center gap-2">
                                <Gem className="w-4 h-4" style={{ color: 'var(--gold)' }} /> Gemstones
                            </h2>
                            <button type="button" onClick={addGemstone} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                                style={{ background: 'rgba(212,168,50,0.15)', color: 'var(--gold)' }}>
                                <Plus className="w-3.5 h-3.5" /> Add Stone
                            </button>
                        </div>
                        {gemstones.length === 0 && (
                            <div className="text-sm py-4 text-center rounded-xl" style={{ color: 'var(--muted-foreground)', background: 'var(--muted)' }}>
                                No gemstones added yet
                            </div>
                        )}
                        <div className="flex flex-col gap-2">
                            {gemstones.map((gem, i) => (
                                <GemstoneRow key={gem.id} gem={gem}
                                    onChange={updated => setGemstones(prev => prev.map((g, j) => j === i ? updated : g))}
                                    onRemove={() => setGemstones(prev => prev.filter((_, j) => j !== i))} />
                            ))}
                        </div>
                        {gemstones.length > 0 && (
                            <div className="text-xs p-2 rounded-lg" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                                Central: {gemstones.filter(g => g.category === 'central').length} stone(s) &nbsp;·&nbsp;
                                Side: {gemstones.filter(g => g.category === 'side').reduce((s, g) => s + g.quantity, 0)} stone(s)
                            </div>
                        )}
                    </div>

                    {/* Submit */}
                    <button type="submit" disabled={loading}
                        className="w-full py-2.5 rounded-md font-semibold text-sm"
                        style={{ background: 'var(--gold)', color: '#111', opacity: loading ? 0.7 : 1 }}>
                        {loading ? 'Creating…' : 'Create Order'}
                    </button>
                </form>
            </div>
        </AppShell>
    );
}
