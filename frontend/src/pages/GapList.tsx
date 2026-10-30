import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { gapService } from '../services/gapService';
import { Gap } from '../types';
import { Plus, Users, Calendar, Coins, ArrowRight, X, AlertCircle } from 'lucide-react';

export const GapList: React.FC = () => {
  const [gaps, setGaps] = useState<Gap[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state (duration is NOT included as backend calculates it)
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [maxMembers, setMaxMembers] = useState(5);
  const [monthlyAmount, setMonthlyAmount] = useState(500000);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchGaps();
  }, []);

  const fetchGaps = async () => {
    try {
      const res = await gapService.findAll();
      const data = res.data?.data || res.data || [];
      setGaps(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGap = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      await gapService.create({
        name,
        description: description || undefined,
        maxMembers: Number(maxMembers),
        monthlyAmount: Number(monthlyAmount),
      });
      setShowModal(false);
      setName('');
      setDescription('');
      fetchGaps();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (Array.isArray(msg)) {
        setFormError(msg.join(', '));
      } else {
        setFormError(msg || 'Gap yaratishda xatolik yuz berdi');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gaplar Ro‘yxati</h1>
          <p className="text-gray-500 text-sm">Barcha mavjud va yaratilgan gaplar bilan tanishing</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-md transition flex items-center justify-center space-x-2 text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Gap Yaratish</span>
        </button>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : gaps.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500 space-y-3">
          <Users className="w-12 h-12 mx-auto text-gray-300" />
          <p className="text-sm font-medium">Hozircha hech qanday gap yaratilmagan.</p>
          <button
            onClick={() => setShowModal(true)}
            className="text-xs bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg cursor-pointer"
          >
            Birinchi Gapni Yaratish
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gaps.map((gap) => (
            <div
              key={gap.id}
              className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    ID: #{gap.id}
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      gap.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : gap.status === 'COMPLETED'
                        ? 'bg-purple-50 text-purple-700 border border-purple-100'
                        : 'bg-red-50 text-red-700 border border-red-100'
                    }`}
                  >
                    {gap.status}
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 text-lg mb-1">{gap.name}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 mb-4">
                  {gap.description || 'Tavsif berilmagan'}
                </p>

                <div className="space-y-2.5 text-xs text-gray-600">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="flex items-center space-x-2 text-gray-500">
                      <Coins className="w-4 h-4 text-indigo-500" />
                      <span>Oylik summasi:</span>
                    </span>
                    <span className="font-bold text-gray-900">
                      {gap.monthlyAmount.toLocaleString('uz-UZ')} so‘m
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="flex items-center space-x-2 text-gray-500">
                      <Users className="w-4 h-4 text-indigo-500" />
                      <span>Qatnashchilar:</span>
                    </span>
                    <span className="font-bold text-gray-900">
                      {gap.members?.length || 0} / {gap.maxMembers} ta
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="flex items-center space-x-2 text-gray-500">
                      <Calendar className="w-4 h-4 text-indigo-500" />
                      <span>Davomiylik (oy):</span>
                    </span>
                    <span className="font-bold text-gray-900">{gap.duration || gap.maxMembers} oy</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Tashkilotchi: <strong className="text-gray-800">{gap.organizer?.fullName || 'Noma\'lum'}</strong>
                </span>
                <Link
                  to={`/gaps/${gap.id}`}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-3 py-1.5 rounded-lg text-xs transition flex items-center space-x-1"
                >
                  <span>Ko‘rish</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for creating Gap */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-900">Yangi Gap Yaratish</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-center text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateGap} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Gap Nomi
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Do'stlar gapi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Tavsif (ixtiyoriy)
                </label>
                <textarea
                  rows={2}
                  placeholder="Har oy pul yig'amiz..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Maksimal A'zolar Soni
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={100}
                    step={1}
                    required
                    value={maxMembers}
                    onChange={(e) => setMaxMembers(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Oylik Summa (so'm)
                  </label>
                  <input
                    type="number"
                    min={10000}
                    step={10000}
                    required
                    value={monthlyAmount}
                    onChange={(e) => setMonthlyAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Yaratilmoqda...' : 'Yaratish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
