import React, { useState, useEffect } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';

const StartSelling = () => {
  const parentContext = useOutletContext();
  const [formData, setFormData] = useState(() => {
    const savedFormData = sessionStorage.getItem('sellFormData');
    if (savedFormData) {
      try {
        return JSON.parse(savedFormData);
      } catch (e) {
        console.error("Failed to parse sellFormData from sessionStorage", e);
        sessionStorage.removeItem('sellFormData'); // Clear corrupted data
      }
    }
    return {
      shopName: '',
      shopAddress: '',
      landmark: '',
      shopType: 'Retail',
      latitude: null,
      longitude: null,
      items: [{ productName: '', quantity: 1, rate: '' }],
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
