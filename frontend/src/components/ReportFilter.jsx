import React, { useEffect, useReducer } from 'react';
import { RotateCcw, Download } from 'lucide-react';

const createFilterState = (filters = {}) => ({
  sellerId: filters.sellerId || '',
  sellerName: filters.sellerName || '',
  shopName: filters.shopName || '',
  shopType: filters.shopType || '',
  status: filters.status || '',
  from: filters.from || '',
  to: filters.to || '',
});

const emptyFilterState = createFilterState();

const filterReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        [action.field]: action.value,
      };

    case 'SYNC_FILTERS':
      return createFilterState(action.payload);

    case 'RESET':
      return emptyFilterState;

    default:
      return state;
  }
};

const ReportFilter = ({
  onFilter,
  onDownloadCSV,
  sellers = [],
  filters = {},
}) => {
  const [filterState, dispatch] = useReducer(
    filterReducer,
    filters,
    createFilterState
  );

  // Sync internal state with parent filters
  // such as values changed by an external search bar.
  useEffect(() => {
    dispatch({
      type: 'SYNC_FILTERS',
      payload: filters,
    });
  }, [filters]);

  // Auto-apply filters whenever filter state changes.
  // Keeps the original 500ms debounce behavior.
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilter(filterState);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [filterState, onFilter]);

  const handleFieldChange = (field, value) => {
    dispatch({
      type: 'SET_FIELD',
      field,
      value,
    });
  };

  const handleClear = () => {
    dispatch({
      type: 'RESET',
    });

    // Apply reset immediately instead of waiting
    // for the 500ms debounce.
    onFilter(emptyFilterState);
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
      <div className="flex flex-nowrap overflow-x-auto items-end gap-4 pb-2">
        {/* Seller */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Seller
          </label>

          <select
            value={filterState.sellerId}
            onChange={(e) =>
              handleFieldChange(
                'sellerId',
                e.target.value
              )
            }
            className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          >
            <option value="">
              All Sellers
            </option>

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

        {/* Seller Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Seller Name
          </label>

          <input
            type="text"
            value={filterState.sellerName}
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

        {/* Shop Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Shop Name
          </label>

          <input
            type="text"
            value={filterState.shopName}
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
            value={filterState.shopType}
            onChange={(e) =>
              handleFieldChange(
                'shopType',
                e.target.value
              )
            }
            className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          >
            <option value="">
              All Types
            </option>

            <option value="Retail">
              Retail
            </option>

            <option value="Wholesale">
              Wholesale
            </option>

            <option value="Distributor">
              Distributor
            </option>

            <option value="Other">
              Other
            </option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Status
          </label>

          <select
            value={filterState.status}
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

            <option value="Paid">
              Paid
            </option>

            <option value="Partial">
              Partial
            </option>

            <option value="Pending">
              Pending
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
            value={filterState.from}
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
            value={filterState.to}
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
    </div>
  );
};

export default ReportFilter;

