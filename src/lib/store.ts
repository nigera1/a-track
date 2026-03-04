import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import {
    Order,
    Customer,
    User,
    OrderStatus,
    Gemstone,
} from '@/types';

// ─── Seed Data ───────────────────────────────────────────────────────────────

const seedCustomers: Customer[] = [
    { id: 'c1', name: 'Elena Marchetti', phone: '+39 02 1234567', email: 'elena.m@email.com', notes: 'VIP client, prefers gold', created_at: new Date(Date.now() - 90 * 86400000).toISOString() },
    { id: 'c2', name: 'Thomas Beaumont', phone: '+33 1 2345678', email: 'thomas.b@email.com', created_at: new Date(Date.now() - 60 * 86400000).toISOString() },
    { id: 'c3', name: 'Sofia Andersen', phone: '+45 12 345678', email: 'sofia.a@email.com', notes: 'Allergic to nickel', created_at: new Date(Date.now() - 45 * 86400000).toISOString() },
    { id: 'c4', name: 'Marco Rossi', phone: '+39 06 9876543', created_at: new Date(Date.now() - 30 * 86400000).toISOString() },
    { id: 'c5', name: 'Isabelle Laurent', phone: '+33 6 8765432', email: 'isabelle.l@email.com', created_at: new Date(Date.now() - 15 * 86400000).toISOString() },
];

const seedGemstones: Record<string, Gemstone[]> = {
    'o1': [
        { id: 'g1', order_id: 'o1', category: 'central', stone_type: 'diamond', carat: 1.2, quantity: 1, notes: 'GIA certified, VS1 clarity' },
        { id: 'g2', order_id: 'o1', category: 'side', stone_type: 'diamond', carat: 0.05, quantity: 16, notes: 'Pavé setting' },
    ],
    'o2': [
        { id: 'g3', order_id: 'o2', category: 'central', stone_type: 'ruby', carat: 2.1, quantity: 1, notes: 'Burmese ruby' },
    ],
    'o3': [
        { id: 'g4', order_id: 'o3', category: 'central', stone_type: 'sapphire', carat: 3.4, quantity: 1 },
        { id: 'g5', order_id: 'o3', category: 'side', stone_type: 'diamond', carat: 0.03, quantity: 22 },
    ],
    'o4': [],
    'o5': [
        { id: 'g6', order_id: 'o5', category: 'central', stone_type: 'emerald', carat: 1.8, quantity: 1, notes: 'Colombian origin' },
        { id: 'g7', order_id: 'o5', category: 'side', stone_type: 'diamond', carat: 0.04, quantity: 10 },
    ],
    'o6': [
        { id: 'g8', order_id: 'o6', category: 'central', stone_type: 'diamond', carat: 0.75, quantity: 3, notes: 'Trilogy ring' },
    ],
};

const today = new Date();
const addDays = (d: number) => new Date(Date.now() + d * 86400000).toISOString().split('T')[0];
const subDays = (d: number) => new Date(Date.now() - d * 86400000).toISOString().split('T')[0];

const seedOrders: Order[] = [
    {
        id: 'o1', order_number: 'ORD-0001', customer_id: 'c1',
        item_type: 'ring', item_id: 'RING-001', status: 'setting',
        materials: ['white_gold'], starting_weight: 4.2,
        price: 4800, due_date: addDays(5),
        notes: 'Engagement ring, diamond pavé band',
        gemstones: seedGemstones['o1'],
        created_at: subDays(20), updated_at: subDays(2),
    },
    {
        id: 'o2', order_number: 'ORD-0002', customer_id: 'c2',
        item_type: 'pendant', status: 'casting',
        materials: ['gold_18k'], starting_weight: 6.5,
        price: 3200, due_date: addDays(12),
        notes: 'Ruby pendant, vintage style',
        gemstones: seedGemstones['o2'],
        created_at: subDays(15), updated_at: subDays(3),
    },
    {
        id: 'o3', order_number: 'ORD-0003', customer_id: 'c3',
        item_type: 'bracelet', status: 'polishing',
        materials: ['platinum'], starting_weight: 18.3, end_weight: 15.1,
        price: 8500, due_date: addDays(2),
        notes: 'Art deco sapphire bracelet',
        gemstones: seedGemstones['o3'],
        created_at: subDays(30), updated_at: subDays(1),
    },
    {
        id: 'o4', order_number: 'ORD-0004', customer_id: 'c4',
        item_type: 'earrings', status: '3d_modeling',
        materials: ['gold_14k'], starting_weight: 3.1,
        price: 1200, due_date: addDays(20),
        notes: 'Geometric drop earrings',
        gemstones: seedGemstones['o4'],
        created_at: subDays(3), updated_at: subDays(3),
    },
    {
        id: 'o5', order_number: 'ORD-0005', customer_id: 'c5',
        item_type: 'ring', status: 'quality_control',
        materials: ['gold_18k'], starting_weight: 5.8, end_weight: 4.9,
        price: 6200, due_date: addDays(1),
        gemstones: seedGemstones['o5'],
        created_at: subDays(25), updated_at: subDays(1),
    },
    {
        id: 'o6', order_number: 'ORD-0006', customer_id: 'c1',
        item_type: 'ring', status: 'completed',
        materials: ['white_gold'], starting_weight: 4.0, end_weight: 3.4,
        price: 5500, due_date: subDays(2),
        notes: 'Trilogy diamond ring',
        gemstones: seedGemstones['o6'],
        created_at: subDays(40), updated_at: subDays(2),
    },
    {
        id: 'o7', order_number: 'ORD-0007', customer_id: 'c2',
        item_type: 'necklace', status: '3d_printing',
        materials: ['rose_gold'], starting_weight: 10.2,
        price: 2800, due_date: addDays(15),
        notes: 'Rose gold chain with leaf motif',
        gemstones: [],
        created_at: subDays(5), updated_at: subDays(5),
    },
    {
        id: 'o8', order_number: 'ORD-0008', customer_id: 'c3',
        item_type: 'brooch', status: 'sanding',
        materials: ['silver_925'], starting_weight: 12.0,
        price: 950, due_date: addDays(-1), // overdue
        notes: 'Art nouveau floral brooch',
        gemstones: [],
        created_at: subDays(18), updated_at: subDays(4),
    },
];

const seedUsers: User[] = [
    { id: 'u1', name: 'Admin User', email: 'admin@atelier.com', role: 'admin' },
    { id: 'u2', name: 'Maria Craftsman', email: 'maria@atelier.com', role: 'artisan' },
];

// ─── Store ────────────────────────────────────────────────────────────────────

interface AppState {
    orders: Order[];
    customers: Customer[];
    currentUser: User | null;
    users: User[];

    // Auth
    login: (email: string, password: string) => boolean;
    logout: () => void;
    register: (name: string, email: string, password: string, role: 'admin' | 'artisan') => boolean;

    // Orders
    addOrder: (order: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>) => Order;
    updateOrder: (id: string, updates: Partial<Order>) => void;
    updateOrderStatus: (id: string, status: OrderStatus) => void;
    deleteOrder: (id: string) => void;
    getOrdersByCustomer: (customerId: string) => Order[];

    // Customers
    addCustomer: (customer: Omit<Customer, 'id' | 'created_at'>) => Customer;
    updateCustomer: (id: string, updates: Partial<Customer>) => void;
    deleteCustomer: (id: string) => void;
}

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            orders: seedOrders,
            customers: seedCustomers,
            currentUser: null,
            users: seedUsers,

            // ─── Auth ───────────────────────────────────────────────────────────
            login: (email, password) => {
                const user = get().users.find(u => u.email === email);
                if (!user) return false;
                // Simple demo auth — any password works
                set({ currentUser: user });
                return true;
            },
            logout: () => set({ currentUser: null }),
            register: (name, email, _password, role) => {
                const exists = get().users.find(u => u.email === email);
                if (exists) return false;
                const newUser: User = { id: uuidv4(), name, email, role };
                set(state => ({ users: [...state.users, newUser], currentUser: newUser }));
                return true;
            },

            // ─── Orders ─────────────────────────────────────────────────────────
            addOrder: (orderData) => {
                const orders = get().orders;
                const num = orders.length + 1;
                const order: Order = {
                    ...orderData,
                    id: uuidv4(),
                    order_number: `ORD-${String(num).padStart(4, '0')}`,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                };
                set(state => ({ orders: [order, ...state.orders] }));
                return order;
            },
            updateOrder: (id, updates) => {
                set(state => ({
                    orders: state.orders.map(o =>
                        o.id === id ? { ...o, ...updates, updated_at: new Date().toISOString() } : o
                    ),
                }));
            },
            updateOrderStatus: (id, status) => {
                set(state => ({
                    orders: state.orders.map(o =>
                        o.id === id ? { ...o, status, updated_at: new Date().toISOString() } : o
                    ),
                }));
            },
            deleteOrder: (id) => {
                set(state => ({ orders: state.orders.filter(o => o.id !== id) }));
            },
            getOrdersByCustomer: (customerId) => {
                return get().orders.filter(o => o.customer_id === customerId);
            },

            // ─── Customers ──────────────────────────────────────────────────────
            addCustomer: (data) => {
                const customer: Customer = {
                    ...data,
                    id: uuidv4(),
                    created_at: new Date().toISOString(),
                };
                set(state => ({ customers: [customer, ...state.customers] }));
                return customer;
            },
            updateCustomer: (id, updates) => {
                set(state => ({
                    customers: state.customers.map(c =>
                        c.id === id ? { ...c, ...updates } : c
                    ),
                }));
            },
            deleteCustomer: (id) => {
                set(state => ({ customers: state.customers.filter(c => c.id !== id) }));
            },
        }),
        {
            name: 'jewelry-atelier-store',
            partialize: (state) => ({
                orders: state.orders,
                customers: state.customers,
                currentUser: state.currentUser,
                users: state.users,
            }),
        }
    )
);
