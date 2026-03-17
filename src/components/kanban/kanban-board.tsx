'use client';

import { useStore } from '@/lib/store';
import { ORDER_STAGES, Order, OrderStatus } from '@/types';
import {
    DndContext, DragEndEvent, DragOverlay, DragStartEvent,
    PointerSensor, TouchSensor, useSensor, useSensors, useDroppable,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { getDueDateStatus, formatDate, getStatusColor } from '@/lib/helpers';
import { AlertTriangle, Clock } from 'lucide-react';

function KanbanCard({ order, isDragging = false }: { order: Order; isDragging?: boolean }) {
    const { customers } = useStore();
    const customer = customers.find(c => c.id === order.customer_id);
    const dueSt = getDueDateStatus(order.due_date);
    return (
        <Link href={`/orders/${order.id}`} onClick={e => isDragging && e.preventDefault()}>
            <div className="kanban-card p-3" style={{ opacity: isDragging ? 0.4 : 1 }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                        <div className="text-[11px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{order.order_number}</div>
                        <div className="font-bold text-sm mt-0.5 text-slate-900 dark:text-white">{customer?.name ?? 'Unknown'}</div>
                    </div>
                    {order.item_type && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5" style={{ background: 'var(--muted)', border: '2px solid var(--border)', color: 'var(--foreground)', flexShrink: 0 }}>
                            {order.item_type}
                        </span>
                    )}
                </div>
                {order.price != null && (
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-200">€{order.price.toLocaleString()}</div>
                )}
                {order.due_date && (
                    <div className={`flex items-center gap-1 mt-1.5 text-[11px] font-semibold`}
                        style={{ color: dueSt === 'overdue' ? '#ef4444' : dueSt === 'urgent' ? '#f97316' : '#888' }}>
                        {dueSt === 'overdue' ? <AlertTriangle style={{ width: 10, height: 10 }} /> : <Clock style={{ width: 10, height: 10 }} />}
                        {formatDate(order.due_date)}
                    </div>
                )}
            </div>
        </Link>
    );
}

function DroppableColumn({ stage, orders }: { stage: typeof ORDER_STAGES[0]; orders: Order[] }) {
    const { setNodeRef, isOver } = useDroppable({ id: stage.key });
    return (
        <div ref={setNodeRef} className="flex flex-col gap-3 flex-1 min-w-[200px]"
            style={{ outline: isOver ? `4px solid ${stage.color}` : 'none', outlineOffset: '-4px', transition: 'outline 0.1s' }}>
            <SortableContext items={orders.map(o => o.id)} strategy={verticalListSortingStrategy}>
                {orders.map(o => <SortableCard key={o.id} order={o} />)}
            </SortableContext>
        </div>
    );
}

function SortableCard({ order }: { order: Order }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: order.id });
    return (
        <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} {...attributes} {...listeners}>
            <KanbanCard order={order} isDragging={isDragging} />
        </div>
    );
}

export function KanbanBoard() {
    const { orders, updateOrderStatus } = useStore();
    const [active, setActive] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
    );

    function onDragStart(e: DragStartEvent) { setActive(e.active.id as string); }
    function onDragEnd(e: DragEndEvent) {
        setActive(null);
        const { over, active } = e;
        if (!over) return;
        const newStatus = over.id as OrderStatus;
        const order = orders.find(o => o.id === active.id);
        if (order && order.status !== newStatus) {
            updateOrderStatus(order.id, newStatus);
            const label = ORDER_STAGES.find(s => s.key === newStatus)?.label ?? newStatus;
            toast.success(`Moved to ${label}`);
        }
    }

    const activeOrder = active ? orders.find(o => o.id === active) : null;

    return (
        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
            <div className="flex gap-3 overflow-x-auto pb-2">
                {ORDER_STAGES.filter(s => s.key !== 'completed').map(stage => {
                    const stageOrders = orders.filter(o => o.status === stage.key);
                    return (
                        <div key={stage.key} className="flex flex-col min-w-[210px] flex-shrink-0">
                            {/* Column header */}
                            <div className="p-3 mb-3 flex items-center justify-between"
                                style={{ border: `3px solid var(--border)`, borderBottomWidth: '6px', background: stage.color }}>
                                <span className="text-[12px] font-black uppercase tracking-wider" style={{ color: '#000' }}>
                                    {stage.label}
                                </span>
                                <span className="text-[12px] font-black px-2 py-0.5" style={{ background: '#000', color: '#fff' }}>
                                    {stageOrders.length}
                                </span>
                            </div>
                            {/* Drop zone */}
                            <DroppableColumn stage={stage} orders={stageOrders} />
                        </div>
                    );
                })}
            </div>
            <DragOverlay>
                {activeOrder && (
                    <div className="dnd-overlay">
                        <KanbanCard order={activeOrder} />
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    );
}
