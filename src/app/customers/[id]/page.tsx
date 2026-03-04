'use client';

import { AppShell } from '@/components/app-shell';
import { useStore } from '@/lib/store';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Package, Phone, Mail, Edit3, Save, X, Plus } from 'lucide-react';
import Link from 'next/link';
import { formatDate, formatCurrency, getStatusColor, getStatusLabel } from '@/lib/helpers';
import { useState } from 'react';
import { toast } from 'sonner';
import { Customer } from '@/types';

export default function CustomerDetailPage() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const { customers, orders, updateCustomer } = useStore();
    const customer = customers.find(c => c.id === id);
    const customerOrders = orders.filter(o => o.customer_id === id);
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState<Partial<Customer>>({});

    if (!customer) return (
        <AppShell>
            <div className="flex flex-col items-center justify-center h-64 gap-4" style={{ color: 'var(--muted-foreground)' }}>
                <div className="text-4xl">404</div>
                <div>Customer not found</div>
                <Link href="/customers" className="text-sm" style={{ color: 'var(--gold)' }}>← Back</Link>
            </div>
        </AppShell>
    );

    function startEdit() {
        setEditData({ name: customer!.name, phone: customer!.phone, email: customer!.email, notes: customer!.notes });
        setEditing(true);
    }
    function saveEdit() {
        updateCustomer(id, editData);
        toast.success('Customer updated');
        setEditing(false);
    }

    const totalSpend = customerOrders.filter(o => o.status === 'completed').reduce((s, o) => s + (o.price ?? 0), 0);
    const activeOrders = customerOrders.filter(o => o.status !== 'completed').length;

    const inputCls = "w-full px-3 py-2 rounded-lg border text-sm";
    const inputStyle = { border: '1px solid var(--border)', background: 'var(--input)' };

    return (
        <AppShell>
            <div className="max-w-3xl mx-auto flex flex-col gap-6">
                {/* Back */}
                <div className="flex items-center justify-between">
                    <Link href="/customers" className="flex items-center gap-2 text-sm hover:opacity-80" style={{ color: 'var(--muted-foreground)' }}>
                        <ArrowLeft className="w-4 h-4" /> Customers
                    </Link>
                    <div className="flex gap-2">
                        {!editing ? (
                            <button onClick={startEdit} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm" style={{ background: 'var(--muted)' }}>
                                <Edit3 className="w-4 h-4" /> Edit
                            </button>
                        ) : (
                            <>
                                <button onClick={saveEdit} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm" style={{ background: 'var(--gold)', color: '#0a0a0f' }}>
                                    <Save className="w-4 h-4" /> Save
                                </button>
                                <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                                    <X className="w-4 h-4" /> Cancel
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Profile card */}
                <div className="glass-card p-6">
                    <div className="flex items-start gap-5">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, rgba(212,168,50,0.3), rgba(160,120,32,0.3))', color: 'var(--gold)' }}>
                            {customer.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        {!editing ? (
                            <div className="flex-1">
                                <h1 className="text-xl font-bold">{customer.name}</h1>
                                <div className="flex flex-col gap-1 mt-2">
                                    {customer.phone && <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted-foreground)' }}><Phone className="w-3.5 h-3.5" />{customer.phone}</div>}
                                    {customer.email && <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted-foreground)' }}><Mail className="w-3.5 h-3.5" />{customer.email}</div>}
                                    {customer.notes && <div className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>{customer.notes}</div>}
                                </div>
                                <div className="text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>Client since {formatDate(customer.created_at)}</div>
                            </div>
                        ) : (
                            <div className="flex-1 grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Name</label>
                                    <input value={editData.name ?? ''} onChange={e => setEditData(d => ({ ...d, name: e.target.value }))} className={inputCls} style={inputStyle} />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Phone</label>
                                    <input value={editData.phone ?? ''} onChange={e => setEditData(d => ({ ...d, phone: e.target.value }))} className={inputCls} style={inputStyle} />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Email</label>
                                    <input type="email" value={editData.email ?? ''} onChange={e => setEditData(d => ({ ...d, email: e.target.value }))} className={inputCls} style={inputStyle} />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Notes</label>
                                    <input value={editData.notes ?? ''} onChange={e => setEditData(d => ({ ...d, notes: e.target.value }))} className={inputCls} style={inputStyle} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Total Orders', value: customerOrders.length, color: 'var(--gold)' },
                        { label: 'Active', value: activeOrders, color: '#10b981' },
                        { label: 'Lifetime Spend', value: formatCurrency(totalSpend), color: '#8b5cf6' },
                    ].map(stat => (
                        <div key={stat.label} className="glass-card p-4 text-center">
                            <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                            <div className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Order history */}
                <div className="glass-card overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                        <div className="font-semibold flex items-center gap-2">
                            <Package className="w-4 h-4" style={{ color: 'var(--gold)' }} /> Order History
                        </div>
                        <Link href={`/orders/new`} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg" style={{ background: 'rgba(212,168,50,0.15)', color: 'var(--gold)' }}>
                            <Plus className="w-3.5 h-3.5" /> New Order
                        </Link>
                    </div>
                    {customerOrders.length === 0 ? (
                        <div className="py-12 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>No orders yet</div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    {['Order', 'Item', 'Stage', 'Due Date', 'Price'].map(h => (
                                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {customerOrders.map(order => (
                                    <tr key={order.id} className="cursor-pointer" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                                        onClick={() => router.push(`/orders/${order.id}`)}>
                                        <td className="px-5 py-3 font-mono font-semibold" style={{ color: 'var(--gold)' }}>{order.order_number}</td>
                                        <td className="px-5 py-3 capitalize">{order.item_type}</td>
                                        <td className="px-5 py-3">
                                            <span className="status-pill" style={{ background: `${getStatusColor(order.status)}20`, color: getStatusColor(order.status) }}>
                                                {getStatusLabel(order.status)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3" style={{ color: 'var(--muted-foreground)' }}>{formatDate(order.due_date)}</td>
                                        <td className="px-5 py-3">{formatCurrency(order.price)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </AppShell>
    );
}
