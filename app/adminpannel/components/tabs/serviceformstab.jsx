"use client";
import React from 'react';
import { FaPlus, FaImage, FaEye, FaEdit, FaTrash } from 'react-icons/fa';

const ServiceFormsTab = ({ 
  serviceForms, 
  loading, 
  onAdd, 
  onEdit, 
  onDelete 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold">Service Forms</h3>
        <button
          onClick={onAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700"
        >
          <FaPlus /> Add Service Form
        </button>
      </div>
      
      {loading ? (
        <div className="p-8 text-center">Loading...</div>
      ) : serviceForms.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No service forms found. Create your first service form.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fields</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {serviceForms.map(form => (
                <tr key={form.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{form.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {form.image ? (
                      <img 
                        src={form.image} 
                        alt={form.name}
                        className="h-10 w-10 object-cover rounded"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                        <FaImage className="text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{form.name}</td>
                  <td className="px-6 py-4">{form.description || '-'}</td>
                  <td className="px-6 py-4">{form.fields?.length || 0} fields</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button className="text-green-600 hover:text-green-900">
                        <FaEye />
                      </button>
                      <button
                        onClick={() => onEdit(form)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => onDelete(form.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ServiceFormsTab;