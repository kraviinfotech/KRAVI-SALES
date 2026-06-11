import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import API from '../api/axios';

const translations = {
  en: { title: "Add Products", cat: "Category", pName: "Product Name", qty: "Quantity", rate: "Rate", amt: "Amount", add: "Add More Product", next: "Next" },
  hi: { title: "उत्पाद जोड़ें", cat: "श्रेणी", pName: "उत्पाद का नाम", qty: "मात्रा", rate: "दर", amt: "कुल राशि", add: "और उत्पाद जोड़ें", next: "अगला" },
  mr: { title: "उत्पादने जोडा", cat: "वर्ग", pName: "उत्पादनाचे नाव", qty: "प्रमाण", rate: "दर", amt: "एकूण रक्कम", add: "अधिक उत्पादन जोडा", next: "पुढील" }
};

const emptyItem = { category: '', productName: '', quantity: 1, rate: '' };

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
        
        const names = new Set(suggestedProducts);
        masterNames.forEach(n => names.add(n));
        historyRes.data.forEach(record => record.items?.forEach(item => names.add(item.productName)));
        setSuggestedProducts(Array.from(names));
      } catch (err) {
        console.error("Failed to fetch product history", err);
      }
    };
    fetchAllSuggestions();
  }, []);

  // Ensure formData.items is initialized if empty
  useEffect(() => {
    if (!formData.items || formData.items.length === 0) {
      setFormData(prev => ({ ...prev, items: [emptyItem] }));
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
        productName: item.productName.trim(),
        quantity: Number(item.quantity),
        rate: Number(item.rate)
      }))
      .filter((item) => item.productName && item.quantity > 0 && item.rate > 0);

    if (!validItems.length) {
      alert('Please add at least one product.');
      return;
    }
    // Update formData with validated items (this might be redundant if handleItemChange already updates it)
    setFormData(prev => ({ ...prev, items: validItems }));

    navigate('/sell/review');
  };

  return (
    <form onSubmit={handleNext} className="space-y-4 max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold mb-4">{t.title}</h2>
      {(formData.items || []).map((item, index) => {
        const amount = (Number(item.quantity) || 0) * (Number(item.rate) || 0);

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t.cat}</label>
                <select
                  value={item.category}
                  onChange={(event) => handleItemChange(index, 'category', event.target.value)}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                >
                  <option value="">Select Category</option>
                  {Array.from(new Set((masterList || []).map(p => p.category))).filter(Boolean).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t.pName}</label>
                <input
                  type="text"
                  list={`suggestions-${index}`}
                  value={item.productName}
                  onChange={(event) => handleItemChange(index, 'productName', event.target.value)}
                  placeholder="Select or Type..."
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
                <datalist id={`suggestions-${index}`}>
                  {masterList
                    .filter(p => !item.category || p.category === item.category)
                    .map(p => (
                      <option key={p._id} value={p.name} />
                    ))}
                </datalist>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t.qty}</label>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(event) => handleItemChange(index, 'quantity', event.target.value)}
                  placeholder="5"
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t.rate}</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.rate}
                  onChange={(event) => handleItemChange(index, 'rate', event.target.value)}
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
