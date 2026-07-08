import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import API from '../../api/axios';
import { AlertCircle, CheckCircle2, Camera, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

const SuccessState = ({ onConfirm, t }) => {
  return (
  <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
    <CheckCircle2 size={58} className="fill-emerald-600 text-white" />
    <h2 className="mt-5 text-base font-black text-emerald-700">{t('seller.record_saved')}</h2>
    <p className="mt-1 text-base font-black text-emerald-700">{t('seller.successfully')}</p>
    <button
      type="button"
      onClick={onConfirm}
      className="mt-12 flex h-11 w-full items-center justify-center rounded-md bg-blue-700 text-sm font-black text-white shadow-sm transition-colors hover:bg-blue-800"
    >
      {t('seller.ok')}
    </button>
  </div>
);};

const ReviewHeader = ({ t }) => {
  return (
  <div className="space-y-2 bg-white p-4 rounded-[22px] border border-slate-200 shadow-sm">
    <h2 className="text-2xl font-bold tracking-tight text-indigo-700">{t('seller.review_record')}</h2>
    <p className="mt-1 text-sm text-indigo-500">{t('seller.review_record_desc')}</p>
  </div>
);};

const ErrorBanner = ({ error }) => {
  if (!error) return null;

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-medium text-orange-800 shadow-sm">
      <AlertCircle size={16} />
      <span>{error}</span>
    </div>
  );
};

const ShopDetailsSection = ({ shopName, mobile, shopAddress, landmark, shopType, t }) => {
  return (
  <section>
    <div className="space-y-3 rounded-[22px] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-5 text-base text-slate-800 shadow-sm">
      <h3 className="mb-3 text-base font-black uppercase tracking-[0.2em] text-indigo-600">{t('seller.shop_details')}</h3>
      <p>
        <span className="font-semibold text-slate-700">{t('seller.shop_name')}:</span>{' '}
        <span className="font-semibold">{shopName || '-'}</span>
      </p>
      <p><span className="font-semibold text-slate-700">{t('seller.mobile_number')}:</span> {mobile || '-'}</p>
      <p><span className="font-semibold text-slate-700">{t('seller.address')}:</span> {shopAddress || '-'}</p>
      {landmark && <p><span className="font-semibold text-slate-700">{t('seller.landmark')}:</span> {landmark}</p>}
      <p><span className="font-semibold text-slate-700">{t('seller.shop_type')}:</span> {t(`seller.${shopType.toLowerCase().replace(/\s+/g, '_')}`, { defaultValue: shopType })}</p>
    </div>
  </section>
);};

const ProductSummaryRow = ({ item, index }) => {
  const quantity = item.unit === 'weight'
    ? Number(item.weight) || 0
    : Number(item.quantity) || 0;
  const displayLabel = item.unit === 'weight' ? `${quantity} kg` : `${quantity} pcs`;
  const rate = Number(item.price) || 0;
  const amount = quantity * rate;

  return (
    <div
      key={`${item.productName || 'product'}-${item.id || item._id || item.productId || item.name || item.sku || index}`} className="flex items-center justify-between gap-4 text-base border-b border-slate-200 last:border-0 pb-3 last:pb-0">
      <span className="font-semibold text-indigo-700">{item.productName || '-'}</span>
      <span className="font-semibold text-slate-700">{displayLabel} x Rs.{rate} = Rs.{amount.toFixed(2)}</span>
    </div>
  );
};

const ProductsSection = ({ items, t }) => {
  return (
  <section>

    <div className="space-y-2 bg-white p-4 rounded-[22px] border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-black uppercase tracking-[0.2em] text-indigo-600">{t('seller.products')}</h3>
      </div>
      {(items || []).map((item, index) => (
        <ProductSummaryRow key={`${item.productName || 'product'}-${item.id || item._id || item.productId || item.name || item.sku || index}`} item={item} index={index} />
      ))}
    </div>
  </section>
);};

const AmountSummary = ({ totalAmount, payingAmount, pendingAmount, t }) => {
  return (
  <div className="rounded-[24px] border border-indigo-100 bg-white/95 p-5 pt-4 text-slate-900 shadow-lg shadow-indigo-100/40">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-base font-black uppercase tracking-[0.2em] text-indigo-600">{t('seller.total_amount')}</p>
      </div>
      <p className="text-3xl font-black text-indigo-700">{currencyFormatter.format(totalAmount)}</p>
    </div>
    <div className="mt-3 flex items-center justify-between rounded-2xl bg-indigo-50 px-4 py-3 text-sm text-slate-700">
      <span className="font-semibold">{t('seller.paying_amount')}</span>
      <span className="font-black text-indigo-700">{currencyFormatter.format(payingAmount)}</span>
    </div>
    <div className="mt-2 flex items-center justify-between rounded-2xl bg-rose-50 px-4 py-3 text-sm text-slate-700">
      <span className="font-semibold">{t('seller.pending_amount')}</span>
      <span className="font-black text-rose-600">{currencyFormatter.format(pendingAmount)}</span>
    </div>
  </div>
);};

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
  onRemovePhoto,
  t
}) => {
  return (
  <section className="space-y-4 border-t border-slate-200 pt-4">
    <h3 className="mb-2 text-base font-black uppercase tracking-[0.2em] text-indigo-600">{t('seller.payment_details')}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="paymentMethod" className="mb-1 block text-base font-semibold text-slate-700">{t('seller.payment_method')}</label>
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
          <option value="Cash">{t('seller.offline_cash', { defaultValue: 'Cash' })}</option>
          <option value="Online">{t('seller.online_upi')}</option>
        </select>
      </div>

      <div>
        <label htmlFor="payingAmount" className="mb-1 block text-base font-semibold text-slate-700">
          {paymentMethod === 'Cash' ? t('seller.cash_received_rs', { defaultValue: 'Cash Received (Rs)' }) : t('seller.paying_amount_rs')}
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
    </div>
    <div>
      <label htmlFor="review-pending-amount" className="mb-1 block text-base font-semibold text-slate-700">{t('seller.pending_amount_rs')}</label>
      <input
        id="review-pending-amount"
        type="text"
        value={currencyFormatter.format(pendingAmount)}
        readOnly
        className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-900 outline-none"
      />
    </div>

    {paymentMethod === 'Online' && scannerPhoto && (
      <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-gray-700">{t('seller.payment_proof')}</h4>
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
);};

const ScannerModal = ({
  open,
  scannerPhoto,
  defaultScannerPhoto,
  fileInputRef,
  onClose,
  onUseDefaultPhoto,
  onPhotoCapture,
  onChangePhoto,
  t
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

        <h3 className="mb-4 text-lg font-semibold text-gray-900">{t('seller.payment_proof_upload')}</h3>

        {!scannerPhoto ? (
          <div className="space-y-4">
            {defaultScannerPhoto ? (
              <div className="space-y-4">
                <div className="rounded border border-slate-300 bg-slate-50 p-3">
                  <p className="mb-3 text-xs font-semibold uppercase text-slate-600">{t('seller.managers_default_payment_receipt')}</p>
                  <img src={defaultScannerPhoto} alt="Manager payment receipt" className="max-h-48 w-full rounded object-contain border border-slate-200" />
                </div>

                <button
                  type="button"
                  onClick={onUseDefaultPhoto}
                  className="w-full rounded bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
                >
                  {t('seller.use_this_receipt')}
                </button>

                <div className="relative flex items-center gap-3">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="text-xs font-medium text-gray-500">{t('seller.or')}</span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600 mb-4">{t('seller.capture_photo_desc')}</p>
            )}

            <div className="flex flex-col gap-3">
              <label htmlFor="capture-proof-input" className="flex cursor-pointer items-center justify-center gap-2 rounded border-2 border-dashed border-blue-500 bg-blue-50 px-4 py-6 text-sm font-medium text-blue-600 hover:bg-blue-100 transition">
                <Camera size={18} />
                {t('seller.capture_your_own_proof')}
                <input
                  id="capture-proof-input"
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
              <p className="mb-2 text-xs font-semibold text-gray-600">{t('seller.payment_proof')}</p>
              <img src={scannerPhoto} alt="Payment Proof" className="max-w-full rounded border border-gray-200" />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onChangePhoto}
                className="flex-1 rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                {t('seller.change')}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
              >
                {t('seller.confirm')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ReviewSave = () => {
  const { t } = useTranslation();
  const { formData, setFormData, shopImageFile, setShopImageFile } = useOutletContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Local state for payment details, initialized from formData
  const [paymentMethod, setPaymentMethod] = useState(formData.paymentMethod === 'Offline' ? 'Cash' : (formData.paymentMethod || 'Cash'));
  const [payingAmount, setPayingAmount] = useState(formData.paidAmount || "");
  const [paymentStatus, setPaymentStatus] = useState(formData.paymentStatus || 'Pending');
  const [error, setError] = useState('');

  // Scanner modal states
  const [showScanner, setShowScanner] = useState(false);
  const [scannerPhoto, setScannerPhoto] = useState(null);
  const scannerPhotoFileRef = useRef(null);
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
      scannerPhotoFileRef.current = file;
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
  scannerPhotoFileRef.current = null;
  setDefaultScannerPhoto(null);

  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }
};

  const handleSave = async () => {
    setLoading(true);
    setError('');

    if (paymentMethod === 'Online' && (!scannerPhoto || (typeof scannerPhoto === 'string' && scannerPhoto.trim() === ''))) {
      setError(t('seller.please_capture_payment_proof'));
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

      const formDataPayload = new FormData();
      formDataPayload.append('shopName', shopName?.trim() || '');
      formDataPayload.append('mobile', mobile || '');
      formDataPayload.append('shopAddress', shopAddress?.trim() || '');
      formDataPayload.append('landmark', landmark || '');
      formDataPayload.append('shopType', shopType);
      formDataPayload.append('latitude', latitude ?? '');
      formDataPayload.append('longitude', longitude ?? '');
      formDataPayload.append('items', JSON.stringify(salesItems));
      formDataPayload.append('paymentMethod', paymentMethod);
      formDataPayload.append('paidAmount', Number(payingAmount) || 0);
      formDataPayload.append('pendingAmount', Number(pendingAmount) || 0);
      formDataPayload.append('paymentStatus', paymentStatus);

      if (shopImageFile) {
        formDataPayload.append('shopImage', shopImageFile);
      } else if (typeof shopImage === 'string' && shopImage.startsWith('data:')) {
        formDataPayload.append('shopImage', shopImage);
      }

      if (scannerPhotoFileRef.current) {
        formDataPayload.append('scannerPhoto', scannerPhotoFileRef.current);
      } else if (typeof scannerPhoto === 'string' && scannerPhoto.trim()) {
        formDataPayload.append('scannerPhoto', scannerPhoto);
      }

      await API.post('/sales/record', formDataPayload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      sessionStorage.removeItem('sellFormData');
      setFormData(prev => ({ ...prev, shopName: '', shopAddress: '', landmark: '', shopType: 'Retail', latitude: null, longitude: null, items: [{ productName: '', quantity: 1, rate: '' }], paymentMethod: 'None', paidAmount: 0, paymentStatus: 'Pending', shopImage: null }));
      setShopImageFile(null);
      setSuccess(true);
      setShowScanner(false);
      setScannerPhoto(null);
    } catch (err) {
      console.error(err);
      if (err.response?.data?.errors) {
        const messages = err.response.data.errors.map(e => e.msg).join(' | ');
        setError(messages);
      } else {
        setError(err.response?.data?.message || t('seller.record_save_failed_retry'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return <SuccessState onConfirm={() => navigate('/dashboard')} t={t} />;
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-4 sm:p-6 rounded-[28px] shadow-sm ring-1 ring-slate-200 space-y-6">
      <ReviewHeader t={t} />
      <ErrorBanner error={error} />
      <ShopDetailsSection
        shopName={shopName}
        mobile={mobile}
        shopAddress={shopAddress}
        landmark={landmark}
        shopType={shopType}
        t={t}
      />

      <ProductsSection items={items} t={t} />

      <AmountSummary
        totalAmount={totalAmount}
        payingAmount={payingAmount}
        pendingAmount={pendingAmount}
        t={t}
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
        t={t}
      />

      <button
        type="button"
        onClick={handleSave}
        disabled={loading}
        className="w-full rounded-2xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200/40 transition duration-200 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-75 mt-4"
      >
        {loading ? t('seller.saving') : t('seller.save_record')}
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
        t={t}
      />
    </div>
  );
};

export default ReviewSave;