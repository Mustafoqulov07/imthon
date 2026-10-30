import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { deviceService } from '../services/deviceService';
import { Device } from '../types';
import { API_URL } from '../services/api';
import {
  User as UserIcon,
  Phone,
  Camera,
  Laptop,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, updateUser, logout } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [devices, setDevices] = useState<Device[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setPhone(user.phone);
    }
    fetchDevices();
  }, [user]);

  const fetchDevices = async () => {
    setLoadingDevices(true);
    try {
      const res = await deviceService.findAll();
      const data = res.data?.data || res.data || [];
      setDevices(Array.isArray(data) ? data : []);
    } catch (e) {
      // ignore
    } finally {
      setLoadingDevices(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    setSuccess('');
    setUpdating(true);

    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone;
    }

    try {
      const formData = new FormData();
      formData.append('fullName', fullName);
      formData.append('phone', formattedPhone);
      if (avatarFile) {
        formData.append('file', avatarFile);
      }

      const res = await userService.update(user.id, formData);
      const updatedData = res.data?.data?.data || res.data?.data || res.data;

      if (updatedData) {
        updateUser(updatedData);
      }
      setSuccess('Profil ma’lumotlari muvaffaqiyatli yangilandi!');
      setAvatarFile(null);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (Array.isArray(msg)) {
        setError(msg.join(', '));
      } else {
        setError(msg || 'Profilni yangilashda xatolik yuz berdi');
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteDevice = async (deviceId: number) => {
    try {
      await deviceService.remove(deviceId);
      fetchDevices();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Qurilmani o‘chirishda xatolik');
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    if (
      !window.confirm(
        'Haqiqatan ham hisobingizni o‘chirib tashlamoqchimisiz?'
      )
    ) {
      return;
    }

    setError('');
    setDeleting(true);

    try {
      await userService.remove(user.id);
      await logout();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Hisobni o‘chirishda xatolik yuz berdi');
    } finally {
      setDeleting(false);
    }
  };

  const currentAvatarUrl = avatarPreview
    ? avatarPreview
    : user?.avatar
    ? `${API_URL.replace('/api/v1', '')}/${user.avatar.replace(/^\//, '')}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=6366f1&color=fff`;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mening Profilim</h1>
        <p className="text-gray-500 text-sm">Shaxsiy ma'lumotlar va qurilmalarni boshqarish</p>
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

      {/* Main Profile Edit Card */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-8">
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex items-center space-x-6">
            <div className="relative group">
              <img
                src={currentAvatarUrl}
                alt={user?.fullName}
                className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100 shadow-md"
              />
              <label className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full shadow-lg cursor-pointer transition">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{user?.fullName}</h2>
              <p className="text-xs text-gray-500">{user?.phone}</p>
              <p className="text-xs text-indigo-600 font-semibold mt-1">
                Roli: {user?.role === 'SUPER_ADMIN' ? 'SUPER ADMIN' : 'ODDIY FOYDALANUVCHI'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                F.I.SH (Ism va Familiya)
              </label>
              <div className="relative">
                <UserIcon className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Telefon Raqam (+998...)
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={updating}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md transition text-sm cursor-pointer disabled:opacity-50"
            >
              {updating ? 'Saqlanmoqda...' : 'Ma\'lumotlarni Saqlash'}
            </button>
          </div>
        </form>
      </div>

      {/* Connected Devices */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Ulangan Qurilmalar va Sessiyalar</h2>
          <p className="text-xs text-gray-500">Hisobingizga ulangan qurilmalar ro‘yxati</p>
        </div>

        {loadingDevices ? (
          <div className="py-6 flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          </div>
        ) : devices.length === 0 ? (
          <p className="text-xs text-gray-400">Faol qurilmalar topilmadi</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {devices.map((d) => (
              <div key={d.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Laptop className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-semibold text-gray-800 line-clamp-1">
                      {d.device || 'Noma\'lum qurilma'}
                    </div>
                    <div className="text-[11px] text-gray-400">
                      Sessiya ID: #{d.id} | {new Date(d.createdAt).toLocaleDateString('uz-UZ')}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteDevice(d.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg text-xs transition cursor-pointer"
                  title="Sessiyani yakunlash"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danger Zone: Account Deletion */}
      <div className="bg-red-50/50 rounded-3xl p-8 border border-red-100 space-y-4">
        <div className="flex items-center space-x-3 text-red-700">
          <ShieldAlert className="w-6 h-6" />
          <h2 className="text-lg font-bold">Xavfli Hudud (Hisobni O'chirish)</h2>
        </div>
        <p className="text-xs text-red-600 leading-relaxed">
          Diqqat: Hisobingizni o‘chirsangiz, barcha ma’lumotlaringiz o‘chib ketadi. Faqat faol gaplarda a’zo bo‘lmagan taqdiringizdagina hisobingizni o‘chirish mumkin.
        </p>

        <div className="pt-2">
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition text-xs cursor-pointer disabled:opacity-50 inline-flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>{deleting ? 'O‘chirilmoqda...' : 'Hisobni Batamom O‘chirish'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
