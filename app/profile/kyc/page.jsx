"use client";
import { useState, useEffect } from "react";
import {
  FaIdCard, FaUser, FaCheckCircle, FaTimesCircle,
  FaSpinner, FaUpload, FaArrowLeft, FaFilePdf, FaImage,
  FaExternalLinkAlt, FaEye, FaTrash, FaDownload, FaCloudUploadAlt,
  FaExclamationTriangle, FaInfoCircle
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { getWithAuth, patchWithAuth, postWithAuth } from "@/app/lib/api";

export default function KYCPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ show: false, type: "", message: "" });
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getWithAuth("users/kyc/");
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      showModal("error", "Failed to load KYC information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const showModal = (type, message) => {
    setModal({ show: true, type, message });
  };

  const closeModal = () => {
    setModal({ show: false, type: "", message: "" });
  };

  const goBack = () => {
    router.back();
  };

  if (loading) {
    return <KYCLoader />;
  }

  if (!profile) {
    return <KYCErrorState onRetry={fetchProfile} />;
  }

  return (
    <div>
      <div>
        <MessageModal
          isOpen={modal.show}
          type={modal.type}
          message={modal.message}
          onClose={closeModal}
        />

        <div className="flex items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              KYC Verification
            </h1>
            <p className="text-gray-600 text-lg">
              Complete your Know Your Customer verification
            </p>
          </div>
        </div>

        {/* Progress Section */}
        <KYCProgressSection profile={profile} />

        {/* Main Content - Only Document Upload */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <KYCDocumentUpload
            profile={profile}
            onUpdate={fetchProfile}
            showModal={showModal}
          />
        </div>
      </div>
    </div>
  );
}

// Message Modal Component
const MessageModal = ({ isOpen, type, message, onClose }) => {
  if (!isOpen) return null;

  const getModalConfig = (type) => {
    switch (type) {
      case "success":
        return {
          icon: <FaCheckCircle className="text-4xl text-green-500" />,
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          textColor: "text-green-800",
          buttonColor: "bg-green-500 hover:bg-green-600"
        };
      case "error":
        return {
          icon: <FaTimesCircle className="text-4xl text-red-500" />,
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-800",
          buttonColor: "bg-red-500 hover:bg-red-600"
        };
      case "warning":
        return {
          icon: <FaExclamationTriangle className="text-4xl text-yellow-500" />,
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          textColor: "text-yellow-800",
          buttonColor: "bg-yellow-500 hover:bg-yellow-600"
        };
      default:
        return {
          icon: <FaInfoCircle className="text-4xl text-blue-500" />,
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          textColor: "text-blue-800",
          buttonColor: "bg-blue-500 hover:bg-blue-600"
        };
    }
  };

  const config = getModalConfig(type);

  return (
    <div className="fixed inset-0 
  bg-white/30 
  backdrop-blur-md 
  flex items-center justify-center 
  z-50 p-4">

      <div className={`rounded-2xl shadow-xl max-w-md w-full ${config.bgColor} border ${config.borderColor} transform transition-all duration-300 scale-100 opacity-100`}>
        <div className="p-6 text-center">
          <div className="flex justify-center mb-4">
            {config.icon}
          </div>
          <h3 className={`text-xl font-semibold mb-2 ${config.textColor}`}>
            {type === "success" && "Success!"}
            {type === "error" && "Error!"}
            {type === "warning" && "Warning!"}
            {type === "info" && "Information"}
          </h3>
          <p className={`mb-6 ${config.textColor}`}>
            {message}
          </p>
          <button
            onClick={onClose}
            className={`w-full text-white px-6 py-3 rounded-lg transition-colors ${config.buttonColor} shadow-md`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

// KYC Progress Section
const KYCProgressSection = ({ profile }) => {
  const kycProgress = calculateKYCProgress(profile);

  const getStatusColor = (progress) => {
    if (progress >= 80) return "text-green-600 bg-green-100";
    if (progress >= 50) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getStatusIcon = (progress) => {
    if (progress >= 80) return <FaCheckCircle className="text-green-500" />;
    if (progress >= 50) return <FaTimesCircle className="text-yellow-500" />;
    return <FaTimesCircle className="text-red-500" />;
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 mb-6 border border-blue-100">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 text-lg mb-2">Document Upload Progress</h3>
          <p className="text-gray-600 text-sm">
            {kycProgress >= 80
              ? "All documents uploaded successfully! 🎉"
              : "Upload the required documents to complete your KYC verification"
            }
          </p>
        </div>

        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">{kycProgress}%</div>
          <div className="text-sm text-gray-600">Complete</div>
        </div>

        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getStatusColor(kycProgress)}`}>
          {getStatusIcon(kycProgress)}
          <span className="font-medium">
            {kycProgress >= 80 ? "Verified" : kycProgress >= 50 ? "Pending" : "Incomplete"}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div
            className="bg-green-500 h-3 rounded-full transition-all duration-1000"
            style={{ width: `${kycProgress}%` }}
          ></div>
        </div>

        <div className="flex justify-between text-xs text-gray-500">
          <span>PAN Card</span>
          <span>Aadhar Card</span>
          <span>Photo</span>
          <span>Complete</span>
        </div>
      </div>
    </div>
  );
};

// KYC Document Upload Component
const KYCDocumentUpload = ({ profile, onUpdate, showModal }) => {
  const [uploading, setUploading] = useState(null);

  // Document configuration
  const documents = [
    {
      key: "pan_card",
      label: "PAN Card",
      required: true,
      description: "Upload clear image of your PAN card",
      accept: "image/*,.pdf"
    },
    {
      key: "aadhar_card",
      label: "Aadhar Card",
      required: true,
      description: "Front and back images of Aadhar card",
      accept: "image/*,.pdf"
    },
    {
      key: "passport_photo",
      label: "Passport Photo",
      required: true,
      description: "Recent passport size photograph",
      accept: "image/*"
    },
    {
      key: "shop_photo",
      label: "Shop Photo",
      required: false,
      description: "Photo of your business premises",
      accept: "image/*"
    },
    {
      key: "store_photo",
      label: "Store Photo",
      required: false,
      description: "Additional store/business photos",
      accept: "image/*"
    },
    {
      key: "other_documents",
      label: "Other Documents",
      required: false,
      description: "Any other relevant documents",
      accept: "image/*,.pdf,.doc,.docx"
    },
  ];

  const handleFileUpload = async (documentType, file) => {
    if (!file) return;

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      showModal("error", "Please select a valid file (JPEG, PNG, GIF, PDF)");
      return;
    }

    if (file.size > maxSize) {
      showModal("error", "File size should be less than 5MB");
      return;
    }

    try {
      setUploading(documentType);

      console.log(`🔄 Uploading ${documentType}...`);

      // Step 1: Upload file to upload-images endpoint
      const uploadFormData = new FormData();
      uploadFormData.append("image", file);

      const uploadResponse = await postWithAuth("upload-images/", uploadFormData);
      console.log("🟢 Upload response:", uploadResponse);

      const fileUrl = uploadResponse.image || uploadResponse.image_url;

      if (!fileUrl) {
        console.error("❌ No file URL in response:", uploadResponse);
        throw new Error("No file URL returned from server");
      }

      console.log("🔄 Step 2: Updating KYC with document URL:", fileUrl);

      // Step 2: Update KYC using PATCH to kyc endpoint
      const updateData = {
        [documentType]: fileUrl
      };

      const updateResponse = await patchWithAuth("users/kyc/", updateData);
      console.log("🟢 KYC update response:", updateResponse);

      showModal("success", `${documents.find(doc => doc.key === documentType)?.label} uploaded successfully!`);

      // Refresh profile data
      setTimeout(() => {
        onUpdate();
      }, 1000);

    } catch (error) {
      console.error("🔴 Document upload error:", error);
      showModal("error", `Failed to upload ${documents.find(doc => doc.key === documentType)?.label}. Please try again.`);
    } finally {
      setUploading(null);
    }
  };

  const handleDeleteDocument = async (documentType) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const updateData = {
        [documentType]: ""
      };

      await patchWithAuth("users/kyc/", updateData);
      showModal("success", `${documents.find(doc => doc.key === documentType)?.label} deleted successfully!`);

      setTimeout(() => {
        onUpdate();
      }, 1000);
    } catch (error) {
      console.error("🔴 Document delete error:", error);
      showModal("error", "Failed to delete document. Please try again.");
    }
  };

  const handleDownloadDocument = (documentUrl, documentName) => {
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = documentName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate upload progress
  const uploadedCount = documents.filter(doc => profile[doc.key] && profile[doc.key].trim() !== '').length;
  const totalRequired = documents.filter(doc => doc.required).length;

  return (
    <div>


      {/* Document Cards Grid */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaCloudUploadAlt className="text-blue-500" />
          Upload Your Documents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <CombinedDocumentCard
              key={doc.key}
              document={doc}
              profile={profile}
              uploading={uploading === doc.key}
              onUpload={handleFileUpload}
              onDelete={handleDeleteDocument}
              onDownload={handleDownloadDocument}
            />
          ))}
        </div>
      </div>

      {/* Upload Guidelines */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
        <h4 className="font-semibold text-blue-800 mb-2">Upload Guidelines</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Supported formats: JPG, PNG, PDF (Max 5MB)</li>
          <li>• Ensure documents are clear and readable</li>
          <li>• PAN and Aadhar should be valid and not expired</li>
          <li>• Passport photo should be recent and against white background</li>
          <li>• Business photos should clearly show your premises</li>
        </ul>
      </div>
    </div>
  );
};

// Combined Document Card Component (Shows upload interface and uploaded document in same card)
const CombinedDocumentCard = ({ document, profile, uploading, onUpload, onDelete, onDownload }) => {
  const hasDocument = profile[document.key] && profile[document.key].trim() !== '';
  const documentUrl = profile[document.key];
  const isImage = documentUrl && documentUrl.toLowerCase().match(/\.(jpeg|jpg|png|gif|webp)$/);
  const isPDF = documentUrl && documentUrl.toLowerCase().endsWith('.pdf');

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && onUpload) {
      onUpload(document.key, file);
    }
    // Reset the input
    event.target.value = '';
  };

  return (
    <div className={`border-2 rounded-xl p-5 transition-all ${hasDocument
      ? "border-green-200 bg-green-50"
      : "border-gray-200 bg-white hover:border-blue-300"
      } shadow-sm hover:shadow-md`}>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${hasDocument ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
            }`}>
            {hasDocument ? <FaCheckCircle /> : <FaCloudUploadAlt />}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{document.label}</h3>
            <p className="text-xs text-gray-500">{document.description}</p>
          </div>
        </div>
        {document.required && (
          <span className="text-xs text-red-500 bg-red-100 px-2 py-1 rounded-full">Required</span>
        )}
      </div>

      {/* Document Preview Section - Only shows when document is uploaded */}
      {hasDocument && (
        <div className="mb-4 p-3 bg-white rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-700">Uploaded Document</span>
            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Uploaded</span>
          </div>

          {/* Document Preview */}
          <div className="mb-3">
            {isImage ? (
              <div className="relative group">
                <img
                  src={documentUrl}
                  alt={document.label}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    e.target.src = "/api/placeholder/200/120?text=Image+Error";
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => window.open(documentUrl, '_blank')}
                    className="bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100 transition-all"
                  >
                    <FaEye className="text-blue-600" />
                  </button>
                </div>
              </div>
            ) : isPDF ? (
              <div className="border border-gray-200 rounded-lg p-4 bg-white text-center">
                <FaFilePdf className="text-red-500 text-3xl mx-auto mb-2" />
                <p className="text-xs text-gray-600">PDF Document</p>
                <p className="text-xs text-gray-500 truncate">{documentUrl.split('/').pop()}</p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-4 bg-white text-center">
                <FaFilePdf className="text-gray-500 text-3xl mx-auto mb-2" />
                <p className="text-xs text-gray-600">Document</p>
                <p className="text-xs text-gray-500 truncate">{documentUrl.split('/').pop()}</p>
              </div>
            )}
          </div>

          {/* Action Buttons for Uploaded Document */}
          <div className="flex gap-2">
            <button
              onClick={() => window.open(documentUrl, '_blank')}
              className="flex-1 flex items-center justify-center gap-1 bg-blue-500 text-white px-2 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
            >
              <FaEye className="text-xs" />
              View
            </button>
            <button
              onClick={() => onDownload(documentUrl, `${document.label}.${isPDF ? 'pdf' : 'jpg'}`)}
              className="flex-1 flex items-center justify-center gap-1 bg-green-500 text-white px-2 py-2 rounded text-sm hover:bg-green-600 transition-colors"
            >
              <FaDownload className="text-xs" />
              Download
            </button>
            <button
              onClick={() => onDelete(document.key)}
              className="flex items-center justify-center gap-1 bg-red-500 text-white px-2 py-2 rounded text-sm hover:bg-red-600 transition-colors"
            >
              <FaTrash className="text-xs" />
            </button>
          </div>
        </div>
      )}

      {/* Upload Section - Always visible but context changes based on upload status */}
      <div className={`${hasDocument ? 'bg-green-50 p-3 rounded-lg border border-green-100' : ''}`}>
        <label className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg cursor-pointer transition-colors ${uploading
          ? "bg-gray-400 text-white cursor-not-allowed"
          : hasDocument
            ? "bg-blue-500 text-white hover:bg-blue-600"
            : "bg-green-500 text-white hover:bg-green-600"
          } shadow-sm`}>
          {uploading ? <FaSpinner className="animate-spin" /> : <FaUpload />}
          {uploading ? "Uploading..." : hasDocument ? "Replace Document" : "Upload Document"}
          <input
            type="file"
            accept={document.accept}
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
        </label>

        {!hasDocument && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            Click to upload {document.label.toLowerCase()}
          </p>
        )}

        {hasDocument && (
          <p className="text-xs text-green-600 mt-2 text-center">
            Document uploaded successfully
          </p>
        )}
      </div>
    </div>
  );
};

// Loading Component
const KYCLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-gray-600 text-lg">Loading KYC information...</p>
    </div>
  </div>
);

// Error State Component
const KYCErrorState = ({ onRetry }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center max-w-md">
      <div className="text-red-500 text-6xl mb-4">⚠️</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Failed to Load KYC</h2>
      <p className="text-gray-600 mb-6">We couldn't load your KYC information. Please check your connection and try again.</p>
      <button
        onClick={onRetry}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors shadow-md"
      >
        Try Again
      </button>
    </div>
  </div>
);

// Utility Function to Calculate KYC Progress
const calculateKYCProgress = (profile) => {
  // Only check document uploads for progress
  const documentFields = ['pan_card', 'aadhar_card', 'passport_photo'];

  const completedFields = documentFields.filter(field =>
    profile[field] && String(profile[field]).trim()
  ).length;

  return Math.round((completedFields / documentFields.length) * 100);
};