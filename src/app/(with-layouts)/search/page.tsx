'use client';

import { useState, useEffect } from 'react';

export default function HorizontalTablesPage() {
  const [city, setCity] = useState('');
  const [tag, setTag] = useState('');
  const [search, setSearch] = useState('');

  const [customers, setCustomers] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [guards, setGuards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalTitle, setModalTitle] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({ city, tag, search });
        const res = await fetch(`/api/global-search?${query.toString()}`);
        const json = await res.json();
        if (json.success) {
          setCustomers(json.customers);
          setProperties(json.properties);
          setGuards(json.guards);
        }
      } catch (err) {
        console.error('Error fetching data', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [city, tag, search]);

  const handleView = (item: any, title: string) => {
    setSelectedItem(item);
    setModalTitle(title);
  };

  return (
    <div style={{ maxWidth: '1500px', margin: '30px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#1e3a8a', marginBottom: '5px' }}>Global Filter & Horizontal Tables</h2>
      <p style={{ color: '#6b7280', marginBottom: '25px', fontSize: '14px' }}>
        City aur Tags ke zariye data filter karein. Teeno tables ab side-by-side horizontally show ho rahi hain.
      </p>

      {/* Global Filter Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '5px' }}>SEARCH</label>
          <input
            type="text"
            placeholder="Search name, title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '5px' }}>FILTER BY CITY</label>
          <input
            type="text"
            placeholder="e.g. Lahore..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '5px' }}>FILTER BY TAGS</label>
          <input
            type="text"
            placeholder="e.g. DHA..."
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
          />
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>Data load ho raha hai...</p>
      ) : (
        /* Horizontal Side-by-Side Grid Layout */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px', alignItems: 'start' }}>
          
          {/* 1. CUSTOMERS TABLE */}
          <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <h3 style={{ color: '#c2410c', marginBottom: '15px', fontSize: '16px', borderBottom: '2px solid #ffedd5', paddingBottom: '8px' }}>
              👥 Customers ({customers.length})
            </h3>
            <div style={{ overflowX: 'auto', maxHeight: '500px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb', color: '#374151' }}>
                    <th style={{ padding: '10px' }}>Name</th>
                    <th style={{ padding: '10px' }}>Phone</th>
                    <th style={{ padding: '10px' }}>City</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length === 0 ? (
                    <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>No customers found.</td></tr>
                  ) : (
                    customers.map((c) => (
                      <tr key={c.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '10px', fontWeight: '500' }}>{c.fullname}</td>
                        <td style={{ padding: '10px', color: '#4b5563' }}>{c.phone}</td>
                        <td style={{ padding: '10px', color: '#4b5563' }}>{c.city}</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <button onClick={() => handleView(c, 'Customer Details')} style={{ background: '#f97316', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. PROPERTIES TABLE */}
          <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <h3 style={{ color: '#1d4ed8', marginBottom: '15px', fontSize: '16px', borderBottom: '2px solid #dbeafe', paddingBottom: '8px' }}>
              🏢 Properties ({properties.length})
            </h3>
            <div style={{ overflowX: 'auto', maxHeight: '500px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb', color: '#374151' }}>
                    <th style={{ padding: '10px' }}>Title</th>
                    <th style={{ padding: '10px' }}>Type</th>
                    <th style={{ padding: '10px' }}>City</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.length === 0 ? (
                    <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>No properties found.</td></tr>
                  ) : (
                    properties.map((p) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '10px', fontWeight: '500' }}>{p.title}</td>
                        <td style={{ padding: '10px', color: '#4b5563' }}>{p.type}</td>
                        <td style={{ padding: '10px', color: '#4b5563' }}>{p.city}</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <button onClick={() => handleView(p, 'Property Details')} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. SECURITY GUARDS TABLE */}
          <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <h3 style={{ color: '#15803d', marginBottom: '15px', fontSize: '16px', borderBottom: '2px solid #dcfce7', paddingBottom: '8px' }}>
              🛡 Security Guards ({guards.length})
            </h3>
            <div style={{ overflowX: 'auto', maxHeight: '500px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb', color: '#374151' }}>
                    <th style={{ padding: '10px' }}>Guard</th>
                    <th style={{ padding: '10px' }}>Building</th>
                    <th style={{ padding: '10px' }}>Contact</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {guards.length === 0 ? (
                    <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>No guards found.</td></tr>
                  ) : (
                    guards.map((g) => (
                      <tr key={g.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '10px', fontWeight: '500' }}>{g.securityGuard}</td>
                        <td style={{ padding: '10px', color: '#4b5563' }}>{g.buildingName}</td>
                        <td style={{ padding: '10px', color: '#4b5563' }}>{g.contactNumber}</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <button onClick={() => handleView(g, 'Guard Details')} style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* POPUP MODAL */}
      {selectedItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '25px', borderRadius: '10px', width: '550px', maxWidth: '90%', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#1e3a8a' }}>{modalTitle}</h3>
            
            <div style={{ maxHeight: '60vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#374151' }}>
              {Object.entries(selectedItem).map(([key, value]) => (
                <div key={key} style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ textTransform: 'uppercase', fontSize: '11px', color: '#6b7280', width: '40%' }}>{key}</strong>
                  <span style={{ width: '60%', textAlign: 'right', wordBreak: 'break-all' }}>{String(value || 'N/A')}</span>
                </div>
              ))}
            </div>

            <button onClick={() => setSelectedItem(null)} style={{ marginTop: '20px', width: '100%', background: '#ef4444', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}