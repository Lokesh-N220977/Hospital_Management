import React from 'react';

const TodaySchedule: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Today's Schedule</h1>
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <p className="text-gray-500">Your appointments for today will appear here.</p>
      </div>
    </div>
  );
};

export default TodaySchedule;