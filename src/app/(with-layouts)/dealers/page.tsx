'use client';

import { useEffect, useState } from 'react';

export default function AdminDealersPage() {
  const [dealers, setDealers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState('');

  // Filter & Pagination States
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected, active, inactive
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal State for Image Viewer
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageTitle, setImageTitle] = useState<string>('');

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

  // Handle Status Update (Accept / Reject / Active / Inactive)
  const handleStatusChange = async (id: number, newStatus: string, newIsActive?: boolean) => {
    setActionLoading(id);
    setError('');

    try {
      const payload: any = { id, status: newStatus };
      if (newIsActive !== undefined) {
        payload.isActive = newIsActive;
      }

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

  // Counts Calculation
  const counts = {
    all: dealers.length,
    pending: dealers.filter((d) => d.status === 'pending').length,
    approved: dealers.filter((d) => d.status === 'approved').length,
    rejected: dealers.filter((d) => d.status === 'rejected').length,
    active: dealers.filter((d) => d.status === 'approved' && d.isActive === true).length,
    inactive: dealers.filter((d) => d.status === 'approved' && d.isActive === false).length,
  };

  // Filter Logic
  const filteredDealers = dealers.filter((dealer) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return dealer.status === 'pending';
    if (filter === 'approved') return dealer.status === 'approved';
    if (filter === 'rejected') return dealer.status === 'rejected';
    if (filter === 'active') return dealer.status === 'approved' && dealer.isActive === true;
    if (filter === 'inactive') return dealer.status === 'approved' && dealer.isActive === false;
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
        <div className="flex flex-col gap-1 items-start">
          <span className="bg-emerald-500/20 text-emerald-700 border border-emerald-500 px-3 py-1 rounded-full text-xs font-bold uppercase">
            Accepted
          </span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${dealer.isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'}`}>
            {dealer.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
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
            <p className="text-gray-700 text-xs sm:text-sm mt-1">Review, accept, or reject dealer registration applications.</p>
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
            { id: 'active', label: 'Active', count: counts.active },
            { id: 'inactive', label: 'Inactive', count: counts.inactive },
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
                              setImageTitle(`${dealer.name} - CNIC Front Side`);
                            }}
                            className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-lg text-indigo-700 hover:bg-indigo-600 hover:text-white transition text-xs font-semibold shadow-sm"
                          >
                            View Front
                          </button>
                          <button
                            onClick={() => {
                              setSelectedImage(dealer.backCnicImage);
                              setImageTitle(`${dealer.name} - CNIC Back Side`);
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
                        <div className="flex items-center justify-center gap-2">
                          {dealer.status !== 'approved' ? (
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
                          ) : (
                            <button
                              disabled={actionLoading === dealer.id}
                              onClick={() => handleStatusChange(dealer.id, 'approved', !dealer.isActive)}
                              className={`px-3 py-1.5 font-bold rounded-xl transition disabled:opacity-40 text-xs shadow-md ${
                                dealer.isActive
                                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                                  : 'bg-blue-600 hover:bg-blue-500 text-white'
                              }`}
                            >
                              {actionLoading === dealer.id
                                ? 'Processing...'
                                : dealer.isActive
                                ? 'Make Inactive'
                                : 'Make Active'}
                            </button>
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

    </div>
  );
}