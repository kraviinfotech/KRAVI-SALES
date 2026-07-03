import React from 'react';
import { Package, Plus, Trash2 } from 'lucide-react';
import SectionTitle from './SectionTitle';

const UNITS = ['quantity', 'weight'];

const ItemsSection = ({
  items,
  masterProducts,
  onUpdateItem,
  onAddItem,
  onRemoveItem
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <SectionTitle icon={Package} title="Items Sold" color="text-emerald-700" bg="bg-emerald-50" />
      <div className="p-5 space-y-3">
        {items.map((item, idx) => (
          <div key={item.id} className="grid grid-cols-12 gap-2 items-end bg-slate-50 rounded-lg p-3 border border-slate-100">
            {/* Product Name */}
            <div className="col-span-12 sm:col-span-4">
              {idx === 0 && <div className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Product *</div>}
              <input
                type="text"
                list={`products-list-${item.id}`}
                value={item.productName}
                onChange={(e) => onUpdateItem(idx, 'productName', e.target.value)}
                required
                placeholder="Product name"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <datalist id={`products-list-${item.id}`}>
                {masterProducts.map(p => <option key={p._id} value={p.name} />)}
              </datalist>
            </div>

            {/* Unit */}
            <div className="col-span-5 sm:col-span-2">
              {idx === 0 && <div className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Unit</div>}
              <select
                value={item.unit}
                onChange={(e) => onUpdateItem(idx, 'unit', e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                {UNITS.map(u => <option key={u} value={u}>{u === 'weight' ? 'Weight (kg)' : 'Quantity (pcs)'}</option>)}
              </select>
            </div>

            {/* Qty / Weight */}
            <div className="col-span-7 sm:col-span-2">
              {idx === 0 && <div className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                {item.unit === 'weight' ? 'Weight (kg)' : 'Qty'}
              </div>}
              <input
                type="number"
                min={item.unit === 'weight' ? 0.1 : 1}
                step={item.unit === 'weight' ? 0.1 : 1}
                value={item.unit === 'weight' ? item.weight : item.quantity}
                onChange={(e) => onUpdateItem(idx, item.unit === 'weight' ? 'weight' : 'quantity', e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Price */}
            <div className="col-span-5 sm:col-span-2">
              {idx === 0 && <div className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Price (₹) *</div>}
              <input
                type="number"
                min={0.01}
                step={0.01}
                value={item.price}
                onChange={(e) => onUpdateItem(idx, 'price', e.target.value)}
                required
                placeholder="0.00"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Amount preview */}
            <div className="col-span-5 sm:col-span-1">
              {idx === 0 && <div className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Amount</div>}
              <div className="px-2 py-2 text-sm font-black text-slate-900 text-right">
                ₹{((item.unit === 'weight' ? Number(item.weight || 0) : Number(item.quantity || 0)) * Number(item.price || 0)).toFixed(0)}
              </div>
            </div>

            {/* Remove button */}
            <div className="col-span-2 sm:col-span-1 flex justify-end">
              {idx === 0 && <div className="mb-1 h-[15px]" />}
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveItem(idx)}
                  className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={onAddItem}
          className="flex items-center gap-2 text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-bold transition-colors border border-blue-200 border-dashed w-full justify-center"
        >
          <Plus size={16} /> Add Item
        </button>
      </div>
    </div>
  );
};

export default ItemsSection;
