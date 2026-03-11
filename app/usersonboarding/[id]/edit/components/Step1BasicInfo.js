import { FaUser, FaEnvelope, FaUserShield } from "react-icons/fa";

export default function Step1BasicInfo({ formData, handleInputChange }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FaUser className="w-4 h-4 inline mr-2 text-gray-400" />
          Username *
        </label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#112772] focus:border-transparent transition-all"
          placeholder="Enter username"
          minLength={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FaEnvelope className="w-4 h-4 inline mr-2 text-gray-400" />
          Email Address
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#112772] focus:border-transparent transition-all"
          placeholder="Enter email address"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FaUserShield className="w-4 h-4 inline mr-2 text-gray-400" />
          Role *
        </label>
        <select
          name="role"
          value={formData.role}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#112772] focus:border-transparent transition-all"
        >
          <option value="">Select Role</option>
          <option value="superadmin">Super Admin</option>
          <option value="admin">Admin</option>
          <option value="master">Master</option>
          <option value="dealer">Dealer</option>
          <option value="retailer">Retailer</option>
        </select>
      </div>
    </div>
  );
}