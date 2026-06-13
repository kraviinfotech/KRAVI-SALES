import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Camera, X } from 'lucide-react';

const translations = {
  en: {
    title: "Add Shop Details",
    name: "Shop Name",
    mobile: "Mobile Number",
    addr: "Address",
    land: "Landmark (Optional)",
    type: "Shop Type",
    img: "Shop Image",
    upload: "Upload/Capture",
    next: "Next"
  },
  hi: {
    title: "दुकान का विवरण जोड़ें",
    name: "दुकान का नाम",
    mobile: "मोबाइल नंबर ",
    addr: "पता",
    land: "लैंडमार्क (वैकल्पिक)",
    type: "दुकान का प्रकार",
    img: "दुकान की फोटो",
    upload: "फोटो लें/अपलोड",
    next: "अगला"
  },
  mr: {
    title: "दुकानाचे तपशील जोडा",
    name: "दुकानाचे नाव",
    mobile: "मोबाइल नंबर",
    addr: "पत्ता",
    land: "लँडमार्क (पर्यायी)",
    type: "दुकानाचे प्रकार",
    img: "दुकानाची फोटो",
    upload: "फोटो घ्या/अपलोड",
    next: "पुढील"
  }
};

const AddShop = () => {
  const { formData, setFormData, lang } = useOutletContext();
  const t = translations[lang || 'en'];
  const navigate = useNavigate();

  const [shopName, setShopName] = useState(formData.shopName || '');
  const [mobile, setMobile] = useState(formData.mobile || '');

  const [shopAddress, setShopAddress] = useState(formData.shopAddress || '');
  const [landmark, setLandmark] = useState(formData.landmark || '');
  const [shopType, setShopType] = useState(formData.shopType || 'Retail');

  const [shopImage, setShopImage] = useState(formData.shopImage || null);
  const [imagePreview, setImagePreview] = useState(null);

  const [coords, setCoords] = useState({
    lat: formData.latitude || '',
    lng: formData.longitude || ''
  });

  const [locationUrl, setLocationUrl] = useState(
    formData.locationUrl || ''
  );

  const [locError, setLocError] = useState('');

  const captureLocation = () => {
    setLocError('');

    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setCoords({
          lat,
          lng
        });

        const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

        setLocationUrl(mapsUrl);
      },
      (error) => {
        if (error.code === 1) {
          setLocError(
            'Location access is blocked. Please enable location permission.'
          );
        } else {
          setLocError('Unable to retrieve your location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setShopImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setShopImage(null);
    setImagePreview(null);
  };

  useEffect(() => {
    if (!coords.lat || !coords.lng) {
      captureLocation();
    }
  }, []);

  useEffect(() => {
    if (shopImage && shopImage instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(shopImage);
    }
  }, [shopImage]);

  const handleSubmit = (event) => {
    event.preventDefault();

    setFormData((prev) => ({
      ...prev,
      shopName,
      mobile,
      shopAddress,
      landmark,
      shopType,
      shopImage,
      latitude: coords.lat,
      longitude: coords.lng,
      locationUrl
    }));

    navigate('/sell/products');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm border border-gray-200"
    >
      <h2 className="text-xl font-bold mb-4">{t.title}</h2>


      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {t.name}
        </label>
        <input
          type="text"
          value={shopName}
          onChange={(e) => setShopName(e.target.value)}
          placeholder="Gupta Store"
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          required
        />
      </div>


      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {t.mobile}
        </label>

        <input
          type="tel"
          value={mobile}
          onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
          placeholder="1234567890"
          maxLength={10}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          required
        />
      </div>

      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {t.addr}
        </label>
        <textarea
          value={shopAddress}
          onChange={(e) => setShopAddress(e.target.value)}
          placeholder="MG Road, Indore"
          rows="3"
          className="w-full resize-none rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          required
        />
      </div>



      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {t.land}
        </label>
        <input
          type="text"
          value={landmark}
          onChange={(e) => setLandmark(e.target.value)}
          placeholder="Near SBI Bank"
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {t.type}
        </label>
        <select
          value={shopType}
          onChange={(e) => setShopType(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          required
        >
          <option value="Retail">General Store</option>
          <option value="Wholesale">Wholesale</option>
          <option value="Distributor">Distributor</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Location Section */}
      <div>


        <label className="mb-1 block text-sm font-medium text-gray-700">
          Location URL
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">





          <input
            type="text"
            value={locationUrl}
            readOnly
            placeholder="Location URL will appear here"
            className="w-full rounded border border-gray-300 bg-gray-200 px-3 py-2 text-sm text-gray-500np cursor-not-allowed"
          />
          <button
            type="button"
            onClick={captureLocation}
            className="w-full rounded bg-gray-600 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Capture Current Location
          </button>



        </div>
        <div>
          {locationUrl && (
            <a
              href={locationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block text-sm text-blue-600 underline"
            >
              Open Location in Google Maps
            </a>
          )}

          {locError && (
            <p className="mt-2 text-sm text-red-500">
              {locError}
            </p>
          )}
        </div>

      </div>
      <div className="flex flex-col">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {t.img}
        </label>
        <div className="flex-1 min-h-[88px] relative border-2 border-dashed border-gray-300 rounded bg-gray-50 flex items-center justify-center overflow-hidden">
          {imagePreview ? (
            <div className="relative w-full h-full">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center text-gray-400 hover:text-primary transition-colors">
              <Camera size={24} />
              <span className="text-[10px] mt-1 uppercase font-bold">{t.upload}</span>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="mt-4 w-full rounded bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        {t.next}
      </button>
    </form>
  );
};

export default AddShop;