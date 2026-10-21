'use client';

import { useEffect, useState } from 'react';

export default function DealersManagementPage() {
  const [dealers, setDealers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State for Image Viewer
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageTitle, setImageTitle] = useState<string>('');

  // Modal State for Editing Dealer
  const [editingDealer, setEditingDealer] = useState<any | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    companyName: '',
    companyAddress: '',
    phoneNumber: '',
    cnicNumber: '',
    frontCnicImage: '',
    backCnicImage: '',
  });

  // Fetch All Dealers from GET API
  const fetchDealers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/crmdealers');
      const result = await res.json();
      if (res.ok) {
        setDealers(result.data || []);
      } else {
        setError(result.error || 'Failed to fetch dealers.');
      }
    } catch (err) {
      setError('Network error while fetching dealers list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDealers();
  }, []);

  // Toggle Active / Inactive Status Directly
  const toggleActiveStatus = async (id: number, currentIsActive: boolean) => {
    setActionLoading(id);
    setError('');

    try {
      const res = await fetch(`/api/crmdealers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentIsActive }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Failed to toggle active status.');
      } else {
        fetchDealers();
      }
    } catch (err) {
      setError('Network error during status update.');
    } finally {
      setActionLoading(null);
    }
  };

  // Open Edit Modal & Load Data
  const openEditModal = (dealer: any) => {
    setEditingDealer(dealer);
    setEditFormData({
      name: dealer.name || '',
      email: dealer.email || '',
      companyName: dealer.companyName || '',
      companyAddress: dealer.companyAddress || '',
      phoneNumber: dealer.phoneNumber || '',
      cnicNumber: dealer.cnicNumber || '',
      frontCnicImage: dealer.frontCnicImage || '',
      backCnicImage: dealer.backCnicImage || '',
    });
  };

  // Handle File Browse & Direct Cloudinary Upload
  const handleFileBrowseAndUpload = async (e: React.ChangeEvent<HTMLInputElement>, imageType: 'frontCnicImage' | 'backCnicImage') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setEditFormData((prev) => ({ ...prev, [imageType]: result.url }));
      } else {
        setError(result.error || 'Failed to upload image to Cloudinary.');
      }
    } catch (err) {
      setError('Network error during image upload.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Submit Updated Dealer Data
  const handleUpdateDealer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDealer) return;

    setActionLoading(editingDealer.id);
    setError('');

    try {
      const res = await fetch(`/api/crmdealers/${editingDealer.id}`, {
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

  // Search Filter
  const filteredDealers = dealers.filter((d) =>
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.phoneNumber?.includes(searchTerm)
  );

  return (
    <div className="min-h-screen text-black p-6 sm:p-10 mt-[80px] bg-gray-50">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-black">Dealers Directory & Controls</h1>
            <p className="text-gray-600 text-xs sm:text-sm mt-1">Manage, edit, activate, or deactivate dealer accounts.</p>
          </div>
          <button
            onClick={fetchDealers}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-md"
          >
            🔄 Refresh List
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <input
            type="text"
            placeholder="Search by Dealer Name, Company, Email or Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-xl text-black text-xs font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* Dealers Table */}
        {loading ? (
          <div className="text-center py-20 text-gray-700 font-medium">Loading registered dealers...</div>
        ) : filteredDealers.length === 0 ? (
          <div className="text-center py-20 text-gray-600 rounded-3xl border border-gray-200 bg-white shadow-sm">
            No dealer records found matching your query.
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-3xl border border-gray-200 shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-700 text-xs uppercase tracking-wider bg-gray-100">
                  <th className="p-4 sm:p-5">Dealer Name</th>
                  <th className="p-4 sm:p-5">Company & Address</th>
                  <th className="p-4 sm:p-5">Contact Details</th>
                  <th className="p-4 sm:p-5">CNIC Documents</th>
                  <th className="p-4 sm:p-5">Approval / Status</th>
                  <th className="p-4 sm:p-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-xs sm:text-sm">
                {filteredDealers.map((dealer) => (
                  <tr key={dealer.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 sm:p-5 font-bold text-black">
                      {dealer.name}
                      <div className="text-gray-500 text-xs font-normal">{dealer.email}</div>
                    </td>
                    <td className="p-4 sm:p-5">
                      <div className="font-semibold text-indigo-700">{dealer.companyName}</div>
                      <div className="text-gray-600 text-xs">{dealer.companyAddress}</div>
                    </td>
                    <td className="p-4 sm:p-5">
                      <div className="font-mono text-black font-semibold">{dealer.phoneNumber}</div>
                      <div className="text-gray-500 text-xs">{dealer.cnicNumber}</div>
                    </td>
                    {/* CNIC View Buttons */}
                    <td className="p-4 sm:p-5">
                      <div className="flex gap-2">
                        {dealer.frontCnicImage ? (
                          <button
                            onClick={() => {
                              setSelectedImage(dealer.frontCnicImage);
                              setImageTitle(`${dealer.name} - CNIC Front Side`);
                            }}
                            className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-600 hover:text-white transition shadow-sm"
                          >
                            Front
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs">No Front</span>
                        )}

                        {dealer.backCnicImage ? (
                          <button
                            onClick={() => {
                              setSelectedImage(dealer.backCnicImage);
                              setImageTitle(`${dealer.name} - CNIC Back Side`);
                            }}
                            className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-600 hover:text-white transition shadow-sm"
                          >
                            Back
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs">No Back</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 sm:p-5">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          dealer.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : dealer.status === 'rejected'
                            ? 'bg-red-50 text-red-700 border-red-300'
                            : 'bg-amber-50 text-amber-700 border-amber-300'
                        }`}>
                          {dealer.status}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          dealer.isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {dealer.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 sm:p-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Edit Button */}
                        <button
                          onClick={() => openEditModal(dealer)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition text-xs shadow-md flex items-center gap-1"
                        >
                          ✏️ Edit
                        </button>

                        {/* Toggle Active / Inactive Button */}
                        <button
                          disabled={actionLoading === dealer.id}
                          onClick={() => toggleActiveStatus(dealer.id, dealer.isActive)}
                          className={`px-3 py-1.5 font-bold rounded-xl transition text-xs shadow-md disabled:opacity-40 ${
                            dealer.isActive
                              ? 'bg-amber-600 hover:bg-amber-500 text-white'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          }`}
                        >
                          {actionLoading === dealer.id
                            ? 'Updating...'
                            : dealer.isActive
                            ? 'Make Inactive'
                            : 'Make Active'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CLOUDINARY IMAGE ZOOM POPUP MODAL */}
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
                alt="Cloudinary CNIC Document Preview"
                className="max-h-[65vh] w-auto object-contain rounded-xl border border-gray-300 shadow-md"
              />
            </div>
          </div>
        </div>
      )}

      {/* EDIT DEALER MODAL WITH BROWSE & UPLOAD */}
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
              <h3 className="font-extrabold text-black text-lg">✏️ Edit Dealer Profile</h3>
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
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
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
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
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
                  onChange={(e) => setEditFormData({ ...editFormData, companyName: e.target.value })}
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
                  onChange={(e) => setEditFormData({ ...editFormData, companyAddress: e.target.value })}
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
                    onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
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
                    onChange={(e) => setEditFormData({ ...editFormData, cnicNumber: e.target.value })}
                    required
                    className="w-full border border-gray-300 p-2.5 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* BROWSE & UPLOAD FOR CNIC FRONT IMAGE */}
              <div className="p-3 bg-gray-50 border rounded-2xl space-y-2">
                <label className="block text-xs font-bold text-indigo-900">CNIC Front Side Image</label>
                {editFormData.frontCnicImage && (
                  <div className="text-[11px] text-emerald-700 font-semibold truncate">
                    ✓ Link Active: {editFormData.frontCnicImage}
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileBrowseAndUpload(e, 'frontCnicImage')}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>

              {/* BROWSE & UPLOAD FOR CNIC BACK IMAGE */}
              <div className="p-3 bg-gray-50 border rounded-2xl space-y-2">
                <label className="block text-xs font-bold text-indigo-900">CNIC Back Side Image</label>
                {editFormData.backCnicImage && (
                  <div className="text-[11px] text-emerald-700 font-semibold truncate">
                    ✓ Link Active: {editFormData.backCnicImage}
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileBrowseAndUpload(e, 'backCnicImage')}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>

              {uploadingImage && (
                <div className="text-center text-xs font-bold text-indigo-600 animate-pulse">
                  Uploading image to Cloudinary... Please wait ⏳
                </div>
              )}

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
                  disabled={actionLoading === editingDealer.id || uploadingImage}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-md disabled:opacity-50"
                >
                  {actionLoading === editingDealer.id ? 'Updating...' : 'Update Dealer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}