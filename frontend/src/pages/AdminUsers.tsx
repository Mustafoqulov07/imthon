import React, { useEffect, useState } from 'react';
import { userService } from '../services/userService';
import { User, Status } from '../types';
import { Shield, Search, UserX, UserCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { API_URL } from '../services/api';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await userService.findAll();
      const data = res.data?.data || res.data || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Foydalanuvchilarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userItem: User) => {
    const newStatus: Status = userItem.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setError('');
    setSuccess('');

    try {
      await userService.updateStatus(userItem.id, newStatus);
      setSuccess(`${userItem.fullName} statusi ${newStatus} ga o‘zgartirildi`);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Statusni o‘zgartirishda xatolik');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-amber-500" />
            <h1 className="text-2xl font-bold text-gray-900">Foydalanuvchilarni Boshqarish</h1>
          </div>
          <p className="text-gray-500 text-sm">Super Admin uchun tizimdagi barcha foydalanuvchilar ro‘yxati</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Qidirish (ism yoki tel)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-center text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-r-xl flex items-center text-green-700 text-sm">
          <CheckCircle2 className="w-5 h-5 mr-3 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {loading ? (
        <div className="py-16 flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                  <th className="py-4 px-6">Foydalanuvchi</th>
                  <th className="py-4 px-6">Telefon</th>
                  <th className="py-4 px-6">Rol</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Ro‘yxatdan o‘tgan</th>
                  <th className="py-4 px-6 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredUsers.map((u) => {
                  const avatarUrl = u.avatar
                    ? `${API_URL.replace('/api/v1', '')}/${u.avatar.replace(/^\//, '')}`
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        u.fullName
                      )}&background=6366f1&color=fff`;

                  return (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <img
                            src={avatarUrl}
                            alt={u.fullName}
                            className="w-9 h-9 rounded-full object-cover border border-gray-200"
                          />
                          <div>
                            <div className="font-bold text-gray-900">{u.fullName}</div>
                            <div className="text-xs text-gray-400">ID: #{u.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-800">{u.phone}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            u.role === 'SUPER_ADMIN'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-gray-500">
                        {new Date(u.createdAt).toLocaleDateString('uz-UZ')}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {u.role !== 'SUPER_ADMIN' && (
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer inline-flex items-center space-x-1 ${
                              u.status === 'ACTIVE'
                                ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {u.status === 'ACTIVE' ? (
                              <>
                                <UserX className="w-3.5 h-3.5" />
                                <span>Bloklash</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Faollashtirish</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
