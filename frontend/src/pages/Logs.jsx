import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Bell, Check, CheckCheck, Clock, Package, ArrowRightLeft, Wrench, Calendar, CheckSquare } from 'lucide-react';
import { getConfig } from '../context/AuthContext';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState('logs');

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const config = getConfig();
      if (!config) return;

      const [logsRes, notifRes] = await Promise.all([
        axios.get('http://localhost:5000/api/activity-logs', config),
        axios.get('http://localhost:5000/api/notifications', config)
      ]);

      setLogs(logsRes.data || []);
      setNotifications(notifRes.data.notifications || []);
      setUnreadCount(notifRes.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching logs/notifications:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, getConfig());
      fetchData();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('http://localhost:5000/api/notifications/read-all', {}, getConfig());
      fetchData();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getEntityIcon = (type) => {
    switch (type) {
      case 'Asset': return <Package size={14} className="text-[var(--color-primary)]" />;
      case 'Allocation': return <ArrowRightLeft size={14} className="text-emerald-500" />;
      case 'Maintenance': return <Wrench size={14} className="text-amber-500" />;
      case 'Booking': return <Calendar size={14} className="text-indigo-500" />;
      case 'Audit': return <CheckSquare size={14} className="text-rose-500" />;
      default: return <Activity size={14} className="text-slate-400" />;
    }
  };

  const getEntityColor = (type) => {
    switch (type) {
      case 'Asset': return 'bg-brand-50 border-brand-100 text-[var(--color-primary)]';
      case 'Allocation': return 'bg-emerald-50 border-emerald-100 text-emerald-700';
      case 'Maintenance': return 'bg-amber-50 border-amber-100 text-amber-700';
      case 'Booking': return 'bg-indigo-50 border-indigo-100 text-indigo-700';
      case 'Audit': return 'bg-rose-50 border-rose-100 text-rose-700';
      default: return 'bg-[var(--bg-surface-2)] border-[var(--border-default)] text-[var(--text-secondary)]';
    }
  };

  return (
    <div className="p-8 bg-transparent min-h-screen">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">Activity Logs & Notifications</h1>
          <p className="text-[var(--text-muted)] mt-1 font-medium">Complete system audit trail and recent events.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex mb-6 bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm p-1 w-max">
        <button 
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold transition-all ${
            activeTab === 'logs' ? 'bg-[var(--color-primary)] text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)]/50 '
          }`}
        >
          <Activity size={15} /> Activity Log
        </button>
        <button 
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold transition-all relative ${
            activeTab === 'notifications' ? 'bg-[var(--color-primary)] text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)]/50 '
          }`}
        >
          <Bell size={15} /> Notifications
          {unreadCount > 0 && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 ${
              activeTab === 'notifications' ? 'bg-[var(--bg-surface)] text-[var(--color-primary)]' : 'bg-accent-rose text-white'
            }`}>{unreadCount}</span>
          )}
        </button>
      </div>

      {/* Activity Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--border-default)] bg-gradient-to-r from-brand-50/30 to-white flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
              <Activity size={16} className="text-[var(--color-primary)]" /> System Activity Log
              <span className="bg-slate-200 text-[var(--text-secondary)] text-[10px] px-2 py-0.5 font-bold ml-1">{logs.length} entries</span>
            </h3>
          </div>

          <div className="max-h-[700px] overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-center py-20">
                <Activity size={48} className="text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold text-lg">No activity recorded yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.map((log, idx) => (
                  <div key={log._id} className="px-6 py-4 hover:bg-[var(--bg-surface-2)]/50 transition-colors flex items-start gap-4 group">
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center pt-1">
                      <div className="w-9 h-9 bg-[var(--bg-surface-2)] border border-[var(--border-default)] flex items-center justify-center flex-shrink-0 group-hover:border-brand-200 group-hover:bg-brand-50 transition-all">
                        {getEntityIcon(log.entityType)}
                      </div>
                      {idx < logs.length - 1 && <div className="w-px h-full bg-slate-200 mt-2"></div>}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-[var(--text-primary)]">{log.action}</h4>
                          {log.entityType && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 border ${getEntityColor(log.entityType)}`}>
                              {log.entityType}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 flex-shrink-0 flex items-center gap-1">
                          <Clock size={11} /> {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed">{log.details}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-5 h-5 bg-brand-100 text-[var(--color-primary)] flex items-center justify-center text-[9px] font-bold rounded-full flex-shrink-0">
                          {(log.actor?.name || 'S').charAt(0)}
                        </div>
                        <span className="text-xs text-slate-400 font-medium">{log.actor?.name || 'System'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--border-default)] bg-gradient-to-r from-amber-50/30 to-white flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
              <Bell size={16} className="text-amber-600" /> Notifications
              {unreadCount > 0 && (
                <span className="bg-accent-rose text-white text-[10px] px-2 py-0.5 font-bold">{unreadCount} Unread</span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-[12px] font-bold text-[var(--color-primary)] hover:text-brand-800 bg-brand-50 border border-brand-100 px-3 py-1.5 transition-colors flex items-center gap-1.5">
                <CheckCheck size={14} /> Mark All Read
              </button>
            )}
          </div>

          <div className="max-h-[700px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-20">
                <Bell size={48} className="text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold text-lg">You're all caught up!</p>
                <p className="text-slate-400 text-sm mt-1">No notifications at this time.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.map(n => (
                  <div key={n._id} className={`px-6 py-4 relative transition-all hover:bg-[var(--bg-surface-2)]/50 ${!n.isRead ? 'bg-brand-50/20' : ''}`}>
                    {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--color-primary)]"></div>}
                    
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 border ${!n.isRead ? 'bg-brand-100 border-brand-200 text-[var(--color-primary)]' : 'bg-[var(--bg-surface-2)] border-[var(--border-default)] text-[var(--text-muted)]'}`}>
                            {n.type.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          {!n.isRead && <span className="w-2 h-2 bg-[var(--color-primary)] rounded-full"></span>}
                        </div>
                        <p className={`text-sm font-medium leading-relaxed ${!n.isRead ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>{n.message}</p>
                        <p className="text-[11px] text-slate-400 mt-2 font-mono flex items-center gap-1">
                          <Clock size={11} /> {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                      
                      {!n.isRead && (
                        <button onClick={() => markAsRead(n._id)} className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-[var(--color-primary)] hover:bg-brand-50 border border-transparent hover:border-brand-200 transition-all" title="Mark as read">
                          <Check size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Logs;
