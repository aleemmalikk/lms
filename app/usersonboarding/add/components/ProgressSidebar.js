import { motion } from "framer-motion";
import { FaCheck } from "react-icons/fa";

export default function ProgressSidebar({ steps, currentStep }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Onboarding Progress</h3>
      
      <div className="space-y-4">
        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          
          return (
            <div key={step.id} className="flex items-center space-x-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                isCompleted 
                  ? 'bg-green-500 text-white' 
                  : isCurrent 
                    ? 'bg-[#112772] text-white' 
                    : 'bg-gray-200 text-gray-500'
              }`}>
                {isCompleted ? (
                  <FaCheck className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${
                  isCurrent ? 'text-[#112772]' : 'text-gray-900'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="mt-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{Math.round((currentStep / steps.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-[#112772] h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / steps.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </motion.div>
  );
}