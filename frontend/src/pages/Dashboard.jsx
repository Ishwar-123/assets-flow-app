import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Package, ShieldCheck, AlertCircle, CalendarClock, ArrowRightLeft, PenTool, CheckSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const res = await axios.get('http://localhost:5000/api/dashboard', config);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="p-6 text-gray-500 animate-pulse">Loading dashboard...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name.split(' ')[0]}</h1>
          <p className="text-gray-500 mt-1">Here's your operational snapshot for today.</p>
        </div>
        <div className="flex space-x-4">
          <Link to="/assets" className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center shadow-sm">
            <Package size={16} className="mr-2 text-indigo-500" /> Register Asset
          </Link>
          <Link to="/maintenance" className="px-4 py-2 bg-indigo-600 rounded-lg text-sm font-medium text-white hover:bg-indigo-700 transition-colors flex items-center shadow-md">
            <PenTool size={16} className="mr-2" /> Raise Maintenance
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Package size={64} className="text-indigo-600" />
          </div>
          <p className="text-sm font-medium text-gray-500">Assets Available</p>
          <p className="text-4xl font-bold text-gray-900 mt-2">{data.kpis.assetsAvailable}</p>
          <div className="mt-4 flex items-center text-xs text-green-600 bg-green-50 w-max px-2 py-1 rounded-full">
            <span className="font-semibold">Ready to deploy</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldCheck size={64} className="text-blue-600" />
          </div>
          <p className="text-sm font-medium text-gray-500">Assets Allocated</p>
          <p className="text-4xl font-bold text-gray-900 mt-2">{data.kpis.assetsAllocated}</p>
          <div className="mt-4 flex items-center text-xs text-blue-600 bg-blue-50 w-max px-2 py-1 rounded-full">
            <span className="font-semibold">Currently in use</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CalendarClock size={64} className="text-purple-600" />
          </div>
          <p className="text-sm font-medium text-gray-500">Active Bookings</p>
          <p className="text-4xl font-bold text-gray-900 mt-2">{data.kpis.activeBookings}</p>
          <div className="mt-4 flex items-center text-xs text-purple-600 bg-purple-50 w-max px-2 py-1 rounded-full">
            <span className="font-semibold">Shared resources</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <PenTool size={64} className="text-amber-600" />
          </div>
          <p className="text-sm font-medium text-gray-500">Maintenance Tickets</p>
          <p className="text-4xl font-bold text-gray-900 mt-2">{data.kpis.maintenanceTickets}</p>
          <div className="mt-4 flex items-center text-xs text-amber-600 bg-amber-50 w-max px-2 py-1 rounded-full">
            <span className="font-semibold">Pending or in progress</span>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              Overdue Returns
              <span className="ml-3 bg-red-100 text-red-600 py-0.5 px-2.5 rounded-full text-xs font-bold">
                {data.kpis.overdueReturnsCount} Action Required
              </span>
            </h2>
          </div>
          
          {data.overdueReturns.length === 0 ? (
            <div className="text-center py-10">
              <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">All assets are on track. No overdue returns.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 rounded-lg">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Asset</th>
                    <th className="px-4 py-3">Allocated To</th>
                    <th className="px-4 py-3">Expected Return</th>
                    <th className="px-4 py-3 rounded-tr-lg">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.overdueReturns.map((item) => (
                    <tr key={item._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {item.asset?.name} <span className="text-gray-500 text-xs ml-1">({item.asset?.assetTag})</span>
                      </td>
                      <td className="px-4 py-3">{item.allocatedToUser?.name || 'Department'}</td>
                      <td className="px-4 py-3 text-red-500 font-medium">
                        {new Date(item.expectedReturnDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-indigo-600 hover:text-indigo-900 font-medium text-xs bg-indigo-50 px-2 py-1 rounded">
                          Send Reminder
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-gradient-to-br from-gray-900 to-indigo-900 rounded-2xl shadow-md p-6 text-white relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>
          <h2 className="text-lg font-semibold mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/allocations" className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm group">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                  <ArrowRightLeft size={16} className="text-indigo-200" />
                </div>
                <span className="font-medium text-sm">Transfer Requests</span>
              </div>
              <span className="text-xs bg-indigo-500 px-2 py-1 rounded-full text-white group-hover:bg-indigo-400 transition-colors">Pending</span>
            </Link>
            <Link to="/audits" className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                  <CheckSquare size={16} className="text-indigo-200" />
                </div>
                <span className="font-medium text-sm">Start Audit Cycle</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
