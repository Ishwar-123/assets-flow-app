import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext, getConfig } from '../context/AuthContext';
import { PenTool, Plus, X, CheckCircle, AlertCircle, Wrench, Ban } from 'lucide-react';

const Maintenance = () => {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Forms
  const [newRequest, setNewRequest] = useState({ asset: '', issueDescription: '', priority: 'Medium' });
  const [photo, setPhoto] = useState(null);
  const [actionNotes, setActionNotes] = useState('');
  const [assignedTechnician, setAssignedTechnician] = useState('');

  const fetchData = async () => {
    try {
      const config = getConfig();
      if (!config) return;
      const [ticketRes, assetRes] = await Promise.all([
        axios.get('http://localhost:5000/api/maintenance', config),
        axios.get('http://localhost:5000/api/assets', config)
      ]);
      setTickets(ticketRes.data);
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
      const config = getConfig();
      let payload;
      
      if (photo) {
        payload = new FormData();
        payload.append('asset', newRequest.asset);
        payload.append('issueDescription', newRequest.issueDescription);
        payload.append('priority', newRequest.priority);
        payload.append('photoUrl', photo);
        config.headers['Content-Type'] = 'multipart/form-data';
      } else {
        payload = newRequest;
      }

      await axios.post('http://localhost:5000/api/maintenance', payload, config);
      setIsModalOpen(false);
      setNewRequest({ asset: '', issueDescription: '', priority: 'Medium' });
      setPhoto(null);
      fetchData();
    } catch (error) {
      console.error('Failed to raise request', error);
      alert(error.response?.data?.message || 'Failed to raise request');
    }
  };

  const openDetailModal = (ticket) => {
    setSelectedTicket(ticket);
    setActionNotes('');
    setAssignedTechnician('');
    setIsDetailModalOpen(true);
  };

  const handleAction = async (actionType) => {
    try {
      let payload = {};
      if (actionType === 'reject') payload = { rejectionReason: actionNotes };
      if (actionType === 'assign') payload = { assignedTechnician };
      if (actionType === 'resolve') payload = { resolutionNotes: actionNotes };

      await axios.put(`http://localhost:5000/api/maintenance/${selectedTicket._id}/${actionType}`, payload, getConfig());
      setIsDetailModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(`Failed to ${actionType} ticket`, error);
      alert(error.response?.data?.message || `Failed to process action: ${actionType}`);
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Critical': return 'text-accent-rose bg-accent-rose/10 border border-accent-rose/20';
      case 'High': return 'text-accent-amber bg-accent-amber/10 border border-accent-amber/20';
      case 'Medium': return 'text-brand-600 bg-brand-50 border border-brand-200';
      default: return 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'text-accent-amber bg-accent-amber/10 border-accent-amber/20';
      case 'Approved': return 'text-brand-600 bg-brand-50 border-brand-200';
      case 'In Progress': return 'text-brand-700 bg-brand-100 border-brand-300';
      case 'Resolved': return 'text-accent-teal bg-accent-teal/10 border-accent-teal/20';
      case 'Rejected': return 'text-accent-rose bg-accent-rose/10 border-accent-rose/20';
      default: return 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  };

  const canManageTickets = ['Admin', 'Asset Manager'].includes(user?.role);

  return (
    <div className="p-8 max-w-7xl mx-auto bg-transparent min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Maintenance Tickets</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Track and manage asset repair requests.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-brand-600 rounded-none text-sm font-bold text-white hover:bg-brand-700 hover:-translate-y-0.5 transition-all flex items-center shadow-md">
          <Plus size={16} className="mr-2" /> Raise Request
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xl rounded-none shadow-md border border-slate-200 dark:border-slate-700 p-6 min-h-[500px]">
        {loading ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400 font-bold animate-pulse">Loading tickets...</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {tickets.map(ticket => (
              <div key={ticket._id} className="border border-slate-200 dark:border-slate-700 p-5 rounded-none hover:shadow-md hover:-translate-y-0.5 transition-all bg-white dark:bg-slate-900 flex flex-col md:flex-row md:items-center justify-between group">
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className={`px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority} Priority
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-bold border ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{ticket.issueDescription}</h3>
                  <div className="text-sm text-slate-500 dark:text-slate-400 font-medium flex items-center">
                    <span className="text-brand-700 font-bold mr-2">{ticket.asset?.name || 'Unknown Asset'} <span className="font-mono text-xs bg-brand-50 px-1 border border-brand-100 text-brand-600">{ticket.asset?.assetTag}</span></span>
                    <span>• Reported on {new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div>
                  <button onClick={() => openDetailModal(ticket)} className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-none text-sm font-bold text-brand-600 hover:bg-brand-600 hover:text-white transition-all shadow-sm">
                    View Details
                  </button>
                </div>
              </div>
            ))}
            {tickets.length === 0 && (
              <div className="py-16 text-center">
                <Wrench size={48} className="text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">No maintenance tickets found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Raise Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900/95 backdrop-blur-xl rounded-none shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Raise Maintenance Request</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleRaiseRequest} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Select Asset</label>
                <select required value={newRequest.asset} onChange={e => setNewRequest({...newRequest, asset: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700  text-slate-900 dark:text-white rounded-none text-sm focus:ring-2 focus:ring-brand-500 outline-none  bg-white dark:bg-slate-800">
                  <option value="">Select Asset to repair...</option>
                  {assets.map(a => <option key={a._id} value={a._id}>{a.name} ({a.assetTag})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Issue Description</label>
                <textarea required rows="3" value={newRequest.issueDescription} onChange={e => setNewRequest({...newRequest, issueDescription: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-none text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none" placeholder="Describe the problem..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                <select value={newRequest.priority} onChange={e => setNewRequest({...newRequest, priority: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700  text-slate-900 dark:text-white rounded-none text-sm focus:ring-2 focus:ring-brand-500 outline-none  bg-white dark:bg-slate-800">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Attach Photo (Optional)</label>
                <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])} className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-sm file:font-bold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
              </div>
              
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => { setIsModalOpen(false); setPhoto(null); }} className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-md">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail & Action Modal */}
      {isDetailModalOpen && selectedTicket && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900/95 backdrop-blur-xl rounded-none shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center"><Wrench className="mr-2 text-brand-600"/> Ticket Details</h2>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-6">
              
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Asset</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{selectedTicket.asset?.name} <span className="font-mono text-slate-500 dark:text-slate-400 ml-1">{selectedTicket.asset?.assetTag}</span></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Reported By</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{selectedTicket.reportedBy?.name || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</span>
                  <span className={`px-2 py-0.5 text-xs font-bold border ${getStatusColor(selectedTicket.status)}`}>{selectedTicket.status}</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Issue Description</span>
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-medium bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-700">{selectedTicket.issueDescription}</p>
                </div>
                {selectedTicket.rejectionReason && (
                  <div>
                    <span className="text-xs font-bold text-accent-rose uppercase tracking-wider block mb-1">Rejection Reason</span>
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium bg-accent-rose/5 p-3 border border-accent-rose/20">{selectedTicket.rejectionReason}</p>
                  </div>
                )}
                {selectedTicket.resolutionNotes && (
                  <div>
                    <span className="text-xs font-bold text-accent-teal uppercase tracking-wider block mb-1">Resolution Notes</span>
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium bg-accent-teal/5 p-3 border border-accent-teal/20">{selectedTicket.resolutionNotes}</p>
                  </div>
                )}
                {selectedTicket.assignedTechnician && (
                  <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-3 mt-3">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Technician</span>
                    <span className="text-sm font-bold text-brand-700">{selectedTicket.assignedTechnician}</span>
                  </div>
                )}
                {selectedTicket.photoUrl && (
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">Attached Photo</span>
                    <img src={`http://localhost:5000${selectedTicket.photoUrl}`} alt="Maintenance Issue" className="max-h-48 object-contain border border-slate-200 dark:border-slate-700 bg-white" />
                  </div>
                )}
              </div>

              {/* Action Area based on Status and Role */}
              {canManageTickets && selectedTicket.status === 'Pending' && (
                <div className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                  <textarea rows="2" placeholder="Rejection reason (if rejecting)..." value={actionNotes} onChange={e => setActionNotes(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-none text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
                  <div className="flex space-x-3">
                    <button onClick={() => handleAction('reject')} className="flex-1 bg-white dark:bg-slate-900 border border-accent-rose text-accent-rose hover:bg-accent-rose hover:text-white py-2 text-sm font-bold transition-colors flex items-center justify-center shadow-sm">
                      <Ban size={16} className="mr-1"/> Reject
                    </button>
                    <button onClick={() => handleAction('approve')} className="flex-1 bg-brand-600 text-white hover:bg-brand-700 py-2 text-sm font-bold transition-colors flex items-center justify-center shadow-sm">
                      <CheckCircle size={16} className="mr-1"/> Approve
                    </button>
                  </div>
                </div>
              )}

              {canManageTickets && selectedTicket.status === 'Approved' && (
                <div className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                  <input type="text" placeholder="Technician Name" value={assignedTechnician} onChange={e => setAssignedTechnician(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-none text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
                  <button onClick={() => handleAction('assign')} disabled={!assignedTechnician} className="w-full bg-brand-600 text-white hover:bg-brand-700 py-2 text-sm font-bold transition-colors disabled:opacity-50 shadow-sm flex items-center justify-center">
                    <Wrench size={16} className="mr-2"/> Assign Technician
                  </button>
                </div>
              )}

              {canManageTickets && selectedTicket.status === 'In Progress' && (
                <div className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                  <textarea rows="2" placeholder="Resolution notes..." value={actionNotes} onChange={e => setActionNotes(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-none text-sm focus:ring-2 focus:ring-accent-teal outline-none" />
                  <button onClick={() => handleAction('resolve')} disabled={!actionNotes} className="w-full bg-accent-teal text-white hover:bg-teal-700 py-2 text-sm font-bold transition-colors disabled:opacity-50 shadow-sm flex items-center justify-center">
                    <CheckCircle size={16} className="mr-2"/> Mark as Resolved
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Maintenance;
