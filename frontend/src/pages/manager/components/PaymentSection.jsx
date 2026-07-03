import React from 'react';
import { CreditCard } from 'lucide-react';
import SectionTitle from './SectionTitle';

const PAYMENT_STATUSES = ['Paid', 'Partial', 'Pending'];

const PaymentSection = ({
  totalAmount,
  paymentStatus,
  onPaymentStatusChange,
  paidAmount,
  onPaidAmountChange,
  computedPending,
  computedPaid,
  paymentMethod,
  onPaymentMethodChange
}) => {
  return (
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
            onChange={(e) => onPaymentStatusChange(e.target.value)}
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
              onChange={(e) => onPaidAmountChange(e.target.value)}
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
            onChange={(e) => onPaymentMethodChange(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="Offline">Offline (Cash)</option>
            <option value="Online">Online</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default PaymentSection;
