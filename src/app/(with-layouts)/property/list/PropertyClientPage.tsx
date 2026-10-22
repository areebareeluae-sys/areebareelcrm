'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import PropertyReferralModal from '@/components/PropertyReferralModal';
import { FileText, Upload,  Video, Plus, Download, X, ArrowLeft } from 'lucide-react';
interface DocumentItem {
  id: string;
  tableName: string;
  entityId: string;
  fileUrl: string;
  title: string | null;
  createdAt: string;
}

export default function AllPropertiesPage({ initialProperties = [] }: { initialProperties: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // PDF Modals States (Customer style)
  const [viewPdfProperty, setViewPdfProperty] = useState<any | null>(null);
  const [propertyDocuments, setPropertyDocuments] = useState<DocumentItem[]>([]);
  const [fetchingDocs, setFetchingDocs] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);

  const [uploadPdfProperty, setUploadPdfProperty] = useState<any | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // Real-time filtering logic
  const filteredProperties = useMemo(() => {
    return initialProperties.filter((property: any) => {
      const term = searchQuery.toLowerCase().trim();
      
      let tagsList: string[] = [];
      try {
        tagsList = JSON.parse(property.tags || '[]');
      } catch {
        tagsList = [];
      }

      const matchesSearch = 
        !term ||
        property.title?.toLowerCase().includes(term) ||
        property.city?.toLowerCase().includes(term) ||
        property.address?.toLowerCase().includes(term) ||
        property.category?.toLowerCase().includes(term) ||
        property.id?.toLowerCase().includes(term) ||
        tagsList.some((tag: string) => tag.toLowerCase().includes(term));

      const matchesCountry = 
        !selectedCountry || property.country === selectedCountry;

      return matchesSearch && matchesCountry;
    });
  }, [initialProperties, searchQuery, selectedCountry]);


  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProperties = filteredProperties.slice(startIndex, startIndex + itemsPerPage);
const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadVideoProperty, setUploadVideoProperty] = useState<any>(null);
  const [viewVideoProperty, setViewVideoProperty] = useState<any>(null);
  const [propertyVideos, setPropertyVideos] = useState<any[]>([]);
  const [fetchingVideos, setFetchingVideos] = useState(false);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);
 const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountry(e.target.value);
    setCurrentPage(1);
  };
async function handleDeleteDocument(docId: string) {
    if (!confirm('Are you agree Delete this Document? ')) return;

    setDeletingId(docId); // <--- Is document ID ke liye loading start ho jayegi
    try {
      const res = await fetch(`/api/documents?id=${docId}`, {
        method: 'DELETE',
      });
      const result = await res.json();

      if (result.success) {
        alert('Document deleted successfully!');
        
        // Page refresh ya state update
          setViewPdfProperty(null)

      } else {
        alert(result.error || 'Failed to delete document');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete document');
    } finally {
      setDeletingId(null); // <--- Loading khatam
    }
  }
  // Fetch Documents when View PDF modal opens
  async function handleOpenViewPdf(property: any) {
    setViewPdfProperty(property);
    setPreviewPdfUrl(null);
    setFetchingDocs(true);
    try {
      const res = await fetch(`/api/documents?tableName=property&entityId=${property.id}`);
      const result = await res.json();
      if (result.success) {
        setPropertyDocuments(result.data);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setFetchingDocs(false);
    }
  }

  // Handle Upload PDF Submit
async function handleUploadPdfSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!uploadPdfProperty || !pdfFile) return;

    setUploading(true);
    try {
      // 1. Prepare FormData for Direct Cloudinary Upload
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', pdfFile);
      cloudinaryFormData.append('upload_preset', 'real_estate_albums'); // <--- Yahan apna unsigned preset name dalein
      cloudinaryFormData.append('folder', 'crm_documents');

      // Filename cleanup
      const originalNameWithoutExt = pdfFile.name.replace(/\.[^/.]+$/, "");
      const safePublicId = originalNameWithoutExt
        .replace(/[^a-zA-Z0-9_\-]/g, "_")
        .replace(/_+/g, "_");
      cloudinaryFormData.append('public_id', safePublicId);

      // 2. Direct upload to Cloudinary (Bypass Next.js server limits)
      const cloudName = "y556pcib"; // Aapka cloud name
      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
        {
          method: 'POST',
          body: cloudinaryFormData,
        }
      );

      const cloudinaryData = await cloudinaryRes.json();

      if (!cloudinaryRes.ok) {
        throw new Error(cloudinaryData.error?.message || 'Cloudinary upload failed');
      }

      // 3. Save metadata (secure_url) to your Database via your API
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableName: 'property',
          entityId: uploadPdfProperty.id,
          title: pdfTitle || pdfFile.name,
          fileUrl: cloudinaryData.secure_url,
        }),
      });

      const result = await res.json();

      if (result.success) {
        alert('PDF uploaded successfully!');
        setUploadPdfProperty(null);
        setPdfFile(null);
        setPdfTitle('');
      } else {
        alert(result.error || 'Failed to save document details');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(error.message || 'Failed to upload PDF');
    } finally {
      setUploading(false);
    }
  }
// YouTube Video States

  // Fetch Videos when View Video modal opens

  async function handleAddVideoSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!uploadVideoProperty || !videoUrl) return;

    if (!videoUrl.includes('youtube.com') && !videoUrl.includes('youtu.be')) {
      alert('Please enter a valid YouTube video URL!');
      return;
    }

    setUploadingVideo(true);
    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableName: 'property',
          entityId: uploadVideoProperty.id,
          title: videoTitle || 'Property Video',
          fileUrl: videoUrl.trim(),
        }),
      });

      const result = await res.json();

      if (result.success) {
        alert('YouTube video link added successfully!');
        setUploadVideoProperty(null);
        setVideoUrl('');
        setVideoTitle('');
      } else {
        alert(result.error || 'Failed to save video details');
      }
    } catch (error: any) {
      console.error('Add video error:', error);
      alert('Failed to add video link');
    } finally {
      setUploadingVideo(false);
    }
  }

  async function handleOpenViewVideo(property: any) {
    setViewVideoProperty(property);
    setFetchingVideos(true);
    try {
      const res = await fetch(`/api/videos?tableName=property&entityId=${property.id}`);
      const result = await res.json();
      if (result.success) {
        setPropertyVideos(result.data);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setFetchingVideos(false);
    }
  }


  async function handleDeleteVideo(videoId: string) {
    if (!confirm('Are you sure you want to delete this video?')) return;

    setDeletingVideoId(videoId);
    try {
      const res = await fetch(`/api/videos?id=${videoId}`, {
        method: 'DELETE',
      });
      const result = await res.json();

      if (result.success) {
        alert('Video deleted successfully!');
        // UI State update: List se remove karein bina poora page refresh kiye
        setPropertyVideos((prev) => prev.filter((v) => v.id !== videoId));
      } else {
        alert(result.error || 'Failed to delete video');
      }
    } catch (error) {
      console.error('Delete video error:', error);
      alert('Failed to delete video');
    } finally {
      setDeletingVideoId(null);
    }
  }
  function getYouTubeEmbedUrl(url: string) {
  let videoId = '';
  if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0];
  } else if (url.includes('youtube.com/watch')) {
    const urlParams = new URLSearchParams(new URL(url).search);
    videoId = urlParams.get('v') || '';
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header, Search Bar & View Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-2xl border shadow-sm gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Property Listings</h1>
          <p className="text-xs text-gray-500">Manage and explore commercial and residential properties ({filteredProperties.length} found)</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap md:flex-nowrap">
          {/* Real-time Search and Country Dropdown */}
          <div className="flex gap-2 w-full md:w-auto flex-wrap md:flex-nowrap items-center">
            
            {/* Country Dropdown Filter */}
            <select
              value={selectedCountry}
              onChange={handleCountryChange}
              className="border rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Countries</option>
              <option value="Pakistan">Pakistan</option>
              <option value="UAE">UAE</option>
            </select>

            {/* Search Input */}
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search title, ID, tags, city..."
              className="border rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-56"
            />
          </div>

          {/* View Toggle Buttons (List vs Grid) */}
          <div className="flex bg-gray-100 p-1 rounded-xl border">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 List
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🔲 Grid
            </button>
          </div>
        </div>
      </div>

      {/* Properties Display Area */}
      {currentProperties.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border shadow-sm">
          <p className="text-gray-500 text-sm font-medium">No properties found.</p>
        </div>
      ) : viewMode === 'list' ? (
        /* --- COMPACT LIST VIEW (DEFAULT) --- */
        <div className="space-y-3">
          {currentProperties.map((property: any) => {
            let images: string[] = [];
            let tags: string[] = [];
            try {
              images = JSON.parse(property.images || '[]');
            } catch {
              images = [];
            }
            try {
              tags = JSON.parse(property.tags || '[]');
            } catch {
              tags = [];
            }
            const mainImage = images[0] || 'https://via.placeholder.com/400x300?text=No+Image';

            return (
              <div 
                key={property.id} 
                className="bg-white rounded-2xl border shadow-sm p-4 flex flex-col md:flex-row items-center justify-between gap-4 hover:shadow-md transition"
              >
                {/* Left: Image & Basic Info */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="relative w-28 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                    <img src={mainImage} alt={property.title} className="w-full h-full object-cover" />
                    <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md font-medium">
                      {property.type || 'Property'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/property/list/${property.id}`} className="text-sm font-bold text-gray-900 hover:text-blue-600">
                        {property.title}
                      </Link>
                      {/* ID Badge */}
                      <span className="text-[10px] font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded border">
                        ID: {property.id}
                      </span>
                      {/* Status Badge */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        property.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {property.status || 'Active'}
                      </span>
                      {property.category && (
                        <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
                          {property.category}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-500">
                      📍 {property.city}, {property.country || 'Pakistan'}
                    </p>

                    {/* Tags Display */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {tags.map((tag: string, idx: number) => (
                          <span key={idx} className="bg-blue-50 text-blue-600 text-[9px] px-2 py-0.5 rounded-md font-medium">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="text-xs font-bold text-blue-600 pt-1">
                      {property.country === 'UAE' ? 'AED' : 'PKR'} {Number(property.minprice || 0).toLocaleString()} 
                      {property.maxprice && property.maxprice !== property.minprice ? ` - ${Number(property.maxprice).toLocaleString()}` : ''}
                    </div>
                  </div>
                </div>

                {/* Middle: Stats */}
                <div className="flex items-center gap-6 text-xs text-gray-600 border-x px-6 max-md:border-none max-md:py-2">
                  <div className="text-center"><span className="font-bold text-gray-900 block">{property.bedrooms ?? 0}</span> Beds</div>
                  <div className="text-center"><span className="font-bold text-gray-900 block">{property.bathrooms ?? 0}</span> Baths</div>
                  <div className="text-center"><span className="font-bold text-gray-900 block">{property.Garages ?? 0}</span> Garages</div>
                </div>

                {/* Right: Actions (View PDF + Upload PDF + Referral + Details) */}
               <div className="flex items-center gap-1.5 w-full md:w-auto justify-end flex-wrap">
  {/* PDF Buttons */}
  <button
    onClick={() => handleOpenViewPdf(property)}
    className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 transition"
  >
    <FileText className="w-3 h-3" /> View PDF
  </button>
  <button
    onClick={() => setUploadPdfProperty(property)}
    className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 transition"
  >
    <Upload className="w-3 h-3" /> Upload PDF
  </button>

  {/* --- YouTube Video Buttons Added Here --- */}
  <button
    onClick={() => handleOpenViewVideo(property)}
    className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 transition"
  >
    <Video className="w-3 h-3" /> View Video
  </button>
  <button
    onClick={() => setUploadVideoProperty(property)}
    className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 transition"
  >
    <Plus className="w-3 h-3" /> Add Video
  </button>
  {/* -------------------------------------- */}

  <PropertyReferralModal property={property} />
  
  <Link 
    href={`/property/list/${property.id}`}
    className="bg-gray-50 text-gray-700 hover:bg-gray-100 text-xs font-semibold px-3 py-2 rounded-xl transition border"
  >
    View Details
  </Link>
</div>
              </div>
            );
          })}
        </div>
      ) : (
        /* --- COMPACT GRID VIEW --- */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {currentProperties.map((property: any) => {
            let images: string[] = [];
            let tags: string[] = [];
            try {
              images = JSON.parse(property.images || '[]');
            } catch {
              images = [];
            }
            try {
              tags = JSON.parse(property.tags || '[]');
            } catch {
              tags = [];
            }
            const mainImage = images[0] || 'https://via.placeholder.com/400x300?text=No+Image';

            return (
              <div 
                key={property.id} 
                className="bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Image Container */}
                  <div className="relative w-full h-44 bg-gray-100 overflow-hidden">
                    <img src={mainImage} alt={property.title} className="w-full h-full object-cover hover:scale-105 transition duration-300" />
                    
                    {/* Top Badges */}
                    <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                      <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-[10px] font-semibold px-2.5 py-0.5 rounded-full shadow-sm">
                        {property.type || 'Off Plan'}
                      </span>
                      {property.category && (
                        <span className="bg-indigo-600/90 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full shadow-sm">
                          {property.category}
                        </span>
                      )}
                    </div>

                    {/* Status Badge */}
                    {property.status && (
                      <span className={`absolute bottom-2 left-2 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm ${
                        property.status === 'Active' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-white'
                      }`}>
                        {property.status}
                      </span>
                    )}
                  </div>

                  {/* Content Details */}
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <Link href={`/property/list/${property.id}`}>
                        <h2 className="text-sm font-bold text-gray-900 hover:text-blue-600 transition line-clamp-1">
                          {property.title}
                        </h2>
                      </Link>
                      <span className="text-[9px] font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                        #{property.id}
                      </span>
                    </div>
                    
                    <p className="text-[11px] text-gray-500 font-medium">
                      📍 {property.city}, {property.country || 'Pakistan'}
                    </p>

                    {/* Tags Display */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tags.map((tag: string, idx: number) => (
                          <span key={idx} className="bg-blue-50 text-blue-600 text-[9px] px-2 py-0.5 rounded-md font-medium">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="text-sm font-bold text-blue-600">
                      {property.country === 'UAE' ? 'AED' : 'PKR'} {Number(property.minprice || 0).toLocaleString()} 
                      {property.maxprice && property.maxprice !== property.minprice ? ` - ${Number(property.maxprice).toLocaleString()}` : ''}
                    </div>

                    {/* PDF Action Buttons in Grid */}
                    <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                      <button
                        onClick={() => handleOpenViewPdf(property)}
                        className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 transition"
                      >
                        <FileText className="w-3 h-3" /> View PDF
                      </button>
                      <button
                        onClick={() => setUploadPdfProperty(property)}
                        className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 transition"
                      >
                        <Upload className="w-3 h-3" /> Upload PDF
                      </button>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <PropertyReferralModal property={property} />
                      <Link 
                        href={`/property/list/${property.id}`}
                        className="text-xs text-blue-600 font-semibold hover:underline"
                      >
                        Details →
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Bottom Stats Footer */}
                <div className="px-4 py-3 border-t bg-gray-50/50 grid grid-cols-3 gap-1 text-center text-[11px] text-gray-600">
                  <div><span className="font-bold text-gray-900">{property.bedrooms ?? 0}</span> Beds</div>
                  <div className="border-x"><span className="font-bold text-gray-900">{property.bathrooms ?? 0}</span> Baths</div>
                  <div><span className="font-bold text-gray-900">{property.Garages ?? 0}</span> Garages</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-6">
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

      {/* VIEW PDF MODAL (In-Popup Iframe Viewer) */}
      {viewPdfProperty && (
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
                  {previewPdfUrl ? 'Viewing PDF Preview' : `Property PDFs: ${viewPdfProperty.title}`}
                </h3>
              </div>
              <button 
                onClick={() => setViewPdfProperty(null)} 
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
                    <p className="text-center py-10 text-gray-400">Loading...</p>
                  ) : propertyDocuments.length === 0 ? (
                    <p className="text-center py-10 text-gray-400">No Records Found.</p>
                  ) : (
                    propertyDocuments.map((doc) => (
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
<button
      onClick={() => handleDeleteDocument(doc.id)}
      disabled={deletingId === doc.id} // Jab delete ho raha ho toh button disable rahay
      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
    >
      {deletingId === doc.id ? (
        <>
          {/* Chota sa loading spinner ya text */}
          <span>Deleting...</span>
        </>
      ) : (
        'Delete'
      )}
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
                onClick={() => setViewPdfProperty(null)}
                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-semibold transition"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* UPLOAD PDF MODAL */}
      {uploadPdfProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md overflow-hidden space-y-4">
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">Upload PDF for {uploadPdfProperty.title}</h3>
              <button onClick={() => setUploadPdfProperty(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUploadPdfSubmit} className="px-6 py-3 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. Agreement, Brochure PDF"
                  value={pdfTitle}
                  onChange={(e) => setPdfTitle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Select PDF File</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadPdfProperty(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload to Cloudinary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {uploadVideoProperty && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
      
      {/* Modal Header */}
      <div className="p-5 border-b flex justify-between items-center bg-gray-50">
        <div>
          <h3 className="font-bold text-gray-800 text-lg">Add YouTube Video</h3>
          <p className="text-xs text-gray-500">Property: {uploadVideoProperty.title}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setUploadVideoProperty(null);
            setVideoUrl('');
            setVideoTitle('');
          }}
          className="text-gray-400 hover:text-gray-600 text-xl font-bold px-3 py-1 rounded-lg transition"
        >
          ×
        </button>
      </div>

      {/* Modal Form */}
      <form onSubmit={handleAddVideoSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Video Title (Optional)</label>
          <input
            type="text"
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
            placeholder="e.g. Property Walkthrough / Drone Tour"
            className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">YouTube Video URL *</label>
          <input
            type="url"
            required
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <p className="text-[11px] text-gray-400 mt-1">Paste full YouTube video or youtu.be link.</p>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t mt-6">
          <button
            type="button"
            onClick={() => {
              setUploadVideoProperty(null);
              setVideoUrl('');
              setVideoTitle('');
            }}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={uploadingVideo}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
          >
            {uploadingVideo ? 'Saving Link...' : 'Save Video'}
          </button>
        </div>
      </form>

    </div>
  </div>
)}
      {viewVideoProperty && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
      
      {/* Modal Header */}
      <div className="p-5 border-b flex justify-between items-center bg-gray-50">
        <div>
          <h3 className="font-bold text-gray-800 text-lg">Property Videos</h3>
          <p className="text-xs text-gray-500">Listing: {viewVideoProperty.title}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setViewVideoProperty(null);
            setPreviewVideoUrl(null); // Video player close karne ke liye
          }}
          className="text-gray-400 hover:text-gray-600 text-xl font-bold px-3 py-1 rounded-lg transition"
        >
          ×
        </button>
      </div>

      {/* Modal Body */}
      <div className="p-6 overflow-y-auto space-y-6 flex-1">
        
        {/* Agar koi video play ho rahi hai toh uska embedded player yahan upar dikhega */}
        {previewVideoUrl && (
          <div className="bg-black rounded-xl overflow-hidden shadow-lg aspect-video relative">
            <iframe
              src={getYouTubeEmbedUrl(previewVideoUrl) || ''}
              title="YouTube video player"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <button
              type="button"
              onClick={() => setPreviewVideoUrl(null)}
              className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2.5 py-1 rounded-md shadow hover:bg-red-700 transition"
            >
              Close Player
            </button>
          </div>
        )}

        {/* Videos List */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Attached Videos List</h4>
          
          {fetchingVideos ? (
            <div className="text-center py-10 text-gray-500">Loading videos...</div>
          ) : propertyVideos.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-xl bg-gray-50 text-gray-400">
              No videos attached to this property yet.
            </div>
          ) : (
            <div className="space-y-3">
              {propertyVideos.map((video) => (
                <div 
                  key={video.id} 
                  className="p-4 border rounded-xl flex items-center justify-between bg-white hover:border-blue-300 shadow-sm transition gap-4"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="bg-red-100 text-red-600 p-3 rounded-lg flex-shrink-0">
                      {/* Play Icon / Video Symbol */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="truncate">
                      <h5 className="font-semibold text-gray-800 text-sm truncate">{video.title}</h5>
                      <a 
                        href={video.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs text-blue-500 hover:underline truncate block"
                      >
                        {video.fileUrl}
                      </a>
                    </div>
                  </div>

                  {/* Play & Delete Buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setPreviewVideoUrl(video.fileUrl)}
                      className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 transition flex items-center gap-1 shadow-sm"
                    >
                      <span>Play</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleDeleteVideo(video.id)}
                      disabled={deletingVideoId === video.id}
                      className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-600 hover:text-white transition shadow-sm disabled:opacity-50"
                    >
                      {deletingVideoId === video.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Modal Footer */}
      <div className="p-4 border-t bg-gray-50 flex justify-end">
        <button
          type="button"
          onClick={() => {
            setViewVideoProperty(null);
            setPreviewVideoUrl(null);
          }}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition"
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