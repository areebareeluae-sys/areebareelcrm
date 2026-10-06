'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PurchaseOrdersListPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Modal / Preview states
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchClosedProperties = async (query = '') => {
    try {
      setLoading(true);
      const res = await fetch(`/api/property/refund?status=Closed&search=${query}`);
      
      const text = await res.text();
      let data: any = {};
      
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (parseErr) {
          console.error('JSON Parse Error:', parseErr, 'Response Text:', text);
        }
      }

      let fetchedOrders = data.properties || data.orders || [];

      // Sort by latest closed date first (Descending)
      fetchedOrders.sort((a: any, b: any) => {
        const dateA = new Date(a.closeddate || a.fullpaymentdate || 0).getTime();
        const dateB = new Date(b.closeddate || b.fullpaymentdate || 0).getTime();
        return dateB - dateA;
      });

      setOrders(fetchedOrders);
      setCurrentPage(1); // Reset to page 1 on search
    } catch (err) {
      console.error('Error fetching closed orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClosedProperties();
  }, []);

  const handleRefund = async (propertyId: string) => {
    const confirmRefund = window.confirm('Are you sure you want to refund this property? This will clear all buyer and payment details, make the property active again, and log this activity.');
    if (!confirmRefund) return;

    try {
      const res = await fetch('/api/property/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, reason: 'Refunded via Purchase Orders list' }),
      });
      
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (res.ok && data.success) {
        alert('Property successfully refunded!');
        fetchClosedProperties(search);
      } else {
        alert(data.message || 'Failed to process refund');
      }
    } catch (err) {
      console.error('Refund error:', err);
      alert('Something went wrong during refund!');
    }
  };

  const formatPrice = (price: any, country?: string) => {
    if (!price) return 'N/A';
    const currency = country?.toLowerCase() === 'pakistan' ? 'PKR' : 'AED';
    return `${Number(price).toLocaleString()} ${currency}`;
  };

  // Professional Print Trigger Function for Purchase Orders / Closed Deals
  const handlePrint = (order: any) => {
    const currency = order.country?.toLowerCase() === 'pakistan' ? 'PKR' : 'AED';
    const salePrice = Number(order.closedprice || order.price || 0);
    const advance = Number(order.advance || 0);
    const remaining = salePrice - advance;
    
    const displayClosedDate = order.closeddate 
      ? new Date(order.closeddate).toLocaleDateString() 
      : (order.fullpaymentdate ? new Date(order.fullpaymentdate).toLocaleDateString() : new Date().toLocaleDateString());

    const displayFullPaymentDate = order.fullpaymentdate 
      ? new Date(order.fullpaymentdate).toLocaleDateString() 
      : 'N/A';

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Purchase Order / Invoice - #${order.id}</title>
          <style>
            @page { size: A4; margin: 10mm; }
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 0; padding: 0; background: #fff; font-size: 10px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .invoice-box { width: 100%; max-width: 210mm; margin: auto; padding: 5mm; box-sizing: border-box; background: #fff; }
            .header-banner { background: #3b5998 !important; color: #fff !important; padding: 12px 15px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
            .logo-area { display: flex; align-items: center; gap: 10px; }
            .logo-box { border: 2px solid #fff; padding: 5px 8px; font-weight: bold; font-size: 13px; letter-spacing: 1px; }
            .company-info h2 { margin: 0; font-size: 13px; letter-spacing: 0.5px; }
            .company-info p { margin: 2px 0 0; font-size: 9px; opacity: 0.9; }
            
            .parties-box { display: flex; justify-content: space-between; background: #f9f9f9; padding: 10px 12px; border-radius: 4px; margin-bottom: 15px; font-size: 10px; }
            .party-card { width: 48%; }
            .party-card h4 { margin: 0 0 4px; color: #3b5998; font-size: 10px; border-bottom: 1px solid #ddd; padding-bottom: 2px; text-transform: uppercase; }
            .party-card p { margin: 2px 0; }

            table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            th { background: #222 !important; color: #fff !important; text-align: left; padding: 7px 10px; font-size: 9px; text-transform: uppercase; }
            td { padding: 7px 10px; border-bottom: 1px solid #eee; font-size: 10px; }
            .text-right { text-align: right; }

            .summary-section { width: 260px; margin-left: auto; font-size: 10px; margin-bottom: 20px; }
            .summary-row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #f2f2f2; }
            .total-paid-banner { background: #3b5998 !important; color: #fff !important; padding: 8px 10px; font-weight: bold; font-size: 11px; display: flex; justify-content: space-between; border-radius: 3px; margin-top: 6px; }

            .footer { font-size: 8px; color: #777; text-align: center; border-top: 1px solid #eee; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="header-banner">
              <div class="logo-area">
  <div class="logo flex items-center">
    <img 
      src="/images/logos/Chiron Properties Logo without background.png" 
      alt="Company Logo" 
      style="height: 35px; width: auto; display: block;" 
    />
  </div>
</div>
              <div style="text-align: right; font-size: 10px;">
                <strong>PO ID:</strong> ${order.Purchaseorderid || 'N/A'}<br/>
                <strong>Property ID:</strong> #${order.id}<br/>
                <strong>Closed Date:</strong> ${displayClosedDate}<br/>
                <strong>Full Payment Date:</strong> ${displayFullPaymentDate}
              </div>
            </div>

            <div class="parties-box">
              <div class="party-card">
                <h4>Seller Details</h4>
                <p><strong>Name:</strong> ${order.seller?.fullname || order.seller?.refname || order.sellername || 'N/A'}</p>
                <p><strong>Phone:</strong> ${order.seller?.phone || order.seller?.refnumber || order.sellerphone || 'N/A'}</p>
                <p><strong>Email:</strong> ${order.seller?.email || order.seller?.refemail || order.selleremail || 'N/A'}</p>
                <p><strong>Address:</strong> ${order.seller?.address || order.seller?.refaddress || ''}</p>
              </div>
              <div class="party-card">
                <h4>Buyer Details (Client)</h4>
                <p><strong>Name:</strong> ${order.buyer?.fullname || order.buyer?.name || order.buyer?.refname || order.buyer_name || order.customer_name || 'N/A'}</p>
                <p><strong>Phone:</strong> ${order.buyer?.phone || order.buyer?.mobileno || order.buyer?.refnumber || order.buyer_phone || 'N/A'}</p>
                <p><strong>Email:</strong> ${order.buyer?.email || order.buyer?.refemail || order.buyer_email || 'N/A'}</p>
                <p><strong>Address:</strong> ${order.buyer?.address || order.buyer?.refaddress || ''}</p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Qty</th>
                  <th>Property Description</th>
                  <th class="text-right">Price (${currency})</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>
                    <strong>${order.title || 'Property Deal'}</strong><br/>
                    <span style="color: #666; font-size: 8px;">Property ID: #${order.id} | PO ID: ${order.Purchaseorderid || 'N/A'} | Location: ${order.address || ''}, ${order.city || ''}, ${order.country || ''} | Category: ${order.category || 'N/A'}</span>
                  </td>
                  <td class="text-right">${salePrice.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            <div class="summary-section">
              <div class="summary-row">
                <span>Total Closed Price:</span>
                <span>${salePrice.toLocaleString()} ${currency}</span>
              </div>
              <div class="summary-row" style="color: green;">
                <span>Advance Paid:</span>
                <span>-${advance.toLocaleString()} ${currency}</span>
              </div>
              <div class="total-paid-banner">
                <span>REMAINING BALANCE:</span>
                <span>${remaining.toLocaleString()} ${currency}</span>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; margin-top: 25px; font-size: 9px;">
              <div>
                <p style="margin: 2px 0;">All transactions verified via CRM System.</p>
                <p style="margin: 2px 0;">Status: Officially Closed & Recorded.</p>
              </div>
              <div style="text-align: right;">
                <p style="margin-bottom: 20px; margin-top: 0;">Authorized Signature:</p>
                <strong>${order.closedby || 'Admin'}</strong>
                <p style="margin: 2px 0; color: #777;">Operations Manager</p>
              </div>
            </div>

            <div class="footer" style="margin-top: 20px;">
              <p>Lahore, Pakistan | Support Support</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  // Client-side filtering enhancement (searches by title, city, property ID, buyer name, or purchase order ID)
  const filteredOrders = orders.filter((order) => {
    const query = search.toLowerCase();
    const buyerName = (order.buyer?.fullname || order.buyer?.name || order.buyer?.refname || order.buyer_name || order.customer_name || '').toLowerCase();
    const title = (order.title || '').toLowerCase();
    const city = (order.city || '').toLowerCase();
    const country = (order.country || '').toLowerCase();
    const propertyId = (order.id || '').toLowerCase();
    const poId = (order.Purchaseorderid || '').toLowerCase();

    return (
      title.includes(query) ||
      city.includes(query) ||
      country.includes(query) ||
      buyerName.includes(query) ||
      propertyId.includes(query) ||
      poId.includes(query)
    );
  });

  // Pagination Logic based on filtered results
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchase Orders & Closed Deals</h1>
          <p className="text-sm text-gray-500">Manage closed property transactions, view complete info, print, or process refunds.</p>
        </div>
        <Link href="/property/list" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
          + New Sale / Purchase Order
        </Link>
      </div>

      {/* Search Filter with Property ID & Details support */}
      <div className="flex items-center space-x-4">
        <input
          type="text"
          placeholder="Search by Property ID, Title, City, Buyer, PO ID..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full md:w-96 border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
        {search && (
          <button 
            onClick={() => setSearch('')} 
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-2.5 rounded-xl font-medium"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-4">Date</th>
                <th className="p-4">Property Info & IDs</th>
                <th className="p-4">Location</th>
                <th className="p-4">Buyer Name</th>
                <th className="p-4">Closed Price</th>
                <th className="p-4">Advance</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">Loading closed orders...</td></tr>
              ) : currentOrders.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">No closed purchase orders found.</td></tr>
              ) : (
                currentOrders.map((order) => {
                  const buyerDisplayName = order.buyer?.fullname || order.buyer?.name || order.buyer?.refname || order.buyer_name || order.customer_name || 'N/A';
                  const displayDate = order.closeddate ? new Date(order.closeddate).toLocaleDateString() : (order.fullpaymentdate ? new Date(order.fullpaymentdate).toLocaleDateString() : 'N/A');

                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50">
                      <td className="p-4 text-gray-600 whitespace-nowrap">{displayDate}</td>
                      <td className="p-4 font-semibold text-gray-800">
                        {order.title} 
                        <span className="block text-xs text-gray-400 font-normal">
                          Prop ID: <strong className="text-gray-600">#{order.id}</strong> {order.Purchaseorderid ? `| PO ID: ${order.Purchaseorderid}` : ''}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">{order.city}, {order.country}</td>
                      <td className="p-4 text-gray-700">{buyerDisplayName}</td>
                      <td className="p-4 font-bold text-green-700">{formatPrice(order.closedprice, order.country)}</td>
                      <td className="p-4 font-semibold text-gray-700">{formatPrice(order.advance, order.country)}</td>
                      <td className="p-4 text-center space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}
                          className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-200"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handlePrint(order)}
                          className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-100"
                        >
                          Print
                        </button>
                        <button
                          onClick={() => handleRefund(order.id)}
                          className="bg-red-50 text-red-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-100"
                        >
                          Refund
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t bg-gray-50 text-xs text-gray-600">
            <span>Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredOrders.length)} of {filteredOrders.length} entries</span>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 bg-white border rounded-lg font-medium disabled:opacity-40 hover:bg-gray-100"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 border rounded-lg font-medium ${currentPage === page ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-100'}`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 bg-white border rounded-lg font-medium disabled:opacity-40 hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VIEW DETAILS MODAL */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Closed Order & Property Details</h3>
                <p className="text-xs text-gray-500">Property ID: #{selectedOrder.id} | PO ID: {selectedOrder.Purchaseorderid || 'N/A'} | Closed Date: {selectedOrder.closeddate ? new Date(selectedOrder.closeddate).toLocaleDateString() : 'N/A'}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 font-bold text-2xl">×</button>
            </div>

            {/* Images if available */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Property Images</h4>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {(() => {
                  let imgs = [];
                  try { imgs = JSON.parse(selectedOrder.images || '[]'); } catch { imgs = []; }
                  return imgs.length > 0 ? imgs.map((img: string, i: number) => (
                    <img
                      key={i}
                      src={img}
                      alt="Property"
                      onClick={() => setPreviewImage(img)}
                      className="w-24 h-20 object-cover rounded-xl border shadow-sm shrink-0 cursor-pointer hover:scale-105 transition"
                    />
                  )) : <p className="text-xs text-gray-400">No images available</p>;
                })()}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-gray-50 p-3.5 rounded-xl border space-y-1.5 md:col-span-2">
                <h4 className="font-bold text-indigo-700 uppercase tracking-wider border-b pb-1">Complete Property Information</h4>
                <p><strong>Property ID:</strong> #{selectedOrder.id}</p>
                <p><strong>Purchase Order ID:</strong> {selectedOrder.Purchaseorderid || 'N/A'}</p>
                <p><strong>Title:</strong> {selectedOrder.title}</p>
                <p><strong>Category & Type:</strong> {selectedOrder.category} ({selectedOrder.type})</p>
                <p><strong>Full Address:</strong> {selectedOrder.address}, {selectedOrder.city}, {selectedOrder.country}</p>
                <p><strong>Bedrooms / Bathrooms / Area:</strong> {selectedOrder.bedrooms} Beds | {selectedOrder.bathrooms} Baths | {selectedOrder.area} sqft</p>
                <p><strong>Closed Price:</strong> <span className="text-green-700 font-bold text-sm">{formatPrice(selectedOrder.closedprice, selectedOrder.country)}</span></p>
                <p><strong>Advance Paid:</strong> {formatPrice(selectedOrder.advance, selectedOrder.country)}</p>
                <p><strong>Closed Date & Time:</strong> {selectedOrder.closeddate ? new Date(selectedOrder.closeddate).toLocaleString() : 'N/A'}</p>
                <p><strong>Full Payment Date:</strong> {selectedOrder.fullpaymentdate ? new Date(selectedOrder.fullpaymentdate).toLocaleString() : 'N/A'}</p>
              </div>

              <div className="bg-gray-50 p-3.5 rounded-xl border space-y-1.5">
                <h4 className="font-bold text-blue-600 uppercase tracking-wider border-b pb-1">Buyer Details</h4>
                <p><strong>Name:</strong> {selectedOrder.buyer?.fullname || selectedOrder.buyer?.name || selectedOrder.buyer?.refname || selectedOrder.buyer_name || selectedOrder.customer_name || 'N/A'}</p>
                <p><strong>Phone:</strong> {selectedOrder.buyer?.phone || selectedOrder.buyer?.mobileno || selectedOrder.buyer?.refnumber || selectedOrder.buyer_phone || 'N/A'}</p>
                <p><strong>Email:</strong> {selectedOrder.buyer?.email || selectedOrder.buyer?.refemail || selectedOrder.buyer_email || 'N/A'}</p>
                <p><strong>Address:</strong> {selectedOrder.buyer?.address || selectedOrder.buyer?.refaddress || 'N/A'}</p>
              </div>

              <div className="bg-gray-50 p-3.5 rounded-xl border space-y-1.5">
                <h4 className="font-bold text-purple-600 uppercase tracking-wider border-b pb-1">Seller Details</h4>
                <p><strong>Name:</strong> {selectedOrder.seller?.fullname || selectedOrder.seller?.refname || selectedOrder.sellername || 'N/A'}</p>
                <p><strong>Phone:</strong> {selectedOrder.seller?.phone || selectedOrder.seller?.refnumber || selectedOrder.sellerphone || 'N/A'}</p>
                <p><strong>Email:</strong> {selectedOrder.seller?.email || selectedOrder.seller?.refemail || selectedOrder.selleremail || 'N/A'}</p>
                <p><strong>Address:</strong> {selectedOrder.seller?.address || selectedOrder.seller?.refaddress || 'N/A'}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button onClick={() => handlePrint(selectedOrder)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700">
                Print Order
              </button>
              <button onClick={() => setIsModalOpen(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-200">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMAGE ZOOM LIGHTBOX */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-4xl">
            <button onClick={() => setPreviewImage(null)} className="absolute -top-10 right-0 text-white font-bold text-3xl">×</button>
            <img src={previewImage} alt="Zoomed" className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}