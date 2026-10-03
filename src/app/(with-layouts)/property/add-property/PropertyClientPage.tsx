'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { 
  addProperty, 
  updateProperty, 
  deleteProperty, 
  uploadImageToCloudinary 
} from '../../../api/property/route';

interface Customer {
  id: string;
  fullname: string;
  email: string;
  phone: string;
}

interface PropertyItem {
  id: string;
  refname: string;
  refnumber: string;
  refemail: string;
  refaddress: string;
  title: string;
  description: string;
  tags?: string;
  maxprice: string;
  minprice: string;
  category: string;
  type: string;
  address: string;
  city: string;
  country: string;
  bathrooms: number;
  bedrooms: number;
  area: string;
  Garages: number;
  images: string;
  salescustomerid: string;
  status: string;
}

const COUNTRY_CITIES: Record<string, string[]> = {
  Pakistan: ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta'],
  UAE: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'],
};

const CATEGORY_TYPES: Record<string, string[]> = {
  Residential: ['House', 'Apartment', 'Villa', 'Townhouse', 'Penthouse'],
  Commercial: ['Shop', 'Office', 'Land', 'Warehouse', 'Building', 'Plaza'],
};

export default function PropertyClientPage({ 
  initialProperties = [], 
  customers = [],
  initialSearch = ''
}: { 
  initialProperties?: PropertyItem[], 
  customers?: Customer[],
  initialSearch?: string
}) {
  const [tagsInput, setTagsInput] = useState('');
const [tags, setTags] = useState<string[]>([]);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  const [properties, setProperties] = useState<PropertyItem[]>(initialProperties);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form States
  const [refName, setRefName] = useState('');
  const [refNumber, setRefNumber] = useState('');
  const [refEmail, setRefEmail] = useState('');
  const [refAddress, setRefAddress] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [category, setCategory] = useState('Residential');
  const [type, setType] = useState('House');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('Pakistan');
  const [city, setCity] = useState('Lahore');
  const [bathrooms, setBathrooms] = useState(1);
  const [bedrooms, setBedrooms] = useState(1);
  const [area, setArea] = useState('');
  const [garages, setGarages] = useState(0);
  
  // Images
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  
  const [salesCustomerId, setSalesCustomerId] = useState('');
  const [salesCustomerName, setSalesCustomerName] = useState('');

  // Seller Search Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination (20 per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const currencySymbol = country === 'UAE' ? 'AED' : 'PKR';

  const formatNumberInput = (val: string) => {
    const cleaned = val.replace(/,/g, '').replace(/\D/g, '');
    if (!cleaned) return '';
    return Number(cleaned).toLocaleString();
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxPrice(formatNumberInput(e.target.value));
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinPrice(formatNumberInput(e.target.value));
  };

  const handleCountryChange = (val: string) => {
    setCountry(val);
    setCity(COUNTRY_CITIES[val]?.[0] || '');
  };

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    setType(CATEGORY_TYPES[val]?.[0] || '');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (selectedImages.length + files.length > 10) {
      alert('You can upload a maximum of 10 images.');
      return;
    }

    Array.from(files).forEach((file) => {
      if (file.size > 500 * 1024) {
        alert(`Image "${file.name}" exceeds 500KB limit! Please select a smaller image.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setSelectedImages((prev) => [...prev, uploadEvent.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setIsEditing(null);
    setRefName('');
    setRefNumber('');
    setRefEmail('');
    setRefAddress('');
    setTitle('');
    setTags([]);
     setTagsInput('');
    setDescription('');
    setMaxPrice('');
    setMinPrice('');
    setCategory('Residential');
    setType('House');
    setAddress('');
    setCountry('Pakistan');
    setCity('Lahore');
    setBathrooms(1);
    setBedrooms(1);
    setArea('');
    setGarages(0);
    setSelectedImages([]);
    setSalesCustomerId('');
    setSalesCustomerName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salesCustomerId) {
      alert('Please select a Seller customer first!');
      return;
    }

    setLoading(true);

    try {
      const uploadedUrls: string[] = [];
      for (const imgBase64 of selectedImages) {
        if (imgBase64.startsWith('http')) {
          uploadedUrls.push(imgBase64);
        } else {
          const uploadRes = await uploadImageToCloudinary(imgBase64);
          if (uploadRes.success && uploadRes.url) {
            uploadedUrls.push(uploadRes.url);
          } else {
            alert('Failed to upload one or more images: ' + uploadRes.error);
            setLoading(false);
            return;
          }
        }
      }

      const formData = new FormData();
      formData.append('refname', refName);
      formData.append('refnumber', refNumber);
      formData.append('refemail', refEmail);
      formData.append('refaddress', refAddress);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('maxprice', maxPrice.replace(/,/g, ''));
      formData.append('minprice', minPrice.replace(/,/g, ''));
      formData.append('category', category);
      formData.append('tags', JSON.stringify(tags));
      formData.append('type', type);
      formData.append('address', address);
      formData.append('city', city);
      formData.append('country', country);
      formData.append('bathrooms', bathrooms.toString());
      formData.append('bedrooms', bedrooms.toString());
      formData.append('area', area);
      formData.append('Garages', garages.toString());

      let res;
      if (isEditing) {
        res = await updateProperty(isEditing, formData, salesCustomerId, uploadedUrls);
      } else {
        res = await addProperty(formData, salesCustomerId, uploadedUrls);
      }

      setLoading(false);
      if (res.success) {
        alert(isEditing ? 'Property updated successfully!' : 'Property added successfully!');
        window.location.reload();
      } else {
        alert('Error: ' + res.error);
      }
    } catch (err: any) {
      console.error(err);
      setLoading(false);
      alert('An unexpected error occurred.');
    }
  };

  const handleEdit = (prop: PropertyItem) => {
    setIsEditing(prop.id);
    setRefName(prop.refname);
    setRefNumber(prop.refnumber);
    setRefEmail(prop.refemail);
    setRefAddress(prop.refaddress);
    setTitle(prop.title);
    setDescription(prop.description);
    setMaxPrice(prop.maxprice ? Number(prop.maxprice).toLocaleString() : '');
    setMinPrice(prop.minprice ? Number(prop.minprice).toLocaleString() : '');
    setCategory(prop.category);
    setType(prop.type);
    setAddress(prop.address);
    setCountry(prop.country);
    setCity(prop.city);
    setBathrooms(prop.bathrooms);
    setBedrooms(prop.bedrooms);
    setArea(prop.area);
    setGarages(prop.Garages);
    setSalesCustomerId(prop.salescustomerid);
    try {
  setTags(JSON.parse(prop.tags || '[]'));
} catch {
  setTags([]);
}
    try {
      setSelectedImages(JSON.parse(prop.images || '[]'));
    } catch {
      setSelectedImages([]);
    }

    const foundCust = customers.find((c) => c.id === prop.salescustomerid);
    if (foundCust) setSalesCustomerName(foundCust.fullname);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this property?')) {
      const res = await deleteProperty(id);
      if (res.success) {
        setProperties((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert(res.error);
      }
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      router.push(`/property?search=${encodeURIComponent(searchTerm)}`);
    });
  };

  const paginatedProperties = properties.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const filteredCustomers = (customers || []).filter((c) => {
    const query = searchQuery.toLowerCase();
    const name = c.fullname || '';
    const phone = c.phone || '';
    const email = c.email || '';
    return name.toLowerCase().includes(query) || phone.includes(query) || email.toLowerCase().includes(query);
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Property Management</h1>
          <p className="text-sm text-gray-500">Add properties linked with sellers and manage listings.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border space-y-6">
        <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">
          {isEditing ? 'Edit Property' : 'Add New Property'}
        </h2>

        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">Linked Seller</span>
            <span className="text-sm font-medium text-gray-800">
              {salesCustomerName ? `${salesCustomerName} (ID: ${salesCustomerId})` : 'No seller selected yet'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm"
          >
            {salesCustomerId ? 'Change Seller' : 'Search Seller'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Reference Name</label>
            <input
              type="text"
              maxLength={100}
              required
              value={refName}
              onChange={(e) => setRefName(e.target.value)}
              className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. John Doe Ref"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Reference Number</label>
            <input
              type="text"
              maxLength={20}
              required
              value={refNumber}
              onChange={(e) => setRefNumber(e.target.value)}
              className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="+923000000000"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Reference Email</label>
            <input
              type="email"
              maxLength={100}
              required
              value={refEmail}
              onChange={(e) => setRefEmail(e.target.value)}
              className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="ref@example.com"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Reference Address</label>
            <input
              type="text"
              maxLength={200}
              required
              value={refAddress}
              onChange={(e) => setRefAddress(e.target.value)}
              className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Street 1, Lahore"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Property Title</label>
            <input
              type="text"
              maxLength={150}
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Luxury Villa with Pool"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full border rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Property Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {CATEGORY_TYPES[category]?.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Country</label>
            <select
              value={country}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="w-full border rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="Pakistan">Pakistan</option>
              <option value="UAE">UAE</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">City</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full border rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {COUNTRY_CITIES[country]?.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Min Price ({currencySymbol})</label>
            <input
              type="text"
              required
              value={minPrice}
              onChange={handleMinPriceChange}
              className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. 150,000"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Max Price ({currencySymbol})</label>
            <input
              type="text"
              required
              value={maxPrice}
              onChange={handleMaxPriceChange}
              className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. 200,000"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Bathrooms</label>
            <input
              type="number"
              min={0}
              max={50}
              required
              value={bathrooms}
              onChange={(e) => setBathrooms(Number(e.target.value))}
              className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Bedrooms</label>
            <input
              type="number"
              min={0}
              max={50}
              required
              value={bedrooms}
              onChange={(e) => setBedrooms(Number(e.target.value))}
              className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Area (Sq Ft / Marla)</label>
            <input
              type="text"
              maxLength={50}
              required
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. 2500 Sq Ft"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Garages</label>
            <input
              type="number"
              min={0}
              max={20}
              required
              value={garages}
              onChange={(e) => setGarages(Number(e.target.value))}
              className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Property Address</label>
            <input
              type="text"
              maxLength={250}
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Complete property location..."
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
            <textarea
              rows={3}
              maxLength={1000}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Detailed property description..."
            />
          </div>
{/* Tags Section */}
<div className="md:col-span-3 space-y-2">
  <label className="block text-xs font-semibold text-gray-600">Tags</label>
  <div className="flex gap-2">
    <input
      type="text"
      value={tagsInput}
      onChange={(e) => setTagsInput(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (tagsInput.trim() && !tags.includes(tagsInput.trim())) {
            setTags([...tags, tagsInput.trim()]);
            setTagsInput('');
          }
        }
      }}
      className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
      placeholder="Type a tag and press Enter..."
    />
    <button
      type="button"
      onClick={() => {
        if (tagsInput.trim() && !tags.includes(tagsInput.trim())) {
          setTags([...tags, tagsInput.trim()]);
          setTagsInput('');
        }
      }}
      className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
    >
      Add Tag
    </button>
  </div>
  {tags.length > 0 && (
    <div className="flex flex-wrap gap-2 mt-2">
      {tags.map((tag, idx) => (
        <span key={idx} className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1.5 border border-blue-100">
          {tag}
          <button
            type="button"
            onClick={() => setTags(tags.filter((_, i) => i !== idx))}
            className="text-blue-500 hover:text-red-600 font-bold ml-1"
          >
            ×
          </button>
        </span>
      ))}
    </div>
  )}
</div>
          <div className="md:col-span-3 space-y-2">
            <label className="block text-xs font-semibold text-gray-600">
              Upload Images (Max 10 images, max 500KB each)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
            {selectedImages.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-3">
                {selectedImages.map((img, idx) => (
                  <div key={idx} className="relative w-20 h-20 border rounded-lg overflow-hidden shadow-sm group">
                    <img src={img} alt="preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-80 group-hover:opacity-100 transition"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={resetForm}
            className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
          >
            {loading ? 'Saving...' : isEditing ? 'Update Property' : 'Save Property'}
          </button>
        </div>
      </form>

      {/* Property Listings Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Property Listings</h2>
            <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium mt-1 inline-block">
              Total: {properties.length}
            </span>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search title, city, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
            />
            <button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              {isPending ? 'Searching...' : 'Search'}
            </button>
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  router.push('/property');
                }}
                className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-200 transition"
              >
                Reset
              </button>
            )}
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="p-4">Title</th>
                <th className="p-4">Category / Type</th>
                <th className="p-4">Location</th>
                <th className="p-4">Price Range</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {paginatedProperties.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-400">
                    No properties found.
                  </td>
                </tr>
              ) : (
                paginatedProperties.map((prop) => (
                  <tr key={prop.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-medium text-gray-800">{prop.title}</td>
                    <td className="p-4 text-gray-600">{prop.category} ({prop.type})</td>
                    <td className="p-4 text-gray-600">{prop.city}, {prop.country}</td>
                    <td className="p-4 text-gray-800 font-semibold">
                      {Number(prop.minprice).toLocaleString()} - {Number(prop.maxprice).toLocaleString()} {prop.country === 'UAE' ? 'AED' : 'PKR'}
                    </td>
                    <td className="p-4">
                      <span className="bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium">
                        {prop.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(prop)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-xs px-2.5 py-1 bg-blue-50 rounded-lg transition"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(prop.id)}
                        className="text-red-600 hover:text-red-800 font-medium text-xs px-2.5 py-1 bg-red-50 rounded-lg transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Seller Selection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Select Seller Customer</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-4 border-b bg-gray-50">
              <input
                type="text"
                placeholder="Search by name, email or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border rounded-lg p-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 border rounded-lg p-2 flex-1 m-4">
              {filteredCustomers.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-sm">No customers found.</div>
              ) : (
                filteredCustomers.map((cust) => (
                  <div key={cust.id} className="p-3 flex justify-between items-center hover:bg-gray-50 transition rounded-lg">
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">{cust.fullname}</div>
                      <div className="text-xs text-gray-400">{cust.email} • {cust.phone}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSalesCustomerId(cust.id);
                        setSalesCustomerName(cust.fullname);
                        setIsModalOpen(false);
                      }}
                      className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                      Select
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}