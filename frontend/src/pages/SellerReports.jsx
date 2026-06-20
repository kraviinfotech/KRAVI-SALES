import React, { useState, useEffect, useMemo } from 'react';
import axios from '../api/axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, LoaderCircle, CircleAlert } from 'lucide-react';

const SellerReports = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await axios.get("/sales/my-records");
        setRecords(response.data);
      } catch (err) {
        console.error(err);
        setError("Reports load nahi ho paayi.");
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  const summary = useMemo(() => records.reduce((acc, record) => {
    const recordItems = (record.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    return {
      visits: acc.visits + 1,
      sales: acc.sales + Number(record.totalAmount || 0),
      items: acc.items + recordItems
    };
  }, { visits: 0, sales: 0, items: 0 }), [records]);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Add Title and Header
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235); // Blue-700
    doc.text("Sales Summary Report", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 14, 30);

    // Address on the right
    const rightX = 196;
    let rightY = 14;
    doc.setFontSize(10);
    doc.setTextColor(17, 24, 39);
    doc.setFont('helvetica', 'bold');
    doc.text('Kravi Infotech', rightX, rightY, { align: 'right' });
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    rightY += 6;
    doc.text('Ahilyanagar, Maharashtra, India', rightX, rightY, { align: 'right' });
    rightY += 6;
    doc.text('contact@kraviinfotech.com', rightX, rightY, { align: 'right' });
    rightY += 6;
    doc.text('+91 9657013534', rightX, rightY, { align: 'right' });
    
    // Decorative Line
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 36, 196, 36);

    // Summary Table
    autoTable(doc, {
      startY: 45,
      head: [['Metric', 'Total Value']],
      body: [
        ['Total Shop Visits', summary.visits],
        ['Total Sales Amount', currencyFormatter.format(summary.sales)],
        ['Total Items Sold', summary.items],
      ],
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235], fontSize: 12 },
      bodyStyles: { fontSize: 11 },
      columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } }
    });

    doc.save(`Sales_Summary_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <LoaderCircle className="mr-2 animate-spin text-blue-700" size={22} />
        <span className="text-sm font-semibold text-slate-500">Loading reports...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          <CircleAlert size={14} />
          <span>{error}</span>
        </div>
      )}

      <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <h2 className="text-xs font-black text-slate-950 uppercase tracking-wider">Sales Summary</h2>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-blue-700 text-white px-3 py-1.5 rounded-md text-[11px] font-black hover:bg-blue-800 transition-colors shadow-sm"
          >
            <Download size={14} />
            DOWNLOAD PDF
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-700">Total Visits</span>
            <span className="font-black text-slate-950">{summary.visits}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-700">Total Sales</span>
            <span className="font-black text-slate-950">{currencyFormatter.format(summary.sales)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-700">Total Items</span>
            <span className="font-black text-slate-950">{summary.items}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerReports;