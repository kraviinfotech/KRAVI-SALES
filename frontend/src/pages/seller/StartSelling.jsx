import React, { useState, useEffect } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';

const StartSelling = () => {
  const parentContext = useOutletContext();
  const [formData, setFormData] = useState(() => {
    const savedFormData = sessionStorage.getItem('sellFormData');
    if (savedFormData) {
      try {
        const parsed = JSON.parse(savedFormData);
        // Sanitize: clear stale quantity=1 defaults from old cached data
        if (parsed.items) {
          parsed.items = parsed.items.map(item => ({
            ...item,
            quantity: (item.quantity === 1 && !item.productName) ? '' : item.quantity
          }));
        }
        return parsed;
      } catch (e) {
        console.error("Failed to parse sellFormData from sessionStorage", e);
        sessionStorage.removeItem('sellFormData');
      }
    }
    return {
      shopName: '',
      shopAddress: '',
      landmark: '',
      shopType: 'Retail',
      latitude: null,
      longitude: null,
      items: [{ productName: '', unit: 'quantity', quantity: '', weight: '', price: '' }],
      paymentMethod: 'Offline',
      paidAmount: 0,
      paymentStatus: 'Pending', // Default payment status
      shopImage: null,
    };
  });

  useEffect(() => {
    sessionStorage.setItem('sellFormData', JSON.stringify(formData));
  }, [formData]);

  return <Outlet context={{ formData, setFormData, lang: parentContext?.lang || 'en' }} />;
};

export default StartSelling;
