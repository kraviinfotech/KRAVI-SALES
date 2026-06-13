import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import API from '../api/axios';

const translations = {
  en: { title: "Add Products", pName: "Product Name", qty: "Quantity (pcs)", weight: "Weight (kg)", price: "Price per Unit", rate: "Rate", amt: "Amount", add: "Add More Product", next: "Next", unit: "Unit Type", qtyBtn: "By Quantity", weightBtn: "By Weight" },
  hi: { title: "उत्पाद जोड़ें", pName: "उत्पाद का नाम", qty: "मात्रा (पीसीएस)", weight: "वजन (किग्रा)", price: "प्रति यूनिट कीमत", rate: "दर", amt: "कुल राशि", add: "और उत्पाद जोड़ें", next: "अगला", unit: "यूनिट प्रकार", qtyBtn: "मात्रा के अनुसार", weightBtn: "वजन के अनुसार" },
  mr: { title: "उत्पादने जोडा", pName: "उत्पादनाचे नाव", qty: "प्रमाण (पीसीएस)", weight: "वजन (किग्रा)", price: "प्रति युनिट किंमत", rate: "दर", amt: "एकूण रक्कम", add: "अधिक उत्पादन जोडा", next: "पुढील", unit: "युनिट प्रकार", qtyBtn: "प्रमाण अनुसार", weightBtn: "वजन अनुसार" }
};

const emptyItem = { productName: '', unit: 'quantity', quantity: 1, weight: '', price: '' };

const AddProducts = () => {
  const { formData, setFormData, lang } = useOutletContext();
  const t = translations[lang || 'en'];
  const navigate = useNavigate();
  const [suggestedProducts, setSuggestedProducts] = useState(['Surf Excel', 'Maggi', 'Parle-G', 'Britannia Biscuits', 'Soap', 'Shampoo']);
  const [masterList, setMasterList] = useState([]);

  useEffect(() => {
    const fetchAllSuggestions = async () => {
      try {
        // 1. Master List from Manager
        const masterRes = await API.get('/products');
        setMasterList(masterRes.data);
        const masterNames = masterRes.data.map(p => p.name);

        // 2. Seller's own history
        const historyRes = await API.get('/sales/my-records');
        
        const names = new Set(['Surf Excel', 'Maggi', 'Parle-G', 'Britannia Biscuits', 'Soap', 'Shampoo']);
        masterNames.forEach(n => names.add(n));
        historyRes.data.forEach(record => record.items?.forEach(item => names.add(item.productName)));
        setSuggestedProducts(Array.from(names));
      } catch (err) {
        console.error("Failed to fetch product history", err);
      }
    };
    fetchAllSuggestions();
  }, []);

  // Ensure formData.items is initialized and has required fields
  useEffect(() => {
    if (!formData.items || formData.items.length === 0) {
      setFormData(prev => ({ ...prev, items: [emptyItem] }));
    } else {
      // Normalize items that might be missing unit or using rate instead of price
      const needsNormalization = formData.items.some(item => !item.unit || (item.rate && !item.price));
      if (needsNormalization) {
        setFormData(prev => ({
          ...prev,
          items: prev.items.map(item => ({
            ...emptyItem,
            ...item,
            unit: item.unit || 'quantity',
            price: item.price || item.rate || ''
          }))
        }));
      }
    }
  }, [formData.items, setFormData]);

  const handleItemChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item)
    }));
  };

  const handleAddMore = () => {
    setFormData(prev => ({ ...prev, items: [...prev.items, { ...emptyItem }] }));
  };

  const handleRemove = (index) => {
    setFormData(prev => ({ ...prev, items: prev.items.filter((_, itemIndex) => itemIndex !== index) }));
  };

  const handleNext = (event) => {
    event.preventDefault();

    const validItems = formData.items
      .map((item) => ({
        ...item,
        productName: item.productName.trim(),
        unit: item.unit,
        price: Number(item.price),
        quantity: item.unit === 'quantity' ? Number(item.quantity || 0) : 1,
        weight: item.unit === 'weight' ? Number(item.weight || 0) : 0
      }))
      .filter((item) => {
        const hasValidName = item.productName;
        const hasValidQuantity = item.unit === 'quantity' ? item.quantity > 0 : true;
        const hasValidWeight = item.unit === 'weight' ? item.weight > 0 : true;
        const hasValidPrice = item.price > 0;
        return hasValidName && hasValidQuantity && hasValidWeight && hasValidPrice;
      });

    if (!validItems.length) {
      alert('Please add at least one product with all required fields.');
      return;
    }
    // Update formData with validated items
    setFormData(prev => ({ ...prev, items: validItems }));

    navigate('/sell/review');
  };

  return (
    <form onSubmit={handleNext} className="space-y-4 max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold mb-4">{t.title}</h2>
      {(formData.items || []).map((item, index) => {
        const price = Number(item.price || item.rate || 0);
        const amount = item.unit === 'quantity'
          ? (Number(item.quantity) || 0) * price
          : (Number(item.weight) || 0) * price;

        return (
          <div key={index} className="space-y-4 rounded border border-gray-200 bg-gray-50 p-4">
            {formData.items.length > 1 && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Product {index + 1}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="flex h-8 w-8 items-center justify-center rounded text-gray-500 hover:bg-red-50 hover:text-red-600"
                  aria-label="Remove product"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">{t.pName}</label>
              <input
                type="text"
                list={`suggestions-${index}`}
                value={item.productName || ''}
                onChange={(event) => handleItemChange(index, 'productName', event.target.value)}
                placeholder="Select or Type..."
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
              <datalist id={`suggestions-${index}`}>
                {masterList.map(p => (
                  <option key={p._id} value={p.name} />
                ))}
              </datalist>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">{t.unit}</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleItemChange(index, 'unit', 'quantity')}
                  className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                    item.unit === 'quantity'
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t.qtyBtn}
                </button>
                <button
                  type="button"
                  onClick={() => handleItemChange(index, 'unit', 'weight')}
                  className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                    item.unit === 'weight'
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t.weightBtn}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {item.unit === 'quantity' && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">{t.qty}</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity || 1}
                    onChange={(event) => handleItemChange(index, 'quantity', event.target.value)}
                    placeholder="5"
                    className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
              )}

              {item.unit === 'weight' && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">{t.weight}</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={item.weight || ''}
                    onChange={(event) => handleItemChange(index, 'weight', event.target.value)}
                    placeholder="2.5"
                    className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t.price}</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.price || item.rate || ''}
                  onChange={(event) => handleItemChange(index, 'price', event.target.value)}
                  placeholder="120"
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">{t.amt}</label>
              <input
                type="text"
                value={amount ? amount.toFixed(0) : ''}
                readOnly
                placeholder="600"
                className="w-full rounded border border-gray-300 bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900 outline-none"
              />
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={handleAddMore}
        className="inline-flex items-center gap-2 rounded px-2 py-1 text-sm font-medium text-primary hover:text-primary-dark"
      >
        <Plus size={18} />
        {t.add}
      </button>

      <button
        type="submit"
        className="mt-4 w-full rounded bg-primary py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
      >
        {t.next}
      </button>

    </form>
  );
};

export default AddProducts;
