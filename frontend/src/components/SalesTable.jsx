import React, { useState, useRef } from 'react';
import { ChevronDown, ChevronUp, MapPin, X, Image } from 'lucide-react';
import { format } from 'date-fns';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

const SalesTable = ({ records }) => {
  const [expandedId, setExpandedId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const dialogRef = useRef(null);

  // FIXED: Handle modal open/close imperatively inside the user actions directly
  const handleOpenImage = (imgUrl) => {
    setSelectedImage(imgUrl);
    if (dialogRef.current) {
      dialogRef.current.showModal();
    }
  };

  const handleCloseImage = () => {
    setSelectedImage(null);
    if (dialogRef.current) {
      dialogRef.current.close();
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
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
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleExpand(record._id)}
                    tabIndex={0}
                    role="button"
                    aria-expanded={isExpanded}
                    className={`hover:bg-blue-50/40 transition-colors cursor-pointer text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 ${isExpanded ? 'bg-blue-50/30' : ''}`}
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

                  {isExpanded && (
                    <tr className="bg-slate-50/80">
                      <td colSpan="8" className="p-6 border-t border-slate-200">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                                  href={`https://maps.google.com/?q=${record.latitude},${record.longitude}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline hover:text-primary-dark"
                                >
                                  View Location ({record.latitude?.toFixed(5) || 0}, {record.longitude?.toFixed(5) || 0})
                                </a>
                              </p>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Items Ordered</h4>
                            <div className="bg-white rounded border border-gray-200 overflow-hidden">
                              <table className="w-full text-left text-xs">
                                <thead>
                                  <tr className="bg-gray-100 border-b border-gray-200 font-semibold text-gray-600">
                                    <th className="p-2">Product</th>
                                    <th className="p-2 text-center">Qty/Weight</th>
                                    <th className="p-2 text-right">Rate</th>
                                    <th className="p-2 text-right">Amount</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {record.items && record.items.map((item, idx) => {
                                    let quantity, displayLabel;
                                    if (item.unit === 'weight') {
                                      quantity = Number(item.weight) || 0;
                                      displayLabel = `${quantity} kg`;
                                    } else {
                                      quantity = Number(item.quantity) || 0;
                                      displayLabel = `${quantity} pcs`;
                                    }
                                    const rate = Number(item.price || item.rate) || 0;
                                    const amount = quantity * rate;

                                    return (
                                      <tr key={item._id || idx}>
                                        <td className="p-2 text-gray-800 font-medium">{item.productName}</td>
                                        <td className="p-2 text-center text-gray-600">{displayLabel}</td>
                                        <td className="p-2 text-right text-gray-600">₹{rate.toFixed(2)}</td>
                                        <td className="p-2 text-right text-gray-800 font-medium">₹{amount.toFixed(2)}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Media Files</h4>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex flex-col items-center">
                                <span className="text-[10px] font-bold text-gray-500 mb-1">Shop Photo</span>
                                {record.shopImage ? (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenImage(record.shopImage)}
                                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleOpenImage(record.shopImage)}
                                    aria-label="View shop photo"
                                    className="w-full h-24 rounded border border-gray-200 overflow-hidden cursor-pointer hover:opacity-90 hover:border-blue-500 transition-all bg-gray-100 flex items-center justify-center relative group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                  >
                                    <img src={record.shopImage} alt="Shop Thumbnail" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">View</div>
                                  </button>
                                ) : (
                                  <div className="w-full h-24 rounded border border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-gray-400">
                                    <Image size={18} />
                                    <span className="text-[9px] font-bold mt-1">Not Uploaded</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col items-center">
                                <span className="text-[10px] font-bold text-gray-500 mb-1">Payment Proof</span>
                                {record.scannerPhoto ? (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenImage(record.scannerPhoto)}
                                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleOpenImage(record.scannerPhoto)}
                                    aria-label="View payment proof"
                                    className="w-full h-24 rounded border border-gray-200 overflow-hidden cursor-pointer hover:opacity-90 hover:border-blue-500 transition-all bg-gray-100 flex items-center justify-center relative group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                  >
                                    <img src={record.scannerPhoto} alt="Payment Proof Thumbnail" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">View</div>
                                  </button>
                                ) : record.paymentMethod === 'Online' ? (
                                  <div className="w-full h-24 rounded border border-dashed border-red-200 bg-red-50/50 flex flex-col items-center justify-center text-red-400">
                                    <Image size={18} />
                                    <span className="text-[9px] font-bold mt-1 text-center leading-tight">Missing Proof<br/>(Online)</span>
                                  </div>
                                ) : (
                                  <div className="w-full h-24 rounded border border-slate-200 bg-slate-100 flex flex-col items-center justify-center text-slate-500 p-1 text-center">
                                    <span className="text-[10px] font-black uppercase text-slate-700">Cash Payment</span>
                                    <span className="text-[8px] font-bold mt-0.5 text-slate-500">Offline payment</span>
                                  </div>
                                )}
                              </div>
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

      <dialog
        ref={dialogRef}
        aria-label="Image Preview"
        className="backdrop:bg-black/80 backdrop:backdrop-blur-xs rounded-lg p-0 shadow-2xl overflow-hidden"
        onCancel={handleCloseImage}
      >
        <div 
          role="button"
          tabIndex={0}
          aria-label="Close image preview"
          onClick={(e) => e.target === e.currentTarget && handleCloseImage()}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget && handleCloseImage()}
          className="p-2 outline-none focus:outline-none max-w-3xl max-h-[85vh] flex flex-col items-center justify-center relative focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
        >
          <button
            type="button"
            onClick={handleCloseImage}
            className="absolute -top-10 right-0 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="High Resolution Preview"
              className="max-w-full max-h-[80vh] rounded object-contain pointer-events-auto"
            />
          )}
        </div>
      </dialog>
    </div>
  );
};

export default SalesTable;