import React, { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import API from '../../api/axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AlertCircle, Loader2, Download } from 'lucide-react';
import { translations } from '../../utils/translations';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

const SellerReports = () => {
  const { lang } = useOutletContext() || { lang: 'en' };
  const t = translations[lang] || translations['en'];
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await API.get('/sales/my-records');
        setRecords(response.data);
      } catch (err) {
        console.error(err);
        setError(t.reportsError);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [t.reportsError]);

  const stats = useMemo(() => {
    return records.reduce(
      (total, record) => {
        const itemCount = (record.items || []).reduce((sum, item) => {
          if (item.unit === 'weight') {
            return sum + 1; // Count weight-based items as 1
          } else {
            return sum + Number(item.quantity || 0);
          }
        }, 0);
        return {
          visits: total.visits + 1,
          sales: total.sales + Number(record.totalAmount || 0),
          items: total.items + itemCount
        };
      },
      { visits: 0, sales: 0, items: 0 }
    );
  }, [records]);

  const handleDownloadPDF = async () => {
    const doc = new jsPDF();
    
    // Add Logo
    try {
      const response = await fetch('/logo.png');
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      await new Promise((resolve) => {
        reader.onloadend = () => {
          const base64data = reader.result;
          doc.addImage(base64data, 'PNG', 14, 10, 30, 30);
          resolve();
        };
      });
    } catch (err) {
      console.warn('Could not load logo for PDF', err);
    }
    
    // Add Title and Header
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235); // Blue-700
    doc.text("Sales Summary Report", 50, 25);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 50, 33);
    
    // Decorative Line
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 45, 196, 45);

    // Summary Table
    autoTable(doc, {
      startY: 55,
      head: [['Metric', 'Total Value']],
      body: [
        ['Total Shop Visits', stats.visits],
        ['Total Sales Amount', currencyFormatter.format(stats.sales)],
        ['Total Items Sold', stats.items],
      ],
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], fontSize: 12, textColor: 255, fontStyle: 'bold' },
      bodyStyles: { fontSize: 11, textColor: 50 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: { 1: { halign: 'right', fontStyle: 'bold', textColor: [37, 99, 235] } }
    });

    doc.save(`Sales_Summary_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Loader2 className="mr-2 animate-spin text-blue-700" size={22} />
        <span className="text-sm font-semibold text-slate-500">{t.loadingReports}</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <h2 className="text-xs font-black text-slate-950 uppercase tracking-wider">{t.salesSummary}</h2>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-blue-700 text-white px-3 py-1.5 rounded-md text-[11px] font-black hover:bg-blue-800 transition-colors shadow-sm"
          >
            <Download size={14} />
            {t.downloadPDF}
          </button>
        </div>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-700">{t.totalVisits}</span>
            <span className="font-black text-slate-950">{stats.visits}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-700">{t.totalSales}</span>
            <span className="font-black text-slate-950">{currencyFormatter.format(stats.sales)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-700">{t.totalItems}</span>
            <span className="font-black text-slate-950">{stats.items}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerReports;
