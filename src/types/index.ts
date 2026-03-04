export type OrderStatus =
    | '3d_modeling'
    | '3d_printing'
    | 'casting'
    | 'sanding'
    | 'setting'
    | 'polishing'
    | 'quality_control'
    | 'completed';

export type ItemType =
    | 'ring'
    | 'necklace'
    | 'bracelet'
    | 'earrings'
    | 'pendant'
    | 'brooch'
    | 'other';

export type MaterialType =
    | 'gold_24k'
    | 'gold_18k'
    | 'gold_14k'
    | 'silver_925'
    | 'platinum'
    | 'white_gold'
    | 'rose_gold';

export type StoneCategory = 'central' | 'side';

export type StoneType =
    | 'diamond'
    | 'ruby'
    | 'sapphire'
    | 'emerald'
    | 'amethyst'
    | 'topaz'
    | 'opal'
    | 'pearl'
    | 'other';

export interface Gemstone {
    id: string;
    order_id: string;
    category: StoneCategory;
    stone_type: StoneType;
    carat: number;
    quantity: number;
    notes?: string;
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    email?: string;
    notes?: string;
    created_at: string;
}

export interface Order {
    id: string;
    order_number: string;
    customer_id: string;
    customer?: Customer;
    item_type: ItemType;
    item_id?: string;
    status: OrderStatus;
    materials: MaterialType[];
    starting_weight?: number;
    end_weight?: number;
    price?: number;
    due_date?: string;
    notes?: string;
    gemstones?: Gemstone[];
    created_at: string;
    updated_at: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'artisan';
}

export const ORDER_STAGES: { key: OrderStatus; label: string; color: string }[] = [
    { key: '3d_modeling', label: '3D Modeling', color: '#8b8ead' },
    { key: '3d_printing', label: '3D Printing', color: '#7b9eb8' },
    { key: 'casting', label: 'Casting', color: '#d4a04a' },
    { key: 'sanding', label: 'Sanding', color: '#b8956a' },
    { key: 'setting', label: 'Setting', color: '#c9a227' },
    { key: 'polishing', label: 'Polishing', color: '#a89070' },
    { key: 'quality_control', label: 'Quality Control', color: '#7aad8b' },
    { key: 'completed', label: 'Completed', color: '#5a9a6b' },
];

export const ITEM_TYPE_LABELS: Record<ItemType, string> = {
    ring: 'Ring',
    necklace: 'Necklace',
    bracelet: 'Bracelet',
    earrings: 'Earrings',
    pendant: 'Pendant',
    brooch: 'Brooch',
    other: 'Other',
};

export const MATERIAL_LABELS: Record<MaterialType, string> = {
    gold_24k: '24K Gold',
    gold_18k: '18K Gold',
    gold_14k: '14K Gold',
    silver_925: 'Sterling Silver 925',
    platinum: 'Platinum',
    white_gold: 'White Gold',
    rose_gold: 'Rose Gold',
};

export const STONE_TYPE_LABELS: Record<StoneType, string> = {
    diamond: 'Diamond',
    ruby: 'Ruby',
    sapphire: 'Sapphire',
    emerald: 'Emerald',
    amethyst: 'Amethyst',
    topaz: 'Topaz',
    opal: 'Opal',
    pearl: 'Pearl',
    other: 'Other',
};
