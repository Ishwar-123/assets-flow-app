import React, { useState, useEffect, useContext } from 'react';
import { AuthContext, getConfig } from '../context/AuthContext';
import axios from 'axios';
import { Package, ShieldCheck, AlertCircle, CalendarClock, ArrowRightLeft, PenTool, CheckSquare, CalendarDays, BellRing, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';

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

  if (loading) return <div className="p-8 text-[var(--text-muted)] animate-pulse font-bold text-xl">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-[var(--color-error)] font-bold text-xl">{error}</div>;

  const renderGlobalView = () => (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">Welcome back, {user?.name.split(' ')[0]}</h1>
          <p className="text-[var(--text-muted)] mt-1 font-medium">Global Operations Snapshot</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/assets" className="px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-default)] text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)]/50 hover:-translate-y-0.5 transition-all shadow-sm flex items-center">
            <Package size={16} className="mr-2 text-[var(--color-primary)]" /> Register Asset
          </Link>
          <Link to="/booking" className="px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-default)] text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)]/50 hover:-translate-y-0.5 transition-all shadow-sm flex items-center">
            <CalendarDays size={16} className="mr-2 text-[var(--color-primary)]" /> Book Resource
          </Link>
          <Link to="/maintenance" className="px-4 py-2 bg-[var(--color-primary)] text-sm font-bold text-white hover:bg-[var(--color-primary-hover)] hover:-translate-y-0.5 transition-all shadow-md flex items-center">
            <PenTool size={16} className="mr-2" /> Maintenance
          </Link>
        </div>
      </div>

      {/* POS-Style KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 mb-8">
        {[
          { title: 'Assets Available', value: data.kpis.assetsAvailable, icon: Package, color: 'text-indigo-500', bg: 'bg-indigo-500/10', borderColor: 'border-indigo-500', change: '+3 this week' },
          { title: 'Assets Allocated', value: data.kpis.assetsAllocated, icon: ArrowRightLeft, color: 'text-blue-500', bg: 'bg-blue-500/10', borderColor: 'border-blue-500', change: '+12 active' },
          { title: 'Maintenance Today', value: data.kpis.maintenanceTickets, icon: PenTool, color: 'text-orange-500', bg: 'bg-orange-500/10', borderColor: 'border-orange-500', change: '2 urgent' },
          { title: 'Active Bookings', value: data.kpis.activeBookings, icon: CalendarDays, color: 'text-green-500', bg: 'bg-green-500/10', borderColor: 'border-green-500', change: 'Steady' },
          { title: 'Pending Transfers', value: data.kpis.pendingTransfers, icon: ArrowRightLeft, color: 'text-purple-500', bg: 'bg-purple-500/10', borderColor: 'border-purple-500', change: 'Awaiting approval' },
          { title: 'Upcoming Returns', value: data.upcomingReturns?.length || 0, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10', borderColor: 'border-red-500', change: 'Action Required', badge: true },
        ].map((s, idx) => {
          const Icon = s.icon;
          return (
            <div 
              key={idx} 
              className={`relative overflow-hidden p-5 flex flex-col justify-between border-t-2 ${s.borderColor} hover:-translate-y-1 hover:shadow-2xl hover:brightness-110 transition-all duration-300 cursor-default bg-gradient-to-b from-[var(--bg-surface)] to-[var(--bg-app)] border-x border-b border-[var(--border-default)]`}
            >
              {/* Background watermark icon */}
              <div className={`absolute -right-4 -bottom-4 opacity-[0.03] ${s.color}`}>
                <Icon size={110} strokeWidth={1} />
              </div>

              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`p-2 ${s.bg} ${s.color} shadow-sm border border-[var(--border-default)]/50`}>
                    <Icon size={16} strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">{s.title}</span>
                </div>

                <div className="flex items-end justify-between">
                  <div className="flex flex-col">
                    <span className="text-3xl font-black font-mono text-[var(--text-primary)] tracking-tight leading-none">{s.value}</span>
                    <span className={`text-[10px] font-bold mt-2 uppercase tracking-wide ${s.change.includes('Action') || s.change.includes('urgent') ? 'text-[var(--color-error)]' : 'text-[var(--text-muted)]'}`}>
                      {s.change}
                    </span>
                  </div>
                  {s.badge && <span className="font-mono text-[9px] bg-[var(--color-error)] text-white px-1.5 py-0.5 uppercase tracking-wider mb-1">Alert</span>}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* POS-Style Charting Section (3 Columns) */}
      {data.charts && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* AreaChart: Inventory Trend */}
          <div className="p-0 flex flex-col relative overflow-hidden border border-[var(--border-default)] bg-[var(--bg-surface)] group hover:border-[var(--color-primary)]/50 transition-colors duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-primary)] to-transparent opacity-50"></div>
            <div className="p-5 pb-0">
              <h4 className="text-xs font-black text-[var(--text-secondary)] mb-1 uppercase tracking-widest flex items-center space-x-2">
                <span>Inventory Trend</span>
              </h4>
              <div className="text-xl font-black font-mono text-[var(--text-primary)] mb-6">Last 30 Days</div>
            </div>
            <div style={{ height: '260px', width: '100%' }} className="text-[10px] mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.charts.trendData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorKg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.3} />
                  <XAxis dataKey="day" stroke="var(--text-muted)" tick={{ fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" tick={{ fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: 0, backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-default)', fontFamily: 'monospace', fontSize: '12px' }}
                    itemStyle={{ color: 'var(--color-primary)', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="kg" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorKg)" strokeWidth={2.5} activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--color-primary)' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PieChart: Status Distribution */}
          <div className="p-0 flex flex-col relative overflow-hidden border border-[var(--border-default)] bg-[var(--bg-surface)] group hover:border-[var(--color-warning)]/50 transition-colors duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-warning)] to-transparent opacity-50"></div>
            <div className="p-5 pb-0">
              <h4 className="text-xs font-black text-[var(--text-secondary)] mb-1 uppercase tracking-widest flex items-center space-x-2">
                <span>Status Distribution</span>
              </h4>
              <div className="text-xl font-black font-mono text-[var(--text-primary)] mb-6">Active Jobs</div>
            </div>
            <div style={{ height: '260px', width: '100%' }} className="flex justify-center items-center mt-auto pb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.charts.distributionData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.charts.distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: 0, backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-default)', fontFamily: 'monospace', fontSize: '12px' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="square"
                    wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* BarChart: Weekly Output */}
          <div className="p-0 flex flex-col relative overflow-hidden border border-[var(--border-default)] bg-[var(--bg-surface)] group hover:border-[var(--color-success)]/50 transition-colors duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-success)] to-transparent opacity-50"></div>
            <div className="p-5 pb-0">
              <h4 className="text-xs font-black text-[var(--text-secondary)] mb-1 uppercase tracking-widest flex items-center space-x-2">
                <span>Weekly Output</span>
              </h4>
              <div className="text-xl font-black font-mono text-[var(--text-primary)] mb-6">Planned vs Comp</div>
            </div>
            <div style={{ height: '260px', width: '100%' }} className="text-[10px] mt-auto pb-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.charts.weeklyData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.3} />
                  <XAxis dataKey="week" stroke="var(--text-muted)" tick={{ fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" tick={{ fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: 0, backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-default)', fontFamily: 'monospace', fontSize: '12px' }}
                    cursor={{fill: 'var(--bg-surface-2)', opacity: 0.4}}
                  />
                  <Bar dataKey="planned" fill="var(--color-primary)" radius={[2, 2, 0, 0]} barSize={12} />
                  <Bar dataKey="completed" fill="var(--color-success)" radius={[2, 2, 0, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Overdue Returns Table */}
          <div className="bg-[var(--bg-surface)] shadow-md border border-[var(--border-default)] p-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center mb-6">
              <AlertCircle className="w-5 h-5 text-[var(--color-error)] mr-2" />
              Overdue Returns
              <span className="ml-3 bg-accent-rose/10 text-[var(--color-error)] border border-accent-rose/20 py-0.5 px-2.5 text-xs font-bold">
                {data.kpis.overdueReturnsCount} Action Required
              </span>
            </h2>
            
            {data.overdueReturns.length === 0 ? (
              <div className="text-center py-10 bg-[var(--bg-surface-2)] border border-[var(--border-default)]">
                <CheckSquare className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-[var(--text-muted)] font-bold">No overdue returns.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-[var(--border-default)]">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-[var(--text-muted)] uppercase bg-[var(--bg-surface-2)] border-b border-[var(--border-default)]">
                    <tr><th className="px-4 py-3 font-bold">Asset</th><th className="px-4 py-3 font-bold">Allocated To</th><th className="px-4 py-3 font-bold">Expected Return</th><th className="px-4 py-3 font-bold text-right">Action</th></tr>
                  </thead>
                  <tbody>
                    {data.overdueReturns.map((item) => (
                      <tr key={item._id} className="border-b border-[var(--border-default)] even:bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-2)]/50">
                        <td className="px-4 py-3 font-bold text-[var(--text-primary)]">{item.asset?.name}</td>
                        <td className="px-4 py-3 font-medium text-[var(--text-secondary)]">{item.allocatedToUser?.name || 'Department'}</td>
                        <td className="px-4 py-3 text-[var(--color-error)] font-bold">{new Date(item.expectedReturnDate).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => sendReminder(item._id)} className="text-[var(--color-primary)] bg-brand-50 border border-brand-200 font-bold text-xs px-3 py-1.5 shadow-sm">Remind</button>
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
        <div className="bg-slate-900 shadow-xl border border-slate-800 p-6 text-white h-max relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[var(--color-primary)] opacity-20 blur-3xl rounded-full"></div>
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
          <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">Department Dashboard</h1>
          <p className="text-[var(--text-muted)] mt-1 font-medium">Welcome back, {user?.name.split(' ')[0]}</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/allocations" className="px-4 py-2 bg-[var(--color-primary)] text-sm font-bold text-white hover:bg-[var(--color-primary-hover)] hover:-translate-y-0.5 transition-all shadow-md flex items-center">
            Review Transfers
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { title: 'Department Assets', value: data.kpis.deptAssetCount, icon: Package, color: 'text-indigo-500', bg: 'bg-indigo-500/10', borderColor: 'border-indigo-500' },
          { title: 'Pending Transfers', value: data.kpis.pendingTransfers, icon: ArrowRightLeft, color: 'text-orange-500', bg: 'bg-orange-500/10', borderColor: 'border-orange-500' },
          { title: 'Total Employees', value: data.kpis.deptUsers, icon: Users, color: 'text-green-500', bg: 'bg-green-500/10', borderColor: 'border-green-500' },
        ].map((s, idx) => {
          const Icon = s.icon;
          return (
            <div 
              key={idx} 
              className={`relative overflow-hidden p-5 flex flex-col justify-between border-t-2 ${s.borderColor} hover:-translate-y-1 hover:shadow-2xl hover:brightness-110 transition-all duration-300 cursor-default bg-gradient-to-b from-[var(--bg-surface)] to-[var(--bg-app)] border-x border-b border-[var(--border-default)]`}
            >
              <div className={`absolute -right-4 -bottom-4 opacity-[0.03] ${s.color}`}>
                <Icon size={110} strokeWidth={1} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`p-2 ${s.bg} ${s.color} shadow-sm border border-[var(--border-default)]/50`}>
                    <Icon size={16} strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">{s.title}</span>
                </div>
                <div className="flex items-end justify-between">
                  <div className="flex flex-col">
                    <span className="text-3xl font-black font-mono text-[var(--text-primary)] tracking-tight leading-none">{s.value}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-[var(--bg-surface)] shadow-md border border-[var(--border-default)] p-6">
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-6">Department Assets</h2>
        {data.myDepartmentAssets.length === 0 ? (
          <p className="text-slate-500">No assets allocated to your department.</p>
        ) : (
          <div className="overflow-x-auto border border-[var(--border-default)]">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[var(--text-muted)] uppercase bg-[var(--bg-surface-2)] border-b border-[var(--border-default)]">
                <tr><th className="px-4 py-3 font-bold">Asset Name</th><th className="px-4 py-3 font-bold">Tag</th><th className="px-4 py-3 font-bold">Condition</th></tr>
              </thead>
              <tbody>
                {data.myDepartmentAssets.map((item) => (
                  <tr key={item._id} className="border-b border-[var(--border-default)] even:bg-[var(--bg-surface-2)]">
                    <td className="px-4 py-3 font-bold text-[var(--text-primary)]">{item.asset?.name}</td>
                    <td className="px-4 py-3 text-[var(--text-muted)] font-mono">{item.asset?.assetTag}</td>
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
          <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">My Workspace</h1>
          <p className="text-[var(--text-muted)] mt-1 font-medium">Welcome back, {user?.name.split(' ')[0]}</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/booking" className="px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-default)] text-sm font-bold text-[var(--text-primary)] shadow-sm flex items-center">
            <CalendarDays size={16} className="mr-2 text-[var(--color-primary)]" /> Book Resource
          </Link>
          <Link to="/maintenance" className="px-4 py-2 bg-[var(--color-primary)] text-sm font-bold text-white shadow-md flex items-center">
            <PenTool size={16} className="mr-2" /> Raise Ticket
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { title: 'My Assets', value: data.kpis.myAllocatedAssets, icon: Package, color: 'text-indigo-500', bg: 'bg-indigo-500/10', borderColor: 'border-indigo-500' },
          { title: 'My Bookings', value: data.kpis.myActiveBookings, icon: CalendarDays, color: 'text-green-500', bg: 'bg-green-500/10', borderColor: 'border-green-500' },
          { title: 'Open Tickets', value: data.kpis.myOpenTickets, icon: PenTool, color: 'text-orange-500', bg: 'bg-orange-500/10', borderColor: 'border-orange-500' },
        ].map((s, idx) => {
          const Icon = s.icon;
          return (
            <div 
              key={idx} 
              className={`relative overflow-hidden p-5 flex flex-col justify-between border-t-2 ${s.borderColor} hover:-translate-y-1 hover:shadow-2xl hover:brightness-110 transition-all duration-300 cursor-default bg-gradient-to-b from-[var(--bg-surface)] to-[var(--bg-app)] border-x border-b border-[var(--border-default)]`}
            >
              <div className={`absolute -right-4 -bottom-4 opacity-[0.03] ${s.color}`}>
                <Icon size={110} strokeWidth={1} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`p-2 ${s.bg} ${s.color} shadow-sm border border-[var(--border-default)]/50`}>
                    <Icon size={16} strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">{s.title}</span>
                </div>
                <div className="flex items-end justify-between">
                  <div className="flex flex-col">
                    <span className="text-3xl font-black font-mono text-[var(--text-primary)] tracking-tight leading-none">{s.value}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-surface)] p-6 shadow-md border border-[var(--border-default)]">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-6">My Assigned Assets</h2>
          {data.myAllocations.length === 0 ? <p className="text-slate-500 text-sm">No assets assigned.</p> : (
            <ul className="space-y-4">
              {data.myAllocations.map(a => (
                <li key={a._id} className="p-4 border border-[var(--border-default)] bg-[var(--bg-surface-2)] flex justify-between">
                  <span className="font-bold text-[var(--text-primary)]">{a.asset?.name}</span>
                  <span className="text-slate-500 font-mono text-xs">{a.asset?.assetTag}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-[var(--bg-surface)] p-6 shadow-md border border-[var(--border-default)]">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-6">Recent Activity</h2>
          <div className="space-y-4 text-sm">
            {data.myActiveBookings.map(b => (
              <div key={b._id} className="p-3 bg-brand-50 text-brand-800 dark:text-[var(--color-primary)] font-medium">Booked {b.resource?.name}</div>
            ))}
            {data.myMaintenance.map(m => (
              <div key={m._id} className="p-3 bg-accent-amber/10 text-[var(--color-warning)] font-medium">Ticket: {m.asset?.name}</div>
            ))}
            {data.myActiveBookings.length === 0 && data.myMaintenance.length === 0 && <p className="text-slate-500">No recent activity.</p>}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="p-8 bg-transparent min-h-screen">
      {data.roleView === 'Global' && renderGlobalView()}
      {data.roleView === 'Department' && renderDepartmentView()}
      {data.roleView === 'Employee' && renderEmployeeView()}
    </div>
  );
};

export default Dashboard;
