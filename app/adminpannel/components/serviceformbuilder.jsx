"use client";
import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaCheckSquare, FaSquare } from 'react-icons/fa';

const ServiceFormBuilder = ({ 
  subcategory, 
  category,
  onSave, 
  onCancel,
  existingFields = [] 
}) => {
  const entity = category || subcategory;
  const entityType = category ? 'category' : 'subcategory';
  const [fields, setFields] = useState(existingFields);
  const [editingField, setEditingField] = useState(null);
  const [fieldData, setFieldData] = useState({
    field_name: '',
    field_label: '',
    field_type: 'text',
    required: false
  });
  const [selectedFields, setSelectedFields] = useState(new Set());

  const fieldTypes = [
    { value: 'text', label: 'Text Input' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone Number' },
    { value: 'number', label: 'Number' },
    { value: 'amount', label: 'Amount' },
    { value: 'select', label: 'Dropdown Select' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'date', label: 'Date' },
    { value: 'file', label: 'File Upload' },
    { value: 'boolean', label: 'Checkbox' },
    { value: 'button', label: 'Button' }
  ];

  const predefinedFields = {
    customer_name: { field_label: 'Customer Name', field_type: 'text' },
    customer_email: { field_label: 'Customer Email', field_type: 'email' },
    customer_phone: { field_label: 'Customer Phone', field_type: 'phone' },
    customer_address: { field_label: 'Customer Address', field_type: 'textarea' },
    mobile_number: { field_label: 'Mobile Number', field_type: 'phone' },
    consumer_number: { field_label: 'Consumer Number', field_type: 'text' },
    account_number: { field_label: 'Account Number', field_type: 'text' },
    bill_number: { field_label: 'Bill Number', field_type: 'text' },
    transaction_id: { field_label: 'Transaction ID', field_type: 'text' },
    reference_number: { field_label: 'Reference Number', field_type: 'text' },
    state: { field_label: 'State', field_type: 'select' },
    city: { field_label: 'City', field_type: 'select' },
    pincode: { field_label: 'Pincode', field_type: 'text' },
    amount: { field_label: 'Amount', field_type: 'amount' },
    tax_amount: { field_label: 'Tax Amount', field_type: 'amount' },
    total_amount: { field_label: 'Total Amount', field_type: 'amount' },
    service_provider: { field_label: 'Service Provider', field_type: 'select' },
    operator: { field_label: 'Operator', field_type: 'select' },
    biller: { field_label: 'Biller', field_type: 'select' },
    bank_name: { field_label: 'Bank Name', field_type: 'select' },
    vehicle_number: { field_label: 'Vehicle Number', field_type: 'text' },
    vehicle_type: { field_label: 'Vehicle Type', field_type: 'select' },
    rc_number: { field_label: 'RC Number', field_type: 'text' },
    student_name: { field_label: 'Student Name', field_type: 'text' },
    student_id: { field_label: 'Student ID', field_type: 'text' },
    institute_name: { field_label: 'Institute Name', field_type: 'select' },
    course_name: { field_label: 'Course Name', field_type: 'text' },
    loan_type: { field_label: 'Loan Type', field_type: 'select' },
    loan_account_number: { field_label: 'Loan Account Number', field_type: 'text' },
    emi_amount: { field_label: 'EMI Amount', field_type: 'amount' },
    ott_platform: { field_label: 'OTT Platform', field_type: 'select' },
    subscription_plan: { field_label: 'Subscription Plan', field_type: 'select' },
    validity: { field_label: 'Validity', field_type: 'select' },
    meter_number: { field_label: 'Meter Number', field_type: 'text' },
    connection_type: { field_label: 'Connection Type', field_type: 'select' },
    usage_amount: { field_label: 'Usage Amount', field_type: 'amount' },
    payment_method: { field_label: 'Payment Method', field_type: 'select' },
    card_number: { field_label: 'Card Number', field_type: 'text' },
    card_holder_name: { field_label: 'Card Holder Name', field_type: 'text' },
    expiry_date: { field_label: 'Expiry Date', field_type: 'date' },
    cvv: { field_label: 'CVV', field_type: 'text' },
    due_date: { field_label: 'Due Date', field_type: 'date' },
    billing_period: { field_label: 'Billing Period', field_type: 'text' },
    remarks: { field_label: 'Remarks', field_type: 'textarea' },
    documents: { field_label: 'Documents', field_type: 'file' },

    browse_plan: { field_label: 'Browse Plans', field_type: 'button' },
    fetch_plan: { field_label: 'Fetch Plans', field_type: 'button' },
    plan_selection: { field_label: 'Select Plan', field_type: 'select' },
    // DTH/Cable TV
  dth_operator: { field_label: 'DTH Operator', field_type: 'select' },
  dth_plan_amount: { field_label: 'DTH Plan/Amount', field_type: 'select' },
  cable_operator: { field_label: 'Cable Operator', field_type: 'select' },
  cable_plan_amount: { field_label: 'Cable Plan/Amount', field_type: 'select' },
  subscriber_number: { field_label: 'Subscriber Number', field_type: 'text' },
  consumer_id: { field_label: 'Consumer ID', field_type: 'text' },
  
  // Mobile Recharge
  recharge_type: { field_label: 'Recharge Type', field_type: 'select' },
  plan_browsing: { field_label: 'Browse Plans', field_type: 'select' },
  
  // Education
  student_unique_id: { field_label: 'Student Unique ID', field_type: 'text' },
  student_relation: { field_label: 'Student Relation', field_type: 'select' },
  institution_name: { field_label: 'Institution Name', field_type: 'select' },
  
  // OTT
  ott_plan_selection: { field_label: 'OTT Plan Selection', field_type: 'select' },
  rent_to_mobile: { field_label: 'Rent to Mobile', field_type: 'phone' },
  pan_number: { field_label: 'PAN Number', field_type: 'text' },
  
  // Credit Card
  card_number: { field_label: 'Card Number', field_type: 'text' },
  card_holder_name: { field_label: 'Card Holder Name', field_type: 'text' },
  payment_option: { field_label: 'Payment Option', field_type: 'select' },
  full_amount: { field_label: 'Full Amount', field_type: 'amount' },
  minimum_amount: { field_label: 'Minimum Amount', field_type: 'amount' },
  other_amount: { field_label: 'Other Amount', field_type: 'amount' },
  
  // Society Maintenance
  apartment_number: { field_label: 'Apartment Number', field_type: 'text' },
  building_number: { field_label: 'Building Number', field_type: 'text' },
  
  // Traffic Challan
  traffic_authority: { field_label: 'Traffic Authority', field_type: 'select' },
  challan_number: { field_label: 'Challan Number', field_type: 'text' },
  
  // Municipal Tax
  corporation: { field_label: 'Municipal Corporation', field_type: 'select' },
  taxpayer_relation: { field_label: 'Taxpayer Relation', field_type: 'select' },
  upic_number: { field_label: 'UPIC Number', field_type: 'text' },
  
  // Financial
  financial_year: { field_label: 'Financial Year', field_type: 'select' },
  assessment_year: { field_label: 'Assessment Year', field_type: 'select' },
  
  // Additional
  bill_due_date: { field_label: 'Bill Due Date', field_type: 'date' },
  late_fee: { field_label: 'Late Fee', field_type: 'amount' },
  discount_amount: { field_label: 'Discount Amount', field_type: 'amount' },
  payment_date: { field_label: 'Payment Date', field_type: 'date' },
  service_charge: { field_label: 'Service Charge', field_type: 'amount' }
  };

  // Initialize selected fields when component mounts
  useEffect(() => {
    const initialSelected = new Set();
    fields.forEach(field => {
      initialSelected.add(field.field_name);
    });
    setSelectedFields(initialSelected);
  }, [fields]);

  const toggleFieldSelection = (fieldName) => {
    setSelectedFields(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(fieldName)) {
        newSelected.delete(fieldName);
        // Remove from fields
        setFields(prevFields => prevFields.filter(f => f.field_name !== fieldName));
      } else {
        newSelected.add(fieldName);
        // Add to fields if not already present
        if (!fields.find(f => f.field_name === fieldName)) {
          const fieldConfig = predefinedFields[fieldName];
          const newField = {
            field_name: fieldName,
            field_label: fieldConfig.field_label,
            field_type: fieldConfig.field_type,
            required: true
          };
          setFields(prev => [...prev, newField]);
        }
      }
      return newSelected;
    });
  };

  const addPredefinedField = (fieldName) => {
    toggleFieldSelection(fieldName);
  };

  const addCustomField = () => {
    if (!fieldData.field_name || !fieldData.field_label) {
      alert('Please fill in field name and label');
      return;
    }

    const newField = { ...fieldData };

    if (editingField !== null) {
      // Update existing field
      setFields(prev => 
        prev.map((field, index) => 
          index === editingField ? newField : field
        )
      );
      setEditingField(null);
    } else {
      // Add new field
      setFields(prev => [...prev, newField]);
      // Add to selected fields
      setSelectedFields(prev => new Set(prev).add(newField.field_name));
    }

    // Reset form
    setFieldData({
      field_name: '',
      field_label: '',
      field_type: 'text',
      required: false
    });
  };

  const editField = (index) => {
    const field = fields[index];
    setFieldData({ ...field });
    setEditingField(index);
  };

  const deleteField = (index) => {
    const fieldToDelete = fields[index];
    setFields(prev => prev.filter((_, i) => i !== index));
    // Remove from selected fields
    setSelectedFields(prev => {
      const newSelected = new Set(prev);
      newSelected.delete(fieldToDelete.field_name);
      return newSelected;
    });
  };

  const moveField = (index, direction) => {
    const newFields = [...fields];
    const newIndex = index + direction;
    
    if (newIndex >= 0 && newIndex < newFields.length) {
      [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
      setFields(newFields);
    }
  };

  const handleSave = () => {
    onSave(fields);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">

         <h3 className="text-xl font-semibold">
            {entityType === 'category' 
              ? `Form Builder for ${entity?.name} (Category)`
              : `Form Builder for ${subcategory?.name} (Subcategory)`
            }
          </h3>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <FaTimes className="inline mr-2" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <FaSave className="inline mr-2" />
            Save Form
          </button>
        </div>
      </div>

      {/* Predefined Fields Quick Add with Checkboxes */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Select Predefined Fields</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-lg">
          {Object.entries(predefinedFields).map(([fieldName, fieldConfig]) => (
            <div key={fieldName} className="flex items-center">
              <button
                onClick={() => toggleFieldSelection(fieldName)}
                className={`flex items-center gap-2 p-2 text-xs w-full text-left rounded ${
                  selectedFields.has(fieldName)
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-100 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                {selectedFields.has(fieldName) ? (
                  <FaCheckSquare className="text-blue-600" />
                ) : (
                  <FaSquare className="text-gray-400" />
                )}
                <span>{fieldConfig.field_label}</span>
              </button>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Selected: {selectedFields.size} fields
        </p>
      </div>

      {/* Custom Field Form */}
      <div className="mb-6 p-4 border border-gray-200 rounded-lg">
        <h4 className="font-semibold mb-3">
          {editingField !== null ? 'Edit Field' : 'Add Custom Field'}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Field Name *
            </label>
            <input
              type="text"
              value={fieldData.field_name}
              onChange={(e) => setFieldData(prev => ({ 
                ...prev, 
                field_name: e.target.value 
              }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="e.g., customer_name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Field Label *
            </label>
            <input
              type="text"
              value={fieldData.field_label}
              onChange={(e) => setFieldData(prev => ({ 
                ...prev, 
                field_label: e.target.value 
              }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="e.g., Customer Name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Field Type
            </label>
            <select
              value={fieldData.field_type}
              onChange={(e) => setFieldData(prev => ({ 
                ...prev, 
                field_type: e.target.value 
              }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              {fieldTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={fieldData.required}
                onChange={(e) => setFieldData(prev => ({ 
                  ...prev, 
                  required: e.target.checked 
                }))}
                className="mr-2"
              />
              Required Field
            </label>
          </div>
        </div>
        
        <div className="mt-4">
          <button
            onClick={addCustomField}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <FaPlus className="inline mr-2" />
            {editingField !== null ? 'Update Field' : 'Add Field'}
          </button>
          
          {editingField !== null && (
            <button
              onClick={() => {
                setEditingField(null);
                setFieldData({
                  field_name: '',
                  field_label: '',
                  field_type: 'text',
                  required: false
                });
              }}
              className="ml-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* Fields List */}
      <div>
        <h4 className="font-semibold mb-3">
          Form Fields ({fields.length})
        </h4>
        
        {fields.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No fields added yet. Select fields from above or add custom fields.
          </div>
        ) : (
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <span className="font-medium">{field.field_label}</span>
                    <span className="text-sm text-gray-500">({field.field_name})</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      field.field_type === 'select' ? 'bg-purple-100 text-purple-800' :
                      field.field_type === 'file' ? 'bg-orange-100 text-orange-800' :
                      field.field_type === 'boolean' ? 'bg-pink-100 text-pink-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {field.field_type}
                    </span>
                    {field.required && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                        Required
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => moveField(index, -1)}
                    disabled={index === 0}
                    className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveField(index, 1)}
                    disabled={index === fields.length - 1}
                    className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => editField(index)}
                    className="p-1 text-blue-600 hover:text-blue-800"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => deleteField(index)}
                    className="p-1 text-red-600 hover:text-red-800"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Preview */}
      {fields.length > 0 && (
        <div className="mt-8 p-4 border border-gray-200 rounded-lg">
          <h4 className="font-semibold mb-4">Form Preview</h4>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.field_label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.field_type === 'text' && (
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder={`Enter ${field.field_label}`}
                  />
                )}
                {field.field_type === 'email' && (
                  <input
                    type="email"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Enter email address"
                  />
                )}
                {field.field_type === 'phone' && (
                  <input
                    type="tel"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Enter phone number"
                  />
                )}
                {field.field_type === 'select' && (
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option value="">Select {field.field_label}</option>
                  </select>
                )}
                {field.field_type === 'textarea' && (
                  <textarea
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows="3"
                    placeholder={`Enter ${field.field_label}`}
                  />
                )}
                {field.field_type === 'boolean' && (
                  <input
                    type="checkbox"
                    className="mr-2"
                  />
                )}
                {field.field_type === 'file' && (
                  <input
                    type="file"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceFormBuilder;