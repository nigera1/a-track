'use client';

import { AppShell } from '@/components/app-shell';
import { useStore } from '@/lib/store';
import { formatCurrency, formatDate, getDueDateStatus, getStatusColor, getStatusLabel } from '@/lib/helpers';
import { ITEM_TYPE_LABELS, MATERIAL_LABELS, ORDER_STAGES } from '@/types';
import { useState, useMemo } from 'react';
import { Plus, Search, AlertTriangle, X, ChevronUp, ChevronDown, Package } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type SortKey = 'order_number' | 'customer' | 'due_date' | 'price' | 'status';
type SortDir = 'asc' | 'desc';

export default function OrdersPage() {
    const { orders, customers } = useStore();
    const router = useRouter();

    const [search, setSearch] = useState('');
    const [stageFilter, setStageFilter] = useState('all');
    const [materialFilter, setMaterialFilter] = useState('all');
    const [itemFilter, setItemFilter] = useState('all');
    const [dueDateFilter, setDueDateFilter] = useState('all'); // all | overdue | urgent | ok
    const [sortKey, setSortKey] = useState<SortKey>('order_number');
    const [sortDir, setSortDir] = useState<SortDir>('asc');

    const activeFilterCount = [
        stageFilter !== 'all',
        materialFilter !== 'all',
        itemFilter !== 'all',
        dueDateFilter !== 'all',
        search !== '',
    ].filter(Boolean).length;

    function clearAll() {
        setSearch('');
        setStageFilter('all');
        setMaterialFilter('all');
        setItemFilter('all');
        setDueDateFilter('all');
    }

    function toggleSort(key: SortKey) {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('asc'); }
    }

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        let result = orders.filter(o => {
            const customer = customers.find(c => c.id === o.customer_id);
            const dueStatus = getDueDateStatus(o.due_date);
            const matchSearch = !q ||
                o.order_number.toLowerCase().includes(q) ||
                (customer?.name.toLowerCase().includes(q) ?? false) ||
                ITEM_TYPE_LABELS[o.item_type].toLowerCase().includes(q) ||
                o.materials.some(m => MATERIAL_LABELS[m].toLowerCase().includes(q));
            const matchStage = stageFilter === 'all' || o.status === stageFilter;
            const matchMaterial = materialFilter === 'all' || o.materials.includes(materialFilter as any);
            const matchItem = itemFilter === 'all' || o.item_type === itemFilter;
            const matchDue = dueDateFilter === 'all' ||
                (dueDateFilter === 'overdue' && dueStatus === 'overdue') ||
                (dueDateFilter === 'urgent' && dueStatus === 'urgent') ||
                (dueDateFilter === 'ok' && (dueStatus === 'normal' || dueStatus === 'none'));
            return matchSearch && matchStage && matchMaterial && matchItem && matchDue;
        });

        result = [...result].sort((a, b) => {
            let av: string | number = 0;
            let bv: string | number = 0;
            if (sortKey === 'order_number') { av = a.order_number; bv = b.order_number; }
            else if (sortKey === 'customer') {
                av = customers.find(c => c.id === a.customer_id)?.name ?? '';
                bv = customers.find(c => c.id === b.customer_id)?.name ?? '';
            }
            else if (sortKey === 'due_date') { av = a.due_date ?? ''; bv = b.due_date ?? ''; }
            else if (sortKey === 'price') { av = a.price ?? 0; bv = b.price ?? 0; }
            else if (sortKey === 'status') { av = a.status; bv = b.status; }
            if (av < bv) return sortDir === 'asc' ? -1 : 1;
            if (av > bv) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [orders, customers, search, stageFilter, materialFilter, itemFilter, dueDateFilter, sortKey, sortDir]);

    function SortIcon({ col }: { col: SortKey }) {
        if (sortKey !== col) return <ChevronUp style={{ width: 10, height: 10, opacity: 0.3 }} />;
        return sortDir === 'asc'
            ? <ChevronUp style={{ width: 10, height: 10 }} />
            : <ChevronDown style={{ width: 10, height: 10 }} />;
    }

    const selectStyle = {
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 12,
        fontWeight: 600,
        cursor: 'pointer',
        appearance: 'none' as const,
        flex: '1 1 auto',
        minWidth: 0,
        background: 'var(--input)',
        color: 'var(--foreground)',
    };

    return (
        <AppShell>
            <div className="flex flex-col gap-5">

                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight">Orders</h1>
                        <p className="text-sm font-semibold" style={{ color: 'var(--muted-foreground)' }}>
                            {orders.length} active orders
                            {activeFilterCount > 0 && <span style={{ color: '#3b82f6' }}> · {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active</span>}
                        </p>
                    </div>
                    <Link href="/orders/new" className="neo-btn neo-btn-primary">
                        <Plus style={{ width: 13, height: 13 }} /> New Order
                    </Link>
                </div>

                {/* ── STUCK IN PRODUCTION BANNER ── */}
                {(() => {
                    const stuckOrders = orders.filter(o => {
                        if (o.status === 'completed') return false;
                        if (!o.stage_times?.length) return false;
                        const currentStageLog = o.stage_times.find(s => s.stage === o.status && !s.finished_at);
                        if (!currentStageLog) return false;
                        const daysInStage = Math.ceil((Date.now() - new Date(currentStageLog.started_at).getTime()) / 86400000);
                        return daysInStage >= 7;
                    }).map(o => {
                        const currentStageLog = o.stage_times!.find(s => s.stage === o.status && !s.finished_at)!;
                        const days = Math.ceil((Date.now() - new Date(currentStageLog.started_at).getTime()) / 86400000);
                        return { ...o, daysStuck: days, stuckStage: getStatusLabel(o.status) };
                    }).sort((a, b) => b.daysStuck - a.daysStuck);

                    if (stuckOrders.length === 0) return null;

                    return (
                        <div className="neo-card" style={{
                            padding: '16px 20px',
                            borderLeft: '5px solid #ef4444',
                            background: 'var(--card)',
                        }}>
                            <div className="flex items-center gap-2 mb-3">
                                <AlertTriangle style={{ width: 20, height: 20, color: '#ef4444', flexShrink: 0 }} />
                                <span style={{ fontWeight: 800, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#ef4444' }}>
                                    {stuckOrders.length} order{stuckOrders.length > 1 ? 's' : ''} stuck in production
                                </span>
                            </div>
                            <div className="flex flex-col gap-2">
                                {stuckOrders.map(o => (
                                    <div key={o.id}
                                        className="flex items-center justify-between gap-3 cursor-pointer px-3 py-2 -mx-1 rounded transition-colors"
                                        style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
                                        onClick={() => router.push(`/orders/${o.id}`)}>
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <span style={{ fontWeight: 800, fontSize: 13, color: '#ef4444' }}>{o.order_number}</span>
                                            <span className="status-pill" style={{ color: getStatusColor(o.status) }}>{o.stuckStage}</span>
                                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted-foreground)' }}>
                                                {customers.find(c => c.id === o.customer_id)?.name}
                                            </span>
                                        </div>
                                        <span style={{ fontWeight: 800, fontSize: 13, color: '#ef4444', whiteSpace: 'nowrap' }}>
                                            {o.daysStuck}d
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })()}

                {/* Search + Filter bar */}
                <div className="neo-card p-4 flex flex-col gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'var(--muted-foreground)' }} />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by order #, customer, item type, material…"
                            className="placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
                            style={{
                                width: '100%',
                                paddingLeft: 36,
                                paddingRight: search ? 36 : 12,
                                paddingTop: 10,
                                paddingBottom: 10,
                                border: '1px solid var(--border)',
                                borderRadius: 8,
                                fontSize: 13,
                                fontWeight: 600,
                                outline: 'none',
                                boxSizing: 'border-box',
                                background: 'var(--input)',
                                color: 'var(--foreground)'
                            }}
                        />
                        {search && (
                            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}>
                                <X style={{ width: 14, height: 14, color: 'var(--muted-foreground)' }} />
                            </button>
                        )}
                    </div>

                    {/* Filter row */}
                    <div className="flex flex-wrap gap-2 items-center" style={{ display: 'flex' }}>
                        <select className="transition-colors" value={stageFilter} onChange={e => setStageFilter(e.target.value)} style={selectStyle}>
                            <option value="all">All Stages</option>
                            {ORDER_STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                        </select>

                        <select className="transition-colors" value={itemFilter} onChange={e => setItemFilter(e.target.value)} style={selectStyle}>
                            <option value="all">All Item Types</option>
                            {Object.entries(ITEM_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>

                        <select className="transition-colors" value={materialFilter} onChange={e => setMaterialFilter(e.target.value)} style={selectStyle}>
                            <option value="all">All Materials</option>
                            {Object.entries(MATERIAL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>

                        <select className="transition-colors" value={dueDateFilter} onChange={e => setDueDateFilter(e.target.value)} style={selectStyle}>
                            <option value="all">Any Due Date</option>
                            <option value="overdue">🔴 Overdue</option>
                            <option value="urgent">🟠 Due Soon (3 days)</option>
                            <option value="ok">🟢 On Track</option>
                        </select>

                        {activeFilterCount > 0 && (
                            <button onClick={clearAll} className="neo-btn" style={{ fontSize: 11, color: '#ef4444' }}>
                                <X style={{ width: 11, height: 11 }} /> Clear all
                            </button>
                        )}
                    </div>

                    {/* Active filter chips */}
                    {activeFilterCount > 0 && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {search && (
                                <span className="status-pill" style={{ color: '#3b82f6', cursor: 'pointer' }} onClick={() => setSearch('')}>
                                    "{search}" ✕
                                </span>
                            )}
                            {stageFilter !== 'all' && (
                                <span className="status-pill" style={{ color: getStatusColor(stageFilter as any), cursor: 'pointer' }} onClick={() => setStageFilter('all')}>
                                    {getStatusLabel(stageFilter as any)} ✕
                                </span>
                            )}
                            {itemFilter !== 'all' && (
                                <span className="status-pill" style={{ color: '#8b5cf6', cursor: 'pointer' }} onClick={() => setItemFilter('all')}>
                                    {ITEM_TYPE_LABELS[itemFilter as keyof typeof ITEM_TYPE_LABELS]} ✕
                                </span>
                            )}
                            {materialFilter !== 'all' && (
                                <span className="status-pill" style={{ color: '#f97316', cursor: 'pointer' }} onClick={() => setMaterialFilter('all')}>
                                    {MATERIAL_LABELS[materialFilter as keyof typeof MATERIAL_LABELS]} ✕
                                </span>
                            )}
                            {dueDateFilter !== 'all' && (
                                <span className="status-pill" style={{ color: dueDateFilter === 'overdue' ? '#ef4444' : dueDateFilter === 'urgent' ? '#f97316' : '#22c55e', cursor: 'pointer' }} onClick={() => setDueDateFilter('all')}>
                                    {dueDateFilter === 'overdue' ? 'Overdue' : dueDateFilter === 'urgent' ? 'Due Soon' : 'On Track'} ✕
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden flex flex-col gap-3">
                    {filtered.length === 0 && (
                        <div className="text-center py-16">
                            <Search style={{ width: 32, height: 32, color: 'var(--muted-foreground)', margin: '0 auto 12px' }} />
                            <div className="font-semibold text-sm" style={{ color: '#bbb' }}>No orders match your filters</div>
                            <button onClick={clearAll} className="neo-btn text-xs mt-3">Clear filters</button>
                        </div>
                    )}
                    {filtered.map(order => {
                        const customer = customers.find(c => c.id === order.customer_id);
                        const dueStatus = getDueDateStatus(order.due_date);
                        return (
                            <div key={order.id} className="mobile-order-card"
                                onClick={() => router.push(`/orders/${order.id}`)}>
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <span className="font-bold text-sm" style={{ color: '#2563eb' }}>{order.order_number}</span>
                                        {order.is_ready_for_pickup && order.status === 'completed' && (
                                            <Package className="inline ml-1.5" style={{ width: 13, height: 13, color: '#3b82f6' }} />
                                        )}
                                    </div>
                                    <span className="status-pill" style={{ color: getStatusColor(order.status) }}>
                                        {getStatusLabel(order.status)}
                                    </span>
                                </div>
                                <div className="text-sm font-medium text-gray-700 mb-1">{customer?.name ?? '—'}</div>
                                <div className="text-xs text-gray-400 mb-2">{ITEM_TYPE_LABELS[order.item_type]} · {order.materials.map(m => MATERIAL_LABELS[m]).join(', ') || 'No material'}</div>
                                <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                                    <span className="text-xs font-semibold"
                                        style={{ color: dueStatus === 'overdue' ? '#ef4444' : dueStatus === 'urgent' ? '#f97316' : '#888' }}>
                                        {dueStatus === 'overdue' && <AlertTriangle className="inline mr-1" style={{ width: 11, height: 11 }} />}
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
                        <table className="w-full text-sm" style={{ borderCollapse: 'collapse', minWidth: 700 }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--muted)' }}>
                                    {[
                                        { label: 'Order #', col: 'order_number' as SortKey },
                                        { label: 'Customer', col: 'customer' as SortKey },
                                        { label: 'Item', col: null },
                                        { label: 'Material', col: null },
                                        { label: 'Stage', col: 'status' as SortKey },
                                        { label: 'Due Date', col: 'due_date' as SortKey },
                                        { label: 'Price', col: 'price' as SortKey },
                                    ].map(h => (
                                        <th key={h.label}
                                            className="text-left px-5 py-3 section-label whitespace-nowrap"
                                            style={{ cursor: h.col ? 'pointer' : 'default', userSelect: 'none' }}
                                            onClick={() => h.col && toggleSort(h.col)}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                {h.label}
                                                {h.col && <SortIcon col={h.col} />}
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="text-center py-16">
                                            <div className="flex flex-col items-center gap-3">
                                                <Search style={{ width: 32, height: 32, color: '#ddd' }} />
                                                <div className="font-semibold text-sm" style={{ color: '#bbb' }}>No orders match your filters</div>
                                                <button onClick={clearAll} className="neo-btn text-xs">Clear filters</button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {filtered.map(order => {
                                    const customer = customers.find(c => c.id === order.customer_id);
                                    const dueStatus = getDueDateStatus(order.due_date);
                                    return (
                                        <tr key={order.id} className="cursor-pointer"
                                            style={{ borderBottom: '1px solid #eee' }}
                                            onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                                            onMouseLeave={e => (e.currentTarget.style.background = '')}
                                            onClick={() => router.push(`/orders/${order.id}`)}>
                                            <td className="px-5 py-3 font-bold text-xs">
                                                {order.order_number}
                                                {order.is_ready_for_pickup && order.status === 'completed' && (
                                                    <span title="Ready for pickup">
                                                        <Package className="inline ml-1.5" style={{ width: 13, height: 13, color: '#3b82f6' }} />
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 font-semibold">{customer?.name ?? '—'}</td>
                                            <td className="px-5 py-3">{ITEM_TYPE_LABELS[order.item_type]}</td>
                                            <td className="px-5 py-3 text-xs" style={{ color: '#888' }}>
                                                {order.materials.map(m => MATERIAL_LABELS[m]).join(', ') || '—'}
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className="status-pill" style={{ color: getStatusColor(order.status) }}>
                                                    {getStatusLabel(order.status)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap font-semibold text-xs"
                                                style={{ color: dueStatus === 'overdue' ? '#ef4444' : dueStatus === 'urgent' ? '#f97316' : '#888' }}>
                                                {dueStatus === 'overdue' && <AlertTriangle style={{ display: 'inline', marginRight: 4, width: 11, height: 11 }} />}
                                                {formatDate(order.due_date)}
                                            </td>
                                            <td className="px-4 py-3 font-bold">{formatCurrency(order.price)}</td>
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
