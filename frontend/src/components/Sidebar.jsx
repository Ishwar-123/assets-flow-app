import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FolderTree, Package, ArrowRightLeft, PenTool, CheckSquare, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col min-h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">AssetFlow</h1>
        <p className="text-xs text-gray-400 mt-1">{user.role}</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <NavLink to="/" className={({isActive}) => `flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-600' : 'hover:bg-gray-800'}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        
        {user.role === 'Admin' && (
          <NavLink to="/organization" className={({isActive}) => `flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-600' : 'hover:bg-gray-800'}`}>
            <Users size={20} />
            <span>Organization</span>
          </NavLink>
        )}

        <NavLink to="/assets" className={({isActive}) => `flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-600' : 'hover:bg-gray-800'}`}>
          <Package size={20} />
          <span>Asset Directory</span>
        </NavLink>

        <NavLink to="/allocations" className={({isActive}) => `flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-600' : 'hover:bg-gray-800'}`}>
          <ArrowRightLeft size={20} />
          <span>Allocations</span>
        </NavLink>

        <NavLink to="/maintenance" className={({isActive}) => `flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-600' : 'hover:bg-gray-800'}`}>
          <PenTool size={20} />
          <span>Maintenance</span>
        </NavLink>

        <NavLink to="/audits" className={({isActive}) => `flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-600' : 'hover:bg-gray-800'}`}>
          <CheckSquare size={20} />
          <span>Audits</span>
        </NavLink>

        <NavLink to="/booking" className={({isActive}) => `flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-600' : 'hover:bg-gray-800'}`}>
          <FolderTree size={20} />
          <span>Bookings</span>
        </NavLink>

        <NavLink to="/analytics" className={({isActive}) => `flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-600' : 'hover:bg-gray-800'}`}>
          <CheckSquare size={20} />
          <span>Reports</span>
        </NavLink>

        <NavLink to="/logs" className={({isActive}) => `flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-600' : 'hover:bg-gray-800'}`}>
          <CheckSquare size={20} />
          <span>Activity Logs</span>
        </NavLink>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button onClick={handleLogout} className="flex items-center space-x-3 p-3 w-full rounded-lg hover:bg-gray-800 transition-colors text-red-400">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
