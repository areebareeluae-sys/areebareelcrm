'use client';

import { useEffect, useState } from 'react';

export default function NetworkGuard() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    function handleOffline() {
      setIsOffline(true);
    }

    function handleOnline() {
      setIsOffline(false);
    }

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    // Initial check
    if (!navigator.onLine) {
      setIsOffline(true);
    }

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl text-center space-y-4">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
          !
        </div>
        <h3 className="text-xl font-bold text-gray-900">Internet Connection Lost</h3>
        <p className="text-sm text-gray-500">
          Your internet connection has been lost. Please check your network and refresh the page to continue.
        </p>
        <button
          type="button"
          onClick={() => {
            window.location.reload();
          }}
          className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}