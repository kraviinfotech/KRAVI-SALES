import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import API from '../../api/axios';
import { AlertCircle, CheckCircle2, Camera, X } from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

const SuccessState = ({ onConfirm }) => (
  <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
    <CheckCircle2 size={58} className="fill-emerald-600 text-white" />
    <h2 className="mt-5 text-base font-black text-emerald-700">Record Saved</h2>
    <p className="mt-1 text-base font-black text-emerald-700">Successfully</p>
    <button
      type="button"
      onClick={onConfirm}
      className="mt-12 flex h-11 w-full items-center justify-center rounded-md bg-blue-700 text-sm font-black text-white shadow-sm transition-colors hover:bg-blue-800"
    >
      OK
    </button>
  </div>
);

const ReviewHeader = () => (
  <div className="rounded-[28px] bg-white p-6 shadow-sm shadow-slate-200/40 ring-1 ring-slate-200">
    <h2 className="text-2xl font-bold tracking-tight text-indigo-700">Review Record</h2>
    <p className="mt-1 text-sm text-indigo-500">Confirm the sale details before saving your record.</p>
  </div>
);

const ErrorBanner = ({ error }) => {
  if (!error) return null;

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-medium text-orange-800 shadow-sm">
      <AlertCircle size={16} />
      <span>{error}</span>
    </div>
  );
};

const ShopDetailsSection = ({ shopName, mobile, shopAddress, landmark, shopType }) => (
  <section>
    <h3 className="mb-3 text-base font-black uppercase tracking-[0.2em] text-indigo-600">Shop Details</h3>
    <div className="space-y-3 rounded-[22px] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-5 text-base text-slate-800 shadow-sm">
      <p>
        <span className="font-semibold text-slate-700">Name:</span>{' '}
        <span className="font-semibold">{shopName || '-'}</span>
      </p>
      <p><span className="font-semibold text-slate-700">Mobile:</span> {mobile || '-'}</p>
      <p><span className="font-semibold text-slate-700">Address:</span> {shopAddress || '-'}</p>
      {landmark && <p><span className="font-semibold text-slate-700">Landmark:</span> {landmark}</p>}
      <p><span className="font-semibold text-slate-700">Type:</span> {shopType}</p>
    </div>
  </section>
);

const ProductSummaryRow = ({ item, index }) => {
  const quantity = item.unit === 'weight'
    ? Number(item.weight) || 0
    : Number(item.quantity) || 0;
  const displayLabel = item.unit === 'weight' ? `${quantity} kg` : `${quantity} pcs`;
  const rate = Number(item.price) || 0;
  const amount = quantity * rate;

  return (
    <div key={`${item.productName}-${index}`} className="flex items-center justify-between gap-4 text-base border-b border-slate-200 last:border-0 pb-3 last:pb-0">
      <span className="font-semibold text-indigo-700">{item.productName || '-'}</span>
      <span className="font-semibold text-slate-700">{displayLabel} x Rs.{rate} = Rs.{amount.toFixed(2)}</span>
    </div>
  );
};

const ProductsSection = ({ items }) => (
  <section>
    <div className="flex items-center justify-between">
      <h3 className="text-base font-black uppercase tracking-[0.2em] text-indigo-600">Products</h3>
    </div>
    <div className="space-y-2 bg-white p-4 rounded-[22px] border border-slate-200 shadow-sm">
      {(items || []).map((item, index) => (
        <ProductSummaryRow key={`${item.productName}-${index}`} item={item} index={index} />
      ))}
    </div>
  </section>
);

const AmountSummary = ({ totalAmount, payingAmount, pendingAmount }) => (
  <div className="rounded-[24px] border border-indigo-100 bg-white/95 p-5 pt-4 text-slate-900 shadow-lg shadow-indigo-100/40">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-base font-black uppercase tracking-[0.2em] text-indigo-600">Total Amount</p>
      </div>
      <p className="text-3xl font-black text-indigo-700">{currencyFormatter.format(totalAmount)}</p>
    </div>
    <div className="mt-3 flex items-center justify-between rounded-2xl bg-indigo-50 px-4 py-3 text-sm text-slate-700">
      <span className="font-semibold">Paying Amount</span>
      <span className="font-black text-indigo-700">{currencyFormatter.format(payingAmount)}</span>
    </div>
    <div className="mt-2 flex items-center justify-between rounded-2xl bg-rose-50 px-4 py-3 text-sm text-slate-700">
      <span className="font-semibold">Pending Amount</span>
      <span className="font-black text-rose-600">{currencyFormatter.format(pendingAmount)}</span>
    </div>
  </div>
);

const PaymentDetailsSection = ({
  paymentMethod,
  setPaymentMethod,
  payingAmount,
  setPayingAmount,
  pendingAmount,
  paymentStatus,
  setPaymentStatus,
  scannerPhoto,
  setShowScanner,
  onRemovePhoto
}) => (
  <section className="space-y-4 border-t border-slate-200 pt-4">
    <h3 className="mb-2 text-base font-black uppercase tracking-[0.2em] text-indigo-600">Payment Details</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="paymentMethod" className="mb-1 block text-base font-semibold text-slate-700">Payment Method</label>
        <select
          id="paymentMethod"
          value={paymentMethod}
          onChange={(e) => {
            const nextValue = e.target.value;
            setPaymentMethod(nextValue);
            // Managing state directly on action side instead of monitoring through a separate useEffect
            if (nextValue === 'Online' && !scannerPhoto) {
              setShowScanner(true);
            } else {
              setShowScanner(false);
            }
          }}
          className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-200"
        >
          <option value="Offline">Cash</option>
          <option value="Online">Online</option>
        </select>
      </div>

      <div>
        <label htmlFor="payingAmount" className="mb-1 block text-base font-semibold text-slate-700">
          {paymentMethod === 'Offline' ? 'Cash Received (Rs.)' : 'Paying Amount (Rs.)'}
        </label>
        <input
          id="payingAmount"
          type="number"
          min="0"
          step="0.01"
          value={payingAmount || ''}
          onChange={(e) => setPayingAmount(Number(e.target.value))}
          className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-200"
        />
      </div>

      <div>
        <label className="mb-1 block text-base font-semibold text-slate-700">Pending Amount (Rs.)</label>
        <input
          type="text"
          value={currencyFormatter.format(pendingAmount)}
          readOnly
          className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-900 outline-none"
        />
      </div>

      <div>
        <label htmlFor="paymentStatus" className="mb-1 block text-base font-semibold text-slate-700">Payment Status</label>
        <select
          id="paymentStatus"
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
          className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-200"
        >
          <option value="Pending">Pending</option>
          <option value="Partial">Partial</option>
          <option value="Paid">Paid</option>
        </select>
      </div>
    </div>

    {paymentMethod === 'Online' && scannerPhoto && (
      <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-gray-700">Payment Proof</h4>
          <button
            type="button"
            onClick={onRemovePhoto}
            className="flex h-6 w-6 items-center justify-center rounded text-gray-500 hover:bg-red-50 hover:text-red-600"
            aria-label="Remove photo"
          >
            <X size={16} />
          </button>
        </div>
        <img src={scannerPhoto} alt="Payment Proof" className="max-w-full max-h-48 rounded border border-gray-200" />
      </div>
    )}
  </section>
);

const ScannerModal = ({
  open,
  scannerPhoto,
  defaultScannerPhoto,
  fileInputRef,
  onClose,
  onUseDefaultPhoto,
  onPhotoCapture,
  onChangePhoto
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded text-gray-500 hover:bg-red-50 hover:text-red-600"
          aria-label="Close scanner"
        >
          <X size={20} />
        </button>

        <h3 className="mb-4 text-lg font-semibold text-gray-900">Payment Proof Upload</h3>

        {!scannerPhoto ? (
          <div className="space-y-4">
            {defaultScannerPhoto ? (
              <div className="space-y-4">
                <div className="rounded border border-slate-300 bg-slate-50 p-3">
                  <p className="mb-3 text-xs font-semibold uppercase text-slate-600">Manager's Default Payment Receipt</p>
                  <img src={defaultScannerPhoto} alt="Manager payment receipt" className="max-h-48 w-full rounded object-contain border border-slate-200" />
                </div>

                <button
                  type="button"
                  onClick={onUseDefaultPhoto}
                  className="w-full rounded bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
                >
                  Use This Receipt
                </button>

                <div className="relative flex items-center gap-3">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="text-xs font-medium text-gray-500">Or</span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600 mb-4">Capture a photo of your payment confirmation</p>
            )}

            <div className="flex flex-col gap-3">
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded border-2 border-dashed border-blue-500 bg-blue-50 px-4 py-6 text-sm font-medium text-blue-600 hover:bg-blue-100 transition">
                <Camera size={18} />
                Capture Your Own Proof
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={onPhotoCapture}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded border border-gray-200 bg-gray-50 p-3">
              <p className="mb-2 text-xs font-semibold text-gray-600">Payment Proof</p>
              <img src={scannerPhoto} alt="Payment Proof" className="max-w-full rounded border border-gray-200" />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onChangePhoto}
                className="flex-1 rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Change
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
              >
                Confirm
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ReviewSave = () => {
  const { formData, setFormData } = useOutletContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Local state for payment details, initialized from formData
  const [paymentMethod, setPaymentMethod] = useState(formData.paymentMethod || 'Offline');
  const [payingAmount, setPayingAmount] = useState(formData.paidAmount || "");
  const [paymentStatus, setPaymentStatus] = useState(formData.paymentStatus || 'Pending');
  const [error, setError] = useState('');
  
  // Scanner modal states
  const [showScanner, setShowScanner] = useState(false);
  const [scannerPhoto, setScannerPhoto] = useState(null);
  const [defaultScannerPhoto, setDefaultScannerPhoto] = useState(null);
  const [, setManagerScannerLoaded] = useState(false);
  const fileInputRef = useRef(null);

  const { 
    shopName, 
    shopAddress, 
    mobile,
    landmark, 
    shopType, 
    latitude, 
    longitude, 
    items,
    shopImage
  } = formData;

  const totalAmount = useMemo(() => (items || []).reduce((sum, item) => {
    const price = Number(item.price || item.rate || 0);
    if (item.unit === 'weight') {
      return sum + (Number(item.weight) || 0) * price;
    } else {
      return sum + (Number(item.quantity) || 0) * price;
    }
  }, 0), [items]);

  const pendingAmount = totalAmount - Number(payingAmount || 0);

  // Fetch manager default scanner if available for sellers
  useEffect(() => {
    const loadDefaultScanner = async () => {
      try {
        const response = await API.get('/auth/manager-scanner');
        setDefaultScannerPhoto(response.data.scannerPhoto || null);
      } catch (err) {
        if (err.response?.status !== 404) {
          console.error('Failed to load manager scanner:', err);
        }
      } finally {
        setManagerScannerLoaded(true);
      }
    };

    loadDefaultScanner();
  }, []);

  const handlePhotoCapture = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setScannerPhoto(event.target?.result);
        setShowScanner(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setScannerPhoto(null);
    setDefaultScannerPhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');

    if (paymentMethod === 'Online' && (!scannerPhoto || (typeof scannerPhoto === 'string' && scannerPhoto.trim() === ''))) {
      setError('Please capture or select payment proof before saving for online payments.');
      setLoading(false);
      return;
    }
    try {
      const salesItems = (items || []).map((item) => {
        const unit = item.unit === 'weight' ? 'weight' : 'quantity';
        const price = Number(item.price || item.rate || 0);
        const baseItem = {
          productName: (item.productName || '').trim(),
          unit,
          price
        };

        return unit === 'weight'
          ? { ...baseItem, weight: Number(item.weight || 0) }
          : { ...baseItem, quantity: Number(item.quantity || 0) };
      });

      const payload = {
        shopName: shopName?.trim() || '',
        mobile: mobile || '',
        shopAddress: shopAddress?.trim() || '',
        landmark: landmark || '',
        shopType,
        latitude,
        longitude,
        items: salesItems,
        paymentMethod,
        paidAmount: Number(payingAmount) || 0,
        pendingAmount: Number(pendingAmount) || 0,
        paymentStatus,
        shopImage
      };

      if (typeof scannerPhoto === 'string' && scannerPhoto.trim()) {
        payload.scannerPhoto = scannerPhoto;
      }

      await API.post('/sales/record', payload);

      sessionStorage.removeItem('sellFormData');
      setFormData(prev => ({ ...prev, shopName: '', shopAddress: '', landmark: '', shopType: 'Retail', latitude: null, longitude: null, items: [{ productName: '', quantity: 1, rate: '' }], paymentMethod: 'None', paidAmount: 0, paymentStatus: 'Pending', shopImage: null }));
      setSuccess(true);
      setShowScanner(false);
      setScannerPhoto(null);
    } catch (err) {
      console.error(err);
      if (err.response?.data?.errors) {
        const messages = err.response.data.errors.map(e => e.msg).join(' | ');
        setError(messages);
      } else {
        setError(err.response?.data?.message || 'Record save nahi ho paaya. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return <SuccessState onConfirm={() => navigate('/dashboard')} />;
  }

  return (
    <div className="max-w-2xl mx-auto bg-gradient-to-br from-slate-100 via-slate-50 to-white p-6 rounded-[32px] shadow-2xl ring-1 ring-slate-200/70 space-y-6">
      <ReviewHeader />
      <ErrorBanner error={error} />
      <ShopDetailsSection
        shopName={shopName}
        mobile={mobile}
        shopAddress={shopAddress}
        landmark={landmark}
        shopType={shopType}
      />

      <ProductsSection items={items} />

      <AmountSummary
        totalAmount={totalAmount}
        payingAmount={payingAmount}
        pendingAmount={pendingAmount}
      />
      <PaymentDetailsSection
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        payingAmount={payingAmount}
        setPayingAmount={setPayingAmount}
        pendingAmount={pendingAmount}
        paymentStatus={paymentStatus}
        setPaymentStatus={setPaymentStatus}
        scannerPhoto={scannerPhoto}
        setShowScanner={setShowScanner}
        onRemovePhoto={handleRemovePhoto}
      />

      <button
        type="button"
        onClick={handleSave}
        disabled={loading}
        className="w-full rounded-2xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200/40 transition duration-200 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-75 mt-4"
      >
        {loading ? 'Saving...' : 'Save Record'}
      </button>
      <ScannerModal
        open={showScanner && paymentMethod === 'Online'}
        scannerPhoto={scannerPhoto}
        defaultScannerPhoto={defaultScannerPhoto}
        fileInputRef={fileInputRef}
        onClose={() => setShowScanner(false)}
        onUseDefaultPhoto={() => {
          setScannerPhoto(defaultScannerPhoto);
          setShowScanner(false);
        }}
        onPhotoCapture={handlePhotoCapture}
        onChangePhoto={() => setScannerPhoto(null)}
      />
    </div>
  );
};

export default ReviewSave;