import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, CheckCircle, Package } from 'lucide-react';
import useNotifications from '../../hooks/useNotifications';

const ManagerNotifications = () => {
  const { t } = useTranslation();
  const { data: notifications = [], isLoading } = useNotifications();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
        <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
          <Bell size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
          <p className="text-sm text-slate-500">Your recent updates and alerts</p>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-slate-500">Loading notifications...</div>
        ) : notifications && notifications.notifications && notifications.notifications.length > 0 ? (
          notifications.notifications.map((notification) => (
            <div
              key={notification._id}
              className={`p-4 rounded-xl border flex items-start gap-4 transition-colors ${
                !notification.read ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-slate-200'
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${
                notification.type === 'payment' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
              }`}>
                {notification.type === 'payment' ? <CheckCircle size={20} /> : <Package size={20} />}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">{notification.title}</h3>
                <p className="text-slate-600 text-sm mt-1">{notification.message}</p>
                <p className="text-xs text-slate-400 mt-2 font-medium">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm">
            <Bell size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700">No notifications yet</h3>
            <p className="text-slate-500 text-sm mt-1">We'll notify you when something important happens.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerNotifications;
