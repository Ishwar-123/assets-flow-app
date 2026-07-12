import React, { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext, getConfig } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { Bell, Check, BellRing, ChevronDown, LogOut, Moon, Sun } from 'lucide-react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const config = getConfig();
      if (!config) return;
      const { data } = await axios.get('http://localhost:5000/api/notifications', config);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, getConfig());
      fetchNotifications();
    } catch (error) {
      console.error('Error marking as read', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('http://localhost:5000/api/notifications/read-all', {}, getConfig());
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read', error);
    }
  };

  // Page title from route
  const getPageTitle = () => {
    const titles = {
      '/': 'Dashboard',
      '/organization': 'Organization Setup',
      '/assets': 'Asset Directory',
      '/allocations': 'Allocations',
      '/maintenance': 'Maintenance',
      '/audits': 'Audit Cycles',
      '/booking': 'Resource Booking',
      '/analytics': 'Reports & Analytics',
      '/logs': 'Activity Logs',
    };
    return titles[location.pathname] || 'AssetFlow';
  };

  const getTimeGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (!user) return null;

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80 h-16 flex items-center justify-between px-6 relative z-40 shadow-sm transition-colors duration-200">
      
      {/* Left: Page Context */}
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-[15px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">{getPageTitle()}</h2>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-tight">{getTimeGreeting()}, {user.name.split(' ')[0]}</p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="relative w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
        </button>

        {/* Notification Bell */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`relative w-9 h-9 flex items-center justify-center transition-all duration-200 ${
              isDropdownOpen ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Bell size={18} strokeWidth={2} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 bg-accent-rose text-white text-[9px] font-bold shadow-sm shadow-accent-rose/30">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-[340px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/50 rounded-none overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <BellRing size={14} className="text-brand-600 dark:text-brand-400" />
                  <h3 className="text-[13px] font-bold text-slate-900 dark:text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 border border-brand-100 dark:border-brand-800 px-1.5 py-0.5">{unreadCount} new</span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 transition-colors">
                    Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto scrollbar-hide">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell size={24} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-[12px] text-slate-400 dark:text-slate-500 font-medium">No notifications yet</p>
                  </div>
                ) : (
                  notifications.slice(0, 8).map(notif => (
                    <div
                      key={notif._id}
                      className={`px-4 py-3 border-b border-slate-50 dark:border-slate-800/50 relative group cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${!notif.isRead ? 'bg-brand-50/20 dark:bg-brand-900/10' : ''}`}
                      onClick={() => !notif.isRead && markAsRead(notif._id)}
                    >
                      {!notif.isRead && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-brand-500 dark:bg-brand-400"></div>}
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-bold text-brand-700 dark:text-brand-300 bg-brand-100/60 dark:bg-brand-900/40 px-1.5 py-0.5">
                          {notif.type.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        {!notif.isRead && (
                          <button onClick={(e) => markAsRead(notif._id, e)} className="text-slate-400 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 opacity-0 group-hover:opacity-100 transition-all">
                            <Check size={12} />
                          </button>
                        )}
                      </div>
                      <p className="text-[12px] text-slate-700 dark:text-slate-300 font-medium leading-snug">{notif.message}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 font-mono">{new Date(notif.createdAt).toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-center">
                <Link to="/logs" onClick={() => setIsDropdownOpen(false)} className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 transition-colors">
                  View all notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1"></div>

        {/* Profile Section */}
        <div ref={profileRef} className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 pl-2 pr-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 group"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center text-[13px] font-bold shadow-md shadow-brand-500/20">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-[12px] font-bold text-slate-800 dark:text-slate-200 leading-tight">{user.name}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-tight">{user.role}</p>
            </div>
            <ChevronDown size={14} className={`text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/50 rounded-none overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <p className="text-[12px] font-bold text-slate-800 dark:text-slate-200">{user.name}</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">{user.email}</p>
              </div>
              <button
                onClick={() => { setIsProfileOpen(false); logout(); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-[12px] font-medium text-slate-600 dark:text-slate-300 hover:text-accent-rose dark:hover:text-accent-rose hover:bg-accent-rose/5 dark:hover:bg-accent-rose/10 transition-all"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
