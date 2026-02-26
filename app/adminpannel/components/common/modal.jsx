"use client";
import React from 'react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  onSubmit, 
  loading = false,
  submitLabel = "Save"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-blue-500 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        
        <form onSubmit={onSubmit}>
          {children}
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;