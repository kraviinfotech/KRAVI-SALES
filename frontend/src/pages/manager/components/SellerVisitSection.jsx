import React from 'react';
import { User } from 'lucide-react';
import SectionTitle from './SectionTitle';

const SHOP_TYPES = ['Retail', 'Wholesale', 'Distributor', 'Other'];

const SellerVisitSection = ({
  sellers,
  sellerId,
  onSellerChange,
  visitDatetime,
  onVisitDatetimeChange,
  shopType,
  onShopTypeChange
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <SectionTitle icon={User} title="Seller & Visit Details" />
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Seller */}
        <div>
          <label htmlFor="sellerId" className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Seller *</label>
          <select
            id="sellerId"
            value={sellerId}
            onChange={(e) => onSellerChange(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">— Select Seller —</option>
            {sellers.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Visit Date/Time */}
        <div>
          <label htmlFor="visitDatetime" className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Visit Date & Time *</label>
          <input
            id="visitDatetime"
            type="datetime-local"
            value={visitDatetime}
            onChange={(e) => onVisitDatetimeChange(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Shop Type */}
        <div>
          <label htmlFor="shopType" className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Shop Type *</label>
          <select
            id="shopType"
            value={shopType}
            onChange={(e) => onShopTypeChange(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {SHOP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
};

export default SellerVisitSection;
