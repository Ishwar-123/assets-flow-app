import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PenTool, Plus, AlertCircle, X } from 'lucide-react';

const Maintenance = () => {
  const [tickets, setTickets] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({ asset: '', issueDescription: '', priority: 'Medium' });

  const getConfig = () => ({
    headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('userInfo'))?.token}` }
  });

  const fetchData = async () => {
    try {
      const [ticketRes, assetRes] = await Promise.all([
        axios.get('http://localhost:5000/api/maintenance', getConfig()),
        axios.get('http://localhost:5000/api/assets', getConfig())
      ]);
      setTickets(ticketRes.data);
      // In a real app, you might filter to only assets the user holds. Here we show all allocated assets.
      setAssets(assetRes.data.filter(a => a.status !== 'Disposed')); 
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRaiseRequest = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/maintenance', newRequest, getConfig());
      setIsModalOpen(false);
      setNewRequest({ asset: '', issueDescription: '', priority: 'Medium' });
      fetchData(); // Refresh list
    } catch (error) {
      console.error('Failed to raise request', error);
      alert(error.response?.data?.message || 'Failed to raise request');
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Critical': return 'text-red-600 bg-red-100';
      case 'High': return 'text-orange-600 bg-orange-100';
      case 'Medium': return 'text-amber-600 bg-amber-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Maintenance Tickets</h1>
          <p className="text-gray-500 mt-1">Track and manage asset repair requests.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-indigo-600 rounded-lg text-sm font-medium text-white hover:bg-indigo-700 transition-colors flex items-center shadow-md">
          <Plus size={16} className="mr-2" /> Raise Request
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {loading ? (
          <div className="py-12 text-center text-gray-500 animate-pulse">Loading tickets...</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {tickets.map(ticket => (
              <div key={ticket._id} className="border border-gray-100 p-5 rounded-xl hover:shadow-md transition-shadow bg-gray-50/30 flex flex-col md:flex-row md:items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">{ticket.status}</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">{ticket.issueDescription}</h3>
                  <div className="text-sm text-gray-500 mt-1 flex items-center">
                    <span className="font-medium text-indigo-600 mr-2">{ticket.asset?.name || 'Unknown Asset'}</span>
                    <span>• Reported on {new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            ))}
            {tickets.length === 0 && (
              <div className="py-16 text-center">
                <PenTool size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No maintenance tickets found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Raise Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Raise Maintenance Request</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleRaiseRequest} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Asset</label>
                <select required value={newRequest.asset} onChange={e => setNewRequest({...newRequest, asset: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                  <option value="">Select Asset to repair...</option>
                  {assets.map(a => <option key={a._id} value={a._id}>{a.name} ({a.assetTag})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Description</label>
                <textarea required rows="3" value={newRequest.issueDescription} onChange={e => setNewRequest({...newRequest, issueDescription: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="Describe the problem..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select value={newRequest.priority} onChange={e => setNewRequest({...newRequest, priority: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
