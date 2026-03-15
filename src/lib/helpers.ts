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

export function getRelativeTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
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

/** Returns orders stuck in the same stage for more than `thresholdDays` days. */
export function getStaleOrders(orders: Order[], thresholdDays: number = 7): (Order & { staleDays: number; staleStage: string })[] {
    const now = Date.now();
    return orders
        .filter(o => o.status !== 'completed')
        .map(o => {
            // Find when the current stage started
            const currentLog = o.stage_times?.find(
                log => log.stage === o.status && !log.finished_at
            );
            const stageStart = currentLog?.started_at
                ? new Date(currentLog.started_at).getTime()
                : new Date(o.created_at).getTime();
            const staleDays = Math.floor((now - stageStart) / 86400000);
            return { ...o, staleDays, staleStage: getStatusLabel(o.status) };
        })
        .filter(o => o.staleDays >= thresholdDays)
        .sort((a, b) => b.staleDays - a.staleDays);
}

