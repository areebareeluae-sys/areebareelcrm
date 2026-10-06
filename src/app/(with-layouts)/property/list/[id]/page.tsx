'use client';

import React, { useEffect, useState, use } from 'react';
import { getPropertyDetails } from '../../../../api/property/route';
import Link from 'next/link';
import { FileText, Download, X, ArrowLeft } from 'lucide-react';

interface DocumentItem {
  id: string;
  tableName: string;
  entityId: string;
  fileUrl: string;
  title: string | null;
  createdAt: string;
}

export default function PropertyDetailViewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams?.id;

  const [property, setProperty] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [buyer, setBuyer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [isSellerReferralOpen, setIsSellerReferralOpen] = useState(false);

  const [isBuyerModalOpen, setIsBuyerModalOpen] = useState(false);
  const [isBuyerReferralOpen, setIsBuyerReferralOpen] = useState(false);

  // Document Modal States
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [propertyDocuments, setPropertyDocuments] = useState<DocumentItem[]>([]);
  const [fetchingDocs, setFetchingDocs] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      getPropertyDetails(id).then((res: any) => {
        if (res && res.success && res.property) {
          setProperty(res.property);
          setSeller(res.seller);
          if (res.buyer) setBuyer(res.buyer);
          try {
            const imgs = JSON.parse(res.property.images || '[]');
            if (imgs.length > 0) setSelectedImage(imgs[0]);
          } catch {}
        }
        setLoading(false);
      });
    }
  }, [id]);

  // Fetch Documents when Document Modal opens
  async function handleOpenDocuments() {
    setIsDocModalOpen(true);
    setPreviewPdfUrl(null);
    setFetchingDocs(true);
    try {
      const res = await fetch(`/api/documents?tableName=property&entityId=${id}`);
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

  if (loading) {
    return <div className="text-center py-20 text-gray-400 font-medium">Loading property details...</div>;
  }

  if (!property) {
    return <div className="text-center py-20 text-red-500 font-semibold">Property not found!</div>;
  }

  let images: string[] = [];
  try {
    images = JSON.parse(property.images || '[]');
  } catch {
    images = [];
  }

  const formatPrice = (price: any, country: string) => {
    if (!price) return 'N/A';
    const isPak = country?.toLowerCase() === 'pakistan' || country?.toLowerCase() === 'pk';
    const currency = isPak ? 'PKR' : 'AED';
    return `${Number(price).toLocaleString()} ${currency}`;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <Link href="/property/list" className="text-sm text-blue-600 hover:underline font-medium inline-block">
          ← Back to Listings
        </Link>
        
        {/* View Documents Button */}
        <button
          onClick={handleOpenDocuments}
          className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition border border-emerald-200"
        >
          <FileText className="w-4 h-4" /> View Documents
        </button>
      </div>

      {/* Header Info (Status & Category Added) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={`text-xs px-3 py-1 rounded-full font-bold ${
              property.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {property.status || 'Active'}
            </span>
            <span className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full font-bold">
              {property.category || 'General'} • {property.type || 'Property'}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{property.title}</h1>
          <p className="text-gray-500 text-sm">📍 {property.address}, {property.city}, {property.country}</p>
        </div>
        
        <div className="text-right">
          <div className="text-xl md:text-2xl font-extrabold text-blue-600">
            {formatPrice(property.minprice, property.country)} 
            {property.maxprice && property.maxprice !== property.minprice ? ` - ${formatPrice(property.maxprice, property.country)}` : ''}
          </div>
          <span className="text-xs text-gray-400 mt-1 block">Listed Country: {property.country}</span>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
        <h2 className="text-base font-bold text-gray-800">Property Images</h2>
        <div className="w-full h-96 bg-gray-100 rounded-xl overflow-hidden">
          <img src={selectedImage || images[0] || 'https://via.placeholder.com/800x500'} alt="Property view" className="w-full h-full object-cover" />
        </div>
        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {images.map((img: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition ${selectedImage === img ? 'border-blue-600 scale-105' : 'border-transparent opacity-70'}`}
              >
                <img src={img} alt="thumb" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm space-y-6">
          <h2 className="text-base font-bold text-gray-800 border-b pb-3">Description & Specifications</h2>
          
          <div>
            <h3 className="text-xs font-semibold uppercase text-gray-400 tracking-wider mb-1">Description</h3>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{property.description || 'No description provided.'}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="bg-gray-50 p-3 rounded-xl">
              <span className="text-xs text-gray-400 block">Bedrooms</span>
              <span className="font-bold text-gray-800 text-base">{property.bedrooms ?? 0}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <span className="text-xs text-gray-400 block">Bathrooms</span>
              <span className="font-bold text-gray-800 text-base">{property.bathrooms ?? 0}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <span className="text-xs text-gray-400 block">Garages</span>
              <span className="font-bold text-gray-800 text-base">{property.Garages ?? 0}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <span className="text-xs text-gray-400 block">Area</span>
              <span className="font-bold text-gray-800 text-base">{property.area || 'N/A'}</span>
            </div>
          </div>

          {/* Closing & Deal Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t text-sm">
            <div><span className="text-gray-400 text-xs block">Created By:</span> <span className="font-semibold text-gray-800">{property.createdby || 'Admin'}</span></div>
            <div><span className="text-gray-400 text-xs block">Closed By:</span> <span className="font-semibold text-gray-800">{property.closedby || 'N/A'}</span></div>
            <div><span className="text-gray-400 text-xs block">Closed Price:</span> <span className="font-semibold text-green-700">{property.closedprice ? formatPrice(property.closedprice, property.country) : 'N/A'}</span></div>
            <div><span className="text-gray-400 text-xs block">Closed Date:</span> <span className="font-semibold text-gray-800">{property.closeddate || 'N/A'}</span></div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-800 border-b pb-3">Reference Info</h2>
            <div className="space-y-2 text-sm">
              <div><span className="text-gray-400 text-xs block">Name:</span> <span className="font-semibold text-gray-800">{property.refname || 'N/A'}</span></div>
              <div><span className="text-gray-400 text-xs block">Phone:</span> <span className="font-semibold text-gray-800">{property.refnumber || 'N/A'}</span></div>
              <div><span className="text-gray-400 text-xs block">Email:</span> <span className="font-semibold text-gray-800">{property.refemail || 'N/A'}</span></div>
              <div><span className="text-gray-400 text-xs block">Address:</span> <span className="font-semibold text-gray-800">{property.refaddress || 'N/A'}</span></div>
            </div>
          </div>

          {/* Seller Button */}
          <div className="bg-blue-50/60 p-6 rounded-2xl space-y-3">
            <h2 className="text-sm font-bold uppercase text-blue-700 tracking-wider">Seller Customer</h2>
            <p className="text-xs text-gray-600">View complete seller record from database.</p>
            <button
              type="button"
              onClick={() => setIsSellerModalOpen(true)}
              className="w-full bg-blue-600 text-white text-xs font-semibold py-3 rounded-xl hover:bg-blue-700 transition shadow-sm"
            >
              View Seller Info (ID: {property.salescustomerid})
            </button>
          </div>

          {/* Buyer Button */}
          <div className="bg-emerald-50/60 p-6 rounded-2xl space-y-3">
            <h2 className="text-sm font-bold uppercase text-emerald-700 tracking-wider">Buyer Customer</h2>
            <p className="text-xs text-gray-600">View buyer record if property is sold.</p>
            {property.buyercustomerid ? (
              <button
                type="button"
                onClick={() => setIsBuyerModalOpen(true)}
                className="w-full bg-emerald-600 text-white text-xs font-semibold py-3 rounded-xl hover:bg-emerald-700 transition shadow-sm"
              >
                View Buyer Info (ID: {property.buyercustomerid})
              </button>
            ) : (
              <div className="w-full bg-gray-100 text-gray-500 text-xs font-semibold py-3 rounded-xl text-center">
                Property Not Sold Yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Seller Modal */}
      {isSellerModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-gray-800 text-lg">Seller Customer Details</h3>
              <button type="button" onClick={() => setIsSellerModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            </div>

            {seller ? (
              <div className="space-y-3 text-sm">
                <div><span className="text-gray-400 text-xs block">Full Name</span> <span className="font-semibold text-gray-800">{seller.fullname}</span></div>
                <div><span className="text-gray-400 text-xs block">Email</span> <span className="font-semibold text-gray-800">{seller.email}</span></div>
                <div><span className="text-gray-400 text-xs block">Phone</span> <span className="font-semibold text-gray-800">{seller.phone}</span></div>
                <div><span className="text-gray-400 text-xs block">Location</span> <span className="font-semibold text-gray-800">{seller.city}, {seller.country}</span></div>
                <div><span className="text-gray-400 text-xs block">Address</span> <span className="font-semibold text-gray-800">{seller.address}</span></div>
                <div><span className="text-gray-400 text-xs block">Customer ID</span> <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">{seller.id}</span></div>
                <div><span className="text-gray-400 text-xs block">Status</span> <span className="font-semibold text-green-600">{seller.status}</span></div>

                <div className="pt-2">
                  <button type="button" onClick={() => setIsSellerReferralOpen(true)} className="w-full bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-semibold py-2.5 rounded-xl transition">
                    👥 View Seller Referral Info
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-4 text-center">Customer details not found for ID: {property.salescustomerid}</p>
            )}

            <div className="flex justify-end pt-3">
              <button type="button" onClick={() => setIsSellerModalOpen(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-xs font-medium hover:bg-gray-200">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Buyer Modal */}
      {isBuyerModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-gray-800 text-lg">Buyer Customer Details</h3>
              <button type="button" onClick={() => setIsBuyerModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            </div>

            {buyer ? (
              <div className="space-y-3 text-sm">
                <div><span className="text-gray-400 text-xs block">Full Name</span> <span className="font-semibold text-gray-800">{buyer.fullname}</span></div>
                <div><span className="text-gray-400 text-xs block">Email</span> <span className="font-semibold text-gray-800">{buyer.email}</span></div>
                <div><span className="text-gray-400 text-xs block">Phone</span> <span className="font-semibold text-gray-800">{buyer.phone}</span></div>
                <div><span className="text-gray-400 text-xs block">Location</span> <span className="font-semibold text-gray-800">{buyer.city}, {buyer.country}</span></div>
                <div><span className="text-gray-400 text-xs block">Address</span> <span className="font-semibold text-gray-800">{buyer.address}</span></div>
                <div><span className="text-gray-400 text-xs block">Customer ID</span> <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">{buyer.id}</span></div>
                <div><span className="text-gray-400 text-xs block">Status</span> <span className="font-semibold text-green-600">{buyer.status}</span></div>

                <div className="pt-2">
                  <button type="button" onClick={() => setIsBuyerReferralOpen(true)} className="w-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold py-2.5 rounded-xl transition">
                    👥 View Buyer Referral Info
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-4 text-center">Buyer details not found for ID: {property.buyercustomerid}</p>
            )}

            <div className="flex justify-end pt-3">
              <button type="button" onClick={() => setIsBuyerModalOpen(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-xs font-medium hover:bg-gray-200">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Seller Referral Modal */}
      {isSellerReferralOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-gray-800 text-base">Seller Referral Details</h3>
              <button type="button" onClick={() => setIsSellerReferralOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg font-bold">×</button>
            </div>
            <div className="space-y-3 text-sm">
              <div><span className="text-gray-400 text-xs block">Referral Name</span> <span className="font-semibold text-gray-800">{seller?.refname || 'N/A'}</span></div>
              <div><span className="text-gray-400 text-xs block">Phone Number</span> <span className="font-semibold text-gray-800">{seller?.refnumber || 'N/A'}</span></div>
              <div><span className="text-gray-400 text-xs block">Email Address</span> <span className="font-semibold text-gray-800">{seller?.refemail || 'N/A'}</span></div>
              <div><span className="text-gray-400 text-xs block">Address</span> <span className="font-semibold text-gray-800">{seller?.refaddress || 'N/A'}</span></div>
            </div>
            <div className="flex justify-end pt-3">
              <button type="button" onClick={() => setIsSellerReferralOpen(false)} className="bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-medium hover:bg-black">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Buyer Referral Modal */}
      {isBuyerReferralOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-gray-800 text-base">Buyer Referral Details</h3>
              <button type="button" onClick={() => setIsBuyerReferralOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg font-bold">×</button>
            </div>
            <div className="space-y-3 text-sm">
              <div><span className="text-gray-400 text-xs block">Referral Name</span> <span className="font-semibold text-gray-800">{buyer?.refname || 'N/A'}</span></div>
              <div><span className="text-gray-400 text-xs block">Phone Number</span> <span className="font-semibold text-gray-800">{buyer?.refnumber || 'N/A'}</span></div>
              <div><span className="text-gray-400 text-xs block">Email Address</span> <span className="font-semibold text-gray-800">{buyer?.refemail || 'N/A'}</span></div>
              <div><span className="text-gray-400 text-xs block">Address</span> <span className="font-semibold text-gray-800">{buyer?.refaddress || 'N/A'}</span></div>
            </div>
            <div className="flex justify-end pt-3">
              <button type="button" onClick={() => setIsBuyerReferralOpen(false)} className="bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-medium hover:bg-black">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW DOCUMENTS MODAL (With In-Popup Iframe Viewer & Download) */}
      {isDocModalOpen && (
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
                  {previewPdfUrl ? 'Viewing PDF Preview' : `Property Documents: ${property.title}`}
                </h3>
              </div>
              <button 
                onClick={() => setIsDocModalOpen(false)} 
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
                  ) : propertyDocuments.length === 0 ? (
                    <p className="text-center py-10 text-gray-400">Is property ki koi document/PDF maujood nahi hai.</p>
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
                onClick={() => setIsDocModalOpen(false)}
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