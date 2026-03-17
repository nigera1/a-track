'use client';

import { AppShell } from '@/components/app-shell';
import { useStore } from '@/lib/store';
import { useMemo, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { ORDER_STAGES, MATERIAL_LABELS } from '@/types';
import { formatCurrency, getStatusColor, getStatusLabel } from '@/lib/helpers';
import { TrendingUp, Clock, Package, Euro, Download } from 'lucide-react';
import { ITEM_TYPE_LABELS, MATERIAL_LABELS as MAT_LABELS_MAP } from '@/types';

const NEO_PALETTE = ['#1C7ED6', '#E03131', '#FCC419', '#000000', '#1C7ED6', '#E03131', '#FCC419', '#000000'];

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="neo-card p-3 text-sm">
            <div className="font-black mb-1 uppercase text-xs tracking-wide">{label}</div>
            {payload.map((p: any, i: number) => (
                <div key={i} style={{ color: p.color, fontWeight: 700 }}>{p.name}: {typeof p.value === 'number' && p.value > 100 ? `€${p.value.toLocaleString()}` : p.value}</div>
            ))}
        </div>
    );
}

export default function AnalyticsPage() {
    const { orders, customers } = useStore();
    const [range, setRange] = useState<30 | 90 | 365>(90);

    const cutoff = useMemo(() => new Date(Date.now() - range * 86400000), [range]);
    const rangeOrders = useMemo(() => orders.filter(o => new Date(o.created_at) >= cutoff), [orders, cutoff]);

    const { completedOrders, totalRevenue, pendingRevenue, avgPrice, avgTurnaround, byStage, byMaterial, byItemType } = useMemo(() => {
        const completed = rangeOrders.filter(o => o.status === 'completed');
        const tr = completed.reduce((s, o) => s + (o.price ?? 0), 0);
        const pr = rangeOrders.filter(o => o.status !== 'completed').reduce((s, o) => s + (o.price ?? 0), 0);
        const ap = completed.length ? tr / completed.length : 0;

        const days = completed.map(o => {
            const start = new Date(o.created_at).getTime();
            const end = new Date(o.updated_at).getTime();
            return (end - start) / 86400000;
        });
        const turn = days.length ? Math.round(days.reduce((a, b) => a + b, 0) / days.length) : 0;

        const stage = ORDER_STAGES.map(s => ({
            name: s.label,
            count: orders.filter(o => o.status === s.key).length,
            color: s.color,
        })).filter(s => s.count > 0);

        const mCounts: Record<string, number> = {};
        rangeOrders.forEach(o => o.materials?.forEach(m => { mCounts[m] = (mCounts[m] ?? 0) + 1; }));
        const bm = Object.entries(mCounts)
            .map(([key, count]) => ({ name: MATERIAL_LABELS[key as keyof typeof MATERIAL_LABELS] ?? key, count }))
            .sort((a, b) => b.count - a.count);

        const iCounts: Record<string, number> = {};
        rangeOrders.forEach(o => { iCounts[o.item_type] = (iCounts[o.item_type] ?? 0) + 1; });
        const bi = Object.entries(iCounts)
            .map(([name, count]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), count }))
            .sort((a, b) => b.count - a.count);

        return {
            completedOrders: completed, totalRevenue: tr, pendingRevenue: pr, avgPrice: ap, avgTurnaround: turn,
            byStage: stage, byMaterial: bm, byItemType: bi
        };
    }, [orders, rangeOrders]);

    // Monthly revenue (last 6 months)
    const monthlyRevenue = useMemo(() => {
        const months: Record<string, number> = {};
        for (let i = 5; i >= 0; i--) {
            const d = new Date(); d.setMonth(d.getMonth() - i);
            months[d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })] = 0;
        }
        completedOrders.forEach(o => {
            const d = new Date(o.updated_at);
            const key = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
            if (key in months) months[key] += o.price ?? 0;
        });
        return Object.entries(months).map(([month, revenue]) => ({ month, revenue }));
    }, [completedOrders]);

    // Top customers
    const topCustomers = useMemo(() => {
        return customers.map(c => ({
            name: c.name,
            orders: orders.filter(o => o.customer_id === c.id).length,
            spend: orders.filter(o => o.customer_id === c.id && o.status === 'completed').reduce((s, o) => s + (o.price ?? 0), 0),
        })).sort((a, b) => b.spend - a.spend).slice(0, 5);
    }, [customers, orders]);

    // Avg time per stage (from QR scan records)
    const avgStageTimes = useMemo(() => {
        const acc: Record<string, { total: number; count: number }> = {};
        orders.forEach(o => {
            o.stage_times?.forEach(t => {
                if (t.duration_minutes != null) {
                    if (!acc[t.stage]) acc[t.stage] = { total: 0, count: 0 };
                    acc[t.stage].total += t.duration_minutes;
                    acc[t.stage].count += 1;
                }
            });
        });
        return ORDER_STAGES
            .map(s => ({ name: s.label, avgDays: acc[s.key] ? +(acc[s.key].total / acc[s.key].count / 1440).toFixed(1) : 0, color: s.color }))
            .filter(s => s.avgDays > 0);
    }, [orders]);

    return (
        <AppShell>
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight">Analytics</h1>
                        <p className="text-sm font-semibold" style={{ color: '#888' }}>Workshop performance overview</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => {
                            const header = 'Order #,Customer,Item Type,Material,Stage,Due Date,Price,Created';
                            const rows = orders.map(o => {
                                const cust = customers.find(c => c.id === o.customer_id);
                                return [
                                    o.order_number,
                                    `"${cust?.name ?? ''}"`,
                                    ITEM_TYPE_LABELS[o.item_type] ?? o.item_type,
                                    o.materials?.map(m => MAT_LABELS_MAP[m] ?? m).join('; ') ?? '',
                                    getStatusLabel(o.status),
                                    o.due_date ?? '',
                                    o.price ?? '',
                                    o.created_at?.split('T')[0] ?? '',
                                ].join(',');
                            });
                            const csv = [header, ...rows].join('\n');
                            const blob = new Blob([csv], { type: 'text/csv' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url; a.download = `atrack-orders-${new Date().toISOString().split('T')[0]}.csv`;
                            a.click(); URL.revokeObjectURL(url);
                        }} className="neo-btn flex items-center gap-1.5 text-xs">
                            <Download style={{ width: 13, height: 13 }} /> Export CSV
                        </button>
                        <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                            {([30, 90, 365] as const).map((r, i) => (
                                <button key={r} onClick={() => setRange(r)}
                                    className="px-3 py-1.5 text-xs font-black uppercase tracking-wide transition-all"
                                    style={{ background: range === r ? '#111' : '#fff', color: range === r ? '#fff' : '#111', borderLeft: i > 0 ? '1px solid var(--border)' : 'none' }}>
                                    {r === 365 ? '1y' : `${r}d`}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* KPI cards */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                    {[
                        { label: 'Revenue', value: formatCurrency(totalRevenue), sub: `${completedOrders.length} completed`, color: 'var(--gold)' },
                        { label: 'Pipeline', value: formatCurrency(pendingRevenue), sub: `${rangeOrders.length - completedOrders.length} active`, color: 'var(--blue)' },
                        { label: 'Avg. Order', value: formatCurrency(avgPrice), color: '#000' },
                        { label: 'Turnaround', value: `${avgTurnaround}d`, color: 'var(--red)' },
                    ].map((kpi, i) => (
                        <div key={kpi.label} className="neo-card p-4" style={{ borderLeft: `6px solid ${kpi.color}` }}>
                            <div className="section-label mb-1" style={{ color: kpi.color === '#000' ? 'var(--foreground)' : kpi.color }}>{kpi.label}</div>
                            <div className="text-2xl font-black">{kpi.value}</div>
                            {kpi.sub && <div className="text-xs font-semibold mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{kpi.sub}</div>}
                        </div>
                    ))}
                </div>

                {/* Charts row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Monthly revenue */}
                    <div className="neo-card p-4">
                        <div className="section-label mb-3">Monthly Revenue</div>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={monthlyRevenue}>
                                <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `€${(v / 1000).toFixed(0)}k`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="revenue" fill="var(--blue)" radius={[0, 0, 0, 0]} name="Revenue" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Orders by stage */}
                    <div className="neo-card p-4">
                        <div className="section-label mb-3">Orders by Stage</div>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={byStage} layout="vertical">
                                <XAxis type="number" tick={{ fill: '#7a7468', fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis type="category" dataKey="name" tick={{ fill: '#b0a898', fontSize: 10 }} axisLine={false} tickLine={false} width={90} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="count" radius={[0, 0, 0, 0]} name="Orders">
                                    {byStage.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Charts row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* By material */}
                    <div className="neo-card p-4">
                        <div className="section-label mb-3">Orders by Material</div>
                        {byMaterial.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={byMaterial} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={75} stroke="var(--card)" strokeWidth={3} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                                        {byMaterial.map((_, i) => <Cell key={i} fill={NEO_PALETTE[i % NEO_PALETTE.length]} />)}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : <div className="h-48 flex items-center justify-center text-sm" style={{ color: 'var(--muted-foreground)' }}>No data</div>}
                    </div>

                    {/* By item type */}
                    <div className="neo-card p-4">
                        <div className="section-label mb-3">Orders by Item Type</div>
                        {byItemType.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={byItemType}>
                                    <XAxis dataKey="name" tick={{ fill: '#7a7468', fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#7a7468', fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="count" radius={[0, 0, 0, 0]} name="Orders">
                                        {byItemType.map((_, i) => <Cell key={i} fill={NEO_PALETTE[i % NEO_PALETTE.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <div className="h-48 flex items-center justify-center text-sm" style={{ color: 'var(--muted-foreground)' }}>No data</div>}
                    </div>
                </div>

                {/* Stage time chart */}
                {avgStageTimes.length > 0 && (
                    <div className="neo-card p-4">
                        <div className="section-label mb-1">Avg. Time per Stage</div>
                        <div className="text-xs font-semibold mb-3" style={{ color: '#888' }}>Based on QR scan records (days)</div>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={avgStageTimes}>
                                <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}d`} />
                                <Tooltip content={<CustomTooltip />} formatter={(v: any) => [`${v} days`, 'Avg time']} />
                                <Bar dataKey="avgDays" radius={[0, 0, 0, 0]} name="Avg Days">
                                    {avgStageTimes.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Top customers */}
                <div className="neo-card overflow-hidden">
                    <div className="px-4 py-3 section-label" style={{ borderBottom: '1px solid var(--border)' }}>Top Customers</div>
                    <div className="overflow-x-auto">
                    <table className="w-full text-sm" style={{ minWidth: 400 }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #eee', background: '#f8f8f8' }}>
                                {['Customer', 'Orders', 'Lifetime Spend'].map(h => (
                                    <th key={h} className="text-left px-4 py-2.5 section-label">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {topCustomers.map((c, i) => (
                                <tr key={c.name} style={{ borderBottom: '1px solid #eee' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                                    onMouseLeave={e => (e.currentTarget.style.background = '')}>
                                    <td className="px-4 py-2.5 font-semibold flex items-center gap-2">
                                        <span className="text-xs font-black" style={{ color: ['var(--gold)', 'var(--blue)', 'var(--red)'][i] ?? 'var(--muted-foreground)' }}>#{i + 1}</span> {c.name}
                                    </td>
                                    <td className="px-4 py-2.5 font-bold">{c.orders}</td>
                                    <td className="px-4 py-2.5 font-black">{formatCurrency(c.spend)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
