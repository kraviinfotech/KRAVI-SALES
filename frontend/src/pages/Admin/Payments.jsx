import React, { useState, useEffect } from 'react';
import { IndianRupee, Download, TrendingUp, Clock, AlertCircle, CheckCircle2, Filter, Calendar } from 'lucide-react';
import API from '../../api/axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const RevenueCard = ({ title, amount, icon: Icon, colorClass }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
    <div className={`w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center mb-4`}>
      <Icon size={24} />
    </div>
    <p className="text-gray-500 text-sm font-medium">{title}</p>
    <h2 className="text-2xl font-bold text-gray-800 mt-1 flex items-center gap-1">
      <IndianRupee size={20} /> {amount}
    </h2>
  </div>
);

const Payments = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [stats, setStats] = useState({ totalRevenue: 0, monthlyRevenue: 0, pendingPayments: 0, upcomingRenewals: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    API.get('/payments')
      .then(res => {
        setStats({
          totalRevenue: res.data.totalRevenue || 0,
          monthlyRevenue: res.data.monthlyRevenue || 0,
          pendingPayments: res.data.pendingPayments || 0,
          upcomingRenewals: res.data.upcomingRenewals || 0
        });

        const subscriptionTx = (res.data.subscriptionTransactions || []).map(t => ({
          id: t._id,
          company: t.name,
          amount: t.amount,
          plan: t.plan || 'Subscription',
          method: t.paymentMethod || 'Subscription',
          invoice: t.invoice || `INV-${t._id?.slice(-6)}`,
          status: t.paymentStatus || 'Pending',
          date: t.createdAt
        }));

        setTransactions(subscriptionTx);
      })
      .catch(err => console.error('Failed to load payments', err))
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (status) => {
    const colors = {
      Paid: 'bg-green-100 text-green-700',
      Active: 'bg-green-100 text-green-700',
      Pending: 'bg-yellow-100 text-yellow-700',
      Failed: 'bg-red-100 text-red-700'
    };
    return <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>;
  };

  const downloadCSV = (filename, rows) => {
    const csvContent = [Object.keys(rows[0]).join(','), ...rows.map(r => Object.values(r).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportAll = () => {
    if (transactions.length === 0) {
      window.alert('No transactions to export');
      return;
    }
    downloadCSV('transactions.csv', transactions);
  };

  const generatePDFInvoice = (t) => {
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'A4' });
      const margin = 40;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let top = margin;

      // Company Header
      doc.setFontSize(24);
      doc.setTextColor(108, 62, 244); // Purple (#6C3EF4)
      doc.text('KRAVI SALES', margin, top);
      doc.setTextColor(0, 0, 0);

      // Company Details (Right)
      const rightX = pageWidth - margin;
      let rightY = top - 12;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Kravi Infotech', rightX, rightY, { align: 'right' });
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      rightY += 12;
      doc.text('Ahilyanagar, Maharashtra, India', rightX, rightY, { align: 'right' });
      rightY += 12;
      doc.text('contact@kraviinfotech.com', rightX, rightY, { align: 'right' });
      rightY += 12;
      doc.text('+91 9657013534', rightX, rightY, { align: 'right' });

      top += 38;

      // Divider line
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, top, pageWidth - margin, top);
      top += 14;

      // Invoice Title and Numbers
      doc.setFontSize(16);
      doc.setTextColor(50, 50, 50);
      doc.text('INVOICE', margin, top);
      
      doc.setFontSize(10);
      const rightCol = pageWidth - margin - 100;
      doc.text(`Invoice #: ${t.id}`, rightCol, top);
      top += 16;
      doc.text(`Date: ${new Date(t.date).toLocaleDateString()}`, rightCol, top);
      top += 16;
      doc.text(`Due Date: ${new Date(new Date(t.date).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}`, rightCol, top);
      top += 24;

      // Bill To
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text('BILL TO:', margin, top);
      top += 12;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text(t.company, margin, top);
      top += 12;
      doc.text('Registered Business Address', margin, top);
      top += 12;
      doc.text('City, State - 400000, India', margin, top);
      top += 20;

      // Line Items Table
      const head = [['#', 'Description', 'Quantity', 'Unit Price', 'Amount']];
      const body = [
        ['1', t.plan || 'Subscription Service', '1', `₹${t.amount}`, `₹${t.amount}`]
      ];

      try {
        doc.autoTable({
          startY: top,
          head: head,
          body: body,
          theme: 'grid',
          styles: { fontSize: 9, halign: 'center' },
          headStyles: {
            fillColor: [108, 62, 244],
            textColor: 255,
            fontStyle: 'bold'
          },
          columnStyles: {
            1: { halign: 'left' },
            3: { halign: 'right' },
            4: { halign: 'right' }
          }
        });
      } catch (e) {
        console.error('AutoTable error:', e);
      }

      // Summary Section
      let finalY = top + 80;
      if (doc.lastAutoTable && doc.lastAutoTable.finalY) {
        finalY = doc.lastAutoTable.finalY + 12;
      }
      const summaryX = pageWidth - margin - 120;

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Subtotal:', summaryX, finalY);
      doc.setTextColor(0, 0, 0);
      doc.text(`₹${t.amount}`, pageWidth - margin - 30, finalY, { align: 'right' });

      doc.setTextColor(100, 100, 100);
      doc.text('Tax (0%):', summaryX, finalY + 14);
      doc.setTextColor(0, 0, 0);
      doc.text('₹0', pageWidth - margin - 30, finalY + 14, { align: 'right' });

      doc.setDrawColor(200, 200, 200);
      doc.line(summaryX, finalY + 20, pageWidth - margin, finalY + 20);

      doc.setFontSize(12);
      doc.setTextColor(108, 62, 244);
      doc.text('TOTAL DUE:', summaryX, finalY + 30);
      doc.setFontSize(14);
      doc.text(`₹${t.amount}`, pageWidth - margin - 30, finalY + 30, { align: 'right' });

      // Payment Status
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      const statusText = `Payment Status: ${t.status}`;
      doc.text(statusText, margin, finalY + 50);
      doc.text(`Payment Method: ${t.method || 'Pending'}`, margin, finalY + 62);

      // Footer
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(8);
      doc.text('Thank you for your business!', margin, pageHeight - 40);
      doc.text('For questions, contact: support@kravi-sales.com', margin, pageHeight - 30);
      doc.text(`Generated on ${new Date().toLocaleString()}`, margin, pageHeight - 20);

      doc.save(`${t.id}_invoice.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF', err);
      window.alert('Failed to generate PDF invoice');
    }
  };

  const handleExportInvoice = (t) => {
    generatePDFInvoice(t);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Payment Management</h1>
        <button onClick={handleExportAll} className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all">
          <Download size={18} /> Export History
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 flex-wrap">
          <Filter size={18} className="text-gray-500" />
          <div className="flex gap-2 flex-wrap">
            {['Today', 'This Week', 'This Month', 'All Time'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeFilter === filter
                    ? 'bg-[#6C3EF4] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <RevenueCard title="Total Revenue" amount={stats.totalRevenue || 0} icon={TrendingUp} colorClass="bg-green-50 text-green-600" />
        <RevenueCard title="Monthly Revenue" amount={stats.monthlyRevenue || 0} icon={Clock} colorClass="bg-purple-50 text-[#6C3EF4]" />
        <RevenueCard title="Pending Payments" amount={stats.pendingPayments || 0} icon={AlertCircle} colorClass="bg-orange-50 text-orange-600" />
        <RevenueCard title="Upcoming Renewals" amount={stats.upcomingRenewals || 0} icon={CheckCircle2} colorClass="bg-blue-50 text-blue-600" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Invoice</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-4">Loading...</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-4">No transactions</td></tr>
              ) : transactions.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">{t.company}</td>
                  <td className="px-6 py-4 font-bold text-gray-800">₹{t.amount}</td>
                  <td className="px-6 py-4 text-gray-500">{t.plan}</td>
                  <td className="px-6 py-4 text-gray-600">{t.method}</td>
                  <td className="px-6 py-4 text-gray-600 font-medium">{t.invoice}</td>
                  <td className="px-6 py-4">{getStatusBadge(t.status)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleExportInvoice(t)} className="text-[#6C3EF4] flex items-center gap-1 font-semibold hover:underline">
                        <Download size={14} /> Invoice
                      </button>
                      <button onClick={() => window.alert(JSON.stringify(t, null, 2))} className="text-gray-700 bg-gray-100 px-3 py-2 rounded-xl hover:bg-gray-200 transition-colors">
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payments;