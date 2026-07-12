import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis } from 'recharts';
import { Download, BarChart3, PieChart as PieChartIcon, AlertCircle, ArrowRightLeft, Calendar as CalendarIcon } from 'lucide-react';
import { getConfig } from '../context/AuthContext';

import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Analytics = () => {
  const [utilization, setUtilization] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [retiring, setRetiring] = useState([]);
  const [deptSummary, setDeptSummary] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const config = getConfig();
      if (!config) return;

      const [utilRes, maintRes, retireRes, deptRes, heatRes] = await Promise.all([
        axios.get('http://localhost:5000/api/analytics/utilization', config),
        axios.get('http://localhost:5000/api/analytics/maintenance-frequency', config),
        axios.get('http://localhost:5000/api/analytics/upcoming-maintenance-retirement', config),
        axios.get('http://localhost:5000/api/analytics/department-allocation-summary', config),
        axios.get('http://localhost:5000/api/analytics/booking-heatmap', config)
      ]);

      setUtilization(utilRes.data.mostUsed || []);
      setMaintenance(maintRes.data || []);
      setRetiring(retireRes.data.retiringAssets || []);
      setDeptSummary(deptRes.data || []);
      
      // Process heatmap data
      const bookings = heatRes.data || [];
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      let heat = [];
      for(let d=0; d<7; d++) {
        for(let h=0; h<24; h++) {
          heat.push({ dayIndex: d, day: days[d], hour: h, count: 0 });
        }
      }
      bookings.forEach(b => {
        const start = new Date(b.startTime);
        const day = start.getDay();
        const hour = start.getHours();
        const item = heat.find(x => x.dayIndex === day && x.hour === hour);
        if (item) item.count++;
      });
      setHeatmapData(heat.filter(h => h.count > 0)); // Only show points with bookings
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

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text('AssetFlow Executive Report', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // 1. Asset Utilization Table
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text('1. Top Asset Utilization (Days)', 14, 45);
    
    const utilData = utilization.map(u => [u.assetName, u.daysAllocated]);
    doc.autoTable({
      startY: 50,
      head: [['Asset Name', 'Days Allocated']],
      body: utilData,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] } // brand-600
    });

    // 2. Department Allocation Summary
    const finalY = doc.lastAutoTable.finalY || 50;
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text('2. Department Allocations', 14, finalY + 15);
    
    const deptData = deptSummary.map(d => [d.department, d.count]);
    doc.autoTable({
      startY: finalY + 20,
      head: [['Department Name', 'Total Assets Allocated']],
      body: deptData,
      theme: 'striped',
      headStyles: { fillColor: [13, 148, 136] } // teal-600
    });

    // 3. Upcoming Retirements
    const finalY2 = doc.lastAutoTable.finalY || finalY + 50;
    
    // Check if we need a new page
    if (finalY2 > 230) {
      doc.addPage();
    }
    
    const currentY = doc.lastAutoTable.finalY > 230 ? 20 : finalY2 + 15;
    
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text('3. Assets Nearing Retirement', 14, currentY);
    
    const retData = retiring.map(r => [r.assetTag, r.name, new Date(r.acquisitionDate).toLocaleDateString()]);
    doc.autoTable({
      startY: currentY + 5,
      head: [['Asset Tag', 'Asset Name', 'Acquisition Date']],
      body: retData,
      theme: 'striped',
      headStyles: { fillColor: [225, 29, 72] } // rose-600
    });

    doc.save('AssetFlow_Executive_Report.pdf');
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
    <div className="p-8 bg-transparent min-h-screen">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">Reports & Analytics</h1>
          <p className="text-[var(--text-muted)] mt-1 font-medium">Actionable insights into asset utilization and lifecycle.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => handleExport('full')} className="bg-[var(--color-primary)] text-white px-5 py-2.5 flex items-center gap-2 font-bold text-sm hover:bg-[var(--color-primary-hover)] hover:-translate-y-0.5 transition-all duration-200 shadow-lg shadow-brand-600/20">
            <Download size={16} /> Export All (CSV)
          </button>
          <button onClick={handleExportPDF} className="bg-rose-600 text-white px-5 py-2.5 flex items-center gap-2 font-bold text-sm hover:bg-rose-700 hover:-translate-y-0.5 transition-all duration-200 shadow-lg shadow-rose-600/20">
            <Download size={16} /> Export Report (PDF)
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-[var(--text-muted)] font-bold animate-pulse text-xl">Loading analytics...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            
            {/* Utilization Chart */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-md overflow-hidden hover:shadow-lg transition-all group">
              <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--border-default)] bg-gradient-to-r from-brand-50/50 to-white">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-brand-100 flex items-center justify-center"><BarChart3 size={16} className="text-[var(--color-primary)]" /></div>
                  <h3 className="text-sm font-extrabold text-[var(--text-primary)] uppercase tracking-wider">Asset Utilization (Days)</h3>
                </div>
                <button onClick={() => handleExport('utilization')} className="text-[11px] font-bold text-[var(--color-primary)] hover:text-brand-800 bg-brand-50 border border-brand-100 px-2.5 py-1 transition-colors opacity-0 group-hover:opacity-100">
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
            <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-md overflow-hidden hover:shadow-lg transition-all group">
              <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--border-default)] bg-gradient-to-r from-emerald-50/50 to-white">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-100 flex items-center justify-center"><PieChartIcon size={16} className="text-emerald-600" /></div>
                  <h3 className="text-sm font-extrabold text-[var(--text-primary)] uppercase tracking-wider">Maintenance by Category</h3>
                </div>
                <button onClick={() => handleExport('maintenance')} className="text-[11px] font-bold text-[var(--color-primary)] hover:text-brand-800 bg-brand-50 border border-brand-100 px-2.5 py-1 transition-colors opacity-0 group-hover:opacity-100">
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
            <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-md overflow-hidden hover:shadow-lg transition-all group">
              <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--border-default)] bg-gradient-to-r from-amber-50/50 to-white">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-amber-100 flex items-center justify-center"><ArrowRightLeft size={16} className="text-amber-600" /></div>
                  <h3 className="text-sm font-extrabold text-[var(--text-primary)] uppercase tracking-wider">Department Allocations</h3>
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
            <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-md overflow-hidden hover:shadow-lg transition-all group">
              <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--border-default)] bg-gradient-to-r from-rose-50/50 to-white">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-rose-100 flex items-center justify-center"><AlertCircle size={16} className="text-rose-600" /></div>
                  <h3 className="text-sm font-extrabold text-[var(--text-primary)] uppercase tracking-wider">Upcoming Retirements</h3>
                </div>
                <button onClick={() => handleExport('retirement')} className="text-[11px] font-bold text-[var(--color-primary)] hover:text-brand-800 bg-brand-50 border border-brand-100 px-2.5 py-1 transition-colors opacity-0 group-hover:opacity-100">
                  <Download size={12} className="inline mr-1" />Export
                </button>
              </div>
              <div className="p-6 max-h-72 overflow-auto">
                {retiring.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-slate-400 font-medium text-sm">No assets nearing retirement</div>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-default)]">
                        <th className="pb-3 font-bold">Asset Tag</th>
                        <th className="pb-3 font-bold">Name</th>
                        <th className="pb-3 font-bold">Acquired</th>
                      </tr>
                    </thead>
                    <tbody>
                      {retiring.map(r => (
                        <tr key={r._id} className="border-b border-[var(--border-default)] even:bg-[var(--bg-surface-2)]/30 hover:bg-[var(--bg-surface-2)]/50 transition-colors">
                          <td className="py-3 font-mono text-sm font-bold text-[var(--text-primary)] bg-[var(--bg-surface-2)] px-2 border border-[var(--border-default)] w-max">{r.assetTag}</td>
                          <td className="py-3 px-3 text-sm font-medium text-[var(--text-primary)]">{r.name}</td>
                          <td className="py-3 text-sm text-[var(--text-muted)] font-mono">{new Date(r.acquisitionDate).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Booking Heatmap */}
          <div className="mt-6 bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-md overflow-hidden hover:shadow-lg transition-all group">
            <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--border-default)] bg-gradient-to-r from-brand-50/50 to-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-100 flex items-center justify-center"><CalendarIcon size={16} className="text-[var(--color-primary)]" /></div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)] uppercase tracking-wider">Resource Booking Peak Times</h3>
              </div>
            </div>
            <div className="p-6 h-72">
              {heatmapData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 font-medium text-sm">No booking data available for heatmap</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="hour" type="number" name="Hour" domain={[0, 23]} tickCount={24} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis dataKey="dayIndex" type="number" name="Day" domain={[0, 6]} tickCount={7} tickFormatter={tick => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][tick]} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
                    <ZAxis dataKey="count" type="number" range={[50, 400]} name="Bookings" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white px-4 py-3 shadow-xl border border-slate-700 text-sm">
                            <p className="font-bold mb-1">{data.day} at {data.hour}:00</p>
                            <p className="text-slate-300 text-xs">Bookings: <span className="text-white font-bold">{data.count}</span></p>
                          </div>
                        );
                      }
                      return null;
                    }} />
                    <Scatter name="Bookings" data={heatmapData} fill="#4f46e5" />
                  </ScatterChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
