'use client';

import { AppShell } from '@/components/app-shell';
import { useStore } from '@/lib/store';
import { KanbanBoard } from '@/components/kanban/kanban-board';
import { useState } from 'react';
import { Order } from '@/types';
import { formatCurrency, formatDate, getDueDateStatus, getStatusColor, getStatusLabel, getOrdersStats } from '@/lib/helpers';
import { LayoutGrid, List, Plus, AlertTriangle, Clock, TrendingUp, Package } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const STAT_COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#f97316'];

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
    return (
        <div className="neo-card p-4" style={{ borderColor: color, boxShadow: `4px 4px 0 0 ${color}` }}>
            <div className="text-[11px] font-black uppercase tracking-widest mb-1" style={{ color }}>{label}</div>
            <div className="text-2xl font-black">{value}</div>
            {sub && <div className="text-xs font-semibold mt-0.5" style={{ color: '#888' }}>{sub}</div>}
        </div>
    );
}

function OrdersTable({ orders }: { orders: Order[] }) {
    const router = useRouter();
    const { customers } = useStore();
    return (
        <div className="neo-card overflow-hidden">
            <table className="w-full text-sm data-table">
                <thead>
                    <tr style={{ borderBottom: '2px solid #111', background: '#f8f8f8' }}>
                        {['Order #', 'Customer', 'Item', 'Stage', 'Due Date', 'Price'].map(h => (
                            <th key={h} className="text-left px-4 py-2.5 section-label">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => {
                        const customer = customers.find(c => c.id === order.customer_id);
                        const dueStatus = getDueDateStatus(order.due_date);
                        return (
                            <tr key={order.id} className="cursor-pointer transition-colors" style={{ borderBottom: '1px solid #eee' }}
                                onClick={() => router.push(`/orders/${order.id}`)}>
                                <td className="px-4 py-2.5 font-black text-xs">{order.order_number}</td>
                                <td className="px-4 py-2.5 font-medium">{customer?.name ?? '—'}</td>
                                <td className="px-4 py-2.5 capitalize">{order.item_type}</td>
                                <td className="px-4 py-2.5">
                                    <span className="status-pill" style={{ color: getStatusColor(order.status) }}>
                                        {getStatusLabel(order.status)}
                                    </span>
                                </td>
                                <td className="px-4 py-2.5" style={{ color: dueStatus === 'overdue' ? '#ef4444' : dueStatus === 'urgent' ? '#f97316' : '#888' }}>
                                    {dueStatus === 'overdue' && <AlertTriangle className="inline mr-1" style={{ width: 11, height: 11 }} />}
                                    {formatDate(order.due_date)}
                                </td>
                                <td className="px-4 py-2.5 font-semibold">{formatCurrency(order.price)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default function DashboardPage() {
    const { orders } = useStore();
    const [view, setView] = useState<'kanban' | 'table'>('kanban');
    const stats = getOrdersStats(orders);

    const urgentOrders = orders.filter(o => {
        const s = getDueDateStatus(o.due_date);
        return (s === 'overdue' || s === 'urgent') && o.status !== 'completed';
    });

    const statData = [
        { label: 'Total Orders', value: stats.total },
        { label: 'Completed', value: stats.completed, sub: `${stats.total ? Math.round(stats.completed / stats.total * 100) : 0}% rate` },
        { label: 'Overdue', value: stats.overdue },
        { label: 'Pending Revenue', value: formatCurrency(stats.pendingRevenue), sub: 'in progress' },
    ];

    return (
        <AppShell>
            <div className="flex flex-col gap-5">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight">Dashboard</h1>
                        <p className="text-sm font-semibold" style={{ color: '#888' }}>{orders.length} orders in the workshop</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* View toggle */}
                        <div className="flex rounded-lg overflow-hidden" style={{ border: '2px solid #111', boxShadow: '2px 2px 0 0 #111' }}>
                            <button onClick={() => setView('kanban')} className="px-3 py-1.5 flex items-center gap-1.5 text-xs font-black uppercase tracking-wide transition-all"
                                style={{ background: view === 'kanban' ? '#111' : '#fff', color: view === 'kanban' ? '#fff' : '#111' }}>
                                <LayoutGrid style={{ width: 13, height: 13 }} /> Board
                            </button>
                            <button onClick={() => setView('table')} className="px-3 py-1.5 flex items-center gap-1.5 text-xs font-black uppercase tracking-wide transition-all"
                                style={{ background: view === 'table' ? '#111' : '#fff', color: view === 'table' ? '#fff' : '#111', borderLeft: '2px solid #111' }}>
                                <List style={{ width: 13, height: 13 }} /> List
                            </button>
                        </div>
                        <Link href="/orders/new" className="neo-btn neo-btn-gold">
                            <Plus style={{ width: 13, height: 13 }} /> New Order
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {statData.map((s, i) => (
                        <StatCard key={s.label} label={s.label} value={s.value} sub={s.sub} color={STAT_COLORS[i]} />
                    ))}
                </div>

                {/* Urgent banner */}
                {urgentOrders.length > 0 && (
                    <div className="rounded-lg p-3.5 flex gap-3" style={{ background: '#fff5f5', border: '2px solid #ef4444', boxShadow: '3px 3px 0 0 #ef4444' }}>
                        <AlertTriangle className="flex-shrink-0 mt-0.5" style={{ width: 16, height: 16, color: '#ef4444' }} />
                        <div>
                            <div className="font-black text-sm uppercase" style={{ color: '#ef4444' }}>{urgentOrders.length} order{urgentOrders.length > 1 ? 's' : ''} need attention</div>
                            <div className="text-xs font-semibold mt-0.5" style={{ color: '#888' }}>
                                {urgentOrders.map(o => o.order_number).join(', ')}
                            </div>
                        </div>
                    </div>
                )}

                {/* Board / Table */}
                {view === 'kanban' ? <KanbanBoard /> : <OrdersTable orders={orders} />}
            </div>
        </AppShell>
    );
}
