'use client';

import { AppShell } from '@/components/app-shell';
import { useStore } from '@/lib/store';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, ArrowRight, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import {
    ItemType, MaterialType, OrderStatus, StoneCategory, StoneType,
    ITEM_TYPE_LABELS, MATERIAL_LABELS, STONE_TYPE_LABELS, ORDER_STAGES, Gemstone
} from '@/types';
import { v4 as uuidv4 } from 'uuid';

const ITEM_TYPES = Object.keys(ITEM_TYPE_LABELS) as ItemType[];
const MATERIAL_TYPES = Object.keys(MATERIAL_LABELS) as MaterialType[];
const STONE_TYPES = Object.keys(STONE_TYPE_LABELS) as StoneType[];

function Label({ children }: { children: React.ReactNode }) {
    return (
        <label className="block text-sm font-semibold text-slate-800 mb-1.5">{children}</label>
    );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div>
            <Label>{label}{required && <span className="text-red-500 ml-1">*</span>}</Label>
            {children}
        </div>
    );
}

const inpClass = "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow bg-white text-slate-900";

function GemstoneRow({ gem, index, onChange, onRemove }: {
    gem: Gemstone; index: number;
    onChange: (g: Gemstone) => void;
    onRemove: () => void;
}) {
    return (
        <div className="p-3 mb-3 bg-slate-50 rounded-lg border border-slate-200 relative group">
            <button type="button" onClick={onRemove} className="absolute top-2 right-2 text-slate-400 hover:text-red-500 transition-colors">
                <Trash2 style={{ width: 14, height: 14 }} />
            </button>
            <div className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Stone {index + 1}</div>
            <div className="grid grid-cols-2 gap-3">
                <Field label="Type">
                    <select value={gem.stone_type} onChange={e => onChange({ ...gem, stone_type: e.target.value as StoneType })} className={inpClass}>
                        {STONE_TYPES.map(t => <option key={t} value={t}>{STONE_TYPE_LABELS[t]}</option>)}
                    </select>
                </Field>
                <Field label="Category">
                    <select value={gem.category} onChange={e => onChange({ ...gem, category: e.target.value as StoneCategory })} className={inpClass}>
                        <option value="central">Central</option>
                        <option value="side">Side</option>
                    </select>
                </Field>
                <Field label="Qty">
                    <input type="number" min="1" value={gem.quantity || ''} onChange={e => onChange({ ...gem, quantity: parseInt(e.target.value) || 1 })} className={inpClass} />
                </Field>
                <Field label="Carat">
                    <input type="number" step="0.01" min="0" value={gem.carat || ''} onChange={e => onChange({ ...gem, carat: parseFloat(e.target.value) || 0 })} className={inpClass} />
                </Field>
            </div>
        </div>
    );
}

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

    return (
        <AppShell>
            <div className="max-w-[1200px] mx-auto pb-12">
                
                {/* Header & Breadcrumbs Row */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 mt-2">
                    <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">New Order</h1>
                    
                    {/* Horizontal process breadcrumbs matching mockup */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-slate-500 overflow-x-auto uppercase">
                        {ORDER_STAGES.map((s, i) => {
                            const isActive = status === s.key;
                            return (
                                <div key={s.key} className="flex items-center gap-1.5 whitespace-nowrap">
                                    <span className={`transition-colors cursor-pointer ${isActive ? 'text-blue-600 font-bold border-b-[2.5px] border-blue-600 pb-0.5' : 'hover:text-slate-800'}`}
                                          onClick={() => setStatus(s.key)}>
                                        {s.label}
                                    </span>
                                    {i < ORDER_STAGES.length - 1 && <ArrowRight style={{ width: 10, height: 10 }} className="text-slate-400" />}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    
                    {/* Top Selects Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <Field label="Template">
                            <select value={itemType} onChange={e => setItemType(e.target.value as ItemType)} className={inpClass}>
                                {ITEM_TYPES.map(t => <option key={t} value={t}>{ITEM_TYPE_LABELS[t]}</option>)}
                            </select>
                        </Field>
                        <Field label="Order status">
                            <select value={status} onChange={e => setStatus(e.target.value as OrderStatus)} className={inpClass}>
                                {ORDER_STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                            </select>
                        </Field>
                    </div>

                    {/* Default order fields (Customer) */}
                    <section className="bg-white rounded-[10px] border border-slate-200 shadow-sm p-6 mb-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[16px] font-bold text-slate-900">Default order fields</h3>
                            <div className="flex bg-slate-100 p-0.5 rounded-md border border-slate-200">
                                <button type="button" onClick={() => setIsNewCustomer(false)} 
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-[4px] transition-colors ${!isNewCustomer ? 'bg-white shadow-sm text-slate-900 ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>
                                    Existing
                                </button>
                                <button type="button" onClick={() => setIsNewCustomer(true)} 
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-[4px] transition-colors ${isNewCustomer ? 'bg-white shadow-sm text-slate-900 ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>
                                    New Customer
                                </button>
                            </div>
                        </div>

                        {!isNewCustomer ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Field label="CRM Customer ID" required>
                                    <select value={customerId} onChange={e => setCustomerId(e.target.value)} className={inpClass}>
                                        <option value="">— Select Customer —</option>
                                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}{c.phone ? ` (${c.phone})` : ''}</option>)}
                                    </select>
                                </Field>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Field label="Full Name" required>
                                    <input value={newCustomerName} onChange={e => setNewCustomerName(e.target.value)} placeholder="e.g. Nikita Ivanov" className={inpClass} />
                                </Field>
                                <Field label="Phone Number">
                                    <input value={newCustomerPhone} onChange={e => setNewCustomerPhone(e.target.value)} placeholder="+1 234 567 890" className={inpClass} />
                                </Field>
                            </div>
                        )}
                    </section>

                    {/* 3x2 Masonry Grid mimicking the mockup */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">

                        {/* 3D (Item details & Weight) */}
                        <section className="bg-white rounded-[10px] border border-slate-200 shadow-sm p-5 pb-6">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-[16px] font-bold text-slate-900 tracking-tight">3D</h3>
                                <AlertCircle className="text-amber-500" style={{ width: 16, height: 16 }} />
                            </div>
                            <div className="flex flex-col gap-5">
                                <Field label="Item ID (optional)">
                                    <input value={itemId} onChange={e => setItemId(e.target.value)} placeholder="e.g. RING-042" className={inpClass} />
                                </Field>
                                <Field label="Estimated Weight (g)" required>
                                    <input type="number" step="0.01" value={startWeight} onChange={e => setStartWeight(e.target.value)} placeholder="0.00" className={inpClass} />
                                </Field>
                            </div>
                        </section>

                        {/* Casting (Materials) */}
                        <section className="bg-white rounded-[10px] border border-slate-200 shadow-sm p-5 pb-6">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-[16px] font-bold text-slate-900 tracking-tight">Casting</h3>
                            </div>
                            <Label>Alloy <span className="text-red-500 ml-1">*</span></Label>
                            <div className="grid grid-cols-1 gap-2 mt-1 max-h-[145px] overflow-y-auto pr-2 custom-scrollbar">
                                {MATERIAL_TYPES.map(m => (
                                    <button key={m} type="button" onClick={() => toggleMaterial(m)}
                                        className="text-left w-full px-3 py-2 text-[13px] rounded-md transition-all border flex items-center justify-between"
                                        style={{
                                            background: materials.includes(m) ? '#f8fafc' : '#fff',
                                            borderColor: materials.includes(m) ? '#cbd5e1' : 'var(--border)',
                                            color: materials.includes(m) ? '#0f172a' : 'var(--foreground)',
                                            boxShadow: materials.includes(m) ? '0 1px 2px 0 rgb(0 0 0 / 0.05)' : 'none'
                                        }}>
                                        <span className={materials.includes(m) ? 'font-semibold' : 'font-normal'}>{MATERIAL_LABELS[m]}</span>
                                        {materials.includes(m) && <CheckCircle2 className="w-4 h-4 text-slate-600" />}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Stone Setting */}
                        <section className="bg-white rounded-[10px] border border-slate-200 shadow-sm p-5 flex flex-col">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-[16px] font-bold text-slate-900 tracking-tight">Stone Setting</h3>
                                <button type="button" onClick={addGemstone} className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
                                    <Plus className="w-3 h-3" /> Add Stone
                                </button>
                            </div>
                            {gemstones.length === 0 ? (
                                <div className="text-[13px] text-slate-400 text-center py-6">No stones requested.</div>
                            ) : (
                                <div className="flex-1 overflow-y-auto pr-1">
                                    {gemstones.map((gem, i) => (
                                        <GemstoneRow key={gem.id} gem={gem} index={i}
                                            onChange={updated => setGemstones(prev => prev.map((g, j) => j === i ? updated : g))}
                                            onRemove={() => setGemstones(prev => prev.filter((_, j) => j !== i))} />
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Sanding & Formatting (Timeline) */}
                        <section className="bg-white rounded-[10px] border border-slate-200 shadow-sm p-5">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-[16px] font-bold text-slate-900 tracking-tight">Sanding</h3>
                                <CheckCircle2 className="text-green-500" style={{ width: 16, height: 16 }} fill="#ecfdf5" />
                            </div>
                            <div className="flex flex-col gap-4">
                                <Field label="Agreed Price (€)">
                                    <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" className={inpClass} />
                                </Field>
                                <Field label="Due Date">
                                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inpClass} />
                                </Field>
                            </div>
                        </section>

                        {/* Polishing / Additional Context */}
                        <section className="bg-white rounded-[10px] border border-slate-200 shadow-sm p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[16px] font-bold text-slate-900 tracking-tight">Polishing</h3>
                            </div>
                            <div className="flex flex-col h-full">
                                <Field label="Notes">
                                    <textarea value={notes} onChange={e => setNotes(e.target.value)} 
                                        placeholder="Special polishing instructions..." 
                                        className={`${inpClass} min-h-[105px] resize-y`} />
                                </Field>
                            </div>
                        </section>

                        {/* QC */}
                        <section className="bg-white rounded-[10px] border border-slate-200 shadow-sm p-5">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-[16px] font-bold text-slate-900 tracking-tight">QC</h3>
                            </div>
                            <div className="flex flex-col gap-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300 pointer-events-none" checked onChange={() => {}} />
                                    <span className="text-[13px] font-medium text-slate-800">Process complete</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300 pointer-events-none" checked onChange={() => {}} />
                                    <span className="text-[13px] font-medium text-slate-800">Process casting</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300 pointer-events-none" checked onChange={() => {}} />
                                    <span className="text-[13px] font-medium text-slate-800">Quality polishing</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300 pointer-events-none" disabled />
                                    <span className="text-[13px] font-medium text-slate-800">Quality control</span>
                                </label>
                            </div>
                        </section>

                    </div>

                    {/* Submit Bar */}
                    <div className="flex justify-end pt-2">
                        <button type="submit" disabled={loading} 
                            className="bg-[#2A85FF] hover:bg-[#1D74E3] text-white font-medium px-6 py-2 rounded-[8px] transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-70 disabled:cursor-not-allowed">
                            {loading ? 'Creating...' : 'Create Order'}
                        </button>
                    </div>

                </form>
            </div>
            
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
            `}</style>
        </AppShell>
    );
}

export default function NewOrderPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-sm font-medium">Loading interface...</div>}>
            <OrderForm />
        </Suspense>
    );
}
