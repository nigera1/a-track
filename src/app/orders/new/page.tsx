'use client';

import { AppShell } from '@/components/app-shell';
import { useStore } from '@/lib/store';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Gem, ArrowLeft, User, Package, Calendar, Coins } from 'lucide-react';
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

const inp = 'w-full px-3 py-2 rounded-md text-sm';
const bdr = { border: '1px solid var(--border)' };

/* ─── gemstone row ─── */
function GemstoneRow({ gem, index, onChange, onRemove }: {
    gem: Gemstone; index: number;
    onChange: (g: Gemstone) => void;
    onRemove: () => void;
}) {
    return (
        <div className="rounded-md p-3" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-2.5">
                <span className="section-label" style={{ color: 'var(--gold)' }}>Stone {index + 1}</span>
                <button type="button" onClick={onRemove} className="text-[11px] px-2 py-0.5 rounded transition-colors hover:bg-red-500/10" style={{ color: '#f87171', border: '1px solid rgba(239,68,68,0.15)' }}>Remove</button>
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
function SummaryPanel({
    itemType, status, materials, price, dueDate, gemstones, customerName
}: {
    itemType: ItemType; status: OrderStatus; materials: MaterialType[];
    price: string; dueDate: string; gemstones: Gemstone[]; customerName: string;
}) {
    const stage = ORDER_STAGES.find(s => s.key === status);
    const central = gemstones.filter(g => g.category === 'central');
    const side = gemstones.filter(g => g.category === 'side');

    return (
        <div className="sticky top-4 rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)', background: 'var(--muted)' }}>
                <div className="section-label">Order Summary</div>
            </div>
            <div className="p-4 flex flex-col gap-4" style={{ background: 'var(--card)' }}>
                {/* Item */}
                <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'var(--muted)' }}>
                        <Package style={{ width: 13, height: 13, color: 'var(--gold)' }} />
                    </div>
                    <div>
                        <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Item</div>
                        <div className="text-sm font-medium">{ITEM_TYPE_LABELS[itemType]}</div>
                        {materials.length > 0 && <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{materials.map(m => MATERIAL_LABELS[m]).join(', ')}</div>}
                    </div>
                </div>

                {/* Customer */}
                {customerName && (
                    <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'var(--muted)' }}>
                            <User style={{ width: 13, height: 13, color: 'var(--gold)' }} />
                        </div>
                        <div>
                            <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Customer</div>
                            <div className="text-sm font-medium">{customerName}</div>
                        </div>
                    </div>
                )}

                {/* Stage */}
                <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'var(--muted)' }}>
                        <div className="w-2 h-2 rounded-full" style={{ background: stage?.color ?? '#888' }} />
                    </div>
                    <div>
                        <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Starting Stage</div>
                        <div className="text-sm font-medium">{stage?.label ?? '—'}</div>
                    </div>
                </div>

                {/* Price / Due */}
                {(price || dueDate) && (
                    <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'var(--muted)' }}>
                            <Coins style={{ width: 13, height: 13, color: 'var(--gold)' }} />
                        </div>
                        <div>
                            {price && <div className="text-sm font-semibold" style={{ color: 'var(--gold)' }}>{formatCurrency(parseFloat(price))}</div>}
                            {dueDate && <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Due {new Date(dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>}
                        </div>
                    </div>
                )}

                {/* Gemstones */}
                {gemstones.length > 0 && (
                    <div className="pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                        <div className="flex items-center gap-1.5 mb-2">
                            <Gem style={{ width: 11, height: 11, color: 'var(--gold)' }} />
                            <span className="section-label">Gemstones</span>
                        </div>
                        {central.length > 0 && <div className="text-xs mb-0.5"><span style={{ color: 'var(--gold)' }}>Central:</span> {central.map(g => `${STONE_TYPE_LABELS[g.stone_type]}${g.carat ? ` ${g.carat}ct` : ''}${g.diameter_mm ? ` ⌀${g.diameter_mm}mm` : ''}`).join(', ')}</div>}
                        {side.length > 0 && <div className="text-xs"><span style={{ color: 'var(--muted-foreground)' }}>Side:</span> {side.reduce((n, g) => n + g.quantity, 0)} stones</div>}
                    </div>
                )}

                {!customerName && !price && !dueDate && gemstones.length === 0 && (
                    <div className="text-xs text-center py-4" style={{ color: 'var(--muted-foreground)' }}>Fill in the form to preview</div>
                )}
            </div>
        </div>
    );
}

/* ─── main page ─── */
export default function NewOrderPage() {
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
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/orders" className="p-1.5 rounded-md hover:opacity-70 transition-opacity" style={{ color: 'var(--muted-foreground)' }}>
                        <ArrowLeft style={{ width: 16, height: 16 }} />
                    </Link>
                    <div>
                        <h1 className="text-lg font-semibold">New Order</h1>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Fill in the details below</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start">

                        {/* ── LEFT: Form ── */}
                        <div className="flex flex-col gap-4">

                            {/* Customer */}
                            <section className="glass-card p-4">
                                <div className="flex items-center gap-2 mb-4" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                                    <User style={{ width: 14, height: 14, color: 'var(--gold)' }} />
                                    <span className="section-label">Customer</span>
                                </div>
                                <div className="flex rounded-md p-0.5 mb-4" style={{ background: 'var(--muted)' }}>
                                    <button type="button" onClick={() => setIsNewCustomer(false)} className="flex-1 py-1.5 rounded text-xs font-medium transition-all"
                                        style={{ background: !isNewCustomer ? 'var(--gold)' : 'transparent', color: !isNewCustomer ? '#111' : 'var(--muted-foreground)' }}>
                                        Existing
                                    </button>
                                    <button type="button" onClick={() => setIsNewCustomer(true)} className="flex-1 py-1.5 rounded text-xs font-medium transition-all"
                                        style={{ background: isNewCustomer ? 'var(--gold)' : 'transparent', color: isNewCustomer ? '#111' : 'var(--muted-foreground)' }}>
                                        New Customer
                                    </button>
                                </div>
                                {!isNewCustomer ? (
                                    <Field label="Select customer">
                                        <select value={customerId} onChange={e => setCustomerId(e.target.value)} className={inp} style={bdr}>
                                            <option value="">— Select —</option>
                                            {customers.map(c => <option key={c.id} value={c.id}>{c.name}{c.phone ? ` (${c.phone})` : ''}</option>)}
                                        </select>
                                    </Field>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field label="Name *">
                                            <input value={newCustomerName} onChange={e => setNewCustomerName(e.target.value)} placeholder="Full name" className={inp} style={bdr} />
                                        </Field>
                                        <Field label="Phone">
                                            <input value={newCustomerPhone} onChange={e => setNewCustomerPhone(e.target.value)} placeholder="+39 02 …" className={inp} style={bdr} />
                                        </Field>
                                    </div>
                                )}
                            </section>

                            {/* Item */}
                            <section className="glass-card p-4">
                                <div className="flex items-center gap-2 mb-4" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                                    <Package style={{ width: 14, height: 14, color: 'var(--gold)' }} />
                                    <span className="section-label">Item Details</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="Item type">
                                        <select value={itemType} onChange={e => setItemType(e.target.value as ItemType)} className={inp} style={bdr}>
                                            {ITEM_TYPES.map(t => <option key={t} value={t}>{ITEM_TYPE_LABELS[t]}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Item ID (optional)">
                                        <input value={itemId} onChange={e => setItemId(e.target.value)} placeholder="e.g. RING-042" className={inp} style={bdr} />
                                    </Field>
                                    <Field label="Starting Stage">
                                        <select value={status} onChange={e => setStatus(e.target.value as OrderStatus)} className={inp} style={bdr}>
                                            {ORDER_STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Starting Weight (g)">
                                        <input type="number" step="0.01" value={startWeight} onChange={e => setStartWeight(e.target.value)} placeholder="0.00" className={inp} style={bdr} />
                                    </Field>
                                </div>
                                <div className="mt-3">
                                    <Label>Materials</Label>
                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                        {MATERIAL_TYPES.map(m => (
                                            <button key={m} type="button" onClick={() => toggleMaterial(m)}
                                                className="px-3 py-1 rounded text-xs font-medium transition-all"
                                                style={{
                                                    background: materials.includes(m) ? 'rgba(212,168,50,0.15)' : 'var(--muted)',
                                                    color: materials.includes(m) ? 'var(--gold)' : 'var(--muted-foreground)',
                                                    border: `1px solid ${materials.includes(m) ? 'rgba(212,168,50,0.3)' : 'transparent'}`
                                                }}>
                                                {MATERIAL_LABELS[m]}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            {/* Pricing & Date */}
                            <section className="glass-card p-4">
                                <div className="flex items-center gap-2 mb-4" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                                    <Calendar style={{ width: 14, height: 14, color: 'var(--gold)' }} />
                                    <span className="section-label">Pricing & Timeline</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="Price (€)">
                                        <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" className={inp} style={bdr} />
                                    </Field>
                                    <Field label="Due Date">
                                        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inp} style={bdr} />
                                    </Field>
                                </div>
                                <div className="mt-3">
                                    <Label>Notes</Label>
                                    <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Special instructions, client preferences…" rows={3}
                                        className="w-full px-3 py-2 rounded-md text-sm resize-none" style={bdr} />
                                </div>
                            </section>

                            {/* Gemstones */}
                            <section className="glass-card p-4">
                                <div className="flex items-center justify-between mb-4" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                                    <div className="flex items-center gap-2">
                                        <Gem style={{ width: 14, height: 14, color: 'var(--gold)' }} />
                                        <span className="section-label">Gemstones</span>
                                        {gemstones.length > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: 'rgba(212,168,50,0.15)', color: 'var(--gold)' }}>{gemstones.length}</span>}
                                    </div>
                                    <button type="button" onClick={addGemstone} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded font-medium"
                                        style={{ background: 'rgba(212,168,50,0.1)', color: 'var(--gold)', border: '1px solid rgba(212,168,50,0.2)' }}>
                                        <Plus style={{ width: 12, height: 12 }} /> Add Stone
                                    </button>
                                </div>
                                {gemstones.length === 0 ? (
                                    <div className="text-xs text-center py-6" style={{ color: 'var(--muted-foreground)' }}>No gemstones added — click Add Stone</div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {gemstones.map((gem, i) => (
                                            <GemstoneRow key={gem.id} gem={gem} index={i}
                                                onChange={updated => setGemstones(prev => prev.map((g, j) => j === i ? updated : g))}
                                                onRemove={() => setGemstones(prev => prev.filter((_, j) => j !== i))} />
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* Submit */}
                            <button type="submit" disabled={loading} className="w-full py-2.5 rounded-md font-semibold text-sm"
                                style={{ background: 'var(--gold)', color: '#111', opacity: loading ? 0.7 : 1 }}>
                                {loading ? 'Creating…' : 'Create Order'}
                            </button>
                        </div>

                        {/* ── RIGHT: Summary ── */}
                        <div className="hidden lg:block">
                            <SummaryPanel
                                itemType={itemType}
                                status={status}
                                materials={materials}
                                price={price}
                                dueDate={dueDate}
                                gemstones={gemstones}
                                customerName={customerName}
                            />
                        </div>
                    </div>
                </form>
            </div>
        </AppShell>
    );
}
