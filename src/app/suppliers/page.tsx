'use client';

import { AppShell } from '@/components/app-shell';
import { useStore } from '@/lib/store';
import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Building2, Pencil, Trash2, Save, X, Phone } from 'lucide-react';
import { Supplier } from '@/types';

const SPECIALTY_LABELS = { casting: 'Casting', setting: 'Setting', both: 'Casting & Setting' };
const SPECIALTY_COLORS = { casting: 'var(--blue)', setting: 'var(--red)', both: '#64748b' };

const emptyForm = () => ({ name: '', specialty: 'casting' as Supplier['specialty'], contact: '', notes: '' });

export default function SuppliersPage() {
    const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useStore();
    const [showAdd, setShowAdd] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm());

    const inputStyle = { width: '100%', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 13, fontWeight: 600, background: 'var(--input)', color: 'var(--foreground)' };

    function handleAdd() {
        if (!form.name.trim()) { toast.error('Name is required'); return; }
        addSupplier({ name: form.name.trim(), specialty: form.specialty, contact: form.contact.trim() || undefined, notes: form.notes.trim() || undefined });
        toast.success('Supplier added');
        setForm(emptyForm());
        setShowAdd(false);
    }

    function handleEdit(s: Supplier) {
        setEditingId(s.id);
        setForm({ name: s.name, specialty: s.specialty, contact: s.contact ?? '', notes: s.notes ?? '' });
    }

    function handleSave(id: string) {
        if (!form.name.trim()) { toast.error('Name is required'); return; }
        updateSupplier(id, { name: form.name.trim(), specialty: form.specialty, contact: form.contact.trim() || undefined, notes: form.notes.trim() || undefined });
        toast.success('Supplier updated');
        setEditingId(null);
    }

    function handleDelete(id: string, name: string) {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
        deleteSupplier(id);
        toast.success('Supplier deleted');
    }

    const FormRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
        <div>
            <label className="section-label block mb-1.5">{label}</label>
            {children}
        </div>
    );

    const InlineForm = ({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) => (
        <div className="flex flex-col gap-3 mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormRow label="Name">
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Supplier name" style={inputStyle} />
                </FormRow>
                <FormRow label="Specialty">
                    <select value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value as Supplier['specialty'] }))} style={inputStyle}>
                        <option value="casting">Casting</option>
                        <option value="setting">Setting</option>
                        <option value="both">Casting & Setting</option>
                    </select>
                </FormRow>
                <FormRow label="Contact / Phone">
                    <input value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} placeholder="+39 02 555 0100" style={inputStyle} />
                </FormRow>
                <FormRow label="Notes">
                    <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="e.g. Specialist in pavé setting" style={inputStyle} />
                </FormRow>
            </div>
            <div className="flex gap-2">
                <button onClick={onSave} className="neo-btn neo-btn-primary"><Save style={{ width: 12, height: 12 }} /> Save</button>
                <button onClick={onCancel} className="neo-btn"><X style={{ width: 12, height: 12 }} /> Cancel</button>
            </div>
        </div>
    );

    return (
        <AppShell>
            <div className="flex flex-col gap-5">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-extrabold uppercase text-slate-900 dark:text-white">Suppliers</h1>
                        <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>{suppliers.length} suppliers · Used for casting & setting stages</p>
                    </div>
                    {!showAdd && (
                        <button onClick={() => { setShowAdd(true); setForm(emptyForm()); }} className="neo-btn neo-btn-primary">
                            <Plus style={{ width: 13, height: 13 }} /> Add Supplier
                        </button>
                    )}
                </div>

                {/* Add form */}
                {showAdd && (
                    <div className="neo-card p-5 pl-6" style={{ borderLeft: '4px solid var(--blue)' }}>
                        <div className="section-label flex items-center gap-2">
                            <Building2 style={{ width: 13, height: 13, color: 'var(--blue)' }} /> New Supplier
                        </div>
                        <InlineForm onSave={handleAdd} onCancel={() => { setShowAdd(false); setForm(emptyForm()); }} />
                    </div>
                )}

                {/* Supplier list */}
                <div className="flex flex-col gap-3">
                    {suppliers.length === 0 ? (
                        <div className="neo-card p-10 flex flex-col items-center gap-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <Building2 style={{ width: 32, height: 32 }} className="text-slate-400 dark:text-slate-500" />
                            <div className="font-bold text-sm text-slate-500 dark:text-slate-400">No suppliers yet</div>
                            <button onClick={() => setShowAdd(true)} className="neo-btn text-xs">Add your first supplier</button>
                        </div>
                    ) : (
                        suppliers.map(s => {
                            const color = s.specialty === 'both' ? '#64748b' : SPECIALTY_COLORS[s.specialty];
                            const isEditing = editingId === s.id;
                            
                            return (
                                <div key={s.id} className="neo-card p-5 pl-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" style={{ borderLeft: `4px solid ${color}` }}>
                                    <div className="flex items-start justify-between gap-4 flex-wrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 flex items-center justify-center font-bold text-lg flex-shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-md">
                                                {s.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-base hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer text-slate-900 dark:text-white transition-colors" onClick={() => window.location.href = `/suppliers/${s.id}`}>{s.name}</div>
                                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                    <span className="status-pill" style={{ color: s.specialty === 'both' ? 'inherit' : color, borderColor: s.specialty === 'both' ? 'var(--border)' : color, backgroundColor: s.specialty === 'both' ? 'var(--muted)' : 'transparent' }}>
                                                        {SPECIALTY_LABELS[s.specialty]}
                                                    </span>
                                                    {s.contact && (
                                                        <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                            <Phone style={{ width: 10, height: 10 }} /> {s.contact}
                                                        </span>
                                                    )}
                                                </div>
                                                {s.notes && <div className="text-xs mt-1 text-slate-400 dark:text-slate-500">{s.notes}</div>}
                                            </div>
                                        </div>
                                    </div>
                                    {!isEditing && (
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit(s)} className="neo-btn text-xs">
                                                <Pencil style={{ width: 11, height: 11 }} /> Edit
                                            </button>
                                            <button onClick={() => handleDelete(s.id, s.name)} className="neo-btn text-xs"
                                                style={{ color: 'var(--card)', background: 'var(--red)', borderColor: 'var(--border)' }}>
                                                <Trash2 style={{ width: 11, height: 11 }} /> Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </AppShell>
    );
}
