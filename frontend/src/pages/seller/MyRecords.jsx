import React, { useEffect, useReducer } from 'react';
import API from '../../api/axios';
import { AlertCircle, Download, Loader2, Package, ShoppingBag, X, CheckCircle2, Camera } from 'lucide-react';
import { exportSellerRecordsPDF } from '../../utils/recordsExport';

const fmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

const safeDate = (v, full = false) => {
  try {
    const d = new Date(v);
    if (isNaN(d.getTime())) return 'N/A';
    return full
      ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
          ', ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
      : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return 'N/A'; }
};

const statusColors = {
  Paid:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  Partial: 'bg-amber-50   text-amber-700   border-amber-200',
  Pending: 'bg-red-50     text-red-700     border-red-200',
};

let cachedRecords = null;
let hasFetchedRecords = false;


const createInitialState = () => ({
  records: cachedRecords || [],
  loading: !hasFetchedRecords,
  error: '',
  showPaymentModal: false,
  selectedRecord: null,
  paymentForm: {
    amount: '',
    mode: 'Cash',
    txnId: '',
    remarks: '',
  },
  paymentLoading: false,
  paymentError: '',
  defaultScannerPhoto: null,
  managerScannerLoaded: false,
  paymentPhoto: null,
});

const recordsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        [action.field]: action.value,
      };

    case 'PATCH':
      return {
        ...state,
        ...action.payload,
      };

    case 'SET_PAYMENT_FIELD':
      return {
        ...state,
        paymentForm: {
          ...state.paymentForm,
          [action.field]: action.value,
        },
      };

    case 'OPEN_PAYMENT':
      return {
        ...state,
        selectedRecord: action.record,
        paymentForm: {
          amount: '',
          mode: 'Cash',
          txnId: '',
          remarks: '',
        },
        paymentError: '',
        paymentPhoto: null,
        showPaymentModal: true,
      };

    case 'CLOSE_PAYMENT':
      return {
        ...state,
        showPaymentModal: false,
      };

    default:
      return state;
  }
};

const RecordsLoadingState = () => (
  <div className="flex min-h-[420px] items-center justify-center gap-2">
    <Loader2 className="animate-spin text-blue-700" size={22} />
    <span className="text-sm font-semibold text-slate-500">Loading records...</span>
  </div>
);

const RecordsHeader = ({ count, onDownloadPDF }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <ShoppingBag size={18} className="text-blue-700" />
      <h1 className="text-base font-black text-slate-900">My Records</h1>
      {count > 0 && (
        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-black text-blue-700">
          {count}
        </span>
      )}
    </div>
    <button
      onClick={onDownloadPDF}
      disabled={!count}
      className="flex items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-2 text-[11px] font-black text-white shadow-sm hover:bg-blue-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <Download size={13} />
      Download PDF
    </button>
  </div>
);

const RecordsError = ({ error }) => {
  if (!error) return null;

  return (
    <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
      <AlertCircle size={14} />
      <span>{error}</span>
    </div>
  );
};

const EmptyRecords = () => (
  <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-12 text-center">
    <Package size={32} className="mx-auto text-slate-300" />
    <p className="mt-3 text-sm font-semibold text-slate-400">Abhi koi record saved nahi hai.</p>
  </div>
);

const RecordCard = ({ record, onReceivePayment }) => {
  const itemCount = (record.items || []).reduce((sum, item) =>
    sum + (item.unit === 'weight' ? 1 : Number(item.quantity || 0)), 0);
  const status = record.paymentStatus || 'Pending';

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        {record.shopImage ? (
          <img src={record.shopImage} alt="Shop" className="h-12 w-12 shrink-0 rounded-lg object-cover border border-slate-200" />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-50 border border-slate-100">
            <ShoppingBag size={20} className="text-slate-300" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-black text-slate-950 truncate">{record.shopName}</h2>
                {record.mobile && (
                  <span className="text-[10px] font-semibold text-slate-400">{record.mobile}</span>
                )}
              </div>
              <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
                {safeDate(record.visitDatetime, true)}
              </p>
            </div>
            <div className="text-right shrink-0 space-y-1">
              <p className="text-sm font-black text-slate-950">{fmt.format(record.totalAmount || 0)}</p>
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[status] || statusColors.Pending}`}>
                {status}
              </span>
            </div>
          </div>

          {status === 'Partial' && (
            <div className="mt-2 flex gap-3 text-[11px] font-semibold">
              <span className="text-emerald-700">Paid: {fmt.format(record.paidAmount || 0)}</span>
              <span className="text-red-600">Pending: {fmt.format(record.pendingAmount || 0)}</span>
            </div>
          )}

          <div className="mt-3 bg-slate-50 rounded-md p-2.5 border border-slate-100">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 border-b border-slate-200 pb-1">Products ({itemCount})</p>
            <ul className="space-y-1">
              {(record.items || []).map((item, index) => {
                const displayQty = item.unit === 'weight' ? `${item.weight}kg` : `${item.quantity}pcs`;
                const price = Number(item.price || item.rate || 0);
                return (
                  <li key={item._id || item.productId || `${item.productName}-${index}`} className="flex items-center justify-between text-[11px] font-medium text-slate-700">
                    <span className="truncate pr-2">- {item.productName}</span>
                    <span className="shrink-0 text-slate-500">{displayQty} x Rs.{price}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {status !== 'Paid' && (
            <div className="mt-3">
              <button
                onClick={() => onReceivePayment(record)}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-lg bg-indigo-50 border border-indigo-200 px-3 py-2 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                <CheckCircle2 size={14} />
                Receive Payment
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

const PaymentModePicker = ({ mode, onChange }) => (
  <div className="grid grid-cols-2 gap-2">
    {['Cash', 'Online'].map((option) => (
      <button
        type="button"
        key={option}
        onClick={() => onChange(option)}
        className={`py-1.5 text-xs font-bold rounded-md border transition-colors ${
          mode === option
            ? 'bg-indigo-600 text-white border-indigo-600'
            : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
        }`}
      >
        {option}
      </button>
    ))}
  </div>
);

const OnlinePaymentFields = ({
  managerScannerLoaded,
  defaultScannerPhoto,
  paymentPhoto,
  txnId,
  onTxnIdChange,
  onPhotoChange,
  onRemovePhoto
}) => (
  <div className="space-y-4">
    {managerScannerLoaded && defaultScannerPhoto ? (
      <div className="flex flex-col items-center justify-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <img src={defaultScannerPhoto} alt="Manager Scanner" className="max-w-[200px] h-auto object-contain rounded" />
        <p className="mt-2 text-xs text-gray-500 font-medium">Scan to Pay</p>
      </div>
    ) : managerScannerLoaded ? (
      <div className="flex flex-col items-center justify-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-500">Scanner Not Available</p>
      </div>
    ) : (
      <div className="flex justify-center p-4"><Loader2 className="animate-spin text-gray-400" /></div>
    )}

    <div>
      <label className="block text-xs font-bold text-slate-700 mb-1">Transaction ID (Optional)</label>
      <input
        type="text"
        value={txnId}
        onChange={(e) => onTxnIdChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        placeholder="Enter TXN ID"
      />
    </div>

    <div>
      <label className="block text-xs font-bold text-slate-700 mb-1">Upload Payment Photo (Optional)</label>
      {paymentPhoto ? (
        <div className="relative inline-block">
          <img src={paymentPhoto} alt="Payment" className="h-24 w-auto rounded border border-gray-300 object-cover" />
          <button
            type="button"
            onClick={onRemovePhoto}
            className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div>
          <input
            type="file"
            accept="image/*"
            id="payment-photo-upload"
            className="hidden"
            onChange={onPhotoChange}
          />
          <label
            htmlFor="payment-photo-upload"
            className="flex items-center justify-center gap-2 w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <Camera size={24} className="text-gray-400" />
            <span className="text-sm text-gray-500 font-medium">Tap to upload photo</span>
          </label>
        </div>
      )}
    </div>
  </div>
);

const ReceivePaymentModal = ({
  record,
  paymentForm,
  paymentError,
  paymentLoading,
  defaultScannerPhoto,
  managerScannerLoaded,
  paymentPhoto,
  onClose,
  onSubmit,
  onPaymentFieldChange,
  onPhotoChange,
  onRemovePhoto
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
    <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
      <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-slate-50">
        <h3 className="font-bold text-slate-800">Receive Payment</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-white rounded-full p-1 border border-slate-200">
          <X size={16} />
        </button>
      </div>

      <div className="p-4 overflow-y-auto">
        <div className="mb-4 bg-indigo-50 border border-indigo-100 rounded-lg p-3">
          <p className="text-xs text-indigo-800 font-semibold mb-1">Shop: {record.shopName}</p>
          <div className="flex justify-between text-xs">
            <span className="text-slate-600">Bill: {fmt.format(record.totalAmount || 0)}</span>
            <span className="text-red-600 font-bold">Pending: {fmt.format(record.pendingAmount || 0)}</span>
          </div>
        </div>

        {paymentError && (
          <div className="mb-4 p-2 bg-red-50 text-red-600 text-xs font-semibold rounded-lg flex items-center gap-2 border border-red-200">
            <AlertCircle size={14} />
            <span>{paymentError}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Amount Received (Rs.)</label>
            <input
              type="number"
              max={record.pendingAmount}
              value={paymentForm.amount}
              onChange={(e) => onPaymentFieldChange('amount', e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
              placeholder="E.g. 5000"
              required
            />
            <p className="text-[10px] text-slate-500 mt-1">Cannot exceed pending amount.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Payment Mode</label>
            <PaymentModePicker
              mode={paymentForm.mode}
              onChange={(mode) => onPaymentFieldChange('mode', mode)}
            />
          </div>

          {paymentForm.mode === 'Online' && (
            <OnlinePaymentFields
              managerScannerLoaded={managerScannerLoaded}
              defaultScannerPhoto={defaultScannerPhoto}
              paymentPhoto={paymentPhoto}
              txnId={paymentForm.txnId}
              onTxnIdChange={(value) => onPaymentFieldChange('txnId', value)}
              onPhotoChange={onPhotoChange}
              onRemovePhoto={onRemovePhoto}
            />
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Remarks (Optional)</label>
            <textarea
              rows={2}
              value={paymentForm.remarks}
              onChange={(e) => onPaymentFieldChange('remarks', e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Any notes..."
            />
          </div>

          <button
            type="submit"
            disabled={paymentLoading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-black text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors mt-2"
          >
            {paymentLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            Save Payment
          </button>
        </form>
      </div>
    </div>
  </div>
);

const MyRecords = () => {
  const [state, dispatch] = useReducer(recordsReducer, undefined, createInitialState);

  const {
    records,
    loading,
    error,
    showPaymentModal,
    selectedRecord,
    paymentForm,
    paymentLoading,
    paymentError,
    defaultScannerPhoto,
    managerScannerLoaded,
    paymentPhoto,
  } = state;

  const setField = (field, value) => {
    dispatch({
      type: 'SET_FIELD',
      field,
      value,
    });
  };

  const setPaymentField = (field, value) => {
    dispatch({
      type: 'SET_PAYMENT_FIELD',
      field,
      value,
    });
  };

  const fetchRecords = (quiet = false) => {
    if (!quiet) setField('loading', true);
    API.get('/sales/my-records')
      .then(res => {
        setField('records', res.data);
        cachedRecords = res.data;
        hasFetchedRecords = true;
      })
      .catch(() => setField('error', 'Records load nahi ho paaye.'))
      .finally(() => setField('loading', false));
  };

  useEffect(() => {
    fetchRecords(hasFetchedRecords);
    
    // Fetch manager default scanner
    const loadDefaultScanner = async () => {
      try {
        const response = await API.get('/auth/manager-scanner');
        if (response.data && response.data.scannerPhoto) {
          setField('defaultScannerPhoto', response.data.scannerPhoto);
        }
      } catch (err) {
        console.error("Failed to load manager scanner:", err);
      } finally {
        setField('managerScannerLoaded', true);
      }
    };
    loadDefaultScanner();
  }, []);

  const handleOpenPayment = (record) => {
    dispatch({
      type: 'OPEN_PAYMENT',
      record,
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setField('paymentError', 'Only image files are allowed');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setField('paymentPhoto', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setField('paymentError', '');
    
    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      setField('paymentError', 'Please enter a valid amount.');
      return;
    }


    setField('paymentLoading', true);
    try {
      await API.post('/shoppayments/receive', {
        salesRecordId: selectedRecord._id,
        amount: Number(paymentForm.amount),
        mode: paymentForm.mode,
        txnId: paymentForm.txnId,
        remarks: paymentForm.remarks,
        paymentPhoto
      });
      alert('Payment Received Successfully');
      dispatch({ type: 'CLOSE_PAYMENT' });
      fetchRecords(); // refresh records
    } catch (err) {
      setField('paymentError', err.response?.data?.message || 'Error receiving payment');
    } finally {
      setField('paymentLoading', false);
    }
  };

  /* ── PDF generator ─── */
  const handleDownloadPDF = () => exportSellerRecordsPDF(records);

  if (loading) {
    return <RecordsLoadingState />;
  }

  return (
    <div className="space-y-4">
      <RecordsHeader count={records.length} onDownloadPDF={handleDownloadPDF} />
      <RecordsError error={error} />

      {records.length === 0 ? (
        <EmptyRecords />
      ) : (
        <div className="space-y-2.5">
          {records.map((record) => (
            <RecordCard
              key={record._id}
              record={record}
              onReceivePayment={handleOpenPayment}
            />
          ))}
        </div>
      )}

      {showPaymentModal && selectedRecord && (
        <ReceivePaymentModal
          record={selectedRecord}
          paymentForm={paymentForm}
          paymentError={paymentError}
          paymentLoading={paymentLoading}
          defaultScannerPhoto={defaultScannerPhoto}
          managerScannerLoaded={managerScannerLoaded}
          paymentPhoto={paymentPhoto}
          onClose={() => setField('showPaymentModal', false)}
          onSubmit={handlePaymentSubmit}
          onPaymentFieldChange={setPaymentField}
          onPhotoChange={handlePhotoChange}
          onRemovePhoto={() => setField('paymentPhoto', null)}
        />
      )}
    </div>
  );
};

export default MyRecords;
