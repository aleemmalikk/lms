"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  FaArrowLeft, 
  FaEdit,
  FaExclamationTriangle,
  FaSave,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";
import Step1BasicInfo from "./components/Step1BasicInfo";
import Step2PersonalInfo from "./components/Step2PersonalInfo";
import Step3BusinessInfo from "./components/Step3BusinessInfo";
import Step4AddressInfo from "./components/Step4AddressInfo";
import Step5BankAndServices from "./components/Step5BankAndServices";
import Step6Confirmation from "./components/Step6Confirmation";
import ProgressSidebar from "../../add/components/ProgressSidebar";
import { BASE_URL } from '../../../lib/api';


const STEPS = [
  { id: 1, title: "Basic Info", icon: "FaUser", description: "Account details" },
  { id: 2, title: "Personal Info", icon: "FaIdCard", description: "Personal information" },
  { id: 3, title: "Business Info", icon: "FaBuilding", description: "Business details" },
  { id: 4, title: "Address", icon: "FaMapMarkerAlt", description: "Location information" },
  { id: 5, title: "Bank & Services", icon: "FaCog", description: "Bank details and services" },
  { id: 6, title: "Confirmation", icon: "FaCheck", description: "Review and update user" }
];

export default function EditUserPage() {
  const [user, setUser] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [services, setServices] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const router = useRouter();
  const params = useParams();
  const userId = params.id;

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    alternative_phone: "",
    aadhar_number: "",
    pan_number: "",
    date_of_birth: "",
    gender: "",
    business_name: "",
    business_nature: "",
    business_registration_number: "",
    gst_number: "",
    business_ownership_type: "",
    address: "",
    state: "",
    city: "",
    pincode: "",
    landmark: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    account_holder_name: "",
    service_ids: []
  });

  useEffect(() => {
    fetchUserDetails();
    fetchServices();
    fetchStates();
  }, [userId]);

  useEffect(() => {
    if (selectedState) {
      fetchCities(selectedState);
    }
  }, [selectedState]);

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE_URL}users/${userId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        
        setFormData({
          username: userData.username || "",
          email: userData.email || "",
          role: userData.role || "",
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
          phone_number: userData.phone_number || "",
          alternative_phone: userData.alternative_phone || "",
          aadhar_number: userData.aadhar_number || "",
          pan_number: userData.pan_number || "",
          date_of_birth: userData.date_of_birth || "",
          gender: userData.gender || "",
          business_name: userData.business_name || "",
          business_nature: userData.business_nature || "",
          business_registration_number: userData.business_registration_number || "",
          gst_number: userData.gst_number || "",
          business_ownership_type: userData.business_ownership_type || "",
          address: userData.address || "",
          state: userData.state || "",
          city: userData.city || "",
          pincode: userData.pincode || "",
          landmark: userData.landmark || "",
          service_ids: userData.service_ids || []
        });

        if (userData.state) {
          const stateObj = states.find(s => s.name === userData.state);
          if (stateObj) {
            setSelectedState(stateObj.id.toString());
          }
        }
      } else {
        setError("Failed to fetch user details");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      setError("Error fetching user details");
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE_URL}onboardservices/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (res.ok) {
        const data = await res.json();
        setServices(data);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const fetchStates = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE_URL}states/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (res.ok) {
        const data = await res.json();
        setStates(data);
      }
    } catch (error) {
      console.error("Error fetching states:", error);
    }
  };

  const fetchCities = async (stateId) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE_URL}cities/?state=${stateId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (res.ok) {
        const data = await res.json();
        setCities(data);
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'service_ids') {
        const serviceId = parseInt(value);
        setFormData(prev => ({
          ...prev,
          service_ids: checked 
            ? [...prev.service_ids, serviceId]
            : prev.service_ids.filter(id => id !== serviceId)
        }));
      }
    } else if (name === 'state') {
      const selectedStateObj = states.find(state => state.id === parseInt(value));
      setSelectedState(value);
      setFormData(prev => ({
        ...prev,
        state: selectedStateObj ? selectedStateObj.name : "",
        city: ""
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateStep = (step) => {
    setError("");
    
    switch (step) {
      case 1:
        if (!formData.username || !formData.role) {
          setError("Username and role are required");
          return false;
        }
        if (formData.username.length < 3) {
          setError("Username must be at least 3 characters long");
          return false;
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setError("Please enter a valid email address");
          return false;
        }
        break;
      
      case 6:
        if (!formData.username || !formData.role) {
          setError("Basic information is incomplete");
          return false;
        }
        break;
      
      default:
        break;
    }
    
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateStep(currentStep)) {
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("accessToken");
      
      const userData = {
        username: formData.username,
        email: formData.email,
        role: formData.role,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        alternative_phone: formData.alternative_phone,
        aadhar_number: formData.aadhar_number,
        pan_number: formData.pan_number,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        business_name: formData.business_name,
        business_nature: formData.business_nature,
        business_registration_number: formData.business_registration_number,
        gst_number: formData.gst_number,
        business_ownership_type: formData.business_ownership_type,
        address: formData.address,
        state: formData.state,
        city: formData.city,
        pincode: formData.pincode,
        landmark: formData.landmark,
        bank_name: formData.bank_name,
        account_number: formData.account_number,
        ifsc_code: formData.ifsc_code,
        account_holder_name: formData.account_holder_name,
        service_ids: formData.service_ids
      };

      Object.keys(userData).forEach(key => {
        if (userData[key] === "" || userData[key] === null) {
          delete userData[key];
        }
      });

      const res = await fetch(`${BASE_URL}users/${userId}/`, {
        method: "PATCH",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (res.ok) {
        setSuccess("User updated successfully!");
        setTimeout(() => {
          router.push(`/usersonboarding/${userId}`);
        }, 1500);
      } else {
        const data = await res.json();
        setError(data.detail || data.message || "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      setError("Error updating user");
    } finally {
      setSaving(false);
    }
  };

  const renderStepContent = () => {
    const commonProps = {
      formData,
      handleInputChange,
      states,
      cities,
      selectedState,
      services
    };

    switch (currentStep) {
      case 1:
        return <Step1BasicInfo {...commonProps} />;
      case 2:
        return <Step2PersonalInfo {...commonProps} />;
      case 3:
        return <Step3BusinessInfo {...commonProps} />;
      case 4:
        return <Step4AddressInfo {...commonProps} />;
      case 5:
        return <Step5BankAndServices {...commonProps} />;
      case 6:
        return <Step6Confirmation {...commonProps} user={user} />;
      default:
        return <Step1BasicInfo {...commonProps} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#112772]"></div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">User Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => router.push("/usersonboarding")}
            className="bg-[#112772] text-white px-6 py-2 rounded-lg hover:bg-blue-900 transition-colors"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className=" bg-gray-50">
      <div className="px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
             
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <FaEdit className="w-8 h-8 mr-3 text-[#112772]" />
                  Edit User
                </h1>
                <p className="text-gray-600 mt-2">
                  Update information for {user?.username} - Step {currentStep} of {STEPS.length}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Progress Sidebar */}
          <div className="lg:col-span-1">
            <ProgressSidebar 
              steps={STEPS} 
              currentStep={currentStep} 
            />
          </div>

          {/* Main Form */}
          <div className="lg:col-span-3">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              {/* Step Header */}
              <div className="mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {/* Icon will be handled in individual step components */}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {STEPS[currentStep - 1]?.title}
                    </h2>
                    <p className="text-gray-600">
                      {STEPS[currentStep - 1]?.description}
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
                  <FaExclamationTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
                  {error}
                </div>
              )}
              
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                  {success}
                </div>
              )}

              <form onSubmit={currentStep === STEPS.length ? handleSubmit : (e) => e.preventDefault()}>
                <div className="mb-8">
                  {renderStepContent()}
                </div>

                <div className="flex justify-between pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                      currentStep === 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <FaChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </button>

                  {currentStep < STEPS.length ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="flex items-center px-6 py-3 bg-[#112772] text-white rounded-lg font-medium hover:bg-blue-900 transition-colors"
                    >
                      {currentStep === STEPS.length - 1 ? "Review & Update" : "Next"}
                      <FaChevronRight className="w-4 h-4 ml-2" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={saving}
                      className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                        saving
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Updating User...
                        </>
                      ) : (
                        <>
                          <FaSave className="w-4 h-4 mr-2" />
                          Update User
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}