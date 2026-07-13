import { useState, useCallback, useEffect, useRef } from 'react';
import API from '../../api/axios';

const toDateInput = (date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
};

export const getRange = (range) => {
  const now = new Date();
  const from = new Date(now);

  if (range === 'daily') {
    return { from: toDateInput(now), to: toDateInput(now) };
  }
  if (range === 'monthly') {
    return { from: toDateInput(new Date(now.getFullYear(), now.getMonth(), 1)), to: toDateInput(now) };
  }
  if (range === 'yearly') {
    return { from: toDateInput(new Date(now.getFullYear(), 0, 1)), to: toDateInput(now) };
  }
  from.setDate(now.getDate() - 6);
  return { from: toDateInput(from), to: toDateInput(now) };
};

const getBlankWeeklyChart = () => {
  const days = [];
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push({
      name: date.toLocaleDateString('en-US', { weekday: 'short' }),
      sales: 0
    });
  }
  return days;
};

let cachedSummary = null;
let cachedRecords = null;
let cachedChartData = null;
let cachedCollectionStats = null;
let cachedRecentCollections = null;
let hasFetchedSummary = false;
let hasFetchedRecords = false;
let hasFetchedChart = false;
let hasFetchedCollections = false;

export function useManagerDashboardData(activeTab, appliedCustomRange) {
  const [summary, setSummary] = useState(cachedSummary || {
    totalSellers: 0,
    totalRecords: 0,
    monthlyTotal: 0,
    yearlyTotal: 0,
    totalPending: 0
  });
  const [records, setRecords] = useState(cachedRecords || []);
  const [chartData, setChartData] = useState(cachedChartData || getBlankWeeklyChart());
  const [summaryLoading, setSummaryLoading] = useState(!hasFetchedSummary);
  const [recordsLoading, setRecordsLoading] = useState(!hasFetchedRecords);
  const [chartLoading, setChartLoading] = useState(!hasFetchedChart);
  const [error, setError] = useState('');

  const [collectionStats, setCollectionStats] = useState(cachedCollectionStats || { totalCollection: 0, cashCollection: 0, onlineCollection: 0, pendingCollection: 0 });
  const [recentCollections, setRecentCollections] = useState(cachedRecentCollections || []);
  const [collectionsLoading, setCollectionsLoading] = useState(!hasFetchedCollections);
  const [callContactsBySellerId, setCallContactsBySellerId] = useState({});
  const recordsRef = useRef(records);

  useEffect(() => {
    recordsRef.current = records;
  }, [records]);

  const fetchCallContacts = useCallback(async () => {
    try {
      const response = await API.get('/calls/contacts');
      const nextContacts = {};
      (response.data?.contacts || []).forEach((contact) => {
        if (contact.sellerId && contact.id) {
          nextContacts[contact.sellerId] = contact.id;
        }
      });
      setCallContactsBySellerId(nextContacts);
    } catch (err) {
      console.error('Error fetching call contacts', err);
    }
  }, []);

  const fetchCollectionData = useCallback(async (quiet = false) => {
    if (!quiet) setCollectionsLoading(true);
    try {
      const res = await API.get('/shoppayments/manager-recent');
      setCollectionStats(res.data.stats);
      setRecentCollections(res.data.recentPayments);
      cachedCollectionStats = res.data.stats;
      cachedRecentCollections = res.data.recentPayments;
      hasFetchedCollections = true;
    } catch (err) {
      console.error('Error fetching collections', err);
    } finally {
      setCollectionsLoading(false);
    }
  }, []);

  const fetchSummary = useCallback(async (quiet = false) => {
    if (!quiet) setSummaryLoading(true);
    try {
      const response = await API.get('/reports/summary');
      const newSummary = {
        ...(response.data || {}),
        totalPending: response.data?.totalPending || 0
      };
      setSummary(newSummary);
      cachedSummary = newSummary;
      hasFetchedSummary = true;
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        setError('Access Denied: You are not authorized to view manager summary. Please login as a Manager.');
      } else {
        setError('Manager summary could not be loaded.');
      }
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const fetchChartData = useCallback(async (quiet = false) => {
    if (!quiet && !hasFetchedChart) setChartLoading(true);
    try {
      const response = await API.get('/reports/weekly');
      const data = response.data.map((item) => ({
        name: item.day || item.date,
        sales: Number(item.total || 0)
      }));
      const finalChartData = data.length > 0 ? data : getBlankWeeklyChart();
      setChartData(finalChartData);
      cachedChartData = finalChartData;
      hasFetchedChart = true;
    } catch (err) {
      console.error(err);
      setChartData(getBlankWeeklyChart());
    } finally {
      setChartLoading(false);
    }
  }, []);

  const fetchRecords = useCallback(async (quiet = false) => {
    if (!quiet && recordsRef.current.length === 0) setRecordsLoading(true);
    setError('');

    const selectedRange = activeTab === 'custom' ? appliedCustomRange : getRange(activeTab);
    const queryParams = new URLSearchParams(selectedRange);

    try {
      const response = await API.get(`/reports/records?${queryParams.toString()}`);
      const newRecords = Array.isArray(response.data) ? response.data.filter(r => r.sellerId) : [];
      setRecords(newRecords);
      cachedRecords = newRecords;
      hasFetchedRecords = true;
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        setError('Access Denied: You are not authorized to view reports data. Please login as a Manager.');
      } else {
        setError('Reports data could not be loaded.');
      }
    } finally {
      setRecordsLoading(false);
    }
  }, [activeTab, appliedCustomRange]);

  const handleDeleteSellerRecords = async (sellerId, sellerName) => {
    if (!sellerId) return;
    if (!window.confirm(`Are you sure you want to delete ALL records for ${sellerName}? This cannot be undone.`)) return;
    try {
      const response = await API.delete(`/reports/seller-records/${sellerId}`);
      alert(response.data.message);
      fetchRecords();
      fetchSummary();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting records.');
    }
  };

  useEffect(() => {
    fetchSummary(hasFetchedSummary);
    fetchCollectionData(hasFetchedCollections);
    fetchCallContacts();
  }, [fetchSummary, fetchCollectionData, fetchCallContacts]);

  useEffect(() => {
    fetchChartData(hasFetchedChart);
  }, [fetchChartData]);

  useEffect(() => {
    fetchRecords(hasFetchedRecords);
  }, [fetchRecords, activeTab, appliedCustomRange]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchSummary(true);
      fetchChartData(true);
      fetchRecords(true);
      fetchCollectionData(true);
    }, 200000);
    return () => clearInterval(interval);
  }, [fetchSummary, fetchChartData, fetchRecords, fetchCollectionData]);

  return {
    summary,
    records,
    chartData,
    summaryLoading,
    recordsLoading,
    chartLoading,
    error,
    collectionStats,
    recentCollections,
    collectionsLoading,
    callContactsBySellerId,
    handleDeleteSellerRecords
  };
}
