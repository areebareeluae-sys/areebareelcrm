'use client';

import { useState, useTransition, useEffect } from 'react';
import { getCustomers, addCustomer, updateCustomer, deleteCustomer } from '../../../api/leadcustomer/route'; // Aapka action path
import { X, Plus } from 'lucide-react'; // Icons

// Country-wise Cities Mapping
const citiesByCountry: Record<string, string[]> = {
  Pakistan: ['Lahore', 'Karachi', 'Islamabad', 'Faisalabad', 'Rawalpindi', 'Multan', 'Peshawar', 'Quetta'],
  UAE: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'],
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('Pakistan');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, startTransition] = useTransition();

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- Tag Input State ---
  const [tagInput, setTagInput] = useState('');
  const [tagsList, setTagsList] = useState<string[]>([]);

  // Form Fields State
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone: '',
    country: 'Pakistan',
    city: 'Lahore',
    address: '',
    refname: '',
    refnumber: '',
    refemail: '',
    refaddress: '',
  });

  // Fetch customers on load or search
  useEffect(() => {
    startTransition(async () => {
      const data = await getCustomers(searchQuery);
      setCustomers(data);
      setCurrentPage(1);
    });
  }, [searchQuery]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = e.target.value;
    setSelectedCountry(country);
    setFormData((prev) => ({
      ...prev,
      country,
      city: citiesByCountry[country]?.[0] || '',
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- Tag Handling Functions ---
  const handleAddTag = () => {
    if (tagInput.trim() && !tagsList.includes(tagInput.trim())) {
      setTagsList([...tagsList, tagInput.trim()]);
      setTagInput(''); // Input clear karein
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTagsList(tagsList.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Form submit honey se rokein
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    
    // --- Tags ko FormData mein add karein (comma-separated string banakar) ---
    data.append('tags', tagsList.join(','));

    startTransition(async () => {
      if (editingId) {
        await updateCustomer(editingId, data);
        setEditingId(null);
      } else {
        await addCustomer(data);
      }

      // --- Reset Form & Tags ---
      setFormData({
        fullname: '', email: '', phone: '', country: 'Pakistan', city: citiesByCountry['Pakistan'][0],
        address: '', refname: '', refnumber: '', refemail: '', refaddress: '',
      });
      setTagsList([]);
      setTagInput('');

      const updatedList = await getCustomers(searchQuery);
      setCustomers(updatedList);
    });
  };

  const handleEdit = (cust: any) => {
    setEditingId(cust.id);
    setSelectedCountry(cust.country);
    
    // --- Load Tags for Editing ---
    if (cust.tags) {
      setTagsList(cust.tags.split(','));
    } else {
      setTagsList([]);
    }

    setFormData({
      fullname: cust.fullname, email: cust.email, phone: cust.phone, country: cust.country,
      city: cust.city, address: cust.address, refname: cust.refname, refnumber: cust.refnumber,
      refemail: cust.refemail, refaddress: cust.refaddress,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      startTransition(async () => {
        await deleteCustomer(id);
        const updatedList = await getCustomers(searchQuery);
        setCustomers(updatedList);
      });
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(customers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCustomers = customers.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Management</h1>
          <p className="text-sm text-gray-500 mt-1">Total Leads: {customers.length}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Add / Edit Customer Form */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
              {editingId ? 'Edit Lead' : 'Add New Lead'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 gap-4">
                {/* Basic Info */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
                  <input type="text" name="fullname" value={formData.fullname} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Lead Name" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-blue-500 outline-none" placeholder="lead@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Phone *</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-blue-500 outline-none" placeholder="+923000000000" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Country *</label>
                    <select name="country" value={formData.country} onChange={handleCountryChange} className="w-full border rounded-lg px-2 py-2 text-black focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="Pakistan">Pakistan</option>
                      <option value="UAE">UAE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">City *</label>
                    <select name="city" value={formData.city} onChange={handleChange} className="w-full border rounded-lg px-2 py-2 text-black focus:ring-2 focus:ring-blue-500 outline-none">
                      {citiesByCountry[selectedCountry]?.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Address *</label>
                  <textarea name="address" value={formData.address} onChange={handleChange} required rows={2} className="w-full border rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Manual address entry..." />
                </div>

                {/* --- Tag Input UI --- */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tags</label>
                  
                  {/* Tag Bubbles Display */}
                  <div className="flex flex-wrap gap-2 mb-2 border rounded-lg p-2 bg-gray-50 min-h-[42px]">
                    {tagsList.map(tag => (
                      <span key={tag} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                        {tag}
                        <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-blue-900">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Input + Add Button */}
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagInputKeyDown}
                      className="flex-grow border rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-blue-500 outline-none" 
                      placeholder="e.g. buyer DHA, Saller DHA phase2" 
                    />
                    <button 
                      type="button"
                      onClick={handleAddTag}
                      className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Type a tag and press Enter or click Add.</p>
                </div>

                {/* Reference Info */}
                <div className="pt-2 border-t font-semibold text-gray-700 text-xs uppercase tracking-wider">Reference Information</div>
                {['refname', 'refnumber', 'refemail', 'refaddress'].map(field => (
                  <div key={field}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{field.replace('ref', 'Reference ').replace(/^\w/, c => c.toUpperCase())} *</label>
                    <input type={field === 'refemail' ? 'email' : 'text'} name={field} value={(formData as any)[field]} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-blue-500 outline-none" placeholder={field.replace('ref', 'Reference ').replace(/^\w/, c => c.toUpperCase())} />
                  </div>
                ))}
              </div>

              {/* Form Actions */}
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50">
                  {editingId ? 'Update Lead' : 'Save Lead'}
                </button>
                {editingId && (
                  <button type="button" onClick={() => { setEditingId(null); setTagsList([]); setFormData({ fullname: '', email: '', phone: '', country: 'Pakistan', city: 'Lahore', address: '', refname: '', refnumber: '', refemail: '', refaddress: '' }); }} className="bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-300 transition">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Customer Table Section */}
<div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-800">All Leads List</h2>
              <div className="w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Search by name, email, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm text-black focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase bg-gray-50/50">
                    <th className="py-3 px-4">Leads</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {currentCustomers.length === 0 ? (
                    <tr><td colSpan={5} className="py-8 text-center text-gray-400">No leads found.</td></tr>
                  ) : (
                    currentCustomers.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50/80 transition">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-gray-800">{c.fullname}</div>
                          <div className="text-xs text-gray-400">{c.email}</div>
                          {/* --- Tag Badges Display in Table --- */}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {c.tags && c.tags.split(',').map((tag: string) => (
                              <span key={tag} className="bg-blue-50 text-blue-600 text-[9px] font-medium px-1.5 py-0.5 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          <div>{c.phone}</div>
                          <div className="text-xs text-gray-400">By: {c.createdby}</div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          <div>{c.city}, {c.country}</div>
                          <div className="text-xs text-gray-400 truncate max-w-[150px]">{c.address}</div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          <div className="text-xs font-medium text-gray-700">{c.refname}</div>
                          <div className="text-xs text-gray-400">{c.refnumber}</div>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button onClick={() => handleEdit(c)} className="text-blue-600 hover:text-blue-800 text-xs font-medium bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded transition">Edit</button>
                          <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700 text-xs font-medium bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition">Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm text-gray-600">
                <div>Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, customers.length)} of {customers.length} entries</div>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1.5 border rounded-lg hover:bg-gray-100 disabled:opacity-40">Previous</button>
                  <span className="px-3 py-1.5 font-medium bg-blue-50 text-blue-600 rounded-lg">{currentPage} / {totalPages}</span>
                  <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1.5 border rounded-lg hover:bg-gray-100 disabled:opacity-40">Next</button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}