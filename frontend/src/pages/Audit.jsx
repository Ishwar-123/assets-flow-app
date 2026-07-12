import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckSquare, Plus, Calendar, X } from 'lucide-react';

const Audit = () => {
  const [audits, setAudits] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAudit, setNewAudit] = useState({ name: '', startDate: '', endDate: '', auditors: [] });

  const getConfig = () => ({
    headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('userInfo'))?.token}` }
  });

  const fetchData = async () => {
    try {
      const [auditRes, userRes] = await Promise.all([
        axios.get('http://localhost:5000/api/audits', getConfig()),
        axios.get('http://localhost:5000/api/users', getConfig())
      ]);
      setAudits(auditRes.data);
      setUsers(userRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStartCycle = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/audits', newAudit, getConfig());
      setIsModalOpen(false);
      setNewAudit({ name: '', startDate: '', endDate: '', auditors: [] });
      fetchData(); // Refresh list
    } catch (error) {
      console.error('Failed to start audit cycle', error);
      alert('Failed to start audit cycle');
    }
  };

  const toggleAuditor = (userId) => {
    setNewAudit(prev => {
      const auditors = [...prev.auditors];
      if (auditors.includes(userId)) {
        return { ...prev, auditors: auditors.filter(id => id !== userId) };
      } else {
        return { ...prev, auditors: [...auditors, userId] };
      }
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Cycles</h1>
          <p className="text-gray-500 mt-1">Manage scheduled physical verifications.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-indigo-600 rounded-lg text-sm font-medium text-white hover:bg-indigo-700 transition-colors flex items-center shadow-md">
          <Plus size={16} className="mr-2" /> Start Audit Cycle
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {loading ? (
          <div className="py-12 text-center text-gray-500 animate-pulse">Loading audits...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {audits.map(audit => (
              <div key={audit._id} className="border border-gray-200 p-6 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                  <CheckSquare size={100} className="text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 relative z-10">{audit.name}</h3>
                
                <div className="flex items-center text-sm text-gray-500 mb-4 relative z-10">
                  <Calendar size={14} className="mr-2 text-indigo-500" />
                  {new Date(audit.startDate).toLocaleDateString()} - {new Date(audit.endDate).toLocaleDateString()}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100 relative z-10">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">Assigned Auditors</p>
                  <div className="flex -space-x-2">
                    {audit.auditors.map((auditor, i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold" title={auditor.name}>
                        {auditor.name.charAt(0)}
                      </div>
                    ))}
                    {audit.auditors.length === 0 && <span className="text-sm text-gray-500">None assigned</span>}
                  </div>
                </div>
                
                <button className="mt-6 w-full py-2 bg-gray-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors relative z-10">
                  View Discrepancy Report
                </button>
              </div>
            ))}
            {audits.length === 0 && (
              <div className="col-span-full py-16 text-center">
                <CheckSquare size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No audit cycles found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Audit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Start New Audit Cycle</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleStartCycle} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Audit Cycle Name</label>
                <input required type="text" value={newAudit.name} onChange={e => setNewAudit({...newAudit, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Q3 Electronics Audit" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input required type="date" value={newAudit.startDate} onChange={e => setNewAudit({...newAudit, startDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input required type="date" value={newAudit.endDate} onChange={e => setNewAudit({...newAudit, endDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign Auditors</label>
                <div className="border border-gray-300 rounded-lg p-2 max-h-40 overflow-y-auto space-y-1">
                  {users.map(u => (
                    <label key={u._id} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={newAudit.auditors.includes(u._id)}
                        onChange={() => toggleAuditor(u._id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{u.name} ({u.role})</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">Launch Cycle</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Audit;
