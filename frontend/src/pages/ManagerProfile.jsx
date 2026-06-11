import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import { Loader2, Mail, Phone, ShieldCheck, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const numberFormatter = new Intl.NumberFormat('en-IN');

const ManagerProfile = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await API.get('/reports/summary');
        setSummary(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <div className="rounded-md bg-blue-50 p-2 text-blue-700">
          <UserCircle size={22} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Manager Account</p>
          <h1 className="text-2xl font-black text-slate-950">Profile</h1>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-md bg-slate-900 text-xl font-black text-white">
              {(user?.name || 'M').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-xl font-black text-slate-950">{user?.name || 'Manager'}</h2>
              <p className="text-sm font-semibold capitalize text-slate-500">{user?.role || 'manager'}</p>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-sm">
            <div className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 font-semibold text-slate-700">
              <Phone size={16} className="text-blue-700" />
              <span>{user?.mobile || 'Not available'}</span>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 font-semibold text-slate-700">
              <Mail size={16} className="text-blue-700" />
              <span>{user?.email || 'Not available'}</span>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 font-semibold text-emerald-700">
              <ShieldCheck size={16} />
              <span>Manager access active</span>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-black text-slate-900">Team Snapshot</h2>
          {loading ? (
            <div className="flex items-center gap-2 py-8 text-sm font-semibold text-slate-500">
              <Loader2 className="animate-spin text-blue-700" size={18} />
              Loading profile stats...
            </div>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Total Sellers</p>
                <p className="mt-2 text-2xl font-black text-blue-700">
                  {numberFormatter.format(summary?.totalSellers || 0)}
                </p>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Total Records</p>
                <p className="mt-2 text-2xl font-black text-blue-700">
                  {numberFormatter.format(summary?.totalRecords || 0)}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ManagerProfile;
