import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { Loader2, CheckCircle2 } from 'lucide-react';
import FormHeader from './components/FormHeader';
import ErrorSuccessBanners from './components/ErrorSuccessBanners';
import SellerVisitSection from './components/SellerVisitSection';
import ShopInfoSection from './components/ShopInfoSection';
import ItemsSection from './components/ItemsSection';
import PaymentSection from './components/PaymentSection';

const emptyItem = () => ({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, productName: '', unit: 'quantity', quantity: 1, weight: 0.5, price: '' });

const SectionTitle = ({ icon: Icon, title, color = 'text-blue-700', bg = 'bg-blue-50' }) => (
  <div className={`flex items-center gap-2 px-5 py-3 border-b border-slate-100 ${bg}`}>
    <Icon size={16} className={color} />
    <h3 className={`text-xs font-black uppercase tracking-widest ${color}`}>{title}</h3>
  </div>
);


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
      <FormHeader onBack={() => navigate('/manager/records')} />
      <ErrorSuccessBanners error={error} success={success} />

      <form onSubmit={handleSubmit} className="space-y-5">
        <SellerVisitSection
          sellers={sellers}
          sellerId={sellerId}
          onSellerChange={setSellerId}
          visitDatetime={visitDatetime}
          onVisitDatetimeChange={setVisitDatetime}
          shopType={shopType}
          onShopTypeChange={setShopType}
        />

        <ShopInfoSection
          shopName={shopName}
          onShopNameChange={setShopName}
          shopAddress={shopAddress}
          onShopAddressChange={setShopAddress}
          mobile={mobile}
          onMobileChange={setMobile}
          landmark={landmark}
          onLandmarkChange={setLandmark}
        />

        <ItemsSection
          items={items}
          masterProducts={masterProducts}
          onUpdateItem={updateItem}
          onAddItem={addItem}
          onRemoveItem={removeItem}
        />

        <PaymentSection
          totalAmount={totalAmount}
          paymentStatus={paymentStatus}
          onPaymentStatusChange={setPaymentStatus}
          paidAmount={paidAmount}
          onPaidAmountChange={setPaidAmount}
          computedPending={computedPending}
          computedPaid={computedPaid}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
        />

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