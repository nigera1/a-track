'use client';

import { AppShell } from '@/components/app-shell';
import { useStore } from '@/lib/store';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Gem, ArrowLeft, User, Package, Calendar, Coins, ArrowRight } from 'lucide-react';
import {
    ItemType, MaterialType, OrderStatus, StoneCategory, StoneType,
    ITEM_TYPE_LABELS, MATERIAL_LABELS, STONE_TYPE_LABELS, ORDER_STAGES, Gemstone
} from '@/types';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';
import { formatCurrency } from '@/lib/helpers';

const ITEM_TYPES = Object.keys(ITEM_TYPE_LABELS) as ItemType[];
const MATERIAL_TYPES = Object.keys(MATERIAL_LABELS) as MaterialType[];
const STONE_TYPES = Object.keys(STONE_TYPE_LABELS) as StoneType[];

/* ─── small reusable bits ─── */
function Label({ children }: { children: React.ReactNode }) {
    return (
        <div className="section-label mb-1.5">{children}</div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <Label>{label}</Label>
            {children}
        </div>
    );
}

const inp = 'w-full px-3 py-2 text-sm font-bold';
const bdr = { border: '3px solid var(--border)', borderRadius: 0 };

/* ─── gemstone row ─── */
function GemstoneRow({ gem, index, onChange, onRemove }: {
    gem: Gemstone; index: number;
    onChange: (g: Gemstone) => void;
    onRemove: () => void;
}) {
    return (
        <div className="p-3 mb-2" style={{ background: 'var(--muted)', border: '3px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-2.5">
                <span className="section-label" style={{ color: 'var(--gold)' }}>Stone {index + 1}</span>
                <button type="button" onClick={onRemove} className="text-[11px] px-2 py-0.5 transition-colors hover:bg-black hover:text-white" style={{ color: '#000', border: '2px solid #000', fontWeight: 'bold' }}>REMOVE</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <Field label="Stone type">
                    <select value={gem.stone_type} onChange={e => onChange({ ...gem, stone_type: e.target.value as StoneType })} className={inp} style={bdr}>
                        {STONE_TYPES.map(t => <option key={t} value={t}>{STONE_TYPE_LABELS[t]}</option>)}
                    </select>
                </Field>
                <Field label="Category">
                    <select value={gem.category} onChange={e => onChange({ ...gem, category: e.target.value as StoneCategory })} className={inp} style={bdr}>
                        <option value="central">Central</option>
                        <option value="side">Side</option>
                    </select>
                </Field>
                <Field label="Quantity">
                    <input type="number" min="1" placeholder="1" value={gem.quantity || ''} onChange={e => onChange({ ...gem, quantity: parseInt(e.target.value) || 1 })} className={inp} style={bdr} />
                </Field>
                <Field label="Carat (ct)">
                    <input type="number" step="0.01" min="0" placeholder="0.00" value={gem.carat || ''} onChange={e => onChange({ ...gem, carat: parseFloat(e.target.value) || 0 })} className={inp} style={bdr} />
                </Field>
                <Field label="Diameter (mm)">
                    <input type="number" step="0.1" min="0" placeholder="0.0" value={gem.diameter_mm || ''} onChange={e => onChange({ ...gem, diameter_mm: parseFloat(e.target.value) || undefined })} className={inp} style={bdr} />
                </Field>
            </div>
        </div>
    );
}

/* ─── summary panel ─── */
// Removed SummaryPanel code, not needed with new grid layout.

/* ─── inner component ─── */
function OrderForm() {
    const router = useRouter();
    const { addOrder, customers, addCustomer } = useStore();

    const searchParams = useSearchParams();
    const prefilledCustomer = searchParams.get('customer');
    const [customerId, setCustomerId] = useState(prefilledCustomer ?? '');
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

    const customerName = isNewCustomer ? newCustomerName : (customers.find(c => c.id === customerId)?.name ?? '');

    return (
        <AppShell>
            <div className="max-w-6xl mx-auto">
                {/* Header & Breadcrumbs */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <Link href="/orders" className="p-1.5 rounded-md hover:opacity-70 transition-opacity" style={{ color: 'var(--muted-foreground)' }}>
                            <ArrowLeft style={{ width: 16, height: 16 }} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black uppercase tracking-tight">New Order</h1>
                        </div>
                    </div>
                    {/* Horizontal process breadcrumbs */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-black uppercase overflow-x-auto pb-2 md:pb-0">
                        {ORDER_STAGES.map((s, i) => (
                            <div key={s.key} className="flex items-center gap-1.5 whitespace-nowrap">
                                <span style={{
                                    color: status === s.key ? 'var(--blue)' : 'var(--muted-foreground)',
                                    borderBottom: status === s.key ? '2px solid var(--blue)' : 'none',
                                    paddingBottom: '2px'
                                }}>
                                    {s.label}
                                </span>
                                {i < ORDER_STAGES.length - 1 && <ArrowRight style={{ width: 10, height: 10, color: 'var(--muted-foreground)' }} />}
                            </div>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    
                    {/* Setup Row */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="w-full md:w-1/2 lg:w-1/3">
                            <Field label="Order status">
                                <select value={status} onChange={e => setStatus(e.target.value as OrderStatus)} className={inp} style={{ ...bdr, fontSize: '16px' }}>
                                    {ORDER_STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                                </select>
                            </Field>
                        </div>
                    </div>

                    {/* Default order fields (Customer) */}
                    <section className="glass-card p-5 mb-6" style={{ borderTop: '6px solid var(--foreground)' }}>
                        <div className="flex items-center gap-2 mb-4">
                            <User style={{ width: 14, height: 14, color: 'var(--foreground)' }} />
                            <span className="section-label" style={{ color: 'var(--foreground)' }}>Default order fields (Customer)</span>
                        </div>
                        
                        <div className="flex p-0.5 mb-4 max-w-sm" style={{ background: 'var(--muted)', border: '3px solid var(--border)' }}>
                            <button type="button" onClick={() => setIsNewCustomer(false)} className="flex-1 py-1.5 text-xs font-black uppercase transition-all"
                                style={{ background: !isNewCustomer ? '#000' : 'transparent', color: !isNewCustomer ? '#fff' : 'var(--muted-foreground)' }}>
                                Existing
                            </button>
                            <button type="button" onClick={() => setIsNewCustomer(true)} className="flex-1 py-1.5 text-xs font-black uppercase transition-all"
                                style={{ background: isNewCustomer ? '#000' : 'transparent', color: isNewCustomer ? '#fff' : 'var(--muted-foreground)' }}>
                                New Customer
                            </button>
                        </div>

                        {!isNewCustomer ? (
                            <div className="max-w-sm">
                                <Field label="Select customer *">
                                    <select value={customerId} onChange={e => setCustomerId(e.target.value)} className={inp} style={bdr}>
                                        <option value="">— Select —</option>
                                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}{c.phone ? ` (${c.phone})` : ''}</option>)}
                                    </select>
                                </Field>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                                <Field label="Name *">
                                    <input value={newCustomerName} onChange={e => setNewCustomerName(e.target.value)} placeholder="Full name" className={inp} style={bdr} />
                                </Field>
                                <Field label="Phone">
                                    <input value={newCustomerPhone} onChange={e => setNewCustomerPhone(e.target.value)} placeholder="+39 02 …" className={inp} style={bdr} />
                                </Field>
                            </div>
                        )}
                    </section>

                    {/* Masonry-like Grid for Stage/Detail Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start mb-8">

                        {/* Order Details (Item) */}
                        <section className="glass-card p-4">
                            <div className="flex items-center gap-2 mb-4" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                                <Package style={{ width: 14, height: 14, color: 'var(--foreground)' }} />
                                <span className="text-sm font-black uppercase">Item Details</span>
                            </div>
                            <div className="flex flex-col gap-3">
                                <Field label="Item type">
                                    <select value={itemType} onChange={e => setItemType(e.target.value as ItemType)} className={inp} style={bdr}>
                                        {ITEM_TYPES.map(t => <option key={t} value={t}>{ITEM_TYPE_LABELS[t]}</option>)}
                                    </select>
                                </Field>
                                <Field label="Item ID (optional)">
                                    <input value={itemId} onChange={e => setItemId(e.target.value)} placeholder="e.g. RING-042" className={inp} style={bdr} />
                                </Field>
                                <Field label="Starting Weight (g)">
                                    <input type="number" step="0.01" value={startWeight} onChange={e => setStartWeight(e.target.value)} placeholder="0.00" className={inp} style={bdr} />
                                </Field>
                            </div>
                        </section>

                        {/* Casting (Materials) */}
                        <section className="glass-card p-4">
                            <div className="flex items-center gap-2 mb-4" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                                <span className="text-sm font-black uppercase">Metals & Alloy</span>
                            </div>
                            <Label>Select Materials</Label>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {MATERIAL_TYPES.map(m => (
                                    <button key={m} type="button" onClick={() => toggleMaterial(m)}
                                        className="px-3 py-1.5 text-xs font-black uppercase transition-all w-full text-left"
                                        style={{
                                            background: materials.includes(m) ? '#000' : 'var(--muted)',
                                            color: materials.includes(m) ? '#fff' : 'var(--muted-foreground)',
                                            border: `3px solid ${materials.includes(m) ? '#000' : 'transparent'}`
                                        }}>
                                        {MATERIAL_LABELS[m]}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Stone Setting (Gemstones) */}
                        <section className="glass-card p-4 md:col-span-2 lg:col-span-1">
                            <div className="flex items-center justify-between mb-4" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                                <div className="flex items-center gap-2">
                                    <Gem style={{ width: 14, height: 14, color: 'var(--foreground)' }} />
                                    <span className="text-sm font-black uppercase">Stone Setting</span>
                                </div>
                                <button type="button" onClick={addGemstone} className="flex items-center gap-1 text-[10px] px-2 py-1 font-black uppercase"
                                    style={{ background: '#000', color: '#fff', border: '2px solid #000' }}>
                                    <Plus style={{ width: 10, height: 10 }} /> Add Stone
                                </button>
                            </div>
                            {gemstones.length === 0 ? (
                                <div className="text-xs text-center py-6 font-bold" style={{ color: 'var(--muted-foreground)' }}>No stones required.</div>
                            ) : (
                                <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
                                    {gemstones.map((gem, i) => (
                                        <GemstoneRow key={gem.id} gem={gem} index={i}
                                            onChange={updated => setGemstones(prev => prev.map((g, j) => j === i ? updated : g))}
                                            onRemove={() => setGemstones(prev => prev.filter((_, j) => j !== i))} />
                                    ))}
                                </div>
                            )}
                        </section>
                        
                        {/* Timeline & Price */}
                        <section className="glass-card p-4">
                            <div className="flex items-center gap-2 mb-4" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                                <Calendar style={{ width: 14, height: 14, color: 'var(--foreground)' }} />
                                <span className="text-sm font-black uppercase">Timeline & Pricing</span>
                            </div>
                            <div className="flex flex-col gap-3">
                                <Field label="Price (€)">
                                    <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" className={inp} style={bdr} />
                                </Field>
                                <Field label="Due Date">
                                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inp} style={bdr} />
                                </Field>
                            </div>
                        </section>

                        {/* Additional Information */}
                        <section className="glass-card p-4 md:col-span-2 lg:col-span-1">
                            <div className="flex items-center gap-2 mb-4" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                                <span className="text-sm font-black uppercase">Additional Information</span>
                            </div>
                            <div className="flex flex-col gap-3">
                                <Field label="Notes & Specifications">
                                    <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Special instructions, client preferences, setting details…" rows={4}
                                        className="w-full px-3 py-2 text-sm font-bold resize-y" style={bdr} />
                                </Field>
                            </div>
                        </section>

                    </div>

                    {/* Submit Bar */}
                    <div className="flex justify-end pt-4 mb-4" style={{ borderTop: '2px solid var(--border)' }}>
                        <button type="submit" disabled={loading} className="py-3 px-8 font-black text-sm uppercase tracking-widest"
                            style={{ background: 'var(--blue)', color: '#fff', border: '3px solid #000', opacity: loading ? 0.7 : 1 }}>
                            {loading ? 'Creating Order…' : 'Create Order'}
                        </button>
                    </div>

                </form>
            </div>
        </AppShell>
    );
}

/* ─── main page ─── */
export default function NewOrderPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-sm font-bold">Loading...</div>}>
            <OrderForm />
        </Suspense>
    );
}
