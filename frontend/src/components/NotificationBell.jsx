import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, CheckCircle2 } from 'lucide-react';
import API from '../api/axios';

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/shoppayments/notifications');
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error('Error fetching notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);



  const handleBellClick = async () => {
    // Navigate immediately for fast UI
    navigate('/manager/notifications');
    
    // If there are unread notifications, mark them as read so the dot disappears
    if (unreadCount > 0) {
      setUnreadCount(0);
      try {
        await API.put('/shoppayments/notifications/read');
      } catch (err) {
        console.error('Error marking notifications as read', err);
      }
    }
  };

  return (
    <button 
      onClick={handleBellClick}
      className="relative p-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
    >
      <Bell size={20} />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-slate-900"></span>
      )}
    </button>
  );
};

export default NotificationBell;
