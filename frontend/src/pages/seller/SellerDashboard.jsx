import React, { useEffect, useState, useCallback } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import API from '../../api/axios';
import CallButton from '../../components/CallButton';
import CallHistory from '../../components/CallHistory';
import {
  AlertCircle,
  Plus,
  LogIn,
  LogOut,
  Clock,
  MapPin
} from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

let cachedStats = null;
let hasFetchedStats = false;

const SellerDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(cachedStats || { visits: 0, sales: 0, items: 0 });
  const [loading, setLoading] = useState(!hasFetchedStats);
  const [error, setError] = useState('');

  const [attendance, setAttendance] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [attendanceActionLoading, setAttendanceActionLoading] = useState(false);
  const [managerContact, setManagerContact] = useState(null);

  const fetchTodayStats = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const response = await API.get('/sales/today-stats');
      const newStats = {
        visits: response.data.visits || 0,
        sales: response.data.sales || 0,
        items: response.data.items || 0
      };
      setStats(newStats);
      cachedStats = newStats;
      hasFetchedStats = true;
    } catch (err) {
      console.error(err);
      setError(t.errorLoading);
    } finally {
      setLoading(false);
    }
  }, [t.errorLoading]);

  const fetchManagerContact = useCallback(async () => {
    try {
      const response = await API.get('/calls/contacts');
      setManagerContact(response.data?.contacts?.[0] || null);
    } catch (err) {
      console.error('Unable to load manager call contact', err);
    }
  }, []);


  const fetchAttendance = async () => {
    try {
      setAttendanceLoading(true);

      const res = await API.get("/attendance/today");

      setAttendance(res.data.attendance);

    } catch (err) {
      console.error(err);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const getLocation = () =>
    new Promise((resolve, reject) => {

      if (!navigator.geolocation) {
        reject("Geolocation not supported");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {

          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });

        },
        reject,
        {
          enableHighAccuracy: true
        }
      );
    });

  const handleCheckIn = async () => {

    try {

      setAttendanceActionLoading(true);

      const location = await getLocation();

      await API.post("/attendance/checkin", location);

      await fetchAttendance();

      alert("Checked In Successfully");

    } catch (err) {

      alert(err.response?.data?.message || "Unable to Check In");

    } finally {

      setAttendanceActionLoading(false);

    }

  };

  const handleCheckOut = async () => {

    try {

      setAttendanceActionLoading(true);

      const location = await getLocation();

      await API.post("/attendance/checkout", location);

      await fetchAttendance();

      alert("Checked Out Successfully");

    } catch (err) {

      alert(err.response?.data?.message || "Unable to Check Out");

    } finally {

      setAttendanceActionLoading(false);

    }

  };


  useEffect(() => {

    fetchTodayStats(hasFetchedStats);
    fetchAttendance();
    fetchManagerContact();
    const interval = setInterval(() => {
      fetchTodayStats(true);
      fetchAttendance();
    }, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchTodayStats, fetchManagerContact]);


  const summaryRows = [
    { label: t('seller.total_visits'), value: loading ? '--' : String(stats.visits).padStart(2, '0') },
    { label: t('seller.total_sales'), value: loading ? '--' : currencyFormatter.format(stats.sales) },
    { label: t('seller.total_items'), value: loading ? '--' : stats.items }
  ];

  return (
    <div className="space-y-16">

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {managerContact && (
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">Manager support</p>
            <p className="mt-1 text-sm font-black text-slate-950">{managerContact.name || 'Manager'}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <CallButton targetUserId={managerContact.id} type="voice" label="Call" />
              <CallButton targetUserId={managerContact.id} type="video" label="Video" />
            </div>
          </div>
        )}

        <div className="flex justify-end">

        {attendanceLoading ? (

          <div className="rounded-lg border bg-white px-6 py-4 shadow-sm">
            Loading...
          </div>

        ) : attendance ? (

          attendance.logoutTime ? (

            <div className="rounded-lg border border-green-200 bg-green-50 px-6 py-4 shadow-sm">

<div className="font-bold text-green-700 bg-transparent border border-green-700">

                ✅ Checked Out
              </div>

              <div className="mt-1 text-xs text-gray-600">
                Checked In :
                {" "}
                {new Date(attendance.loginTime).toLocaleTimeString()}
              </div>

              <div className="text-xs text-gray-600">
                Checked Out :
                {" "}
                {new Date(attendance.logoutTime).toLocaleTimeString()}
              </div>

            </div>

          ) : (

            <button
              onClick={handleCheckOut}
              disabled={attendanceActionLoading}
              className="rounded-lg bg-red-600 px-6 py-3 text-white shadow hover:bg-red-700"
            >

              <div className="flex items-center justify-center gap-2">

                <LogOut size={18} />

                <span className="font-semibold">
                  Check Out
                </span>

              </div>

              <div className="mt-1 text-xs">

                Checked In :

                {" "}

                {new Date(attendance.loginTime).toLocaleTimeString()}

              </div>

            </button>

          )

        ) : (

          <button
            onClick={handleCheckIn}
            disabled={attendanceActionLoading}
            className="rounded-lg bg-green-600 px-6 py-3 text-white shadow hover:bg-green-700"
          >

            <div className="flex items-center justify-center gap-2">

              <LogIn size={18} />

              <span className="font-semibold">

                Check In

              </span>

            </div>

          </button>

        )}

        </div>

      </div>



















      <Link
        to="/sell/shop"
        className="flex h-14 mt-2 w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-black text-white shadow-sm transition-colors hover:bg-blue-800"
      >
        <Plus size={17} />
        <span>{t('seller.start_selling')}</span>
      </Link>


      <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-xs font-black text-slate-950">
          {t.todaySummary}
        </h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {summaryRows.map((row) => (
            <div
              key={row.label}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-600">
                {row.label}
              </p>

              <p className="mt-2 text-2xl font-black text-slate-950">
                {row.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
      
      <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm mt-6">
        <h2 className="mb-4 text-xs font-black text-slate-950">Recent calls</h2>
        <CallHistory limit={10} />
      </section>
    </div>
  );
};

export default SellerDashboard;
