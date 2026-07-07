import React, { useEffect, useRef, useState } from 'react';
import API from '../../api/axios';
import { Loader2, Mail, Phone, ShieldCheck, UserCircle, Camera, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const numberFormatter = new Intl.NumberFormat('en-IN');

// Module-level cache for instant re-navigation
let cachedSummary = null;
let hasFetchedProfile = false;

const ManagerProfile = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(cachedSummary);
  const [loading, setLoading] = useState(!hasFetchedProfile);
  const [managerScannerPhoto, setManagerScannerPhoto] = useState(null);
  const [scannerLoading, setScannerLoading] = useState(false);
  const [scannerMessage, setScannerMessage] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await API.get('/reports/summary');
        setSummary(response.data);
        cachedSummary = response.data;
        hasFetchedProfile = true;
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
    fetchManagerScanner();
  }, []);

  const fetchManagerScanner = async () => {
    try {
      const response = await API.get('/auth/me');
      setManagerScannerPhoto(response.data.user.managerScannerPhoto || null);
    } catch (err) {
      console.error('Failed to fetch manager scanner:', err);
    }
  };

  const handleScannerUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const photoData = e.target?.result;
      if (!photoData) return;

      setScannerLoading(true);
      setScannerMessage('Uploading scanner image...');

      try {
        const response = await API.patch('/auth/me/scanner', {
          managerScannerPhoto: photoData
        });
        setManagerScannerPhoto(response.data.managerScannerPhoto || null);
        setScannerMessage('Scanner image saved successfully. Sellers can now use it for online payments.');
      } catch (err) {
        console.error(err);
        setScannerMessage(err.response?.data?.message || 'Upload failed. Please try again.');
      } finally {
        setScannerLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveScanner = async () => {
    setScannerLoading(true);
    setScannerMessage('Removing scanner image...');

    try {
      const response = await API.patch('/auth/me/scanner', {
        managerScannerPhoto: null
      });
      setManagerScannerPhoto(response.data.managerScannerPhoto || null);
      setScannerMessage('Scanner image removed. Sellers will need to capture online payment proof manually.');
    } catch (err) {
      console.error(err);
      setScannerMessage(err.response?.data?.message || 'Failed to remove scanner image.');
    } finally {
      setScannerLoading(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl space-y-4 p-3 sm:p-5 lg:p-8">
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

      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-md bg-slate-100 p-2 text-slate-700">
            <Camera size={20} />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-black text-slate-900">Default Scanner Proof</h2>
            <p className="text-sm text-slate-500">Upload a default online payment receipt image that sellers can use automatically when they select Online payment.</p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {managerScannerPhoto ? (
            <div className="rounded border border-slate-200 bg-slate-50 p-3">
              <img src={managerScannerPhoto} alt="Manager scanner proof" className="max-h-64 w-full rounded object-contain" />
            </div>
          ) : (
            <div className="rounded border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
              No scanner image uploaded. Sellers will be prompted to capture their own proof when they choose Online payment.
            </div>
          )}

          {scannerMessage && (
            <p className="text-sm text-slate-600">{scannerMessage}</p>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={scannerLoading}
              className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-70"
            >
              <Camera size={16} />
              {managerScannerPhoto ? 'Update Scanner' : 'Upload Scanner'}
            </button>
            {managerScannerPhoto && (
              <button
                type="button"
                onClick={handleRemoveScanner}
                disabled={scannerLoading}
                className="inline-flex items-center gap-2 rounded border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-70"
              >
                <Trash2 size={16} />
                Remove
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleScannerUpload}
            className="hidden"
          />
        </div>
      </section>
    </div>
  );
};

export default ManagerProfile;
