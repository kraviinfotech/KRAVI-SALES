import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function CallHistory({ limit = 20 }) {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const res = await API.get('/calls/history', { params: { limit } });
        if (!mounted) return;
        setCalls(res.data.calls || []);
      } catch (err) {
        console.error('Failed to load call history', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetch();
    return () => { mounted = false; };
  }, [limit]);

  if (loading) return <div className="p-4 text-sm text-slate-500">Loading call history...</div>;
  if (!calls.length) return <div className="p-4 text-sm text-slate-500">No recent calls.</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-xs font-black uppercase text-slate-600">
          <tr>
            <th className="px-3 py-2 text-left">When</th>
            <th className="px-3 py-2 text-left">Caller</th>
            <th className="px-3 py-2 text-left">Receiver</th>
            <th className="px-3 py-2 text-left">Type</th>
            <th className="px-3 py-2 text-right">Duration</th>
            <th className="px-3 py-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100">
          {calls.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50">
                  <td className="px-3 py-2 text-slate-600">{new Date(c.createdAt).toLocaleString()}</td>
                  <td className="px-3 py-2 font-semibold text-slate-900">{c.caller?.name || c.caller?.userId || 'Unknown'}</td>
                  <td className="px-3 py-2 text-slate-700">{c.receiver?.name || c.receiver?.userId || 'Unknown'}</td>
                  <td className="px-3 py-2 capitalize">{c.callType}</td>
                  <td className="px-3 py-2 text-right">{c.durationSeconds ? formatDuration(c.durationSeconds) : '-'}</td>
                  <td className="px-3 py-2">{c.status}</td>
                  <td className="px-3 py-2 text-sm text-slate-600">{getDirectionLabel(c, user)}</td>
                </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatDuration(seconds) {
  const s = Number(seconds) || 0;
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  // Show hours and minutes when available, otherwise minutes or seconds
  if (hrs > 0) return `${hrs}h ${mins}m`;
  if (mins > 0) return `${mins}m`;
  return `${s}s`;
}

function getDirectionLabel(call, user) {
  if (!user) return '-';
  const uid = String(user._id || user.id || user._id);
  const callerId = String(call.caller?.userId || call.caller?.userId?._id || '');
  if (callerId === uid) return 'Outgoing';
  return 'Incoming';
}
