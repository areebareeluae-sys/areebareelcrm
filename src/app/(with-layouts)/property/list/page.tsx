import { getProperties } from '../../../api/property/route';
import Link from 'next/link';
import PropertyReferralModal from '@/components/PropertyReferralModal';

export default async function AllPropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; view?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const searchQuery = resolvedSearchParams?.search || '';
  // Default view is 'list' as requested
  const viewMode = resolvedSearchParams?.view || 'list'; 
  
  const res: any = await getProperties(searchQuery);
  const properties = Array.isArray(res) ? res : (res?.properties || []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header, Search Bar & View Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-2xl border shadow-sm gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Property Listings</h1>
          <p className="text-xs text-gray-500">Manage and explore commercial and residential properties</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search Form */}
          <form method="GET" className="flex gap-2 w-full md:w-auto">
            <input type="hidden" name="view" value={viewMode} />
            <input
              type="text"
              name="search"
              defaultValue={searchQuery}
              placeholder="Search title, city, type..."
              className="border rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-56"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
            >
              Search
            </button>
          </form>

          {/* View Toggle Buttons (List vs Grid) */}
          <div className="flex bg-gray-100 p-1 rounded-xl border">
            <Link
              href={`/property/list?search=${searchQuery}&view=list`}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 List
            </Link>
            <Link
              href={`/property/list?search=${searchQuery}&view=grid`}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🔲 Grid
            </Link>
          </div>
        </div>
      </div>

      {/* Properties Display Area */}
      {properties.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border shadow-sm">
          <p className="text-gray-500 text-sm font-medium">No properties found.</p>
        </div>
      ) : viewMode === 'list' ? (
        /* --- COMPACT LIST VIEW (DEFAULT) --- */
        <div className="space-y-3">
          {properties.map((property: any) => {
            let images: string[] = [];
            try {
              images = JSON.parse(property.images || '[]');
            } catch {
              images = [];
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
                    <div className="flex items-center gap-2">
                      <Link href={`/property/list/${property.id}`} className="text-sm font-bold text-gray-900 hover:text-blue-600">
                        {property.title}
                      </Link>
                      {/* Status & Category Badges */}
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

                    <div className="text-xs font-bold text-blue-600">
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
          {properties.map((property: any) => {
            let images: string[] = [];
            try {
              images = JSON.parse(property.images || '[]');
            } catch {
              images = [];
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
                    <div className="absolute top-2 left-2 flex gap-1">
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
                    <Link href={`/property/list/${property.id}`}>
                      <h2 className="text-sm font-bold text-gray-900 hover:text-blue-600 transition line-clamp-1">
                        {property.title}
                      </h2>
                    </Link>
                    
                    <p className="text-[11px] text-gray-500 font-medium">
                      📍 {property.city}, {property.country || 'Pakistan'}
                    </p>

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
    </div>
  );
}