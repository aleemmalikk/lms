"use client";
import React, { useState, useEffect } from 'react';
import { 
  FaList, 
  FaTags, 
  FaClipboardList 
} from 'react-icons/fa';

import CategoriesTab from './components/tabs/categoriestab';
import SubcategoriesTab from './components/tabs/subcategoriestab';
import Modal from './components/common/modal';
import ImageUpload from './components/common/imageupload';
import { BASE_URL1, BASE_URL } from "../lib/api";


function Dashboard() {
  const [activeTab, setActiveTab] = useState('categories');
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [serviceSubmissions, setServiceSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [imageUploading, setImageUploading] = useState(false);

  // API endpoints
  const API_ENDPOINTS = {
    categories: `${BASE_URL1}services/categories/`,
    subcategories: `${BASE_URL1}services/subcategories/`,
    serviceSubmissions: `${BASE_URL1}services/service-submissions/`,
    images: `${BASE_URL}upload-images/`
  };

  // Fetch data based on active tab
  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const fetchData = async (type) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(API_ENDPOINTS[type], {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        switch (type) {
          case 'categories':
            setCategories(data);
            break;
          case 'subcategories':
            setSubcategories(data);
            break;
          case 'serviceSubmissions':
            setServiceSubmissions(data);
            break;
        }
      } else {
        console.error('Failed to fetch data:', response.status);
        alert('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error fetching data');
    } finally {
      setLoading(false);
    }
  };




  // Dashboard component में ये function add करें
const handleCreateCategoryForm = async (categoryId, formData) => {
  try {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(
      `${BASE_URL1}services/create-direct-category-form/`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category_id: categoryId,
          ...formData
        })
      }
    );

    if (response.ok) {
      const result = await response.json();
      return result;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to create form');
    }
  } catch (error) {
    console.error('Error creating category form:', error);
    throw error;
  }
};

// Category form configuration fetch करें
const fetchCategoryFormConfig = async (categoryId) => {
  try {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(
      `${BASE_URL1}services/category-form-config/${categoryId}/`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error('Failed to fetch form config');
    }
  } catch (error) {
    console.error('Error fetching form config:', error);
    throw error;
  }
};


  // Handle image upload
  const handleImageUpload = async (file) => {
    setImageUploading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(API_ENDPOINTS.images, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        return data.image_url;
      } else {
        const errorData = await response.json();
        console.error('Image upload failed:', errorData);
        throw new Error('Image upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setImageUploading(false);
    }
  };

  // Handle file input change for image upload
  const handleFileChange = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    try {
      const imageUrl = await handleImageUpload(file);
      
      // For categories, use 'icon' field instead of 'image'
      if (modalType === 'category') {
        setFormData(prev => ({
          ...prev,
          icon: imageUrl
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [fieldName]: imageUrl
        }));
      }
      
      alert('Image uploaded successfully!');
    } catch (error) {
      alert('Failed to upload image. Please try again.');
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Open modal for add/edit
  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setFormData(item ? { ...item } : getDefaultFormData(type));
    setShowModal(true);
  };

  // Get default form data based on type
  const getDefaultFormData = (type) => {
    switch (type) {
      case 'category':
        return { 
          name: '', 
          description: '', 
          icon: '',
          is_active: true 
        };
      case 'subcategory':
        return { 
          category: '', 
          name: '', 
          description: '', 
          image: '', 
          is_active: true 
        };
      default:
        return {};
    }
  };


  const handleStatusUpdate = async (submissionId, newStatus) => {
  try {
    const token = localStorage.getItem('accessToken');
    
    // Use URL-encoded form data
    const formData = new URLSearchParams();
    formData.append('status', newStatus);

    const response = await fetch(
      `${BASE_URL1}services/service-submissions/${submissionId}/`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      }
    );

    if (response.ok) {
      // Refresh the submissions data
      fetchData('serviceSubmissions');
      alert('Status updated successfully!');
    } else {
      let errorMessage = 'Failed to update status';
      try {
        const errorText = await response.text();
        if (errorText) {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail || errorData.message || errorMessage;
        }
      } catch (e) {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Error updating status:', error);
    throw error;
  }
};

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const endpointKey = `${modalType === 'category' ? 'categories' : 'subcategories'}`;
      const url = API_ENDPOINTS[endpointKey];
      
      const method = editingItem ? 'PUT' : 'POST';
      const finalUrl = editingItem ? `${url}${editingItem.id}/` : url;

      // Get current user ID from token or localStorage
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const userId = userData.user_id || 1;

      // Prepare submit data with created_by
      const submitData = { 
        ...formData,
        created_by: userId
      };
      
      // For categories, only send icon (not image)
      if (modalType === 'category') {
        delete submitData.image;
        if (!submitData.icon) {
          submitData.icon = '';
        }
      }
      
      // For subcategories, convert category to integer
      if (modalType === 'subcategory' && submitData.category) {
        // Fix: If category is an array, take the first element
        if (Array.isArray(submitData.category)) {
          submitData.category = submitData.category[0];
        }
        submitData.category = parseInt(submitData.category);
      }

      // Remove empty image fields for non-category types
      if (modalType !== 'category' && !submitData.image) {
        delete submitData.image;
      }

      console.log('Submitting data:', submitData);
      console.log('URL:', finalUrl);
      console.log('Method:', method);

      const response = await fetch(finalUrl, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      // Check if response is successful (status 200-299)
      if (response.ok) {
        let responseData;
        try {
          responseData = await response.json();
          console.log('Success response:', responseData);
        } catch (parseError) {
          console.log('No JSON response body, but request was successful');
          responseData = { message: 'Success' };
        }
        
        setShowModal(false);
        setFormData({});
        fetchData(activeTab);
        alert(`${modalType.charAt(0).toUpperCase() + modalType.slice(1)} ${editingItem ? 'updated' : 'created'} successfully!`);
      } else {
        // Handle error response
        let errorData;
        try {
          const errorText = await response.text();
          errorData = errorText ? JSON.parse(errorText) : { 
            detail: `HTTP ${response.status}: ${response.statusText}` 
          };
        } catch (parseError) {
          errorData = { 
            detail: `HTTP ${response.status}: ${response.statusText}` 
          };
        }
        
        console.error('API Error Response:', errorData);
        alert(`Error: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('Network or other error:', error);
      alert('Error submitting form: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete item
  const handleDelete = async (type, id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_ENDPOINTS[type]}${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchData(activeTab);
        alert('Item deleted successfully!');
      } else {
        alert('Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting item');
    }
  };

  // Toggle active status
  const toggleActive = async (type, item) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_ENDPOINTS[type]}${item.id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: !item.is_active })
      });

      if (response.ok) {
        fetchData(activeTab);
      } else {
        console.error('Failed to toggle status');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  // Render modal content based on type
  const renderModalContent = () => {
    switch (modalType) {
      case 'category':
        return (
          <>
            <ImageUpload
              fieldName="icon"
              label="Category Icon"
              currentValue={formData.icon}
              onFileChange={(e) => handleFileChange(e, 'icon')}
              uploading={imageUploading}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                rows="3"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active || false}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label className="text-sm font-medium text-gray-700">Active</label>
            </div>
          </>
        );

      case 'subcategory':
        return (
          <>
            <ImageUpload
              fieldName="image"
              label="Subcategory Image"
              currentValue={formData.image}
              onFileChange={(e) => handleFileChange(e, 'image')}
              uploading={imageUploading}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700">Category *</label>
              <select
                name="category"
                value={formData.category || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                rows="3"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active || false}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label className="text-sm font-medium text-gray-700">Active</label>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const modalTitles = {
    category: 'Service Category',
    subcategory: 'Service Subcategory'
  };

  return (
    <div className="md:p-6 mb-4 overflow-auto">
      <div className="px-3 md:pt-3 pt-5">
        <h1 className="text-2xl font-bold text-gray-800">Services Dashboard</h1>
        <p className="text-gray-600">Manage services, categories, and forms</p>
      </div>

      {/* Tabs */}
      <div className="mb-3 p-3">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'categories', name: 'Categories', icon: <FaList /> },
              { id: 'subcategories', name: 'Subcategories', icon: <FaTags /> },
              // { id: 'serviceSubmissions', name: 'Submissions', icon: <FaClipboardList /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'categories' && (
          <CategoriesTab
            categories={categories}
            loading={loading}
            onAdd={() => openModal('category')}
            onEdit={(item) => openModal('category', item)}
            onDelete={(id) => handleDelete('categories', id)}
            onToggle={(item) => toggleActive('categories', item)}
          />
        )}
        
        {activeTab === 'subcategories' && (
          <SubcategoriesTab
            subcategories={subcategories}
            loading={loading}
            onAdd={() => openModal('subcategory')}
            onEdit={(item) => openModal('subcategory', item)}
            onDelete={(id) => handleDelete('subcategories', id)}
            onToggle={(item) => toggleActive('subcategories', item)}
          />
        )}
        
        {/* {activeTab === 'serviceSubmissions' && (
          <ServiceSubmissionsTab
  serviceSubmissions={serviceSubmissions}
  loading={loading}
  onStatusUpdate={handleStatusUpdate}
/>
        )} */}
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`${editingItem ? 'Edit' : 'Add'} ${modalTitles[modalType]}`}
        onSubmit={handleSubmit}
        loading={loading}
        submitLabel={editingItem ? 'Update' : 'Create'}
      >
        <div className="space-y-4">
          {renderModalContent()}
        </div>
      </Modal>
    </div>
  );
}

export default Dashboard;