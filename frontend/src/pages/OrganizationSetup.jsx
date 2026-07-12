import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Building2, Tags, Users, Plus, ShieldCheck } from 'lucide-react';

const OrganizationSetup = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('departments');
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Department Form State
  const [newDeptName, setNewDeptName] = useState('');

  const getConfig = () => ({
    headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('userInfo'))?.token}` }
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptRes, catRes, empRes] = await Promise.all([
        axios.get('http://localhost:5000/api/departments', getConfig()),
        axios.get('http://localhost:5000/api/categories', getConfig()),
        axios.get('http://localhost:5000/api/users', getConfig())
      ]);
      setDepartments(deptRes.data);
      setCategories(catRes.data);
      setEmployees(empRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    if (!newDeptName) return;
    try {
      await axios.post('http://localhost:5000/api/departments', { name: newDeptName }, getConfig());
      setNewDeptName('');
      fetchData();
    } catch (err) {
      console.error('Failed to create department');
    }
  };

  const handleUpdateRole = async (id, newRole) => {
    try {
      await axios.put(`http://localhost:5000/api/users/${id}/role`, { role: newRole }, getConfig());
      fetchData();
    } catch (err) {
      console.error('Failed to update role');
    }
  };

  if (user?.role !== 'Admin') {
    return <div className="p-8 text-center text-red-500">Access Denied. Admin privileges required.</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Organization Setup</h1>
        <p className="text-gray-500 mt-1">Manage master data, departments, and roles.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-6 w-max">
        <button
          onClick={() => setActiveTab('departments')}
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'departments' ? 'bg-white shadow text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
        >
          <Building2 size={16} className="mr-2" /> Departments
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'categories' ? 'bg-white shadow text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
        >
          <Tags size={16} className="mr-2" /> Asset Categories
        </button>
        <button
          onClick={() => setActiveTab('employees')}
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'employees' ? 'bg-white shadow text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
        >
          <Users size={16} className="mr-2" /> Employee Directory
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 animate-pulse">Loading data...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          
          {/* DEPARTMENTS TAB */}
          {activeTab === 'departments' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Departments</h2>
                <form onSubmit={handleCreateDepartment} className="flex space-x-2">
                  <input 
                    type="text" 
                    value={newDeptName}
                    onChange={(e) => setNewDeptName(e.target.value)}
                    placeholder="New Department Name" 
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                  <button type="submit" className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center">
                    <Plus size={16} className="mr-1" /> Add
                  </button>
                </form>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 rounded-lg">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Head</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map(dept => (
                      <tr key={dept._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">{dept.name}</td>
                        <td className="px-4 py-3 text-gray-500">{dept.head?.name || 'Unassigned'}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">{dept.status}</span>
                        </td>
                      </tr>
                    ))}
                    {departments.length === 0 && (
                      <tr><td colSpan="3" className="px-4 py-8 text-center text-gray-500">No departments found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CATEGORIES TAB */}
          {activeTab === 'categories' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Asset Categories</h2>
                <button className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center">
                  <Plus size={16} className="mr-1" /> Add Category
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {categories.map(cat => (
                  <div key={cat._id} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow bg-gray-50/50">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <Tags size={16} className="mr-2 text-indigo-500" /> {cat.name}
                    </h3>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EMPLOYEES TAB */}
          {activeTab === 'employees' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Employee Directory & Roles</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 rounded-lg">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Current Role</th>
                      <th className="px-4 py-3 text-right">Promote To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map(emp => (
                      <tr key={emp._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900 flex items-center">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold mr-3">
                            {emp.name.charAt(0)}
                          </div>
                          {emp.name}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{emp.email}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            emp.role === 'Admin' ? 'bg-red-100 text-red-700' :
                            emp.role === 'Asset Manager' ? 'bg-purple-100 text-purple-700' :
                            emp.role === 'Department Head' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {emp.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {emp.role === 'Employee' && (
                            <div className="flex justify-end space-x-2">
                              <button onClick={() => handleUpdateRole(emp._id, 'Department Head')} className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded transition-colors">
                                Dept Head
                              </button>
                              <button onClick={() => handleUpdateRole(emp._id, 'Asset Manager')} className="text-xs font-medium text-purple-600 hover:text-purple-800 bg-purple-50 px-2 py-1 rounded transition-colors flex items-center">
                                <ShieldCheck size={12} className="mr-1" /> Asset Mgr
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default OrganizationSetup;
