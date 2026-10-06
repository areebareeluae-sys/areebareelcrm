'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ShieldCheck, Plus, Search, Trash2, Edit3, FileText, Upload, Download, X, ArrowLeft, Phone, Building } from 'lucide-react';

interface SecurityGuard {
  id: string;
  buildingNo: number;
  buildingName: string;
  securityGuard: string;
  contactNumber: string;
  description: string;
  constructionStatus: string;
  tags: string;
  createdAt: string;
}

interface DocumentItem {
  id: string;
  tableName: string;
  entityId: string;
  fileUrl: string;
  title: string | null;
  createdAt: string;
}

export default function SecurityGuardsPage() {
  const [guards, setGuards] = useState<SecurityGuard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // 👈 10 rows per page

  // Add / Edit Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuard, setEditingGuard] = useState<SecurityGuard | null>(null);

  // Form Fields State
  const [buildingNo, setBuildingNo] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [securityGuard, setSecurityGuard] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [description, setDescription] = useState('');
  const [constructionStatus, setConstructionStatus] = useState('Completed');
  const [tags, setTags] = useState('');

  // PDF Modals States
  const [viewPdfGuard, setViewPdfGuard] = useState<SecurityGuard | null>(null);
  const [guardDocuments, setGuardDocuments] = useState<DocumentItem[]>([]);
  const [fetchingDocs, setFetchingDocs] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);

  const [uploadPdfGuard, setUploadPdfGuard] = useState<SecurityGuard | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  useEffect(() => {
    fetchGuards();
  }, []);

  async function fetchGuards() {
    setLoading(true);
    try {
      const res = await fetch('/api/security-guards');
      const result = await res.json();
      if (result.success) {
        setGuards(result.data);
      }
    } catch (error) {
      console.error('Error fetching guards:', error);
    } finally {
      setLoading(false);
    }
  }

  // Open Add Modal
  function handleOpenAdd() {
    setEditingGuard(null);
    setBuildingNo('');
    setBuildingName('');
    setSecurityGuard('');
    setContactNumber('');
    setDescription('');
    setConstructionStatus('Completed');
    setTags('');
    setIsModalOpen(true);
  }

  // Open Edit Modal
  function handleOpenEdit(guard: SecurityGuard) {
    setEditingGuard(guard);
    setBuildingNo(guard.buildingNo.toString());
    setBuildingName(guard.buildingName);
    setSecurityGuard(guard.securityGuard);
    setContactNumber(guard.contactNumber);
    setDescription(guard.description || '');
    setConstructionStatus(guard.constructionStatus);
    setTags(guard.tags || '');
    setIsModalOpen(true);
  }

  // Save / Update Guard Submit
  async function handleSaveGuard(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      id: editingGuard ? editingGuard.id : Date.now().toString(),
      buildingNo: Number(buildingNo),
      buildingName,
      securityGuard,
      contactNumber,
      description,
      constructionStatus,
      tags,
    };

    try {
      const url = editingGuard ? `/api/security-guards/${editingGuard.id}` : '/api/security-guards';
      const method = editingGuard ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (result.success) {
        alert(editingGuard ? 'Guard updated successfully!' : 'Guard added successfully!');
        setIsModalOpen(false);
        fetchGuards();
      } else {
        alert(result.error || 'Failed to save guard.');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save guard.');
    }
  }

  // Delete Guard
  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this security guard entry?')) return;
    try {
      const res = await fetch(`/api/security-guards/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        setGuards(guards.filter(g => g.id !== id));
      } else {
        alert('Failed to delete.');
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  }

  // Fetch Documents for View Modal
  async function handleOpenViewPdf(guard: SecurityGuard) {
    setViewPdfGuard(guard);
    setPreviewPdfUrl(null);
    setFetchingDocs(true);
    try {
      const res = await fetch(`/api/documents?tableName=security_guards&entityId=${guard.id}`);
      const result = await res.json();
      if (result.success) {
        setGuardDocuments(result.data);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setFetchingDocs(false);
    }
  }

  // Upload PDF Submit
  async function handleUploadPdfSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!uploadPdfGuard || !pdfFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('tableName', 'security_guards');
      formData.append('entityId', uploadPdfGuard.id);
      formData.append('title', pdfTitle || pdfFile.name);
      formData.append('file', pdfFile);

      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();

      if (result.success) {
        alert('PDF uploaded successfully!');
        setUploadPdfGuard(null);
        setPdfFile(null);
        setPdfTitle('');
      } else {
        alert(result.error || 'Failed to upload PDF');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload PDF');
    } finally {
      setUploading(false);
    }
  }

  // Filter & Pagination Logic
  const filteredGuards = useMemo(() => {
    return guards.filter(g => 
      g.buildingName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.securityGuard.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.contactNumber.includes(searchQuery)
    );
  }, [guards, searchQuery]);

  const totalPages = Math.ceil(filteredGuards.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentGuards = filteredGuards.slice(startIndex, startIndex + itemsPerPage);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to page 1 on search
  };

  return (
    <div className="min-h-screen bg-gray-50/60 p-6 md:p-8 space-y-6 text-gray-900">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              Security Guards & Buildings Management
            </h1>
            <p className="text-xs text-gray-500 mt-1">Manage buildings, assigned security guards, contact numbers, and documentation.</p>
          </div>
          <button 
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Security Guard Entry
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search by building name, guard, or contact..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 pl-10 pr-4 py-2.5 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
            />
          </div>
        </div>

        {/* Table List */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/75 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="p-4">Building No & Name</th>
                  <th className="p-4">Security Guard</th>
                  <th className="p-4">Contact Number</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Description</th>
                  <th className="p-4 text-right">Actions & Documents</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400 font-medium">Loading records...</td>
                  </tr>
                ) : currentGuards.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400 font-medium">No security guard records found.</td>
                  </tr>
                ) : (
                  currentGuards.map((guard) => (
                    <tr key={guard.id} className="hover:bg-gray-50/60 transition">
                      <td className="p-4 font-bold text-gray-900">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-indigo-500" />
                          <span>#{guard.buildingNo} - {guard.buildingName}</span>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-gray-800">{guard.securityGuard}</td>
                      <td className="p-4 text-gray-600 flex items-center gap-1.5 pt-5">
                        <Phone className="w-3.5 h-3.5 text-gray-400" /> {guard.contactNumber}
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                          {guard.constructionStatus}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 max-w-xs truncate">{guard.description || 'N/A'}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            onClick={() => handleOpenViewPdf(guard)}
                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 transition"
                          >
                            <FileText className="w-3 h-3" /> View PDF
                          </button>
                          <button
                            onClick={() => setUploadPdfGuard(guard)}
                            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 transition"
                          >
                            <Upload className="w-3 h-3" /> Upload
                          </button>
                          <button
                            onClick={() => handleOpenEdit(guard)}
                            className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 transition"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(guard.id)}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 transition"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 p-4 border-t bg-gray-50/50">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-xl border text-xs font-semibold bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                ← Previous
              </button>

              <span className="text-xs font-medium text-gray-600 px-3">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-xl border text-xs font-semibold bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                Next →
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-lg overflow-hidden space-y-4">
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">{editingGuard ? 'Edit Security Guard Entry' : 'Add Security Guard Entry'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveGuard} className="px-6 py-3 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Building No</label>
                  <input type="number" required value={buildingNo} onChange={e => setBuildingNo(e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. 101" />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Building Name</label>
                  <input type="text" required value={buildingName} onChange={e => setBuildingName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Sapphire Tower" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Security Guard Name</label>
                  <input type="text" required value={securityGuard} onChange={e => setSecurityGuard(e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Guard Full Name" />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Contact Number</label>
                  <input type="text" required value={contactNumber} onChange={e => setContactNumber(e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="+92 300 0000000" />
                </div>
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={2} value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Add any details or description..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Construction Status</label>
                  <select value={constructionStatus} onChange={e => setConstructionStatus(e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="Completed">Completed</option>
                    <option value="Under Construction">Under Construction</option>
                    <option value="Renovation">Renovation</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Tags</label>
                  <input type="text" value={tags} onChange={e => setTags(e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="vip, block-a" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW PDF MODAL */}
      {viewPdfGuard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-2">
                {previewPdfUrl && (
                  <button onClick={() => setPreviewPdfUrl(null)} className="p-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-700 transition flex items-center gap-1 text-xs font-semibold">
                    <ArrowLeft className="w-4 h-4" /> Back to List
                  </button>
                )}
                <h3 className="text-sm font-bold text-gray-900">{previewPdfUrl ? 'Viewing PDF Preview' : `Documents: ${viewPdfGuard.buildingName}`}</h3>
              </div>
              <button onClick={() => setViewPdfGuard(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {previewPdfUrl ? (
                <div className="w-full h-[500px] border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                  <iframe src={`https://docs.google.com/gview?url=${encodeURIComponent(previewPdfUrl)}&embedded=true`} className="w-full h-full border-0" title="PDF Viewer" />
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  {fetchingDocs ? (
                    <p className="text-center py-10 text-gray-400">Loading documents...</p>
                  ) : guardDocuments.length === 0 ? (
                    <p className="text-center py-10 text-gray-400">No documents attached for this building yet.</p>
                  ) : (
                    guardDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl">
                        <div>
                          <p className="font-semibold text-gray-900">{doc.title || 'Document PDF'}</p>
                          <p className="text-[10px] text-gray-400">{new Date(doc.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setPreviewPdfUrl(doc.fileUrl)} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-100 transition">View</button>
                          <button onClick={async () => {
                            const res = await fetch(doc.fileUrl);
                            const blob = await res.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${doc.title || 'document'}.pdf`;
                            a.click();
                          }} className="px-3 py-1.5 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition inline-flex items-center gap-1">
                            <Download className="w-3 h-3" /> Download
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-right">
              <button onClick={() => setViewPdfGuard(null)} className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-semibold">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD PDF MODAL */}
      {uploadPdfGuard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md overflow-hidden space-y-4">
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">Upload PDF for {uploadPdfGuard.buildingName}</h3>
              <button onClick={() => setUploadPdfGuard(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleUploadPdfSubmit} className="px-6 py-3 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Document Title</label>
                <input type="text" placeholder="e.g. Guard Duty Agreement" value={pdfTitle} onChange={(e) => setPdfTitle(e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Select PDF File</label>
                <input type="file" accept=".pdf" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100" required />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setUploadPdfGuard(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold">Cancel</button>
                <button type="submit" disabled={uploading} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold disabled:opacity-50">
                  {uploading ? 'Uploading...' : 'Upload to Cloudinary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}