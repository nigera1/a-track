'use client';

import { AppShell } from '@/components/app-shell';
import { useStore } from '@/lib/store';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Phone, Mail, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate, formatCurrency } from '@/lib/helpers';

export default function CustomersPage() {
    const { customers, orders, addCustomer, deleteCustomer } = useStore();
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [notes, setNotes] = useState('');

    const filtered = customers.filter(c =>
        !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.includes(search) || c.email?.includes(search)
    );

    function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        if (!name) { toast.error('Name is required'); return; }
        addCustomer({ name, phone, email: email || undefined, notes: notes || undefined });
        toast.success(`${name} added`);
        setName(''); setPhone(''); setEmail(''); setNotes('');
        setShowForm(false);
    }

    const inputCls = "w-full px-3 py-2 rounded-lg border text-sm";

    return (
        <AppShell>
            <div className="flex flex-col gap-5">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight">Customers</h1>
                        <p className="text-sm font-semibold" style={{ color: '#888' }}>{customers.length} clients</p>
                    </div>
                    <button onClick={() => setShowForm(!showForm)} className="neo-btn neo-btn-primary">
                        <Plus style={{ width: 13, height: 13 }} /> Add Customer
                    </button>
                </div>

                {/* Add form */}
                {showForm && (
                    <form onSubmit={handleAdd} className="neo-card p-5 flex flex-col gap-4">
                        <div className="section-label">New Customer</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="section-label mb-1.5 block">Name *</label>
                                <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" className={inputCls} style={{ border: '1px solid var(--border)' }} />
                            </div>
                            <div>
                                <label className="section-label mb-1.5 block">Phone</label>
                                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+39 02 …" className={inputCls} style={{ border: '1px solid var(--border)' }} />
                            </div>
                            <div>
                                <label className="section-label mb-1.5 block">Email</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@domain.com" className={inputCls} style={{ border: '1px solid var(--border)' }} />
                            </div>
                            <div>
                                <label className="section-label mb-1.5 block">Notes</label>
                                <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Preferences…" className={inputCls} style={{ border: '1px solid var(--border)' }} />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" className="neo-btn neo-btn-primary">Save Customer</button>
                            <button type="button" onClick={() => setShowForm(false)} className="neo-btn" style={{ color: '#888' }}>Cancel</button>
                        </div>
                    </form>
                )}

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2" style={{ width: 14, height: 14, color: 'var(--muted-foreground)' }} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers…"
                        className="w-full pl-8 pr-4 py-2 rounded-lg text-sm" style={{ border: '1px solid var(--border)' }} />
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {filtered.map(customer => {
                        const customerOrders = orders.filter(o => o.customer_id === customer.id);
                        const totalSpend = customerOrders.filter(o => o.status === 'completed').reduce((s, o) => s + (o.price ?? 0), 0);
                        const activeOrders = customerOrders.filter(o => o.status !== 'completed').length;
                        return (
                            <div key={customer.id} className="neo-card p-4 flex flex-col gap-3 cursor-pointer group"
                                onClick={() => router.push(`/customers/${customer.id}`)}>
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded flex items-center justify-center text-xs font-black flex-shrink-0"
                                            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                                            {customer.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <div className="font-black text-sm">{customer.name}</div>
                                            <div className="text-xs mt-0.5" style={{ color: '#888', fontSize: '0.65rem' }}>Since {formatDate(customer.created_at)}</div>
                                        </div>
                                    </div>
                                    <button onClick={e => { e.stopPropagation(); if (confirm('Delete customer?')) { deleteCustomer(customer.id); toast.success('Deleted'); } }}
                                        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/10 transition-all">
                                        <Trash2 style={{ width: 13, height: 13, color: 'var(--muted-foreground)' }} />
                                    </button>
                                </div>
                                {/* Contact */}
                                <div className="flex flex-col gap-0.5">
                                    {customer.phone && <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}><Phone style={{ width: 11, height: 11 }} />{customer.phone}</div>}
                                    {customer.email && <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}><Mail style={{ width: 11, height: 11 }} />{customer.email}</div>}
                                </div>
                                {/* Stats */}
                                <div className="flex gap-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                                    <div className="flex-1 text-center">
                                        <div className="text-sm font-black">{customerOrders.length}</div>
                                        <div className="section-label" style={{ color: 'var(--muted-foreground)' }}>Orders</div>
                                    </div>
                                    <div className="flex-1 text-center">
                                        <div className="text-sm font-black">{activeOrders}</div>
                                        <div className="section-label" style={{ color: 'var(--muted-foreground)' }}>Active</div>
                                    </div>
                                    <div className="flex-1 text-center">
                                        <div className="text-sm font-black" style={{ color: '#22c55e' }}>€{(totalSpend / 1000).toFixed(1)}k</div>
                                        <div className="section-label" style={{ color: 'var(--muted-foreground)' }}>Spent</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {filtered.length === 0 && (
                        <div className="col-span-3 text-center py-16 text-sm" style={{ color: 'var(--muted-foreground)' }}>No customers found</div>
                    )}
                </div>
            </div>
        </AppShell>
    );
}
