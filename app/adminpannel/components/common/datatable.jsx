"use client";
import React from 'react';

const DataTable = ({ 
  columns, 
  data, 
  loading, 
  emptyMessage = "No data found",
  onEdit,
  onDelete,
  onToggle,
  actions = true
}) => {
  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="p-8 text-center text-gray-500">{emptyMessage}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(column => (
              <th key={column.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {column.title}
              </th>
            ))}
            {actions && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map(item => (
            <tr key={item.id}>
              {columns.map(column => (
                <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                  {column.render ? column.render(item) : item[column.key]}
                </td>
              ))}
              {actions && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    {onToggle && (
                      <button
                        onClick={() => onToggle(item)}
                        className={`flex items-center gap-2 ${
                          item.is_active ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {item.is_active ? 'Active' : 'Inactive'}
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(item)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;