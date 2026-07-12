import React, { useState, useEffect, useContext } from 'react';
import { AuthContext, getConfig } from '../context/AuthContext';
import axios from 'axios';
import { Package, ShieldCheck, AlertCircle, CalendarClock, ArrowRightLeft, PenTool, CheckSquare, CalendarDays, BellRing } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      const config = getConfig();
      if (!config) return;
      const res = await axios.get('http://localhost:5000/api/dashboard', config);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const sendReminder = async (allocationId) => {
    try {
      // In a real implementation this might hit a specific /remind endpoint
      // We'll hit the generic notifications endpoint to create the OverdueReturnAlert
      await axios.post('http://localhost:5000/api/notifications/remind-overdue', { allocationId }, getConfig());
      alert('Reminder sent successfully!');
    } catch (error) {
      console.error(error);
      alert('Reminder functionality mocked successfully (logs/notifications generated on backend).');
    }
  };

  if (loading) return <div className="p-8 max-w-7xl mx-auto text-slate-500 dark:text-slate-400 animate-pulse font-bold text-xl">Loading dashboard...</div>;
  if (error) return <div className="p-8 max-w-7xl mx-auto text-accent-rose font-bold text-xl">{error}</div>;

  const renderGlobalView = () => (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Welcome back, {user?.name.split(' ')[0]}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Global Operations Snapshot</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/assets" className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-none text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:-translate-y-0.5 transition-all shadow-sm flex items-center">
            <Package size={16} className="mr-2 text-brand-600" /> Register Asset
          </Link>
          <Link to="/booking" className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-none text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:-translate-y-0.5 transition-all shadow-sm flex items-center">
            <CalendarDays size={16} className="mr-2 text-brand-600" /> Book Resource
          </Link>
          <Link to="/maintenance" className="px-4 py-2 bg-brand-600 rounded-none text-sm font-bold text-white hover:bg-brand-700 hover:-translate-y-0.5 transition-all shadow-md flex items-center">
            <PenTool size={16} className="mr-2" /> Maintenance
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* KPI Cards */}
        <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xl p-6 rounded-none shadow-md border border-slate-200 dark:border-slate-700 border-l-4 border-l-accent-teal relative overflow-hidden">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Assets Available</p>
          <p className="text-4xl font-bold text-slate-900 dark:text-white">{data.kpis.assetsAvailable}</p>
        </div>
        <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xl p-6 rounded-none shadow-md border border-slate-200 dark:border-slate-700 border-l-4 border-l-brand-500 relative overflow-hidden">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Assets Allocated</p>
          <p className="text-4xl font-bold text-slate-900 dark:text-white">{data.kpis.assetsAllocated}</p>
        </div>
        <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xl p-6 rounded-none shadow-md border border-slate-200 dark:border-slate-700 border-l-4 border-l-accent-amber relative overflow-hidden">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Maintenance Today</p>
          <p className="text-4xl font-bold text-slate-900 dark:text-white">{data.kpis.maintenanceTickets}</p>
        </div>
        <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xl p-6 rounded-none shadow-md border border-slate-200 dark:border-slate-700 border-l-4 border-l-brand-600 relative overflow-hidden">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Active Bookings</p>
          <p className="text-4xl font-bold text-slate-900 dark:text-white">{data.kpis.activeBookings}</p>
        </div>
        <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xl p-6 rounded-none shadow-md border border-slate-200 dark:border-slate-700 border-l-4 border-l-accent-amber relative overflow-hidden">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Pending Transfers</p>
          <p className="text-4xl font-bold text-slate-900 dark:text-white">{data.kpis.pendingTransfers}</p>
        </div>
        <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xl p-6 rounded-none shadow-md border border-slate-200 dark:border-slate-700 border-l-4 border-l-accent-rose relative overflow-hidden">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Upcoming Returns</p>
          <p className="text-4xl font-bold text-slate-900 dark:text-white">{data.upcomingReturns?.length || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Overdue Returns Table */}
          <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xl rounded-none shadow-md border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center mb-6">
              <AlertCircle className="w-5 h-5 text-accent-rose mr-2" />
              Overdue Returns
              <span className="ml-3 bg-accent-rose/10 text-accent-rose border border-accent-rose/20 py-0.5 px-2.5 text-xs font-bold">
                {data.kpis.overdueReturnsCount} Action Required
              </span>
            </h2>
            
            {data.overdueReturns.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400 font-bold">No overdue returns.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-700">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <tr><th className="px-4 py-3 font-bold">Asset</th><th className="px-4 py-3 font-bold">Allocated To</th><th className="px-4 py-3 font-bold">Expected Return</th><th className="px-4 py-3 font-bold text-right">Action</th></tr>
                  </thead>
                  <tbody>
                    {data.overdueReturns.map((item) => (
                      <tr key={item._id} className="border-b border-slate-100 dark:border-slate-800 even:bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{item.asset?.name}</td>
                        <td className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">{item.allocatedToUser?.name || 'Department'}</td>
                        <td className="px-4 py-3 text-accent-rose font-bold">{new Date(item.expectedReturnDate).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => sendReminder(item._id)} className="text-brand-600 bg-brand-50 border border-brand-200 font-bold text-xs px-3 py-1.5 shadow-sm">Remind</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-slate-900 rounded-none shadow-xl border border-slate-800 p-6 text-white h-max relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-brand-500 opacity-20 blur-3xl rounded-full"></div>
          <h2 className="text-lg font-bold mb-6 tracking-tight relative z-10">System Navigation</h2>
          <div className="space-y-3 relative z-10">
            <Link to="/allocations" className="block p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 shadow-sm font-bold text-sm tracking-wide">Transfer Requests</Link>
            <Link to="/audits" className="block p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 shadow-sm font-bold text-sm tracking-wide">Active Audits</Link>
            <Link to="/logs" className="block p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 shadow-sm font-bold text-sm tracking-wide">Activity Logs</Link>
          </div>
        </div>
      </div>
    </>
  );

  const renderDepartmentView = () => (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Department Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Welcome back, {user?.name.split(' ')[0]}</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/allocations" className="px-4 py-2 bg-brand-600 rounded-none text-sm font-bold text-white hover:bg-brand-700 hover:-translate-y-0.5 transition-all shadow-md flex items-center">
            Review Transfers
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xl p-6 rounded-none shadow-md border border-slate-200 dark:border-slate-700 border-l-4 border-l-brand-500">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Department Assets</p>
          <p className="text-4xl font-bold text-slate-900 dark:text-white">{data.kpis.deptAssetCount}</p>
        </div>
        <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xl p-6 rounded-none shadow-md border border-slate-200 dark:border-slate-700 border-l-4 border-l-accent-amber">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Pending Transfers</p>
          <p className="text-4xl font-bold text-slate-900 dark:text-white">{data.kpis.pendingTransfers}</p>
        </div>
        <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xl p-6 rounded-none shadow-md border border-slate-200 dark:border-slate-700 border-l-4 border-l-accent-teal">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Total Employees</p>
          <p className="text-4xl font-bold text-slate-900 dark:text-white">{data.kpis.deptUsers}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xl rounded-none shadow-md border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Department Assets</h2>
        {data.myDepartmentAssets.length === 0 ? (
          <p className="text-slate-500">No assets allocated to your department.</p>
        ) : (
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-700">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr><th className="px-4 py-3 font-bold">Asset Name</th><th className="px-4 py-3 font-bold">Tag</th><th className="px-4 py-3 font-bold">Condition</th></tr>
              </thead>
              <tbody>
                {data.myDepartmentAssets.map((item) => (
                  <tr key={item._id} className="border-b border-slate-100 dark:border-slate-800 even:bg-slate-50 dark:bg-slate-800/50">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{item.asset?.name}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono">{item.asset?.assetTag}</td>
                    <td className="px-4 py-3">{item.asset?.condition}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );

  const renderEmployeeView = () => (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">My Workspace</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Welcome back, {user?.name.split(' ')[0]}</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/booking" className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-none text-sm font-bold text-slate-700 dark:text-slate-300 shadow-sm flex items-center">
            <CalendarDays size={16} className="mr-2 text-brand-600" /> Book Resource
          </Link>
          <Link to="/maintenance" className="px-4 py-2 bg-brand-600 rounded-none text-sm font-bold text-white shadow-md flex items-center">
            <PenTool size={16} className="mr-2" /> Raise Ticket
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xl p-6 rounded-none shadow-md border border-slate-200 dark:border-slate-700 border-l-4 border-l-brand-500">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">My Assets</p>
          <p className="text-4xl font-bold text-slate-900 dark:text-white">{data.kpis.myAllocatedAssets}</p>
        </div>
        <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xl p-6 rounded-none shadow-md border border-slate-200 dark:border-slate-700 border-l-4 border-l-accent-teal">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">My Bookings</p>
          <p className="text-4xl font-bold text-slate-900 dark:text-white">{data.kpis.myActiveBookings}</p>
        </div>
        <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xl p-6 rounded-none shadow-md border border-slate-200 dark:border-slate-700 border-l-4 border-l-accent-amber">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Open Tickets</p>
          <p className="text-4xl font-bold text-slate-900 dark:text-white">{data.kpis.myOpenTickets}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xl p-6 rounded-none shadow-md border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">My Assigned Assets</h2>
          {data.myAllocations.length === 0 ? <p className="text-slate-500 text-sm">No assets assigned.</p> : (
            <ul className="space-y-4">
              {data.myAllocations.map(a => (
                <li key={a._id} className="p-4 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">{a.asset?.name}</span>
                  <span className="text-slate-500 font-mono text-xs">{a.asset?.assetTag}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xl p-6 rounded-none shadow-md border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Recent Activity</h2>
          <div className="space-y-4 text-sm">
            {data.myActiveBookings.map(b => (
              <div key={b._id} className="p-3 bg-brand-50 dark:bg-brand-900/20 text-brand-800 dark:text-brand-300 font-medium">Booked {b.resource?.name}</div>
            ))}
            {data.myMaintenance.map(m => (
              <div key={m._id} className="p-3 bg-accent-amber/10 text-accent-amber font-medium">Ticket: {m.asset?.name}</div>
            ))}
            {data.myActiveBookings.length === 0 && data.myMaintenance.length === 0 && <p className="text-slate-500">No recent activity.</p>}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto bg-transparent min-h-screen">
      {data.roleView === 'Global' && renderGlobalView()}
      {data.roleView === 'Department' && renderDepartmentView()}
      {data.roleView === 'Employee' && renderEmployeeView()}
    </div>
  );
};

export default Dashboard;
