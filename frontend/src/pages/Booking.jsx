import React from 'react';
import { Calendar as CalendarIcon, Clock, Users } from 'lucide-react';

const Booking = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resource Bookings</h1>
          <p className="text-gray-500 mt-1">Book shared rooms, vehicles, and equipment.</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 rounded-lg text-sm font-medium text-white hover:bg-indigo-700 transition-colors flex items-center shadow-md">
          <CalendarIcon size={16} className="mr-2" /> New Booking
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <CalendarIcon size={64} className="text-indigo-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800">Booking Calendar Coming Soon</h3>
          <p className="text-gray-500 mt-2 max-w-md">The time-slot overlapping validation engine is currently being finalized for shared resource management.</p>
        </div>
      </div>
    </div>
  );
};

export default Booking;
