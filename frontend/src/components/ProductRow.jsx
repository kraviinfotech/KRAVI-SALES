import React from 'react';
import { Trash2 } from 'lucide-react';

const ProductRow = ({ index, item, onChange, onDelete, showDelete }) => {
  const handleTextChange = (e) => {
    const { name, value } = e.target;
    onChange(index, name, value);
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    onChange(index, name, value === '' ? '' : Number(value));
  };

  const amount = (item.quantity || 0) * (item.rate || 0);

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="p-3">
        <input
          type="text"
          name="productName"
          value={item.productName}
          onChange={handleTextChange}
          placeholder="e.g. Premium Soap"
          className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          required
        />
      </td>
      <td className="p-3 w-24">
        <input
          type="number"
          name="quantity"
          value={item.quantity}
          onChange={handleNumberChange}
          min="1"
          placeholder="Qty"
          className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          required
        />
      </td>
      <td className="p-3 w-32">
        <div className="relative">
          <span className="absolute left-2.5 top-2.5 text-gray-400 text-xs">₹</span>
          <input
            type="number"
            name="rate"
            value={item.rate}
            onChange={handleNumberChange}
            min="0.01"
            step="0.01"
            placeholder="Rate"
            className="w-full bg-white border border-gray-300 rounded pl-6 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            required
          />
        </div>
      </td>
      <td className="p-3 text-right font-medium text-gray-700 w-32">
        ₹{amount.toFixed(2)}
      </td>
      <td className="p-3 text-center w-12">
        {showDelete && (
          <button
            type="button"
            onClick={() => onDelete(index)}
            className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded transition-colors"
            title="Delete row"
          >
            <Trash2 size={16} />
          </button>
        )}
      </td>
    </tr>
  );
};

export default ProductRow;
