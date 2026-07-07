import React, {
  useState,
  useEffect,
  useRef,
} from 'react';

import {
  Outlet,
  useOutletContext,
} from 'react-router-dom';

const SELL_FORM_STORAGE_KEY =
  'sellFormData:v1';

const createInitialFormData = () => ({
  shopName: '',
  shopAddress: '',
  landmark: '',
  shopType: 'Retail',
  latitude: null,
  longitude: null,

  items: [
    {
      productName: '',
      unit: 'quantity',
      quantity: '',
      weight: '',
      price: '',
    },
  ],

  paymentMethod: 'Offline',
  paidAmount: 0,
  paymentStatus: 'Pending',
  shopImage: null,
});

const StartSelling = () => {
  const parentContext =
    useOutletContext();

  const [shopImageFile, setShopImageFile] = useState(null);

  const [formData, setFormData] =
    useState(() => {
      const savedFormData =
        sessionStorage.getItem(
          SELL_FORM_STORAGE_KEY
        );

      if (savedFormData) {
        try {
          const parsed =
            JSON.parse(savedFormData);

          // Sanitize stale quantity defaults
          // from previously saved form data.
          if (Array.isArray(parsed.items)) {
            parsed.items =
              parsed.items.map((item) => ({
                ...item,

                quantity:
                  item.quantity === 1 &&
                  !item.productName
                    ? ''
                    : item.quantity,
              }));
          }

          return parsed;
        } catch (error) {
          console.error(
            'Failed to parse sellFormData from sessionStorage',
            error
          );

          sessionStorage.removeItem(
            SELL_FORM_STORAGE_KEY
          );
        }
      }

      return createInitialFormData();
    });

  useEffect(() => {
    sessionStorage.setItem(
      SELL_FORM_STORAGE_KEY,
      JSON.stringify(formData)
    );
  }, [formData]);

  return (
    <Outlet
      context={{
        formData,
        setFormData,
        shopImageFile,
        setShopImageFile,
        lang: parentContext?.lang || 'en'
      }}
    />
  );
};

export default StartSelling;

