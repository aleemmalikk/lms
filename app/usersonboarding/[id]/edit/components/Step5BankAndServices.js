import { useState, useEffect } from "react";
import { BASE_URL } from "@/app/lib/api";

export default function Step5BankAndServices({
  formData,
  handleInputChange,
  services
}) {
  const [bankQuery, setBankQuery] = useState("");
  const [bankList, setBankList] = useState([]);
  const [bankLoading, setBankLoading] = useState(false);
  const [showBankDropdown, setShowBankDropdown] = useState(false);


  const searchBanks = async (query) => {
    if (!query || query.length < 2) {
      setBankList([]);
      setShowBankDropdown(false);
      return;
    }

    setBankLoading(true);

    try {
      const res = await fetch(
        `${BASE_URL}dmt/banks/?search=${encodeURIComponent(query)}`
      );

      if (!res.ok) throw new Error("Failed to fetch banks");

      const data = await res.json();

      setBankList(Array.isArray(data) ? data : []);
      setShowBankDropdown(true);
    } catch (error) {
      console.error("Bank search error:", error);
      setBankList([]);
      setShowBankDropdown(false);
    } finally {
      setBankLoading(false);
    }
  };


  const allServiceIds = services.map(s => s.id);

  const isAllSelected =
    services.length > 0 &&
    formData.service_ids.length === allServiceIds.length;

  const handleSelectAllServices = (e) => {
    handleInputChange({
      target: {
        name: "service_ids",
        value: e.target.checked ? allServiceIds : [],
        type: "select-all"
      }
    });
  };



  const selectBank = (bank) => {
    handleInputChange({
      target: {
        name: 'bank_name',
        value: bank.bank_name
      }
    });
    handleInputChange({
      target: {
        name: 'account_number',
        value: bank.account_number
      }
    });
    handleInputChange({
      target: {
        name: 'ifsc_code',
        value: bank.ifsc_code
      }
    });
    handleInputChange({
      target: {
        name: 'account_holder_name',
        value: bank.account_holder_name
      }
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Number
              </label>
              <input
                type="text"
                name="account_number"
                value={formData.account_number}
                onChange={handleInputChange}
                className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg
                 focus:ring-2 focus:ring-[#112772] focus:border-transparent"
                placeholder="Enter account number"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank Name
              </label>

              <input
                type="text"
                name="bank_name"
                value={formData.bank_name}
                placeholder="Type bank name"
                onChange={(e) => {
                  const value = e.target.value;
                  handleInputChange(e);
                  setBankQuery(value);
                  searchBanks(value);
                }}
                onFocus={() => {
                  if (bankList.length > 0) setShowBankDropdown(true);
                }}
                className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg
                 focus:ring-2 focus:ring-[#112772] focus:border-transparent"
              />

              {showBankDropdown && (
                <div className="absolute z-50 w-full bg-white border rounded-lg mt-1 shadow-lg max-h-56 overflow-y-auto">
                  {bankList.length > 0 ? (
                    bankList.map((bank) => (
                      <div
                        key={bank.id || bank.bank_name}
                        onClick={() => {
                          handleInputChange({
                            target: {
                              name: "bank_name",
                              value: bank.bank_name
                            }
                          });

                          if (bank.static_ifsc) {
                            handleInputChange({
                              target: {
                                name: "ifsc_code",
                                value: bank.static_ifsc
                              }
                            });
                          }
                          setShowBankDropdown(false);
                        }}

                        className="px-4 py-2 cursor-pointer hover:bg-blue-50"
                      >
                        {bank.bank_name}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      No bank found. You can type manually.
                    </div>
                  )}
                </div>
              )}

              {bankLoading && (
                <div className="absolute right-3 top-9">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IFSC Code
              </label>
              <input
                type="text"
                name="ifsc_code"
                value={formData.ifsc_code}
                onChange={(e) => {
                  handleInputChange({
                    target: {
                      name: "ifsc_code",
                      value: e.target.value.toUpperCase()
                    }
                  });
                }}
                className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg
               focus:ring-2 focus:ring-[#112772] focus:border-transparent"
                placeholder="Enter IFSC code"
                maxLength={11}
                style={{ textTransform: "uppercase" }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Holder Name
              </label>
              <input
                type="text"
                name="account_holder_name"
                value={formData.account_holder_name}
                onChange={handleInputChange}
                className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#112772] focus:border-transparent transition-all"
                placeholder="Enter account holder name"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Access</h3>

        <div className="bg-gray-50 rounded-lg p-6">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Select Services for User
          </label>

          <div className="flex items-center justify-between mb-4">
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleSelectAllServices}
                className="w-4 h-4"
              />
              Select All Services
            </label>

            <span className="text-xs text-gray-500">
              {formData.service_ids.length} / {services.length} selected
            </span>
          </div>


          {services.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No services available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2">
              {services.map((service) => (
                <div
                  key={service.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${formData.service_ids.includes(service.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                >
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="service_ids"
                      value={service.id}
                      checked={formData.service_ids.includes(service.id)}
                      onChange={handleInputChange}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${formData.service_ids.includes(service.id) ? 'text-blue-700' : 'text-gray-900'
                          }`}>
                          {service.name}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {service.category_name}
                      </p>
                      {service.description && (
                        <p className="text-xs text-gray-500 mt-2">
                          {service.description}
                        </p>
                      )}
                    </div>
                  </label>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 text-sm text-gray-600">
            {formData.service_ids.length} service(s) selected
          </div>
        </div>
      </div>
    </div>
  );
}