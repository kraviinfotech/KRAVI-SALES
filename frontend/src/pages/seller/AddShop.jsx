import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
  useSyncExternalStore,
} from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Camera, CheckCircle2, MapPin, X } from 'lucide-react';

const inputCls = 'w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200 transition';
const labelCls = 'mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500';

const emptyLocationSnapshot = {
  coords: { lat: '', lng: '' },
  locationUrl: '',
  error: '',
  loading: false,
  capturedAt: 0,
};

let locationSnapshot = emptyLocationSnapshot;
const locationListeners = new Set();

const getLocationSnapshot = () => locationSnapshot;
const getServerLocationSnapshot = () => emptyLocationSnapshot;

const emitLocationChange = () => {
  locationListeners.forEach((listener) => listener());
};

const setLocationSnapshot = (nextSnapshot) => {
  locationSnapshot = {
    ...locationSnapshot,
    ...nextSnapshot,
    coords: nextSnapshot.coords || locationSnapshot.coords,
  };
  emitLocationChange();
};

const subscribeToLocation = (listener) => {
  locationListeners.add(listener);
  return () => locationListeners.delete(listener);
};

const captureCurrentLocation = () => {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    setLocationSnapshot({
      error: 'Geolocation not supported.',
      loading: false,
      capturedAt: Date.now(),
    });
    return;
  }

  setLocationSnapshot({
    error: '',
    loading: true,
  });

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      setLocationSnapshot({
        coords: { lat, lng },
        locationUrl: `https://www.google.com/maps?q=${lat},${lng}`,
        error: '',
        loading: false,
        capturedAt: Date.now(),
      });
    },
    (err) => {
      setLocationSnapshot({
        error: err.code === 1 ? 'Location permission blocked.' : 'Unable to get location.',
        loading: false,
        capturedAt: Date.now(),
      });
    },
    { enableHighAccuracy: true, timeout: 100000, maximumAge: 0 }
  );
};

const useCurrentLocation = (autoCapture, minCapturedAt) => {
  const subscribe = useCallback((listener) => {
    const unsubscribe = subscribeToLocation(listener);

    if (
      autoCapture &&
      !locationSnapshot.loading &&
      locationSnapshot.capturedAt <= minCapturedAt
    ) {
      captureCurrentLocation();
    }

    return unsubscribe;
  }, [autoCapture, minCapturedAt]);

  return useSyncExternalStore(
    subscribe,
    getLocationSnapshot,
    getServerLocationSnapshot
  );
};

const AddShop = () => {
  const { formData, setFormData, shopImageFile, setShopImageFile } = useOutletContext();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [shopName, setShopName] = useState(formData.shopName || '');
  const [mobile, setMobile] = useState(formData.mobile || '');
  const [shopAddress, setShopAddress] = useState(formData.shopAddress || '');
  const [landmark, setLandmark] = useState(formData.landmark || '');
  const [shopType, setShopType] = useState(formData.shopType || 'Retail');
  const [imagePreview, setImagePreview] = useState(
    typeof formData.shopImage === 'string' ? formData.shopImage : null
  );

  const [initialLocationCapturedAt] = useState(() => locationSnapshot.capturedAt);
  const savedCoords = useMemo(() => ({
    lat: formData.latitude ?? '',
    lng: formData.longitude ?? '',
  }), [formData.latitude, formData.longitude]);

  const hasSavedLocation = savedCoords.lat !== '' && savedCoords.lng !== '';

  const savedLocationUrl = useMemo(() => {
    if (formData.locationUrl) return formData.locationUrl;
    if (hasSavedLocation) {
      return `https://www.google.com/maps?q=${savedCoords.lat},${savedCoords.lng}`;
    }
    return '';
  }, [formData.locationUrl, hasSavedLocation, savedCoords.lat, savedCoords.lng]);

  const currentLocation = useCurrentLocation(!hasSavedLocation, initialLocationCapturedAt);
  const hasFreshLocation = currentLocation.capturedAt > initialLocationCapturedAt;
  const hasCapturedCoords =
    hasFreshLocation &&
    currentLocation.coords.lat !== '' &&
    currentLocation.coords.lng !== '';

  const coords = hasCapturedCoords ? currentLocation.coords : savedCoords;
  const locationUrl = hasCapturedCoords ? currentLocation.locationUrl : savedLocationUrl;
  const locError = hasFreshLocation || currentLocation.loading ? currentLocation.error : '';
  const locLoading = currentLocation.loading;
  const captureLocation = captureCurrentLocation;

  /* ── image handling ── */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setShopImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setShopImageFile(null);
    setImagePreview(null);
  };

  /* ── submit ── */
  const handleSubmit = (e) => {
    e.preventDefault();
    setFormData(prev => ({
      ...prev, shopName, mobile, shopAddress, landmark, shopType,
      shopImage: imagePreview, latitude: coords.lat, longitude: coords.lng, locationUrl
    }));
    navigate('/sell/products');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-base font-black text-slate-900">{t('seller.shop_details')}</h2>

        {/* Shop Name */}
        <div className="mb-3">
          <label htmlFor="shop-name" className={labelCls}>{t('seller.shop_name')}</label>
          <input id="shop-name" type="text" value={shopName} onChange={e => setShopName(e.target.value)}
            placeholder={t('seller.gupta_store')} className={inputCls} required />
        </div>

        {/* Mobile */}
        <div className="mb-3">
          <label htmlFor="shop-mobile" className={labelCls}>{t('seller.mobile_number')}</label>
          <input id="shop-mobile" type="tel" value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, ''))}
            placeholder="9876543210" maxLength={10} className={inputCls} required />
        </div>

        {/* Address */}
        <div className="mb-3">
          <label htmlFor="shop-address" className={labelCls}>{t('seller.address')}</label>
          <textarea id="shop-address" value={shopAddress} onChange={e => setShopAddress(e.target.value)}
            placeholder={t('seller.mg_road_indore')} rows={2}
            className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200 transition" required />
        </div>

        {/* Landmark + Shop Type side by side */}
        <div className="mb-3 grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="shop-landmark" className={labelCls}>{t('seller.landmark')}</label>
            <input id="shop-landmark" type="text" value={landmark} onChange={e => setLandmark(e.target.value)}
              placeholder={t('seller.near_sbi_bank')} className={inputCls} />
          </div>
          <div>
            <label htmlFor="shop-type" className={labelCls}>{t('seller.shop_type')}</label>
            <select id="shop-type" value={shopType} onChange={e => setShopType(e.target.value)} className={inputCls} required>
              <option value="Retail">{t('seller.general_store')}</option>
              <option value="Wholesale">{t('seller.wholesale')}</option>
              <option value="Distributor">{t('seller.distributor')}</option>
              <option value="Other">{t('seller.other')}</option>
            </select>
          </div>
        </div>

        {/* Location */}
        <div className="mb-3">
          <label htmlFor="shop-location" className={labelCls}>{t('seller.location')}</label>
          <div className="flex gap-2">
            <input id="shop-location" type="text" value={locationUrl} readOnly
              placeholder={t('seller.location_url_placeholder')}
              className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs text-gray-500 cursor-not-allowed" />
            <button type="button" onClick={captureLocation} disabled={locLoading}
              className="flex items-center gap-1 rounded-lg bg-slate-700 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800 transition disabled:opacity-60 shrink-0">
              <MapPin size={13} />
              {locLoading ? t('seller.getting') : locationUrl ? t('seller.refresh') : t('seller.capture')}
            </button>
          </div>
          {locationUrl && (
            <a href={locationUrl} target="_blank" rel="noopener noreferrer"
              className="mt-1 block text-xs text-blue-600 underline">{t('seller.open_in_google_maps')}</a>
          )}
          {locError && <p className="mt-1 text-xs text-red-500">{t(`seller.${locError.replace(/\s+/g, '_').toLowerCase()}`, { defaultValue: locError })}</p>}
        </div>

        {/* Shop Image — compact preview */}
        <div>
          <label htmlFor="image-upload" className={labelCls}>{t('seller.shop_image')}</label>

          <div className="flex items-center gap-3">
            {/* Camera Trigger */}
            <label
              htmlFor="image-upload"
              className="flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 text-blue-500 hover:bg-blue-100 transition overflow-hidden"
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt={t('seller.shop_preview')}
                  className="h-full w-full object-cover rounded-xl"
                />
              ) : (
                <Camera size={22} />
              )}

              <input
                id="image-upload"
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
            
            {imagePreview && (
              <button
                type="button"
                onClick={removeImage}
                className="rounded-lg bg-red-50 p-2 text-red-500 hover:bg-red-100 transition"
                aria-label={t('seller.remove_image')}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
      
      <button
        type="submit"
        className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition"
      >
        {t('seller.next_add_products')}
      </button>
    </form>
  );
};

export default AddShop;