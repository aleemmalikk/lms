import { FaBuilding } from "react-icons/fa";

export default function Step3BusinessInfo({ formData, handleInputChange }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FaBuilding className="w-4 h-4 inline mr-2 text-gray-400" />
          Business Name
        </label>
        <input
          type="text"
          name="business_name"
          value={formData.business_name}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#112772] focus:border-transparent transition-all"
          placeholder="Enter business name"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Nature
          </label>
          <select
            name="business_nature"
            value={formData.business_nature}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#112772] focus:border-transparent transition-all"
          >
            <option value="">Select Business Nature</option>
            <option value="retail_shop">Retail Shop</option>
            <option value="wholesale">Wholesale</option>
            <option value="service_provider">Service Provider</option>
            <option value="manufacturer">Manufacturer</option>
            <option value="distributor">Distributor</option>
            <option value="franchise">Franchise</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Registration Number
          </label>
          <input
            type="text"
            name="business_registration_number"
            value={formData.business_registration_number}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#112772] focus:border-transparent transition-all"
            placeholder="Enter registration number"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            GST Number
          </label>
          <input
            type="text"
            name="gst_number"
            value={formData.gst_number}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#112772] focus:border-transparent transition-all"
            placeholder="Enter GST number"
            maxLength={15}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Ownership Type
          </label>
          <select
            name="business_ownership_type"
            value={formData.business_ownership_type}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#112772] focus:border-transparent transition-all"
          >
            <option value="">Select Ownership Type</option>
            <option value="private">Private</option>
            <option value="private_limited">Private Limited</option>
            <option value="llc">Limited Liability Company (LLC)</option>
            <option value="public_limited">Public Limited</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );
}