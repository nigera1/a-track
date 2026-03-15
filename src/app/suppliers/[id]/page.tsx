'use client';

import { AppShell } from '@/components/app-shell';
import { useStore } from '@/lib/store';
import { useParams, useRouter } from 'next/navigation';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/helpers';
import { ArrowLeft, Phone, FileText, Package } from 'lucide-react';
import Link from 'next/link';

export default function SupplierDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { suppliers, orders, customers } = useStore();

    const supplier = suppliers.find(s => s.id === id);
    if (!supplier) {
        return (
            <AppShell>
                <div className="text-center py-20">
                    <div className="text-lg font-bold text-gray-500">Supplier not found</div>
                    <Link href="/suppliers" className="text-sm text-blue-500 mt-2 inline-block">← Back to Suppliers</Link>
                </div>
            </AppShell>
        );
    }

    const assignedOrders = orders.filter(o => o.supplier_id === id);
    const activeOrders = assignedOrders.filter(o => o.status !== 'completed');
    const completedOrders = assignedOrders.filter(o => o.status === 'completed');
    const totalValue = assignedOrders.reduce((sum, o) => sum + (o.price ?? 0), 0);

    const specialtyColors: Record<string, string> = { casting: '#8b5cf6', setting: '#ef4444', both: '#3b82f6' };

    return (
        <AppShell>
            <div className="max-w-4xl mx-auto flex flex-col gap-5">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link href="/suppliers" className="p-1.5 rounded-md hover:opacity-70 transition-opacity" style={{ color: 'var(--muted-foreground)' }}>
                        <ArrowLeft style={{ width: 16, height: 16 }} />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-xl font-black tracking-tight">{supplier.name}</h1>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                            style={{ background: `${specialtyColors[supplier.specialty]}15`, color: specialtyColors[supplier.specialty] }}>
                            {supplier.specialty === 'both' ? 'Casting & Setting' : supplier.specialty.charAt(0).toUpperCase() + supplier.specialty.slice(1)}
                        </span>
                    </div>
                </div>

                {/* Info + Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Contact card */}
                    <div className="neo-card p-4">
                        <div className="section-label mb-3">Contact Info</div>
                        {supplier.contact && (
                            <div className="flex items-center gap-2 text-sm mb-2">
                                <Phone style={{ width: 13, height: 13, color: '#6b7280' }} />
                                <span>{supplier.contact}</span>
                            </div>
                        )}
                        {supplier.notes && (
                            <div className="flex items-start gap-2 text-sm">
                                <FileText style={{ width: 13, height: 13, color: '#6b7280', marginTop: 2 }} />
                                <span className="text-gray-600">{supplier.notes}</span>
                            </div>
                        )}
                        {!supplier.contact && !supplier.notes && (
                            <div className="text-xs text-gray-400">No contact info</div>
                        )}
                    </div>
                    {/* Stats */}
                    <div className="neo-card p-4 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full" style={{ background: '#3b82f6' }} />
                        <div className="text-[11px] font-bold tracking-wide mb-1" style={{ color: 'var(--muted-foreground)' }}>ASSIGNED ORDERS</div>
                        <div className="text-3xl font-black text-slate-800">{assignedOrders.length}</div>
                        <div className="text-xs mt-1 text-slate-500">{activeOrders.length} active · {completedOrders.length} completed</div>
                    </div>
                    <div className="neo-card p-4 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full" style={{ background: '#22c55e' }} />
                        <div className="text-[11px] font-bold tracking-wide mb-1" style={{ color: 'var(--muted-foreground)' }}>TOTAL VALUE</div>
                        <div className="text-3xl font-black text-slate-800">{formatCurrency(totalValue)}</div>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="neo-card overflow-hidden">
                    <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)', background: 'var(--muted)' }}>
                        <Package style={{ width: 14, height: 14, color: '#6b7280' }} />
                        <span className="section-label">Assigned Orders</span>
                    </div>
                    {assignedOrders.length === 0 ? (
                        <div className="text-center py-10 text-sm text-gray-400">No orders assigned to this supplier yet.</div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--muted)' }}>
                                    {['Order #', 'Customer', 'Item', 'Stage', 'Due Date', 'Price'].map(h => (
                                        <th key={h} className="text-left px-4 py-2.5 section-label">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {assignedOrders.map(order => {
                                    const customer = customers.find(c => c.id === order.customer_id);
                                    return (
                                        <tr key={order.id} className="cursor-pointer hover:bg-slate-50 transition-colors"
                                            style={{ borderBottom: '1px solid #eee' }}
                                            onClick={() => router.push(`/orders/${order.id}`)}>
                                            <td className="px-4 py-2.5 font-bold text-xs">{order.order_number}</td>
                                            <td className="px-4 py-2.5 font-medium">{customer?.name ?? '—'}</td>
                                            <td className="px-4 py-2.5 capitalize">{order.item_type}</td>
                                            <td className="px-4 py-2.5">
                                                <span className="status-pill" style={{ color: getStatusColor(order.status) }}>
                                                    {getStatusLabel(order.status)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2.5">{formatDate(order.due_date)}</td>
                                            <td className="px-4 py-2.5 font-semibold">{formatCurrency(order.price)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </AppShell>
    );
}
