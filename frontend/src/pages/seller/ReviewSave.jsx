import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useOutletContext,  } from 'react-router-dom';
import API from '../../api/axios';
import { AlertCircle, CheckCircle2, Camera, X } from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

const ReviewSave = () => {
  const { formData, setFormData } = useOutletContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Local state for payment details, initialized from formData
  const [paymentMethod, setPaymentMethod] = useState(formData.paymentMethod || 'Offline');
  const [payingAmount, setPayingAmount] = useState(formData.paidAmount || "");
  const [paymentStatus, setPaymentStatus] = useState(formData.paymentStatus || 'Pending');
  const [error, setError] = useState(''); // Local error state for this component
  
  // Scanner modal states
  const [showScanner, setShowScanner] = useState(false);
  const [scannerPhoto, setScannerPhoto] = useState(null);
  const [defaultScannerPhoto, setDefaultScannerPhoto] = useState(null);
  const [managerScannerLoaded, setManagerScannerLoaded] = useState(false);
  const fileInputRef = useRef(null);

  const { 
    shopName, 
    shopAddress, 
    mobile,
    landmark, 
    shopType, 
    latitude, 
    longitude, 
    items
  } = formData;

  const totalAmount = useMemo(() => (items || []).reduce((sum, item) => {
    const price = Number(item.price || item.rate || 0);
    if (item.unit === 'weight') {
      return sum + (Number(item.weight) || 0) * price;
    } else {
      return sum + (Number(item.quantity) || 0) * price;
    }
  }, 0), [items]);

  const pendingAmount = useMemo(() => totalAmount - payingAmount, [totalAmount, payingAmount]);

  // Effect to update payment status based on paid amount
  useEffect(() => {
    if (payingAmount >= totalAmount && totalAmount > 0) {
      setPaymentStatus('Paid');
    } else if (payingAmount > 0 && payingAmount < totalAmount) {
      setPaymentStatus('Partial');
    } else {
      setPaymentStatus('Pending');
    }
  }, [payingAmount, totalAmount]);

  // Fetch manager default scanner if available for sellers
  useEffect(() => {
    const loadDefaultScanner = async () => {
      try {
        const response = await API.get('/auth/manager-scanner');
        setDefaultScannerPhoto(response.data.scannerPhoto || null);
      } catch (err) {
        // No default scanner is fine; seller can still capture their own proof
        if (err.response?.status !== 404) {
          console.error('Failed to load manager scanner:', err);
        }
      } finally {
        setManagerScannerLoaded(true);
      }
    };

    loadDefaultScanner();
  }, []);

  // Open scanner modal immediately when payment method is Online
  useEffect(() => {
    if (paymentMethod === 'Online' && !scannerPhoto) {
      setShowScanner(true);
    } else if (paymentMethod !== 'Online') {
      setShowScanner(false);
    }
  }, [paymentMethod, scannerPhoto]);

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
        paymentStatus
      };

      if (typeof scannerPhoto === 'string' && scannerPhoto.trim()) {
        payload.scannerPhoto = scannerPhoto;
      }

      await API.post('/sales/record', payload);

      sessionStorage.removeItem('sellFormData'); // Clear persisted data
      setFormData(prev => ({ ...prev, shopName: '', shopAddress: '', landmark: '', shopType: 'Retail', latitude: null, longitude: null, items: [{ productName: '', quantity: 1, rate: '' }], paymentMethod: 'None', paidAmount: 0, paymentStatus: 'Pending', shopImage: null })); // Reset local state
      setSuccess(true);
      setShowScanner(false);
      setScannerPhoto(null);
      } catch (err) {
        console.error(err);
        // Handle validation errors array or single message
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
    return (
      <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
        <CheckCircle2 size={58} className="fill-emerald-600 text-white" />
        <h2 className="mt-5 text-base font-black text-emerald-700">Record Saved</h2>
        <p className="mt-1 text-base font-black text-emerald-700">Successfully</p>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="mt-12 flex h-11 w-full items-center justify-center rounded-md bg-blue-700 text-sm font-black text-white shadow-sm transition-colors hover:bg-blue-800"
        >
          OK
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
      <h2 className="text-xl font-bold border-b pb-2">Review Record</h2>
      
      {error && (
        <div className="flex items-center gap-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Shop Details</h3>
        <div className="space-y-1 text-sm text-gray-900 bg-gray-50 p-4 rounded border border-gray-100">
          <p><span className="font-medium text-gray-600">Name:</span> {shopName || '-'}</p>
          <p><span className="font-medium text-gray-600">Mobile:</span> {mobile || '-'}</p>
          <p><span className="font-medium text-gray-600">Address:</span> {shopAddress || '-'}</p>
          {landmark && <p><span className="font-medium text-gray-600">Landmark:</span> {landmark}</p>}
          <p><span className="font-medium text-gray-600">Type:</span> {shopType}</p>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Products</h3>
        <div className="space-y-2 bg-gray-50 p-4 rounded border border-gray-100">
          {(items || []).map((item, index) => {
            let quantity, rate, amount;
            let displayLabel = '';

            if (item.unit === 'weight') {
              quantity = Number(item.weight) || 0;
              displayLabel = `${quantity} kg`;
              rate = Number(item.price) || 0;
            } else {
              quantity = Number(item.quantity) || 0;
              displayLabel = `${quantity} pcs`;
              rate = Number(item.price) || 0;
            }

            amount = quantity * rate;

            return (
              <div key={`${item.productName}-${index}`} className="flex items-center justify-between text-sm border-b border-gray-200 last:border-0 pb-2 last:pb-0">
                <span className="font-medium text-gray-800">{item.productName}</span>
                <span className="font-semibold text-gray-900">
                  {displayLabel} x ₹{rate} = ₹{amount.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <div className="border-t border-gray-200 pt-4 space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-700">Total Amount</h3>
          <p className="text-xl font-bold text-gray-900">{currencyFormatter.format(totalAmount)}</p>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-emerald-600">Paying Amount</span>
          <span className="font-bold text-emerald-700">{currencyFormatter.format(payingAmount)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-red-600">Pending Amount</span>
          <span className="font-bold text-red-700">{currencyFormatter.format(pendingAmount)}</span>
        </div>
      </div>

      {/* Payment Details Section */}
      <section className="space-y-4 border-t border-gray-200 pt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Payment Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Payment Method */}
          <div>
            <label htmlFor="paymentMethod" className="mb-1 block text-sm font-medium text-gray-700">Payment Method</label>
            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value);
                if (e.target.value === 'Online') {
                  setShowScanner(true);
                }
              }}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="Offline">Cash</option>
              <option value="Online">Online</option>
            </select>
          </div>

          {/* Paying Amount */}
          <div>
            <label htmlFor="payingAmount" className="mb-1 block text-sm font-medium text-gray-700">Paying Amount (₹)</label>
            <input
              id="payingAmount"
              type="number"
              min=" "
              step="0.01"
              value={payingAmount || ''}
              onChange={(e) => setPayingAmount(Number(e.target.value))}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Pending Amount (Read-only) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Pending Amount (₹)</label>
            <input
              type="text"
              value={currencyFormatter.format(pendingAmount)}
              readOnly
              className="w-full rounded border border-gray-300 bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900 outline-none"
            />
          </div>

          {/* Payment Status */}
          <div>
            <label htmlFor="paymentStatus" className="mb-1 block text-sm font-medium text-gray-700">Payment Status</label>
            <select
              id="paymentStatus"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="Pending">Pending</option>
              <option value="Partial">Partial</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
        </div>

        {/* Scanner Preview for Online Payment */}
        {paymentMethod === 'Online' && scannerPhoto && (
          <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-700">Payment Proof</h4>
              <button
                type="button"
                onClick={handleRemovePhoto}
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

      <button
        type="button"
        onClick={handleSave}
        disabled={loading}
        className="w-full rounded bg-primary py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-75 mt-4"
      >
        {loading ? 'Saving...' : 'Save Record'}
      </button>

      {/* Scanner Modal */}
      {showScanner && paymentMethod === 'Online' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              type="button"
              onClick={() => {
                setShowScanner(false);
              }}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded text-gray-500 hover:bg-red-50 hover:text-red-600"
              aria-label="Close scanner"
            >
              <X size={20} />
            </button>

            <h3 className="mb-4 text-lg font-semibold text-gray-900">Payment Proof Upload</h3>
            
            {!scannerPhoto ? (
              <div className="space-y-4">
                {/* Show Default Manager Scanner if Available */}
                {defaultScannerPhoto ? (
                  <div className="space-y-4">
                    <div className="rounded border border-slate-300 bg-slate-50 p-3">
                      <p className="mb-3 text-xs font-semibold uppercase text-slate-600">Manager's Default Payment Receipt</p>
                      <img src={defaultScannerPhoto} alt="Manager payment receipt" className="max-h-48 w-full rounded object-contain border border-slate-200" />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setScannerPhoto(defaultScannerPhoto);
                        setShowScanner(false);
                      }}
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
                      onChange={handlePhotoCapture}
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
                    onClick={() => setScannerPhoto(null)}
                    className="flex-1 rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    Change
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setShowScanner(false)}
                    className="flex-1 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewSave;
