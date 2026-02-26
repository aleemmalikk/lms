"use client";
import React, { useState } from 'react';
import { FaPlus, FaImage, FaToggleOn, FaToggleOff, FaEdit, FaWpforms } from 'react-icons/fa';
import DataTable from '../common/datatable';
import ServiceFormBuilder from '../serviceformbuilder';
import { BASE_URL } from "../../../lib/api";


const SubcategoriesTab = ({ 
  subcategories, 
  loading, 
  onAdd, 
  onEdit, 
  onDelete, 
  onToggle 
}) => {
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  const columns = [
    { key: 'id', title: 'ID' },
    { 
      key: 'image', 
      title: 'Image',
      render: (item) => item.image ? (
        <img src={item.image} alt={item.name} className="h-10 w-10 object-cover rounded" />
      ) : (
        <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
          <FaImage className="text-gray-400" />
        </div>
      )
    },
    { key: 'category_name', title: 'Category' },
    { key: 'name', title: 'Name' },
    { 
      key: 'description', 
      title: 'Description',
      render: (item) => item.description || '-'
    },
    { 
      key: 'required_fields', 
      title: 'Fields',
      render: (item) => (
        <span className={`px-2 py-1 rounded text-xs ${
          item.required_fields?.length > 0 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {item.required_fields?.length || 0} fields
        </span>
      )
    },
    { 
      key: 'is_active', 
      title: 'Status',
      render: (item) => (
        <button
          onClick={() => onToggle(item)}
          className={`flex items-center gap-2 ${
            item.is_active ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {item.is_active ? <FaToggleOn /> : <FaToggleOff />}
          {item.is_active ? 'Active' : 'Inactive'}
        </button>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (item) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedSubcategory(item);
              setShowFormBuilder(true);
            }}
            className="text-purple-600 hover:text-purple-800"
            title="Manage Form Fields"
          >
            <FaWpforms />
          </button>
          <button
            onClick={() => onEdit(item)}
            className="text-blue-600 hover:text-blue-800"
          >
            <FaEdit />
          </button>
        </div>
      )
    }
  ];

  const handleSaveForm = async (fields) => {
  try {
    const token = localStorage.getItem('accessToken');
    
    // Create a mapping of field names to their require_* boolean fields
    const fieldToBooleanMap = {
      'customer_name': 'require_customer_name',
      'customer_email': 'require_customer_email',
      'customer_phone': 'require_customer_phone',
      'customer_address': 'require_customer_address',
      'mobile_number': 'require_mobile_number',
      'consumer_number': 'require_consumer_number',
      'account_number': 'require_account_number',
      'bill_number': 'require_bill_number',
      'transaction_id': 'require_transaction_id',
      'reference_number': 'require_reference_number',
      'state': 'require_state',
      'city': 'require_city',
      'pincode': 'require_pincode',
      'amount': 'require_amount',
      'tax_amount': 'require_tax_amount',
      'total_amount': 'require_total_amount',
      'service_provider': 'require_service_provider',
      'operator': 'require_operator',
      'biller': 'require_biller',
      'bank_name': 'require_bank_name',
      'vehicle_number': 'require_vehicle_number',
      'vehicle_type': 'require_vehicle_type',
      'rc_number': 'require_rc_number',
      'student_name': 'require_student_name',
      'student_id': 'require_student_id',
      'institute_name': 'require_institute_name',
      'course_name': 'require_course_name',
      'loan_type': 'require_loan_type',
      'loan_account_number': 'require_loan_account_number',
      'emi_amount': 'require_emi_amount',
      'ott_platform': 'require_ott_platform',
      'subscription_plan': 'require_subscription_plan',
      'validity': 'require_validity',
      'meter_number': 'require_meter_number',
      'connection_type': 'require_connection_type',
      'usage_amount': 'require_usage_amount',
      'payment_method': 'require_payment_method',
      'card_number': 'require_card_number',
      'card_holder_name': 'require_card_holder_name',
      'expiry_date': 'require_expiry_date',
      'cvv': 'require_cvv',
      'due_date': 'require_due_date',
      'billing_period': 'require_billing_period',
      'remarks': 'require_remarks',
      'documents': 'require_documents',
      'browse_plan': 'require_browse_plan',
      'fetch_plan': 'require_fetch_plan',
      'plan_selection': 'require_plan_selection'
    };

    // Create update data with all require_* fields
    const updateData = {
      required_fields: fields
    };

    // Initialize all require_* fields to false
    Object.values(fieldToBooleanMap).forEach(field => {
      updateData[field] = false;
    });

    // Set require_* fields to true based on the fields in the form
    fields.forEach(field => {
      const booleanField = fieldToBooleanMap[field.field_name];
      if (booleanField) {
        updateData[booleanField] = true;
      }
    });

    console.log('Sending update data:', updateData);

    const response = await fetch(
      `${BASE_URL}services/subcategories/${selectedSubcategory.id}/`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      }
    );

    if (response.ok) {
      const updatedData = await response.json();
      console.log('Successfully updated:', updatedData);
      alert('Form fields saved successfully!');
      setShowFormBuilder(false);
      // Refresh the data
      window.location.reload();
    } else {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      alert('Failed to save form fields: ' + JSON.stringify(errorData));
    }
  } catch (error) {
    console.error('Error saving form fields:', error);
    alert('Error saving form fields: ' + error.message);
  }
};

  if (showFormBuilder) {
    return (
      <ServiceFormBuilder
        subcategory={selectedSubcategory}
        onSave={handleSaveForm}
        onCancel={() => setShowFormBuilder(false)}
        existingFields={selectedSubcategory.required_fields || []}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold">Service Subcategories</h3>
        <button
          onClick={onAdd}
          className="bg-blue-600 md:text-l text-[10px] text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700"
        >
          <FaPlus /> Add Subcategory
        </button>
      </div>
      
      <DataTable
        columns={columns}
        data={subcategories}
        loading={loading}
        emptyMessage="No subcategories found"
        onEdit={onEdit}
        onDelete={onDelete}
        onToggle={onToggle}
      />
    </div>
  );
};

export default SubcategoriesTab;