import React, { useState, useEffect } from 'react';
import { CheckCircle2, Bell } from 'lucide-react';
import API from '../../api/axios';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/shoppayments/notifications');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error('Error fetching notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 200000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async () => {
    try {
      await API.put('/shoppayments/notifications/read');
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking as read', err);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600">
            <Bell size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
            <p className="text-sm text-slate-500">Manage your payment alerts and updates</p>
          </div>
        </div>
        
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAsRead} 
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-md font-semibold transition-colors"
          >
            <CheckCircle2 size={18} />
            Mark all as read
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-slate-500 flex flex-col items-center">
            <Bell className="h-12 w-12 text-slate-300 mb-4" />
            <p className="text-lg font-medium">No notifications yet</p>
            <p className="text-sm">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map(notif => (
              <div 
                key={notif._id} 
                className={`p-4 sm:p-6 transition-colors ${notif.read ? 'bg-white hover:bg-slate-50' : 'bg-indigo-50/50 hover:bg-indigo-50'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className={`text-base font-bold ${notif.read ? 'text-slate-700' : 'text-indigo-900'}`}>
                    {notif.title}
                  </h4>
                  <span className="text-xs font-medium text-slate-400 whitespace-nowrap ml-4 bg-slate-100 px-2 py-1 rounded-full">
                    {new Date(notif.createdAt).toLocaleString([], {
                      month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'
                    })}
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{notif.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
