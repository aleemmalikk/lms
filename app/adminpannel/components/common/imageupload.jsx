"use client";
import React from 'react';
import { FaUpload, FaImage } from 'react-icons/fa';

const ImageUpload = ({ 
  fieldName, 
  label, 
  currentValue = '', 
  onFileChange, 
  uploading = false 
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      
      {/* Current Image Preview */}
      {currentValue && (
        <div className="mb-3">
          <p className="text-sm text-gray-600 mb-2">Current Image:</p>
          <img 
            src={currentValue} 
            alt="Preview"
            className="h-20 w-20 object-cover rounded-md border"
          />
        </div>
      )}
      
      {/* Upload Section */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer">
          <FaUpload />
          {uploading ? 'Uploading...' : 'Upload Image'}
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
            disabled={uploading}
          />
        </label>
        
        {currentValue && !uploading && (
          <span className="text-sm text-green-600 flex items-center gap-1">
            <FaImage />
            Image Ready
          </span>
        )}
      </div>
      
      {/* Image URL Display (for reference) */}
      {currentValue && (
        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
          <p className="text-gray-600">Image URL:</p>
          <p className="truncate">{currentValue}</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;