'use client';

import { AppShell } from '@/components/app-shell';
import { useStore } from '@/lib/store';
import { formatCurrency, formatDate, getDueDateStatus, getStatusColor, getStatusLabel } from '@/lib/helpers';
import { ITEM_TYPE_LABELS, MATERIAL_LABELS, ORDER_STAGES } from '@/types';
import { useState } from 'react';
import { Plus, Search, AlertTriangle, Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {
    const { orders, customers } = useStore();
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [materialFilter, setMaterialFilter] = useState('all');

    const filtered = orders.filter(o => {
        const customer = customers.find(c => c.id === o.customer_id);
        const matchSearch = !search ||
            o.order_number.toLowerCase().includes(search.toLowerCase()) ||
            customer?.name.toLowerCase().includes(search.toLowerCase()) ||
            o.item_type.includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || o.status === statusFilter;
        const matchMaterial = materialFilter === 'all' || o.materials.includes(materialFilter as any);
        return matchSearch && matchStatus && matchMaterial;
    });

    return (
        <AppShell>
            <div className="flex flex-col gap-5">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-lg font-semibold">Orders</h1>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{filtered.length} of {orders.length} orders</p>
                    </div>
                    <Link href="/orders/new" className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold" style={{ background: 'var(--gold)', color: '#0c0b0e' }}>
                        <Plus style={{ width: 14, height: 14 }} /> New Order
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex gap-2.5 flex-wrap">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2" style={{ width: 14, height: 14, color: 'var(--muted-foreground)' }} />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders, customers…"
                            className="w-full pl-8 pr-4 py-2 rounded-lg text-sm" style={{ border: '1px solid var(--border)' }} />
                    </div>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg text-xs" style={{ border: '1px solid var(--border)' }}>
                        <option value="all">All Stages</option>
                        {ORDER_STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                    </select>
                    <select value={materialFilter} onChange={e => setMaterialFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg text-xs" style={{ border: '1px solid var(--border)' }}>
                        <option value="all">All Materials</option>
                        {Object.entries(MATERIAL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                </div>

                {/* Table */}
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm data-table">
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    {['Order #', 'Customer', 'Item', 'Material', 'Stage', 'Due Date', 'Price'].map(h => (
                                        <th key={h} className="text-left px-4 py-2.5 section-label whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 && (
                                    <tr><td colSpan={7} className="text-center py-12 text-sm" style={{ color: 'var(--muted-foreground)' }}>No orders found</td></tr>
                                )}
                                {filtered.map(order => {
                                    const customer = customers.find(c => c.id === order.customer_id);
                                    const dueStatus = getDueDateStatus(order.due_date);
                                    return (
                                        <tr key={order.id} className="cursor-pointer" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                                            onClick={() => router.push(`/orders/${order.id}`)}>
                                            <td className="px-4 py-2.5 font-mono font-semibold text-xs" style={{ color: 'var(--gold)' }}>{order.order_number}</td>
                                            <td className="px-4 py-2.5">{customer?.name ?? '—'}</td>
                                            <td className="px-4 py-2.5 capitalize">{ITEM_TYPE_LABELS[order.item_type]}</td>
                                            <td className="px-4 py-2.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                                {order.materials.map(m => MATERIAL_LABELS[m]).join(', ') || '—'}
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <span className="status-pill" style={{ background: `${getStatusColor(order.status)}15`, color: getStatusColor(order.status) }}>
                                                    {getStatusLabel(order.status)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2.5 whitespace-nowrap text-sm" style={{ color: dueStatus === 'overdue' ? '#d97070' : dueStatus === 'urgent' ? 'var(--gold)' : 'var(--muted-foreground)' }}>
                                                {dueStatus === 'overdue' && <AlertTriangle className="inline mr-1" style={{ width: 11, height: 11 }} />}
                                                {formatDate(order.due_date)}
                                            </td>
                                            <td className="px-4 py-2.5">{formatCurrency(order.price)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
