'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function AgreementContent() {
  const searchParams = useSearchParams();

  // State to prevent hydration mismatch for random values and dates
  const [contractNo, setContractNo] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setContractNo(Math.floor(100000 + Math.random() * 900000).toString());
    setCurrentDate(
      new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    );
  }, []);

  const dealerName = searchParams.get('name') || '____________________';
  const companyName = searchParams.get('company') || '____________________';
  const cnicNumber = searchParams.get('cnic') || '____________________';
  const phone = searchParams.get('phone') || '____________________';
  const address = searchParams.get('address') || '____________________';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-10 font-serif">
      {/* Top Action Bar (Print / Back) - Screen Only */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <button
          onClick={() => window.close()}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl text-xs font-bold font-sans transition shadow"
        >
          &larr; Close Window
        </button>
        <button
          onClick={handlePrint}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold font-sans transition shadow-lg flex items-center gap-2"
        >
          🖨️ Print / Save as PDF
        </button>
      </div>

      {/* Printable Agreement Document Container */}
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 shadow-2xl rounded-2xl border border-gray-300 print:shadow-none print:border-none print:p-0">
        
        {/* Header */}
        <div className="text-center border-b-2 border-indigo-900 pb-6 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-wider text-indigo-950">
            Real Estate Dealer Partnership Agreement
          </h1>
          <p className="text-xs text-gray-500 mt-1 uppercase font-sans tracking-widest">
            Official Commission & Service Level Legal Contract
          </p>
        </div>

        {/* Date & Reference */}
        <div className="flex justify-between text-xs text-gray-600 mb-6 font-sans border-b pb-3">
          <div>
            <strong>Date of Agreement:</strong> {currentDate || 'Loading...'}
          </div>
          <div>
            <strong>Contract Ref:</strong> DLR-AGR-{contractNo || '------'}
          </div>
        </div>

        {/* Parties Intro */}
        <div className="space-y-4 text-sm text-gray-800 leading-relaxed mb-6 font-sans">
          <p>
            This <strong>Partnership & Service Level Agreement</strong> ("Agreement") is made and executed on <strong>{currentDate || '...'}</strong>, by and between:
          </p>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4 my-2 text-xs">
            <div className="space-y-1">
              <p className="font-bold text-indigo-900 uppercase">Party A (The Platform / Company):</p>
              <p className="font-semibold text-gray-900">ChironProperties Real Estate Network Pvt Ltd</p>
              <p className="text-gray-600">Central Portal Management Office</p>
            </div>
            <div className="space-y-1 border-t md:border-t-0 md:border-l border-gray-300 pt-2 md:pt-0 md:pl-4">
              <p className="font-bold text-indigo-900 uppercase">Party B (The Authorized Dealer):</p>
              <p><strong>Dealer Name:</strong> <span className="text-indigo-950 font-bold">{dealerName}</span></p>
              <p><strong>Agency Name:</strong> {companyName}</p>
              <p><strong>CNIC No:</strong> {cnicNumber}</p>
              <p><strong>Contact No:</strong> {phone}</p>
              <p><strong>Address:</strong> {address}</p>
            </div>
          </div>
        </div>

        {/* Terms & Conditions Body */}
        <div className="space-y-5 text-xs text-gray-800 leading-relaxed">
          <h3 className="font-bold text-sm text-indigo-950 border-b pb-1 font-sans">
            Operational Terms & Legal Clauses
          </h3>

          <ol className="list-decimal pl-5 space-y-3">
            <li>
              <strong>0.5% Sales Commission Structure:</strong> On every successful property transaction (Sale/Purchase) facilitated through the platform, Party B agrees to a standard total commission capped at 0.5% of the total property sale value.
            </li>
            <li>
              <strong>35% Rental Deal Commission:</strong> For all tenancy and rental lease agreements executed through the platform, Party B agrees to a total commission of 35% of one month’s total rent.
            </li>
            <li>
              <strong>50 / 50 Net Profit Share:</strong> The total net revenue/commission earned from any verified deal shall be split equally 50% / 50% between Party A (Company) and Party B (Dealer), after deducting pre-approved platform marketing expenses.
            </li>
            <li>
              <strong>24-Hour Mandatory Inventory Verification:</strong> Party B agrees to log in to the portal and verify property availability every 24 hours. Inventory not re-confirmed within 24 hours will automatically be hidden from public listing.
            </li>
            <li>
              <strong>Non-Bypass & Lead Protection Clause:</strong> Party B strictly agrees not to bypass or circumvent Party A by dealing directly with introduced buyers/sellers off-platform. Any circumvention will result in immediate termination and financial recovery.
            </li>
            <li>
              <strong>Approved Marketing Expense Deductions:</strong> Any social media promotion, physical banners, or targeted digital campaigns must receive prior written/digital consent from Party A before expense deduction from final deal payouts.
            </li>
          </ol>
        </div>

        {/* Signatures Section */}
        <div className="mt-12 pt-8 border-t-2 border-gray-300 grid grid-cols-2 gap-8 font-sans">
          <div className="space-y-12">
            <div className="border-b border-gray-400 pb-1">
              <p className="text-xs text-gray-500 font-bold uppercase">Authorized Representative (ChironProperties)</p>
            </div>
            <div className="text-xs space-y-1 text-gray-700">
              <p><strong>Signature:</strong> ______________________</p>
              <p><strong>Stamp:</strong></p>
            </div>
          </div>

          <div className="space-y-12">
            <div className="border-b border-gray-400 pb-1">
              <p className="text-xs text-gray-500 font-bold uppercase">Authorized Dealer Signature (Party B)</p>
            </div>
            <div className="text-xs space-y-1 text-gray-700">
              <p><strong>Name:</strong> {dealerName}</p>
              <p><strong>Signature:</strong> ______________________</p>
              <p><strong>Thumb Impression:</strong></p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center text-[10px] text-gray-400 border-t pt-4 font-sans">
          ChironProperties Real Estate Dealer Network • Confidential Partnership Legal Agreement Document
        </div>
      </div>
    </div>
  );
}

export default function AgreementPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading printable contract...</div>}>
      <AgreementContent />
    </Suspense>
  );
}