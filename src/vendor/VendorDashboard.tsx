import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  Package,
  PlusSquare,
  Boxes,
  ShoppingCart,
  RotateCcw,
  Users,
  BarChart3,
  Wallet,
  Percent,
  ArrowUpRight,
  Settings,
  LifeBuoy,
  Search,
  Bell,
  ChevronRight,
  Download,
  Edit3,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Truck,
  X,
  Plus,
  Minus,
  Upload,
  Shield,
  Menu,
  TrendingUp,
  Clock,
  IndianRupee,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

// ============================================================================
// TYPES & MULTI-VENDOR ISOLATION MODELS
// ============================================================================

type SidebarTab =
  | 'overview'
  | 'products'
  | 'add-product'
  | 'inventory'
  | 'orders'
  | 'returns'
  | 'customers'
  | 'analytics'
  | 'earnings'
  | 'commission'
  | 'payouts'
  | 'settings'
  | 'support';

type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Return Requested' | 'Refunded';
type ProductStatus = 'Active' | 'Draft' | 'Out of Stock';
type VendorRole = 'Owner' | 'Manager';

interface VendorProfile {
  id: string;
  name: string;
  email: string;
  commissionRate: number; // e.g., 0.12 = 12%
  bankAccount: string;
  gstin: string;
  city: string;
}

interface VendorProduct {
  id: string;
  vendorId: string;
  sku: string;
  title: string;
  brand: string;
  category: 'Women' | 'Men' | 'Accessories';
  description: string;
  price: number;
  salePrice?: number;
  sizes: string[];
  colors: { name: string; hex: string }[];
  stock: number;
  soldCount: number;
  status: ProductStatus;
  images: string[];
}

interface VendorOrder {
  id: string;
  vendorId: string;
  orderNumber: string;
  customerName: string;
  customerCity: string;
  date: string;
  items: { productTitle: string; sku: string; size: string; qty: number; price: number }[];
  grossAmount: number;
  commissionAmount: number;
  netAmount: number;
  status: OrderStatus;
  trackingNumber: string;
  returnReason?: string;
}

interface PayoutRecord {
  id: string;
  vendorId: string;
  date: string;
  amount: number;
  method: string;
  reference: string;
  status: 'Completed' | 'Processing';
}

interface SupportTicket {
  id: string;
  vendorId: string;
  subject: string;
  category: string;
  status: 'Open' | 'Resolved';
  date: string;
}

// ============================================================================
// INITIAL SEED DATA (Scoped by vendorId for strict RLS simulation)
// ============================================================================

const VENDORS: VendorProfile[] = [
  {
    id: 'v-veron',
    name: 'ATELIER VÉRON',
    email: 'atelier@veron-paris.com',
    commissionRate: 0.12,
    bankAccount: 'HDFC Bank •••• 8841',
    gstin: '27AABCV4829L1Z5',
    city: 'Mumbai / Paris',
  },
  {
    id: 'v-severin',
    name: 'SÉVÉRIN LEATHER',
    email: 'concierge@severin-firenze.it',
    commissionRate: 0.14,
    bankAccount: 'ICICI Bank •••• 3109',
    gstin: '27AADCS9102M1Z2',
    city: 'Mumbai / Florence',
  },
];

const INITIAL_PRODUCTS: VendorProduct[] = [
  {
    id: 'p1',
    vendorId: 'v-veron',
    sku: 'VER-COAT-001',
    title: 'Double-Breasted Cashmere Overcoat',
    brand: 'ATELIER VÉRON',
    category: 'Women',
    description: 'Double-faced Mongolian cashmere overcoat with horn buttons.',
    price: 92000,
    salePrice: 78500,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [{ name: 'Charcoal', hex: '#434341' }, { name: 'Camel', hex: '#B8956A' }],
    stock: 14,
    soldCount: 38,
    status: 'Active',
    images: [],
  },
  {
    id: 'p2',
    vendorId: 'v-veron',
    sku: 'VER-DRESS-002',
    title: 'Draped Bias-Cut Silk Midi Dress',
    brand: 'ATELIER VÉRON',
    category: 'Women',
    description: '30-momme mulberry silk satin cut on the bias.',
    price: 52000,
    salePrice: 42000,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [{ name: 'Espresso', hex: '#4A3428' }],
    stock: 4,
    soldCount: 29,
    status: 'Active',
    images: [],
  },
  {
    id: 'p3',
    vendorId: 'v-veron',
    sku: 'VER-SUIT-003',
    title: 'Virgin Wool Sculpted Suit',
    brand: 'ATELIER VÉRON',
    category: 'Women',
    description: 'Super 130s virgin wool two-piece tailored suit.',
    price: 64000,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [{ name: 'Ivory', hex: '#EFECE4' }, { name: 'Carbon', hex: '#171717' }],
    stock: 22,
    soldCount: 31,
    status: 'Active',
    images: [],
  },
  {
    id: 'p4',
    vendorId: 'v-veron',
    sku: 'VER-TRENCH-004',
    title: 'Technical Gabardine Trench Coat',
    brand: 'ATELIER VÉRON',
    category: 'Men',
    description: 'Water-repellent Italian cotton gabardine trench.',
    price: 69000,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Stone', hex: '#CFC6B8' }],
    stock: 3,
    soldCount: 24,
    status: 'Active',
    images: [],
  },
  {
    id: 'p5',
    vendorId: 'v-veron',
    sku: 'VER-KNIT-005',
    title: 'Boxy Merino Crewneck Sweater',
    brand: 'ATELIER VÉRON',
    category: 'Men',
    description: 'Extra-fine Australian merino knit.',
    price: 34000,
    salePrice: 28500,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Charcoal', hex: '#434341' }],
    stock: 19,
    soldCount: 41,
    status: 'Active',
    images: [],
  },
  // Second vendor (never shown to Atelier Veron!)
  {
    id: 'p6',
    vendorId: 'v-severin',
    sku: 'SEV-BAG-011',
    title: 'Structured Calfskin Crossbody Bag',
    brand: 'SÉVÉRIN LEATHER',
    category: 'Accessories',
    description: 'Florentine box calfskin with brushed brass clasp.',
    price: 48000,
    sizes: ['One Size'],
    colors: [{ name: 'Espresso', hex: '#4A3428' }],
    stock: 9,
    soldCount: 47,
    status: 'Active',
    images: [],
  },
  {
    id: 'p7',
    vendorId: 'v-severin',
    sku: 'SEV-SHOE-012',
    title: 'Box-Calfskin Horsebit Loafers',
    brand: 'SÉVÉRIN LEATHER',
    category: 'Accessories',
    description: 'Blake-stitched French calfskin loafers.',
    price: 42000,
    salePrice: 36000,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Carbon', hex: '#171717' }],
    stock: 2,
    soldCount: 38,
    status: 'Active',
    images: [],
  },
];

const INITIAL_ORDERS: VendorOrder[] = [
  {
    id: 'o1',
    vendorId: 'v-veron',
    orderNumber: 'MM-AW26-84920',
    customerName: 'Ananya Kapoor',
    customerCity: 'Mumbai',
    date: '2026-11-21',
    items: [{ productTitle: 'Double-Breasted Cashmere Overcoat', sku: 'VER-COAT-001', size: 'S', qty: 1, price: 78500 }],
    grossAmount: 78500,
    commissionAmount: 9420,
    netAmount: 69080,
    status: 'Pending',
    trackingNumber: '',
  },
  {
    id: 'o2',
    vendorId: 'v-veron',
    orderNumber: 'MM-AW26-84891',
    customerName: 'Vikram Rathore',
    customerCity: 'New Delhi',
    date: '2026-11-20',
    items: [{ productTitle: 'Technical Gabardine Trench Coat', sku: 'VER-TRENCH-004', size: 'M', qty: 1, price: 69000 }],
    grossAmount: 69000,
    commissionAmount: 8280,
    netAmount: 60720,
    status: 'Processing',
    trackingNumber: 'BLR-9920148',
  },
  {
    id: 'o3',
    vendorId: 'v-veron',
    orderNumber: 'MM-AW26-84810',
    customerName: 'Meera Varma',
    customerCity: 'Bengaluru',
    date: '2026-11-18',
    items: [{ productTitle: 'Draped Bias-Cut Silk Midi Dress', sku: 'VER-DRESS-002', size: 'XS', qty: 1, price: 42000 }],
    grossAmount: 42000,
    commissionAmount: 5040,
    netAmount: 36960,
    status: 'Shipped',
    trackingNumber: 'DHL-7741029',
  },
  {
    id: 'o4',
    vendorId: 'v-veron',
    orderNumber: 'MM-AW26-84755',
    customerName: 'Kavya Deshmukh',
    customerCity: 'Mumbai',
    date: '2026-11-15',
    items: [{ productTitle: 'Virgin Wool Sculpted Suit', sku: 'VER-SUIT-003', size: 'S', qty: 1, price: 64000 }],
    grossAmount: 64000,
    commissionAmount: 7680,
    netAmount: 56320,
    status: 'Delivered',
    trackingNumber: 'BLR-8812033',
  },
  {
    id: 'o5',
    vendorId: 'v-veron',
    orderNumber: 'MM-AW26-84702',
    customerName: 'Rohan Malhotra',
    customerCity: 'Pune',
    date: '2026-11-12',
    items: [{ productTitle: 'Boxy Merino Crewneck Sweater', sku: 'VER-KNIT-005', size: 'L', qty: 1, price: 28500 }],
    grossAmount: 28500,
    commissionAmount: 3420,
    netAmount: 25080,
    status: 'Return Requested',
    trackingNumber: 'DHL-6619204',
    returnReason: 'Exchange requested for size XL',
  },
  // Second vendor order (isolated!)
  {
    id: 'o6',
    vendorId: 'v-severin',
    orderNumber: 'MM-AW26-84905',
    customerName: 'Nisha Thomas',
    customerCity: 'Mumbai',
    date: '2026-11-21',
    items: [{ productTitle: 'Structured Calfskin Crossbody Bag', sku: 'SEV-BAG-011', size: 'One Size', qty: 1, price: 48000 }],
    grossAmount: 48000,
    commissionAmount: 6720,
    netAmount: 41280,
    status: 'Pending',
    trackingNumber: '',
  },
];

const INITIAL_PAYOUTS: PayoutRecord[] = [
  {
    id: 'pay1',
    vendorId: 'v-veron',
    date: '2026-11-01',
    amount: 145000,
    method: 'HDFC Bank •••• 8841',
    reference: 'NEFT-MM-99201',
    status: 'Completed',
  },
  {
    id: 'pay2',
    vendorId: 'v-veron',
    date: '2026-10-15',
    amount: 112400,
    method: 'HDFC Bank •••• 8841',
    reference: 'NEFT-MM-88104',
    status: 'Completed',
  },
  {
    id: 'pay3',
    vendorId: 'v-severin',
    date: '2026-11-01',
    amount: 88200,
    method: 'ICICI Bank •••• 3109',
    reference: 'NEFT-MM-99311',
    status: 'Completed',
  },
];

const REVENUE_CHART_DATA = [
  { month: 'Jun', revenue: 185000, orders: 6 },
  { month: 'Jul', revenue: 224000, orders: 8 },
  { month: 'Aug', revenue: 210000, orders: 7 },
  { month: 'Sep', revenue: 298000, orders: 11 },
  { month: 'Oct', revenue: 342000, orders: 13 },
  { month: 'Nov', revenue: 418500, orders: 16 },
];

const formatINR = (n: number) => '₹' + n.toLocaleString('en-IN');
const CHART_TOOLTIP_STYLE = {
  backgroundColor: 'var(--color-brand-surface)',
  borderColor: 'var(--color-brand-border)',
  color: 'var(--color-brand-ink)',
};

// ============================================================================
// MAIN VENDOR DASHBOARD COMPONENT
// ============================================================================

export default function App() {
  // Active Authenticated Vendor & Role (Enforces strict vendor_id RLS isolation)
  const [activeVendorId, setActiveVendorId] = useState<string>('v-veron');
  const [vendorOnboardingOpen, setVendorOnboardingOpen] = useState(false);
  const [pendingVendorApp, setPendingVendorApp] = useState<{ storeName: string; gstin: string; docs: string[] } | null>(null);
  const [newVendorForm, setNewVendorForm] = useState({ storeName: '', owner: '', email: '', gstin: '', pan: '', docs: [] as string[] });
  const [role, setRole] = useState<VendorRole>('Owner');
  const [activeTab, setActiveTab] = useState<SidebarTab>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // State Stores
  const [products, setProducts] = useState<VendorProduct[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<VendorOrder[]>(INITIAL_ORDERS);
  const [payouts, setPayouts] = useState<PayoutRecord[]>(INITIAL_PAYOUTS);
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: 't1',
      vendorId: 'v-veron',
      subject: 'AW26 Lookbook Hero Placement Inquiry',
      category: 'Merchandising',
      status: 'Resolved',
      date: '2026-11-14',
    },
  ]);

  // Search & Filters
  const [productSearch, setProductSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');
  const [selectedOrder, setSelectedOrder] = useState<VendorOrder | null>(null);
  const [trackingDraft, setTrackingDraft] = useState('');

  // Add / Edit Product State
  const [editingProduct, setEditingProduct] = useState<VendorProduct | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    title: '',
    sku: '',
    category: 'Women' as 'Women' | 'Men' | 'Accessories',
    description: '',
    price: '',
    salePrice: '',
    stock: '10',
    sizes: ['S', 'M', 'L'] as string[],
    colorName: 'Espresso',
    colorHex: '#4A3428',
    status: 'Active' as ProductStatus,
    images: [] as string[],
  });

  // Payout Modal
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('50000');

  // Support Form
  const [supportSubject, setSupportSubject] = useState('');
  const [supportCategory, setSupportCategory] = useState('Logistics & Courier');

  // Toasts
  const [toasts, setToasts] = useState<{ id: number; text: string }[]>([]);
  const showToast = (text: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
  };

  // ============================================================================
  // VENDOR-SCOPED SELECTORS (Strict RLS: Never expose another vendor's rows)
  // ============================================================================
  const activeVendor = VENDORS.find((v) => v.id === activeVendorId) || VENDORS[0];
  const vendorProducts = useMemo(
    () => products.filter((p) => p.vendorId === activeVendorId),
    [products, activeVendorId]
  );
  const vendorOrders = useMemo(
    () => orders.filter((o) => o.vendorId === activeVendorId),
    [orders, activeVendorId]
  );
  const vendorPayouts = useMemo(
    () => payouts.filter((p) => p.vendorId === activeVendorId),
    [payouts, activeVendorId]
  );
  const vendorTickets = useMemo(
    () => tickets.filter((t) => t.vendorId === activeVendorId),
    [tickets, activeVendorId]
  );

  // Derived Financial & Operational Metrics
  const totalSales = vendorOrders
    .filter((o) => o.status !== 'Cancelled' && o.status !== 'Refunded')
    .reduce((s, o) => s + o.grossAmount, 0);
  const totalCommission = vendorOrders
    .filter((o) => o.status !== 'Cancelled' && o.status !== 'Refunded')
    .reduce((s, o) => s + o.commissionAmount, 0);
  const totalNetEarnings = totalSales - totalCommission;
  const completedPayouts = vendorPayouts
    .filter((p) => p.status === 'Completed')
    .reduce((s, p) => s + p.amount, 0);
  const pendingBalance = vendorOrders
    .filter((o) => o.status === 'Pending' || o.status === 'Processing' || o.status === 'Shipped')
    .reduce((s, o) => s + o.netAmount, 0);
  const availableBalance = Math.max(0, totalNetEarnings - pendingBalance);

  const pendingOrdersCount = vendorOrders.filter((o) => o.status === 'Pending').length;
  const lowStockProducts = vendorProducts.filter((p) => p.stock <= 5);
  const bestSellingProducts = [...vendorProducts].sort((a, b) => b.soldCount - a.soldCount).slice(0, 4);

  // Scoped Customers derived ONLY from this vendor's orders
  const vendorCustomers = useMemo(() => {
    const map = new Map<
      string,
      { name: string; city: string; orders: number; spend: number; lastDate: string }
    >();
    vendorOrders.forEach((o) => {
      const existing = map.get(o.customerName);
      if (existing) {
        existing.orders += 1;
        existing.spend += o.grossAmount;
        if (o.date > existing.lastDate) existing.lastDate = o.date;
      } else {
        map.set(o.customerName, {
          name: o.customerName,
          city: o.customerCity,
          orders: 1,
          spend: o.grossAmount,
          lastDate: o.date,
        });
      }
    });
    return Array.from(map.values());
  }, [vendorOrders]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setProductForm((prev) => ({
            ...prev,
            images: [...prev.images, reader.result as string],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.title.trim() || !productForm.price || !productForm.sku.trim()) {
      showToast('Please fill Title, SKU, and Price.');
      return;
    }

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id && p.vendorId === activeVendorId
            ? {
                ...p,
                title: productForm.title,
                sku: productForm.sku,
                category: productForm.category,
                description: productForm.description,
                price: Number(productForm.price),
                salePrice: productForm.salePrice ? Number(productForm.salePrice) : undefined,
                stock: Number(productForm.stock),
                sizes: productForm.sizes,
                colors: [{ name: productForm.colorName, hex: productForm.colorHex }],
                status: productForm.status,
                images: productForm.images,
              }
            : p
        )
      );
      showToast('Product updated in Supabase catalog');
      setEditingProduct(null);
    } else {
      const newProd: VendorProduct = {
        id: 'p-' + Date.now(),
        vendorId: activeVendorId,
        sku: productForm.sku.toUpperCase(),
        title: productForm.title,
        brand: activeVendor.name,
        category: productForm.category,
        description: productForm.description,
        price: Number(productForm.price),
        salePrice: productForm.salePrice ? Number(productForm.salePrice) : undefined,
        sizes: productForm.sizes,
        colors: [{ name: productForm.colorName, hex: productForm.colorHex }],
        stock: Number(productForm.stock),
        soldCount: 0,
        status: productForm.status,
        images: productForm.images,
      };
      setProducts((prev) => [newProd, ...prev]);
      showToast('New product published');
    }

    setProductForm({
      title: '',
      sku: '',
      category: 'Women',
      description: '',
      price: '',
      salePrice: '',
      stock: '10',
      sizes: ['S', 'M', 'L'],
      colorName: 'Espresso',
      colorHex: '#4A3428',
      status: 'Active',
      images: [],
    });
    setActiveTab('products');
  };

  const startEditProduct = (p: VendorProduct) => {
    setEditingProduct(p);
    setProductForm({
      title: p.title,
      sku: p.sku,
      category: p.category,
      description: p.description,
      price: String(p.price),
      salePrice: p.salePrice ? String(p.salePrice) : '',
      stock: String(p.stock),
      sizes: p.sizes,
      colorName: p.colors[0]?.name || 'Carbon',
      colorHex: p.colors[0]?.hex || '#171717',
      status: p.status,
      images: p.images,
    });
    setActiveTab('add-product');
  };

  const confirmDeleteProduct = () => {
    if (!deleteConfirmId) return;
    setProducts((prev) =>
      prev.filter((p) => !(p.id === deleteConfirmId && p.vendorId === activeVendorId))
    );
    setDeleteConfirmId(null);
    showToast('Product deleted');
  };

  const adjustStock = (id: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id && p.vendorId === activeVendorId) {
          const nextStock = Math.max(0, p.stock + delta);
          return {
            ...p,
            stock: nextStock,
            status: nextStock === 0 ? 'Out of Stock' : p.status === 'Out of Stock' ? 'Active' : p.status,
          };
        }
        return p;
      })
    );
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId && o.vendorId === activeVendorId ? { ...o, status } : o
      )
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status });
    }
    showToast(`Order updated to ${status}`);
  };

  const saveTrackingNumber = (orderId: string) => {
    if (!trackingDraft.trim()) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId && o.vendorId === activeVendorId
          ? { ...o, trackingNumber: trackingDraft.trim(), status: 'Shipped' }
          : o
      )
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({
        ...selectedOrder,
        trackingNumber: trackingDraft.trim(),
        status: 'Shipped',
      });
    }
    setTrackingDraft('');
    showToast('Tracking number saved & order marked Shipped');
  };

  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (role !== 'Owner') {
      showToast('Permission denied: Only Vendor Owners can request payouts.');
      return;
    }
    const amt = Number(payoutAmount);
    if (!amt || amt <= 0 || amt > availableBalance) {
      showToast('Enter a valid amount within your Available Balance.');
      return;
    }
    const rec: PayoutRecord = {
      id: 'pay-' + Date.now(),
      vendorId: activeVendorId,
      date: '2026-11-21',
      amount: amt,
      method: activeVendor.bankAccount,
      reference: 'REQ-' + Math.floor(10000 + Math.random() * 90000),
      status: 'Processing',
    };
    setPayouts((prev) => [rec, ...prev]);
    setPayoutModalOpen(false);
    showToast(`Payout of ${formatINR(amt)} requested`);
  };

  const downloadSalesCSV = () => {
    const headers = ['Order Number', 'Date', 'Customer', 'Gross (INR)', 'Commission (INR)', 'Net (INR)', 'Status'];
    const rows = vendorOrders.map((o) => [
      o.orderNumber,
      o.date,
      o.customerName,
      o.grossAmount,
      o.commissionAmount,
      o.netAmount,
      o.status,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeVendor.name.toLowerCase().replace(/\s+/g, '_')}_sales_report.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Sales report CSV downloaded');
  };

  // ============================================================================
  // SIDEBAR NAVIGATION CONFIG
  // ============================================================================
  const NAV_GROUPS: { label: string; items: { id: SidebarTab; title: string; icon: React.ReactNode; badge?: number }[] }[] = [
    {
      label: 'Operations',
      items: [
        { id: 'overview', title: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'products', title: 'Products', icon: <Package className="w-4 h-4" /> },
        { id: 'add-product', title: 'Add Product', icon: <PlusSquare className="w-4 h-4" /> },
        { id: 'inventory', title: 'Inventory', icon: <Boxes className="w-4 h-4" />, badge: lowStockProducts.length || undefined },
      ],
    },
    {
      label: 'Fulfillment',
      items: [
        { id: 'orders', title: 'Orders', icon: <ShoppingCart className="w-4 h-4" />, badge: pendingOrdersCount || undefined },
        { id: 'returns', title: 'Returns', icon: <RotateCcw className="w-4 h-4" /> },
        { id: 'customers', title: 'Customers', icon: <Users className="w-4 h-4" /> },
      ],
    },
    {
      label: 'Finance & Growth',
      items: [
        { id: 'analytics', title: 'Sales Analytics', icon: <BarChart3 className="w-4 h-4" /> },
        { id: 'earnings', title: 'Earnings', icon: <Wallet className="w-4 h-4" /> },
        { id: 'commission', title: 'Commission', icon: <Percent className="w-4 h-4" /> },
        { id: 'payouts', title: 'Payouts', icon: <ArrowUpRight className="w-4 h-4" /> },
      ],
    },
    {
      label: 'Atelier',
      items: [
        { id: 'settings', title: 'Store Settings', icon: <Settings className="w-4 h-4" /> },
        { id: 'support', title: 'Support', icon: <LifeBuoy className="w-4 h-4" /> },
      ],
    },
  ];

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="min-h-screen bg-brand-bg text-brand-ink flex font-sans antialiased">
      {/* ==================================================================== */}
      {/* DESKTOP SIDEBAR                                                      */}
      {/* ==================================================================== */}
      <aside className="hidden lg:flex w-64 bg-brand-surface border-r border-brand-border flex-col shrink-0">
        <div className="h-16 px-6 border-b border-brand-border flex items-center justify-between">
          <div>
            <p className="font-serif text-lg tracking-[0.14em] uppercase font-medium">Bandra Street</p>
            <p className="text-[10px] uppercase tracking-[0.14em] text-brand-primary">Vendor Portal</p>
          </div>
        </div>

        {/* Vendor Session Switcher (Demonstrates strict RLS isolation) */}
        <div className="p-4 border-b border-brand-border bg-brand-bg/70">
          <p className="text-[10px] uppercase tracking-[0.12em] text-brand-muted mb-1.5 flex items-center gap-1">
            <Shield className="w-3 h-3 text-brand-accent" /> Authenticated Store
          </p>
          <select
            value={activeVendorId}
            onChange={(e) => {
              setActiveVendorId(e.target.value);
              setSelectedOrder(null);
              showToast('Switched isolated vendor session');
            }}
            className="w-full px-2.5 py-1.5 bg-brand-surface border border-brand-border text-[11px] font-medium uppercase tracking-[0.08em] focus:outline-none"
          >
            {VENDORS.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
          <div className="flex items-center justify-between mt-2 text-[10px] text-brand-muted">
            <span>Role:</span>
            <button
              onClick={() => setRole(role === 'Owner' ? 'Manager' : 'Owner')}
              className="px-2 py-0.5 border border-brand-border bg-brand-surface text-brand-ink uppercase tracking-[0.08em] hover:border-brand-primary-hover"
            >
              {role}
            </button>
          </div>
          <button
            onClick={() => setVendorOnboardingOpen(true)}
            className="w-full mt-2 py-1.5 border border-brand-primary text-[10px] uppercase tracking-[0.1em] hover:bg-brand-primary-hover hover:text-brand-white transition-colors"
          >
            + Register New Vendor
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-3 text-[10px] uppercase tracking-[0.14em] text-brand-muted mb-2">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.id === 'add-product') setEditingProduct(null);
                        setActiveTab(item.id);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-[12px] transition-colors ${
                        active
                          ? 'bg-brand-primary text-brand-white font-medium'
                          : 'text-brand-ink hover:bg-brand-bg'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        {item.icon}
                        {item.title}
                      </span>
                      {item.badge !== undefined && (
                        <span
                          className={`px-1.5 py-0.5 text-[10px] ${
                            active ? 'bg-brand-primary-hover text-brand-white' : 'bg-brand-bg text-brand-ink border border-brand-border'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* ==================================================================== */}
      {/* MAIN WORKSPACE                                                       */}
      {/* ==================================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <header className="h-16 bg-brand-primary text-brand-white border-b border-brand-primary-hover px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 border border-brand-border"
              aria-label="Open navigation"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-[13px] uppercase tracking-[0.14em] font-semibold">
                {NAV_GROUPS.flatMap((g) => g.items).find((i) => i.id === activeTab)?.title}
              </h1>
              <p className="text-[11px] text-brand-secondary hidden sm:block">
                {activeVendor.name} · RLS Scoped ({role})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={downloadSalesCSV}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 border border-brand-secondary text-brand-white hover:border-brand-accent text-[11px] uppercase tracking-[0.1em]"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button
              onClick={() => {
                setEditingProduct(null);
                setActiveTab('add-product');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-primary-hover text-brand-white hover:bg-brand-primary transition-colors text-[11px] uppercase tracking-[0.12em]"
            >
              <Plus className="w-3.5 h-3.5" /> Add Product
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-[1440px] w-full mx-auto space-y-8">
          {/* ---------------------------------------------------------------- */}
          {/* 1. OVERVIEW                                                      */}
          {/* ---------------------------------------------------------------- */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* 6 KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                {[
                  { label: 'Total Sales', value: formatINR(totalSales), sub: '+18.4% vs last mo', icon: <IndianRupee className="w-4 h-4 text-brand-accent" /> },
                  { label: 'Total Orders', value: String(vendorOrders.length), sub: 'Last 30 days', icon: <ShoppingCart className="w-4 h-4 text-brand-accent" /> },
                  { label: 'Total Products', value: String(vendorProducts.length), sub: `${lowStockProducts.length} low stock`, icon: <Package className="w-4 h-4 text-brand-accent" /> },
                  { label: 'Pending Orders', value: String(pendingOrdersCount), sub: 'Awaiting dispatch', icon: <Clock className="w-4 h-4 text-brand-accent" /> },
                  { label: 'Monthly Revenue', value: formatINR(418500), sub: 'Nov 2026', icon: <Wallet className="w-4 h-4 text-brand-accent" /> },
                  { label: 'Sales Growth', value: '+22.4%', sub: 'MoM trajectory', icon: <TrendingUp className="w-4 h-4 text-brand-accent" /> },
                ].map((kpi) => (
                  <div key={kpi.label} className="bg-brand-surface border border-brand-border p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-[0.12em] text-brand-muted">
                        {kpi.label}
                      </span>
                      {kpi.icon}
                    </div>
                    <p className="text-2xl font-semibold tracking-tight">{kpi.value}</p>
                    <p className="text-[11px] text-brand-muted">{kpi.sub}</p>
                  </div>
                ))}
              </div>

              {/* Revenue Chart + Low-Stock Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 bg-brand-surface border border-brand-border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-[12px] uppercase tracking-[0.12em] font-semibold">
                        Revenue Performance (INR)
                      </h2>
                      <p className="text-[12px] text-brand-muted">6-month gross merchandise volume</p>
                    </div>
                    <span className="px-2.5 py-1 bg-brand-bg border border-brand-border text-[10px] uppercase tracking-[0.1em] text-brand-primary">
                      +22.4% Growth
                    </span>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={REVENUE_CHART_DATA}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-brand-border)" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-brand-muted)' }} />
                        <YAxis tick={{ fontSize: 11, fill: 'var(--color-brand-muted)' }} />
                        <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="var(--color-brand-primary)"
                          fill="var(--color-brand-accent)"
                          fillOpacity={0.22}
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Low-Stock Alerts */}
                <div className="lg:col-span-4 bg-brand-surface border border-brand-border p-6 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[12px] uppercase tracking-[0.12em] font-semibold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-brand-accent" /> Low-Stock Alerts
                    </h2>
                    <button
                      onClick={() => setActiveTab('inventory')}
                      className="text-[11px] uppercase tracking-[0.1em] text-brand-primary hover:underline"
                    >
                      Manage
                    </button>
                  </div>
                  <div className="space-y-3 flex-1">
                    {lowStockProducts.length === 0 ? (
                      <p className="text-[13px] text-brand-muted py-8 text-center">
                        All SKUs are well stocked.
                      </p>
                    ) : (
                      lowStockProducts.map((p) => (
                        <div
                          key={p.id}
                          className="p-3.5 bg-brand-bg border border-brand-border flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <p className="text-[12px] font-medium truncate">{p.title}</p>
                            <p className="text-[11px] text-brand-muted">
                              {p.sku} · Only {p.stock} left
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              adjustStock(p.id, 10);
                              showToast(`Restocked +10 units for ${p.sku}`);
                            }}
                            className="px-3 py-1.5 bg-brand-primary text-brand-white text-[10px] uppercase tracking-[0.1em] shrink-0"
                          >
                            +10 Stock
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Orders & Best-Selling Products */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-brand-surface border border-brand-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[12px] uppercase tracking-[0.12em] font-semibold">
                      Recent Orders
                    </h2>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-[11px] uppercase tracking-[0.1em] text-brand-primary hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[12px]">
                      <thead>
                        <tr className="border-b border-brand-border text-[10px] uppercase tracking-[0.12em] text-brand-muted">
                          <th className="py-2.5">Order</th>
                          <th className="py-2.5">Customer</th>
                          <th className="py-2.5">Amount</th>
                          <th className="py-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border">
                        {vendorOrders.slice(0, 5).map((o) => (
                          <tr key={o.id} className="hover:bg-brand-bg">
                            <td className="py-3 font-medium">{o.orderNumber}</td>
                            <td className="py-3">{o.customerName}</td>
                            <td className="py-3">{formatINR(o.grossAmount)}</td>
                            <td className="py-3">
                              <StatusBadge status={o.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-brand-surface border border-brand-border p-6">
                  <h2 className="text-[12px] uppercase tracking-[0.12em] font-semibold mb-4">
                    Best-Selling Products
                  </h2>
                  <div className="space-y-3">
                    {bestSellingProducts.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-3 border border-brand-border"
                      >
                        <div className="min-w-0">
                          <p className="text-[12px] font-medium truncate">{p.title}</p>
                          <p className="text-[11px] text-brand-muted">
                            {p.soldCount} sold · {formatINR(p.salePrice || p.price)}
                          </p>
                        </div>
                        <span className="text-[11px] font-semibold text-brand-primary shrink-0">
                          {formatINR((p.salePrice || p.price) * p.soldCount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* 2. PRODUCTS LIST                                                 */}
          {/* ---------------------------------------------------------------- */}
          {activeTab === 'products' && (
            <div className="bg-brand-surface border border-brand-border p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center border border-brand-border px-3 py-2 w-full sm:w-72">
                  <Search className="w-4 h-4 text-brand-muted mr-2" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search SKU or product..."
                    className="w-full text-[12px] focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setActiveTab('add-product');
                  }}
                  className="px-4 py-2.5 bg-brand-primary text-brand-white text-[11px] uppercase tracking-[0.12em]"
                >
                  + Add Product
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12px]">
                  <thead>
                    <tr className="border-b border-brand-border text-[10px] uppercase tracking-[0.12em] text-brand-muted">
                      <th className="py-3">Product</th>
                      <th className="py-3">SKU</th>
                      <th className="py-3">Category</th>
                      <th className="py-3">Price</th>
                      <th className="py-3">Stock</th>
                      <th className="py-3">Status</th>
                      <th className="py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {vendorProducts
                      .filter(
                        (p) =>
                          p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
                          p.sku.toLowerCase().includes(productSearch.toLowerCase())
                      )
                      .map((p) => (
                        <tr key={p.id} className="hover:bg-brand-bg">
                          <td className="py-3.5 font-medium">{p.title}</td>
                          <td className="py-3.5 text-brand-muted">{p.sku}</td>
                          <td className="py-3.5">{p.category}</td>
                          <td className="py-3.5">
                            {p.salePrice ? (
                              <span>
                                {formatINR(p.salePrice)}{' '}
                                <span className="line-through text-brand-muted text-[11px]">
                                  {formatINR(p.price)}
                                </span>
                              </span>
                            ) : (
                              formatINR(p.price)
                            )}
                          </td>
                          <td className="py-3.5">{p.stock}</td>
                          <td className="py-3.5">
                            <span className="px-2 py-0.5 text-[10px] uppercase border border-brand-border bg-brand-bg">
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3.5 text-right space-x-2">
                            <button
                              onClick={() => startEditProduct(p)}
                              className="p-1.5 border border-brand-border hover:border-brand-primary-hover"
                              aria-label="Edit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(p.id)}
                              className="p-1.5 border border-brand-border hover:border-brand-primary-hover text-brand-muted hover:text-brand-primary"
                              aria-label="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* 3. ADD / EDIT PRODUCT FORM                                       */}
          {/* ---------------------------------------------------------------- */}
          {activeTab === 'add-product' && (
            <form
              onSubmit={handleSaveProduct}
              className="bg-brand-surface border border-brand-border p-6 sm:p-8 max-w-4xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-brand-border pb-4">
                <h2 className="font-serif text-2xl font-light">
                  {editingProduct ? `Edit: ${editingProduct.title}` : 'Add New Product'}
                </h2>
                <span className="text-[11px] uppercase tracking-[0.12em] text-brand-primary">
                  Brand: {activeVendor.name}
                </span>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.12em] text-brand-muted mb-2">
                  Product Images Upload
                </label>
                <label className="flex flex-col items-center justify-center border border-dashed border-brand-primary bg-brand-bg p-6 cursor-pointer hover:bg-brand-surface transition-colors">
                  <Upload className="w-5 h-5 mb-2 text-brand-accent" />
                  <span className="text-[11px] uppercase tracking-[0.12em]">
                    Click to upload 3:4 editorial photos
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                {productForm.images.length > 0 && (
                  <div className="flex gap-3 mt-3">
                    {productForm.images.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt="Uploaded preview"
                        className="w-16 aspect-[3/4] object-cover border border-brand-border"
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.12em] text-brand-muted mb-1.5">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    value={productForm.title}
                    onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                    placeholder="e.g., Sculpted Cashmere Coat"
                    className="w-full px-3.5 py-2.5 border border-brand-border text-[13px] focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.12em] text-brand-muted mb-1.5">
                    SKU *
                  </label>
                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    placeholder="e.g., VER-COAT-009"
                    className="w-full px-3.5 py-2.5 border border-brand-border text-[13px] focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.12em] text-brand-muted mb-1.5">
                    Category
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        category: e.target.value as 'Women' | 'Men' | 'Accessories',
                      })
                    }
                    className="w-full px-3.5 py-2.5 border border-brand-border bg-brand-surface text-[13px]"
                  >
                    <option value="Women">Women</option>
                    <option value="Men">Men</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.12em] text-brand-muted mb-1.5">
                    Product Status
                  </label>
                  <select
                    value={productForm.status}
                    onChange={(e) =>
                      setProductForm({ ...productForm, status: e.target.value as ProductStatus })
                    }
                    className="w-full px-3.5 py-2.5 border border-brand-border bg-brand-surface text-[13px]"
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.12em] text-brand-muted mb-1.5">
                    Regular Price (INR) *
                  </label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="64000"
                    className="w-full px-3.5 py-2.5 border border-brand-border text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.12em] text-brand-muted mb-1.5">
                    Sale Price (INR, optional)
                  </label>
                  <input
                    type="number"
                    value={productForm.salePrice}
                    onChange={(e) => setProductForm({ ...productForm, salePrice: e.target.value })}
                    placeholder="52000"
                    className="w-full px-3.5 py-2.5 border border-brand-border text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.12em] text-brand-muted mb-1.5">
                    Inventory Quantity
                  </label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-brand-border text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.12em] text-brand-muted mb-1.5">
                    Color Variant
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={productForm.colorName}
                      onChange={(e) => setProductForm({ ...productForm, colorName: e.target.value })}
                      className="flex-1 px-3 py-2.5 border border-brand-border text-[13px]"
                    />
                    <input
                      type="color"
                      value={productForm.colorHex}
                      onChange={(e) => setProductForm({ ...productForm, colorHex: e.target.value })}
                      className="w-11 h-10 border border-brand-border p-1"
                    />
                  </div>
                </div>
              </div>

              {/* Size Variants */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.12em] text-brand-muted mb-2">
                  Size Variants
                </label>
                <div className="flex flex-wrap gap-2">
                  {['XS', 'S', 'M', 'L', 'XL', 'One Size'].map((sz) => {
                    const selected = productForm.sizes.includes(sz);
                    return (
                      <button
                        type="button"
                        key={sz}
                        onClick={() =>
                          setProductForm((prev) => ({
                            ...prev,
                            sizes: selected
                              ? prev.sizes.filter((s) => s !== sz)
                              : [...prev.sizes, sz],
                          }))
                        }
                        className={`px-3.5 py-1.5 border text-[11px] uppercase ${
                          selected
                            ? 'bg-brand-primary text-brand-white border-brand-primary'
                            : 'border-brand-border'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.12em] text-brand-muted mb-1.5">
                  Product Description
                </label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Describe fabric provenance, silhouette, and atelier craft..."
                  className="w-full px-3.5 py-2.5 border border-brand-border text-[13px]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="px-7 py-3.5 bg-brand-primary text-brand-white hover:bg-brand-primary-hover transition-colors text-[11px] uppercase tracking-[0.14em]"
                >
                  {editingProduct ? 'Save Changes' : 'Publish Product'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className="px-6 py-3.5 border border-brand-border text-[11px] uppercase tracking-[0.12em]"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* 4. INVENTORY                                                     */}
          {/* ---------------------------------------------------------------- */}
          {activeTab === 'inventory' && (
            <div className="bg-brand-surface border border-brand-border p-6 space-y-4">
              <h2 className="text-[12px] uppercase tracking-[0.12em] font-semibold">
                SKU Inventory Ledger
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12px]">
                  <thead>
                    <tr className="border-b border-brand-border text-[10px] uppercase tracking-[0.12em] text-brand-muted">
                      <th className="py-3">SKU</th>
                      <th className="py-3">Product</th>
                      <th className="py-3">Status</th>
                      <th className="py-3">Available Stock</th>
                      <th className="py-3 text-right">Adjust</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {vendorProducts.map((p) => (
                      <tr key={p.id}>
                        <td className="py-3 font-mono text-[11px]">{p.sku}</td>
                        <td className="py-3 font-medium">{p.title}</td>
                        <td className="py-3">
                          {p.stock <= 5 ? (
                            <span className="text-brand-primary text-[11px] font-medium">Low Stock</span>
                          ) : (
                            <span className="text-brand-muted text-[11px]">Healthy</span>
                          )}
                        </td>
                        <td className="py-3 font-semibold">{p.stock} units</td>
                        <td className="py-3 text-right">
                          <div className="inline-flex items-center border border-brand-border">
                            <button onClick={() => adjustStock(p.id, -1)} className="p-1.5 hover:bg-brand-bg">
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => adjustStock(p.id, 1)} className="p-1.5 hover:bg-brand-bg border-l border-brand-border">
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* 5. ORDERS                                                        */}
          {/* ---------------------------------------------------------------- */}
          {activeTab === 'orders' && (
            <div className="bg-brand-surface border border-brand-border p-6 space-y-5">
              <div className="flex flex-wrap gap-2">
                {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-3.5 py-1.5 border text-[11px] uppercase tracking-[0.1em] ${
                      orderStatusFilter === st
                        ? 'bg-brand-primary text-brand-white border-brand-primary'
                        : 'border-brand-border hover:border-brand-primary-hover'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12px]">
                  <thead>
                    <tr className="border-b border-brand-border text-[10px] uppercase tracking-[0.12em] text-brand-muted">
                      <th className="py-3">Order #</th>
                      <th className="py-3">Date</th>
                      <th className="py-3">Customer</th>
                      <th className="py-3">Net Payout</th>
                      <th className="py-3">Tracking</th>
                      <th className="py-3">Status</th>
                      <th className="py-3 text-right">Manage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {vendorOrders
                      .filter((o) => orderStatusFilter === 'All' || o.status === orderStatusFilter)
                      .map((o) => (
                        <tr key={o.id} className="hover:bg-brand-bg">
                          <td className="py-3.5 font-medium">{o.orderNumber}</td>
                          <td className="py-3.5 text-brand-muted">{o.date}</td>
                          <td className="py-3.5">
                            {o.customerName} ({o.customerCity})
                          </td>
                          <td className="py-3.5 font-medium">{formatINR(o.netAmount)}</td>
                          <td className="py-3.5 font-mono text-[11px] text-brand-muted">
                            {o.trackingNumber || '—'}
                          </td>
                          <td className="py-3.5">
                            <StatusBadge status={o.status} />
                          </td>
                          <td className="py-3.5 text-right space-x-2">
                            {o.status === 'Pending' && (
                              <button
                                onClick={() => updateOrderStatus(o.id, 'Processing')}
                                className="px-3 py-1 bg-brand-primary text-brand-white text-[10px] uppercase tracking-[0.1em]"
                              >
                                Accept
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setSelectedOrder(o);
                                setTrackingDraft(o.trackingNumber);
                              }}
                              className="px-3 py-1 border border-brand-border hover:border-brand-primary-hover text-[10px] uppercase tracking-[0.1em]"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* 6. RETURNS & CANCELLATIONS                                       */}
          {/* ---------------------------------------------------------------- */}
          {activeTab === 'returns' && (
            <div className="bg-brand-surface border border-brand-border p-6 space-y-4">
              <h2 className="text-[12px] uppercase tracking-[0.12em] font-semibold">
                Returns &amp; Cancellations Queue
              </h2>
              {vendorOrders.filter(
                (o) => o.status === 'Return Requested' || o.status === 'Cancelled' || o.status === 'Refunded'
              ).length === 0 ? (
                <p className="text-[13px] text-brand-muted py-10 text-center">
                  No active return or cancellation requests.
                </p>
              ) : (
                <div className="space-y-3">
                  {vendorOrders
                    .filter(
                      (o) =>
                        o.status === 'Return Requested' ||
                        o.status === 'Cancelled' ||
                        o.status === 'Refunded'
                    )
                    .map((o) => (
                      <div
                        key={o.id}
                        className="p-5 border border-brand-border bg-brand-bg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div>
                          <p className="text-[12px] font-semibold">
                            {o.orderNumber} — {o.customerName}
                          </p>
                          <p className="text-[12px] text-brand-muted mt-1">
                            Reason: {o.returnReason || 'Client requested cancellation'}
                          </p>
                          <p className="text-[11px] text-brand-primary mt-1">
                            Amount: {formatINR(o.grossAmount)} · Status: {o.status}
                          </p>
                        </div>
                        {o.status === 'Return Requested' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateOrderStatus(o.id, 'Refunded')}
                              className="px-4 py-2 bg-brand-primary text-brand-white text-[10px] uppercase tracking-[0.12em]"
                            >
                              Approve Refund
                            </button>
                            <button
                              onClick={() => updateOrderStatus(o.id, 'Delivered')}
                              className="px-4 py-2 border border-brand-border bg-brand-surface text-[10px] uppercase tracking-[0.12em]"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* 7. CUSTOMERS (Vendor-scoped)                                     */}
          {/* ---------------------------------------------------------------- */}
          {activeTab === 'customers' && (
            <div className="bg-brand-surface border border-brand-border p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-[12px] uppercase tracking-[0.12em] font-semibold">
                  Verified Store Customers
                </h2>
                <span className="text-[11px] text-brand-muted">
                  Isolated to {activeVendor.name} orders only
                </span>
              </div>
              <table className="w-full text-left text-[12px]">
                <thead>
                  <tr className="border-b border-brand-border text-[10px] uppercase tracking-[0.12em] text-brand-muted">
                    <th className="py-3">Client</th>
                    <th className="py-3">City</th>
                    <th className="py-3">Orders</th>
                    <th className="py-3">Total Spend</th>
                    <th className="py-3">Last Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {vendorCustomers.map((c) => (
                    <tr key={c.name}>
                      <td className="py-3 font-medium">{c.name}</td>
                      <td className="py-3 text-brand-muted">{c.city}</td>
                      <td className="py-3">{c.orders}</td>
                      <td className="py-3 font-medium">{formatINR(c.spend)}</td>
                      <td className="py-3 text-brand-muted">{c.lastDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* 8. SALES ANALYTICS                                               */}
          {/* ---------------------------------------------------------------- */}
          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-brand-surface border border-brand-border p-6">
                <h2 className="text-[12px] uppercase tracking-[0.12em] font-semibold mb-4">
                  Monthly Order Volume
                </h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={REVENUE_CHART_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-brand-border)" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-brand-muted)' }} />
                      <YAxis tick={{ fontSize: 11, fill: 'var(--color-brand-muted)' }} />
                      <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                      <Bar dataKey="orders" fill="var(--color-brand-primary)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-brand-surface border border-brand-border p-6">
                <h2 className="text-[12px] uppercase tracking-[0.12em] font-semibold mb-4">
                  Revenue Trajectory
                </h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={REVENUE_CHART_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-brand-border)" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-brand-muted)' }} />
                      <YAxis tick={{ fontSize: 11, fill: 'var(--color-brand-muted)' }} />
                      <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="var(--color-brand-accent)"
                        fill="var(--color-brand-accent)"
                        fillOpacity={0.25}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* 9. EARNINGS / 10. COMMISSION / 11. PAYOUTS                       */}
          {/* ---------------------------------------------------------------- */}
          {(activeTab === 'earnings' || activeTab === 'commission' || activeTab === 'payouts') && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-brand-surface border border-brand-border p-5">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-brand-muted">Total Earnings (Net)</p>
                  <p className="text-2xl font-semibold mt-2">{formatINR(totalNetEarnings)}</p>
                </div>
                <div className="bg-brand-surface border border-brand-border p-5">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-brand-muted">
                    Platform Commission ({Math.round(activeVendor.commissionRate * 100)}%)
                  </p>
                  <p className="text-2xl font-semibold mt-2">{formatINR(totalCommission)}</p>
                </div>
                <div className="bg-brand-surface border border-brand-border p-5">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-brand-muted">Available Balance</p>
                  <p className="text-2xl font-semibold text-brand-primary mt-2">{formatINR(availableBalance)}</p>
                </div>
                <div className="bg-brand-surface border border-brand-border p-5">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-brand-muted">Pending Balance</p>
                  <p className="text-2xl font-semibold mt-2">{formatINR(pendingBalance)}</p>
                </div>
              </div>

              <div className="flex flex-wrap justify-between items-center gap-4 bg-brand-surface border border-brand-border p-6">
                <div>
                  <h2 className="text-[13px] font-semibold uppercase tracking-[0.1em]">
                    Settlement &amp; Payouts
                  </h2>
                  <p className="text-[12px] text-brand-muted">
                    Bank: {activeVendor.bankAccount} · Lifetime settled: {formatINR(completedPayouts)}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={downloadSalesCSV}
                    className="px-4 py-2.5 border border-brand-border hover:border-brand-primary-hover text-[11px] uppercase tracking-[0.1em] inline-flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Sales Report
                  </button>
                  <button
                    onClick={() => setPayoutModalOpen(true)}
                    className="px-5 py-2.5 bg-brand-primary text-brand-white hover:bg-brand-primary-hover text-[11px] uppercase tracking-[0.12em]"
                  >
                    Request Payout
                  </button>
                </div>
              </div>

              {/* Transaction & Commission Ledger */}
              <div className="bg-brand-surface border border-brand-border p-6">
                <h3 className="text-[12px] uppercase tracking-[0.12em] font-semibold mb-4">
                  {activeTab === 'payouts' ? 'Payout History' : 'Transaction & Commission History'}
                </h3>
                {activeTab === 'payouts' ? (
                  <table className="w-full text-left text-[12px]">
                    <thead>
                      <tr className="border-b border-brand-border text-[10px] uppercase tracking-[0.12em] text-brand-muted">
                        <th className="py-3">Date</th>
                        <th className="py-3">Reference</th>
                        <th className="py-3">Destination</th>
                        <th className="py-3">Amount</th>
                        <th className="py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                      {vendorPayouts.map((p) => (
                        <tr key={p.id}>
                          <td className="py-3">{p.date}</td>
                          <td className="py-3 font-mono text-[11px]">{p.reference}</td>
                          <td className="py-3">{p.method}</td>
                          <td className="py-3 font-medium">{formatINR(p.amount)}</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 border border-brand-border bg-brand-bg text-[10px] uppercase">
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full text-left text-[12px]">
                    <thead>
                      <tr className="border-b border-brand-border text-[10px] uppercase tracking-[0.12em] text-brand-muted">
                        <th className="py-3">Order</th>
                        <th className="py-3">Date</th>
                        <th className="py-3">Gross</th>
                        <th className="py-3">Commission</th>
                        <th className="py-3">Net Earned</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                      {vendorOrders.map((o) => (
                        <tr key={o.id}>
                          <td className="py-3 font-medium">{o.orderNumber}</td>
                          <td className="py-3 text-brand-muted">{o.date}</td>
                          <td className="py-3">{formatINR(o.grossAmount)}</td>
                          <td className="py-3 text-brand-muted">-{formatINR(o.commissionAmount)}</td>
                          <td className="py-3 font-semibold text-brand-primary">{formatINR(o.netAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* 12. STORE SETTINGS                                               */}
          {/* ---------------------------------------------------------------- */}
          {activeTab === 'settings' && (
            <div className="bg-brand-surface border border-brand-border p-6 sm:p-8 max-w-3xl space-y-6">
              <h2 className="font-serif text-2xl font-light border-b border-brand-border pb-4">
                Store Settings &amp; Access Control
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
                <div className="p-4 bg-brand-bg border border-brand-border">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-brand-muted">Store Name</p>
                  <p className="font-medium mt-1">{activeVendor.name}</p>
                </div>
                <div className="p-4 bg-brand-bg border border-brand-border">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-brand-muted">GSTIN</p>
                  <p className="font-mono mt-1">{activeVendor.gstin}</p>
                </div>
                <div className="p-4 bg-brand-bg border border-brand-border">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-brand-muted">Active Role</p>
                  <p className="font-medium mt-1">{role} (Vendor ID: {activeVendor.id})</p>
                </div>
                <div className="p-4 bg-brand-bg border border-brand-border">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-brand-muted">Settlement Bank</p>
                  <p className="font-medium mt-1">{activeVendor.bankAccount}</p>
                </div>
              </div>
              <div className="p-4 border border-brand-border text-[12px] text-brand-muted">
                Row-Level Security (RLS) policy active: queries are strictly filtered by{' '}
                <code className="text-brand-ink">vendor_id = auth.uid()</code>. Cross-vendor data
                access is blocked.
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* 13. SUPPORT                                                      */}
          {/* ---------------------------------------------------------------- */}
          {activeTab === 'support' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!supportSubject.trim()) return;
                  setTickets((prev) => [
                    {
                      id: 't-' + Date.now(),
                      vendorId: activeVendorId,
                      subject: supportSubject.trim(),
                      category: supportCategory,
                      status: 'Open',
                      date: '2026-11-21',
                    },
                    ...prev,
                  ]);
                  setSupportSubject('');
                  showToast('Support ticket submitted');
                }}
                className="lg:col-span-5 bg-brand-surface border border-brand-border p-6 space-y-4"
              >
                <h2 className="text-[12px] uppercase tracking-[0.12em] font-semibold">
                  Contact Vendor Concierge
                </h2>
                <select
                  value={supportCategory}
                  onChange={(e) => setSupportCategory(e.target.value)}
                  className="w-full px-3 py-2.5 border border-brand-border bg-brand-surface text-[12px]"
                >
                  <option>Logistics &amp; Courier</option>
                  <option>Payouts &amp; GST</option>
                  <option>Merchandising</option>
                </select>
                <input
                  type="text"
                  value={supportSubject}
                  onChange={(e) => setSupportSubject(e.target.value)}
                  placeholder="Describe your request..."
                  className="w-full px-3 py-2.5 border border-brand-border text-[12px]"
                />
                <button
                  type="submit"
                  className="w-full py-3 bg-brand-primary text-brand-white text-[11px] uppercase tracking-[0.12em]"
                >
                  Submit Ticket
                </button>
              </form>

              <div className="lg:col-span-7 bg-brand-surface border border-brand-border p-6 space-y-3">
                <h2 className="text-[12px] uppercase tracking-[0.12em] font-semibold">
                  Your Support Tickets
                </h2>
                {vendorTickets.map((t) => (
                  <div key={t.id} className="p-4 border border-brand-border flex justify-between items-center">
                    <div>
                      <p className="text-[12px] font-medium">{t.subject}</p>
                      <p className="text-[11px] text-brand-muted">
                        {t.category} · {t.date}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-brand-bg border border-brand-border text-[10px] uppercase">
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ==================================================================== */}
      {/* MODALS: ORDER DETAILS, DELETE CONFIRM, PAYOUT REQUEST, MOBILE MENU   */}
      {/* ==================================================================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-brand-primary/40">
          <div className="w-full max-w-md bg-brand-surface h-full border-l border-brand-border p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-brand-border">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-brand-primary">Order Details</p>
                  <h3 className="text-lg font-semibold">{selectedOrder.orderNumber}</h3>
                </div>
                <button onClick={() => setSelectedOrder(null)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-[12px] space-y-1">
                <p className="font-medium">{selectedOrder.customerName}</p>
                <p className="text-brand-muted">{selectedOrder.customerCity} · {selectedOrder.date}</p>
              </div>

              <div className="border-t border-b border-brand-border py-4 space-y-2">
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-[12px]">
                    <span>
                      {it.productTitle} ({it.size}) × {it.qty}
                    </span>
                    <span className="font-medium">{formatINR(it.price)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-[0.12em] text-brand-muted">
                  Update Status
                </label>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value as OrderStatus)}
                  className="w-full px-3 py-2.5 border border-brand-border bg-brand-surface text-[12px]"
                >
                  {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-[0.12em] text-brand-muted">
                  Shipping Tracking Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={trackingDraft}
                    onChange={(e) => setTrackingDraft(e.target.value)}
                    placeholder="e.g., DHL-991024"
                    className="flex-1 px-3 py-2 border border-brand-border text-[12px]"
                  />
                  <button
                    onClick={() => saveTrackingNumber(selectedOrder.id)}
                    className="px-4 py-2 bg-brand-primary text-brand-white text-[10px] uppercase tracking-[0.1em]"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-primary/50">
          <div className="bg-brand-surface border border-brand-primary max-w-sm w-full p-6 space-y-4">
            <h3 className="text-[14px] font-semibold uppercase tracking-[0.1em]">Delete Product?</h3>
            <p className="text-[12px] text-brand-muted">
              This will permanently remove the SKU from your store catalog.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border border-brand-border text-[11px] uppercase"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteProduct}
                className="px-4 py-2 bg-brand-primary text-brand-white text-[11px] uppercase"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {payoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-primary/50">
          <form
            onSubmit={handleRequestPayout}
            className="bg-brand-surface border border-brand-primary max-w-md w-full p-6 space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-[13px] font-semibold uppercase tracking-[0.12em]">
                Request Payout
              </h3>
              <button type="button" onClick={() => setPayoutModalOpen(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[12px] text-brand-muted">
              Available Balance: <strong className="text-brand-ink">{formatINR(availableBalance)}</strong>
            </p>
            <input
              type="number"
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-brand-border text-[13px]"
            />
            <button
              type="submit"
              className="w-full py-3 bg-brand-primary text-brand-white text-[11px] uppercase tracking-[0.12em]"
            >
              Confirm Payout to {activeVendor.bankAccount}
            </button>
          </form>
        </div>
      )}

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-brand-primary/40" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative z-10 w-64 bg-brand-surface h-full p-4 overflow-y-auto space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-brand-border">
              <span className="font-serif text-base uppercase tracking-[0.12em]">Bandra Street</span>
              <button onClick={() => setMobileSidebarOpen(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            {NAV_GROUPS.flatMap((g) => g.items).map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-[12px] ${
                  activeTab === item.id ? 'bg-brand-primary text-brand-white' : 'text-brand-ink'
                }`}
              >
                {item.icon} {item.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Vendor Pending Approval Lock Screen */}
      {pendingVendorApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-primary/75">
          <div className="bg-brand-surface border border-brand-primary max-w-md w-full p-8 space-y-4 text-center">
            <span className="inline-block px-3 py-1 bg-brand-bg border border-brand-accent text-brand-primary text-[10px] uppercase tracking-[0.14em]">
              Pending Admin Approval
            </span>
            <h3 className="font-serif text-3xl font-light">{pendingVendorApp.storeName}</h3>
            <p className="text-[12px] text-brand-muted leading-relaxed">
              Your GSTIN ({pendingVendorApp.gstin}) and {pendingVendorApp.docs.length} verification
              document(s) have been submitted. Dashboard access is locked until Admin approval.
            </p>
            <button
              onClick={() => {
                setPendingVendorApp(null);
                showToast('Returned to approved vendor session');
              }}
              className="px-6 py-3 bg-brand-primary text-brand-white text-[11px] uppercase tracking-[0.12em]"
            >
              Return to Approved Store
            </button>
          </div>
        </div>
      )}

      {/* Vendor Registration & Document Upload Modal */}
      {vendorOnboardingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-primary/50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newVendorForm.storeName.trim() || !newVendorForm.gstin.trim()) return;
              setPendingVendorApp({
                storeName: newVendorForm.storeName.trim(),
                gstin: newVendorForm.gstin.trim(),
                docs: newVendorForm.docs.length ? newVendorForm.docs : ['GST_Certificate.pdf'],
              });
              setVendorOnboardingOpen(false);
              showToast('Vendor application submitted — Pending Approval');
            }}
            className="bg-brand-surface border border-brand-primary max-w-md w-full p-6 space-y-4"
          >
            <div className="flex justify-between items-center pb-2 border-b border-brand-border">
              <h3 className="text-[13px] font-semibold uppercase tracking-[0.12em]">
                Vendor Registration
              </h3>
              <button type="button" onClick={() => setVendorOnboardingOpen(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              required
              placeholder="Store / Atelier Name"
              value={newVendorForm.storeName}
              onChange={(e) => setNewVendorForm({ ...newVendorForm, storeName: e.target.value })}
              className="w-full px-3 py-2 border border-brand-border text-[12px]"
            />
            <input
              type="text"
              required
              placeholder="GSTIN (e.g., 27AABCV4829L1Z5)"
              value={newVendorForm.gstin}
              onChange={(e) => setNewVendorForm({ ...newVendorForm, gstin: e.target.value })}
              className="w-full px-3 py-2 border border-brand-border text-[12px]"
            />
            <input
              type="text"
              required
              placeholder="PAN Number"
              value={newVendorForm.pan}
              onChange={(e) => setNewVendorForm({ ...newVendorForm, pan: e.target.value })}
              className="w-full px-3 py-2 border border-brand-border text-[12px]"
            />
            <label className="block border border-dashed border-brand-primary p-3 text-center text-[11px] uppercase cursor-pointer bg-brand-bg">
              Upload GST / PAN / Cheque Documents ({newVendorForm.docs.length} selected)
              <input
                type="file"
                multiple
                onChange={(e) => {
                  const names = Array.from(e.target.files || []).map((f) => f.name);
                  setNewVendorForm((prev) => ({ ...prev, docs: [...prev.docs, ...names] }));
                }}
                className="hidden"
              />
            </label>
            <button
              type="submit"
              className="w-full py-3 bg-brand-primary text-brand-white text-[11px] uppercase tracking-[0.12em]"
            >
              Submit Application
            </button>
          </form>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed bottom-5 right-5 z-50 space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="bg-brand-primary text-brand-white px-4 py-2.5 text-[11px] uppercase tracking-[0.1em] shadow-md"
          >
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const styles: Record<OrderStatus, string> = {
    Pending: 'border-brand-accent text-brand-primary bg-brand-bg',
    Processing: 'border-brand-primary text-brand-ink bg-brand-bg',
    Shipped: 'border-brand-border text-brand-ink bg-brand-surface',
    Delivered: 'border-brand-primary text-brand-white bg-brand-primary',
    Cancelled: 'border-brand-border text-brand-muted bg-brand-bg',
    'Return Requested': 'border-brand-primary text-brand-white bg-brand-primary',
    Refunded: 'border-brand-border text-brand-muted bg-brand-surface',
  };
  return (
    <span className={`px-2 py-0.5 border text-[10px] uppercase tracking-[0.08em] ${styles[status]}`}>
      {status}
    </span>
  );
}