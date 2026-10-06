'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function ClientLeadPage({
  allCustomers,
  dueLeads,
  selectedCustomerId,
  selectedCustomer,
  history,
  searchQuery,
  saveLeadAction,
}: {
  allCustomers: any[];
  dueLeads: any[];
  selectedCustomerId: string;
  selectedCustomer: any;
  history: any[];
  searchQuery: string;
  saveLeadAction: (formData: FormData) => Promise<void>;
}) {
  const router = useRouter();
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // State for viewing full remarks in a popup modal
  const [viewingRemark, setViewingRemark] = useState<string | null>(null);
  
  // Transition hook for handling Server Action loading state
  const [isPending, startTransition] = useTransition();
  
  // Live filter state
  const [liveSearchTxt, setLiveSearchTxt] = useState('');

  // Pagination States
  const [customerPage, setCustomerPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [duePage, setDuePage] = useState(1);
  const itemsPerPage = 10;

  // Get today's date in YYYY-MM-DD format for date input min attribute
  const todayDateStr = new Date().toISOString().split('T')[0];

  // Live filtering on frontend for instant response
  const filteredCustomers = allCustomers.filter((c) => {
    const q = liveSearchTxt.toLowerCase();
    return (
      c.fullname.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    );
  });

  // Pagination Slicing Helpers
  const paginatedCustomers = filteredCustomers.slice((customerPage - 1) * itemsPerPage, customerPage * itemsPerPage);
  const totalCustomerPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  const paginatedHistory = history.slice((historyPage - 1) * itemsPerPage, historyPage * itemsPerPage);
  const totalHistoryPages = Math.ceil(history.length / itemsPerPage);

  const paginatedDueLeads = dueLeads.slice((duePage - 1) * itemsPerPage, duePage * itemsPerPage);
  const totalDuePages = Math.ceil(dueLeads.length / itemsPerPage);

  // Reset filter function
  const handleResetFilter = () => {
    setLiveSearchTxt('');
    setCustomerPage(1);
  };

  // Handler to wrap form submission, clear form, and refresh router
  const handleSubmitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    
    startTransition(async () => {
      await saveLeadAction(formData);
      form.reset();
      router.refresh();
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Lead Management & Follow-ups</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT SECTION: Selected Customer Info & Lead Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 shadow rounded-lg border space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-700">Customer Details</h2>
              <button
                onClick={() => {
                  setLiveSearchTxt('');
                  setCustomerPage(1);
                  setIsCustomerModalOpen(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 shadow"
              >
                🔍 Select / Search Customer
              </button>
            </div>

            {selectedCustomer ? (
              <div className="p-4 bg-gray-50 rounded border text-sm space-y-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p><strong>Name:</strong> <span className="text-black font-semibold">{selectedCustomer.fullname}</span></p>
                    <p><strong>Phone:</strong> <a href={`tel:${selectedCustomer.phone}`} className="text-blue-600 underline">{selectedCustomer.phone}</a></p>
                    <p><strong>Email:</strong> {selectedCustomer.email}</p>
                    <p><strong>City/Country:</strong> {selectedCustomer.city}, {selectedCustomer.country}</p>
                  </div>
                  <button
                    onClick={() => {
                      setHistoryPage(1);
                      setIsHistoryOpen(true);
                    }}
                    className="bg-purple-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-purple-700 shadow"
                  >
                    📜 View History ({history.length})
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-gray-50 border border-dashed rounded text-center text-gray-500 text-sm">
                No customer selected. Click "Select / Search Customer" to choose a customer and view their details.
              </div>
            )}
          </div>

          {/* Lead Entry Form */}
          <div className="bg-white p-6 shadow rounded-lg border">
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Add New Lead / Follow-up</h2>
            <form onSubmit={handleSubmitForm} className="space-y-4">
              <input type="hidden" name="customerId" value={selectedCustomerId} />

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Next Follow-up Date</label>
                <input
                  type="date"
                  name="nextFollowupDate"
                  min={todayDateStr}
                  required
                  className="w-full border rounded p-2 text-sm text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Remarks / Call Notes</label>
                <textarea
                  name="remarks"
                  rows={3}
                  required
                  placeholder="Yahan call ki details likhein..."
                  className="w-full border rounded p-2 text-sm text-black"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={!selectedCustomerId || isPending}
                className={`w-full py-2 rounded text-white font-medium flex items-center justify-center gap-2 ${
                  selectedCustomerId && !isPending ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {isPending && (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isPending ? 'Saving...' : 'Save Lead Update'}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT SECTION: Today's Follow-up Calls / Due Leads with Pagination (5 Cols) */}
        <div className="lg:col-span-5">
          <div className="bg-white p-4 shadow rounded-lg border sticky top-4">
            <h2 className="text-lg font-semibold mb-3 text-blue-600">📅 Today's Follow-up Calls</h2>
            {dueLeads.length === 0 ? (
              <p className="text-gray-500 text-sm py-4 text-center">No pending follow-up calls for today.</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-100 border-b text-xs">
                        <th className="p-2">Customer</th>
                        <th className="p-2">Remarks</th>
                        <th className="p-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedDueLeads.map((item) => (
                        <tr key={item.leadId} className="border-b text-xs hover:bg-gray-50">
                          <td className="p-2">
                            <div className="font-semibold text-black">{item.customerName}</div>
                            <div className="text-gray-500">{item.phone}</div>
                          </td>
                          <td className="p-2 text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <span className="max-w-[100px] truncate" title={item.remarks}>
                                {item.remarks}
                              </span>
                              {item.remarks && (
                                <button
                                  type="button"
                                  onClick={() => setViewingRemark(item.remarks)}
                                  className="text-blue-600 underline text-[10px] font-medium hover:text-blue-800 whitespace-nowrap"
                                >
                                  [View]
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="p-2">
                            <button
                              onClick={() => router.push(`/leads?customerId=${item.customerId}`)}
                              className="bg-blue-600 text-white px-2 py-1 rounded text-[11px] hover:bg-blue-700 whitespace-nowrap"
                            >
                              Call / Select
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Due Leads Pagination Controls */}
                {totalDuePages > 1 && (
                  <div className="flex justify-between items-center mt-3 pt-2 border-t text-xs">
                    <span>Page {duePage} of {totalDuePages}</span>
                    <div className="space-x-1">
                      <button
                        onClick={() => setDuePage((p) => Math.max(p - 1, 1))}
                        disabled={duePage === 1}
                        className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
                      >
                        Prev
                      </button>
                      <button
                        onClick={() => setDuePage((p) => Math.min(p + 1, totalDuePages))}
                        disabled={duePage === totalDuePages}
                        className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </div>

      {/* POPUP MODAL: VIEW FULL REMARK */}
      {viewingRemark && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 space-y-4 border border-gray-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-gray-800">💬 Remarks Detail</h3>
              <button
                onClick={() => setViewingRemark(null)}
                className="text-gray-500 hover:text-red-600 font-bold text-xl"
              >
                &times;
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded border text-sm text-gray-800 whitespace-pre-wrap max-h-[250px] overflow-y-auto">
              {viewingRemark}
            </div>
            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={() => setViewingRemark(null)}
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL 1: LIVE SEARCH & SELECT CUSTOMER */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-xl w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-gray-800">Select Customer</h3>
              <button
                onClick={() => setIsCustomerModalOpen(false)}
                className="text-gray-500 hover:text-red-600 font-bold text-lg"
              >
                &times;
              </button>
            </div>

            {/* Live Search Input & Reset Button */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Live search by Name, Phone, or ID..."
                value={liveSearchTxt}
                onChange={(e) => {
                  setLiveSearchTxt(e.target.value);
                  setCustomerPage(1);
                }}
                className="w-full border rounded p-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                type="button"
                onClick={handleResetFilter}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-300 font-medium whitespace-nowrap"
              >
                Reset
              </button>
            </div>

            <div className="min-h-[250px] max-h-[250px] overflow-y-auto border rounded divide-y">
              {filteredCustomers.length === 0 ? (
                <p className="p-4 text-sm text-center text-gray-500">Koi customer nahi mila.</p>
              ) : (
                paginatedCustomers.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setIsCustomerModalOpen(false);
                      router.push(`/leads?customerId=${c.id}`);
                    }}
                    className={`p-3 text-sm cursor-pointer flex justify-between items-center hover:bg-blue-50 ${
                      selectedCustomerId === c.id ? 'bg-blue-100 font-medium' : ''
                    }`}
                  >
                    <div>
                      <span className="text-black font-semibold">{c.fullname}</span>
                      <span className="text-gray-500 text-xs ml-2">({c.phone})</span>
                    </div>
                    <span className="text-xs text-gray-400">ID: {c.id.slice(0, 6)}...</span>
                  </div>
                ))
              )}
            </div>

            {/* Customer Selection Pagination */}
            {totalCustomerPages > 1 && (
              <div className="flex justify-between items-center text-xs pt-1">
                <span>Page {customerPage} of {totalCustomerPages}</span>
                <div className="space-x-1">
                  <button
                    onClick={() => setCustomerPage((p) => Math.max(p - 1, 1))}
                    disabled={customerPage === 1}
                    className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setCustomerPage((p) => Math.min(p + 1, totalCustomerPages))}
                    disabled={customerPage === totalCustomerPages}
                    className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={() => setIsCustomerModalOpen(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL 2: CUSTOMER HISTORY */}
      {isHistoryOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-gray-800">
                📜 History: {selectedCustomer?.fullname}
              </h3>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="text-gray-500 hover:text-red-600 font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <div className="min-h-[250px]">
              {history.length === 0 ? (
                <p className="text-gray-500 text-sm py-8 text-center">Is customer ki koi purani history mojood nahi hai.</p>
              ) : (
                <>
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-100 border-b">
                        <th className="p-2">Date</th>
                        <th className="p-2">Remarks</th>
                        <th className="p-2">Next Follow-up</th>
                        <th className="p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedHistory.map((h) => (
                        <tr key={h.id} className="border-b">
                          <td className="p-2 text-gray-500 text-xs">{new Date(h.createdAt!).toLocaleDateString()}</td>
                          <td className="p-2 text-gray-800">
                            <div className="flex items-center gap-1.5">
                              <span className="max-w-[150px] truncate" title={h.remarks}>
                                {h.remarks}
                              </span>
                              {h.remarks && (
                                <button
                                  type="button"
                                  onClick={() => setViewingRemark(h.remarks)}
                                  className="text-blue-600 underline text-[10px] font-medium hover:text-blue-800 whitespace-nowrap cursor-pointer z-10"
                                >
                                  [View]
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="p-2 font-medium text-blue-600 text-xs">{h.nextFollowupDate}</td>
                          <td className="p-2">
                            <span className="px-2 py-0.5 text-[10px] rounded bg-yellow-100 text-yellow-800">
                              {h.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* History Pagination Controls */}
                  {totalHistoryPages > 1 && (
                    <div className="flex justify-between items-center mt-3 pt-2 border-t text-xs">
                      <span>Page {historyPage} of {totalHistoryPages}</span>
                      <div className="space-x-1">
                        <button
                          onClick={() => setHistoryPage((p) => Math.max(p - 1, 1))}
                          disabled={historyPage === 1}
                          className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
                        >
                          Prev
                        </button>
                        <button
                          onClick={() => setHistoryPage((p) => Math.min(p + 1, totalHistoryPages))}
                          disabled={historyPage === totalHistoryPages}
                          className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700"
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