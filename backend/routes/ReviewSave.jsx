import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useOutletContext } from 'react-router-dom';
import { AlertCircle, Camera, CheckCircle, Image, Loader2, Scan, X } from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const ReviewSave = () => {
  const { formData, setFormData } = useOutletContext();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  // Payment related states
  const [paymentMethod, setPaymentMethod] = useState('Offline');
  const [paidAmount, setPaidAmount] = useState('');
  const [pendingAmount, setPendingAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('Pending');
  const [scannerPhoto, setScannerPhoto] = useState(null); // Seller's captured/selected photo
  const [defaultScannerPhoto, setDefaultScannerPhoto] = useState(null); // Manager's default scanner
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scannerLoading, setScannerLoading] = useState(false);
  const fileInputRef = useRef(null);

  const { shopName, shopAddress, landmark, shopType, latitude, longitude, items } = formData;

  const totalAmount = items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0), 0);

  useEffect(() => {
    if (paymentMethod === 'Online') {
      loadDefaultScanner();
      setShowScannerModal(true);
    } else {
      setShowScannerModal(false);
      setScannerPhoto(null); // Clear scanner photo if method changes
    }
  }, [paymentMethod]);

  useEffect(() => {
    const pA = Number(paidAmount);
    const tA = Number(totalAmount);
    if (!isNaN(pA) && pA >= 0) {
      const newPending = tA - pA;
      setPendingAmount(newPending > 0 ? newPending.toFixed(2) : '0.00');
      if (pA >= tA) {
        setPaymentStatus('Paid');
      } else if (pA > 0) {
        setPaymentStatus('Partial');
      } else {
        setPaymentStatus('Pending');
      }
    } else {
      setPendingAmount(totalAmount.toFixed(2));
      setPaymentStatus('Pending');
    }
  }, [paidAmount, totalAmount]);

  const loadDefaultScanner = async () => {
    setScannerLoading(true);
    try {
      const response = await API.get('/auth/manager-scanner');
      setDefaultScannerPhoto(response.data.scannerPhoto);
    } catch (err) {
      console.error('Error fetching manager scanner:', err);
      // Gracefully handle if no scanner is configured by manager
      setDefaultScannerPhoto(null);
    } finally {
      setScannerLoading(false);
    }
  };

  const handlePhotoCapture = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScannerPhoto(reader.result); // Base64 string
        setShowScannerModal(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      const payload = {
        shopName,
        shopAddress,
        landmark,
        shopType,
        latitude,
        longitude,
        items,
        paymentMethod,
        paidAmount: Number(paidAmount) || 0,
        pendingAmount: Number(pendingAmount) || 0,
        paymentStatus,
        scannerPhoto,
      };

      await API.post('/sales/record', payload);
      setSaved(true);
    } catch (err) {
      console.error('Error saving record:', err);
      setError(err.response?.data?.message || 'Record save nahi ho paaya. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
        <CheckCircle size={58} className="fill-emerald-600 text-white" />
        <h2 className="mt-5 text-base font-black text-emerald-700">Record Saved</h2>
        <p className="mt-1 text-base font-black text-emerald-700">Successfully</p>
        <button
          type="button"
          onClick={() => {
            setFormData({
              shopName: '',
              shopAddress: '',
              landmark: '',
              shopType: 'Retail',
              latitude: null,
              longitude: null,
              items: [{ productName: '', quantity: 1, rate: '' }],
            });
            navigate('/dashboard');
          }}
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
          <p>
            <span className="font-medium text-gray-600">Name:</span> {shopName || '-'}
          </p>
          <p>
            <span className="font-medium text-gray-600">Address:</span> {shopAddress || '-'}
          </p>
          {landmark && (
            <p>
              <span className="font-medium text-gray-600">Landmark:</span> {landmark}
            </p>
          )}
          <p>
            <span className="font-medium text-gray-600">Type:</span> {shopType}
          </p>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Products</h3>
        <div className="space-y-2 bg-gray-50 p-4 rounded border border-gray-100">
          {items.map((item, index) => {
            const qty = Number(item.quantity) || 0;
            const rate = Number(item.rate) || 0;
            const amount = qty * rate;
            return (
              <div key={index} className="flex items-center justify-between text-sm border-b border-gray-200 last:border-0 pb-2 last:pb-0">
                <span className="font-medium text-gray-800">{item.productName}</span>
                <span className="font-semibold text-gray-900">
                  {qty} x ₹{rate} = ₹{amount.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="flex items-center justify-between border-t border-gray-200 pt-4">
        <h3 className="text-base font-semibold text-gray-700">Total Amount</h3>
        <p className="text-xl font-bold text-gray-900">{currencyFormatter.format(totalAmount)}</p>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Payment Details</h3>
        <div>
          <label htmlFor="paymentMethod" className="mb-1 block text-sm font-medium text-gray-700">
            Payment Method
          </label>
          <select
            id="paymentMethod"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="Offline">Offline (Cash)</option>
            <option value="Online">Online (UPI/QR)</option>
          </select>
        </div>
        <div>
          <label htmlFor="paidAmount" className="mb-1 block text-sm font-medium text-gray-700">
            Paid Amount (₹)
          </label>
          <input
            type="number"
            id="paidAmount"
            value={paidAmount || ''} // Use empty string for empty state
            onChange={(e) => setPaidAmount(e.target.value)}
            min="0"
            step="0.01"
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label htmlFor="pendingAmount" className="mb-1 block text-sm font-medium text-gray-700">
            Pending Amount (₹)
          </label>
          <input
            type="number"
            id="pendingAmount"
            value={pendingAmount || ''} // Use empty string for empty state
            readOnly
            className="w-full rounded border border-gray-300 bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900 outline-none"
          />
        </div>
        <div>
          <label htmlFor="paymentStatus" className="mb-1 block text-sm font-medium text-gray-700">
            Payment Status
          </label>
          <input
            type="text"
            id="paymentStatus"
            value={paymentStatus}
            readOnly
            className="w-full rounded border border-gray-300 bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900 outline-none"
          />
        </div>
        {scannerPhoto && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Payment Proof</h4>
            <img src={scannerPhoto} alt="Payment Proof" className="max-w-full h-auto rounded-lg border border-gray-200" />
            <button
              type="button"
              onClick={() => setScannerPhoto(null)}
              className="mt-2 text-red-600 hover:underline text-sm"
            >
              Remove Photo
            </button>
          </div>
        )}
      </section>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="w-full rounded bg-primary py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-75 mt-4"
      >
        {saving ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Save Record'}
      </button>

      {showScannerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full relative">
            <button
              onClick={() => setShowScannerModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold mb-4">Payment Scanner</h3>
            {scannerLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="animate-spin text-blue-700" size={24} />
                <p className="mt-2 text-sm text-gray-600">Loading manager scanner...</p>
              </div>
            ) : defaultScannerPhoto ? (
              <>
                <p className="text-sm text-gray-700 mb-2">Use manager's default scanner or capture your own.</p>
                <img src={defaultScannerPhoto} alt="Manager's Scanner" className="max-w-full h-auto rounded-lg border border-gray-200 mb-4" />
                <button
                  type="button"
                  onClick={() => {
                    setScannerPhoto(defaultScannerPhoto);
                    setShowScannerModal(false);
                  }}
                  className="w-full bg-blue-600 text-white py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-700"
                >
                  <Scan size={16} /> Use This Receipt
                </button>
                <div className="text-center my-3 text-gray-500">OR</div>
              </>
            ) : (
              <p className="text-sm text-gray-700 mb-4">No manager scanner configured. Please capture your own payment proof.</p>
            )}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoCapture}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="w-full bg-emerald-600 text-white py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 hover:bg-emerald-700"
            >
              <Camera size={16} /> Capture Your Own Proof
            </button>
            <button
              type="button"
              onClick={() => setShowScannerModal(false)}
              className="w-full mt-3 text-gray-600 hover:text-gray-800 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewSave;