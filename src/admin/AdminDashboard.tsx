import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  FileCheck2,
  Store,
  Users,
  Package,
  CheckSquare,
  FolderTree,
  Award,
  ShoppingCart,
  CreditCard,
  RotateCcw,
  Percent,
  Wallet,
  Ticket,
  Megaphone,
  Image as ImageIcon,
  Star,
  FileSpreadsheet,
  Bell,
  Settings,
  Search,
  Download,
  ShieldCheck,
  Check,
  X,
  Eye,
  EyeOff,
  FileText,
  AlertCircle,
  Ban,
  RefreshCw,
  Menu,
  Plus,
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
// TYPES
// ============================================================================

type AdminTab =
  | 'dashboard'
  | 'vendor-applications'
  | 'all-vendors'
  | 'customers'
  | 'products'
  | 'product-approvals'
  | 'categories'
  | 'brands'
  | 'orders'
  | 'payments'
  | 'refunds'
  | 'commission-settings'
  | 'vendor-payouts'
  | 'coupons'
  | 'promotions'
  | 'banners'
  | 'reviews'
  | 'reports'
  | 'notifications'
  | 'website-settings';

type VendorStatus = 'Active' | 'Pending' | 'Suspended' | 'Rejected' | 'Docs Requested';
type ProductApprovalStatus = 'Approved' | 'Pending' | 'Rejected';
type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Return Requested' | 'Refunded';

interface VendorRecord {
  id: string;
  name: string;
  ownerName: string;
  email: string;
  city: string;
  gstin: string;
  pan: string;
  gstVerified: boolean;
  panVerified: boolean;
  documents: string[];
  status: VendorStatus;
  commissionOverride?: number;
  rejectionReason?: string;
  joinedDate: string;
  gmv: number;
}

interface AdminProduct {
  id: string;
  sku: string;
  title: string;
  vendorId: string;
  vendorName: string;
  category: string;
  price: number;
  description: string;
  approvalStatus: ProductApprovalStatus;
  visible: boolean;
  rejectionReason?: string;
}

interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  vendorId: string;
  vendorName: string;
  date: string;
  amount: number;
  status: OrderStatus;
  paymentMethod: string;
}

interface PayoutRequest {
  id: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  bank: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

interface CouponItem {
  id: string;
  code: string;
  discountPct: number;
  active: boolean;
  uses: number;
}

// ============================================================================
// SEED DATA
// ============================================================================

const INITIAL_VENDORS: VendorRecord[] = [
  {
    id: 'v-veron',
    name: 'ATELIER VÉRON',
    ownerName: 'Camille Véron',
    email: 'atelier@veron-paris.com',
    city: 'Mumbai / Paris',
    gstin: '27AABCV4829L1Z5',
    pan: 'AABCV4829L',
    gstVerified: true,
    panVerified: true,
    documents: ['GST_Certificate.pdf', 'PAN_Card.pdf', 'Cancelled_Cheque.pdf'],
    status: 'Active',
    commissionOverride: 12,
    joinedDate: '2026-03-14',
    gmv: 1420000,
  },
  {
    id: 'v-severin',
    name: 'SÉVÉRIN LEATHER',
    ownerName: 'Marco Sévérin',
    email: 'concierge@severin-firenze.it',
    city: 'Mumbai / Florence',
    gstin: '27AADCS9102M1Z2',
    pan: 'AADCS9102M',
    gstVerified: true,
    panVerified: true,
    documents: ['GST_Certificate.pdf', 'PAN_Card.pdf'],
    status: 'Active',
    commissionOverride: 14,
    joinedDate: '2026-05-02',
    gmv: 890000,
  },
  {
    id: 'v-koto',
    name: 'STUDIO KOTO',
    ownerName: 'Kenji Takahashi',
    email: 'studio@koto-knit.jp',
    city: 'Bengaluru / Tokyo',
    gstin: '29AAKCS7741P1Z8',
    pan: 'AAKCS7741P',
    gstVerified: false,
    panVerified: false,
    documents: ['GST_Registration.pdf', 'PAN_Verification.pdf', 'Lookbook_AW26.pdf'],
    status: 'Pending',
    joinedDate: '2026-11-19',
    gmv: 0,
  },
  {
    id: 'v-milano',
    name: 'MILANO LAB',
    ownerName: 'Elena Conti',
    email: 'compliance@milanolab.it',
    city: 'New Delhi',
    gstin: '07AABCM5510R1Z1',
    pan: 'AABCM5510R',
    gstVerified: true,
    panVerified: false,
    documents: ['GST_Certificate.pdf'],
    status: 'Pending',
    joinedDate: '2026-11-20',
    gmv: 0,
  },
];

const INITIAL_PRODUCTS: AdminProduct[] = [
  {
    id: 'ap1',
    sku: 'VER-COAT-001',
    title: 'Double-Breasted Cashmere Overcoat',
    vendorId: 'v-veron',
    vendorName: 'ATELIER VÉRON',
    category: 'Women',
    price: 78500,
    description: 'Double-faced Mongolian cashmere overcoat with horn buttons.',
    approvalStatus: 'Approved',
    visible: true,
  },
  {
    id: 'ap2',
    sku: 'SEV-BAG-011',
    title: 'Structured Calfskin Crossbody Bag',
    vendorId: 'v-severin',
    vendorName: 'SÉVÉRIN LEATHER',
    category: 'Accessories',
    price: 48000,
    description: 'Florentine box calfskin with brushed brass clasp.',
    approvalStatus: 'Approved',
    visible: true,
  },
  {
    id: 'ap3',
    sku: 'KOT-KNIT-021',
    title: 'Hand-Loomed Cashmere Fisherman Knit',
    vendorId: 'v-koto',
    vendorName: 'STUDIO KOTO',
    category: 'Women',
    price: 38500,
    description: '5-gauge organic Scottish cashmere with dropped shoulders.',
    approvalStatus: 'Pending',
    visible: false,
  },
  {
    id: 'ap4',
    sku: 'MIL-TRN-034',
    title: 'Bonded Technical Gabardine Mac',
    vendorId: 'v-milano',
    vendorName: 'MILANO LAB',
    category: 'Men',
    price: 62000,
    description: 'Seam-sealed Italian cotton gabardine storm coat.',
    approvalStatus: 'Pending',
    visible: false,
  },
];

const INITIAL_ORDERS: AdminOrder[] = [
  {
    id: 'ao1',
    orderNumber: 'MM-AW26-84920',
    customerName: 'Ananya Kapoor',
    vendorId: 'v-veron',
    vendorName: 'ATELIER VÉRON',
    date: '2026-11-21',
    amount: 78500,
    status: 'Pending',
    paymentMethod: 'Card •••• 4242',
  },
  {
    id: 'ao2',
    orderNumber: 'MM-AW26-84905',
    customerName: 'Nisha Thomas',
    vendorId: 'v-severin',
    vendorName: 'SÉVÉRIN LEATHER',
    date: '2026-11-21',
    amount: 48000,
    status: 'Processing',
    paymentMethod: 'UPI Instant',
  },
  {
    id: 'ao3',
    orderNumber: 'MM-AW26-84810',
    customerName: 'Meera Varma',
    vendorId: 'v-veron',
    vendorName: 'ATELIER VÉRON',
    date: '2026-11-18',
    amount: 42000,
    status: 'Delivered',
    paymentMethod: 'Card •••• 9104',
  },
  {
    id: 'ao4',
    orderNumber: 'MM-AW26-84702',
    customerName: 'Rohan Malhotra',
    vendorId: 'v-veron',
    vendorName: 'ATELIER VÉRON',
    date: '2026-11-12',
    amount: 28500,
    status: 'Return Requested',
    paymentMethod: 'UPI Instant',
  },
];

const INITIAL_PAYOUTS: PayoutRequest[] = [
  {
    id: 'pr1',
    vendorId: 'v-veron',
    vendorName: 'ATELIER VÉRON',
    amount: 120000,
    bank: 'HDFC •••• 8841',
    date: '2026-11-21',
    status: 'Pending',
  },
  {
    id: 'pr2',
    vendorId: 'v-severin',
    vendorName: 'SÉVÉRIN LEATHER',
    amount: 64000,
    bank: 'ICICI •••• 3109',
    date: '2026-11-20',
    status: 'Pending',
  },
  {
    id: 'pr3',
    vendorId: 'v-veron',
    vendorName: 'ATELIER VÉRON',
    amount: 145000,
    bank: 'HDFC •••• 8841',
    date: '2026-11-01',
    status: 'Approved',
  },
];

const MONTHLY_REVENUE = [
  { month: 'Jun', gmv: 620000, revenue: 74400 },
  { month: 'Jul', gmv: 780000, revenue: 93600 },
  { month: 'Aug', gmv: 840000, revenue: 100800 },
  { month: 'Sep', gmv: 1120000, revenue: 134400 },
  { month: 'Oct', gmv: 1450000, revenue: 174000 },
  { month: 'Nov', gmv: 1890000, revenue: 226800 },
];

const ORDER_STATUS_CHART = [
  { status: 'Pending', count: 14 },
  { status: 'Processing', count: 22 },
  { status: 'Shipped', count: 31 },
  { status: 'Delivered', count: 84 },
  { status: 'Returns', count: 6 },
];

const formatINR = (n: number) => '₹' + n.toLocaleString('en-IN');

// ============================================================================
// MAIN ADMIN DASHBOARD
// ============================================================================

export default function App() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [adminRole, setAdminRole] = useState<'Super Admin' | 'Compliance Moderator'>('Super Admin');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Core Marketplace State
  const [vendors, setVendors] = useState<VendorRecord[]>(INITIAL_VENDORS);
  const [products, setProducts] = useState<AdminProduct[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<AdminOrder[]>(INITIAL_ORDERS);
  const [payouts, setPayouts] = useState<PayoutRequest[]>(INITIAL_PAYOUTS);
  const [globalCommission, setGlobalCommission] = useState<number>(12);

  // Catalog & Marketing State
  const [categories, setCategories] = useState(['Women', 'Men', 'Accessories', 'Outerwear', 'Footwear']);
  const [newCategory, setNewCategory] = useState('');
  const [coupons, setCoupons] = useState<CouponItem[]>([
    { id: 'c1', code: 'WELCOME15', discountPct: 15, active: true, uses: 142 },
    { id: 'c2', code: 'ARCHIVE20', discountPct: 20, active: false, uses: 38 },
  ]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponPct, setNewCouponPct] = useState('10');
  const [banners, setBanners] = useState([
    { id: 'b1', title: 'AW26 Architectural Silence Hero', placement: 'Homepage Hero', active: true },
    { id: 'b2', title: '20% Off Silk & Knitwear Split Banner', placement: 'Mid-Page Campaign', active: true },
  ]);
  const [reviews, setReviews] = useState([
    { id: 'rev1', product: 'Cashmere Overcoat', author: 'Ananya K.', rating: 5, text: 'Extraordinary drape.', status: 'Approved' },
    { id: 'rev2', product: 'Calfskin Bag', author: 'Nisha T.', rating: 5, text: 'Heirloom hardware.', status: 'Pending' },
  ]);

  // Modals & Filters
  const [inspectVendor, setInspectVendor] = useState<VendorRecord | null>(null);
  const [rejectModal, setRejectModal] = useState<{ type: 'vendor' | 'product'; id: string; mode: 'reject' | 'docs' } | null>(null);
  const [reasonText, setReasonText] = useState('');
  const [orderFilter, setOrderFilter] = useState<string>('All');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<{ id: number; text: string }[]>([]);
  const showToast = (text: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
  };

  // ============================================================================
  // COMPUTED METRICS
  // ============================================================================
  const pendingVendors = vendors.filter((v) => v.status === 'Pending' || v.status === 'Docs Requested');
  const activeVendorsCount = vendors.filter((v) => v.status === 'Active').length;
  const pendingProducts = products.filter((p) => p.approvalStatus === 'Pending');

  const getVendorCommissionRate = (vendorId: string) => {
    const v = vendors.find((item) => item.id === vendorId);
    return v?.commissionOverride ?? globalCommission;
  };

  const totalGMV =
    vendors.reduce((s, v) => s + v.gmv, 0) +
    orders.filter((o) => o.status !== 'Cancelled' && o.status !== 'Refunded').reduce((s, o) => s + o.amount, 0);

  const totalPlatformRevenue = Math.round(
    orders
      .filter((o) => o.status !== 'Cancelled' && o.status !== 'Refunded')
      .reduce((s, o) => s + (o.amount * getVendorCommissionRate(o.vendorId)) / 100, 0) +
      231000
  );

  // ============================================================================
  // ADMIN ACTIONS
  // ============================================================================
  const verifyVendorDoc = (vendorId: string, field: 'gstVerified' | 'panVerified') => {
    setVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, [field]: !v[field] } : v))
    );
    if (inspectVendor && inspectVendor.id === vendorId) {
      setInspectVendor({ ...inspectVendor, [field]: !inspectVendor[field] });
    }
    showToast('Verification status updated');
  };

  const updateVendorStatus = (vendorId: string, status: VendorStatus, reason?: string) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, status, rejectionReason: reason } : v))
    );
    if (inspectVendor && inspectVendor.id === vendorId) {
      setInspectVendor({ ...inspectVendor, status, rejectionReason: reason });
    }
    showToast(`Vendor status updated to ${status}`);
  };

  const updateProductApproval = (prodId: string, status: ProductApprovalStatus, reason?: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === prodId
          ? { ...p, approvalStatus: status, visible: status === 'Approved', rejectionReason: reason }
          : p
      )
    );
    showToast(`Product ${status.toLowerCase()}`);
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModal || !reasonText.trim()) return;
    if (rejectModal.type === 'vendor') {
      updateVendorStatus(
        rejectModal.id,
        rejectModal.mode === 'docs' ? 'Docs Requested' : 'Rejected',
        reasonText.trim()
      );
    } else {
      updateProductApproval(rejectModal.id, 'Rejected', reasonText.trim());
    }
    setRejectModal(null);
    setReasonText('');
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status });
    }
    showToast(`Order marked ${status}`);
  };

  const handlePayoutAction = (payoutId: string, status: 'Approved' | 'Rejected') => {
    if (adminRole !== 'Super Admin') {
      showToast('Permission denied: Super Admin required for payout approval');
      return;
    }
    setPayouts((prev) => prev.map((p) => (p.id === payoutId ? { ...p, status } : p)));
    showToast(`Payout ${status.toLowerCase()}`);
  };

  const downloadReportCSV = (reportName: string) => {
    const headers = ['Order Number', 'Vendor', 'Customer', 'Amount (INR)', 'Commission (%)', 'Status'];
    const rows = orders.map((o) => [
      o.orderNumber,
      o.vendorName,
      o.customerName,
      o.amount,
      getVendorCommissionRate(o.vendorId),
      o.status,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`${reportName}.csv downloaded`);
  };

  // ============================================================================
  // 20 SIDEBAR ITEMS
  // ============================================================================
  const SIDEBAR_GROUPS: {
    label: string;
    items: { id: AdminTab; title: string; icon: React.ReactNode; badge?: number }[];
  }[] = [
    {
      label: 'Core',
      items: [
        { id: 'dashboard', title: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'vendor-applications', title: 'Vendor Applications', icon: <FileCheck2 className="w-4 h-4" />, badge: pendingVendors.length || undefined },
        { id: 'all-vendors', title: 'All Vendors', icon: <Store className="w-4 h-4" /> },
        { id: 'customers', title: 'Customers', icon: <Users className="w-4 h-4" /> },
      ],
    },
    {
      label: 'Catalog',
      items: [
        { id: 'products', title: 'Products', icon: <Package className="w-4 h-4" /> },
        { id: 'product-approvals', title: 'Product Approvals', icon: <CheckSquare className="w-4 h-4" />, badge: pendingProducts.length || undefined },
        { id: 'categories', title: 'Categories', icon: <FolderTree className="w-4 h-4" /> },
        { id: 'brands', title: 'Brands', icon: <Award className="w-4 h-4" /> },
      ],
    },
    {
      label: 'Orders & Finance',
      items: [
        { id: 'orders', title: 'Orders', icon: <ShoppingCart className="w-4 h-4" /> },
        { id: 'payments', title: 'Payments', icon: <CreditCard className="w-4 h-4" /> },
        { id: 'refunds', title: 'Refunds', icon: <RotateCcw className="w-4 h-4" /> },
        { id: 'commission-settings', title: 'Commission Settings', icon: <Percent className="w-4 h-4" /> },
        { id: 'vendor-payouts', title: 'Vendor Payouts', icon: <Wallet className="w-4 h-4" />, badge: payouts.filter((p) => p.status === 'Pending').length || undefined },
      ],
    },
    {
      label: 'Growth & Content',
      items: [
        { id: 'coupons', title: 'Coupons', icon: <Ticket className="w-4 h-4" /> },
        { id: 'promotions', title: 'Promotions', icon: <Megaphone className="w-4 h-4" /> },
        { id: 'banners', title: 'Homepage Banners', icon: <ImageIcon className="w-4 h-4" /> },
        { id: 'reviews', title: 'Reviews', icon: <Star className="w-4 h-4" /> },
      ],
    },
    {
      label: 'System',
      items: [
        { id: 'reports', title: 'Reports', icon: <FileSpreadsheet className="w-4 h-4" /> },
        { id: 'notifications', title: 'Notifications', icon: <Bell className="w-4 h-4" /> },
        { id: 'website-settings', title: 'Website Settings', icon: <Settings className="w-4 h-4" /> },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F6F2] text-[#171717] flex font-sans antialiased">
      {/* ==================================================================== */}
      {/* DESKTOP SIDEBAR (20 ITEMS)                                           */}
      {/* ==================================================================== */}
      <aside className="hidden lg:flex w-64 bg-[#171717] text-[#FFFFFF] flex-col shrink-0">
        <div className="h-16 px-6 border-b border-[#2E2E2E] flex items-center justify-between">
          <div>
            <p className="font-serif text-lg tracking-[0.14em] uppercase">BANDRA STREET</p>
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#B89B72]">Enterprise Admin</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-5">
          {SIDEBAR_GROUPS.map((g) => (
            <div key={g.label}>
              <p className="px-3 text-[10px] uppercase tracking-[0.14em] text-[#777777] mb-1.5">
                {g.label}
              </p>
              <div className="space-y-0.5">
                {g.items.map((item) => {
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-[12px] transition-colors ${
                        active
                          ? 'bg-[#B89B72] text-[#FFFFFF] font-medium'
                          : 'text-[#EAEAEA] hover:bg-[#262626]'
                      }`}
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        {item.icon}
                        <span className="truncate">{item.title}</span>
                      </span>
                      {item.badge !== undefined && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-[#FFFFFF] text-[#171717] font-semibold">
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
      {/* MAIN CONTENT AREA                                                    */}
      {/* ==================================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-[#FFFFFF] border-b border-[#EAEAEA] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 border border-[#EAEAEA]"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-[13px] uppercase tracking-[0.14em] font-semibold">
                {SIDEBAR_GROUPS.flatMap((g) => g.items).find((i) => i.id === activeTab)?.title}
              </h1>
              <p className="text-[11px] text-[#777777] hidden sm:block">
                Global Marketplace Governance · Supabase Admin RBAC
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                setAdminRole(adminRole === 'Super Admin' ? 'Compliance Moderator' : 'Super Admin')
              }
              className="px-3 py-1.5 border border-[#EAEAEA] bg-[#F8F6F2] text-[10px] uppercase tracking-[0.12em] flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#B89B72]" />
              {adminRole}
            </button>
            <button
              onClick={() => downloadReportCSV('marketplace_executive_report')}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-[#171717] text-[#FFFFFF] text-[11px] uppercase tracking-[0.12em]"
            >
              <Download className="w-3.5 h-3.5" /> Export Report
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-[1480px] w-full mx-auto space-y-8">
          {/* ---------------------------------------------------------------- */}
          {/* 1. DASHBOARD                                                     */}
          {/* ---------------------------------------------------------------- */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
                {[
                  { label: 'Total GMV', value: formatINR(totalGMV) },
                  { label: 'Platform Revenue', value: formatINR(totalPlatformRevenue) },
                  { label: 'Total Orders', value: String(orders.length + 153) },
                  { label: 'Total Customers', value: '1,284' },
                  { label: 'Active Vendors', value: String(activeVendorsCount) },
                  { label: 'Pending Vendors', value: String(pendingVendors.length) },
                  { label: 'Product Queue', value: String(pendingProducts.length) },
                ].map((kpi) => (
                  <div key={kpi.label} className="bg-[#FFFFFF] border border-[#EAEAEA] p-4 space-y-1.5">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-[#777777]">{kpi.label}</p>
                    <p className="text-xl font-semibold tracking-tight">{kpi.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#EAEAEA] p-6">
                  <h2 className="text-[12px] uppercase tracking-[0.12em] font-semibold mb-4">
                    Monthly Platform Revenue &amp; GMV
                  </h2>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={MONTHLY_REVENUE}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#EAEAEA" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#777777' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#777777' }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="gmv" stroke="#171717" fill="#171717" fillOpacity={0.08} />
                        <Area type="monotone" dataKey="revenue" stroke="#B89B72" fill="#B89B72" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#EAEAEA] p-6">
                  <h2 className="text-[12px] uppercase tracking-[0.12em] font-semibold mb-4">
                    Order Status Distribution
                  </h2>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ORDER_STATUS_CHART}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#EAEAEA" />
                        <XAxis dataKey="status" tick={{ fontSize: 11, fill: '#777777' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#777777' }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#171717" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-[#FFFFFF] border border-[#EAEAEA] p-6">
                <h2 className="text-[12px] uppercase tracking-[0.12em] font-semibold mb-4">
                  Recent Marketplace Transactions
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[12px]">
                    <thead>
                      <tr className="border-b border-[#EAEAEA] text-[10px] uppercase tracking-[0.12em] text-[#777777]">
                        <th className="py-2.5">Order #</th>
                        <th className="py-2.5">Vendor</th>
                        <th className="py-2.5">Customer</th>
                        <th className="py-2.5">Gross</th>
                        <th className="py-2.5">Platform Fee</th>
                        <th className="py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAEAEA]">
                      {orders.map((o) => {
                        const rate = getVendorCommissionRate(o.vendorId);
                        return (
                          <tr key={o.id} className="hover:bg-[#F8F6F2]">
                            <td className="py-3 font-medium">{o.orderNumber}</td>
                            <td className="py-3">{o.vendorName}</td>
                            <td className="py-3">{o.customerName}</td>
                            <td className="py-3">{formatINR(o.amount)}</td>
                            <td className="py-3 text-[#B89B72] font-medium">
                              {formatINR(Math.round((o.amount * rate) / 100))} ({rate}%)
                            </td>
                            <td className="py-3">{o.status}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* 2. VENDOR APPLICATIONS (APPROVAL INTERFACE)                      */}
          {/* ---------------------------------------------------------------- */}
          {activeTab === 'vendor-applications' && (
            <div className="space-y-6">
              {pendingVendors.length === 0 ? (
                <div className="bg-[#FFFFFF] border border-[#EAEAEA] p-12 text-center text-[13px] text-[#777777]">
                  All vendor applications have been reviewed.
                </div>
              ) : (
                pendingVendors.map((v) => (
                  <div key={v.id} className="bg-[#FFFFFF] border border-[#EAEAEA] p-6 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAEAEA] pb-4">
                      <div>
                        <span className="px-2 py-0.5 bg-[#F8F6F2] border border-[#EAEAEA] text-[10px] uppercase tracking-[0.12em] text-[#B89B72]">
                          {v.status}
                        </span>
                        <h2 className="font-serif text-2xl font-light mt-1">{v.name}</h2>
                        <p className="text-[12px] text-[#777777]">
                          Owner: {v.ownerName} · {v.email} · {v.city}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => updateVendorStatus(v.id, 'Active')}
                          className="px-4 py-2 bg-[#171717] text-[#FFFFFF] hover:bg-[#B89B72] text-[11px] uppercase tracking-[0.12em]"
                        >
                          Approve Vendor
                        </button>
                        <button
                          onClick={() => setRejectModal({ type: 'vendor', id: v.id, mode: 'docs' })}
                          className="px-4 py-2 border border-[#EAEAEA] hover:border-[#171717] text-[11px] uppercase tracking-[0.12em]"
                        >
                          Request Docs
                        </button>
                        <button
                          onClick={() => setRejectModal({ type: 'vendor', id: v.id, mode: 'reject' })}
                          className="px-4 py-2 border border-[#EAEAEA] text-[#777777] hover:text-[#171717] text-[11px] uppercase tracking-[0.12em]"
                        >
                          Reject
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[12px]">
                      <div className="p-4 bg-[#F8F6F2] border border-[#EAEAEA] flex items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.12em] text-[#777777]">GSTIN</p>
                          <p className="font-mono font-medium mt-0.5">{v.gstin}</p>
                        </div>
                        <button
                          onClick={() => verifyVendorDoc(v.id, 'gstVerified')}
                          className={`px-2.5 py-1 text-[10px] uppercase border ${
                            v.gstVerified
                              ? 'bg-[#171717] text-[#FFFFFF] border-[#171717]'
                              : 'bg-[#FFFFFF] border-[#EAEAEA]'
                          }`}
                        >
                          {v.gstVerified ? 'Verified' : 'Verify GST'}
                        </button>
                      </div>

                      <div className="p-4 bg-[#F8F6F2] border border-[#EAEAEA] flex items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.12em] text-[#777777]">PAN Number</p>
                          <p className="font-mono font-medium mt-0.5">{v.pan}</p>
                        </div>
                        <button
                          onClick={() => verifyVendorDoc(v.id, 'panVerified')}
                          className={`px-2.5 py-1 text-[10px] uppercase border ${
                            v.panVerified
                              ? 'bg-[#171717] text-[#FFFFFF] border-[#171717]'
                              : 'bg-[#FFFFFF] border-[#EAEAEA]'
                          }`}
                        >
                          {v.panVerified ? 'Verified' : 'Verify PAN'}
                        </button>
                      </div>

                      <div className="p-4 bg-[#F8F6F2] border border-[#EAEAEA]">
                        <p className="text-[10px] uppercase tracking-[0.12em] text-[#777777] mb-1">
                          Submitted Documents
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {v.documents.map((doc) => (
                            <span
                              key={doc}
                              onClick={() => showToast(`Opened ${doc}`)}
                              className="px-2 py-0.5 bg-[#FFFFFF] border border-[#EAEAEA] text-[10px] cursor-pointer hover:border-[#171717] inline-flex items-center gap-1"
                            >
                              <FileText className="w-3 h-3 text-[#B89B72]" /> {doc}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* 3. ALL VENDORS (SUSPEND / REACTIVATE)                            */}
          {/* ---------------------------------------------------------------- */}
          {activeTab === 'all-vendors' && (
            <div className="bg-[#FFFFFF] border border-[#EAEAEA] p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12px]">
                  <thead>
                    <tr className="border-b border-[#EAEAEA] text-[10px] uppercase tracking-[0.12em] text-[#777777]">
                      <th className="py-3">Vendor</th>
                      <th className="py-3">GST / PAN</th>
                      <th className="py-3">GMV</th>
                      <th className="py-3">Status</th>
                      <th className="py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAEAEA]">
                    {vendors.map((v) => (
                      <tr key={v.id} className="hover:bg-[#F8F6F2]">
                        <td className="py-3.5">
                          <p className="font-medium">{v.name}</p>
                          <p className="text-[11px] text-[#777777]">{v.ownerName} · {v.city}</p>
                        </td>
                        <td className="py-3.5 font-mono text-[11px]">
                          {v.gstin} ({v.gstVerified ? '✓' : 'Pending'})
                        </td>
                        <td className="py-3.5 font-medium">{formatINR(v.gmv)}</td>
                        <td className="py-3.5">
                          <span className="px-2 py-0.5 border border-[#EAEAEA] bg-[#F8F6F2] text-[10px] uppercase">
                            {v.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right space-x-2">
                          <button
                            onClick={() => setInspectVendor(v)}
                            className="px-3 py-1 border border-[#EAEAEA] text-[10px] uppercase"
                          >
                            Inspect
                          </button>
                          {v.status === 'Active' ? (
                            <button
                              onClick={() => updateVendorStatus(v.id, 'Suspended')}
                              className="px-3 py-1 border border-[#EAEAEA] text-[#777777] hover:text-[#171717] text-[10px] uppercase"
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => updateVendorStatus(v.id, 'Active')}
                              className="px-3 py-1 bg-[#171717] text-[#FFFFFF] text-[10px] uppercase"
                            >
                              Reactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* 5 & 6. PRODUCT APPROVALS & ALL PRODUCTS                          */}
          {/* ---------------------------------------------------------------- */}
          {(activeTab === 'product-approvals' || activeTab === 'products') && (
            <div className="bg-[#FFFFFF] border border-[#EAEAEA] p-6 space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12px]">
                  <thead>
                    <tr className="border-b border-[#EAEAEA] text-[10px] uppercase tracking-[0.12em] text-[#777777]">
                      <th className="py-3">Product</th>
                      <th className="py-3">Vendor</th>
                      <th className="py-3">Price</th>
                      <th className="py-3">Approval</th>
                      <th className="py-3">Visibility</th>
                      <th className="py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAEAEA]">
                    {products
                      .filter((p) => (activeTab === 'product-approvals' ? p.approvalStatus === 'Pending' : true))
                      .map((p) => (
                        <tr key={p.id} className="hover:bg-[#F8F6F2]">
                          <td className="py-3.5">
                            <p className="font-medium">{p.title}</p>
                            <p className="text-[11px] text-[#777777]">{p.sku} · {p.description}</p>
                          </td>
                          <td className="py-3.5">{p.vendorName}</td>
                          <td className="py-3.5 font-medium">{formatINR(p.price)}</td>
                          <td className="py-3.5">
                            <span className="px-2 py-0.5 border border-[#EAEAEA] bg-[#F8F6F2] text-[10px] uppercase">
                              {p.approvalStatus}
                            </span>
                          </td>
                          <td className="py-3.5">
                            <button
                              onClick={() =>
                                setProducts((prev) =>
                                  prev.map((item) =>
                                    item.id === p.id ? { ...item, visible: !item.visible } : item
                                  )
                                )
                              }
                              className="inline-flex items-center gap-1 text-[11px] uppercase"
                            >
                              {p.visible ? (
                                <><Eye className="w-3.5 h-3.5 text-[#B89B72]" /> Visible</>
                              ) : (
                                <><EyeOff className="w-3.5 h-3.5 text-[#777777]" /> Hidden</>
                              )}
                            </button>
                          </td>
                          <td className="py-3.5 text-right space-x-2">
                            {p.approvalStatus !== 'Approved' && (
                              <button
                                onClick={() => updateProductApproval(p.id, 'Approved')}
                                className="px-3 py-1 bg-[#171717] text-[#FFFFFF] text-[10px] uppercase"
                              >
                                Approve
                              </button>
                            )}
                            {p.approvalStatus !== 'Rejected' && (
                              <button
                                onClick={() => setRejectModal({ type: 'product', id: p.id, mode: 'reject' })}
                                className="px-3 py-1 border border-[#EAEAEA] text-[10px] uppercase"
                              >
                                Reject
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* 12. COMMISSION SETTINGS                                          */}
          {/* ---------------------------------------------------------------- */}
          {activeTab === 'commission-settings' && (
            <div className="space-y-6">
              <div className="bg-[#FFFFFF] border border-[#EAEAEA] p-6 max-w-xl space-y-4">
                <h2 className="text-[12px] uppercase tracking-[0.12em] font-semibold">
                  Global Marketplace Commission
                </h2>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={globalCommission}
                    onChange={(e) => setGlobalCommission(Number(e.target.value))}
                    className="w-28 px-3 py-2.5 border border-[#EAEAEA] text-[14px] font-semibold"
                  />
                  <span className="text-[13px] text-[#777777]">% default platform fee</span>
                  <button
                    onClick={() => showToast(`Global commission set to ${globalCommission}%`)}
                    className="px-5 py-2.5 bg-[#171717] text-[#FFFFFF] text-[11px] uppercase tracking-[0.12em]"
                  >
                    Save
                  </button>
                </div>
              </div>

              <div className="bg-[#FFFFFF] border border-[#EAEAEA] p-6">
                <h2 className="text-[12px] uppercase tracking-[0.12em] font-semibold mb-4">
                  Vendor-Specific Commission Overrides
                </h2>
                <table className="w-full text-left text-[12px]">
                  <thead>
                    <tr className="border-b border-[#EAEAEA] text-[10px] uppercase tracking-[0.12em] text-[#777777]">
                      <th className="py-3">Vendor</th>
                      <th className="py-3">Commission (%)</th>
                      <th className="py-3">Estimated Platform Earnings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAEAEA]">
                    {vendors.map((v) => {
                      const rate = v.commissionOverride ?? globalCommission;
                      return (
                        <tr key={v.id}>
                          <td className="py-3 font-medium">{v.name}</td>
                          <td className="py-3">
                            <input
                              type="number"
                              min={1}
                              max={40}
                              value={rate}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setVendors((prev) =>
                                  prev.map((item) =>
                                    item.id === v.id ? { ...item, commissionOverride: val } : item
                                  )
                                );
                              }}
                              className="w-20 px-2.5 py-1.5 border border-[#EAEAEA] text-[12px]"
                            />
                          </td>
                          <td className="py-3 font-medium text-[#B89B72]">
                            {formatINR(Math.round((v.gmv * rate) / 100))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* 9. ORDERS / 10. PAYMENTS / 11. REFUNDS                           */}
          {/* ---------------------------------------------------------------- */}
          {(activeTab === 'orders' || activeTab === 'payments' || activeTab === 'refunds') && (
            <div className="bg-[#FFFFFF] border border-[#EAEAEA] p-6 space-y-5">
              {activeTab === 'orders' && (
                <div className="flex flex-wrap gap-2">
                  {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Return Requested', 'Cancelled', 'Refunded'].map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => setOrderFilter(st)}
                        className={`px-3 py-1.5 border text-[10px] uppercase tracking-[0.1em] ${
                          orderFilter === st
                            ? 'bg-[#171717] text-[#FFFFFF] border-[#171717]'
                            : 'border-[#EAEAEA]'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12px]">
                  <thead>
                    <tr className="border-b border-[#EAEAEA] text-[10px] uppercase tracking-[0.12em] text-[#777777]">
                      <th className="py-3">Order #</th>
                      <th className="py-3">Vendor</th>
                      <th className="py-3">Customer</th>
                      <th className="py-3">Payment</th>
                      <th className="py-3">Amount</th>
                      <th className="py-3">Status</th>
                      <th className="py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAEAEA]">
                    {orders
                      .filter((o) => {
                        if (activeTab === 'refunds') {
                          return o.status === 'Return Requested' || o.status === 'Refunded' || o.status === 'Cancelled';
                        }
                        return orderFilter === 'All' || o.status === orderFilter;
                      })
                      .map((o) => (
                        <tr key={o.id} className="hover:bg-[#F8F6F2]">
                          <td className="py-3.5 font-medium">{o.orderNumber}</td>
                          <td className="py-3.5">{o.vendorName}</td>
                          <td className="py-3.5">{o.customerName}</td>
                          <td className="py-3.5 text-[#777777]">{o.paymentMethod}</td>
                          <td className="py-3.5 font-medium">{formatINR(o.amount)}</td>
                          <td className="py-3.5">{o.status}</td>
                          <td className="py-3.5 text-right space-x-2">
                            <button
                              onClick={() => setSelectedOrder(o)}
                              className="px-3 py-1 border border-[#EAEAEA] text-[10px] uppercase"
                            >
                              Manage
                            </button>
                            {o.status === 'Return Requested' && (
                              <button
                                onClick={() => updateOrderStatus(o.id, 'Refunded')}
                                className="px-3 py-1 bg-[#171717] text-[#FFFFFF] text-[10px] uppercase"
                              >
                                Refund
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* 13. VENDOR PAYOUTS                                               */}
          {/* ---------------------------------------------------------------- */}
          {activeTab === 'vendor-payouts' && (
            <div className="bg-[#FFFFFF] border border-[#EAEAEA] p-6 space-y-5">
              <div className="flex justify-between items-center">
                <h2 className="text-[12px] uppercase tracking-[0.12em] font-semibold">
                  Vendor Payout Requests
                </h2>
                <button
                  onClick={() => downloadReportCSV('vendor_payout_report')}
                  className="px-4 py-2 border border-[#EAEAEA] text-[11px] uppercase tracking-[0.1em] inline-flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Payout Report
                </button>
              </div>
              <table className="w-full text-left text-[12px]">
                <thead>
                  <tr className="border-b border-[#EAEAEA] text-[10px] uppercase tracking-[0.12em] text-[#777777]">
                    <th className="py-3">Vendor</th>
                    <th className="py-3">Bank</th>
                    <th className="py-3">Date</th>
                    <th className="py-3">Amount</th>
                    <th className="py-3">Status</th>
                    <th className="py-3 text-right">Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAEAEA]">
                  {payouts.map((p) => (
                    <tr key={p.id}>
                      <td className="py-3.5 font-medium">{p.vendorName}</td>
                      <td className="py-3.5 text-[#777777]">{p.bank}</td>
                      <td className="py-3.5">{p.date}</td>
                      <td className="py-3.5 font-semibold">{formatINR(p.amount)}</td>
                      <td className="py-3.5">{p.status}</td>
                      <td className="py-3.5 text-right space-x-2">
                        {p.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handlePayoutAction(p.id, 'Approved')}
                              className="px-3 py-1 bg-[#171717] text-[#FFFFFF] text-[10px] uppercase"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handlePayoutAction(p.id, 'Rejected')}
                              className="px-3 py-1 border border-[#EAEAEA] text-[10px] uppercase"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* REMAINING ADMIN SECTIONS (Customers, Categories, Brands, etc.)    */}
          {/* ---------------------------------------------------------------- */}
          {activeTab === 'customers' && (
            <div className="bg-[#FFFFFF] border border-[#EAEAEA] p-6">
              <h2 className="text-[12px] uppercase tracking-[0.12em] font-semibold mb-4">
                Marketplace Customers
              </h2>
              <table className="w-full text-left text-[12px]">
                <thead>
                  <tr className="border-b border-[#EAEAEA] text-[10px] uppercase tracking-[0.12em] text-[#777777]">
                    <th className="py-3">Customer</th>
                    <th className="py-3">Last Order</th>
                    <th className="py-3">Total Spend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAEAEA]">
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td className="py-3 font-medium">{o.customerName}</td>
                      <td className="py-3 text-[#777777]">{o.date}</td>
                      <td className="py-3">{formatINR(o.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {(activeTab === 'categories' || activeTab === 'brands') && (
            <div className="bg-[#FFFFFF] border border-[#EAEAEA] p-6 max-w-2xl space-y-4">
              <h2 className="text-[12px] uppercase tracking-[0.12em] font-semibold">
                {activeTab === 'categories' ? 'Manage Categories' : 'Registered Designer Brands'}
              </h2>
              {activeTab === 'categories' ? (
                <>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="New category name..."
                      className="flex-1 px-3 py-2 border border-[#EAEAEA] text-[12px]"
                    />
                    <button
                      onClick={() => {
                        if (!newCategory.trim()) return;
                        setCategories((prev) => [...prev, newCategory.trim()]);
                        setNewCategory('');
                        showToast('Category added');
                      }}
                      className="px-4 py-2 bg-[#171717] text-[#FFFFFF] text-[11px] uppercase"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((c) => (
                      <span key={c} className="px-3 py-1.5 border border-[#EAEAEA] bg-[#F8F6F2] text-[11px]">
                        {c}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  {vendors.map((v) => (
                    <div key={v.id} className="p-3 border border-[#EAEAEA] flex justify-between text-[12px]">
                      <span className="font-medium">{v.name}</span>
                      <span className="text-[#777777]">{v.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {(activeTab === 'coupons' || activeTab === 'promotions') && (
            <div className="bg-[#FFFFFF] border border-[#EAEAEA] p-6 max-w-2xl space-y-5">
              <h2 className="text-[12px] uppercase tracking-[0.12em] font-semibold">
                Marketplace Coupons &amp; Promotions
              </h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  placeholder="COUPON CODE"
                  className="flex-1 px-3 py-2 border border-[#EAEAEA] text-[12px]"
                />
                <input
                  type="number"
                  value={newCouponPct}
                  onChange={(e) => setNewCouponPct(e.target.value)}
                  className="w-20 px-3 py-2 border border-[#EAEAEA] text-[12px]"
                />
                <button
                  onClick={() => {
                    if (!newCouponCode.trim()) return;
                    setCoupons((prev) => [
                      ...prev,
                      { id: 'c-' + Date.now(), code: newCouponCode, discountPct: Number(newCouponPct), active: true, uses: 0 },
                    ]);
                    setNewCouponCode('');
                    showToast('Coupon created');
                  }}
                  className="px-4 py-2 bg-[#171717] text-[#FFFFFF] text-[11px] uppercase"
                >
                  Create
                </button>
              </div>
              <div className="space-y-2">
                {coupons.map((c) => (
                  <div key={c.id} className="p-3.5 border border-[#EAEAEA] flex justify-between items-center text-[12px]">
                    <span>
                      <strong>{c.code}</strong> · {c.discountPct}% Off · {c.uses} uses
                    </span>
                    <button
                      onClick={() =>
                        setCoupons((prev) =>
                          prev.map((item) => (item.id === c.id ? { ...item, active: !item.active } : item))
                        )
                      }
                      className={`px-3 py-1 text-[10px] uppercase border ${
                        c.active ? 'bg-[#171717] text-[#FFFFFF]' : 'border-[#EAEAEA]'
                      }`}
                    >
                      {c.active ? 'Active' : 'Paused'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'banners' && (
            <div className="bg-[#FFFFFF] border border-[#EAEAEA] p-6 max-w-2xl space-y-3">
              <h2 className="text-[12px] uppercase tracking-[0.12em] font-semibold">Homepage Banners</h2>
              {banners.map((b) => (
                <div key={b.id} className="p-4 border border-[#EAEAEA] flex justify-between items-center text-[12px]">
                  <div>
                    <p className="font-medium">{b.title}</p>
                    <p className="text-[11px] text-[#777777]">{b.placement}</p>
                  </div>
                  <button
                    onClick={() =>
                      setBanners((prev) =>
                        prev.map((item) => (item.id === b.id ? { ...item, active: !item.active } : item))
                      )
                    }
                    className={`px-3 py-1 text-[10px] uppercase border ${
                      b.active ? 'bg-[#171717] text-[#FFFFFF]' : 'border-[#EAEAEA]'
                    }`}
                  >
                    {b.active ? 'Live' : 'Hidden'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="bg-[#FFFFFF] border border-[#EAEAEA] p-6 max-w-2xl space-y-3">
              <h2 className="text-[12px] uppercase tracking-[0.12em] font-semibold">Review Moderation</h2>
              {reviews.map((r) => (
                <div key={r.id} className="p-4 border border-[#EAEAEA] flex justify-between items-center text-[12px]">
                  <div>
                    <p className="font-medium">{r.product} — {r.author} ({r.rating}★)</p>
                    <p className="text-[#777777]">{r.text}</p>
                  </div>
                  <button
                    onClick={() =>
                      setReviews((prev) =>
                        prev.map((item) =>
                          item.id === r.id
                            ? { ...item, status: item.status === 'Approved' ? 'Hidden' : 'Approved' }
                            : item
                        )
                      )
                    }
                    className="px-3 py-1 border border-[#EAEAEA] text-[10px] uppercase"
                  >
                    {r.status}
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="bg-[#FFFFFF] border border-[#EAEAEA] p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { name: 'gmv_revenue_report', title: 'GMV & Platform Revenue' },
                { name: 'commission_ledger', title: 'Commission Transactions' },
                { name: 'vendor_payout_report', title: 'Vendor Payouts Ledger' },
              ].map((rep) => (
                <div key={rep.name} className="p-5 border border-[#EAEAEA] bg-[#F8F6F2] space-y-3">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.1em]">{rep.title}</p>
                  <button
                    onClick={() => downloadReportCSV(rep.name)}
                    className="px-4 py-2 bg-[#171717] text-[#FFFFFF] text-[10px] uppercase tracking-[0.12em] inline-flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Download CSV
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-[#FFFFFF] border border-[#EAEAEA] p-6 max-w-2xl space-y-3 text-[12px]">
              <h2 className="text-[12px] uppercase tracking-[0.12em] font-semibold">Admin Alerts</h2>
              <div className="p-3.5 bg-[#F8F6F2] border border-[#EAEAEA]">
                {pendingVendors.length} vendor applications awaiting GST/PAN verification.
              </div>
              <div className="p-3.5 bg-[#F8F6F2] border border-[#EAEAEA]">
                {pendingProducts.length} new products submitted for catalog review.
              </div>
            </div>
          )}

          {activeTab === 'website-settings' && (
            <div className="bg-[#FFFFFF] border border-[#EAEAEA] p-6 max-w-2xl space-y-4 text-[12px]">
              <h2 className="text-[12px] uppercase tracking-[0.12em] font-semibold">
                Website &amp; Supabase Admin Permissions
              </h2>
              <p className="text-[#777777]">
                Current Role: <strong className="text-[#171717]">{adminRole}</strong>. Admin-only
                Supabase RLS policies restrict vendor approvals, commission overrides, and payout
                settlements to authenticated <code className="text-[#171717]">role = 'admin'</code>{' '}
                sessions.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* ==================================================================== */}
      {/* MODALS: REJECT / REQUEST DOCS, ORDER DETAILS, VENDOR INSPECT         */}
      {/* ==================================================================== */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171717]/50">
          <form onSubmit={handleModalSubmit} className="bg-[#FFFFFF] border border-[#171717] max-w-md w-full p-6 space-y-4">
            <h3 className="text-[13px] font-semibold uppercase tracking-[0.12em]">
              {rejectModal.mode === 'docs' ? 'Request Additional Documents' : 'Provide Rejection Reason'}
            </h3>
            <textarea
              rows={3}
              required
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              placeholder="Enter clear reason or required document details..."
              className="w-full p-3 border border-[#EAEAEA] text-[12px]"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectModal(null)}
                className="px-4 py-2 border border-[#EAEAEA] text-[11px] uppercase"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-[#171717] text-[#FFFFFF] text-[11px] uppercase">
                Confirm
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#171717]/40">
          <div className="w-full max-w-md bg-[#FFFFFF] h-full border-l border-[#EAEAEA] p-6 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-[#EAEAEA]">
              <h3 className="font-semibold">{selectedOrder.orderNumber}</h3>
              <button onClick={() => setSelectedOrder(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-[12px] space-y-1">
              <p>Vendor: {selectedOrder.vendorName}</p>
              <p>Customer: {selectedOrder.customerName}</p>
              <p>Amount: {formatINR(selectedOrder.amount)}</p>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-[0.12em] text-[#777777]">
                Override Order Status
              </label>
              <select
                value={selectedOrder.status}
                onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value as OrderStatus)}
                className="w-full px-3 py-2 border border-[#EAEAEA] bg-[#FFFFFF] text-[12px]"
              >
                {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {inspectVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171717]/50">
          <div className="bg-[#FFFFFF] border border-[#171717] max-w-md w-full p-6 space-y-4 text-[12px]">
            <div className="flex justify-between items-center pb-2 border-b border-[#EAEAEA]">
              <h3 className="font-semibold uppercase tracking-[0.1em]">{inspectVendor.name}</h3>
              <button onClick={() => setInspectVendor(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <p>Owner: {inspectVendor.ownerName}</p>
            <p>GSTIN: {inspectVendor.gstin} ({inspectVendor.gstVerified ? 'Verified' : 'Unverified'})</p>
            <p>PAN: {inspectVendor.pan} ({inspectVendor.panVerified ? 'Verified' : 'Unverified'})</p>
            <p>Status: {inspectVendor.status}</p>
          </div>
        </div>
      )}

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-[#171717]/40" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative z-10 w-64 bg-[#171717] text-[#FFFFFF] h-full p-4 overflow-y-auto space-y-2">
            {SIDEBAR_GROUPS.flatMap((g) => g.items).map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-[12px] ${
                  activeTab === item.id ? 'bg-[#B89B72]' : ''
                }`}
              >
                {item.icon} {item.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="fixed bottom-5 right-5 z-50 space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="bg-[#171717] text-[#FFFFFF] px-4 py-2.5 text-[11px] uppercase tracking-[0.1em] shadow-md">
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}