'use client';

import { AppShell } from '@/components/app-shell';
import { useStore } from '@/lib/store';
import { useMemo, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { ORDER_STAGES, MATERIAL_LABELS } from '@/types';
import { formatCurrency, getStatusColor } from '@/lib/helpers';
import { TrendingUp, Clock, Package, Euro } from 'lucide-react';

const WARM_PALETTE = ['#c9a227', '#e0be42', '#9a7c1a', '#b8956a', '#a89070', '#7aad8b', '#7b9eb8', '#8b8ead'];

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="glass-card p-3 text-sm" style={{ border: '1px solid rgba(212,168,50,0.2)' }}>
            <div className="font-semibold mb-1">{label}</div>
            {payload.map((p: any, i: number) => (
                <div key={i} style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' && p.value > 100 ? `€${p.value.toLocaleString()}` : p.value}</div>
            ))}
        </div>
    );
}

export default function AnalyticsPage() {
    const { orders, customers } = useStore();
    const [range, setRange] = useState<30 | 90 | 365>(90);

    const cutoff = new Date(Date.now() - range * 86400000);
    const rangeOrders = orders.filter(o => new Date(o.created_at) >= cutoff);

    // Stats
    const completedOrders = rangeOrders.filter(o => o.status === 'completed');
    const totalRevenue = completedOrders.reduce((s, o) => s + (o.price ?? 0), 0);
    const pendingRevenue = rangeOrders.filter(o => o.status !== 'completed').reduce((s, o) => s + (o.price ?? 0), 0);
    const avgPrice = completedOrders.length ? totalRevenue / completedOrders.length : 0;
    const avgTurnaround = useMemo(() => {
        const days = completedOrders.map(o => {
            const start = new Date(o.created_at).getTime();
            const end = new Date(o.updated_at).getTime();
            return (end - start) / 86400000;
        });
        return days.length ? Math.round(days.reduce((a, b) => a + b, 0) / days.length) : 0;
    }, [completedOrders]);

    // By stage (all orders)
    const byStage = ORDER_STAGES.map(s => ({
        name: s.label,
        count: orders.filter(o => o.status === s.key).length,
        color: s.color,
    })).filter(s => s.count > 0);

    // By material
    const materialCounts: Record<string, number> = {};
    rangeOrders.forEach(o => o.materials?.forEach(m => { materialCounts[m] = (materialCounts[m] ?? 0) + 1; }));
    const byMaterial = Object.entries(materialCounts)
        .map(([key, count]) => ({ name: MATERIAL_LABELS[key as keyof typeof MATERIAL_LABELS] ?? key, count }))
        .sort((a, b) => b.count - a.count);

    // By item type
    const itemCounts: Record<string, number> = {};
    rangeOrders.forEach(o => { itemCounts[o.item_type] = (itemCounts[o.item_type] ?? 0) + 1; });
    const byItemType = Object.entries(itemCounts)
        .map(([name, count]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), count }))
        .sort((a, b) => b.count - a.count);

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

    return (
        <AppShell>
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-lg font-semibold">Analytics</h1>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Workshop performance overview</p>
                    </div>
                    <div className="flex gap-1 rounded-lg p-1" style={{ background: 'var(--muted)' }}>
                        {([30, 90, 365] as const).map(r => (
                            <button key={r} onClick={() => setRange(r)}
                                className="px-3 py-1 rounded-md text-xs font-medium transition-all"
                                style={{ background: range === r ? 'var(--gold)' : 'transparent', color: range === r ? '#0c0b0e' : 'var(--muted-foreground)' }}>
                                {r === 365 ? '1y' : `${r}d`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* KPI cards */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                    {[
                        { label: 'Revenue', value: formatCurrency(totalRevenue), sub: `${completedOrders.length} completed`, icon: Euro },
                        { label: 'Pipeline', value: formatCurrency(pendingRevenue), sub: `${rangeOrders.length - completedOrders.length} active`, icon: Package },
                        { label: 'Avg. Order Value', value: formatCurrency(avgPrice), icon: TrendingUp },
                        { label: 'Avg. Turnaround', value: `${avgTurnaround} days`, icon: Clock },
                    ].map(kpi => (
                        <div key={kpi.label} className="glass-card p-4 flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--gold-subtle)' }}>
                                <kpi.icon style={{ width: 16, height: 16, color: 'var(--gold)' }} />
                            </div>
                            <div>
                                <div className="font-bold text-lg">{kpi.value}</div>
                                <div className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>{kpi.label}</div>
                                {kpi.sub && <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)', fontSize: '0.65rem' }}>{kpi.sub}</div>}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Monthly revenue */}
                    <div className="glass-card p-4">
                        <div className="text-sm font-medium mb-3">Monthly Revenue</div>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={monthlyRevenue}>
                                <XAxis dataKey="month" tick={{ fill: '#7a7468', fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#7a7468', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `€${(v / 1000).toFixed(0)}k`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="revenue" fill="#c9a227" radius={[3, 3, 0, 0]} name="Revenue" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Orders by stage */}
                    <div className="glass-card p-4">
                        <div className="text-sm font-medium mb-3">Orders by Stage</div>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={byStage} layout="vertical">
                                <XAxis type="number" tick={{ fill: '#7a7468', fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis type="category" dataKey="name" tick={{ fill: '#b0a898', fontSize: 10 }} axisLine={false} tickLine={false} width={90} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="count" radius={[0, 3, 3, 0]} name="Orders">
                                    {byStage.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Charts row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* By material */}
                    <div className="glass-card p-4">
                        <div className="text-sm font-medium mb-3">Orders by Material</div>
                        {byMaterial.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={byMaterial} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                                        {byMaterial.map((_, i) => <Cell key={i} fill={WARM_PALETTE[i % WARM_PALETTE.length]} />)}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : <div className="h-48 flex items-center justify-center text-sm" style={{ color: 'var(--muted-foreground)' }}>No data</div>}
                    </div>

                    {/* By item type */}
                    <div className="glass-card p-4">
                        <div className="text-sm font-medium mb-3">Orders by Item Type</div>
                        {byItemType.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={byItemType}>
                                    <XAxis dataKey="name" tick={{ fill: '#7a7468', fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#7a7468', fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="count" radius={[3, 3, 0, 0]} name="Orders">
                                        {byItemType.map((_, i) => <Cell key={i} fill={WARM_PALETTE[i % WARM_PALETTE.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <div className="h-48 flex items-center justify-center text-sm" style={{ color: 'var(--muted-foreground)' }}>No data</div>}
                    </div>
                </div>

                {/* Top customers */}
                <div className="glass-card overflow-hidden">
                    <div className="px-4 py-3 text-sm font-medium" style={{ borderBottom: '1px solid var(--border)' }}>Top Customers</div>
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                {['Customer', 'Total Orders', 'Lifetime Spend'].map(h => (
                                    <th key={h} className="text-left px-4 py-2.5 section-label">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {topCustomers.map((c, i) => (
                                <tr key={c.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    <td className="px-4 py-2.5 font-medium text-sm flex items-center gap-2">
                                        <span className="text-xs font-bold w-4 text-center" style={{ color: 'var(--gold)', fontSize: '0.65rem' }}>#{i + 1}</span> {c.name}
                                    </td>
                                    <td className="px-4 py-2.5 text-sm">{c.orders}</td>
                                    <td className="px-4 py-2.5 text-sm font-semibold" style={{ color: 'var(--gold)' }}>{formatCurrency(c.spend)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppShell>
    );
}
