'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import PropertyReferralModal from '@/components/PropertyReferralModal';

export default function AllPropertiesPage({ initialProperties = [] }: { initialProperties: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // 👈 20 properties per page

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

  // Pagination calculation
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProperties = filteredProperties.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when search or country changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountry(e.target.value);
    setCurrentPage(1);
  };

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

                {/* Right: Referral Action */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
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
    </div>
  );
}