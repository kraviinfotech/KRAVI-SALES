import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

const translations = {
  en: { title: "Add Shop Details", name: "Shop Name", addr: "Address", land: "Landmark (Optional)", type: "Shop Type", next: "Next" },
  hi: { title: "दुकान का विवरण जोड़ें", name: "दुकान का नाम", addr: "पता", land: "लैंडमार्क (वैकल्पिक)", type: "दुकान का प्रकार", next: "अगला" },
  mr: { title: "दुकानाचे तपशील जोडा", name: "दुकानाचे नाव", addr: "पत्ता", land: "लँडमार्क (पर्यायी)", type: "दुकानाचे प्रकार", next: "पुढील" }
};

const AddShop = () => {
  const { formData, setFormData, lang } = useOutletContext();
  const t = translations[lang || 'en'];
  const navigate = useNavigate();

  const [shopName, setShopName] = useState(formData.shopName);
  const [shopAddress, setShopAddress] = useState(formData.shopAddress);
  const [landmark, setLandmark] = useState(formData.landmark);
  const [shopType, setShopType] = useState(formData.shopType || 'Retail');
  const [coords, setCoords] = useState({ lat: formData.latitude, lng: formData.longitude });
  const [locError, setLocError] = useState('');

  const captureLocation = () => {
    setLocError('');
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by your browser.');
      setCoords({ lat: 28.6139, lng: 77.209 });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        if (error.code === 1) {
          setLocError('Location access is blocked. Please enable it in browser settings (click the lock/tune icon in URL bar) to capture accurate shop coordinates.');
        } else {
          setLocError('Unable to retrieve your location. Using default coordinates.');
        }
        setCoords({ lat: 28.6139, lng: 77.209 });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    if (!coords.lat || !coords.lng) {
      captureLocation();
    }
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();

    const latitude = coords.lat || 28.6139;
    const longitude = coords.lng || 77.209;

    setFormData((prev) => ({
      ...prev,
      shopName,
      shopAddress,
      landmark,
      shopType,
      latitude,
      longitude
    }));

    navigate('/sell/products');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold mb-4">{t.title}</h2>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">{t.name}</label>
        <input
          type="text"
          value={shopName}
          onChange={(event) => setShopName(event.target.value)}
          placeholder="Gupta Store"
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">{t.addr}</label>
        <textarea
          value={shopAddress}
          onChange={(event) => setShopAddress(event.target.value)}
          placeholder="MG Road, Indore"
          rows="2"
          className="w-full resize-none rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">{t.land}</label>
        <input
          type="text"
          value={landmark}
          onChange={(event) => setLandmark(event.target.value)}
          placeholder="Near SBI Bank"
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">{t.type}</label>
        <select
          value={shopType}
          onChange={(event) => setShopType(event.target.value)}
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          required
        >
          <option value="Retail">General Store</option>
          <option value="Wholesale">Wholesale</option>
          <option value="Distributor">Distributor</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <button
        type="submit"
        className="mt-4 w-full rounded bg-primary py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
      >
        {t.next}
      </button> 
    </form>
  );
};

export default AddShop;
