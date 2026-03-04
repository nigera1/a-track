'use client';

import { AppShell } from '@/components/app-shell';
import { useStore } from '@/lib/store';
import { KanbanBoard } from '@/components/kanban/kanban-board';
import { useState } from 'react';
import { ORDER_STAGES, Order } from '@/types';
import { formatCurrency, formatDate, getDueDateStatus, getStatusColor, getStatusLabel, getOrdersStats } from '@/lib/helpers';
import { LayoutGrid, List, Plus, AlertTriangle, Clock, TrendingUp, Package } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function StatCard({ label, value, sub, icon: Icon }: { label: string; value: string | number; sub?: string; icon: React.ElementType }) {
    return (
        <div className="glass-card p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--gold-subtle)' }}>
                <Icon style={{ width: 16, height: 16, color: 'var(--gold)' }} />
            </div>
            <div>
                <div className="text-xl font-bold">{value}</div>
                <div className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>{label}</div>
                {sub && <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)', fontSize: '0.65rem' }}>{sub}</div>}
            </div>
        </div>
    );
}

function OrdersTable({ orders }: { orders: Order[] }) {
    const router = useRouter();
    const { customers } = useStore();

    return (
        <div className="glass-card overflow-hidden">
            <table className="w-full text-sm data-table">
                <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        {['Order', 'Customer', 'Item', 'Status', 'Due Date', 'Price'].map(h => (
                            <th key={h} className="text-left px-4 py-2.5 section-label">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => {
                        const customer = customers.find(c => c.id === order.customer_id);
                        const dueStatus = getDueDateStatus(order.due_date);
                        return (
                            <tr key={order.id} className="cursor-pointer transition-colors" style={{ borderBottom: '1px solid var(--border)' }}
                                onClick={() => router.push(`/orders/${order.id}`)}>
                                <td className="px-4 py-2.5 font-mono font-semibold text-xs" style={{ color: 'var(--gold)' }}>{order.order_number}</td>
                                <td className="px-4 py-2.5 text-sm">{customer?.name ?? '—'}</td>
                                <td className="px-4 py-2.5 capitalize text-sm">{order.item_type}</td>
                                <td className="px-4 py-2.5">
                                    <span className="status-pill" style={{ background: `${getStatusColor(order.status)}15`, color: getStatusColor(order.status) }}>
                                        {getStatusLabel(order.status)}
                                    </span>
                                </td>
                                <td className="px-4 py-2.5 text-sm" style={{ color: dueStatus === 'overdue' ? '#d97070' : dueStatus === 'urgent' ? 'var(--gold)' : 'var(--muted-foreground)' }}>
                                    {dueStatus === 'overdue' && <AlertTriangle className="inline mr-1" style={{ width: 12, height: 12 }} />}
                                    {formatDate(order.due_date)}
                                </td>
                                <td className="px-4 py-2.5 text-sm">{formatCurrency(order.price)}</td>
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

    return (
        <AppShell>
            <div className="flex flex-col gap-5">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-lg font-semibold">Dashboard</h1>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{orders.length} orders in the workshop</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                            <button onClick={() => setView('kanban')} className="px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium transition-all"
                                style={{ background: view === 'kanban' ? 'var(--gold)' : 'transparent', color: view === 'kanban' ? '#0c0b0e' : 'var(--muted-foreground)' }}>
                                <LayoutGrid style={{ width: 13, height: 13 }} /> Board
                            </button>
                            <button onClick={() => setView('table')} className="px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium transition-all"
                                style={{ background: view === 'table' ? 'var(--gold)' : 'transparent', color: view === 'table' ? '#0c0b0e' : 'var(--muted-foreground)' }}>
                                <List style={{ width: 13, height: 13 }} /> List
                            </button>
                        </div>
                        <Link href="/orders/new" className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                            style={{ background: 'var(--gold)', color: '#0c0b0e' }}>
                            <Plus style={{ width: 14, height: 14 }} /> New Order
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatCard label="Total Orders" value={stats.total} icon={Package} />
                    <StatCard label="Completed" value={stats.completed} sub={`${stats.total ? Math.round(stats.completed / stats.total * 100) : 0}% rate`} icon={TrendingUp} />
                    <StatCard label="Overdue" value={stats.overdue} icon={AlertTriangle} />
                    <StatCard label="Pending Revenue" value={formatCurrency(stats.pendingRevenue)} sub="in progress" icon={Clock} />
                </div>

                {/* Urgent */}
                {urgentOrders.length > 0 && (
                    <div className="rounded-lg p-3.5 flex gap-3" style={{ background: 'rgba(199,80,80,0.06)', border: '1px solid rgba(199,80,80,0.12)' }}>
                        <AlertTriangle className="flex-shrink-0 mt-0.5" style={{ width: 16, height: 16, color: '#d97070' }} />
                        <div>
                            <div className="font-medium text-sm" style={{ color: '#d97070' }}>{urgentOrders.length} order{urgentOrders.length > 1 ? 's' : ''} need attention</div>
                            <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                                {urgentOrders.map(o => o.order_number).join(', ')}
                            </div>
                        </div>
                    </div>
                )}

                {/* Board */}
                {view === 'kanban' ? <KanbanBoard orders={orders} /> : <OrdersTable orders={orders} />}
            </div>
        </AppShell>
    );
}
