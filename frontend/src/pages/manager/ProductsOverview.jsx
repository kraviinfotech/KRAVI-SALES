import React, { useEffect, useMemo, useState } from 'react';
import API from '../../api/axios';
import { AlertCircle, Loader2, Package } from 'lucide-react';

const numberFormatter = new Intl.NumberFormat('en-IN');
const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

const ProductsOverview = () => {
  const [records, setRecords] = useState([]);
  const [masterProducts, setMasterProducts] = useState([]);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAnimationActive] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await API.get('/reports/records');
        // Filter out records where seller no longer exists
        setRecords(Array.isArray(response.data) ? response.data.filter(r => r.sellerId) : []);
      } catch (err) {
        console.error(err);
        setError('Product totals could not be loaded.');
      } finally {
        setLoading(false);
      }
    };
    
    const fetchMasterProducts = async () => {
      try {
        const res = await API.get('/products');
        setMasterProducts(res.data);
      } catch (err) { console.error(err); }
    };

    fetchRecords();
    fetchMasterProducts();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProductName.trim()) return;
    setIsAnimationActive(true);
    try {
      const token = localStorage.getItem('token');
      const res = await API.post('/products', {
        name: newProductName,
        baseRate: newProductPrice ? Number(newProductPrice) : 0
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMasterProducts(prev => [...prev, res.data].sort((a,b) => a.name.localeCompare(b.name)));
      setNewProductName('');
      setNewProductPrice('');
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Error adding product');
    } finally { setIsAnimationActive(false); }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product from master list?')) return;
    try {
      await API.delete(`/products/${id}`);
      setMasterProducts(prev => prev.filter(p => p._id !== id));
    } catch (err) { alert('Error deleting product'); }
  };

  const products = useMemo(() => {
    const productMap = new Map();

    records.forEach((record) => {
      (record.items || []).forEach((item) => {
        const name = item.productName || 'Unknown Product';
        if (!productMap.has(name)) {
          productMap.set(name, {
            name,
            quantity: 0,
            sales: 0,
            recordIds: new Set()
          });
        }

        const product = productMap.get(name);
        if (item.unit === 'weight') {
          product.quantity += Number(item.weight || 0);
        } else {
          product.quantity += Number(item.quantity || 0);
        }
        product.sales += Number(item.amount || 0);
        product.recordIds.add(record._id);
      });
    });

    return Array.from(productMap.values())
      .map((product) => ({
        ...product,
        records: product.recordIds.size
      }))
      .sort((a, b) => b.sales - a.sales);
  }, [records]);

  const totals = products.reduce(
    (sum, product) => ({
      quantity: sum.quantity + product.quantity,
      sales: sum.sales + product.sales
    }),
    { quantity: 0, sales: 0 }
  );

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <div className="rounded-md bg-blue-50 p-2 text-blue-700">
          <Package size={20} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Inventory Sales</p>
          <h1 className="text-2xl font-black text-slate-950">Products</h1>
        </div>
      </div>

      {/* Add Master Product Form */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <h2 className="text-sm font-black text-slate-900 mb-4 uppercase tracking-wider">Add to Master Catalog</h2>
        <form onSubmit={handleAddProduct} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newProductName}
            onChange={(e) => setNewProductName(e.target.value)}
            placeholder="e.g. New Shampoo Variant"
            className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <input
            type="number"
            min={0}
            step={0.01}
            value={newProductPrice}
            onChange={(e) => setNewProductPrice(e.target.value)}
            placeholder="Base Price (₹)"
            className="w-full sm:w-36 rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            disabled={isAdding}
            className="bg-blue-700 text-white px-4 py-2 rounded text-sm font-bold hover:bg-blue-800 disabled:opacity-50 whitespace-nowrap"
          >
            {isAdding ? 'Adding...' : 'Add Product'}
          </button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          {masterProducts.map(p => (
            <span key={p._id} className="inline-flex items-center gap-1 bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-600 border border-slate-200">
              {p.name}
              {p.baseRate > 0 && (
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded ml-1">₹{p.baseRate}</span>
              )}
              <button onClick={() => handleDeleteProduct(p._id)} className="text-slate-400 hover:text-red-600 ml-1">×</button>
            </span>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <section className="rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-black text-slate-600">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3 text-center">Records</th>
                <th className="px-4 py-3 text-center">Quantity Sold</th>
                <th className="px-4 py-3 text-right">Total Sales</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-4 py-10 text-center">
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
                      <Loader2 className="animate-spin text-blue-700" size={18} />
                      Loading products...
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-10 text-center text-sm font-semibold text-slate-500">
                    No product sale records found yet.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.name} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-900">{product.name}</td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-700">
                      {numberFormatter.format(product.records)}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-700">
                      {numberFormatter.format(product.quantity)}
                    </td>
                    <td className="px-4 py-3 text-right font-black text-slate-950">
                      {currencyFormatter.format(product.sales)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {!loading && products.length > 0 && (
              <tfoot>
                <tr className="border-t border-slate-300 bg-slate-50 text-sm font-black text-slate-950">
                  <td className="px-4 py-3">Total</td>
                  <td className="px-4 py-3 text-center">{numberFormatter.format(records.length)}</td>
                  <td className="px-4 py-3 text-center">{numberFormatter.format(totals.quantity)}</td>
                  <td className="px-4 py-3 text-right">{currencyFormatter.format(totals.sales)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </section>
    </div>
  );
};

export default ProductsOverview;
