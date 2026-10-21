'use client';

import { useEffect, useState } from 'react';

export default function AdminDealersPage() {
  const [dealers, setDealers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState('');

  // Filter & Pagination States (Active/Inactive removed)
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal State for Image Viewer
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageTitle, setImageTitle] = useState<string>('');

  // Modal State for Agreement Popup (Same Page)
  const [selectedAgreementDealer, setSelectedAgreementDealer] = useState<any | null>(null);
  const [contractNo, setContractNo] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  // Edit Dealer Modal State
  const [editingDealer, setEditingDealer] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    companyName: '',
    companyAddress: '',
    phoneNumber: '',
    cnicNumber: '',
  });

  // Set random contract ref and date on client side
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

  // Fetch Dealers List
  const fetchDealers = async () => {
    try {
      const res = await fetch('/api/dealers');
      const result = await res.json();
      if (res.ok) {
        setDealers(result.data);
      } else {
        setError(result.error || 'Failed to load dealers.');
      }
    } catch (err) {
      setError('Network error while fetching dealers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDealers();
  }, []);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openEditModal = (dealer: any) => {
    setEditingDealer(dealer);
    setEditFormData({
      name: dealer.name || '',
      email: dealer.email || '',
      companyName: dealer.companyName || '',
      companyAddress: dealer.companyAddress || '',
      phoneNumber: dealer.phoneNumber || '',
      cnicNumber: dealer.cnicNumber || '',
    });
  };

  const handleUpdateDealer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDealer) return;

    setActionLoading(editingDealer.id);
    setError('');

    try {
      const res = await fetch(`/api/dealers/${editingDealer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Failed to update dealer details.');
      } else {
        setEditingDealer(null);
        fetchDealers();
      }
    } catch (err) {
      setError('Network error during dealer update.');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle Status Update (Accept / Reject)
  const handleStatusChange = async (id: number, newStatus: string) => {
    setActionLoading(id);
    setError('');

    try {
      const payload: any = { id, status: newStatus };

      const res = await fetch('/api/dealers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Failed to update status.');
      } else {
        fetchDealers();
      }
    } catch (err) {
      setError('Network error during status update.');
    } finally {
      setActionLoading(null);
    }
  };

  // Counts Calculation (Active/Inactive removed)
  const counts = {
    all: dealers.length,
    pending: dealers.filter((d) => d.status === 'pending').length,
    approved: dealers.filter((d) => d.status === 'approved').length,
    rejected: dealers.filter((d) => d.status === 'rejected').length,
  };

  // Filter Logic (Active/Inactive removed)
  const filteredDealers = dealers.filter((dealer) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return dealer.status === 'pending';
    if (filter === 'approved') return dealer.status === 'approved';
    if (filter === 'rejected') return dealer.status === 'rejected';
    return true;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredDealers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDealers = filteredDealers.slice(startIndex, startIndex + itemsPerPage);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const getStatusBadge = (dealer: any) => {
    if (dealer.status === 'approved') {
      return (
        <span className="bg-emerald-500/20 text-emerald-700 border border-emerald-500 px-3 py-1 rounded-full text-xs font-bold uppercase">
          Accepted
        </span>
      );
    } else if (dealer.status === 'rejected') {
      return <span className="bg-red-500/20 text-red-700 border border-red-500 px-3 py-1 rounded-full text-xs font-bold uppercase">Rejected</span>;
    } else {
      return <span className="bg-amber-500/20 text-amber-700 border border-amber-500 px-3 py-1 rounded-full text-xs font-bold uppercase">Pending</span>;
    }
  };

  return (
    <div className="min-h-screen text-black p-6 sm:p-10 mt-[80px] bg-gray-50">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-black">Dealer Management CRM</h1>
            <p className="text-gray-700 text-xs sm:text-sm mt-1">Review, accept, reject dealer applications, or view partnership agreements.</p>
          </div>
          <button
            onClick={fetchDealers}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-md"
          >
            Refresh List
          </button>
        </div>

        {/* Status Filters with Counts */}
        <div className="flex flex-wrap gap-2 mb-6 bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
          {[
            { id: 'all', label: 'All', count: counts.all },
            { id: 'pending', label: 'Pending', count: counts.pending },
            { id: 'approved', label: 'Accepted', count: counts.approved },
            { id: 'rejected', label: 'Rejected', count: counts.rejected },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
                filter === tab.id
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${filter === tab.id ? 'bg-indigo-800 text-white' : 'bg-gray-200 text-gray-800'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-xl text-black text-xs font-medium">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-black font-medium">Loading dealer records...</div>
        ) : currentDealers.length === 0 ? (
          <div className="text-center py-20 text-black rounded-3xl border border-indigo-500/20 bg-white shadow-sm">
            No dealer applications found for this filter.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto bg-white rounded-3xl border border-gray-200 shadow-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-700 text-xs uppercase tracking-wider bg-gray-100">
                    <th className="p-4 sm:p-5">Applicant</th>
                    <th className="p-4 sm:p-5">Company / Address</th>
                    <th className="p-4 sm:p-5">CNIC / Contact</th>
                    <th className="p-4 sm:p-5">CNIC Documents</th>
                    <th className="p-4 sm:p-5">Status</th>
                    <th className="p-4 sm:p-5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-xs sm:text-sm">
                  {currentDealers.map((dealer) => (
                    <tr key={dealer.id} className="hover:bg-gray-50 transition">
                      <td className="p-4 sm:p-5">
                        <div className="font-bold text-black">{dealer.name}</div>
                        <div className="text-gray-600 text-xs">{dealer.email}</div>
                      </td>
                      <td className="p-4 sm:p-5">
                        <div className="font-semibold text-indigo-700">{dealer.companyName}</div>
                        <div className="text-gray-600 text-xs">{dealer.companyAddress}</div>
                      </td>
                      <td className="p-4 sm:p-5">
                        <div className="font-mono font-semibold text-black">{dealer.cnicNumber}</div>
                        <div className="text-gray-600 text-xs">{dealer.phoneNumber}</div>
                      </td>
                      <td className="p-4 sm:p-5">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedImage(dealer.frontCnicImage);
                              setImageTitle(`${dealer.name} CNIC Front Side`);
                            }}
                            className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-lg text-indigo-700 hover:bg-indigo-600 hover:text-white transition text-xs font-semibold shadow-sm"
                          >
                            View Front
                          </button>
                          <button
                            onClick={() => {
                              setSelectedImage(dealer.backCnicImage);
                              setImageTitle(`${dealer.name} CNIC Back Side`);
                            }}
                            className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-lg text-indigo-700 hover:bg-indigo-600 hover:text-white transition text-xs font-semibold shadow-sm"
                          >
                            View Back
                          </button>
                        </div>
                      </td>
                      <td className="p-4 sm:p-5">
                        {getStatusBadge(dealer)}
                      </td>
                      <td className="p-4 sm:p-5 text-center">
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          {/* Agreement and Edit options visible ONLY if approved */}
                          {dealer.status === 'approved' && (
                            <>
                              <button
                                onClick={() => setSelectedAgreementDealer(dealer)}
                                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition text-xs shadow-md flex items-center gap-1"
                                title="View Partnership Agreement"
                              >
                                <span>📜</span> Agreement
                              </button>

                            </>
                          )}

                          {dealer.status !== 'approved' && (
                            <>
                              <button
                                disabled={actionLoading === dealer.id}
                                onClick={() => handleStatusChange(dealer.id, 'approved')}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition disabled:opacity-40 text-xs shadow-md"
                              >
                                {actionLoading === dealer.id ? 'Processing...' : 'Accept'}
                              </button>
                              <button
                                disabled={actionLoading === dealer.id || dealer.status === 'rejected'}
                                onClick={() => handleStatusChange(dealer.id, 'rejected')}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition disabled:opacity-40 text-xs shadow-md"
                              >
                                {actionLoading === dealer.id ? 'Processing...' : 'Reject'}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                <span className="text-xs text-gray-600 font-semibold">
                  Showing page {currentPage} of {totalPages} ({filteredDealers.length} total records)
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition disabled:opacity-40 border border-gray-300 shadow-sm"
                  >
                    &larr; Previous
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition disabled:opacity-40 shadow-sm"
                  >
                    Next &rarr;
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      </div>

      {/* FULLSCREEN IMAGE ZOOM MODAL */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full p-6 relative shadow-2xl border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="font-bold text-black text-sm sm:text-base">{imageTitle}</h3>
              <button
                onClick={() => setSelectedImage(null)}
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 text-black flex items-center justify-center font-bold text-sm transition"
              >
                ✕
              </button>
            </div>

            <div className="flex justify-center items-center bg-gray-100 rounded-2xl p-2 max-h-[75vh] overflow-hidden">
              <img
                src={selectedImage}
                alt="CNIC Document Preview"
                className="max-h-[65vh] w-auto object-contain rounded-xl border border-gray-300 shadow-md"
              />
            </div>
          </div>
        </div>
      )}

      {/* EDIT DEALER MODAL */}
      {editingDealer && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setEditingDealer(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl border border-gray-200 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 pb-3 border-b">
              <h3 className="font-extrabold text-black text-lg">✏️ Edit Approved Dealer</h3>
              <button
                onClick={() => setEditingDealer(null)}
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 text-black flex items-center justify-center font-bold text-sm transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateDealer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditChange}
                  required
                  className="w-full border border-gray-300 p-2.5 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditChange}
                  required
                  className="w-full border border-gray-300 p-2.5 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Company / Agency Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={editFormData.companyName}
                  onChange={handleEditChange}
                  required
                  className="w-full border border-gray-300 p-2.5 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Company Address</label>
                <input
                  type="text"
                  name="companyAddress"
                  value={editFormData.companyAddress}
                  onChange={handleEditChange}
                  required
                  className="w-full border border-gray-300 p-2.5 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={editFormData.phoneNumber}
                    onChange={handleEditChange}
                    required
                    className="w-full border border-gray-300 p-2.5 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">CNIC Number</label>
                  <input
                    type="text"
                    name="cnicNumber"
                    value={editFormData.cnicNumber}
                    onChange={handleEditChange}
                    required
                    className="w-full border border-gray-300 p-2.5 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <button
                  type="button"
                  onClick={() => setEditingDealer(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === editingDealer.id}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-md disabled:opacity-50"
                >
                  {actionLoading === editingDealer.id ? 'Updating...' : 'Update Dealer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AGREEMENT MODAL (SAME PAGE POPUP) */}
      {selectedAgreementDealer && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedAgreementDealer(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-10 relative shadow-2xl border border-gray-200 my-8 font-serif max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Actions */}
            <div className="flex justify-between items-center mb-6 pb-3 border-b print:hidden font-sans">
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-md flex items-center gap-2"
              >
                🖨️ Print / Save as PDF
              </button>
              <button
                onClick={() => setSelectedAgreementDealer(null)}
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 text-black flex items-center justify-center font-bold text-sm transition"
              >
                ✕
              </button>
            </div>

            {/* Printable Agreement Document Content */}
            <div className="space-y-6 text-black">
              {/* Header */}
              <div className="text-center border-b-2 border-indigo-900 pb-4">
                <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-indigo-950">
                  Real Estate Dealer Partnership Agreement
                </h2>
                <p className="text-xs text-gray-500 mt-1 uppercase font-sans tracking-widest">
                  Official Commission & Service Level Legal Contract
                </p>
              </div>

              {/* Date & Reference */}
              <div className="flex justify-between text-xs text-gray-600 font-sans border-b pb-2">
                <div>
                  <strong>Date of Agreement:</strong> {currentDate || 'Loading...'}
                </div>
                <div>
                  <strong>Contract Ref:</strong> DLR-AGR-{contractNo || '------'}
                </div>
              </div>

              {/* Parties Intro */}
              <div className="space-y-3 text-sm text-gray-800 leading-relaxed font-sans">
                <p>
                  This <strong>Partnership & Service Level Agreement</strong> ("Agreement") is made and executed on <strong>{currentDate || '...'}</strong>, by and between:
                </p>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <p className="font-bold text-indigo-900 uppercase">Party A (The Platform / Company):</p>
                    <p className="font-semibold text-gray-900">ChironProperties Real Estate Network Pvt Ltd</p>
                    <p className="text-gray-600">Central Portal Management Office</p>
                  </div>
                  <div className="space-y-1 border-t md:border-t-0 md:border-l border-gray-300 pt-2 md:pt-0 md:pl-4">
                    <p className="font-bold text-indigo-900 uppercase">Party B (The Authorized Dealer):</p>
                    <p><strong>Dealer Name:</strong> <span className="text-indigo-950 font-bold">{selectedAgreementDealer.name}</span></p>
                    <p><strong>Agency Name:</strong> {selectedAgreementDealer.companyName}</p>
                    <p><strong>CNIC No:</strong> {selectedAgreementDealer.cnicNumber}</p>
                    <p><strong>Contact No:</strong> {selectedAgreementDealer.phoneNumber}</p>
                    <p><strong>Address:</strong> {selectedAgreementDealer.companyAddress}</p>
                  </div>
                </div>
              </div>

              {/* Terms & Conditions Body */}
              <div className="space-y-4 text-xs text-gray-800 leading-relaxed">
                <h3 className="font-bold text-sm text-indigo-950 border-b pb-1 font-sans">
                  Operational Terms & Legal Clauses
                </h3>

                <ol className="list-decimal pl-5 space-y-2">
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
              <div className="mt-8 pt-6 border-t-2 border-gray-300 grid grid-cols-2 gap-8 font-sans">
                <div className="space-y-10">
                  <div className="border-b border-gray-400 pb-1">
                    <p className="text-xs text-gray-500 font-bold uppercase">Authorized Representative (ChironProperties)</p>
                  </div>
                  <div className="text-xs space-y-1 text-gray-700">
                    <p><strong>Signature:</strong> ______________________</p>
                    <p><strong>Stamp:</strong></p>
                  </div>
                </div>

                <div className="space-y-10">
                  <div className="border-b border-gray-400 pb-1">
                    <p className="text-xs text-gray-500 font-bold uppercase">Authorized Dealer Signature (Party B)</p>
                  </div>
                  <div className="text-xs space-y-1 text-gray-700">
                    <p><strong>Name:</strong> {selectedAgreementDealer.name}</p>
                    <p><strong>Signature:</strong> ______________________</p>
                    <p><strong>Thumb Impression:</strong></p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 text-center text-[10px] text-gray-400 border-t pt-3 font-sans">
                ChironProperties Real Estate Dealer Network • Confidential Partnership Legal Agreement Document
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}