import React, { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext, getConfig } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { Bell, Check, BellRing, ChevronDown, LogOut, Moon, Sun, Activity } from 'lucide-react';
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
  const [currentTime, setCurrentTime] = useState(new Date());
  const dropdownRef = useRef(null);
  const profileRef = useRef(null);

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  const formatDate = (d) => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${String(d.getDate()).padStart(2,'0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
  };

  const formatTime = (d) => {
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;
  };

  if (!user) return null;

  return (
    <header className="flex items-center justify-between px-6 h-[56px] w-full select-none z-30 shadow-sm relative" style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-default)' }}>
      {/* Left side: Page Title & System Status */}
      <div className="flex items-center space-x-6">
        <div>
          <h2 className="text-md font-extrabold tracking-tight leading-tight" style={{ color: 'var(--text-primary)' }}>{getPageTitle()}</h2>
        </div>

        <div className="hidden lg:flex items-center space-x-1.5 px-2 py-1" style={{ background: 'rgba(21, 128, 61, 0.1)', border: '1px solid rgba(21, 128, 61, 0.2)' }}>
          <div className="h-1.5 w-1.5 animate-pulse" style={{ background: 'var(--color-success)' }}></div>
          <span className="text-[9px] font-mono font-black tracking-widest uppercase" style={{ color: 'var(--color-success)' }}>System Online</span>
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center space-x-4">
        {/* Live Clock */}
        <div className="hidden md:flex items-center space-x-2 px-3 pr-4" style={{ borderRight: '1px solid var(--border-default)' }}>
          <span className="font-mono text-[11px] font-bold tracking-widest uppercase" style={{ color: 'var(--text-secondary)' }}>
            {formatDate(currentTime)}
          </span>
          <span style={{ color: 'var(--text-secondary)' }}>|</span>
          <span className="font-mono text-xs font-black tracking-widest" style={{ color: 'var(--color-primary)' }}>
            {formatTime(currentTime)}
          </span>
        </div>

        {/* Action Icons */}
        <div className="flex items-center space-x-1.5">
          {/* Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 transition-all focus:outline-none"
            style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)', background: 'var(--bg-surface)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-primary)'; e.currentTarget.style.background = 'var(--bg-surface-2)'; e.currentTarget.style.borderColor = 'rgba(79, 70, 229, 0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.borderColor = 'var(--border-default)'; }}
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Notification bell */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => { setIsDropdownOpen(!isDropdownOpen); setIsProfileOpen(false); }}
              className="p-2 transition-all focus:outline-none relative"
              style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)', background: isDropdownOpen ? 'var(--bg-surface-2)' : 'var(--bg-surface)' }}
              title="Notifications"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 text-white font-bold text-[9px] flex items-center justify-center translate-x-1/3 -translate-y-1/3 shadow-sm animate-pulse" style={{ background: 'var(--color-error)' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-80 shadow-xl py-1.5 z-50" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', backdropFilter: 'blur(12px)' }}>
                  <div className="px-4 py-2 text-xs font-bold select-none flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-default)', color: 'var(--text-primary)' }}>
                    <span className="flex items-center space-x-1.5">
                      <Activity size={14} style={{ color: 'var(--color-primary)' }} />
                      <span>Alert Center</span>
                    </span>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-[10px] font-bold transition-colors" style={{ color: 'var(--color-primary)' }}>
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 flex flex-col items-center justify-center text-center text-xs space-y-2" style={{ color: 'var(--text-secondary)' }}>
                        <Bell size={24} style={{ color: 'var(--border-strong)' }} />
                        <span>No active notifications</span>
                      </div>
                    ) : (
                      notifications.slice(0, 8).map(notif => (
                        <div
                          key={notif._id}
                          className="px-4 py-3 relative group cursor-pointer transition-colors border-l-2 border-l-transparent"
                          style={{ borderBottom: '1px solid var(--border-default)', ...(notif.isRead ? {} : { borderLeftColor: 'var(--color-primary)', background: 'var(--color-primary-light)' }) }}
                          onClick={() => !notif.isRead && markAsRead(notif._id)}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-surface-2)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = notif.isRead ? 'transparent' : 'var(--color-primary-light)'; }}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-bold px-1.5 py-0.5" style={{ color: 'var(--color-primary)', background: 'var(--color-primary-light)' }}>
                              {notif.type.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            {!notif.isRead && (
                              <button onClick={(e) => markAsRead(notif._id, e)} className="opacity-0 group-hover:opacity-100 transition-all" style={{ color: 'var(--text-muted)' }}>
                                <Check size={12} />
                              </button>
                            )}
                          </div>
                          <p className="text-xs font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>{notif.message}</p>
                          <p className="text-[10px] mt-1.5 font-mono" style={{ color: 'var(--text-muted)' }}>{new Date(notif.createdAt).toLocaleString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="px-4 py-2 text-center" style={{ borderTop: '1px solid var(--border-default)', background: 'var(--bg-surface-2)' }}>
                    <Link to="/logs" onClick={() => setIsDropdownOpen(false)} className="text-[11px] font-bold transition-colors" style={{ color: 'var(--color-primary)' }}>
                      View all notifications →
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="h-6 w-px mx-1 hidden sm:block" style={{ background: 'var(--border-default)' }}></div>

        {/* Profile Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => { setIsProfileOpen(!isProfileOpen); setIsDropdownOpen(false); }}
            className="flex items-center space-x-2 p-1 pl-2 pr-3 transition-all focus:outline-none"
            style={{ border: '1px solid transparent' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.background = 'var(--bg-surface-2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'transparent'; }}
          >
            <div className="h-7 w-7 flex items-center justify-center text-xs font-bold shadow-sm" style={{ background: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(79, 70, 229, 0.3)', color: 'var(--color-primary)' }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:flex flex-col items-start min-w-0 text-left">
              <span className="text-xs font-bold leading-none truncate max-w-[100px]" style={{ color: 'var(--text-primary)' }}>{user.name}</span>
              <span className="text-[9px] font-mono mt-1 leading-none uppercase" style={{ color: 'var(--color-primary)' }}>{user.role}</span>
            </div>
            <ChevronDown size={14} className={`transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }} />
          </button>

          {/* Profile Menu Dropdown */}
          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
              <div className="absolute right-0 mt-2 w-56 shadow-xl py-1.5 z-50" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', backdropFilter: 'blur(12px)' }}>
                <div className="px-4 py-3 mb-1" style={{ borderBottom: '1px solid var(--border-default)' }}>
                  <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                  <p className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--text-secondary)' }}>{user.email}</p>
                </div>

                <div className="pt-1" style={{ borderTop: '1px solid var(--border-default)' }}>
                  <button
                    onClick={() => { setIsProfileOpen(false); logout(); }}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-xs transition-colors focus:outline-none text-left"
                    style={{ color: 'var(--color-error)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <LogOut size={14} />
                    <span className="font-bold">Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
