import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, BarChart3, PieChart as PieChartIcon, AlertCircle, ArrowRightLeft } from 'lucide-react';
import { getConfig } from '../context/AuthContext';

const Analytics = () => {
  const [utilization, setUtilization] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [retiring, setRetiring] = useState([]);
  const [deptSummary, setDeptSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const config = getConfig();
      if (!config) return;

      const [utilRes, maintRes, retireRes, deptRes] = await Promise.all([
        axios.get('http://localhost:5000/api/analytics/utilization', config),
        axios.get('http://localhost:5000/api/analytics/maintenance-frequency', config),
        axios.get('http://localhost:5000/api/analytics/upcoming-maintenance-retirement', config),
        axios.get('http://localhost:5000/api/analytics/department-allocation-summary', config)
      ]);

      setUtilization(utilRes.data.mostUsed || []);
      setMaintenance(maintRes.data || []);
      setRetiring(retireRes.data.retiringAssets || []);
      setDeptSummary(deptRes.data || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#4f46e5', '#0d9488', '#d97706', '#e11d48', '#8b5cf6', '#0ea5e9', '#f59e0b'];

  const handleExport = async (type) => {
    try {
      const config = getConfig();
      const response = await axios.get(`http://localhost:5000/api/analytics/export?type=${type}`, { ...config, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting:', error);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white px-4 py-3 shadow-xl border border-slate-700 text-sm">
          <p className="font-bold mb-1">{label}</p>
          {payload.map((p, i) => (
            <p key={i} className="text-slate-300 text-xs">{p.name}: <span className="text-white font-bold">{p.value}</span></p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto bg-transparent min-h-screen">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Reports & Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Actionable insights into asset utilization and lifecycle.</p>
        </div>
        <button onClick={() => handleExport('full')} className="bg-brand-600 text-white px-5 py-2.5 flex items-center gap-2 font-bold text-sm hover:bg-brand-700 hover:-translate-y-0.5 transition-all duration-200 shadow-lg shadow-brand-600/20">
          <Download size={16} /> Export All (CSV)
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500 dark:text-slate-400 font-bold animate-pulse text-xl">Loading analytics...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            
            {/* Utilization Chart */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden hover:shadow-lg transition-all group">
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-brand-50/50 to-white">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-brand-100 flex items-center justify-center"><BarChart3 size={16} className="text-brand-600" /></div>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Asset Utilization (Days)</h3>
                </div>
                <button onClick={() => handleExport('utilization')} className="text-[11px] font-bold text-brand-600 hover:text-brand-800 bg-brand-50 border border-brand-100 px-2.5 py-1 transition-colors opacity-0 group-hover:opacity-100">
                  <Download size={12} className="inline mr-1" />Export
                </button>
              </div>
              <div className="p-6 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={utilization}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="assetName" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="daysAllocated" fill="#4f46e5" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Maintenance Pie */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden hover:shadow-lg transition-all group">
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-emerald-50/50 to-white">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-100 flex items-center justify-center"><PieChartIcon size={16} className="text-emerald-600" /></div>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Maintenance by Category</h3>
                </div>
                <button onClick={() => handleExport('maintenance')} className="text-[11px] font-bold text-brand-600 hover:text-brand-800 bg-brand-50 border border-brand-100 px-2.5 py-1 transition-colors opacity-0 group-hover:opacity-100">
                  <Download size={12} className="inline mr-1" />Export
                </button>
              </div>
              <div className="p-6 h-72">
                {maintenance.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400 font-medium text-sm">No maintenance data available</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={maintenance} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="count" nameKey="categoryName" stroke="none">
                        {maintenance.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconType="square" wrapperStyle={{ fontSize: '12px', fontWeight: 600 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Department Allocations */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden hover:shadow-lg transition-all group">
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-amber-50/50 to-white">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-amber-100 flex items-center justify-center"><ArrowRightLeft size={16} className="text-amber-600" /></div>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Department Allocations</h3>
                </div>
              </div>
              <div className="p-6 h-72">
                {deptSummary.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400 font-medium text-sm">No allocation data available</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deptSummary} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <YAxis dataKey="department" type="category" width={100} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" fill="#0d9488" radius={[0, 2, 2, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Upcoming Retirements */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden hover:shadow-lg transition-all group">
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-rose-50/50 to-white">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-rose-100 flex items-center justify-center"><AlertCircle size={16} className="text-rose-600" /></div>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Upcoming Retirements</h3>
                </div>
                <button onClick={() => handleExport('retirement')} className="text-[11px] font-bold text-brand-600 hover:text-brand-800 bg-brand-50 border border-brand-100 px-2.5 py-1 transition-colors opacity-0 group-hover:opacity-100">
                  <Download size={12} className="inline mr-1" />Export
                </button>
              </div>
              <div className="p-6 max-h-72 overflow-auto">
                {retiring.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-slate-400 font-medium text-sm">No assets nearing retirement</div>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                        <th className="pb-3 font-bold">Asset Tag</th>
                        <th className="pb-3 font-bold">Name</th>
                        <th className="pb-3 font-bold">Acquired</th>
                      </tr>
                    </thead>
                    <tbody>
                      {retiring.map(r => (
                        <tr key={r._id} className="border-b border-slate-100 dark:border-slate-800 even:bg-slate-50 dark:bg-slate-800/50/30 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-3 font-mono text-sm font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 border border-slate-200 dark:border-slate-700 w-max">{r.assetTag}</td>
                          <td className="py-3 px-3 text-sm font-medium text-slate-700 dark:text-slate-300">{r.name}</td>
                          <td className="py-3 text-sm text-slate-500 dark:text-slate-400 font-mono">{new Date(r.acquisitionDate).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
