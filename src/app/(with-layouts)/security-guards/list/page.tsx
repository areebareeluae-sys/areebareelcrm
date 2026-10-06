'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ShieldCheck, Search, FileText, Download, X, ArrowLeft, Phone, Building } from 'lucide-react';
import Link from 'next/link';

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

export default function SecurityGuardsListPage() {
  const [guards, setGuards] = useState<SecurityGuard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination States (10 rows per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // PDF View Modals States
  const [viewPdfGuard, setViewPdfGuard] = useState<SecurityGuard | null>(null);
  const [guardDocuments, setGuardDocuments] = useState<DocumentItem[]>([]);
  const [fetchingDocs, setFetchingDocs] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);

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

  // Fetch Documents for View PDF Modal
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
              Security Guards & Buildings List (View Only)
            </h1>
            <p className="text-xs text-gray-500 mt-1">Explore buildings, assigned security guards, status, and attached documents.</p>
          </div>
          <Link 
            href="/security-guards"
            className="px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-sm transition"
          >
            ← Back to Management
          </Link>
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

        {/* Data View Table */}
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
                  <th className="p-4 text-right">Documents View</th>
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
                        <button
                          onClick={() => handleOpenViewPdf(guard)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 transition"
                        >
                          <FileText className="w-3.5 h-3.5" /> View PDF
                        </button>
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

      {/* VIEW PDF MODAL (With In-Popup Iframe Viewer & Download) */}
      {viewPdfGuard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-2">
                {previewPdfUrl && (
                  <button 
                    onClick={() => setPreviewPdfUrl(null)} 
                    className="p-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-700 transition flex items-center gap-1 text-xs font-semibold"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to List
                  </button>
                )}
                <h3 className="text-sm font-bold text-gray-900">
                  {previewPdfUrl ? 'Viewing PDF Preview' : `Documents: ${viewPdfGuard.buildingName}`}
                </h3>
              </div>
              <button 
                onClick={() => setViewPdfGuard(null)} 
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-200/60 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {previewPdfUrl ? (
                <div className="w-full h-[500px] border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                  <iframe
                    src={`https://docs.google.com/gview?url=${encodeURIComponent(previewPdfUrl)}&embedded=true`}
                    className="w-full h-full border-0"
                    title="PDF Viewer"
                  />
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  {fetchingDocs ? (
                    <p className="text-center py-10 text-gray-400">Documents load ho rahe hain...</p>
                  ) : guardDocuments.length === 0 ? (
                    <p className="text-center py-10 text-gray-400">Is building ki koi document/PDF maujood nahi hai.</p>
                  ) : (
                    guardDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100/50 transition">
                        <div>
                          <p className="font-semibold text-gray-900">{doc.title || 'Document PDF'}</p>
                          <p className="text-[10px] text-gray-400">{new Date(doc.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPreviewPdfUrl(doc.fileUrl)}
                            className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-100 transition"
                          >
                            View
                          </button>
                          
                          <button
                            onClick={async () => {
                              try {
                                const response = await fetch(doc.fileUrl);
                                const blob = await response.blob();
                                const blobUrl = window.URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = blobUrl;
                                link.download = `${doc.title || 'document'}.pdf`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                window.URL.revokeObjectURL(blobUrl);
                              } catch (err) {
                                window.open(doc.fileUrl, '_blank');
                              }
                            }}
                            className="px-3 py-1.5 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition inline-flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" /> Download
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
              {previewPdfUrl ? (
                <button
                  onClick={() => setPreviewPdfUrl(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-semibold transition"
                >
                  Back to List
                </button>
              ) : <div />}
              <button
                onClick={() => setViewPdfGuard(null)}
                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-semibold transition"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}