'use client';

import { AppShell } from '@/components/app-shell';
import { useStore } from '@/lib/store';
import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, ArrowRight, CheckCircle2, AlertCircle, Trash2, Check, X } from 'lucide-react';
import {
    ItemType, MaterialType, OrderStatus,
    ITEM_TYPE_LABELS, MATERIAL_LABELS, ORDER_STAGES
} from '@/types';

const ITEM_TYPES = Object.keys(ITEM_TYPE_LABELS) as ItemType[];
const MATERIAL_TYPES = Object.keys(MATERIAL_LABELS) as MaterialType[];

function Label({ children }: { children: React.ReactNode }) {
    return (
        <label className="block text-[13px] font-bold text-[#333] mb-1.5">{children}</label>
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

const inpClass = "w-full rounded-[6px] border border-[#e2e8f0] px-3 py-[9px] text-[14px] text-slate-800 focus:outline-none focus:border-blue-400 bg-white transition-colors appearance-none";

function SelectField({ label, required, options, value, onChange }: { label: string; required?: boolean; options: {value: string, label: string}[], value: string, onChange: (val: string) => void }) {
    return (
        <div>
            <Label>{label}{required && <span className="text-red-500 ml-1">*</span>}</Label>
            <div className="relative">
                <select value={value} onChange={e => onChange(e.target.value)} className={`${inpClass} pr-10`}>
                    <option value="">— Select —</option>
                    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                     <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>
                </div>
            </div>
        </div>
    );
}

function PillSelect({ options, value, onChange, placeholder }: { options: {value: string, label: string}[], value: string, onChange: (val: string) => void, placeholder?: string }) {
    const [open, setOpen] = useState(false);
    
    // Close on blur hack for POC
    return (
        <div className="relative" onMouseLeave={() => setOpen(false)}>
            <div 
                className={`${inpClass} min-h-[38px] flex items-center cursor-pointer`}
                onClick={() => setOpen(!open)}
            >
                {value ? (
                    <div className="bg-slate-100 text-slate-700 text-[13px] px-2 py-0.5 rounded-[6px] flex items-center gap-1 font-medium transition-colors hover:bg-slate-200">
                        {options.find(o => o.value === value)?.label || value}
                        <button type="button" onClick={(e) => { e.stopPropagation(); onChange(''); }} className="hover:text-slate-900 ml-0.5 text-slate-500">
                           <X style={{ width: 12, height: 12 }} strokeWidth={2.5} />
                        </button>
                    </div>
                ) : (
                    <span className="text-slate-400">{placeholder || '— Select —'}</span>
                )}
                
                {/* Optional dropdown arrow if desired, omitted to match pure input look */}
            </div>
            
            {open && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-[8px] shadow-lg py-1.5">
                    {options.map(o => (
                        <div 
                            key={o.value} 
                            className="px-3 py-[6px] hover:bg-slate-50 cursor-pointer text-[14px] flex items-center gap-2 text-slate-700 font-medium"
                            onClick={() => { onChange(o.value); setOpen(false); }}
                        >
                            <div className="w-4 flex justify-center">
                                {value === o.value && <Check style={{ width: 16, height: 16 }} className="text-slate-400" strokeWidth={3} />}
                            </div>
                            <span>{o.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function OrderForm() {
    const router = useRouter();
    const { addOrder } = useStore();

    const [itemType, setItemType] = useState<ItemType>('ring');
    const [status, setStatus] = useState<OrderStatus>('setting');
    const [crmOrderId, setCrmOrderId] = useState('');
    const [jobId, setJobId] = useState('');
    const [alloy, setAlloy] = useState('');
    const [settingCentral, setSettingCentral] = useState('round');
    const [settingSmall, setSettingSmall] = useState('castle');
    const [finish, setFinish] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!jobId) { toast.error('Job ID is required'); return; }
        setLoading(true);

        const order = addOrder({
            customer_id: crmOrderId || 'c1', // Provide fallback for POC
            item_type: itemType,
            item_id: jobId,
            status,
            materials: alloy ? [alloy as MaterialType] : [],
        });

        toast.success(`Order created successfully!`);
        router.push(`/orders/${order.id}`);
    }

    return (
        <AppShell>
            <div className="max-w-[1200px] mx-auto pb-12 pt-2 md:pt-4 px-3 md:px-0">
                
                {/* Header & Breadcrumbs Row */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                    <h1 className="text-[24px] font-bold text-slate-900 tracking-tight">New Order</h1>
                    
                    {/* Horizontal process breadcrumbs matching mockup */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-slate-600 overflow-x-auto scroolbar-hide">
                        {ORDER_STAGES.map((s, i) => {
                            const isActive = status === s.key;
                            return (
                                <div key={s.key} className="flex items-center gap-1.5 whitespace-nowrap">
                                    <span className={`transition-colors cursor-pointer ${isActive ? 'text-[#1C7ED6] font-bold border-b-[2px] border-[#1C7ED6] pb-0.5' : 'hover:text-slate-900'}`}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <SelectField 
                            label="Template" 
                            options={[{value: 'default', label: 'Default Production Process'}]} 
                            value="default" 
                            onChange={() => {}} 
                        />
                        <div className="hidden md:block">
                            <SelectField 
                                label="Order status" 
                                options={ORDER_STAGES.map(s => ({value: s.key, label: s.label}))} 
                                value={status} 
                                onChange={v => setStatus(v as OrderStatus)} 
                            />
                        </div>
                    </div>

                    {/* Default order fields */}
                    <section className="bg-white rounded-[8px] border border-slate-200 shadow-sm p-4 md:p-5 pb-6 mb-4">
                        <h3 className="text-[17px] font-bold text-slate-900 mb-4 tracking-tight">Default order fields</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="CRM Order ID">
                                <input value={crmOrderId} onChange={e => setCrmOrderId(e.target.value)} placeholder="" className={inpClass} />
                            </Field>
                            <Field label="Job ID" required>
                                <input value={jobId} onChange={e => setJobId(e.target.value)} placeholder="" className={inpClass} />
                            </Field>
                        </div>
                    </section>

                    {/* Mobile-style simplified cards grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">

                        {/* 3D (Empty Placeholder) */}
                        <section className="bg-white rounded-[8px] border border-slate-200 shadow-sm p-4 flex flex-col h-full justify-center">
                            <h3 className="text-[17px] font-bold text-slate-900 tracking-tight m-0">3D</h3>
                        </section>

                        {/* Casting */}
                        <section className="bg-white rounded-[8px] border border-slate-200 shadow-sm p-4 md:p-5 pb-5 flex flex-col h-full">
                            <h3 className="text-[17px] font-bold text-slate-900 tracking-tight mb-4">Casting</h3>
                            <div className="mt-auto">
                                <SelectField 
                                    label="Alloy" 
                                    required
                                    options={MATERIAL_TYPES.map(m => ({value: m, label: MATERIAL_LABELS[m]}))} 
                                    value={alloy} 
                                    onChange={setAlloy} 
                                />
                            </div>
                        </section>

                        {/* Sanding (Empty Placeholder) */}
                        <section className="bg-white rounded-[8px] border border-slate-200 shadow-sm p-4 flex flex-col h-full justify-center">
                            <h3 className="text-[17px] font-bold text-slate-900 tracking-tight m-0">Sanding</h3>
                        </section>

                        {/* Stone Setting */}
                        <section className="bg-white rounded-[8px] border border-slate-200 shadow-sm p-4 md:p-5 pb-5 flex flex-col h-full">
                            <h3 className="text-[17px] font-bold text-slate-900 tracking-tight mb-4">Stone Setting</h3>
                            <div className="grid grid-cols-1 gap-4 mt-auto">
                                <Field label="Setting central">
                                    <PillSelect 
                                        options={[
                                            {value: 'round', label: 'Round'},
                                            {value: 'square', label: 'Square'},
                                            {value: 'tiger', label: 'Tiger'},
                                            {value: 'v-shape', label: 'V-Shape'},
                                            {value: 'besel', label: 'Besel'},
                                            {value: 'other', label: 'Other'},
                                        ]}
                                        value={settingCentral}
                                        onChange={setSettingCentral}
                                    />
                                </Field>
                                <Field label="Setting small">
                                    <PillSelect 
                                        options={[
                                            {value: 'prong', label: 'Prong'},
                                            {value: 'flush', label: 'Flush'},
                                            {value: 'pave', label: 'Pave'},
                                            {value: 'perle', label: 'Perle'},
                                            {value: 'castle', label: 'Castle'},
                                            {value: 'bezel', label: 'Bezel'},
                                        ]}
                                        value={settingSmall}
                                        onChange={setSettingSmall}
                                    />
                                </Field>
                            </div>
                        </section>

                        {/* Polishing */}
                        <section className="bg-white rounded-[8px] border border-slate-200 shadow-sm p-4 md:p-5 pb-5 flex flex-col h-full">
                            <h3 className="text-[17px] font-bold text-slate-900 tracking-tight mb-4">Polishing</h3>
                            <div className="mt-auto">
                                <Field label="Finish">
                                    <PillSelect 
                                        options={[
                                            {value: 'polished', label: 'Polished'},
                                            {value: 'mat', label: 'Mat'},
                                            {value: 'rhodium', label: 'Rhodium'},
                                        ]} 
                                        value={finish} 
                                        onChange={setFinish} 
                                    />
                                </Field>
                            </div>
                        </section>

                        {/* Quality Control (Empty Placeholder) */}
                        <section className="bg-white rounded-[8px] border border-slate-200 shadow-sm p-4 flex flex-col h-full justify-center">
                            <h3 className="text-[17px] font-bold text-slate-900 tracking-tight m-0">Quality Control</h3>
                        </section>

                    </div>

                    {/* Submit Bar */}
                    <div className="flex justify-start md:justify-end">
                        <button type="submit" disabled={loading} 
                            className="bg-[#1C7ED6] hover:bg-[#1971c2] text-white text-[15px] font-bold px-6 py-[10px] rounded-[6px] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-sm">
                            {loading ? '...' : 'Create'}
                        </button>
                    </div>

                </form>
            </div>
        </AppShell>
    );
}

export default function NewOrderPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-sm font-medium">Loading...</div>}>
            <OrderForm />
        </Suspense>
    );
}
