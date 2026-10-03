'use client';

import { useState } from 'react';

export default function UserRow({ user, updateUser, deleteUser }: { user: any, updateUser: any, deleteUser: any }) {
  if (!user) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <tr className="border-b hover:bg-gray-50 align-middle">
      {!isEditing ? (
        <>
          <td className="p-3 font-medium">{user.name}</td>
          <td className="p-3 text-gray-500">{user.email}</td>
          <td className="p-3">{user.phone}</td>
          <td className="p-3">{user.country}</td>
          <td className="p-3 text-center space-x-2 whitespace-nowrap">
            <button 
              onClick={() => setIsEditing(true)} 
              className="bg-amber-500 text-white px-3 py-1 rounded text-xs hover:bg-amber-600"
            >
              Edit
            </button>
            <form action={deleteUser.bind(null, user.id)} className="inline">
              <button type="submit" className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600">
                Delete
              </button>
            </form>
          </td>
        </>
      ) : (
        <td colSpan={5} className="p-3 bg-gray-50">
          <form 
            action={async (formData) => {
              await updateUser(user.id, formData);
              setIsEditing(false);
            }} 
            className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center w-full"
          >
            <input 
              name="name" 
              defaultValue={user.name} 
              placeholder="Name" 
              className="border p-1.5 rounded text-sm bg-white" 
              required 
            />
            <input 
              type="email" 
              value={user.email} 
              disabled 
              className="border p-1.5 rounded text-sm bg-gray-100 text-gray-500 cursor-not-allowed" 
            />
            <input 
              name="phone" 
              defaultValue={user.phone} 
              placeholder="Phone" 
              className="border p-1.5 rounded text-sm bg-white" 
              required 
            />
            <input 
              name="country" 
              defaultValue={user.country} 
              placeholder="Country" 
              className="border p-1.5 rounded text-sm bg-white" 
              required 
            />
            <div className="flex items-center gap-1">
              <div className="relative flex items-center w-full">
                <input 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  defaultValue={user.password} 
                  placeholder="Password" 
                  className="border p-1.5 rounded text-sm w-full pr-12 bg-white" 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 text-xs text-blue-600 font-semibold hover:underline"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <button 
                type="submit" 
                className="bg-green-600 text-white px-3 py-1.5 rounded text-xs hover:bg-green-700 whitespace-nowrap"
              >
                Save
              </button>
              <button 
                type="button" 
                onClick={() => setIsEditing(false)} 
                className="bg-gray-400 text-white px-3 py-1.5 rounded text-xs hover:bg-gray-500 whitespace-nowrap"
              >
                Cancel
              </button>
            </div>
          </form>
        </td>
      )}
    </tr>
  );
}