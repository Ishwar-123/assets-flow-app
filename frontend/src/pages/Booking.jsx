import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar as CalendarIcon, Clock, X, Plus, Ban, CheckCircle, AlertCircle, List, CalendarDays } from 'lucide-react';
import { getConfig } from '../context/AuthContext';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const Booking = () => {
  const [bookings, setBookings] = useState([]);
  const [assets, setAssets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ resource: '', startTime: '', endTime: '', purpose: '' });
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('calendar'); // 'list' or 'calendar'

  useEffect(() => {
    fetchBookings();
    fetchAssets();
  }, []);

  const fetchBookings = async () => {
    try {
      const config = getConfig();
      if (!config) return;
      const { data } = await axios.get('http://localhost:5000/api/bookings', config);
      setBookings(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAssets = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/assets', getConfig());
      setAssets(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('http://localhost:5000/api/bookings', formData, getConfig());
      setShowModal(false);
      setFormData({ resource: '', startTime: '', endTime: '', purpose: '' });
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book resource');
    }
  };

  const cancelBooking = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await axios.put(`http://localhost:5000/api/bookings/${id}/cancel`, {}, getConfig());
      fetchBookings();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Completed': return { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle size={12} className="mr-1" /> };
      case 'Upcoming': return { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Clock size={12} className="mr-1" /> };
      case 'Ongoing': return { color: 'bg-brand-50 text-[var(--color-primary)] border-brand-200', icon: <CalendarIcon size={12} className="mr-1" /> };
      case 'Cancelled': return { color: 'bg-[var(--bg-surface-2)] text-[var(--text-muted)] border-[var(--border-default)]', icon: <Ban size={12} className="mr-1" /> };
      default: return { color: 'bg-[var(--bg-surface-2)] text-[var(--text-secondary)] border-[var(--border-default)]', icon: null };
    }
  };

  // Group bookings by status for a dashboard-like view
  const upcomingBookings = bookings.filter(b => b.status === 'Upcoming' || b.status === 'Ongoing');
  const pastBookings = bookings.filter(b => b.status === 'Completed' || b.status === 'Cancelled');

  return (
    <div className="p-8 bg-transparent min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">Resource Bookings</h1>
          <p className="text-[var(--text-muted)] mt-1 font-medium">Book shared rooms, vehicles, and equipment.</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="bg-[var(--bg-surface)] p-1 border border-[var(--border-default)] flex shadow-sm">
            <button onClick={() => setViewMode('calendar')} className={`px-4 py-1.5 text-sm font-bold flex items-center transition-colors ${viewMode === 'calendar' ? 'bg-slate-100 text-[var(--color-primary)]' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
              <CalendarDays size={16} className="mr-2"/> Calendar
            </button>
            <button onClick={() => setViewMode('list')} className={`px-4 py-1.5 text-sm font-bold flex items-center transition-colors ${viewMode === 'list' ? 'bg-slate-100 text-[var(--color-primary)]' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
              <List size={16} className="mr-2"/> List
            </button>
          </div>
          <button onClick={() => { setShowModal(true); setError(''); }} className="px-5 py-2.5 bg-[var(--color-primary)] text-sm font-bold text-white hover:bg-[var(--color-primary-hover)] hover:-translate-y-0.5 transition-all duration-200 flex items-center shadow-lg shadow-brand-600/20">
            <Plus size={16} className="mr-2" /> New Booking
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Bookings', value: bookings.length, color: 'border-l-slate-400' },
          { label: 'Upcoming', value: bookings.filter(b => b.status === 'Upcoming').length, color: 'border-l-amber-400' },
          { label: 'Ongoing', value: bookings.filter(b => b.status === 'Ongoing').length, color: 'border-l-brand-500' },
          { label: 'Completed', value: bookings.filter(b => b.status === 'Completed').length, color: 'border-l-emerald-500' },
        ].map((stat, i) => (
          <div key={i} className={`bg-[var(--bg-surface)] border border-[var(--border-default)] border-l-4 ${stat.color} p-4 shadow-sm hover:shadow-md transition-all`}>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
            <p className="text-3xl font-extrabold text-[var(--text-primary)] mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {bookings.length === 0 ? (
        <div className="bg-[var(--bg-surface)] shadow-md border border-[var(--border-default)] p-6">
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-brand-50 border border-brand-100 flex items-center justify-center mb-4">
              <CalendarIcon size={36} className="text-[var(--color-primary)]" />
            </div>
            <h3 className="text-xl font-extrabold text-[var(--text-primary)]">No Bookings Yet</h3>
            <p className="text-[var(--text-muted)] mt-2 max-w-sm font-medium">Create a booking to reserve shared resources like meeting rooms, projectors, or vehicles.</p>
            <button onClick={() => setShowModal(true)} className="mt-6 px-5 py-2.5 bg-[var(--color-primary)] text-white text-sm font-bold hover:bg-[var(--color-primary-hover)] transition-all shadow-md inline-flex items-center gap-2">
              <Plus size={16} /> Create First Booking
            </button>
          </div>
        </div>
      ) : viewMode === 'calendar' ? (
        <div className="bg-[var(--bg-surface)] shadow-md border border-[var(--border-default)] p-6 h-[700px]">
          <Calendar
            localizer={localizer}
            events={bookings.map(b => ({
              title: `${b.resource?.name || 'Resource'} - ${b.bookedBy?.name || 'User'}`,
              start: new Date(b.startTime),
              end: new Date(b.endTime),
              allDay: false,
              resource: b
            }))}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            className="font-sans text-sm"
            eventPropGetter={(event) => {
              let backgroundColor = '#4f46e5'; // brand-600
              if (event.resource.status === 'Completed') backgroundColor = '#059669'; // emerald-600
              if (event.resource.status === 'Cancelled') backgroundColor = '#64748b'; // slate-500
              if (event.resource.status === 'Ongoing') backgroundColor = '#d97706'; // amber-600
              return { style: { backgroundColor, borderRadius: '0px', border: 'none', fontWeight: 'bold' } };
            }}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Bookings */}
          {upcomingBookings.length > 0 && (
            <div className="bg-[var(--bg-surface)] shadow-md border border-[var(--border-default)] overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-brand-50 to-white border-b border-[var(--border-default)]">
                <h3 className="text-sm font-extrabold text-brand-800 uppercase tracking-wider flex items-center gap-2">
                  <CalendarIcon size={16} className="text-[var(--color-primary)]" /> Active & Upcoming
                  <span className="bg-[var(--color-primary)] text-white text-[10px] px-2 py-0.5 font-bold ml-2">{upcomingBookings.length}</span>
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[var(--bg-surface-2)] text-[11px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-default)]">
                      <th className="px-6 py-3 font-bold">Resource</th>
                      <th className="px-6 py-3 font-bold">Booked By</th>
                      <th className="px-6 py-3 font-bold">Start</th>
                      <th className="px-6 py-3 font-bold">End</th>
                      <th className="px-6 py-3 font-bold">Purpose</th>
                      <th className="px-6 py-3 font-bold">Status</th>
                      <th className="px-6 py-3 font-bold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingBookings.map(b => {
                      const sc = getStatusConfig(b.status);
                      return (
                        <tr key={b._id} className="border-b border-[var(--border-default)] even:bg-slate-50 dark:even:bg-slate-800/50 hover:bg-[var(--bg-surface-2)]/80 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-bold text-[var(--text-primary)]">{b.resource?.name}</span>
                            <span className="text-[11px] font-mono text-slate-400 ml-2 bg-[var(--bg-surface-2)] px-1.5 py-0.5 border border-[var(--border-default)]">{b.resource?.assetTag}</span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-[var(--text-secondary)]">{b.bookedBy?.name}</td>
                          <td className="px-6 py-4 text-sm text-[var(--text-secondary)] font-mono">{new Date(b.startTime).toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-[var(--text-secondary)] font-mono">{new Date(b.endTime).toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-[var(--text-secondary)] font-medium max-w-[150px] truncate">{b.purpose}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-bold border ${sc.color}`}>
                              {sc.icon}{b.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => cancelBooking(b._id)} className="text-[12px] font-bold text-[var(--color-error)] hover:text-white bg-[var(--bg-surface)] hover:bg-accent-rose border border-accent-rose/30 hover:border-accent-rose px-3 py-1.5 transition-all shadow-sm">
                              Cancel
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Past Bookings */}
          {pastBookings.length > 0 && (
            <div className="bg-[var(--bg-surface)] shadow-md border border-[var(--border-default)] overflow-hidden">
              <div className="px-6 py-4 bg-[var(--bg-surface-2)] border-b border-[var(--border-default)]">
                <h3 className="text-sm font-extrabold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-2">
                  <Clock size={16} className="text-slate-400" /> History
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[var(--bg-surface-2)] text-[11px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-default)]">
                      <th className="px-6 py-3 font-bold">Resource</th>
                      <th className="px-6 py-3 font-bold">Booked By</th>
                      <th className="px-6 py-3 font-bold">Time</th>
                      <th className="px-6 py-3 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastBookings.map(b => {
                      const sc = getStatusConfig(b.status);
                      return (
                        <tr key={b._id} className="border-b border-[var(--border-default)] even:bg-slate-50 dark:even:bg-slate-800/50 text-[var(--text-muted)]">
                          <td className="px-6 py-3 font-medium">{b.resource?.name}</td>
                          <td className="px-6 py-3 text-sm">{b.bookedBy?.name}</td>
                          <td className="px-6 py-3 text-sm font-mono">{new Date(b.startTime).toLocaleDateString()}</td>
                          <td className="px-6 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-bold border ${sc.color}`}>
                              {sc.icon}{b.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* New Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-surface)] shadow-2xl border border-[var(--border-default)] w-full max-w-lg">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-default)] bg-gradient-to-r from-brand-50 to-white">
              <div>
                <h2 className="text-xl font-extrabold text-[var(--text-primary)]">New Booking</h2>
                <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">Reserve a shared resource</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-[var(--text-secondary)] transition-colors w-8 h-8 flex items-center justify-center hover:bg-[var(--bg-surface-2)] "><X size={18} /></button>
            </div>
            
            {error && (
              <div className="mx-6 mt-4 p-3 bg-accent-rose/10 text-[var(--color-error)] text-sm font-bold border border-accent-rose/20 flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <form onSubmit={handleBooking} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Resource</label>
                <select
                  className="w-full px-4 py-3 border border-slate-300  text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none  bg-[var(--bg-surface)] font-medium"
                  value={formData.resource} onChange={(e) => setFormData({ ...formData, resource: e.target.value })} required
                >
                  <option value="">Select Resource</option>
                  {assets.filter(a => a.isBookable).map(a => <option key={a._id} value={a._id}>{a.name} ({a.assetTag})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Start Time</label>
                  <input
                    type="datetime-local" className="w-full px-3 py-3 border border-slate-300 bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-brand-500 outline-none font-medium"
                    value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">End Time</label>
                  <input
                    type="datetime-local" className="w-full px-3 py-3 border border-slate-300 bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-brand-500 outline-none font-medium"
                    value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Purpose</label>
                <input
                  type="text" className="w-full px-4 py-3 border border-slate-300 bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-brand-500 outline-none font-medium"
                  value={formData.purpose} onChange={(e) => setFormData({ ...formData, purpose: e.target.value })} required placeholder="e.g. Team standup meeting"
                />
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 text-sm font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-[var(--color-primary)] text-white text-sm font-bold hover:bg-[var(--color-primary-hover)] shadow-lg shadow-brand-600/20 transition-all">Book Resource</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;
