import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar as CalendarIcon, Clock, X, Plus, Ban, CheckCircle, AlertCircle } from 'lucide-react';
import { getConfig } from '../context/AuthContext';

const Booking = () => {
  const [bookings, setBookings] = useState([]);
  const [assets, setAssets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ resource: '', startTime: '', endTime: '', purpose: '' });
  const [error, setError] = useState('');

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
      case 'Ongoing': return { color: 'bg-brand-50 text-brand-700 border-brand-200', icon: <CalendarIcon size={12} className="mr-1" /> };
      case 'Cancelled': return { color: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700', icon: <Ban size={12} className="mr-1" /> };
      default: return { color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700', icon: null };
    }
  };

  // Group bookings by status for a dashboard-like view
  const upcomingBookings = bookings.filter(b => b.status === 'Upcoming' || b.status === 'Ongoing');
  const pastBookings = bookings.filter(b => b.status === 'Completed' || b.status === 'Cancelled');

  return (
    <div className="p-8 max-w-7xl mx-auto bg-transparent min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Resource Bookings</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Book shared rooms, vehicles, and equipment.</p>
        </div>
        <button onClick={() => { setShowModal(true); setError(''); }} className="px-5 py-2.5 bg-brand-600 text-sm font-bold text-white hover:bg-brand-700 hover:-translate-y-0.5 transition-all duration-200 flex items-center shadow-lg shadow-brand-600/20">
          <Plus size={16} className="mr-2" /> New Booking
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Bookings', value: bookings.length, color: 'border-l-slate-400' },
          { label: 'Upcoming', value: bookings.filter(b => b.status === 'Upcoming').length, color: 'border-l-amber-400' },
          { label: 'Ongoing', value: bookings.filter(b => b.status === 'Ongoing').length, color: 'border-l-brand-500' },
          { label: 'Completed', value: bookings.filter(b => b.status === 'Completed').length, color: 'border-l-emerald-500' },
        ].map((stat, i) => (
          <div key={i} className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 border-l-4 ${stat.color} p-4 shadow-sm hover:shadow-md transition-all`}>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xl shadow-md border border-slate-200 dark:border-slate-700 p-6">
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-brand-50 border border-brand-100 flex items-center justify-center mx-auto mb-4">
              <CalendarIcon size={36} className="text-brand-300" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">No Bookings Yet</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto font-medium">Create a booking to reserve shared resources like meeting rooms, projectors, or vehicles.</p>
            <button onClick={() => setShowModal(true)} className="mt-6 px-5 py-2.5 bg-brand-600 text-white text-sm font-bold hover:bg-brand-700 transition-all shadow-md inline-flex items-center gap-2">
              <Plus size={16} /> Create First Booking
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Bookings */}
          {upcomingBookings.length > 0 && (
            <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-brand-50 to-white border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-extrabold text-brand-800 uppercase tracking-wider flex items-center gap-2">
                  <CalendarIcon size={16} className="text-brand-600" /> Active & Upcoming
                  <span className="bg-brand-600 text-white text-[10px] px-2 py-0.5 font-bold ml-2">{upcomingBookings.length}</span>
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
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
                        <tr key={b._id} className="border-b border-slate-100 dark:border-slate-800 even:bg-slate-50 dark:bg-slate-800/50/30 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-bold text-slate-900 dark:text-white">{b.resource?.name}</span>
                            <span className="text-[11px] font-mono text-slate-400 ml-2 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 border border-slate-200 dark:border-slate-700">{b.resource?.assetTag}</span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">{b.bookedBy?.name}</td>
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-mono">{new Date(b.startTime).toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-mono">{new Date(b.endTime).toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-medium max-w-[150px] truncate">{b.purpose}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-bold border ${sc.color}`}>
                              {sc.icon}{b.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => cancelBooking(b._id)} className="text-[12px] font-bold text-accent-rose hover:text-white bg-white dark:bg-slate-900 hover:bg-accent-rose border border-accent-rose/30 hover:border-accent-rose px-3 py-1.5 transition-all shadow-sm">
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
            <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Clock size={16} className="text-slate-400" /> History
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
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
                        <tr key={b._id} className="border-b border-slate-100 dark:border-slate-800 even:bg-slate-50 dark:bg-slate-800/50/30 text-slate-500 dark:text-slate-400">
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
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-brand-50 to-white">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">New Booking</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Reserve a shared resource</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 "><X size={18} /></button>
            </div>
            
            {error && (
              <div className="mx-6 mt-4 p-3 bg-accent-rose/10 text-accent-rose text-sm font-bold border border-accent-rose/20 flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <form onSubmit={handleBooking} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Resource</label>
                <select
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700  text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none  bg-white dark:bg-slate-800 font-medium"
                  value={formData.resource} onChange={(e) => setFormData({ ...formData, resource: e.target.value })} required
                >
                  <option value="">Select Resource</option>
                  {assets.map(a => <option key={a._id} value={a._id}>{a.name} ({a.assetTag})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Start Time</label>
                  <input
                    type="datetime-local" className="w-full px-3 py-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none font-medium"
                    value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">End Time</label>
                  <input
                    type="datetime-local" className="w-full px-3 py-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none font-medium"
                    value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Purpose</label>
                <input
                  type="text" className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none font-medium"
                  value={formData.purpose} onChange={(e) => setFormData({ ...formData, purpose: e.target.value })} required placeholder="e.g. Team standup meeting"
                />
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-brand-600 text-white text-sm font-bold hover:bg-brand-700 shadow-lg shadow-brand-600/20 transition-all">Book Resource</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;
