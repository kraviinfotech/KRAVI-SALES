import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import API from '../api/axios';
import useNotifications from '../hooks/useNotifications';

const NotificationBell = () => {
  const navigate = useNavigate();
  const { data: notifications = [], isLoading } = useNotifications(true);
  const unreadCount = (notifications && notifications.unreadCount) ? notifications.unreadCount : 0;



  const handleBellClick = async () => {
    // Navigate immediately for fast UI
    navigate('/manager/notifications');
    
    // If there are unread notifications, mark them as read so the dot disappears
    if (unreadCount > 0) {
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
