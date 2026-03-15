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
        background: '#fff',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 12,
        fontWeight: 700,
        cursor: 'pointer',
        appearance: 'none' as const,
    };

    return (
        <AppShell>
            <div className="flex flex-col gap-5">

                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight">Orders</h1>
                        <p className="text-sm font-semibold" style={{ color: '#888' }}>
                            {filtered.length} of {orders.length} orders
                            {activeFilterCount > 0 && <span style={{ color: '#3b82f6' }}> · {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active</span>}
                        </p>
                    </div>
                    <Link href="/orders/new" className="neo-btn neo-btn-primary">
                        <Plus style={{ width: 13, height: 13 }} /> New Order
                    </Link>
                </div>

                {/* Search + Filter bar */}
                <div className="neo-card p-4 flex flex-col gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#888' }} />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by order #, customer, item type, material…"
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
                                background: '#fff',
                                outline: 'none',
                                boxSizing: 'border-box',
                            }}
                        />
                        {search && (
                            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}>
                                <X style={{ width: 14, height: 14, color: '#888' }} />
                            </button>
                        )}
                    </div>

                    {/* Filter row */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <select value={stageFilter} onChange={e => setStageFilter(e.target.value)} style={selectStyle}>
                            <option value="all">All Stages</option>
                            {ORDER_STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                        </select>

                        <select value={itemFilter} onChange={e => setItemFilter(e.target.value)} style={selectStyle}>
                            <option value="all">All Item Types</option>
                            {Object.entries(ITEM_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>

                        <select value={materialFilter} onChange={e => setMaterialFilter(e.target.value)} style={selectStyle}>
                            <option value="all">All Materials</option>
                            {Object.entries(MATERIAL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>

                        <select value={dueDateFilter} onChange={e => setDueDateFilter(e.target.value)} style={selectStyle}>
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

                {/* Table */}
                <div className="neo-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
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
                                            className="text-left px-4 py-3 section-label whitespace-nowrap"
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
                                                <div className="font-black text-sm" style={{ color: '#bbb' }}>No orders match your filters</div>
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
                                            <td className="px-4 py-3 font-black text-xs">
                                                {order.order_number}
                                                {order.is_ready_for_pickup && order.status === 'completed' && (
                                                    <span title="Ready for pickup">
                                                        <Package className="inline ml-1.5" style={{ width: 13, height: 13, color: '#3b82f6' }} />
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 font-semibold">{customer?.name ?? '—'}</td>
                                            <td className="px-4 py-3">{ITEM_TYPE_LABELS[order.item_type]}</td>
                                            <td className="px-4 py-3 text-xs" style={{ color: '#888' }}>
                                                {order.materials.map(m => MATERIAL_LABELS[m]).join(', ') || '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="status-pill" style={{ color: getStatusColor(order.status) }}>
                                                    {getStatusLabel(order.status)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap font-semibold text-xs"
                                                style={{ color: dueStatus === 'overdue' ? '#ef4444' : dueStatus === 'urgent' ? '#f97316' : '#888' }}>
                                                {dueStatus === 'overdue' && <AlertTriangle style={{ display: 'inline', marginRight: 4, width: 11, height: 11 }} />}
                                                {formatDate(order.due_date)}
                                            </td>
                                            <td className="px-4 py-3 font-black">{formatCurrency(order.price)}</td>
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
