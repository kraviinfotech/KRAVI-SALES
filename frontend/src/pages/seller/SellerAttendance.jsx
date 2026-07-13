import React, { useState, useEffect } from 'react';
import { LogIn, LogOut } from 'lucide-react';
import API from '../../api/axios';
import { getLocation } from '../../utils/geolocation';

export default function SellerAttendance() {
  const [attendance, setAttendance] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [attendanceActionLoading, setAttendanceActionLoading] = useState(false);

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
    fetchAttendance();
    const interval = setInterval(() => {
      fetchAttendance();
    }, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (attendanceLoading) {
    return (
      <div className="rounded-lg border bg-white px-6 py-4 shadow-sm">
        Loading...
      </div>
    );
  }

  if (attendance) {
    if (attendance.logoutTime) {
      return (
        <div className="rounded-lg border border-green-200 bg-green-50 px-6 py-4 shadow-sm">
          <div className="font-bold text-green-700 bg-transparent border border-green-700">
            ✅ Checked Out
          </div>
          <div className="mt-1 text-xs text-gray-600">
            Checked In : {new Date(attendance.loginTime).toLocaleTimeString()}
          </div>
          <div className="text-xs text-gray-600">
            Checked Out : {new Date(attendance.logoutTime).toLocaleTimeString()}
          </div>
        </div>
      );
    }
    return (
      <button
        type="button"
        onClick={handleCheckOut}
        disabled={attendanceActionLoading}
        className="rounded-lg bg-red-600 px-6 py-3 text-white shadow hover:bg-red-700"
      >
        <div className="flex items-center justify-center gap-2">
          <LogOut size={18} />
          <span className="font-semibold">Check Out</span>
        </div>
        <div className="mt-1 text-xs">
          Checked In : {new Date(attendance.loginTime).toLocaleTimeString()}
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCheckIn}
      disabled={attendanceActionLoading}
      className="rounded-lg bg-green-600 px-6 py-3 text-white shadow hover:bg-green-700"
    >
      <div className="flex items-center justify-center gap-2">
        <LogIn size={18} />
        <span className="font-semibold">Check In</span>
      </div>
    </button>
  );
}
