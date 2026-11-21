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
      <div className="bg-[#171717] text-[#FFFFFF] border-b border-[#2E2E2E] px-4 py-1.5 flex items-center justify-between text-[10px] uppercase tracking-[0.14em]">
        <span className="text-[#B89B72] font-semibold">Bandra Street Workspace</span>
        <div className="flex gap-2">
          {(['storefront', 'vendor', 'admin'] as PortalMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setPortal(mode)}
              className={`px-3 py-1 border transition-colors ${
                portal === mode
                  ? 'bg-[#B89B72] text-[#FFFFFF] border-[#B89B72]'
                  : 'border-[#3A3A3A] text-[#EAEAEA] hover:border-[#FFFFFF]'
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
