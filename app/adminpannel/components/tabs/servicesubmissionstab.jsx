// "use client";
// import React, { useState } from 'react';
// import { FaUser, FaEnvelope, FaPhone, FaCalendar, FaRupeeSign, FaEdit } from 'react-icons/fa';

// const ServiceSubmissionsTab = ({ serviceSubmissions, loading, onStatusUpdate }) => {
//   const [editingStatus, setEditingStatus] = useState(null);
//   const [updating, setUpdating] = useState(false);

//   // Status options for dropdown - MUST MATCH DJANGO MODEL CHOICES
//   const statusOptions = [
//     { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
//     { value: 'submitted', label: 'Submitted', color: 'bg-blue-100 text-blue-800' },
//     { value: 'processing', label: 'Processing', color: 'bg-yellow-100 text-yellow-800' },
//     { value: 'success', label: 'Success', color: 'bg-green-100 text-green-800' },
//     { value: 'failed', label: 'Failed', color: 'bg-red-100 text-red-800' },
//     { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-800' }
//   ];

//   // Function to handle status update
//   const handleStatusUpdate = async (submissionId, newStatus) => {
//     if (!onStatusUpdate) {
//       console.error('onStatusUpdate function not provided');
//       return;
//     }

//     setUpdating(true);
//     try {
//       await onStatusUpdate(submissionId, newStatus);
//       setEditingStatus(null);
//     } catch (error) {
//       console.error('Failed to update status:', error);
//       alert(`Failed to update status: ${error.message}`);
//     } finally {
//       setUpdating(false);
//     }
//   };

//   // Function to get status badge styling
//   const getStatusBadge = (status) => {
//     const statusConfig = statusOptions.find(opt => opt.value === status) || statusOptions[0];
    
//     return (
//       <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
//         {statusConfig.label}
//       </span>
//     );
//   };

//   // Function to render editable status
//   const renderEditableStatus = (submission) => {
//     if (editingStatus === submission.id) {
//       return (
//         <div className="flex flex-col space-y-2">
//           <select
//             value={submission.status || 'draft'}
//             onChange={(e) => handleStatusUpdate(submission.id, e.target.value)}
//             disabled={updating}
//             className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
//           >
//             {statusOptions.map(option => (
//               <option key={option.value} value={option.value}>
//                 {option.label}
//               </option>
//             ))}
//           </select>
//           {updating && (
//             <div className="text-xs text-gray-500">Updating...</div>
//           )}
//         </div>
//       );
//     }

//     return (
//       <div className="flex items-center gap-2">
//         {getStatusBadge(submission.status)}
//         <button
//           onClick={() => setEditingStatus(submission.id)}
//           className="text-gray-400 hover:text-blue-600 transition-colors"
//           title="Edit Status"
//         >
//           <FaEdit className="text-xs" />
//         </button>
//       </div>
//     );
//   };

//   if (loading) {
//     return (
//       <div className="bg-white rounded-lg shadow-md">
//         <div className="p-4 border-b">
//           <h3 className="text-lg font-semibold">Service Submissions</h3>
//         </div>
//         <div className="p-8 text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading submissions...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!serviceSubmissions || serviceSubmissions.length === 0) {
//     return (
//       <div className="bg-white rounded-lg shadow-md">
//         <div className="p-4 border-b">
//           <h3 className="text-lg font-semibold">Service Submissions</h3>
//         </div>
//         <div className="p-8 text-center text-gray-500">
//           <FaUser className="text-4xl text-gray-400 mx-auto mb-4" />
//           <p className="text-lg font-medium mb-2">No submissions found</p>
//           <p className="text-sm">Service submissions will appear here once users start submitting forms.</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white rounded-lg shadow-md">
//       <div className="p-4 border-b flex justify-between items-center">
//         <h3 className="text-lg font-semibold">Service Submissions</h3>
//         <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
//           {serviceSubmissions.length} submission{serviceSubmissions.length !== 1 ? 's' : ''}
//         </span>
//       </div>
      
//       <div className="overflow-x-auto">
//         <table className="min-w-full">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 ID
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Service Details
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Customer Info
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Amount
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Status
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Date
//               </th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {serviceSubmissions.map((submission) => (
//               <tr key={submission.id} className="hover:bg-gray-50">
//                 {/* ID */}
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className="text-sm font-medium text-gray-900">#{submission.id}</div>
//                   {submission.submission_id && (
//                     <div className="text-xs text-gray-500">Ref: {submission.submission_id}</div>
//                   )}
//                 </td>

//                 {/* Service Details */}
//                 <td className="px-6 py-4">
//                   <div className="flex flex-col space-y-2">
//                     <div>
//                       <div className="text-sm font-medium text-gray-900">
//                         Service: {submission.service_form_name || submission.service_subcategory_name || 'Unknown Service'}
//                       </div>
//                       {submission.service_subcategory && (
//                         <div className="text-xs text-gray-500 mt-1">
//                           Subcategory ID: {submission.service_subcategory}
//                         </div>
//                       )}
//                     </div>
//                     {submission.notes && (
//                       <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
//                         <strong>Notes:</strong> {submission.notes}
//                       </div>
//                     )}
//                   </div>
//                 </td>

//                 {/* Customer Information */}
//                 <td className="px-6 py-4">
//                   <div className="flex flex-col space-y-2">
//                     <div className="flex items-center gap-2">
//                       <FaUser className="text-gray-400" />
//                       <div>
//                         <div className="text-sm font-medium text-gray-900">
//                           {submission.customer_name || 'No Name Provided'}
//                         </div>
//                         {submission.submitted_by_username && submission.submitted_by_username !== submission.customer_name && (
//                           <div className="text-xs text-gray-500">
//                             User: {submission.submitted_by_username}
//                           </div>
//                         )}
//                       </div>
//                     </div>
                    
//                     <div className="space-y-1 text-sm">
//                       {submission.customer_email && (
//                         <div className="flex items-center gap-2">
//                           <FaEnvelope className="text-gray-400" />
//                           <span className="text-gray-600">{submission.customer_email}</span>
//                         </div>
//                       )}
//                       {submission.customer_phone && (
//                         <div className="flex items-center gap-2">
//                           <FaPhone className="text-gray-400" />
//                           <span className="text-gray-600">{submission.customer_phone}</span>
//                         </div>
//                       )}
//                     </div>

//                     {/* Show additional fields if available in form_data */}
//                     {submission.form_data && (
//                       <div className="text-xs text-gray-500 space-y-1 mt-2">
//                         {submission.form_data.state && <div>State: {submission.form_data.state}</div>}
//                         {submission.form_data.city && <div>City: {submission.form_data.city}</div>}
//                         {submission.form_data.operator && <div>Operator: {submission.form_data.operator}</div>}
//                         {submission.form_data.service_provider && <div>Provider: {submission.form_data.service_provider}</div>}
//                       </div>
//                     )}
//                   </div>
//                 </td>

//                 {/* Amount */}
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   {submission.amount && parseFloat(submission.amount) > 0 ? (
//                     <div className="flex items-center gap-2">
//                       <FaRupeeSign className="text-green-600" />
//                       <span className="text-sm font-medium text-green-600">
//                         {parseFloat(submission.amount).toLocaleString('en-IN')}
//                       </span>
//                     </div>
//                   ) : (
//                     <span className="text-sm text-gray-400">-</span>
//                   )}
//                 </td>

//                 {/* Status with Edit */}
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   {renderEditableStatus(submission)}
//                 </td>

//                 {/* Date */}
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className="flex items-center gap-2 text-sm text-gray-500">
//                     <FaCalendar className="text-gray-400" />
//                     {submission.created_at ? (
//                       <div className="flex flex-col">
//                         <span>{new Date(submission.created_at).toLocaleDateString('en-IN')}</span>
//                         <span className="text-xs text-gray-400">
//                           {new Date(submission.created_at).toLocaleTimeString('en-IN')}
//                         </span>
//                       </div>
//                     ) : (
//                       <span>-</span>
//                     )}
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default ServiceSubmissionsTab;