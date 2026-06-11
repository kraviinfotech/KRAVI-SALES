import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { format } from 'date-fns';

const SalesTable = ({ records }) => {
  const [expandedId, setExpandedId] = useState(null);

  const currencyFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });

  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  if (!records || records.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-100 p-8 text-center text-gray-500">
        No sales records found.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-[11px] font-black uppercase tracking-widest border-b border-slate-200">
              <th className="p-4">Seller</th>
              <th className="p-4">Shop Name</th>
              <th className="p-4">Type</th>
              <th className="p-4">Date & Time</th>
              <th className="p-4 text-center">Items</th>
              <th className="p-4 text-right">Total Amount</th>
              <th className="p-4 text-right text-red-600">Pending</th>
              <th className="p-4 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((record) => {
              const isExpanded = expandedId === record._id;
              const sellerName = record.sellerId?.name || 'Unknown Seller';
              const itemsCount = record.items?.length || 0;
              const formattedDate = format(new Date(record.visitDatetime), 'dd MMM yyyy, hh:mm a');
              const isPending = Number(record.pendingAmount) > 0;

              return (
                <React.Fragment key={record._id}>
                  <tr
                    onClick={() => toggleExpand(record._id)}
                    className={`hover:bg-blue-50/40 transition-colors cursor-pointer text-sm ${isExpanded ? 'bg-blue-50/30' : ''}`}
                  >
                    <td className="p-4 font-bold text-slate-900">{sellerName}</td>
                    <td className="p-4 text-slate-700 font-semibold">{record.shopName}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        record.shopType === 'Retail' ? 'bg-blue-50 text-blue-700' :
                        record.shopType === 'Wholesale' ? 'bg-purple-50 text-purple-700' :
                        record.shopType === 'Distributor' ? 'bg-orange-50 text-orange-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {record.shopType}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 font-medium">{formattedDate}</td>
                    <td className="p-4 text-center text-slate-700 font-bold">{itemsCount}</td>
                    <td className="p-4 text-right font-black text-slate-950">₹{(record.totalAmount || 0).toLocaleString('en-IN')}</td>
                    <td className={`p-4 text-right font-black ${isPending ? 'text-red-600' : 'text-slate-400'}`}>
                      {currencyFormatter.format(record.pendingAmount || 0)}
                    </td>
                    <td className="p-4 text-center text-slate-400">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </td>
                  </tr>

                  {/* Expanded detail row */}
                  {isExpanded && (
                    <tr className="bg-slate-50/80">
                      <td colSpan="7" className="p-6 border-t border-slate-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Left: Visit Info */}
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Visit Details</h4>
                            <div className="space-y-1.5 text-xs text-gray-700">
                              <p><span className="font-semibold text-gray-900">Address:</span> {record.shopAddress}</p>
                              {record.landmark && <p><span className="font-semibold text-gray-900">Landmark:</span> {record.landmark}</p>}
                              
                              <div className="mt-3 pt-2 border-t border-slate-200">
                                <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Payment Summary</p>
                                <p><span className="font-semibold text-gray-900">Paid:</span> {currencyFormatter.format(record.paidAmount || 0)}</p>
                                <p><span className="font-semibold text-red-600">Pending:</span> {currencyFormatter.format(record.pendingAmount || 0)}</p>
                                <p><span className="font-semibold text-gray-900">Status:</span> 
                                  <span className={`ml-1 font-bold ${record.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-orange-600'}`}>
                                    {record.paymentStatus || 'Pending'}
                                  </span>
                                </p>
                              </div>

                              <p className="flex items-center space-x-1 mt-1 text-primary">
                                <MapPin size={12} />
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${record.latitude},${record.longitude}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline hover:text-primary-dark"
                                >
                                  View Location ({record.latitude.toFixed(5)}, {record.longitude.toFixed(5)})
                                </a>
                              </p>
                            </div>
                          </div>

                          {/* Right: Products list */}
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Items Ordered</h4>
                            <div className="bg-white rounded border border-gray-200 overflow-hidden">
                              <table className="w-full text-left text-xs">
                                <thead>
                                  <tr className="bg-gray-100 border-b border-gray-200 font-semibold text-gray-600">
                                    <th className="p-2">Product</th>
                                    <th className="p-2 text-center">Qty</th>
                                    <th className="p-2 text-right">Rate</th>
                                    <th className="p-2 text-right">Amount</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {record.items && record.items.map((item, idx) => (
                                    <tr key={item._id || idx}>
                                      <td className="p-2 text-gray-800 font-medium">{item.productName}</td>
                                      <td className="p-2 text-center text-gray-600">{item.quantity}</td>
                                      <td className="p-2 text-right text-gray-600">₹{item.rate.toFixed(2)}</td>
                                      <td className="p-2 text-right text-gray-800 font-medium">₹{(item.quantity * item.rate).toFixed(2)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesTable;
