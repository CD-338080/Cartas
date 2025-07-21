import React, { useEffect } from 'react';

interface SendMessageProps {
  title: string;
  message: string;
  onClose: () => void;
}

const SendMessage: React.FC<SendMessageProps> = ({ title, message, onClose }) => {
  useEffect(() => {
    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl p-4 max-w-xs w-full mx-4 shadow-lg transform transition-all animate-popup">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold text-[#2a9d8f]">{title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-gray-700">{message}</p>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#2a9d8f] text-white rounded-lg hover:bg-[#3eb489] transition-colors"
          >
            OK
          </button>
        </div>
      </div>
      <style jsx global>{`
        @keyframes popup {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-popup {
          animation: popup 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default SendMessage; 