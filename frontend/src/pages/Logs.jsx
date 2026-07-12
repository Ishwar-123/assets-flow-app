import React from 'react';
import { Activity, Bell } from 'lucide-react';

const Logs = () => {
  // Mock data for UI demonstration
  const mockLogs = [
    { id: 1, action: 'Asset Allocated', details: 'MacBook Pro AF-0012 allocated to John Doe', time: '10 mins ago', user: 'Admin' },
    { id: 2, action: 'Maintenance Raised', details: 'Screen cracked on iPhone 13 AF-0098', time: '1 hour ago', user: 'Jane Smith' },
    { id: 3, action: 'Audit Cycle Closed', details: 'Q3 Electronics Audit verified 45 assets', time: '2 hours ago', user: 'Asset Manager' },
    { id: 4, action: 'Department Created', details: 'Marketing department added to system', time: '1 day ago', user: 'Admin' }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Activity Logs & Notifications</h1>
        <p className="text-gray-500 mt-1">Complete system audit trail and recent events.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="space-y-6">
          {mockLogs.map(log => (
            <div key={log.id} className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mr-4 flex-shrink-0">
                <Activity size={18} />
              </div>
              <div className="flex-1 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-bold text-gray-900">{log.action}</h4>
                  <span className="text-xs font-medium text-gray-400">{log.time}</span>
                </div>
                <p className="text-sm text-gray-600">{log.details}</p>
                <p className="text-xs text-gray-400 mt-2 font-mono">Performed by: {log.user}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Logs;
