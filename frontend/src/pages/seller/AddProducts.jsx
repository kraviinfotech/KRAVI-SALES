import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Plus, X, ChevronDown } from 'lucide-react';
import API from '../../api/axios';

const translations = {
  en: { title: "Add Products", pName: "Product Name", qty: "Quantity (pcs)", weight: "Weight (kg)", price: "Price per Unit", rate: "Rate", amt: "Amount", add: "Add More Product", next: "Next", unit: "Unit Type", qtyBtn: "By Quantity", weightBtn: "By Weight" },
  hi: { title: "उत्पाद जोड़ें", pName: "उत्पाद का नाम", qty: "मात्रा (पीसीएस)", weight: "वजन (किग्रा)", price: "प्रति यूनिट कीमत", rate: "दर", amt: "कुल राशि", add: "और उत्पाद जोड़ें", next: "अगला", unit: "यूनिट प्रकार", qtyBtn: "मात्रा के अनुसार", weightBtn: "वजन के अनुसार" },
  mr: { title: "उत्पादने जोडा", pName: "उत्पादनाचे नाव", qty: "प्रमाण (पीसीएस)", weight: "वजन (किग्रा)", price: "प्रति युनिट किंमत", rate: "दर", amt: "एकूण रक्कम", add: "अधिक उत्पादन जोडा", next: "पुढील", unit: "युनिट प्रकार", qtyBtn: "प्रमाण अनुसार", weightBtn: "वजन अनुसार" }
};

const emptyItem = { productName: '', unit: 'quantity', quantity: '', weight: '', price: '' };

const ProductCard = ({
  item,
  index,
  totalItems,
  isLast,
  lastCardRef,
  wrapperRefs,
  t,
  amount,
  suggestionsOpen,
  searchQuery,
  filteredProducts,
  onSearchInput,
  onOpenSuggestions,
  onToggleSuggestions,
  onProductSelection,
  onUnitChange,
  onItemChange,
  onRemove
}) => (
  <div
    key={item.productName ? `${item.productName}-${index}` : `item-${index}`}
    ref={isLast ? lastCardRef : null}
    className="space-y-4 rounded border border-gray-200 bg-gray-50 p-4"
  >
    {totalItems > 1 && (
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">Product {index + 1}</span>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="flex h-8 w-8 items-center justify-center rounded text-gray-500 hover:bg-red-50 hover:text-red-600"
          aria-label="Remove product"
        >
          <X size={18} />
        </button>
      </div>
    )}

    <div className="relative" ref={el => wrapperRefs.current[index] = el}>
      <label className="mb-1 block text-sm font-medium text-gray-700">{t.pName}</label>
      <div className="relative">
        <div className="flex rounded-md border border-gray-300 bg-white focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
          <input
            value={searchQuery}
            onChange={(event) => onSearchInput(index, event.target.value)}
            onFocus={() => onOpenSuggestions(index)}
            placeholder="Type to search manager products..."
            className={`flex-1 rounded-l-md border-0 bg-transparent px-3 py-2 text-sm focus:outline-none ${suggestionsOpen[index] ? 'rounded-b-none' : 'rounded-r-md'}`}
            required
          />
          <button
            type="button"
            onClick={() => onToggleSuggestions(index)}
            className="flex items-center justify-center rounded-r-md border-l border-gray-300 bg-gray-50 px-3 py-2 text-gray-600 text-sm leading-none transition hover:bg-gray-100"
            aria-label="Toggle product dropdown"
          >
            <ChevronDown size={18} />
          </button>
        </div>

        {suggestionsOpen[index] && (
          <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-52 overflow-y-auto rounded-b-md border border-t-0 border-gray-300 bg-white shadow-lg">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <button
                  key={product._id || product.name}
                  type="button"
                  onMouseDown={() => onProductSelection(index, product.name)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {product.name}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">No available product</div>
            )}
          </div>
        )}
      </div>
    </div>

    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{t.unit}</label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onUnitChange(index, 'quantity')}
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
          onClick={() => onUnitChange(index, 'weight')}
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
            value={item.quantity || ''}
            onChange={(event) => onItemChange(index, 'quantity', event.target.value)}
            placeholder="Enter quantity"
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
            onChange={(event) => onItemChange(index, 'weight', event.target.value)}
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
          onChange={(event) => onItemChange(index, 'price', event.target.value)}
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
        placeholder="0"
        className="w-full rounded border border-gray-300 bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900 outline-none"
      />
    </div>
  </div>
);

const AddProducts = () => {
  const { formData, setFormData, lang } = useOutletContext();
  const t = translations[lang || 'en'];
  const navigate = useNavigate();
  const [masterList, setMasterList] = useState([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState({});
  const [searchQueries, setSearchQueries] = useState({});
  const wrapperRefs = React.useRef({});
  const lastCardRef = React.useRef(null);

  const isValidProduct = (productName) => {
    return masterList.some((product) => product.name === productName);
  };

  const getFilteredProducts = (query) => {
    const normalized = (query || '').trim().toLowerCase();
    if (!normalized) return masterList;
    return masterList.filter((product) => product.name.toLowerCase().includes(normalized));
  };

  const openSuggestions = (index) => {
    setSuggestionsOpen(prev => ({ ...prev, [index]: true }));
  };

  const closeSuggestions = (index) => {
    setSuggestionsOpen(prev => ({ ...prev, [index]: false }));
  };

  const toggleSuggestions = (index) => {
    setSuggestionsOpen(prev => ({ ...prev, [index]: !prev[index] }));
  };

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      Object.entries(wrapperRefs.current).forEach(([idx, node]) => {
        if (node && !node.contains(event.target)) {
          setSuggestionsOpen(prev => ({ ...prev, [idx]: false }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchMasterProducts = async () => {
      try {
        const masterRes = await API.get('/products');
        setMasterList(masterRes.data);
      } catch (err) {
        console.error("Failed to fetch product history", err);
      }
    };
    fetchMasterProducts();
  }, []);

  useEffect(() => {
    if (formData.items?.length > 1) {
      lastCardRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [formData.items?.length]);

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

  const handleSearchInput = (index, query) => {
    setSearchQueries(prev => ({ ...prev, [index]: query }));
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        return {
          ...item,
          productName: '',
          price: ''
        };
      })
    }));
  };

  const handleProductSelection = (index, productName) => {
    const selectedProduct = masterList.find(p => p.name === productName);
    setSearchQueries(prev => ({ ...prev, [index]: productName }));
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        return {
          ...item,
          productName,
          price: selectedProduct && selectedProduct.baseRate ? selectedProduct.baseRate : item.price
        };
      })
    }));
    setSuggestionsOpen(prev => ({ ...prev, [index]: false }));
  };

  const handleUnitChange = (index, unit) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        const { quantity, weight, ...rest } = item;
        return unit === 'weight'
          ? { ...rest, unit: 'weight', weight: weight || '' }
          : { ...rest, unit: 'quantity', quantity: quantity || '' };
      })
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

    const validItems = formData.items.reduce((acc, item) => {
      const unit = item.unit === 'weight' ? 'weight' : 'quantity';
      const baseItem = {
        productName: item.productName.trim(),
        unit,
        price: Number(item.price || item.rate || 0)
      };

      const normalizedItem = unit === 'weight'
        ? { ...baseItem, weight: Number(item.weight || 0) }
        : { ...baseItem, quantity: Number(item.quantity || 0) };

      const hasValidName = Boolean(normalizedItem.productName);
      const hasValidQuantity =
        normalizedItem.unit === 'quantity'
          ? normalizedItem.quantity > 0
          : true;
      const hasValidWeight =
        normalizedItem.unit === 'weight'
          ? normalizedItem.weight >= 0.1
          : true;
      const hasValidPrice = normalizedItem.price > 0;

      if (
        hasValidName &&
        hasValidQuantity &&
        hasValidWeight &&
        hasValidPrice
      ) {
        acc.push(normalizedItem);
      }

      return acc;
    }, []);

    let hasInvalidProduct = false;
    formData.items.forEach((item, idx) => {
      if (!item.productName || !isValidProduct(item.productName)) {
        hasInvalidProduct = true;
        setSuggestionsOpen(prev => ({ ...prev, [idx]: true }));
      }
    });

    if (hasInvalidProduct) {
      return;
    }

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
        const searchQuery = searchQueries[index] !== undefined ? searchQueries[index] : item.productName || '';

        return (
          <ProductCard
            key={item.productName ? `${item.productName}-${index}` : `item-${index}`}
            item={item}
            index={index}
            totalItems={formData.items.length}
            isLast={index === formData.items.length - 1}
            lastCardRef={lastCardRef}
            wrapperRefs={wrapperRefs}
            t={t}
            amount={amount}
            suggestionsOpen={suggestionsOpen}
            searchQuery={searchQuery}
            filteredProducts={getFilteredProducts(searchQuery)}
            onSearchInput={handleSearchInput}
            onOpenSuggestions={openSuggestions}
            onToggleSuggestions={toggleSuggestions}
            onProductSelection={handleProductSelection}
            onUnitChange={handleUnitChange}
            onItemChange={handleItemChange}
            onRemove={handleRemove}
          />
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
