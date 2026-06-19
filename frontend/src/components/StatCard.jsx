import React from 'react';

const StatCard = ({ title, value, icon: Icon, colorClass = 'text-primary' }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
      </div>
      {Icon && (
        <div className={`p-3 rounded-full bg-gray-50 ${colorClass}`}>
          <Icon size={24} />
        </div>
      )}
    </div>
  );
};

export default StatCard;
