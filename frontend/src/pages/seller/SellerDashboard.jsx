import React, { useEffect, useState, useCallback } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import API from '../../api/axios';
import {
  AlertCircle,
  Plus,
  LogIn,
  LogOut,
  Clock,
  MapPin
} from 'lucide-react';

const translations = {
  en: {
    startSelling: "Start Selling", todaySummary: "Today Summary", totalVisits: "Total Visits",
    totalSales: "Total Sales", totalItems: "Total Items", errorLoading: "Today summary could not be loaded."
  },
  hi: {
    startSelling: "बेचना शुरू करें", todaySummary: "आज का सारांश", totalVisits: "कुल विज़िट",
    totalSales: "कुल बिक्री", totalItems: "कुल आइटम", errorLoading: "आज का सारांश लोड नहीं हो पाया।"
  },
  mr: {
    startSelling: "विक्री सुरू करा", todaySummary: "आजचा सारांश", totalVisits: "एकूण भेटी",
    totalSales: "एकूण विक्री", totalItems: "एकूण वस्तू", errorLoading: "आजचा सारांश लोड होऊ शकला नाही."
  }
};

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

let cachedStats = null;
let hasFetchedStats = false;

const SellerDashboard = () => {
  const { lang } = useOutletContext(); // Get language from SellerLayout
  const t = translations[lang || 'en'];
  const [stats, setStats] = useState(cachedStats || { visits: 0, sales: 0, items: 0 });
  const [loading, setLoading] = useState(!hasFetchedStats);
  const [error, setError] = useState('');

  const [attendance, setAttendance] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [attendanceActionLoading, setAttendanceActionLoading] = useState(false);

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
    const interval = setInterval(() => {
      fetchTodayStats(true);
      fetchAttendance();
    }, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchTodayStats]);


  const summaryRows = [
    { label: t.totalVisits, value: loading ? '--' : String(stats.visits).padStart(2, '0') },
    { label: t.totalSales, value: loading ? '--' : currencyFormatter.format(stats.sales) },
    { label: t.totalItems, value: loading ? '--' : stats.items }
  ];

  return (
    <div className="space-y-16">

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



















      <Link
        to="/sell/shop"
        className="flex h-14 mt-2 w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-black text-white shadow-sm transition-colors hover:bg-blue-800"
      >
        <Plus size={17} />
        <span>{t.startSelling}</span>
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
    </div>
  );
};

export default SellerDashboard;
