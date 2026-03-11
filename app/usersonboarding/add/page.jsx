"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FaUserPlus,
  FaExclamationTriangle,
  FaCheck,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";
import Step1BasicInfo from "./components/Step1BasicInfo";
import Step2PersonalInfo from "./components/Step2PersonalInfo";
import Step3BusinessInfo from "./components/Step3BusinessInfo";
import Step4AddressInfo from "./components/Step4AddressInfo";
import Step5BankAndServices from "./components/Step5BankAndServices";
import ProgressSidebar from "./components/ProgressSidebar";
import { BASE_URL } from "@/app/lib/api";
import Step7Confirmation from "./components/Step7Confirmation";
import Step6AssignCommission from "./components/Step6AssignCommission";

const STEPS = [
  { id: 1, title: "Basic Info", icon: "FaUser", description: "Account details" },
  { id: 2, title: "Personal Info", icon: "FaIdCard", description: "Personal information" },
  { id: 3, title: "Business Info", icon: "FaBuilding", description: "Business details" },
  { id: 4, title: "Address", icon: "FaMapMarkerAlt", description: "Location information" },
  { id: 5, title: "Bank & Services", icon: "FaCog", description: "Bank details and services" },
  { id: 6, title: "Assign Commission", icon: "FaGift", description: "Assign commission plan" },
  { id: 7, title: "Confirmation", icon: "FaCheck", description: "Review and create user" }
];

const getCreatableRole = (currentUserRole) => {
  const roleMap = {
    admin: "master",
    master: "dealer",
    dealer: "retailer"
  };
  return roleMap[currentUserRole] || null;
};

export default function AddUserPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [availableRoles, setAvailableRoles] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [services, setServices] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [popup, setPopup] = useState({ show: false, type: "", message: "", title: "" });
  const router = useRouter();
  const creatableRole = getCreatableRole(currentUserRole);
  const [parentChain, setParentChain] = useState([]);
  const [selectedChain, setSelectedChain] = useState({});

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
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
    commission_plan_id: "",
    commission_plan_name: "",
    service_ids: []
  });


  useEffect(() => {
    if (!formData.role) return;

    const token = localStorage.getItem("accessToken");

    fetch(`${BASE_URL}user-hierarchy/parent_chain/?role=${formData.role}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.users?.length) {
          setParentChain([data]);
        } else {
          setParentChain([]);
        }
        setSelectedChain({});
      });
  }, [formData.role]);



  useEffect(() => {
    const checkAuthAndPermissions = () => {
      const isAuthenticated = localStorage.getItem("isAuthenticated");
      const userRole = localStorage.getItem("userRole");

      if (!isAuthenticated) {
        router.push("/auth/login");
        return;
      }

      if (userRole === 'retailer') {
        setError("You don't have permission to create users");
        return;
      }

      setCurrentUserRole(userRole);
      setAvailableRoles(getAvailableRoles(userRole));
      fetchServices();
      fetchStates();
    };

    checkAuthAndPermissions();
  }, [router]);

  useEffect(() => {
    if (selectedState) {
      fetchCities(selectedState);
    }
  }, [selectedState]);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE_URL}onboardservices/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setServices(data);
      } else {
        console.error("Failed to fetch services:", res.status);
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
      } else {
        console.error("Failed to fetch states:", res.status);
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
      } else {
        console.error("Failed to fetch cities:", res.status);
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  const getAvailableRoles = (currentRole) => {
    const roleHierarchy = {
      superadmin: [
        { value: 'admin', label: 'Admin', icon: 'FaUserTie', color: 'red', description: 'Manage users and system operations' },
        { value: 'master', label: 'Master', icon: 'FaUserTie', color: 'blue', description: 'Manage dealers and retailers' },
        { value: 'dealer', label: 'Dealer', icon: 'FaStore', color: 'green', description: 'Manage retailers and transactions' },
        { value: 'retailer', label: 'Retailer', icon: 'FaShoppingCart', color: 'orange', description: 'End user with limited access' }
      ],
      admin: [
        { value: 'master', label: 'Master', icon: 'FaUserTie', color: 'blue', description: 'Manage dealers and retailers' },
        { value: 'dealer', label: 'Dealer', icon: 'FaStore', color: 'green', description: 'Manage retailers and transactions' },
        { value: 'retailer', label: 'Retailer', icon: 'FaShoppingCart', color: 'orange', description: 'End user with limited access' }
      ],
      master: [
        { value: 'dealer', label: 'Dealer', icon: 'FaStore', color: 'green', description: 'Manage retailers and transactions' },
        { value: 'retailer', label: 'Retailer', icon: 'FaShoppingCart', color: 'orange', description: 'End user with limited access' }
      ],
      dealer: [
        { value: 'retailer', label: 'Retailer', icon: 'FaShoppingCart', color: 'orange', description: 'End user with limited access' }
      ]
    };

    return roleHierarchy[currentRole] || [];
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

    if (name === 'commission_plan_id') {
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
        if (!formData.email.trim()) {
          setError("Email is required");
          return false;
        }
        if (!formData.password.trim()) {
          setError("Password is required");
          return false;
        }
        if (!formData.confirmPassword.trim()) {
          setError("Please confirm your password");
          return false;
        }
        if (!formData.role.trim()) {
          setError("Role is required");
          return false;
        }

        if (formData.password.length < 6) {
          setError("Password must be at least 6 characters long");
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          setError("Please enter a valid email address");
          return false;
        }

        if (parentChain.length > 0) {
          for (let level of parentChain) {
            if (!selectedChain[level.role]) {
              setError(`Please select ${level.role}`);
              return false;
            }
          }
        }


        break;

      case 2:
        if (!formData.first_name.trim()) {
          setError("First name is required");
          return false;
        }
        if (!formData.last_name.trim()) {
          setError("Last name is required");
          return false;
        }
        if (!formData.phone_number.trim()) {
          setError("Phone number is required");
          return false;
        }
        if (!formData.date_of_birth.trim()) {
          setError("Date of birth is required");
          return false;
        }
        if (!formData.gender.trim()) {
          setError("Gender is required");
          return false;
        }

        if (formData.phone_number && !/^\d{10}$/.test(formData.phone_number)) {
          setError("Phone number must be 10 digits");
          return false;
        }
        if (formData.alternative_phone && !/^\d{10}$/.test(formData.alternative_phone)) {
          setError("Alternative phone must be 10 digits");
          return false;
        }
        if (formData.aadhar_number && !/^\d{12}$/.test(formData.aadhar_number)) {
          setError("Aadhar number must be 12 digits");
          return false;
        }
        if (formData.pan_number && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan_number)) {
          setError("Please enter a valid PAN number (format: ABCDE1234F)");
          return false;
        }
        break;

      case 3:
        break;

      case 4:
        if (!formData.address.trim()) {
          setError("Address is required");
          return false;
        }
        if (!formData.state.trim()) {
          setError("State is required");
          return false;
        }
        if (!formData.city.trim()) {
          setError("City is required");
          return false;
        }
        if (!formData.pincode.trim()) {
          setError("Pincode is required");
          return false;
        }

        if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
          setError("Pincode must be 6 digits");
          return false;
        }
        break;

      case 5:
        const hasAnyBankField =
          formData.bank_name.trim() ||
          formData.account_number.trim() ||
          formData.ifsc_code.trim() ||
          formData.account_holder_name.trim();

        if (hasAnyBankField) {
          if (!formData.bank_name.trim()) {
            setError("Bank name is required if you're adding bank details");
            return false;
          }
          if (!formData.account_number.trim()) {
            setError("Account number is required if you're adding bank details");
            return false;
          }
          if (!formData.ifsc_code.trim()) {
            setError("IFSC code is required if you're adding bank details");
            return false;
          }
          if (!formData.account_holder_name.trim()) {
            setError("Account holder name is required if you're adding bank details");
            return false;
          }

          if (!/^\d{9,18}$/.test(formData.account_number)) {
            setError("Account number must be 9-18 digits");
            return false;
          }

          if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc_code)) {
            setError("Please enter a valid IFSC code (format: ABCD0123456)");
            return false;
          }
        }
        break;

      case 6:
        break;

      case 7:
        if (!formData.email || !formData.role) {
          setError("Basic information is incomplete");
          return false;
        }

        if (!formData.first_name || !formData.last_name || !formData.phone_number) {
          setError("Personal information is incomplete");
          return false;
        }
        if (!formData.address || !formData.state || !formData.city || !formData.pincode) {
          setError("Address information is incomplete");
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

  const showPopup = (type, title, message) => {
    setPopup({ show: true, type, title, message });
  };

  const handlePopupClose = () => {
    setPopup({ show: false, type: "", message: "", title: "" });

    // Only redirect if it was a success popup
    if (popup.type === "success") {
      router.push("/usersonboarding");
    }
  };

  const handleSubmit = async (e) => {

    let parent_user = null;

    if (formData.role === "admin") {
      parent_user = Number(localStorage.getItem("userId"));
    }

    else if (formData.role === "master") {
      parent_user = selectedChain.admin
        || Number(localStorage.getItem("userId"));
    }

    else if (formData.role === "dealer") {
      parent_user = selectedChain.master || null;
    }

    else if (formData.role === "retailer") {
      parent_user = selectedChain.dealer || null;
    }


    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateStep(1) || !validateStep(2) || !validateStep(4) || !validateStep(7)) {
      setError("Please complete all required fields in Steps 1, 2, and 4");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("accessToken");

      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
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
        service_ids: formData.service_ids,
        parent_user: parent_user
      };

      Object.keys(userData).forEach(key => {
        if (
          userData[key] === "" ||
          userData[key] === null ||
          (typeof userData[key] === "object" && Object.keys(userData[key]).length === 0)
        ) {
          delete userData[key];
        }
      });


      const res = await fetch(`${BASE_URL}users/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
      });

      const data = await res.json();

      if (res.ok) {
        const createdUserId = data.id;

        const hasBankDetails =
          formData.bank_name &&
          formData.account_number &&
          formData.ifsc_code &&
          formData.account_holder_name;

        if (hasBankDetails) {
          try {
            await fetch(`${BASE_URL}user/banks/`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                user: createdUserId,
                bank_name: formData.bank_name,
                account_number: formData.account_number,
                ifsc_code: formData.ifsc_code,
                account_holder_name: formData.account_holder_name,
                is_primary: true
              })
            });
          } catch (bankError) {
            console.error("Auto bank creation failed:", bankError);
          }
        }

        try {
          const customerPayload = {
            mobile: formData.phone_number,
            name: `${formData.first_name} ${formData.last_name}`.trim(),
            skip_verification: true
          };

          if (formData.date_of_birth) customerPayload.dob = formData.date_of_birth;
          if (formData.city) customerPayload.city = formData.city;
          if (formData.state) customerPayload.state = formData.state;
          if (formData.pincode) customerPayload.pincode = formData.pincode;

          const customerResponse = await fetch(
            `${BASE_URL}dmt/customer/create_customer/`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify(customerPayload)
            }
          );

          const customerResult = await customerResponse.json();

          let popupMessage = `User "${formData.username}" created successfully as ${formData.role}!`;

          if (
            customerResult.response_status_id === 0 ||
            customerResult.response_status_id === 1 ||
            customerResult.response_status_id === -1
          ) {
            popupMessage += hasBankDetails
              ? " Bank account & customer profile created automatically."
              : " Customer profile created automatically.";
          } else {
            popupMessage += ` Note: Customer creation failed: ${customerResult.message}`;
          }

          showPopup("success", "Success", popupMessage);

        } catch (customerError) {
          console.error("Customer creation error:", customerError);
          showPopup(
            "success",
            "Success",
            `User "${formData.username}" created successfully as ${formData.role}!`
          );
        }

        setFormData({
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
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
          commission_plan_id: "",
          commission_plan_name: "",
          service_ids: []
        });


        if (formData.commission_plan_id) {
          try {
            await fetch(`${BASE_URL}user-commission-plans/assign_plan/`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                user_ids: [createdUserId],
                commission_plan_id: parseInt(formData.commission_plan_id),
              }),
            });

          } catch (commissionError) {
            console.error("Commission assignment failed:", commissionError);
            showPopup(
              "error",
              "Commission Not Assigned",
              "User created successfully, but commission plan assignment failed."
            );
          }
        }

      } else {
        let errorMessage = "Failed to create user. Please try again.";

        if (data && typeof data === "object") {
          const firstKey = Object.keys(data)[0];

          if (Array.isArray(data[firstKey])) {
            errorMessage = data[firstKey][0];
          } else if (typeof data[firstKey] === "string") {
            errorMessage = data[firstKey];
          }
        }

        showPopup("error", "Failed to Create User", errorMessage);
        setCurrentStep(1);
      }
    } catch (error) {
      console.error("Create user error:", error);
      showPopup("error", "Error", "Failed to create user. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  const renderStepContent = () => {
    const commonProps = {
      formData,
      handleInputChange,
      availableRoles: availableRoles,
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
        return <Step6AssignCommission {...commonProps} />;
      case 7:
        return <Step7Confirmation {...commonProps} />;
      default:
        return <Step1BasicInfo {...commonProps} />;
    }
  };

  if (currentUserRole === 'retailer') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to create users.</p>
          <button
            onClick={() => router.push("/usersonboarding")}
            className="bg-[#112772] text-white px-6 py-2 rounded-lg hover:bg-blue-900 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      {popup.show && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${popup.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-xl shadow-lg max-w-md w-full`}
          >
            <div className="p-6">
              <div className="flex items-start">
                <div className={`flex-shrink-0 ${popup.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {popup.type === 'success' ? (
                    <FaCheck className="w-6 h-6" />
                  ) : (
                    <FaExclamationTriangle className="w-6 h-6" />
                  )}
                </div>
                <div className="ml-4">
                  <h3 className={`text-lg font-semibold ${popup.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                    {popup.title}
                  </h3>
                  <p className={`mt-2 ${popup.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                    {popup.message}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handlePopupClose}
                  className={`px-4 py-2 rounded-lg font-medium ${popup.type === 'success'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'}`}
                >
                  OK
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div className="">
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
                  <FaUserPlus className="w-8 h-8 mr-3 text-[#112772]" />
                  Add New User
                </h1>
                <p className="text-gray-600 mt-2">
                  Complete the {STEPS.length}-step onboarding process to create a new user account
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
              exit={{ opacity: 0, x: -20 }}
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
                      Step {currentStep} of {STEPS.length} - {STEPS[currentStep - 1]?.description}
                    </p>
                    {[1, 2, 4].includes(currentStep) && (
                      <p className="text-red-500 text-sm mt-1">
                        * All fields in this step are required
                      </p>
                    )}
                    {[6].includes(currentStep) && (
                      <p className="text-blue-500 text-sm mt-1">
                        * Optional step - You can skip this
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Error and Success Messages (for form validation) */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
                  <FaExclamationTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
                  <FaCheck className="w-5 h-5 mr-3 flex-shrink-0" />
                  {success}
                </div>
              )}

              {/* Form Content */}
              <form onSubmit={currentStep === STEPS.length ? handleSubmit : (e) => e.preventDefault()}>
                <div className="mb-8">
                  {renderStepContent()}
                  {currentStep === 1 && parentChain.length > 0 && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="text-sm font-semibold text-blue-800 mb-3">
                        Select Parent Hierarchy
                      </h4>

                      <div
                        className={`grid gap-4 ${parentChain.length === 1
                          ? "grid-cols-1"
                          : "grid-cols-1 md:grid-cols-2"
                          }`}
                      >
                        {parentChain.map(level => (
                          <div key={level.role}>
                            <label className="block text-black text-sm font-medium capitalize mb-1">
                              Select {level.role}
                            </label>

                            <select
                              className="w-full text-black border rounded px-3 py-2"
                              value={selectedChain[level.role] || ""}
                              onChange={(e) => {
                                const value = Number(e.target.value);
                                const token = localStorage.getItem("accessToken");

                                setSelectedChain(prev => {
                                  const updated = { ...prev, [level.role]: value };

                                  // reset lower levels
                                  if (level.role === "master") {
                                    delete updated.dealer;
                                  }

                                  return updated;
                                });

                                // 🔥 IMPORTANT: retailer → master select → fetch dealers
                                if (formData.role === "retailer" && level.role === "master") {
                                  fetch(
                                    `${BASE_URL}user-hierarchy/parent_chain/?role=retailer&master_id=${value}`,
                                    {
                                      headers: { Authorization: `Bearer ${token}` }
                                    }
                                  )
                                    .then(res => res.json())
                                    .then(data => {
                                      setParentChain(prev => [
                                        prev[0],   // master level
                                        {
                                          role: "dealer",
                                          users: data.users
                                        }
                                      ]);
                                    });
                                }
                              }}

                            >
                              <option value="">Select {level.role}</option>
                              {level.users.map(u => (
                                <option key={u.id} value={u.id}>
                                  {u.username}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>

                    </div>
                  )}

                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className={`flex items-center px-6 py-2 rounded-lg font-medium transition-colors ${currentStep === 1
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
                      className="flex items-center px-6 py-2 bg-[#112772] text-white rounded-lg font-medium hover:bg-blue-900 transition-colors"
                    >
                      {currentStep === STEPS.length - 1 ? "Review & Create" : "Next"}
                      <FaChevronRight className="w-4 h-4 ml-2" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className={`flex items-center px-6 py-2 rounded-lg font-medium transition-colors ${loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 text-white"
                        }`}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating User...
                        </>
                      ) : (
                        <>
                          <FaCheck className="w-4 h-4 mr-2" />
                          Create User
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