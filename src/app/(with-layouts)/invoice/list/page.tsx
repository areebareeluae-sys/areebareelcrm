'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function InvoicesListPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [invoiceIdFilter, setInvoiceIdFilter] = useState('');
  const [propertyIdFilter, setPropertyIdFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Modal States
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, [page, invoiceIdFilter, propertyIdFilter, statusFilter]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        invoiceId: invoiceIdFilter,
        propertyId: propertyIdFilter,
        status: statusFilter,
        page: page.toString(),
      });

      const res = await fetch(`/api/property/invoice/list?${query}`);
      const data = await res.json();
      setInvoices(data.invoices || []);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    if (!confirm('Are you sure you want to mark this invoice as Paid?')) return;

    try {
      const res = await fetch('/api/property/invoice/list', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('Invoice marked as Paid successfully!');
        fetchInvoices();
      } else {
        alert(data.message || 'Failed to update invoice status');
      }
    } catch (err) {
      console.error('Error updating invoice:', err);
    }
  };

  // Professional Print Trigger Function
 // Professional Print Trigger Function
  const handlePrint = (invoice: any) => {
    const currency = invoice.property?.country?.toLowerCase() === 'pakistan' ? 'PKR' : 'AED';
    const salePrice = Number(invoice.property?.closedprice || 0);
    const commission = Number(invoice.companycommission || 0);
    const tax = Number(invoice.govttax || 0);
    const discount = Number(invoice.discount || 0);
    const totalPaid = Number(invoice.totalammount || 0);
    
    // Grab advance from invoice or nested property.advance
    const advanceAmount = Number(invoice.advanceAmount || invoice.advance || invoice.property?.advance || 0);
    const isPaid = invoice.status === 'Paid';
    const remainingBalance = isPaid ? 0 : Math.max(0, totalPaid - advanceAmount);

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${invoice.id}</title>
          <style>
            @page { size: A4; margin: 10mm; }
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 0; padding: 0; background: #fff; font-size: 10px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .invoice-box { width: 100%; max-width: 210mm; margin: auto; padding: 5mm; box-sizing: border-box; background: #fff; position: relative; }
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

            .summary-section { width: 280px; margin-left: auto; font-size: 10px; margin-bottom: 20px; }
            .summary-row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #f2f2f2; }
            .total-paid-banner { background: #3b5998 !important; color: #fff !important; padding: 8px 10px; font-weight: bold; font-size: 11px; display: flex; justify-content: space-between; border-radius: 3px; margin-top: 6px; }
            .advance-banner { background: #059669 !important; color: #fff !important; padding: 6px 10px; font-weight: bold; font-size: 10px; display: flex; justify-content: space-between; border-radius: 3px; margin-top: 4px; }
            .paid-stamp { position: absolute; top: 180px; right: 40px; border: 3px solid #059669; color: #059669; font-size: 24px; font-weight: bold; padding: 8px 20px; border-radius: 8px; transform: rotate(-15deg); text-transform: uppercase; letter-spacing: 2px; opacity: 0.85; pointer-events: none; }

            .footer { font-size: 8px; color: #777; text-align: center; border-top: 1px solid #eee; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            ${isPaid ? '<div class="paid-stamp">PAID IN FULL</div>' : ''}
            
            <div class="header-banner">
              <div class="logo-area">
                <div class="logo-box">LOGO</div>
                <div class="company-info">
                  <h2>Areel Areel REALTY</h2>
                  <p>Excellence in Real Estate & Transactions</p>
                </div>
              </div>
              <div style="text-align: right; font-size: 10px;">
                <strong>Invoice ID:</strong> #${invoice.id}<br/>
                <strong>Status:</strong> <span style="color: ${isPaid ? '#6ee7b7' : '#93c5fd'}; font-weight: bold;">${invoice.status}</span><br/>
                <strong>Date:</strong> ${new Date(invoice.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div class="parties-box">
              <div class="party-card">
                <h4>Seller Details</h4>
                <p><strong>Name:</strong> ${invoice.seller?.fullname || 'N/A'}</p>
                <p><strong>Phone:</strong> ${invoice.seller?.phone || 'N/A'}</p>
                <p><strong>Email:</strong> ${invoice.seller?.email || 'N/A'}</p>
                <p><strong>Location:</strong> ${invoice.seller?.city || ''}, ${invoice.seller?.country || ''}</p>
              </div>
              <div class="party-card">
                <h4>Buyer Details (Receipt To)</h4>
                <p><strong>Name:</strong> ${invoice.buyer?.fullname || 'N/A'}</p>
                <p><strong>Phone:</strong> ${invoice.buyer?.phone || 'N/A'}</p>
                <p><strong>Email:</strong> ${invoice.buyer?.email || 'N/A'}</p>
                <p><strong>Location:</strong> ${invoice.buyer?.city || ''}, ${invoice.buyer?.country || ''}</p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Qty</th>
                  <th>Item Description</th>
                  <th class="text-right">Unit Price (${currency})</th>
                  <th class="text-right">Total (${currency})</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>Property Base Price (${invoice.property?.title || 'Property'})</td>
                  <td class="text-right">${salePrice.toLocaleString()}</td>
                  <td class="text-right">${salePrice.toLocaleString()}</td>
                </tr>
                ${commission > 0 ? `
                <tr>
                  <td>1</td>
                  <td>Company Commission Fee</td>
                  <td class="text-right">${commission.toLocaleString()}</td>
                  <td class="text-right">${commission.toLocaleString()}</td>
                </tr>` : ''}
                ${tax > 0 ? `
                <tr>
                  <td>1</td>
                  <td>Govt Tax / Charges</td>
                  <td class="text-right">${tax.toLocaleString()}</td>
                  <td class="text-right">${tax.toLocaleString()}</td>
                </tr>` : ''}
              </tbody>
            </table>

            <div class="summary-section">
              <div class="summary-row">
                <span>Sub-Total:</span>
                <span>${(salePrice + commission + tax).toLocaleString()} ${currency}</span>
              </div>
              ${discount > 0 ? `
              <div class="summary-row" style="color: red;">
                <span>Discount Applied:</span>
                <span>-${discount.toLocaleString()}${currency}</span>
              </div>` : ''}
              <div class="total-paid-banner">
                <span>TOTAL AMOUNT:</span>
                <span>${totalPaid.toLocaleString()} ${currency}</span>
              </div>
              <div class="advance-banner">
                <span>${isPaid ? 'AMOUNT PAID:' : 'ADVANCE PAID:'}</span>
                <span>${(isPaid ? totalPaid : advanceAmount).toLocaleString()} ${currency}</span>
              </div>
              ${!isPaid ? `
              <div class="summary-row" style="margin-top: 4px; font-weight: bold;">
                <span>Remaining Balance:</span>
                <span style="color: #dc2626;">${remainingBalance.toLocaleString()}${currency}</span>
              </div>` : `
              <div class="summary-row" style="margin-top: 4px; font-weight: bold; color: #059669;">
                <span>Payment Status:</span>
                <span>Fully Cleared / Paid</span>
              </div>`}
            </div>

            <div style="display: flex; justify-content: space-between; margin-top: 25px; font-size: 9px;">
              <div>
                <p style="margin: 2px 0;">All sales are final upon signing.</p>
                <p style="margin: 2px 0;">Authorized property transaction via Areel Areel CRM.</p>
              </div>
              <div style="text-align: right;">
                <p style="margin-bottom: 20px; margin-top: 0;">Authorized Signature:</p>
                <strong>${invoice.createdby || 'Admin'}</strong>
                <p style="margin: 2px 0; color: #777;">Operations Manager</p>
              </div>
            </div>

            <div class="footer" style="margin-top: 20px;">
              <p>Areel Areel Office, Lahore, Pakistan | Support: support@Areel Areel.com</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CRM Invoices Management</h1>
          <p className="text-sm text-gray-500">View, filter, and manage transaction invoices & payments.</p>
        </div>
        <Link href="/invoice/gr-invoice" className="bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-blue-700 transition">
          + Generate New Invoice
        </Link>
      </div>

      {/* FILTERS BAR */}
      <div className="bg-white p-4 rounded-2xl border shadow-sm grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          type="text"
          placeholder="Filter by Invoice ID..."
          value={invoiceIdFilter}
          onChange={(e) => { setInvoiceIdFilter(e.target.value); setPage(1); }}
          className="border rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Filter by Property ID..."
          value={propertyIdFilter}
          onChange={(e) => { setPropertyIdFilter(e.target.value); setPage(1); }}
          className="border rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="border rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Paid">Paid</option>
        </select>
        <button
          onClick={() => { setInvoiceIdFilter(''); setPropertyIdFilter(''); setStatusFilter(''); setPage(1); }}
          className="bg-gray-100 text-gray-700 font-semibold rounded-xl text-xs py-2 hover:bg-gray-200"
        >
          Reset Filters
        </button>
      </div>

      {/* INVOICES TABLE */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-400 text-sm">Loading invoices...</div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">No invoices found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b text-gray-500 uppercase font-semibold">
                  <th className="p-3">Invoice ID</th>
                  <th className="p-3">Property Title / ID</th>
                  <th className="p-3">Buyer Name</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Advance Paid</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-gray-800">
                {invoices.map((inv) => {
                  const currency = inv.property?.country?.toLowerCase() === 'pakistan' ? 'PKR' : 'AED';
                  const adv = Number(inv.advanceAmount || inv.advance || inv.property?.advance || 0);
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50 transition">
                      <td className="p-3 font-mono font-bold text-blue-600">{inv.id}</td>
                      <td className="p-3">
                        <strong className="block">{inv.property?.title || 'N/A'}</strong>
                        <span className="text-[10px] text-gray-400">ID: {inv.propertyid}</span>
                      </td>
                      <td className="p-3 font-medium">{inv.buyer?.fullname || 'N/A'}</td>
                      <td className="p-3 font-bold text-green-700">
                        {Number(inv.totalammount).toLocaleString()} {currency}
                      </td>
                      <td className="p-3 font-semibold text-emerald-600">
                        {adv > 0 ? `${adv.toLocaleString()} ${currency}` : `0 ${currency}`}
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1.5">
                        <button
                          onClick={() => { setSelectedInvoice(inv); setIsModalOpen(true); }}
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg font-semibold"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handlePrint(inv)}
                          className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg font-semibold"
                        >
                          Print
                        </button>
                        {inv.status !== 'Paid' && (
                          <button
                            onClick={() => handleMarkAsPaid(inv.id)}
                            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg font-semibold"
                          >
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PAGINATION BUTTONS */}
      <div className="flex justify-center items-center gap-2 pt-2">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1.5 border rounded-lg text-xs bg-white disabled:opacity-40 font-semibold"
        >
          Previous
        </button>
        <span className="text-xs font-bold px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
          Page {page}
        </span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={invoices.length < 20}
          className="px-3 py-1.5 border rounded-lg text-xs bg-white disabled:opacity-40 font-semibold"
        >
          Next
        </button>
      </div>

      {/* COMPREHENSIVE VIEW DETAILS MODAL */}
      {isModalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden p-6 space-y-6 max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Invoice Transaction Details</h3>
                <p className="text-xs text-gray-400">Invoice ID: #{selectedInvoice.id} • Date: {new Date(selectedInvoice.createdAt).toLocaleDateString()}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 font-bold text-2xl">×</button>
            </div>

            {/* Property Images (Click to Zoom) */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Property Cloudinary Images (Click to Zoom)</h4>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {(() => {
                  let imgs = [];
                  try { imgs = JSON.parse(selectedInvoice.property?.images || '[]'); } catch { imgs = []; }
                  return imgs.length > 0 ? imgs.map((img: string, i: number) => (
                    <img
                      key={i}
                      src={img}
                      alt="Property"
                      onClick={() => setPreviewImage(img)}
                      className="w-28 h-20 object-cover rounded-xl border shadow-sm shrink-0 cursor-pointer hover:scale-105 transition"
                    />
                  )) : <p className="text-xs text-gray-400">No images available</p>;
                })()}
              </div>
            </div>

            {/* Detailed Grid Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
              
              {/* Complete Property Information */}
              <div className="bg-gray-50 p-4 rounded-2xl border space-y-2 md:col-span-2">
                <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider border-b pb-1.5">Property Full Specifications</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-1">
                  <div><span className="text-gray-400 block">Title</span><strong className="text-gray-900">{selectedInvoice.property?.title}</strong></div>
                  <div><span className="text-gray-400 block">Category / Type</span><strong className="text-gray-900">{selectedInvoice.property?.category} - {selectedInvoice.property?.type}</strong></div>
                  <div><span className="text-gray-400 block">Bedrooms</span><strong className="text-gray-900">{selectedInvoice.property?.bedrooms ?? 0} Beds</strong></div>
                  <div><span className="text-gray-400 block">Bathrooms</span><strong className="text-gray-900">{selectedInvoice.property?.bathrooms ?? 0} Baths</strong></div>
                  <div><span className="text-gray-400 block">Area Size</span><strong className="text-gray-900">{selectedInvoice.property?.area || 'N/A'}</strong></div>
                  <div><span className="text-gray-400 block">Location</span><strong className="text-gray-900">{selectedInvoice.property?.city}, {selectedInvoice.property?.country}</strong></div>
                  <div><span className="text-gray-400 block">Sale Price</span><strong className="text-green-700">{Number(selectedInvoice.property?.closedprice || 0).toLocaleString()}</strong></div>
                </div>
              </div>

              {/* Invoice Breakdown */}
              <div className="bg-gray-50 p-4 rounded-2xl border space-y-1.5">
                <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider border-b pb-1.5">Payment & Financial Breakdown</h4>
                <p className="flex justify-between"><span>Company Commission:</span> <strong>{Number(selectedInvoice.companycommission).toLocaleString()}</strong></p>
                <p className="flex justify-between"><span>Govt Tax / Charges:</span> <strong>{selectedInvoice.govttax}</strong></p>
                <p className="flex justify-between"><span>Discount Applied:</span> <strong className="text-red-600">-{selectedInvoice.discount}</strong></p>
                <p className="flex justify-between border-t pt-1 font-bold text-gray-900"><span>Total Amount:</span> <span className="text-green-700">{Number(selectedInvoice.totalammount).toLocaleString()}</span></p>
                <p className="flex justify-between pt-1 font-bold text-emerald-700"><span>Advance Paid:</span> <span>{Number(selectedInvoice.advanceAmount || selectedInvoice.advance || selectedInvoice.property?.advance || 0).toLocaleString()}</span></p>
                <p className="flex justify-between pt-1 font-bold text-blue-700"><span>Remaining Balance:</span> <span>{Math.max(0, Number(selectedInvoice.totalammount) - Number(selectedInvoice.advanceAmount || selectedInvoice.advance || selectedInvoice.property?.advance || 0)).toLocaleString()}</span></p>
              </div>

              {/* Status & Creator Info */}
              <div className="bg-gray-50 p-4 rounded-2xl border space-y-2">
                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider border-b pb-1.5">Transaction Meta</h4>
                <p><strong>Status:</strong> <span className="text-emerald-600 font-bold">{selectedInvoice.status}</span></p>
                <p><strong>Created By:</strong> {selectedInvoice.createdby}</p>
                <p><strong>Closed By:</strong> {selectedInvoice.property?.closedby || 'N/A'}</p>
                <p><strong>Closed Date:</strong> {selectedInvoice.property?.closeddate || 'N/A'}</p>
              </div>

              {/* Buyer Details */}
              <div className="bg-gray-50 p-4 rounded-2xl border space-y-1">
                <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider border-b pb-1.5">Buyer Information</h4>
                <p><strong>Name:</strong> {selectedInvoice.buyer?.fullname || 'N/A'}</p>
                <p><strong>Phone:</strong> {selectedInvoice.buyer?.phone || 'N/A'}</p>
                <p><strong>Email:</strong> {selectedInvoice.buyer?.email || 'N/A'}</p>
                <p><strong>City:</strong> {selectedInvoice.buyer?.city}, {selectedInvoice.buyer?.country}</p>
              </div>

              {/* Seller Details */}
              <div className="bg-gray-50 p-4 rounded-2xl border space-y-1">
                <h4 className="text-xs font-bold text-purple-600 uppercase tracking-wider border-b pb-1.5">Seller Information</h4>
                <p><strong>Name:</strong> {selectedInvoice.seller?.fullname || 'N/A'}</p>
                <p><strong>Phone:</strong> {selectedInvoice.seller?.phone || 'N/A'}</p>
                <p><strong>Email:</strong> {selectedInvoice.seller?.email || 'N/A'}</p>
                <p><strong>City:</strong> {selectedInvoice.seller?.city}, {selectedInvoice.seller?.country}</p>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button onClick={() => handlePrint(selectedInvoice)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition">
                Print Invoice
              </button>
              <button onClick={() => setIsModalOpen(false)} className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-200 transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- IMAGE ZOOM LIGHTBOX MODAL --- */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh]">
            <button onClick={() => setPreviewImage(null)} className="absolute -top-10 right-0 text-white font-bold text-3xl hover:text-gray-300">×</button>
            <img src={previewImage} alt="Zoomed View" className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}