import { Order, OrderStatus, ORDER_STAGES } from '@/types';

export function getStatusLabel(status: OrderStatus): string {
    return ORDER_STAGES.find(s => s.key === status)?.label ?? status;
}

export function getStatusColor(status: OrderStatus): string {
    return ORDER_STAGES.find(s => s.key === status)?.color ?? '#888';
}

export function getDueDateStatus(dueDateStr?: string): 'overdue' | 'urgent' | 'normal' | 'none' {
    if (!dueDateStr) return 'none';
    const due = new Date(dueDateStr);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / 86400000);
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 3) return 'urgent';
    return 'normal';
}

export function formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatCurrency(amount?: number): string {
    if (amount == null) return '—';
    return new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR' }).format(amount);
}

export function getOrdersStats(orders: Order[]) {
    const total = orders.length;
    const completed = orders.filter(o => o.status === 'completed').length;
    const overdue = orders.filter(o => getDueDateStatus(o.due_date) === 'overdue' && o.status !== 'completed').length;
    const urgent = orders.filter(o => getDueDateStatus(o.due_date) === 'urgent' && o.status !== 'completed').length;
    const totalRevenue = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.price ?? 0), 0);
    const pendingRevenue = orders.filter(o => o.status !== 'completed').reduce((sum, o) => sum + (o.price ?? 0), 0);
    return { total, completed, overdue, urgent, totalRevenue, pendingRevenue };
}
