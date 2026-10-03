'use client';

import React, { useState } from 'react';

interface PropertyReferralProps {
  property: {
    refname?: string;
    refnumber?: string;
    refemail?: string;
    refaddress?: string;
  };
}

export default function PropertyReferralModal({ property }: PropertyReferralProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!property.refname && !property.refnumber) {
    return null;
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation(); // 👈 Parent Link par click event janay se rokta hai
          setIsOpen(true);
        }}
        className="text-xs bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1 z-10 relative"
      >
        👥 View Referral
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation(); // 👈 Background click par page open na ho
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Referral Details</h3>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-left">
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Referral Name</label>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{property.refname || 'N/A'}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Phone Number</label>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{property.refnumber || 'N/A'}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Email Address</label>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{property.refemail || 'N/A'}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Address</label>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{property.refaddress || 'N/A'}</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="bg-gray-900 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-black transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}