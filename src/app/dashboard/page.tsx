'use client';

import { AppShell } from '@/components/app-shell';
import { useStore } from '@/lib/store';
import { KanbanBoard } from '@/components/kanban/kanban-board';
import { useState, useMemo } from 'react';
import { Order, ORDER_STAGES, OrderStatus } from '@/types';
import { formatCurrency, formatDate, getDueDateStatus, getStatusColor, getStatusLabel, getOrdersStats, getStaleOrders, getRelativeTime } from '@/lib/helpers';
import { LayoutGrid, List, Plus, AlertTriangle, Clock, TrendingUp, Package, Timer, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const STAT_COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#f97316'];

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
    return (
        <div className="neo-card flex flex-col justify-between group h-full relative overflow-hidden" style={{ borderLeft: `4px solid ${color}` }}>
            <div>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-2 opacity-60">{label}</div>
                <div className="text-2xl font-bold tracking-tight flex items-baseline gap-2">
                    {value}
                </div>
            </div>
            {sub && (
                <div className="mt-3 pt-3 border-t border-dashed border-border flex items-center gap-1.5 overflow-hidden">
                    <TrendingUp style={{ width: 12, height: 12, color: 'var(--muted-foreground)' }} aria-hidden="true" />
                    <span className="text-[10px] font-bold uppercase tracking-wide opacity-50 whitespace-nowrap">{sub}</span>
                </div>
            )}
        </div>
    );
}

function ProcessBar({ currentStatus }: { currentStatus: OrderStatus }) {
    const currentIndex = ORDER_STAGES.findIndex(s => s.key === currentStatus);
    const label = getStatusLabel(currentStatus);
    if (currentStatus === 'completed') return <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500" aria-label="Stage: completed">Done</span>;

    return (
        <div className="flex items-center gap-0.5" title={label} role="img" aria-label={`Production stage: ${label}`}>
            {ORDER_STAGES.filter(s => s.key !== 'completed').map((s, i) => {
                const isPast = i < currentIndex;
                const isCurrent = i === currentIndex;
                return (
                    <div key={s.key}
                        style={{
                            width: 4, height: 10,
                            background: isPast ? 'var(--foreground)' : isCurrent ? 'var(--blue)' : 'var(--muted)',
                            borderRadius: 1
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
                            onClick={() => router.push(`/orders/${order.id}`)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={e => e.key === 'Enter' && router.push(`/orders/${order.id}`)}
                            aria-label={`Order ${order.order_number} for ${customer?.name ?? 'unknown customer'}`}>
                            <div className="flex items-start justify-between mb-1.5">
                                <span className="font-bold text-sm text-blue-600 dark:text-blue-500">{order.order_number}</span>
                                <ProcessBar currentStatus={order.status} />
                            </div>
                            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{customer?.name ?? '—'}</div>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                                <span className="text-xs font-semibold"
                                    style={{ color: dueStatus === 'overdue' ? '#ef4444' : dueStatus === 'urgent' ? '#f97316' : 'var(--muted-foreground)' }}>
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
                                    <th key={h} className="text-left px-5 py-3 section-label" scope="col">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => {
                                const customer = customers.find(c => c.id === order.customer_id);
                                const dueStatus = getDueDateStatus(order.due_date);
                                return (
                                    <tr key={order.id} className="cursor-pointer transition-colors" style={{ borderBottom: '2px solid var(--border)' }}
                                        onClick={() => router.push(`/orders/${order.id}`)}>
                                        <td className="px-5 py-3 font-bold text-xs">
                                            {order.order_number}
                                            {order.is_ready_for_pickup && order.status === 'completed' && (
                                                <span title="Ready for pickup" aria-label="Ready for pickup">
                                                    <Package className="inline ml-1.5" style={{ width: 13, height: 13, color: '#3b82f6' }} aria-hidden="true" />
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2.5 font-medium">{customer?.name ?? '—'}</td>
                                        <td className="px-4 py-2.5 capitalize">{order.item_type}</td>
                                        <td className="px-4 py-2.5">
                                            <ProcessBar currentStatus={order.status} />
                                        </td>
                                        <td className="px-4 py-2.5" style={{ color: dueStatus === 'overdue' ? '#ef4444' : dueStatus === 'urgent' ? '#f97316' : 'var(--muted-foreground)' }}>
                                            {dueStatus === 'overdue' && <AlertTriangle className="inline mr-1" style={{ width: 11, height: 11 }} aria-hidden="true" />}
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
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight" aria-label="Workshop Monitor — production dashboard">MONITOR</h1>
                        <div className="flex items-center gap-2 mt-0.5 text-xs font-bold opacity-50 uppercase tracking-widest">
                            <Package style={{ width: 12, height: 12 }} aria-hidden="true" />
                            <span>{orders.length} Active Jobs</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* View toggle */}
                        <div className="flex rounded-md border border-border p-0.5 bg-muted" role="group" aria-label="View toggle">
                            <button onClick={() => setView('kanban')} className="px-3 py-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide rounded transition-all"
                                aria-pressed={view === 'kanban'}
                                style={{ background: view === 'kanban' ? 'var(--card)' : 'transparent', color: view === 'kanban' ? 'var(--foreground)' : 'var(--muted-foreground)', boxShadow: view === 'kanban' ? 'var(--shadow-sm)' : 'none' }}>
                                <LayoutGrid style={{ width: 13, height: 13 }} aria-hidden="true" /> Board
                            </button>
                            <button onClick={() => setView('table')} className="px-3 py-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide rounded transition-all"
                                aria-pressed={view === 'table'}
                                style={{ background: view === 'table' ? 'var(--card)' : 'transparent', color: view === 'table' ? 'var(--foreground)' : 'var(--muted-foreground)', boxShadow: view === 'table' ? 'var(--shadow-sm)' : 'none' }}>
                                <List style={{ width: 13, height: 13 }} aria-hidden="true" /> List
                            </button>
                        </div>
                        <Link href="/orders/new" className="neo-btn neo-btn-primary">
                            <Plus style={{ width: 14, height: 14 }} aria-hidden="true" /> New Order
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" role="region" aria-label="Workshop statistics">
                    {statData.map((s, i) => (
                        <StatCard key={s.label} label={s.label} value={s.value} sub={s.sub} color={STAT_COLORS[i]} />
                    ))}
                </div>

                {/* Alerts Banner */}
                {(urgentOrders.length > 0 || readyForPickupOrders.length > 0 || staleOrders.length > 0) && (
                    <div className="neo-card" style={{ padding: 0 }} role="alert" aria-label="Workshop alerts">
                        {/* Header */}
                        <div className="border-b" style={{
                            padding: '12px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            borderColor: 'var(--border)'
                        }}>
                            <Timer style={{ width: 16, height: 16, color: 'var(--red)', flexShrink: 0 }} aria-hidden="true" />
                            <div className="font-bold text-xs uppercase tracking-widest">Workshop Alerts Summary</div>
                            <div className="ml-auto flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />
                                <span className="text-[10px] font-bold uppercase opacity-50">{urgentOrders.length + readyForPickupOrders.length + staleOrders.length} Flags</span>
                            </div>
                        </div>

                        <div style={{ padding: '8px 16px 16px' }}>
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
                                                onClick={() => router.push(`/orders/${o.id}`)}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={e => e.key === 'Enter' && router.push(`/orders/${o.id}`)}
                                                aria-label={`Order ${o.order_number} — ${daysLeft !== null && daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}`}>
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
                                                onClick={() => router.push(`/orders/${o.id}`)}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={e => e.key === 'Enter' && router.push(`/orders/${o.id}`)}>
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
                                                onClick={() => router.push(`/orders/${o.id}`)}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={e => e.key === 'Enter' && router.push(`/orders/${o.id}`)}>
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

                {/* Board / Table — Empty state when no orders */}
                {orders.length === 0 ? (
                    <div className="neo-card flex flex-col items-center justify-center text-center py-20 gap-4" role="status">
                        <div className="w-14 h-14 flex items-center justify-center rounded-full" style={{ background: 'var(--muted)', border: '2px dashed var(--border)' }}>
                            <Package style={{ width: 24, height: 24, color: 'var(--muted-foreground)' }} aria-hidden="true" />
                        </div>
                        <div>
                            <div className="font-bold text-sm tracking-tight">No orders yet</div>
                            <div className="text-[12px] opacity-50 mt-1">Create your first order to get started</div>
                        </div>
                        <Link href="/orders/new" className="neo-btn neo-btn-primary mt-2">
                            <Plus style={{ width: 14, height: 14 }} aria-hidden="true" /> Create Order
                        </Link>
                    </div>
                ) : view === 'kanban' ? <KanbanBoard /> : <OrdersTable orders={orders} />}

                {/* Recent Activity */}
                <div className="neo-card p-0 overflow-hidden" role="region" aria-label="Recent workshop activity">
                    <div className="px-5 py-3 flex items-center justify-between border-b" style={{ borderColor: 'var(--border)', background: 'var(--muted)' }}>
                        <div className="flex items-center gap-2">
                            <Clock style={{ width: 14, height: 14, opacity: 0.5 }} aria-hidden="true" />
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Workshop Event Log</span>
                        </div>
                        <Link href="/analytics" className="text-[10px] font-bold uppercase tracking-widest text-blue-500 hover:underline">View History</Link>
                    </div>
                    <div className="divide-y divide-border">
                        {recentOrders.map(order => {
                            const customer = customers.find(c => c.id === order.customer_id);
                            const ago = getRelativeTime(order.updated_at);
                            return (
                                <div key={order.id} className="px-5 py-3 flex items-center justify-between text-sm cursor-pointer hover:bg-muted transition-colors group"
                                    onClick={() => router.push(`/orders/${order.id}`)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={e => e.key === 'Enter' && router.push(`/orders/${order.id}`)}
                                    aria-label={`Order ${order.order_number} — ${customer?.name ?? 'Anonymous'} — ${ago}`}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: getStatusColor(order.status) }} aria-hidden="true" />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-xs tracking-tight">{order.order_number}</span>
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-border bg-card uppercase tracking-wide opacity-50">
                                                    {getStatusLabel(order.status)}
                                                </span>
                                            </div>
                                            <div className="text-[11px] font-bold opacity-40 uppercase tracking-wider mt-0.5">
                                                {customer?.name ?? 'Anonymous'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest">{ago}</span>
                                        <ChevronRight style={{ width: 12, height: 12, opacity: 0 }} className="group-hover:opacity-30 transition-opacity" aria-hidden="true" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
