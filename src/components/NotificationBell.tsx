import React, { useState } from 'react';
import { Bell, ShoppingCart, Truck, CheckCircle, AlertTriangle, TrendingDown } from 'lucide-react';
import { SELLER_NOTIFICATIONS } from '../data/mockData';

export default function NotificationBell({ role }: { role?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(SELLER_NOTIFICATIONS);

  if (role !== 'seller') {
    return (
      <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 rounded-lg transition-colors">
        <Bell className="w-5 h-5" />
        <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
      </button>
    );
  }

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'NEW_ORDER': return <ShoppingCart className="w-4 h-4 text-emerald-600" />;
      case 'DRIVER_ACCEPTED': return <Truck className="w-4 h-4 text-blue-600" />;
      case 'ORDER_DELIVERED': return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'URGENT_ALERT': return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'PRICE_ALERT': return <TrendingDown className="w-4 h-4 text-rose-600" />;
      default: return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 rounded-lg transition-colors focus:outline-none"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center h-4 w-4 rounded-full bg-rose-500 ring-2 ring-white text-[9px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-sm text-slate-800">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>
            <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
              {notifications.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`p-4 flex gap-3 hover:bg-slate-50 transition-colors cursor-pointer ${notification.unread ? 'bg-emerald-50/30 border-l-2 border-emerald-500' : 'border-l-2 border-transparent'}`}
                    >
                      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${notification.unread ? 'bg-white shadow-sm' : 'bg-slate-100'}`}>
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-snug ${notification.unread ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                          {notification.message}
                        </p>
                        <p className="text-[11px] font-medium text-slate-400 mt-1">{notification.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No notifications yet.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
