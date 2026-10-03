'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PurchaseOrderPage() {
  const router = useRouter();

  const [buyers, setBuyers] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  
  const [selectedBuyer, setSelectedBuyer] = useState<any>(null);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [closedPrice, setClosedPrice] = useState<string>('');
  const [advance, setAdvance] = useState<string>('');
  const [fullPaymentDate, setFullPaymentDate] = useState<string>('');

  const [isBuyerModalOpen, setIsBuyerModalOpen] = useState(false);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);

  const [buyerSearch, setBuyerSearch] = useState('');
  const [propertySearch, setPropertySearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBuyers('');
    fetchActiveProperties('');
  }, []);

  const fetchBuyers = async (query = '') => {
    try {
      const res = await fetch(`/api/property/sale?type=customer&search=${query}&status=Active`);
      const data = await res.json();
      setBuyers(data.customers || []);
    } catch (err) {
      console.error('Error fetching buyers:', err);
    }
  };

  const fetchActiveProperties = async (query = '') => {
    try {
      const res = await fetch(`/api/property/sale?search=${query}&status=Active`);
      const data = await res.json();
      setProperties(data.properties || []);
    } catch (err) {
      console.error('Error fetching properties:', err);
    }
  };

  // Helper function to format numbers with commas (e.g. 100,000,000)
  const formatWithCommas = (value: string) => {
    if (!value) return '';
    const numericValue = value.replace(/[^0-9]/g, '');
    if (!numericValue) return '';
    return Number(numericValue).toLocaleString('en-US');
  };

  // Helper function to convert number to English words
  const numberToWords = (numStr: string) => {
    if (!numStr) return '';
    const num = parseInt(numStr, 10);
    if (isNaN(num) || num === 0) return 'Zero';

    const a = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
      'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const getBelowThousand = (n: number): string => {
      if (n === 0) return '';
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
      return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + getBelowThousand(n % 100) : '');
    };

    let n = num;
    let res = '';

    if (Math.floor(n / 10000000) > 0) {
      res += getBelowThousand(Math.floor(n / 10000000)) + ' Crore ';
      n %= 10000000;
    }
    if (Math.floor(n / 100000) > 0) {
      res += getBelowThousand(Math.floor(n / 100000)) + ' Lakh ';
      n %= 100000;
    }
    if (Math.floor(n / 1000) > 0) {
      res += getBelowThousand(Math.floor(n / 1000)) + ' Thousand ';
      n %= 1000;
    }
    if (n > 0) {
      res += getBelowThousand(n);
    }

    return res.trim() + ' Only';
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const rawValue = e.target.value.replace(/,/g, '');
    if (!isNaN(Number(rawValue))) {
      setter(rawValue);
    }
  };

  const formatPrice = (price: any, country: string) => {
    if (!price) return 'N/A';
    const isPak = country?.toLowerCase() === 'pakistan' || country?.toLowerCase() === 'pk';
    const currency = isPak ? 'PKR' : 'AED';
    return `${Number(price).toLocaleString()} ${currency}`;
  };

  const handleSelectBuyer = (buyer: any) => {
    if (selectedProperty) {
      const sellerId = String(selectedProperty.salescustomerid || '').trim();
      const buyerId = String(buyer.id || '').trim();

      if (buyerId === sellerId && buyerId !== '') {
        alert('Error: The buyer and the seller cannot be the same person. Please select a different buyer.');
        return;
      }
    }
    setSelectedBuyer(buyer);
    setIsBuyerModalOpen(false);
  };

  const handleSelectProperty = (property: any) => {
    if (selectedBuyer) {
      const sellerId = String(property.salescustomerid || '').trim();
      const buyerId = String(selectedBuyer.id || '').trim();

      if (buyerId === sellerId && buyerId !== '') {
        alert('Error: The buyer and the seller cannot be the same person. Please select a different property or change the buyer.');
        return;
      }
    }
    setSelectedProperty(property);
    setIsPropertyModalOpen(false);
  };

  const handleCloseProperty = async () => {
    if (!selectedBuyer) { alert('Please select a buyer first!'); return; }
    if (!selectedProperty) { alert('Please select a property first!'); return; }
    if (!closedPrice) { alert('Please enter closed price!'); return; }
    if (!advance) { alert('Please enter advance amount!'); return; }
    if (!fullPaymentDate) { alert('Please select full payment date!'); return; }

    const sellerId = String(selectedProperty.salescustomerid || '').trim();
    const buyerId = String(selectedBuyer.id || '').trim();

    if (buyerId === sellerId && buyerId !== '') {
      alert('Error: Buyer and Seller cannot be the same!');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/property/sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: selectedProperty.id,
          buyercustomerid: selectedBuyer.id,
          closedprice: closedPrice,
          advance: advance,
          fullpaymentdate: fullPaymentDate,
          closedby: 'Admin',
          closeddate: new Date().toISOString().split('T')[0],
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert('Purchase Order successfully created & property closed!');
        router.push('/property/list');
      } else {
        alert(data.message || 'Failed to create purchase order');
      }
    } catch (err) {
      console.error('Error creating purchase order:', err);
      alert('Something went wrong!');
    } finally {
      setSubmitting(false);
    }
  };

  // Client-side filtering enhancement for property modal supporting ID, Title, City, Country
  const filteredProperties = properties.filter((p) => {
    const query = propertySearch.toLowerCase().trim();
    if (!query) return true;

    const title = (p.title || '').toLowerCase();
    const city = (p.city || '').toLowerCase();
    const country = (p.country || '').toLowerCase();
    const propertyId = p.id ? String(p.id).toLowerCase() : '';

    return (
      title.includes(query) ||
      city.includes(query) ||
      country.includes(query) ||
      propertyId.includes(query) ||
      propertyId === query
    );
  });

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchase Order & Sales Closing</h1>
          <p className="text-sm text-gray-500">Step 1: Select Buyer → Step 2: Select Property → Step 3: Payment Details & Closing</p>
        </div>
        <Link href="/property/list" className="text-sm text-blue-600 hover:underline font-medium">
          ← Back to Listings
        </Link>
      </div>

      {/* STEP 1: SELECT BUYER */}
      <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-base font-bold text-gray-800">1. Select Buyer Customer</h2>
          {selectedBuyer && (
            <button onClick={() => { setSelectedBuyer(null); setSelectedProperty(null); }} className="text-xs text-red-600 hover:underline font-semibold">
              Change Buyer
            </button>
          )}
        </div>

        {selectedBuyer ? (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-2 text-sm">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div><span className="text-xs text-gray-500 block">Full Name</span><span className="font-bold text-emerald-900">{selectedBuyer.fullname}</span></div>
              <div><span className="text-xs text-gray-500 block">Email</span><span className="font-semibold text-gray-700">{selectedBuyer.email}</span></div>
              <div><span className="text-xs text-gray-500 block">Phone</span><span className="font-semibold text-gray-700">{selectedBuyer.phone}</span></div>
              <div><span className="text-xs text-gray-500 block">City / Country</span><span className="font-semibold text-gray-700">{selectedBuyer.city}, {selectedBuyer.country}</span></div>
              <div><span className="text-xs text-gray-500 block">Address</span><span className="font-semibold text-gray-700">{selectedBuyer.address}</span></div>
              <div><span className="text-xs text-gray-500 block">Reference</span><span className="font-semibold text-gray-700">{selectedBuyer.refname || 'N/A'}</span></div>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setIsBuyerModalOpen(true)} className="w-full bg-blue-600 text-white font-medium text-sm py-3 rounded-xl hover:bg-blue-700 transition">
            Select Buyer
          </button>
        )}
      </div>

      {/* STEP 2: SELECT PROPERTY */}
      {selectedBuyer && (
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h2 className="text-base font-bold text-gray-800">2. Select Active Property</h2>
            {selectedProperty && (
              <button onClick={() => setSelectedProperty(null)} className="text-xs text-red-600 hover:underline font-semibold">
                Change Property
              </button>
            )}
          </div>

          {selectedProperty ? (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl space-y-2 text-sm">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div><span className="text-xs text-gray-500 block">Title & ID</span><span className="font-bold text-blue-900">{selectedProperty.title} <strong className="text-gray-500">(#{selectedProperty.id})</strong></span></div>
                <div><span className="text-xs text-gray-500 block">Category / Type</span><span className="font-semibold text-gray-700">{selectedProperty.category} - {selectedProperty.type}</span></div>
                <div><span className="text-xs text-gray-500 block">Location</span><span className="font-semibold text-gray-700">{selectedProperty.city}, {selectedProperty.country}</span></div>
                <div>
                  <span className="text-xs text-gray-500 block">Price Range (Min - Max)</span>
                  <span className="font-bold text-green-700">
                    {formatPrice(selectedProperty.minprice, selectedProperty.country)} - {formatPrice(selectedProperty.maxprice, selectedProperty.country)}
                  </span>
                </div>
                <div><span className="text-xs text-gray-500 block">Status</span><span className="font-semibold text-emerald-600">{selectedProperty.status}</span></div>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setIsPropertyModalOpen(true)} className="w-full bg-indigo-600 text-white font-medium text-sm py-3 rounded-xl hover:bg-indigo-700 transition">
              Select Property (Active Only)
            </button>
          )}
        </div>
      )}

      {/* STEP 3: PURCHASE ORDER DETAILS & SUMMARY */}
      {selectedBuyer && selectedProperty && (
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
          <h2 className="text-base font-bold text-gray-800 border-b pb-3">3. Purchase Order & Payment Details</h2>

          <div className="bg-gray-50 border p-4 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Complete Deal Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              
              {/* Buyer Info */}
              <div className="bg-white p-3 rounded-lg border shadow-sm">
                <span className="text-xs text-blue-600 font-bold block mb-1">Buyer Information</span>
                <p><span className="text-gray-500">Name:</span> <strong className="text-gray-800">{selectedBuyer.fullname}</strong></p>
                <p><span className="text-gray-500">Phone:</span> <strong className="text-gray-800">{selectedBuyer.phone}</strong></p>
                <p><span className="text-gray-500">Email:</span> <strong className="text-gray-800">{selectedBuyer.email}</strong></p>
                <p><span className="text-gray-500">City:</span> <strong className="text-gray-800">{selectedBuyer.city}, {selectedBuyer.country}</strong></p>
              </div>

              {/* Seller Info */}
              <div className="bg-white p-3 rounded-lg border shadow-sm">
                <span className="text-xs text-purple-600 font-bold block mb-1">Seller Information</span>
                {selectedProperty.seller ? (
                  <>
                    <p><span className="text-gray-500">Name:</span> <strong className="text-gray-800">{selectedProperty.seller.fullname}</strong></p>
                    <p><span className="text-gray-500">Phone:</span> <strong className="text-gray-800">{selectedProperty.seller.phone}</strong></p>
                    <p><span className="text-gray-500">Email:</span> <strong className="text-gray-800">{selectedProperty.seller.email}</strong></p>
                    <p><span className="text-gray-500">City:</span> <strong className="text-gray-800">{selectedProperty.seller.city}, {selectedProperty.seller.country}</strong></p>
                  </>
                ) : (
                  <p className="text-xs text-gray-400">Seller details not found (ID: {selectedProperty.salescustomerid})</p>
                )}
              </div>

              {/* Property Info */}
              <div className="bg-white p-3 rounded-lg border shadow-sm">
                <span className="text-xs text-indigo-600 font-bold block mb-1">Property Information</span>
                <p><span className="text-gray-500">Title & ID:</span> <strong className="text-gray-800">{selectedProperty.title} (#{selectedProperty.id})</strong></p>
                <p><span className="text-gray-500">Location:</span> <strong className="text-gray-800">{selectedProperty.city}, {selectedProperty.country}</strong></p>
                <p><span className="text-gray-500">Price Range:</span> <strong className="text-green-700">{formatPrice(selectedProperty.minprice, selectedProperty.country)} - {formatPrice(selectedProperty.maxprice, selectedProperty.country)}</strong></p>
              </div>

            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Closed Price */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-600 uppercase">
                Closed Price ({selectedProperty.country?.toLowerCase() === 'pakistan' ? 'PKR' : 'AED'})
              </label>
              <input
                type="text"
                placeholder="e.g. 100,000,000"
                value={formatWithCommas(closedPrice)}
                onChange={(e) => handlePriceChange(e, setClosedPrice)}
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              {closedPrice && (
                <p className="text-xs font-medium text-blue-600 italic">
                  {numberToWords(closedPrice)}
                </p>
              )}
            </div>

            {/* Advance Amount */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-600 uppercase">
                Advance Amount ({selectedProperty.country?.toLowerCase() === 'pakistan' ? 'PKR' : 'AED'})
              </label>
              <input
                type="text"
                placeholder="e.g. 10,000,000"
                value={formatWithCommas(advance)}
                onChange={(e) => handlePriceChange(e, setAdvance)}
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              {advance && (
                <p className="text-xs font-medium text-blue-600 italic">
                  {numberToWords(advance)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-600 uppercase">
                Full Payment Date
              </label>
              <input
                type="date"
                value={fullPaymentDate}
                onChange={(e) => setFullPaymentDate(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button type="button" disabled={submitting} onClick={handleCloseProperty} className="w-full bg-green-600 text-white font-bold text-sm py-3.5 rounded-xl hover:bg-green-700 transition disabled:opacity-50">
            {submitting ? 'Processing Purchase Order...' : 'Confirm Purchase Order & Close Property'}
          </button>
        </div>
      )}

      {/* --- BUYER MODAL --- */}
      {isBuyerModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-gray-800 text-lg">Select Buyer</h3>
              <button onClick={() => setIsBuyerModalOpen(false)} className="text-gray-400 font-bold text-xl">×</button>
            </div>
            <input
              type="text"
              placeholder="Search buyer by name, email, phone..."
              value={buyerSearch}
              onChange={(e) => { setBuyerSearch(e.target.value); fetchBuyers(e.target.value); }}
              className="w-full border rounded-xl px-3 py-2 text-sm outline-none"
            />
            <div className="max-h-60 overflow-y-auto space-y-2 divide-y">
              {buyers.length === 0 ? <p className="text-center text-gray-400 py-4 text-sm">No buyers found.</p> :
                buyers.map((b) => (
                  <div key={b.id} className="pt-2 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-sm text-gray-800">{b.fullname}</p>
                      <p className="text-xs text-gray-500">{b.email} • {b.phone}</p>
                    </div>
                    <button type="button" onClick={() => handleSelectBuyer(b)} className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-100">
                      Select
                    </button>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}

      {/* --- PROPERTY MODAL --- */}
      {isPropertyModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-gray-800 text-lg">Select Active Property</h3>
              <button onClick={() => setIsPropertyModalOpen(false)} className="text-gray-400 font-bold text-xl">×</button>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Search by Property ID, Title, City..."
                value={propertySearch}
                onChange={(e) => {
                  setPropertySearch(e.target.value);
                  fetchActiveProperties(e.target.value);
                }}
                className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {propertySearch && (
                <button
                  onClick={() => { setPropertySearch(''); fetchActiveProperties(''); }}
                  className="text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-xl font-medium"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 divide-y">
              {filteredProperties.length === 0 ? (
                <p className="text-center text-gray-400 py-4 text-sm">No active properties found.</p>
              ) : (
                filteredProperties.map((p) => (
                  <div key={p.id} className="pt-3 pb-2 flex justify-between items-center border-b last:border-none">
                    <div>
                      <p className="font-semibold text-sm text-gray-800">
                        {p.title} <strong className="text-indigo-600">(#{p.id})</strong>
                      </p>
                      <p className="text-xs text-gray-500">📍 {p.city}, {p.country} • Seller ID: {p.salescustomerid}</p>
                      <p className="text-xs font-bold text-green-700 mt-0.5">
                        {formatPrice(p.minprice, p.country)} - {formatPrice(p.maxprice, p.country)}
                      </p>
                    </div>
                    <button type="button" onClick={() => handleSelectProperty(p)} className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-100">
                      Select
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}