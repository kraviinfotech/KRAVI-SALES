import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, Download, FileText, Layers, PieChart, TrendingUp } from 'lucide-react';
import API from '../../api/axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const REPORT_CARDS = [
  { title: 'Revenue Report', label: 'Total income and earnings', icon: TrendingUp, bg: 'bg-[#6C3EF4]' },
  { title: 'Subscription Report', label: 'Subscription plan analytics', icon: BarChart3, bg: 'bg-[#10B981]' },
  { title: 'Company Report', label: 'Company-wise report', icon: FileText, bg: 'bg-[#8B5CF6]' },
  { title: 'Manager Report', label: 'Manager performance report', icon: PieChart, bg: 'bg-[#F59E0B]' },
  { title: 'Renewal Report', label: 'Upcoming renewals report', icon: Layers, bg: 'bg-[#EF4444]' }
];

const formatCsvValue = (v) => v == null ? '' : String(v).replace(/"/g, '""');

const buildCsvContent = (records, t) => {
  const headers = [
    t('admin.date'),
    t('admin.seller'),
    t('admin.shop_name'),
    t('admin.shop_type'),
    t('admin.total_amount'),
    t('admin.paid_amount'),
    t('admin.pending_amount'),
    t('admin.payment_status')
  ];
  
  const rows = records.map((r) => [
    new Date(r.visitDatetime).toISOString(),
    r.sellerId?.name || t('admin.unknown'),
    `"${formatCsvValue(r.shopName)}"`,
    r.shopType,
    r.totalAmount,
    r.paidAmount || 0,
    r.pendingAmount || 0,
    r.paymentStatus || t('admin.pending')
  ].join(','));
  
  return [headers.join(','), ...rows].join('\n');
};

const exportCsvFile = (name, records, t) => {
  const url = URL.createObjectURL(new Blob([buildCsvContent(records, t)], { type: 'text/csv;charset=utf-8;' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};

const getCardValue = (title, s, t) => {
  const map = {
    'Revenue Report': `₹${Number(s.yearlyTotal || 0).toLocaleString('en-IN')}`,
    'Subscription Report': `${s.totalSellers || 0} ${t('admin.sellers')}`,
    'Company Report': `${s.totalRecords || 0} ${t('admin.records')}`,
    'Manager Report': `${s.totalSellers || 0} ${t('admin.managers')}`,
    'Renewal Report': `${s.totalPending || 0} ${t('admin.pending')}`
  };
  return map[title] || t('admin.na');
};

const ReportsHeader = ({ loading, records, reportName, onCSV, onPDF, info }) => {
  const { t } = useTranslation();
  
  const formattedReportName = t(`admin.${reportName.toLowerCase().replace(/\s+/g, '_')}`);
  
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('admin.reports')}</h1>
          <p className="mt-2 text-gray-500">{t('admin.reports_desc')}</p>
          {info && <p className="mt-3 text-sm text-slate-600">{info}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-3xl bg-gray-100 px-4 py-3 text-sm">
            {loading
              ? t('admin.loading_report')
              : records.length
                ? `${records.length} ${t('admin.records_loaded_for')} ${formattedReportName}`
                : t('admin.generate_report_placeholder')}
          </div>
          <button type="button" onClick={onCSV} className="flex items-center gap-2 rounded-2xl border bg-white px-4 py-3">
            <Download size={16} /> {t('admin.csv')}
          </button>
          <button type="button" onClick={onPDF} className="flex items-center gap-2 rounded-2xl border bg-white px-4 py-3">
            <Download size={16} /> {t('admin.pdf')}
          </button>
        </div>
      </div>
    </div>
  );
};

const ReportCards = ({ summary, onGenerate }) => {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
      {REPORT_CARDS.map((card) => {
        const Icon = card.icon;
        const i18nKeyTitle = `admin.${card.title.toLowerCase().replace(/\s+/g, '_')}`;
        const i18nKeyLabel = `admin.${card.title.toLowerCase().replace(/\s+/g, '_')}_label`;
        return (
          <div key={card.title} className="flex flex-col justify-between rounded-3xl border bg-white p-6 shadow-sm">
            <div>
              <div className={`inline-flex rounded-3xl p-3 ${card.bg}`}>
                <Icon size={20} className="text-white" />
              </div>
              <p className="mt-5 text-sm text-gray-500">{t(i18nKeyTitle)}</p>
              <h3 className="mt-3 text-2xl font-bold">{getCardValue(card.title, summary, t)}</h3>
              <p className="mt-2 text-sm text-gray-500">{t(i18nKeyLabel)}</p>
            </div>
            <button type="button" onClick={() => onGenerate(card.title)} className="mt-6 w-full rounded-2xl bg-[#6C3EF4] px-4 py-3 text-sm font-semibold text-white">
              {t('admin.generate_report')}
            </button>
          </div>
        );
      })}
    </div>
  );
};

const ReportRecords = ({ records, activeFilter }) => {
  const { t } = useTranslation();
  const formattedFilter = t(`admin.${activeFilter.toLowerCase().replace(/\s+/g, '_')}`);
  
  return (
    <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b p-6">
        <div>
          <h3 className="text-xl font-bold">{t('admin.report_records')}</h3>
          <p className="text-sm text-gray-500">{records.length} {t('admin.records_found')}</p>
        </div>
        <div className="text-sm text-gray-500">{t('admin.current_report')} {formattedFilter}</div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              {[
                t('admin.date'),
                t('admin.seller'),
                t('admin.shop_name'),
                t('admin.type'),
                t('admin.total'),
                t('admin.paid'),
                t('admin.pending')
              ].map((h) => <th key={h} className="px-6 py-3">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y">
            {records.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center">{t('admin.no_report_records')}</td>
              </tr>
            ) : records.map((r) => (
              <tr key={r._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{new Date(r.visitDatetime).toLocaleDateString('en-IN')}</td>
                <td className="px-6 py-4">{r.sellerId?.name || t('admin.unknown')}</td>
                <td className="px-6 py-4">{r.shopName}</td>
                <td className="px-6 py-4">{r.shopType}</td>
                <td className="px-6 py-4">₹{r.totalAmount || 0}</td>
                <td className="px-6 py-4">₹{r.paidAmount || 0}</td>
                <td className="px-6 py-4">₹{r.pendingAmount || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Reports = () => {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState('Revenue Report');
  const [summary, setSummary] = useState({ totalSellers: 0, totalRecords: 0, monthlyTotal: 0, yearlyTotal: 0, totalPending: 0 });
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportName, setReportName] = useState('Revenue Report');
  const [infoMessage, setInfoMessage] = useState('');

  useEffect(() => {
    API.get('/reports/summary')
      .then((r) => setSummary(r.data))
      .catch((e) => console.error(e));
  }, []);

  const generate = async (label) => {
    setLoading(true);
    setReportName(label);
    setActiveFilter(label);
    try {
      const [s, r] = await Promise.all([
        API.get('/reports/summary'),
        API.get('/reports/records')
      ]);
      setSummary(s.data);
      setRecords(Array.isArray(r.data) ? r.data : []);
      const formattedLabel = t(`admin.${label.toLowerCase().replace(/\s+/g, '_')}`);
      setInfoMessage(`${t('admin.loaded')} ${Array.isArray(r.data) ? r.data.length : 0} ${t('admin.records_for')} ${formattedLabel}`);
    } catch (e) {
      setInfoMessage(e.response?.data?.message || t('admin.failed_generate'));
    } finally {
      setLoading(false);
    }
  };

  const csv = () => records.length ? exportCsvFile(`${reportName.replace(/\s+/g, '_')}.csv`, records, t) : alert(t('admin.no_records_export'));

  const pdf = () => {
    if (!records.length) return alert(t('admin.no_records_export'));
    const doc = new jsPDF();
    autoTable(doc, {
      head: [[
        t('admin.date'),
        t('admin.seller'),
        t('admin.shop_name'),
        t('admin.type'),
        t('admin.total'),
        t('admin.paid'),
        t('admin.pending')
      ]],
      body: records.map((r) => [
        new Date(r.visitDatetime).toLocaleDateString('en-IN'),
        r.sellerId?.name || t('admin.unknown'),
        r.shopName,
        r.shopType,
        r.totalAmount || 0,
        r.paidAmount || 0,
        r.pendingAmount || 0
      ])
    });
    doc.save(`${reportName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-6">
      <ReportsHeader loading={loading} records={records} reportName={reportName} onCSV={csv} onPDF={pdf} info={infoMessage} />
      <ReportCards summary={summary} onGenerate={generate} />
      <ReportRecords records={records} activeFilter={activeFilter} />
    </div>
  );
};

export default Reports;
