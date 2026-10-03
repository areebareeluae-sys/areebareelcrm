'use client';

import { useState } from 'react';
import UserRow from './UserRow';

export default function UserTableManager({ initialUsers, updateUser, deleteUser }: { initialUsers: any[], updateUser: any, deleteUser: any }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = initialUsers.filter((user) => {
    if (!user) return false;
    const query = searchQuery.toLowerCase();
    return (
      (user.name && user.name.toLowerCase().includes(query)) ||
      (user.email && user.email.toLowerCase().includes(query)) ||
      (user.phone && user.phone.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-4">
      {/* Search Input Bar */}
      <div className="bg-white p-4 rounded shadow flex items-center justify-between">
        <input 
          type="text"
          placeholder="Search by Name, Email, or Phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border p-2 rounded w-full md:w-1/3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-500">
          Total Users: {filteredUsers.length}
        </span>
      </div>

      {/* Users List Table */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Country</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">No matching users found.</td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <UserRow 
                  key={user.id} 
                  user={user} 
                  updateUser={updateUser} 
                  deleteUser={deleteUser} 
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}