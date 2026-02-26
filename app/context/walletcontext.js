"use client";
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getAuthToken, BASE_URL } from '../lib/api';

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [walletBalance, setWalletBalance] = useState("0.00");
  const [aepsBalance, setAepsBalance] = useState("0.00");
  const [loading, setLoading] = useState(false);

  const fetchWalletBalance = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${BASE_URL}wallets/balance/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWalletBalance(data.balance || "0.00");
        localStorage.setItem("wallet_balance", data.balance);
        return data.balance;
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  const fetchAepsBalance = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${BASE_URL}merchants/wallet_balance/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          customer_id_type: "mobile_number",
          customer_id: "9212094999",
          user_code: "38130001",
        }),
      });

      const data = await response.json();
      if (data.status === 0) {
        setAepsBalance(data.data.balance);
        localStorage.setItem("aeps_balance", data.data.balance);
      }
    } catch (error) {
      console.error("AEPS Wallet Fetch Error:", error);
    }
  };

  // Update wallet balance
  const updateWalletBalance = (newBalance) => {
    setWalletBalance(newBalance);
    localStorage.setItem("wallet_balance", newBalance);
  };

  useEffect(() => {
    fetchWalletBalance();
    fetchAepsBalance();
  }, []);

  return (
    <WalletContext.Provider value={{
      walletBalance,
      aepsBalance,
      loading,
      fetchWalletBalance,
      fetchAepsBalance,
      updateWalletBalance
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);