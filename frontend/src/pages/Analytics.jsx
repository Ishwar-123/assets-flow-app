import React from 'react';
import { BarChart3, TrendingUp, PieChart } from 'lucide-react';

const Analytics = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-500 mt-1">Actionable insights into asset utilization and lifecycle.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-80 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-4 right-4 text-indigo-100"><BarChart3 size={100} /></div>
          <h3 className="text-xl font-bold text-gray-800 z-10">Asset Utilization Trends</h3>
          <p className="text-gray-500 mt-2 z-10">Chart module integration pending...</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-80 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-4 right-4 text-purple-100"><PieChart size={100} /></div>
          <h3 className="text-xl font-bold text-gray-800 z-10">Maintenance Frequency</h3>
          <p className="text-gray-500 mt-2 z-10">Chart module integration pending...</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
