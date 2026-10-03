'use client';

import React, { useState, useEffect } from 'react';
import { Search, Users, Phone, MapPin, ShieldCheck, Plus, Filter, UserCheck, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Customer {
  id: string;
  fullname: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  refname: string;
  refnumber: string;
  refemail: string;
  refaddress: string;
  status: string;
  createdAt: string;
}

export default function CustomerListPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Referral Modal State
  const [selectedReferral, setSelectedReferral] = useState<Customer | null>(null);

  // Fetch customers data from API
  useEffect(() => {
    fetchCustomers();
  }, [searchQuery, statusFilter]);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  async function fetchCustomers() {
    setLoading(true);
    try {
      const res = await fetch(`/api/customer?search=${searchQuery}&status=${statusFilter}`);
      const result = await res.json();
      if (result.success) {
        setCustomers(result.data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  }

  // Client-side filtering fallback (ID, Name, Phone)
  const filteredCustomers = customers.filter((cust) => {
    const term = searchQuery.toLowerCase();
    const matchSearch = 
      cust.fullname.toLowerCase().includes(term) ||
      cust.phone.toLowerCase().includes(term) ||
      cust.id.toLowerCase().includes(term) ||
      cust.email.toLowerCase().includes(term);

    const matchStatus = statusFilter ? cust.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="min-h-screen bg-gray-50/60 p-6 md:p-8 space-y-6 text-gray-900">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              Customer Management
            </h1>
            <p className="text-xs text-gray-500 mt-1">View and manage all registered customers, search by ID, name, or phone number.</p>
          </div>
          <Link 
            href="/customers/add-customer" 
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-sm transition"
          >
            <Plus className="w-4 h-4" /> Add New Customer
          </Link>
        </div>

        {/* Search & Filters Section */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search Input (ID, Name, Phone) */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search by ID, Name, or Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 pl-10 pr-4 py-2.5 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-48">
              <Filter className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-700 pl-10 pr-4 py-2.5 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition appearance-none cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Customer Table List */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/75 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="p-4">Customer ID</th>
                  <th className="p-4">Full Name</th>
                  <th className="p-4">Phone Number</th>
                  <th className="p-4">Email / City</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Referral Info</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400 font-medium">
                      Loading customers list...
                    </td>
                  </tr>
                ) : currentCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400 font-medium">
                      No customers found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  currentCustomers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-gray-50/60 transition">
                      <td className="p-4 font-mono font-bold text-indigo-600">
                        #{cust.id}
                      </td>
                      <td className="p-4 font-bold text-gray-900">
                        {cust.fullname}
                      </td>
                      <td className="p-4 text-gray-600 flex items-center gap-1.5 pt-5">
                        <Phone className="w-3.5 h-3.5 text-gray-400" /> {cust.phone}
                      </td>
                      <td className="p-4">
                        <div className="text-gray-900 font-medium">{cust.email}</div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-gray-400" /> {cust.city}, {cust.country}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                          cust.status === 'Active' 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                            : 'bg-rose-50 text-rose-600 border border-rose-200'
                        }`}>
                          <ShieldCheck className="w-3 h-3" /> {cust.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedReferral(cust)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition"
                        >
                          <UserCheck className="w-3.5 h-3.5" /> Check Referral
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {!loading && filteredCustomers.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gray-50/50 border-t border-gray-100 gap-4">
              <div className="text-xs text-gray-500">
                Showing <span className="font-semibold text-gray-700">{indexOfFirstItem + 1}</span> to <span className="font-semibold text-gray-700">{Math.min(indexOfLastItem, filteredCustomers.length)}</span> of <span className="font-semibold text-gray-700">{filteredCustomers.length}</span> entries
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </button>

                <span className="text-xs font-semibold text-gray-700 px-2">
                  Page {currentPage} of {totalPages || 1}
                </span>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition flex items-center gap-1"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Referral Details Modal */}
      {selectedReferral && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md overflow-hidden space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Referral Details</h3>
                  <p className="text-[11px] text-gray-500">Referred customer: <span className="font-semibold text-gray-700">{selectedReferral.fullname}</span></p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedReferral(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-2 space-y-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl space-y-2 border border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Referral Name:</span>
                  <span className="text-gray-900 font-bold">{selectedReferral.refname || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Referral Phone:</span>
                  <span className="text-gray-900 font-semibold">{selectedReferral.refnumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Referral Email:</span>
                  <span className="text-gray-900 font-semibold">{selectedReferral.refemail || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Referral Address:</span>
                  <span className="text-gray-900 font-semibold">{selectedReferral.refaddress || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-right">
              <button
                onClick={() => setSelectedReferral(null)}
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