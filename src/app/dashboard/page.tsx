'use client';

import { AppShell } from '@/components/app-shell';
import { useStore } from '@/lib/store';
import { KanbanBoard } from '@/components/kanban/kanban-board';
import { useState } from 'react';
import { Order } from '@/types';
import { formatCurrency, formatDate, getDueDateStatus, getStatusColor, getStatusLabel, getOrdersStats, getStaleOrders, getRelativeTime } from '@/lib/helpers';
import { LayoutGrid, List, Plus, AlertTriangle, Clock, TrendingUp, Package, Timer } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const STAT_COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#f97316'];

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
    return (
        <div className="neo-card p-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full" style={{ background: color }} />
            <div className="text-[12px] font-bold tracking-wide mb-1" style={{ color: 'var(--muted-foreground)' }}>{label}</div>
            <div className="text-2xl md:text-3xl font-black text-slate-800" style={{ marginTop: 4 }}>{value}</div>
            {sub && <div className="text-xs font-medium mt-1 text-slate-500">{sub}</div>}
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
                                <span className="font-bold text-sm" style={{ color: '#2563eb' }}>{order.order_number}</span>
                                <span className="status-pill" style={{ color: getStatusColor(order.status) }}>
                                    {getStatusLabel(order.status)}
                                </span>
                            </div>
                            <div className="text-sm font-medium text-gray-700">{customer?.name ?? '—'}</div>
                            <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
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
            </div>
        </>
    );
}

export default function DashboardPage() {
    const { orders, customers } = useStore();
    const router = useRouter();
    const [view, setView] = useState<'kanban' | 'table'>('kanban');
    const stats = getOrdersStats(orders);

    const urgentOrders = orders.filter(o => {
        const s = getDueDateStatus(o.due_date);
        return (s === 'overdue' || s === 'urgent') && o.status !== 'completed';
    });
    
    const readyForPickupOrders = orders.filter(o => o.is_ready_for_pickup && o.status === 'completed');
    const staleOrders = getStaleOrders(orders, 7);

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
                        <div className="flex rounded-lg overflow-hidden bg-white border border-slate-200 shadow-sm p-1">
                            <button onClick={() => setView('kanban')} className="px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold rounded-md transition-all"
                                style={{ background: view === 'kanban' ? '#f1f5f9' : 'transparent', color: view === 'kanban' ? '#0f172a' : '#64748b' }}>
                                <LayoutGrid style={{ width: 14, height: 14 }} /> Board
                            </button>
                            <button onClick={() => setView('table')} className="px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold rounded-md transition-all"
                                style={{ background: view === 'table' ? '#f1f5f9' : 'transparent', color: view === 'table' ? '#0f172a' : '#64748b' }}>
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

                {/* Urgent banner */}
                {urgentOrders.length > 0 && (
                    <div className="rounded-xl p-4 flex gap-3 bg-red-50 border border-red-200">
                        <AlertTriangle className="flex-shrink-0 mt-0.5" style={{ width: 18, height: 18, color: '#ef4444' }} />
                        <div>
                            <div className="font-bold text-sm text-red-700">{urgentOrders.length} order{urgentOrders.length > 1 ? 's' : ''} need attention</div>
                            <div className="text-xs mt-1 text-red-600/80">
                                {urgentOrders.map(o => o.order_number).join(', ')}
                            </div>
                        </div>
                    </div>
                )}

                {/* Pickup banner */}
                {readyForPickupOrders.length > 0 && (
                    <div className="rounded-xl p-4 flex gap-3 bg-blue-50 border border-blue-200">
                        <Package className="flex-shrink-0 mt-0.5" style={{ width: 18, height: 18, color: '#3b82f6' }} />
                        <div>
                            <div className="font-bold text-sm text-blue-700">{readyForPickupOrders.length} order{readyForPickupOrders.length > 1 ? 's' : ''} ready for pickup</div>
                            <div className="text-xs mt-1 text-blue-600/80">
                                Not in office: {readyForPickupOrders.map(o => o.order_number).join(', ')}
                            </div>
                        </div>
                    </div>
                )}

                {/* Stale orders banner */}
                {staleOrders.length > 0 && (
                    <div className="rounded-xl p-4 flex gap-3 bg-amber-50 border border-amber-200">
                        <Timer className="flex-shrink-0 mt-0.5" style={{ width: 18, height: 18, color: '#d97706' }} />
                        <div>
                            <div className="font-bold text-sm text-amber-800">{staleOrders.length} order{staleOrders.length > 1 ? 's' : ''} stuck in production</div>
                            <div className="text-xs mt-1 text-amber-700/80 flex flex-col gap-0.5">
                                {staleOrders.slice(0, 5).map(o => (
                                    <span key={o.id}>
                                        <strong>{o.order_number}</strong> — {o.staleDays}d in {o.staleStage}
                                    </span>
                                ))}
                                {staleOrders.length > 5 && <span>…and {staleOrders.length - 5} more</span>}
                            </div>
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
                        {orders
                            .slice()
                            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                            .slice(0, 8)
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
                                                <span className="text-xs ml-2" style={{ color: 'var(--muted-foreground)' }}>
                                                    {customer?.name ?? 'Unknown'} · {getStatusLabel(order.status)}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-xs flex-shrink-0" style={{ color: '#aaa' }}>{ago}</span>
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
