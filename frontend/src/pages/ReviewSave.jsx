import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useOutletContext,  } from 'react-router-dom';
import API from '../api/axios';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

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
  const [paymentMethod, setPaymentMethod] = useState(formData.paymentMethod || 'None');
  const [paidAmount, setPaidAmount] = useState(formData.paidAmount || 0);
  const [paymentStatus, setPaymentStatus] = useState(formData.paymentStatus || 'Pending');
  const [error, setError] = useState(''); // Local error state for this component

  const { shopName, shopAddress, landmark, shopType, latitude, longitude, items } = formData; // Destructure other fields from formData

  const totalAmount = useMemo(() => (items || []).reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0),
    0
  ), [items]);

  const pendingAmount = useMemo(() => totalAmount - paidAmount, [totalAmount, paidAmount]);

  // Effect to update payment status based on paid amount
  useEffect(() => {
    if (paidAmount >= totalAmount && totalAmount > 0) {
      setPaymentStatus('Paid');
    } else if (paidAmount > 0 && paidAmount < totalAmount) {
      setPaymentStatus('Partial');
    } else {
      setPaymentStatus('Pending');
    }
  }, [paidAmount, totalAmount]);

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      await API.post('/sales/record', {
        shopName,
        shopAddress,
        landmark,
        shopType,
        latitude,
        longitude,
        items,
        paymentMethod,
        paidAmount,
        pendingAmount, // Send calculated pending amount
        paymentStatus,
      });

      sessionStorage.removeItem('sellFormData'); // Clear persisted data
      setFormData(prev => ({ ...prev, shopName: '', shopAddress: '', landmark: '', shopType: 'Retail', latitude: null, longitude: null, items: [{ productName: '', quantity: 1, rate: '' }], paymentMethod: 'None', paidAmount: 0, paymentStatus: 'Pending' })); // Reset local state
      setSuccess(true);
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
          <p><span className="font-medium text-gray-600">Address:</span> {shopAddress || '-'}</p>
          {landmark && <p><span className="font-medium text-gray-600">Landmark:</span> {landmark}</p>}
          <p><span className="font-medium text-gray-600">Type:</span> {shopType}</p>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Products</h3>
        <div className="space-y-2 bg-gray-50 p-4 rounded border border-gray-100">
          {(items || []).map((item, index) => {
            const quantity = Number(item.quantity) || 0;
            const rate = Number(item.rate) || 0;
            const amount = quantity * rate;

            return (
              <div key={`${item.productName}-${index}`} className="flex items-center justify-between text-sm border-b border-gray-200 last:border-0 pb-2 last:pb-0">
                <span className="font-medium text-gray-800">{item.productName}</span>
                <span className="font-semibold text-gray-900">
                  {quantity} x ₹{rate} = ₹{amount.toFixed(2)}
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
          <span className="font-medium text-emerald-600">Paid Amount</span>
          <span className="font-bold text-emerald-700">{currencyFormatter.format(paidAmount)}</span>
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
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="None">None</option>
              <option value="Offline">Cash</option>
              <option value="Online">Online</option>
            </select>
          </div>

          {/* Paid Amount */}
          <div>
            <label htmlFor="paidAmount" className="mb-1 block text-sm font-medium text-gray-700">Paid Amount (₹)</label>
            <input
              id="paidAmount"
              type="number"
              min="0"
              step="0.01"
              value={paidAmount}
              onChange={(e) => setPaidAmount(Number(e.target.value))}
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
      </section>

      <button
        type="button"
        onClick={handleSave}
        disabled={loading}
        className="w-full rounded bg-primary py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-75 mt-4"
      >
        {loading ? 'Saving...' : 'Save Record'}
      </button>
    </div>
  );
};

export default ReviewSave;
