import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import {
  ArrowLeft, Plus, Trash2, Loader2, CheckCircle2, AlertCircle,
  Store, User, Package, CreditCard, Calendar
} from 'lucide-react';

const SHOP_TYPES = ['Retail', 'Wholesale', 'Distributor', 'Other'];
const PAYMENT_STATUSES = ['Paid', 'Partial', 'Pending'];
const UNITS = ['quantity', 'weight'];

const emptyItem = () => ({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, productName: '', unit: 'quantity', quantity: 1, weight: 0.5, price: '' });

const SectionTitle = ({ icon: Icon, title, color = 'text-blue-700', bg = 'bg-blue-50' }) => (
  <div className={`flex items-center gap-2 px-5 py-3 border-b border-slate-100 ${bg}`}>
    <Icon size={16} className={color} />
    <h3 className={`text-xs font-black uppercase tracking-widest ${color}`}>{title}</h3>
  </div>
);

const ManagerAddRecord = () => {
  const navigate = useNavigate();

  // Sellers & products from API
  const [sellers, setSellers] = useState([]);
  const [masterProducts, setMasterProducts] = useState([]);

  // Form state
  const [sellerId, setSellerId] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [mobile, setMobile] = useState('');
  const [shopType, setShopType] = useState('Retail');
  const [landmark, setLandmark] = useState('');
  const [visitDatetime, setVisitDatetime] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [items, setItems] = useState([emptyItem()]);
  const [paymentStatus, setPaymentStatus] = useState('Pending');
  const [paidAmount, setPaidAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Offline');

  // UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sellerRes, productRes] = await Promise.all([
          API.get('/sellers'),
          API.get('/products')
        ]);
        setSellers(sellerRes.data);
        setMasterProducts(productRes.data);
        if (sellerRes.data.length > 0) setSellerId(sellerRes.data[0]._id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  // Computed totals
  const totalAmount = items.reduce((sum, item) => {
    const qty = item.unit === 'weight' ? Number(item.weight || 0) : Number(item.quantity || 0);
    return sum + qty * Number(item.price || 0);
  }, 0);

  const computedPending = paymentStatus === 'Paid'
    ? 0
    : paymentStatus === 'Partial'
      ? Math.max(0, totalAmount - Number(paidAmount || 0))
      : totalAmount;

  const computedPaid = paymentStatus === 'Paid'
    ? totalAmount
    : paymentStatus === 'Partial'
      ? Number(paidAmount || 0)
      : 0;

  // Item helpers
  const updateItem = (idx, field, value) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const updatedItem = { ...item, [field]: value };
      if (field === 'productName') {
        const match = masterProducts.find(p => p.name === value);
        if (match && match.baseRate > 0) {
          updatedItem.price = match.baseRate;
        }
      }
      return updatedItem;
    }));
  };
  const addItem = () => setItems(prev => [...prev, emptyItem()]);
  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate items
    for (const item of items) {
      if (!item.productName.trim()) { setError('All items must have a product name.'); return; }
      if (!item.price || Number(item.price) <= 0) { setError('All items must have a price greater than 0.'); return; }
      if (item.unit === 'quantity' && (!item.quantity || Number(item.quantity) < 1)) {
        setError('Quantity must be at least 1.'); return;
      }
      if (item.unit === 'weight' && (!item.weight || Number(item.weight) < 0.1)) {
        setError('Weight must be at least 0.1 kg.'); return;
      }
    }

    if (!sellerId) { setError('Please select a seller.'); return; }

    setLoading(true);
    try {
      await API.post('/reports/manager-record', {
        sellerId,
        shopName,
        shopAddress,
        mobile,
        landmark,
        shopType,
        visitDatetime: new Date(visitDatetime).toISOString(),
        items: items.map(item => ({
          productName: item.productName,
          unit: item.unit,
          quantity: item.unit === 'quantity' ? Number(item.quantity) : undefined,
          weight: item.unit === 'weight' ? Number(item.weight) : undefined,
          price: Number(item.price)
        })),
        paymentStatus,
        paidAmount: computedPaid,
        pendingAmount: computedPending,
        paymentMethod
      });
      setSuccess('Record saved successfully!');
      setTimeout(() => navigate('/manager/records'), 1500);
    } catch (err) {
      if (!err.response) {
        setError('Network Error: Cannot connect to the server.');
      } else if (err.response.data?.errors) {
        setError(err.response.data.errors.map(e => e.msg).join(', '));
      } else {
        setError(err.response.data?.message || 'Failed to save record.');
      }
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-4 border-b border-slate-200 pb-5">
        <button
          onClick={() => navigate('/manager/records')}
          className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">Add New Record</h1>
          <p className="text-sm font-medium text-slate-500">Manually add a sales visit record on behalf of a seller</p>
        </div>
      </div>

      {/* Error / Success banners */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{success} Redirecting…</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ── Section 1: Seller & Visit Info ── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <SectionTitle icon={User} title="Seller & Visit Details" />
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Seller */}
            <div>
              <label htmlFor="sellerId" className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Seller *</label>
              <select
                id="sellerId"
                value={sellerId}
                onChange={e => setSellerId(e.target.value)}
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
                onChange={e => setVisitDatetime(e.target.value)}
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
                onChange={e => setShopType(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {SHOP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── Section 2: Shop Info ── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <SectionTitle icon={Store} title="Shop Information" color="text-violet-700" bg="bg-violet-50" />
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="shopName" className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Shop Name *</label>
              <input
                id="shopName"
                type="text"
                value={shopName}
                onChange={e => setShopName(e.target.value)}
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
                onChange={e => setMobile(e.target.value)}
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
                onChange={e => setShopAddress(e.target.value)}
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
                onChange={e => setLandmark(e.target.value)}
                placeholder="Near..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>

        {/* ── Section 3: Items ── */}
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
                    onChange={e => updateItem(idx, 'productName', e.target.value)}
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
                    onChange={e => updateItem(idx, 'unit', e.target.value)}
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
                    onChange={e => updateItem(idx, item.unit === 'weight' ? 'weight' : 'quantity', e.target.value)}
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
                    onChange={e => updateItem(idx, 'price', e.target.value)}
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
                      onClick={() => removeItem(idx)}
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
              onClick={addItem}
              className="flex items-center gap-2 text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-bold transition-colors border border-blue-200 border-dashed w-full justify-center"
            >
              <Plus size={16} /> Add Item
            </button>
          </div>
        </div>

        {/* ── Section 4: Payment ── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <SectionTitle icon={CreditCard} title="Payment Details" color="text-orange-700" bg="bg-orange-50" />
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total (read-only) */}
            <div>
              <div className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Total Amount</div>
              <div className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-black text-slate-900">
                ₹{totalAmount.toFixed(2)}
              </div>
            </div>

            {/* Payment Status */}
            <div>
              <label htmlFor="paymentStatus" className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Payment Status *</label>
              <select
                id="paymentStatus"
                value={paymentStatus}
                onChange={e => setPaymentStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
              >
                {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Paid Amount (only if Partial) */}
            {paymentStatus === 'Partial' && (
              <div>
                <label htmlFor="paidAmount" className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Paid Amount (₹)</label>
                <input
                  id="paidAmount"
                  type="number"
                  min={0}
                  step={0.01}
                  value={paidAmount}
                  onChange={e => setPaidAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            )}

            {/* Pending Amount (read-only) */}
            <div>
              <div className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Pending Amount</div>
              <div className={`w-full rounded-lg border px-3 py-2.5 text-sm font-black ${computedPending > 0 ? 'border-red-200 bg-red-50 text-red-700' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                ₹{computedPending.toFixed(2)}
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label htmlFor="paymentMethod" className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Payment Method</label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="Offline">Offline (Cash)</option>
                <option value="Online">Online</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !!success}
            className="flex-1 sm:flex-none sm:px-10 bg-blue-700 hover:bg-blue-800 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 text-sm shadow-md transition-all disabled:opacity-60"
          >
            {loading ? <><Loader2 className="animate-spin" size={18} /> Saving…</> : <><CheckCircle2 size={18} /> Save Record</>}
          </button>
          <button
            type="button"
            onClick={() => navigate('/manager/records')}
            className="flex-1 sm:flex-none sm:px-8 border border-slate-300 text-slate-700 font-bold py-3 rounded-xl text-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManagerAddRecord;