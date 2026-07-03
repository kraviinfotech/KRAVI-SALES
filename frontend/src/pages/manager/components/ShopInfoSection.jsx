import React from 'react';
import { Store } from 'lucide-react';
import SectionTitle from './SectionTitle';

const ShopInfoSection = ({
  shopName,
  onShopNameChange,
  shopAddress,
  onShopAddressChange,
  mobile,
  onMobileChange,
  landmark,
  onLandmarkChange
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <SectionTitle icon={Store} title="Shop Information" color="text-violet-700" bg="bg-violet-50" />
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="shopName" className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Shop Name *</label>
          <input
            id="shopName"
            type="text"
            value={shopName}
            onChange={(e) => onShopNameChange(e.target.value)}
            required
            placeholder="e.g. Sharma General Store"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div>
          <label htmlFor="mobile" className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Mobile</label>
          <input
            id="mobile"
            type="tel"
            value={mobile}
            onChange={(e) => onMobileChange(e.target.value)}
            placeholder="Shop contact number"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="shopAddress" className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Shop Address *</label>
          <input
            id="shopAddress"
            type="text"
            value={shopAddress}
            onChange={(e) => onShopAddressChange(e.target.value)}
            required
            placeholder="Full address"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div>
          <label htmlFor="landmark" className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Landmark</label>
          <input
            id="landmark"
            type="text"
            value={landmark}
            onChange={(e) => onLandmarkChange(e.target.value)}
            placeholder="Near..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>
    </div>
  );
};

export default ShopInfoSection;
