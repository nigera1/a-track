'use client';

import { AppShell } from '@/components/app-shell';
import { useStore } from '@/lib/store';
import { KanbanBoard } from '@/components/kanban/kanban-board';
import { useState, useMemo } from 'react';
import { Order, ORDER_STAGES, OrderStatus } from '@/types';
import { formatCurrency, formatDate, getDueDateStatus, getStatusColor, getStatusLabel, getOrdersStats, getStaleOrders, getRelativeTime } from '@/lib/helpers';
import { LayoutGrid, List, Plus, AlertTriangle, Clock, TrendingUp, Package, Timer } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const STAT_COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#f97316'];

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
    return (
        <div className="neo-card p-6 relative group" style={{ borderTopWidth: '8px', borderTopColor: color }}>
            <div className="text-[12px] font-bold uppercase tracking-wide mb-1 text-slate-700 dark:text-slate-300">{label}</div>
            <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-baseline gap-2" style={{ marginTop: 4 }}>
                {value}
                {sub && <span className="text-[11px] font-semibold tracking-tight lowercase text-slate-500 dark:text-slate-400">{sub}</span>}
            </div>
        </div>
    );
}

function ProcessBar({ currentStatus }: { currentStatus: OrderStatus }) {
    const currentIndex = ORDER_STAGES.findIndex(s => s.key === currentStatus);
    if (currentStatus === 'completed') return <span className="font-black text-[10px] uppercase tracking-wider" style={{ color: 'var(--blue)' }}>Completed</span>;
    
    return (
        <div className="flex items-center gap-1" title={getStatusLabel(currentStatus)}>
            {ORDER_STAGES.filter(s => s.key !== 'completed').map((s, i) => {
                const isPast = i < currentIndex;
                const isCurrent = i === currentIndex;
                return (
                    <div key={s.key} 
                         style={{
                             width: 14, height: 14,
                             background: isPast ? 'var(--foreground)' : isCurrent ? 'var(--blue)' : 'var(--background)',
                             border: '2px solid var(--foreground)'
                         }} 
                    />
                );
            })}
        </div>
    );
}

function OrdersTable({ orders }: { orders: Order[] }) {
    const router = useRouter();
    const { customers } = useStore();
    return (
        <>
            {/* Mobile Card View */}
            <div className="md:hidden flex flex-col gap-3">
                {orders.map(order => {
                    const customer = customers.find(c => c.id === order.customer_id);
                    const dueStatus = getDueDateStatus(order.due_date);
                    return (
                        <div key={order.id} className="mobile-order-card"
                            onClick={() => router.push(`/orders/${order.id}`)}>
                            <div className="flex items-start justify-between mb-1.5">
                                <span className="font-bold text-sm text-blue-600 dark:text-blue-500">{order.order_number}</span>
                                <ProcessBar currentStatus={order.status} />
                            </div>
                            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{customer?.name ?? '—'}</div>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                                <span className="text-xs font-semibold"
                                    style={{ color: dueStatus === 'overdue' ? '#ef4444' : dueStatus === 'urgent' ? '#f97316' : '#888' }}>
                                    {formatDate(order.due_date)}
                                </span>
                                <span className="text-sm font-bold">{formatCurrency(order.price)}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Desktop Table */}
            <div className="neo-card overflow-hidden hidden md:block">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm data-table" style={{ minWidth: 600 }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--muted)' }}>
                                {['Order #', 'Customer', 'Item', 'Stage', 'Due Date', 'Price'].map(h => (
                                    <th key={h} className="text-left px-5 py-3 section-label">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => {
                                const customer = customers.find(c => c.id === order.customer_id);
                                const dueStatus = getDueDateStatus(order.due_date);
                                return (
                                    <tr key={order.id} className="cursor-pointer transition-colors" style={{ borderBottom: '2px solid #eee' }}
                                        onClick={() => router.push(`/orders/${order.id}`)}>
                                        <td className="px-5 py-3 font-bold text-xs">
                                            {order.order_number}
                                            {order.is_ready_for_pickup && order.status === 'completed' && (
                                                <span title="Ready for pickup">
                                                    <Package className="inline ml-1.5" style={{ width: 13, height: 13, color: '#3b82f6' }} />
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2.5 font-medium">{customer?.name ?? '—'}</td>
                                        <td className="px-4 py-2.5 capitalize">{order.item_type}</td>
                                        <td className="px-4 py-2.5">
                                            <ProcessBar currentStatus={order.status} />
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
            </div>
        </>
    );
}

export default function DashboardPage() {
    const { orders, customers } = useStore();
    const router = useRouter();
    const [view, setView] = useState<'kanban' | 'table'>('kanban');
    const stats = useMemo(() => getOrdersStats(orders), [orders]);

    const urgentOrders = useMemo(() => orders.filter(o => {
        const s = getDueDateStatus(o.due_date);
        return (s === 'overdue' || s === 'urgent') && o.status !== 'completed';
    }), [orders]);
    
    const readyForPickupOrders = useMemo(() => orders.filter(o => o.is_ready_for_pickup && o.status === 'completed'), [orders]);
    const staleOrders = useMemo(() => getStaleOrders(orders, 7), [orders]);

    const statData = useMemo(() => [
        { label: 'Total Orders', value: stats.total },
        { label: 'Completed', value: stats.completed, sub: `${stats.total ? Math.round(stats.completed / stats.total * 100) : 0}% rate` },
        { label: 'Overdue', value: stats.overdue },
        { label: 'Pending Revenue', value: formatCurrency(stats.pendingRevenue), sub: 'in progress' },
    ], [stats]);

    const recentOrders = useMemo(() => orders
        .slice()
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 8), [orders]);

    return (
        <AppShell>
            <div className="flex flex-col gap-5">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
                        <p className="text-sm font-medium" style={{ color: '#888' }}>{orders.length} orders in the workshop</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* View toggle */}
                        <div className="flex rounded-lg overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-1">
                            <button onClick={() => setView('kanban')} className="px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold rounded-md transition-all"
                                style={{ background: view === 'kanban' ? 'var(--muted)' : 'transparent', color: view === 'kanban' ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
                                <LayoutGrid style={{ width: 14, height: 14 }} /> Board
                            </button>
                            <button onClick={() => setView('table')} className="px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold rounded-md transition-all"
                                style={{ background: view === 'table' ? 'var(--muted)' : 'transparent', color: view === 'table' ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
                                <List style={{ width: 14, height: 14 }} /> List
                            </button>
                        </div>
                        <Link href="/orders/new" className="neo-btn neo-btn-primary">
                            <Plus style={{ width: 14, height: 14 }} /> New Order
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {statData.map((s, i) => (
                        <StatCard key={s.label} label={s.label} value={s.value} sub={s.sub} color={STAT_COLORS[i]} />
                    ))}
                </div>

                {/* ═══ BIG ATTENTION BANNER ═══ */}
                {(urgentOrders.length > 0 || readyForPickupOrders.length > 0 || staleOrders.length > 0) && (
                    <div className="neo-card" style={{
                        padding: 0,
                        borderTopWidth: 8,
                        borderTopColor: 'var(--red)'
                    }}>
                        {/* Header */}
                        <div className="bg-slate-900 dark:bg-red-950/40" style={{
                            padding: '16px 24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                        }}>
                            <AlertTriangle style={{ width: 28, height: 28, color: 'var(--red)', flexShrink: 0 }} />
                            <div>
                                <div className="text-white dark:text-red-100" style={{ fontWeight: 800, fontSize: 18, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    {urgentOrders.length + readyForPickupOrders.length + staleOrders.length} orders need your attention
                                </div>
                                <div className="text-slate-300 dark:text-red-200/70" style={{ fontSize: 12, fontWeight: 600, marginTop: 2 }}>
                                    OVERDUE, STUCK, OR AWAITING PICKUP
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '8px 16px 16px' }}>
                            {/* Overdue / urgent orders */}
                            {urgentOrders.length > 0 && (
                                <div style={{ marginTop: 8 }}>
                                    <div className="section-label" style={{ padding: '8px 8px 6px', color: '#ef4444' }}>
                                        ⚠ Overdue / Due Soon — {urgentOrders.length}
                                    </div>
                                    {urgentOrders.map(o => {
                                        const customer = customers.find(c => c.id === o.customer_id);
                                        const daysLeft = o.due_date ? Math.ceil((new Date(o.due_date).getTime() - Date.now()) / 86400000) : null;
                                        return (
                                            <div key={o.id}
                                                className="flex items-center justify-between gap-3 cursor-pointer px-3 py-2.5 transition-colors"
                                                style={{ background: 'var(--muted)', border: '1px solid var(--border)', marginBottom: 4, borderRadius: 'var(--radius)' }}
                                                onClick={() => router.push(`/orders/${o.id}`)}>
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <span style={{ fontWeight: 800, fontSize: 14, color: '#ef4444' }}>{o.order_number}</span>
                                                    <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--foreground)' }}>{customer?.name}</span>
                                                    <ProcessBar currentStatus={o.status} />
                                                </div>
                                                <span style={{ fontWeight: 900, fontSize: 14, color: daysLeft !== null && daysLeft < 0 ? 'var(--red)' : '#f97316', whiteSpace: 'nowrap' }}>
                                                    {daysLeft !== null && daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Stuck in production */}
                            {staleOrders.length > 0 && (
                                <div style={{ marginTop: 12 }}>
                                    <div className="section-label" style={{ padding: '8px 8px 6px', color: '#d97706' }}>
                                        ⏱ Stuck in Production — {staleOrders.length}
                                    </div>
                                    {staleOrders.map(o => {
                                        const customer = customers.find(c => c.id === o.customer_id);
                                        return (
                                            <div key={o.id}
                                                className="flex items-center justify-between gap-3 cursor-pointer px-3 py-2.5 transition-colors"
                                                style={{ background: 'var(--muted)', border: '1px solid var(--border)', marginBottom: 4, borderRadius: 'var(--radius)' }}
                                                onClick={() => router.push(`/orders/${o.id}`)}>
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <span style={{ fontWeight: 800, fontSize: 14, color: '#d97706' }}>{o.order_number}</span>
                                                    <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--foreground)' }}>{customer?.name}</span>
                                                    <ProcessBar currentStatus={o.status} />
                                                </div>
                                                <span style={{ fontWeight: 900, fontSize: 14, color: '#d97706', whiteSpace: 'nowrap' }}>
                                                    {o.staleDays}d stuck
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Ready for pickup */}
                            {readyForPickupOrders.length > 0 && (
                                <div style={{ marginTop: 12 }}>
                                    <div className="section-label" style={{ padding: '8px 8px 6px', color: '#3b82f6' }}>
                                        📦 Ready for Pickup — {readyForPickupOrders.length}
                                    </div>
                                    {readyForPickupOrders.map(o => {
                                        const customer = customers.find(c => c.id === o.customer_id);
                                        return (
                                            <div key={o.id}
                                                className="flex items-center justify-between gap-3 cursor-pointer px-3 py-2.5 transition-colors"
                                                style={{ background: 'var(--muted)', border: '1px solid var(--border)', marginBottom: 4, borderRadius: 'var(--radius)' }}
                                                onClick={() => router.push(`/orders/${o.id}`)}>
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <span style={{ fontWeight: 800, fontSize: 14, color: '#3b82f6' }}>{o.order_number}</span>
                                                    <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--foreground)' }}>{customer?.name}</span>
                                                </div>
                                                <span style={{ fontWeight: 700, fontSize: 12, color: '#3b82f6', whiteSpace: 'nowrap' }}>
                                                    Awaiting pickup
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Board / Table */}
                {view === 'kanban' ? <KanbanBoard /> : <OrdersTable orders={orders} />}

                {/* Recent Activity */}
                <div className="neo-card overflow-hidden">
                    <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)', background: 'var(--muted)' }}>
                        <Clock style={{ width: 14, height: 14, color: '#6b7280' }} />
                        <span className="section-label">Recent Activity</span>
                    </div>
                    <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                        {recentOrders
                            .map(order => {
                                const customer = customers.find(c => c.id === order.customer_id);
                                const ago = getRelativeTime(order.updated_at);
                                return (
                                    <div key={order.id} className="px-4 py-2.5 flex items-center justify-between text-sm cursor-pointer hover:bg-slate-50 transition-colors"
                                        onClick={() => router.push(`/orders/${order.id}`)}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: getStatusColor(order.status) }} />
                                            <div>
                                                <span className="font-bold text-xs">{order.order_number}</span>
                                                <span className="text-xs ml-2 font-bold" style={{ color: 'var(--muted-foreground)' }}>
                                                    {customer?.name ?? 'Unknown'} · {getStatusLabel(order.status).toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-[11px] font-bold flex-shrink-0" style={{ color: '#aaa', textTransform: 'uppercase' }}>{ago}</span>
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
