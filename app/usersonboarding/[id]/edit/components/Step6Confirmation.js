import { 
  FaUser, 
  FaEnvelope, 
  FaUserShield, 
  FaIdCard, 
  FaPhone, 
  FaCalendar, 
  FaVenusMars,
  FaBuilding,
  FaMapMarkerAlt,
  FaLandmark,
  FaCreditCard,
  FaCog,
  FaCheckCircle,
  FaTimesCircle
} from "react-icons/fa";

export default function Step6Confirmation({ formData, services, user }) {
  
  const getServiceNames = () => {
    return services
      .filter(service => formData.service_ids.includes(service.id))
      .map(service => service.name)
      .join(", ");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not provided";
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const Section = ({ title, icon: Icon, children }) => (
    <div className="bg-gray-50 rounded-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        <Icon className="w-5 h-5 text-[#112772] mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );

  const DetailRow = ({ label, value, required = false }) => (
    <div className="flex justify-between items-start py-3 border-b border-gray-200 last:border-b-0">
      <span className={`font-medium text-gray-700 ${required ? "text-red-600" : ""}`}>
        {label}
        {required && " *"}
      </span>
      <span className="text-gray-900 text-right max-w-xs">
        {value || <span className="text-gray-400 italic">Not provided</span>}
      </span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center">
          <FaCheckCircle className="w-6 h-6 text-blue-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900">Ready to Update User</h3>
            <p className="text-blue-700">
              Please review all the information below before updating the user account.
            </p>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <Section title="Basic Information" icon={FaUser}>
        <div className="space-y-2">
          <DetailRow label="Username" value={formData.username} required />
          <DetailRow label="Email Address" value={formData.email} />
          <DetailRow label="Role" value={formData.role} required />
        </div>
      </Section>

      {/* Personal Information */}
      {(formData.first_name || formData.last_name || formData.phone_number) && (
        <Section title="Personal Information" icon={FaIdCard}>
          <div className="space-y-2">
            <DetailRow label="First Name" value={formData.first_name} />
            <DetailRow label="Last Name" value={formData.last_name} />
            <DetailRow label="Phone Number" value={formData.phone_number} />
            <DetailRow label="Alternative Phone" value={formData.alternative_phone} />
            <DetailRow label="Aadhar Number" value={formData.aadhar_number} />
            <DetailRow label="PAN Number" value={formData.pan_number} />
            <DetailRow label="Date of Birth" value={formatDate(formData.date_of_birth)} />
            <DetailRow label="Gender" value={formData.gender} />
          </div>
        </Section>
      )}

      {/* Business Information */}
      {(formData.business_name || formData.business_nature) && (
        <Section title="Business Information" icon={FaBuilding}>
          <div className="space-y-2">
            <DetailRow label="Business Name" value={formData.business_name} />
            <DetailRow label="Business Nature" value={formData.business_nature} />
            <DetailRow label="Registration Number" value={formData.business_registration_number} />
            <DetailRow label="GST Number" value={formData.gst_number} />
            <DetailRow label="Ownership Type" value={formData.business_ownership_type} />
          </div>
        </Section>
      )}

      {/* Address Information */}
      {(formData.address || formData.state || formData.city) && (
        <Section title="Address Information" icon={FaMapMarkerAlt}>
          <div className="space-y-2">
            <DetailRow label="Address" value={formData.address} />
            <DetailRow label="State" value={formData.state} />
            <DetailRow label="City" value={formData.city} />
            <DetailRow label="Pincode" value={formData.pincode} />
            <DetailRow label="Landmark" value={formData.landmark} />
          </div>
        </Section>
      )}

      {/* Bank Information */}
      {(formData.bank_name || formData.account_number) && (
        <Section title="Bank Information" icon={FaCreditCard}>
          <div className="space-y-2">
            <DetailRow label="Bank Name" value={formData.bank_name} />
            <DetailRow label="Account Number" value={formData.account_number} />
            <DetailRow label="IFSC Code" value={formData.ifsc_code} />
            <DetailRow label="Account Holder Name" value={formData.account_holder_name} />
          </div>
        </Section>
      )}

      {/* Services */}
      {formData.service_ids.length > 0 && (
        <Section title="Service Access" icon={FaCog}>
          <div className="space-y-3">
            <div className="flex justify-between items-start py-3">
              <span className="font-medium text-gray-700">Selected Services</span>
              <div className="text-right max-w-xs">
                <span className="text-gray-900">{getServiceNames()}</span>
                <div className="text-sm text-gray-600 mt-1">
                  {formData.service_ids.length} service(s) selected
                </div>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* Summary */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start">
          <FaCheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-green-900 mb-2">Update Summary</h4>
            <ul className="text-green-800 space-y-1">
              <li>• User <strong>{user?.username}</strong> will be updated</li>
              <li>• New role: <strong>{formData.role}</strong></li>
              <li>• Email: <strong>{formData.email}</strong></li>
              {formData.service_ids.length > 0 && (
                <li>• Access to <strong>{formData.service_ids.length}</strong> services</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Missing Required Fields Warning */}
      {(!formData.username || !formData.role) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start">
            <FaTimesCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-red-900 mb-2">Missing Required Information</h4>
              <p className="text-red-800">
                Please go back and complete all required fields (marked with *) before updating the user.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}