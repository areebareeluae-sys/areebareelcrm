'use client';

import { useState, useTransition, useEffect } from 'react';
import { getCustomers, addCustomer, updateCustomer, deleteCustomer } from '../../../api/customer/route';

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
  const itemsPerPage = 10; // Har page par 10 customers show honge

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
      setCurrentPage(1); // Search karne par wapas page 1 par chale jaye
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    startTransition(async () => {
      if (editingId) {
        await updateCustomer(editingId, data);
        setEditingId(null);
      } else {
        await addCustomer(data);
      }

      // Reset Form
      setFormData({
        fullname: '',
        email: '',
        phone: '',
        country: 'Pakistan',
        city: citiesByCountry['Pakistan'][0],
        address: '',
        refname: '',
        refnumber: '',
        refemail: '',
        refaddress: '',
      });

      const updatedList = await getCustomers(searchQuery);
      setCustomers(updatedList);
    });
  };

  const handleEdit = (cust: any) => {
    setEditingId(cust.id);
    setSelectedCountry(cust.country);
    setFormData({
      fullname: cust.fullname,
      email: cust.email,
      phone: cust.phone,
      country: cust.country,
      city: cust.city,
      address: cust.address,
      refname: cust.refname,
      refnumber: cust.refnumber,
      refemail: cust.refemail,
      refaddress: cust.refaddress,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (confirm('If you delete this customer, all associated data will also be deleted. Are you sure?')) {
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
            <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
            <p className="text-sm text-gray-500 mt-1">Total Customers: {customers.length}</p>
          </div>
        

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Add / Edit Customer Form */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
              {editingId ? 'Edit Customer' : 'Add New Customer'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
                  <input type="text" name="fullname" value={formData.fullname} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Customer Name" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-blue-500 outline-none" placeholder="customer@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Phone *</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-blue-500 outline-none" placeholder="+923000000000" />
                </div>
                
                {/* Country & City Selection */}
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

                <div className="pt-2 border-t font-semibold text-gray-700 text-xs uppercase tracking-wider">Reference Information</div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Reference Name *</label>
                  <input type="text" name="refname" value={formData.refname} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Reference Name" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Reference Number *</label>
                  <input type="text" name="refnumber" value={formData.refnumber} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Reference Number" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Reference Email *</label>
                  <input type="email" name="refemail" value={formData.refemail} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-blue-500 outline-none" placeholder="ref@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Reference Address *</label>
                  <textarea name="refaddress" value={formData.refaddress} onChange={handleChange} required rows={2} className="w-full border rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Reference Address..." />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50">
                  {editingId ? 'Update Customer' : 'Save Customer'}
                </button>
                {editingId && (
                  <button type="button" onClick={() => { setEditingId(null); setFormData({ fullname: '', email: '', phone: '', country: 'Pakistan', city: 'Lahore', address: '', refname: '', refnumber: '', refemail: '', refaddress: '' }); }} className="bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-300 transition">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Customer Table, Filter & Pagination Section */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 flex flex-col justify-between">
            
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                <h2 className="text-lg font-semibold text-gray-800">All Customers List</h2>
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

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase bg-gray-50/50">
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Reference</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {currentCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-400">
                          No customers found.
                        </td>
                      </tr>
                    ) : (
                      currentCustomers.map((c) => (
                        <tr key={c.id} className="hover:bg-gray-50/80 transition">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-gray-800">{c.fullname}</div>
                            <div className="text-xs text-gray-400">{c.email}</div>
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
                            <button
                              onClick={() => handleEdit(c)}
                              className="text-blue-600 hover:text-blue-800 text-xs font-medium bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(c.id)}
                              className="text-red-500 hover:text-red-700 text-xs font-medium bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition"
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

            {/* Pagination Buttons & Info */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm text-gray-600">
                <div>
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, customers.length)} of {customers.length} entries
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1.5 font-medium bg-blue-50 text-blue-600 rounded-lg">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 border rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}