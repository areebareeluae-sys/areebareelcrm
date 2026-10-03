import { getUsers, addUser, deleteUser, updateUser } from '../../../api/users/route';
import UserTableManager from './UserTableManager';

export default async function UsersPage() {
  const allUsers = await getUsers();

  return (
    <div className="p-8 max-w-6xl mx-auto text-center space-y-8">
      <h1 className="text-2xl font-bold">User Management Dashboard</h1>

      {/* Add User Form */}
      <form action={addUser} className="bg-white p-6 rounded shadow grid grid-cols-1 md:grid-cols-2 gap-4">
        <h2 className="text-xl font-semibold col-span-full">Add New User</h2>
        <input name="name" placeholder="Full Name" required className="border p-2 rounded" />
        <input name="email" type="email" placeholder="Email" required className="border p-2 rounded" />
        <input name="password" type="password" placeholder="Password" required className="border p-2 rounded" />
        <input name="phone" placeholder="Phone" required className="border p-2 rounded" />
        <input name="country" placeholder="Country" required className="border p-2 rounded col-span-full" />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded col-span-full hover:bg-blue-700">
          Add User
        </button>
      </form>

      {/* Search & Users Table Manager */}
      <UserTableManager 
        initialUsers={allUsers} 
        updateUser={updateUser} 
        deleteUser={deleteUser} 
      />
    </div>
  );
}