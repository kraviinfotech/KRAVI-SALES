import React, { useReducer } from 'react';
import { RotateCcw, Download } from 'lucide-react';

// Static references declared outside the component to preserve reference identity across renders
const EMPTY_SELLERS = [];

const initialFilterState = {
  sellerId: '',
  sellerName: '',
  shopName: '',
  shopType: '',
  status: '',
  from: '',
  to: '',
};

const filterReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        [action.field]: action.value,
      };

    case 'RESET':
      return initialFilterState;

    default:
      return state;
  }
};

/**
 * Filter component for Manager Records page.
 * Provides dropdowns and inputs for seller, shop type,
 * status, dates, and search fields.
 */
const ManagerReportFilter = ({
  onFilter,
  onDownloadCSV,
  sellers = EMPTY_SELLERS, // Uses the static reference safely
}) => {
  const [filters, dispatch] = useReducer(
    filterReducer,
    initialFilterState
  );

  const handleFieldChange = (field, value) => {
    dispatch({
      type: 'SET_FIELD',
      field,
      value,
    });
  };

  const handleApply = (e) => {
    e.preventDefault();
    onFilter(filters);
  };

  const handleClear = () => {
    dispatch({
      type: 'RESET',
    });

    onFilter(initialFilterState);
  };

  return (
    <form
      onSubmit={handleApply}
      className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm mb-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* Seller Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Seller
          </label>

          <select
            value={filters.sellerId}
            onChange={(e) =>
              handleFieldChange('sellerId', e.target.value)
            }
            className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          >
            <option value="">All Sellers</option>

            {sellers.map((seller) => (
              <option
                key={seller._id}
                value={seller._id}
              >
                {seller.name}
              </option>
            ))}
          </select>
        </div>

        {/* Seller Name Search */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Seller Name
          </label>

          <input
            type="text"
            value={filters.sellerName}
            onChange={(e) =>
              handleFieldChange(
                'sellerName',
                e.target.value
              )
            }
            placeholder="Search..."
            className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>

        {/* Shop Name Search */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Shop Name
          </label>

          <input
            type="text"
            value={filters.shopName}
            onChange={(e) =>
              handleFieldChange(
                'shopName',
                e.target.value
              )
            }
            placeholder="Search..."
            className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>

        {/* Shop Type */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Shop Type
          </label>

          <select
            value={filters.shopType}
            onChange={(e) =>
              handleFieldChange(
                'shopType',
                e.target.value
              )
            }
            className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          >
            <option value="">All Types</option>
            <option value="General Store">
              General Store
            </option>
            <option value="Medical">
              Medical
            </option>
            <option value="Grocery">
              Grocery
            </option>
            <option value="Electronics">
              Electronics
            </option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Status
          </label>

          <select
            value={filters.status}
            onChange={(e) =>
              handleFieldChange(
                'status',
                e.target.value
              )
            }
            className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          >
            <option value="">
              All Statuses
            </option>
            <option value="Active">
              Active
            </option>
            <option value="Pending">
              Pending
            </option>
            <option value="Inactive">
              Inactive
            </option>
          </select>
        </div>

        {/* From Date */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            From Date
          </label>

          <input
            type="date"
            value={filters.from}
            onChange={(e) =>
              handleFieldChange(
                'from',
                e.target.value
              )
            }
            className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>

        {/* To Date */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            To Date
          </label>

          <input
            type="date"
            value={filters.to}
            onChange={(e) =>
              handleFieldChange(
                'to',
                e.target.value
              )
            }
            className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>

        {/* Reset Button */}
        <div className="flex flex-col justify-end">
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm font-medium transition-colors whitespace-nowrap"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      </div>

      {onDownloadCSV && (
        <div className="flex justify-end mt-3">
          <button
            type="button"
            onClick={onDownloadCSV}
            className="flex items-center space-x-1.5 bg-success hover:bg-emerald-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            <Download size={16} />
            <span>Download CSV</span>
          </button>
        </div>
      )}
    </form>
  );
};

export default ManagerReportFilter;