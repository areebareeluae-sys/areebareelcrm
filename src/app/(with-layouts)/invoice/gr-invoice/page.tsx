'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateInvoicePage() {
  const router = useRouter();

  const [properties, setProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Blocking Error State for Already Generated Invoice
  const [existingInvoiceError, setExistingInvoiceError] = useState<{ show: boolean; invoiceId: string } | null>(null);

  // Manual Inputs for Invoice Calculation
  const [commissionInput, setCommissionInput] = useState('');
  const [commissionType, setCommissionType] = useState<'amount' | 'percentage'>('percentage');
  const [govtTaxInput, setGovtTaxInput] = useState('');
  const [discountInput, setDiscountInput] = useState('');
  
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchClosedProperties('');
  }, []);

  const fetchClosedProperties = async (query = '') => {
    try {
      const res = await fetch(`/api/property/invoice?search=${query}`);
      const data = await res.json();
      setProperties(data.properties || []);
    } catch (err) {
      console.error('Error fetching closed properties:', err);
    }
  };

  const getCurrency = (country: string) => {
    const isPak = country?.toLowerCase() === 'pakistan' || country?.toLowerCase() === 'pk';
    return isPak ? 'PKR' : 'AED';
  };

  // Calculations
  const salePrice = Number(selectedProperty?.closedprice || 0);
  const advanceAmount = Number(selectedProperty?.advance || 0);
  const currency = getCurrency(selectedProperty?.country);

  let calculatedCommission = 0;
  if (commissionInput) {
    if (commissionType === 'percentage') {
      calculatedCommission = (salePrice * Number(commissionInput)) / 100;
    } else {
      calculatedCommission = Number(commissionInput);
    }
  }

  const taxAmount = Number(govtTaxInput) || 0;
  const discountAmount = Number(discountInput) || 0;
  
  // Total Gross Amount before advance adjustment
  const grossTotal = salePrice + calculatedCommission + taxAmount - discountAmount;
  // Final Balance Amount after deducting Advance Paid
  const totalAmount = grossTotal - advanceAmount;

  const handleSelectProperty = (property: any) => {
    if (property.existingInvoice) {
      setExistingInvoiceError({
        show: true,
        invoiceId: property.existingInvoice.id,
      });
      return;
    }

    setSelectedProperty(property);
    setIsModalOpen(false);
  };

  const handleGenerateInvoice = async () => {
    if (!selectedProperty) {
      alert('Please select a closed property first!');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/property/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyid: selectedProperty.id,
          companycommission: calculatedCommission,
          govttax: taxAmount.toString(),
          discount: discountAmount.toString(),
          totalammount: totalAmount.toString(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert('Invoice generated successfully!');
        router.push('/invoice/gr-invoice');
      } else {
        if (data.existingInvoiceId) {
          setExistingInvoiceError({ show: true, invoiceId: data.existingInvoiceId });
        } else {
          alert(data.message || 'Failed to generate invoice');
        }
      }
    } catch (err) {
      console.error('Error generating invoice:', err);
      alert('Something went wrong!');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Invoice ID copied to clipboard!');
  };

  // Enhanced filtering supporting ID, Purchaseorderid, Title, City, Country, Buyer & Seller names
  const filteredProperties = properties.filter((p) => {
    let query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    // Remove 'po-' prefix if user typed it
    if (query.startsWith('po-')) {
      query = query.replace('po-', '');
    } else if (query.startsWith('po')) {
      query = query.replace('po', '');
    }

    const title = (p.title || '').toLowerCase();
    const city = (p.city || '').toLowerCase();
    const country = (p.country || '').toLowerCase();
    const propertyId = p.id ? String(p.id).toLowerCase() : '';
    const purchaseOrderId = p.Purchaseorderid ? String(p.Purchaseorderid).toLowerCase() : '';
    const buyerName = (p.buyer?.fullname || '').toLowerCase();
    const sellerName = (p.seller?.fullname || '').toLowerCase();

    return (
      title.includes(query) ||
      city.includes(query) ||
      country.includes(query) ||
      propertyId.includes(query) ||
      purchaseOrderId.includes(query) ||
      buyerName.includes(query) ||
      sellerName.includes(query) ||
      propertyId === query ||
      purchaseOrderId === query
    );
  });

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Generate CRM Invoice</h1>
          <p className="text-sm text-gray-500">Select a closed property to generate transaction invoice with advance adjustment.</p>
        </div>
        <Link href="/invoice/list" className="text-sm text-blue-600 hover:underline font-medium">
          ← Back to Invoices List
        </Link>
      </div>

      {/* STEP 1: SELECT CLOSED PROPERTY */}
      <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-base font-bold text-gray-800">1. Closed Property Selection</h2>
          {selectedProperty && (
            <button onClick={() => setSelectedProperty(null)} className="text-xs text-red-600 hover:underline font-semibold">
              Change Property
            </button>
          )}
        </div>

        {selectedProperty ? (
          <div className="space-y-4 text-sm">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-xs text-gray-500 block">Property Title & IDs</span>
                <strong className="text-blue-900">
                  {selectedProperty.title} 
                  {selectedProperty.Purchaseorderid && <span className="block text-xs font-mono text-indigo-700">PO ID: {selectedProperty.Purchaseorderid}</span>}
                </strong>
              </div>
              <div><span className="text-xs text-gray-500 block">Location</span><strong className="text-gray-800">{selectedProperty.city}, {selectedProperty.country}</strong></div>
              <div><span className="text-xs text-gray-500 block">Closed Date</span><strong className="text-purple-700">{selectedProperty.closeddate || 'N/A'}</strong></div>
            </div>

            <div className="bg-green-50 border border-green-200 p-4 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><span className="text-xs text-gray-500 block">Final Closed Price</span><strong className="text-green-700 text-base">{salePrice.toLocaleString()} {currency}</strong></div>
              <div><span className="text-xs text-gray-500 block">Advance Paid</span><strong className="text-blue-700 text-base">{advanceAmount.toLocaleString()} {currency}</strong></div>
            </div>

            {/* Buyer & Seller Info Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border">
                <span className="text-xs font-bold text-blue-600 block mb-1 uppercase">Buyer Details</span>
                {selectedProperty.buyer ? (
                  <>
                    <p><strong>Name:</strong> {selectedProperty.buyer.fullname}</p>
                    <p><strong>Phone:</strong> {selectedProperty.buyer.phone}</p>
                    <p><strong>Email:</strong> {selectedProperty.buyer.email}</p>
                  </>
                ) : <p className="text-xs text-gray-400">No buyer linked</p>}
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border">
                <span className="text-xs font-bold text-purple-600 block mb-1 uppercase">Seller Details</span>
                {selectedProperty.seller ? (
                  <>
                    <p><strong>Name:</strong> {selectedProperty.seller.fullname}</p>
                    <p><strong>Phone:</strong> {selectedProperty.seller.phone}</p>
                    <p><strong>Email:</strong> {selectedProperty.seller.email}</p>
                  </>
                ) : <p className="text-xs text-gray-400">No seller linked</p>}
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-blue-600 text-white font-medium text-sm py-3 rounded-xl hover:bg-blue-700 transition"
          >
            Select Closed Property
          </button>
        )}
      </div>

      {/* STEP 2: MANUAL CALCULATIONS & CHARGES */}
      {selectedProperty && (
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
          <h2 className="text-base font-bold text-gray-800 border-b pb-3">2. Commission, Tax & Totals ({currency})</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Commission */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-gray-600 uppercase">Company Commission</label>
                <button
                  type="button"
                  onClick={() => setCommissionType(commissionType === 'percentage' ? 'amount' : 'percentage')}
                  className="text-[10px] bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded font-bold text-blue-600"
                >
                  Switch to {commissionType === 'percentage' ? 'Fixed Amount' : 'Percentage (%)'}
                </button>
              </div>
              <div className="flex items-center border rounded-xl overflow-hidden">
                <input
                  type="number"
                  placeholder={commissionType === 'percentage' ? 'Enter % e.g. 5' : 'Enter amount'}
                  value={commissionInput}
                  onChange={(e) => setCommissionInput(e.target.value)}
                  className="w-full px-4 py-3 text-sm outline-none"
                />
                <span className="bg-gray-50 px-3 text-xs font-bold text-gray-500 border-l py-3">
                  {commissionType === 'percentage' ? '%' : currency}
                </span>
              </div>
              {commissionType === 'percentage' && commissionInput && (
                <p className="text-[11px] text-green-600 font-semibold">= {calculatedCommission.toLocaleString()} {currency}</p>
              )}
            </div>

            {/* Govt Tax */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-600 uppercase">Govt Tax / Charges</label>
              <input
                type="number"
                placeholder="Enter tax amount..."
                value={govtTaxInput}
                onChange={(e) => setGovtTaxInput(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none"
              />
            </div>

            {/* Discount */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-600 uppercase">Discount / Deduction</label>
              <input
                type="number"
                placeholder="Enter discount..."
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none"
              />
            </div>
          </div>

          {/* Final Summary Box */}
          <div className="bg-gray-50 border p-5 rounded-xl space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Base Sale Price:</span>
              <strong className="text-gray-900">{salePrice.toLocaleString()} {currency}</strong>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Company Commission:</span>
              <strong className="text-blue-600">+ {calculatedCommission.toLocaleString()} {currency}</strong>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Govt Tax:</span>
              <strong className="text-orange-600">+ {taxAmount.toLocaleString()} {currency}</strong>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Discount:</span>
                <strong className="text-red-600">- {discountAmount.toLocaleString()} {currency}</strong>
              </div>
            )}
            <div className="flex justify-between text-gray-600 border-t pt-2">
              <span>Gross Total Amount:</span>
              <strong className="text-gray-900">{grossTotal.toLocaleString()} {currency}</strong>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Advance Paid (Deducted):</span>
              <strong className="text-blue-700">- {advanceAmount.toLocaleString()} {currency}</strong>
            </div>
            <div className="border-t pt-3 flex justify-between text-base font-bold text-gray-900">
              <span>Net Payable Balance:</span>
              <span className="text-green-700">{totalAmount.toLocaleString()} {currency}</span>
            </div>
          </div>

          <button
            type="button"
            disabled={submitting}
            onClick={handleGenerateInvoice}
            className="w-full bg-green-600 text-white font-bold text-sm py-3.5 rounded-xl hover:bg-green-700 transition shadow-md disabled:opacity-50"
          >
            {submitting ? 'Generating Invoice...' : 'Generate & Save Invoice'}
          </button>
        </div>
      )}

      {/* --- CLOSED PROPERTY SELECTION MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-gray-800 text-lg">Select Closed Property</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 font-bold text-xl">×</button>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Search by PO ID, Title, City, Buyer/Seller..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  fetchClosedProperties(e.target.value);
                }}
                className="w-full border rounded-xl px-3 py-2 text-sm outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); fetchClosedProperties(''); }}
                  className="text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-xl font-medium"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto space-y-3 divide-y">
              {filteredProperties.length === 0 ? (
                <p className="text-center text-gray-400 py-4 text-sm">No closed properties found.</p>
              ) : (
                filteredProperties.map((p) => {
                  const curr = getCurrency(p.country);
                  return (
                    <div key={p.id} className="pt-3 pb-2 flex justify-between items-start border-b last:border-none">
                      <div className="space-y-1">
                        <p className="font-semibold text-sm text-gray-800">
                          {p.title} 
                          {p.Purchaseorderid && <span className="text-xs font-mono text-indigo-600 ml-1 font-bold">(PO: {p.Purchaseorderid})</span>}
                          {p.existingInvoice && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold ml-1">Invoice Exists</span>}
                        </p>
                        <p className="text-xs text-gray-500">
                          📍 {p.city}, {p.country} • Closed Date: <span className="font-medium text-gray-700">{p.closeddate || 'N/A'}</span>
                        </p>
                        <p className="text-xs text-gray-600">
                          Buyer: <strong className="text-blue-600">{p.buyer?.fullname || 'N/A'}</strong> | Seller: <strong className="text-purple-600">{p.seller?.fullname || 'N/A'}</strong>
                        </p>
                        <p className="text-xs">
                          Final Price: <strong className="text-green-700">{Number(p.closedprice || 0).toLocaleString()} {curr}</strong> | Advance: <strong className="text-blue-700">{Number(p.advance || 0).toLocaleString()} {curr}</strong>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectProperty(p)}
                        className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-100 h-fit ml-2 shrink-0"
                      >
                        Select
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- BLOCKING ERROR MODAL FOR EXISTING INVOICE --- */}
      {existingInvoiceError?.show && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 text-center border-2 border-red-500">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">⚠️</div>
            <h3 className="text-lg font-bold text-gray-900">Invoice Already Generated</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              An invoice has already been generated for this property. Kindly check the existing invoice below:
            </p>
            
            <div className="bg-gray-100 p-3 rounded-xl flex items-center justify-between border">
              <span className="font-mono text-xs font-bold text-blue-700">ID: {existingInvoiceError.invoiceId}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(existingInvoiceError.invoiceId)}
                className="bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-700 transition shadow-sm"
              >
                Copy ID
              </button>
            </div>

            <button
              type="button"
              onClick={() => setExistingInvoiceError(null)}
              className="w-full bg-gray-900 text-white font-bold text-xs py-3 rounded-xl hover:bg-black transition shadow-md"
            >
              OK, I Understand
            </button>
          </div>
        </div>
      )}
    </div>
  );
}