import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Bell } from 'lucide-react';

const Header = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
      <h2 className="text-xl font-semibold text-gray-800">Enterprise Asset Manager</h2>
      
      <div className="flex items-center space-x-6">
        <button className="text-gray-500 hover:text-indigo-600 transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </button>
        
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
            {user.name.charAt(0)}
          </div>
          <span className="text-sm font-medium text-gray-700">{user.name}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
