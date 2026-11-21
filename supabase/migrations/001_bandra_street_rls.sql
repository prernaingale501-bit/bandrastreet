-- ============================================================================
-- BANDRA STREET — SUPABASE SCHEMA, ROW LEVEL SECURITY (RLS) & STORAGE POLICIES
-- ============================================================================

-- 1. PROFILES & ROLES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role text not null check (role in ('customer', 'vendor', 'admin')) default 'customer',
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id) with check (role = (select role from public.profiles where id = auth.uid()));

-- 2. VENDORS (Strict approval & ownership)
create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id),
  store_name text not null,
  gstin text not null,
  pan text not null,
  gst_verified boolean default false,
  pan_verified boolean default false,
  status text not null check (status in ('Pending', 'Docs Requested', 'Active', 'Suspended', 'Rejected')) default 'Pending',
  commission_override numeric(5,2),
  created_at timestamptz default now()
);
alter table public.vendors enable row level security;

create policy "Vendors view own store" on public.vendors
  for select using (auth.uid() = owner_id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "Customers view active stores" on public.vendors
  for select using (status = 'Active');
create policy "Admins manage all vendors" on public.vendors
  for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- 3. PRODUCTS (Only approved & visible to public; vendors own their rows)
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  sku text unique not null,
  title text not null,
  price numeric(12,2) not null,
  sale_price numeric(12,2),
  stock integer not null default 0,
  approval_status text not null check (approval_status in ('Pending', 'Approved', 'Rejected')) default 'Pending',
  visible boolean default false
);
alter table public.products enable row level security;

create policy "Public reads approved visible products" on public.products
  for select using (approval_status = 'Approved' and visible = true);
create policy "Approved vendors manage own products" on public.products
  for all using (
    exists (
      select 1 from public.vendors v
      where v.id = vendor_id and v.owner_id = auth.uid() and v.status = 'Active'
    )
  );
create policy "Admins manage all products" on public.products
  for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- 4. ORDERS & PAYMENTS (Server-side Razorpay signature verification required)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_id uuid not null references public.profiles(id),
  vendor_id uuid not null references public.vendors(id),
  gross_amount numeric(12,2) not null,
  commission_amount numeric(12,2) not null,
  net_amount numeric(12,2) not null,
  payment_method text not null check (payment_method in ('razorpay', 'cod')),
  payment_status text not null check (payment_status in ('pending', 'verified', 'failed', 'refunded')) default 'pending',
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  status text not null default 'Pending',
  created_at timestamptz default now()
);
alter table public.orders enable row level security;

create policy "Customers read own orders" on public.orders
  for select using (auth.uid() = customer_id);
create policy "Vendors read own store orders" on public.orders
  for select using (exists (select 1 from public.vendors v where v.id = vendor_id and v.owner_id = auth.uid()));
create policy "Admins manage all orders" on public.orders
  for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- 5. STORAGE BUCKET PERMISSIONS (Private KYC docs vs Public product images)
-- Bucket: 'vendor-kyc-docs' (private)
create policy "Vendors upload own KYC docs" on storage.objects
  for insert with check (bucket_id = 'vendor-kyc-docs' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Admins & owner read KYC docs" on storage.objects
  for select using (
    bucket_id = 'vendor-kyc-docs' and (
      auth.uid()::text = (storage.foldername(name))[1]
      or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
    )
  );