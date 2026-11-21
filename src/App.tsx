import React, { useState } from 'react';
import BandraStreetStorefront from './storefront/BandraStreetStorefront';
import VendorDashboard from './vendor/VendorDashboard';
import AdminDashboard from './admin/AdminDashboard';

type PortalMode = 'storefront' | 'vendor' | 'admin';

export default function App() {
  const [portal, setPortal] = useState<PortalMode>('storefront');

  return (
    <div>
      {/* Unified Portal Switcher */}
      <div className="bg-brand-primary text-brand-white border-b border-brand-primary-hover px-4 py-1.5 flex items-center justify-between text-[10px] uppercase tracking-[0.14em]">
        <span className="text-brand-white font-semibold">Bandra Street Workspace</span>
        <div className="flex gap-2">
          {(['storefront', 'vendor', 'admin'] as PortalMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setPortal(mode)}
              className={`px-3 py-1 border transition-colors ${
                portal === mode
                  ? 'bg-brand-primary text-brand-white border-brand-primary'
                  : 'border-brand-primary-hover text-brand-secondary hover:bg-brand-primary-hover hover:border-brand-primary-hover'
              }`}
            >
              {mode === 'storefront'
                ? 'Customer Storefront'
                : mode === 'vendor'
                ? 'Vendor Portal'
                : 'Admin Dashboard'}
            </button>
          ))}
        </div>
      </div>

      {portal === 'storefront' && <BandraStreetStorefront />}
      {portal === 'vendor' && <VendorDashboard />}
      {portal === 'admin' && <AdminDashboard />}
    </div>
  );
}
