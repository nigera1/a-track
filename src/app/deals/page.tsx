'use client';

import { AppShell } from '@/components/app-shell';
import { useStore } from '@/lib/store';
import { useState } from 'react';
import { Plus, Trash2, DollarSign, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/helpers';
import { DealStatus } from '@/types';

const DEAL_STAGES: { key: DealStatus; label: string; color: string }[] = [
    { key: 'ongoing', label: 'Ongoing', color: '#3b82f6' },
    { key: 'partially_paid', label: 'Partially Paid', color: '#f59e0b' },
    { key: 'won', label: 'Won', color: '#10b981' },
    { key: 'lost', label: 'Lost', color: '#ef4444' },
];

export default function DealsPage() {
    const { deals, customers, addDeal, updateDeal, deleteDeal } = useStore();
    const [showForm, setShowForm] = useState(false);

    const [title, setTitle] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [estimatedValue, setEstimatedValue] = useState('');
    const [notes, setNotes] = useState('');

    function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        if (!title || !customerId) { toast.error('Title and Customer are required'); return; }
        
        addDeal({
            title,
            customer_id: customerId,
            status: 'ongoing',
            estimated_value: estimatedValue ? Number(estimatedValue) : undefined,
            notes: notes || undefined
        });
        toast.success(`Deal added`);
        setTitle(''); setCustomerId(''); setEstimatedValue(''); setNotes('');
        setShowForm(false);
    }

    const inputCls = "w-full px-3 py-2 rounded-lg border text-sm";

    return (
        <AppShell>
            <div className="flex flex-col gap-5">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight">Deals Tracking</h1>
                        <p className="text-sm font-semibold" style={{ color: '#888' }}>Pre-production pipeline</p>
                    </div>
                    <button onClick={() => setShowForm(!showForm)} className="neo-btn neo-btn-primary">
                        <Plus style={{ width: 13, height: 13 }} /> New Deal
                    </button>
                </div>

                {/* Add form */}
                {showForm && (
                    <form onSubmit={handleAdd} className="neo-card p-5 flex flex-col gap-4">
                        <div className="section-label">New Deal</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="section-label mb-1.5 block">Title *</label>
                                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Diamond Ring" className={inputCls} style={{ border: '1px solid var(--border)' }} />
                            </div>
                            <div>
                                <label className="section-label mb-1.5 block">Customer *</label>
                                <select value={customerId} onChange={e => setCustomerId(e.target.value)} className={inputCls} style={{ border: '1px solid var(--border)' }}>
                                    <option value="">Select customer...</option>
                                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="section-label mb-1.5 block">Est. Value (€)</label>
                                <input type="number" value={estimatedValue} onChange={e => setEstimatedValue(e.target.value)} placeholder="0.00" className={inputCls} style={{ border: '1px solid var(--border)' }} />
                            </div>
                            <div>
                                <label className="section-label mb-1.5 block">Notes</label>
                                <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Details..." className={inputCls} style={{ border: '1px solid var(--border)' }} />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" className="neo-btn neo-btn-primary">Create Deal</button>
                            <button type="button" onClick={() => setShowForm(false)} className="neo-btn" style={{ color: '#888' }}>Cancel</button>
                        </div>
                    </form>
                )}

                {/* Pipeline Board */}
                <div className="flex gap-4 overflow-x-auto pb-4 items-start">
                    {DEAL_STAGES.map(stage => {
                        const stageDeals = deals.filter(d => d.status === stage.key);
                        return (
                            <div key={stage.key} className="flex flex-col min-w-[280px] w-[300px] flex-shrink-0">
                                {/* Column header */}
                                <div className="rounded-lg p-3 mb-3 flex items-center justify-between"
                                    style={{ border: `1px solid ${stage.color}30`, background: `${stage.color}08`, borderLeft: `3px solid ${stage.color}` }}>
                                    <span className="text-xs font-black uppercase tracking-wider" style={{ color: stage.color }}>
                                        {stage.label}
                                    </span>
                                    <span className="text-[11px] font-black px-1.5 py-0.5 rounded" style={{ background: stage.color, color: '#fff' }}>
                                        {stageDeals.length}
                                    </span>
                                </div>
                                
                                {/* Cards */}
                                <div className="flex flex-col gap-3">
                                    {stageDeals.map(deal => {
                                        const customer = customers.find(c => c.id === deal.customer_id);
                                        return (
                                            <div key={deal.id} className="neo-card p-3 flex flex-col gap-2 relative group">
                                                <div className="flex justify-between items-start">
                                                    <div className="font-bold text-sm tracking-tight">{deal.title}</div>
                                                    <button onClick={() => { if(confirm('Delete deal?')) deleteDeal(deal.id); }} 
                                                        className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-500/10 rounded transition-all">
                                                        <Trash2 style={{ width: 14, height: 14 }} />
                                                    </button>
                                                </div>
                                                <div className="text-xs font-semibold text-gray-500">{customer?.name || 'Unknown'}</div>
                                                
                                                {deal.estimated_value != null && (
                                                    <div className="flex items-center gap-1 text-sm font-black mt-1" style={{ color: '#111' }}>
                                                        <DollarSign style={{ width: 12, height: 12, color: stage.color }} />
                                                        €{deal.estimated_value.toLocaleString()}
                                                    </div>
                                                )}
                                                
                                                {deal.notes && (
                                                    <div className="text-xs mt-1 italic text-gray-500 line-clamp-2">"{deal.notes}"</div>
                                                )}

                                                {/* Actions */}
                                                <div className="flex justify-between items-center mt-2 pt-2" style={{ borderTop: '1px dashed var(--border)' }}>
                                                    <span className="text-[10px] uppercase font-bold text-gray-400">{formatDate(deal.updated_at)}</span>
                                                    <div className="flex items-center gap-2">
                                                        {deal.status === 'won' && (
                                                            <a href={`/orders/new?customer=${deal.customer_id}`}
                                                                className="flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-1 rounded transition-colors"
                                                                style={{ background: '#10b98120', color: '#10b981' }}>
                                                                <ArrowRight style={{ width: 10, height: 10 }} /> Order
                                                            </a>
                                                        )}
                                                        <select 
                                                            className="text-[10px] uppercase font-black px-1.5 py-1 rounded bg-gray-100 cursor-pointer"
                                                            value={deal.status}
                                                            onChange={(e) => updateDeal(deal.id, { status: e.target.value as DealStatus })}
                                                            style={{ border: '1px solid #ddd' }}
                                                        >
                                                            {DEAL_STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {stageDeals.length === 0 && (
                                        <div className="text-center p-4 border-2 border-dashed rounded-xl text-xs font-semibold text-gray-400">
                                            No deals
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AppShell>
    );
}
