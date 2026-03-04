'use client';

import {
    DndContext,
    DragOverlay,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useStore } from '@/lib/store';
import { Order, OrderStatus, ORDER_STAGES } from '@/types';
import { formatDate, getDueDateStatus } from '@/lib/helpers';
import { useState } from 'react';
import { GripVertical, AlertTriangle, Clock, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

function DueBadge({ dueDate, status }: { dueDate?: string; status: OrderStatus }) {
    if (!dueDate || status === 'completed') return null;
    const dueSt = getDueDateStatus(dueDate);
    if (dueSt === 'none') return null;
    const styles = {
        overdue: { bg: 'rgba(199,80,80,0.1)', color: '#d97070', Icon: AlertTriangle },
        urgent: { bg: 'rgba(201,162,39,0.1)', color: '#c9a227', Icon: Clock },
        normal: { bg: 'rgba(122,173,139,0.08)', color: '#7aad8b', Icon: Calendar },
    };
    const s = styles[dueSt];
    return (
        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded font-medium" style={{ background: s.bg, color: s.color, fontSize: '0.65rem' }}>
            <s.Icon style={{ width: 10, height: 10 }} /> {formatDate(dueDate)}
        </span>
    );
}

function KanbanCard({ order }: { order: Order }) {
    const router = useRouter();
    const { customers } = useStore();
    const customer = customers.find(c => c.id === order.customer_id);
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: order.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.3 : 1 };

    return (
        <div ref={setNodeRef} style={style}
            className="kanban-card p-3 mb-2 rounded-lg cursor-pointer"
            onClick={() => router.push(`/orders/${order.id}`)}
            role="button" tabIndex={0}
            aria-label={`Order ${order.order_number}`}
            onKeyDown={e => { if (e.key === 'Enter') router.push(`/orders/${order.id}`); }}
        >
            <div className="flex items-start gap-2">
                <div {...attributes} {...listeners} onClick={e => e.stopPropagation()}
                    className="mt-0.5 cursor-grab flex-shrink-0" style={{ color: 'var(--border)' }}>
                    <GripVertical style={{ width: 14, height: 14 }} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-semibold" style={{ color: 'var(--gold)', fontSize: '0.7rem' }}>{order.order_number}</span>
                        <span className="text-xs capitalize px-1.5 py-0.5 rounded" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', fontSize: '0.65rem' }}>
                            {order.item_type}
                        </span>
                    </div>
                    <div className="text-sm font-medium truncate" style={{ fontSize: '0.8rem' }}>{customer?.name ?? 'Unknown'}</div>
                    {order.price != null && (
                        <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)', fontSize: '0.7rem' }}>€{order.price.toLocaleString()}</div>
                    )}
                    <div className="mt-1.5">
                        <DueBadge dueDate={order.due_date} status={order.status} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function KanbanColumn({ stageKey, label, color, orders }: { stageKey: OrderStatus; label: string; color: string; orders: Order[] }) {
    const { setNodeRef } = useSortable({ id: stageKey });
    return (
        <div className="flex flex-col" style={{ minWidth: 210, maxWidth: 240, flexShrink: 0 }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-2.5 px-1">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                    <span className="section-label">{label}</span>
                </div>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded" style={{ background: `${color}15`, color, fontSize: '0.65rem' }}>
                    {orders.length}
                </span>
            </div>
            {/* Drop zone */}
            <div ref={setNodeRef} className="flex-1 min-h-[80px] rounded-lg p-1.5" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                <SortableContext items={orders.map(o => o.id)} strategy={verticalListSortingStrategy}>
                    {orders.map(o => <KanbanCard key={o.id} order={o} />)}
                </SortableContext>
                {orders.length === 0 && (
                    <div className="h-16 flex items-center justify-center text-xs" style={{ color: 'var(--border)' }}>—</div>
                )}
            </div>
        </div>
    );
}

export function KanbanBoard({ orders }: { orders: Order[] }) {
    const { updateOrderStatus, customers } = useStore();
    const [activeOrder, setActiveOrder] = useState<Order | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
    );

    function handleDragStart({ active }: DragStartEvent) {
        const order = orders.find(o => o.id === active.id);
        if (order) setActiveOrder(order);
    }

    function handleDragEnd({ active, over }: DragEndEvent) {
        setActiveOrder(null);
        if (!over) return;
        const targetStage = ORDER_STAGES.find(s => s.key === over.id)?.key
            ?? orders.find(o => o.id === over.id)?.status;
        if (targetStage && targetStage !== activeOrder?.status) {
            updateOrderStatus(active.id as string, targetStage as OrderStatus);
            toast.success(`Moved to ${ORDER_STAGES.find(s => s.key === targetStage)?.label}`);
        }
    }

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex gap-3 overflow-x-auto pb-3" style={{ scrollbarWidth: 'thin' }}>
                {ORDER_STAGES.map(stage => (
                    <KanbanColumn
                        key={stage.key}
                        stageKey={stage.key}
                        label={stage.label}
                        color={stage.color}
                        orders={orders.filter(o => o.status === stage.key)}
                    />
                ))}
            </div>
            <DragOverlay>
                {activeOrder && (
                    <div className="p-3 rounded-lg dnd-overlay" style={{ width: 210, background: 'var(--card)', border: '1px solid var(--gold-muted)' }}>
                        <div className="text-xs font-mono font-semibold" style={{ color: 'var(--gold)', fontSize: '0.7rem' }}>{activeOrder.order_number}</div>
                        <div className="text-sm font-medium mt-0.5" style={{ fontSize: '0.8rem' }}>{customers.find(c => c.id === activeOrder.customer_id)?.name}</div>
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    );
}
