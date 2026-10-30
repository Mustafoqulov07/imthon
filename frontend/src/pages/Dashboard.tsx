import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { gapService } from '../services/gapService';
import { Gap } from '../types';
import { useAuth } from '../context/AuthContext';
import { Plus, Users, Calendar, Coins, ArrowRight, ShieldCheck, CheckCircle2, Clock, Sparkles } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [gaps, setGaps] = useState<Gap[]>([]);
  const [loading, setLoading] = useState(true);

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

  const activeGaps = gaps.filter((g) => g.status === 'ACTIVE');
  const completedGaps = gaps.filter((g) => g.status === 'COMPLETED');
  const totalMonthlyAmount = activeGaps.reduce((acc, g) => acc + g.monthlyAmount, 0);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-indigo-100 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Xush kelibsiz!</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Salom, {user?.fullName}! 👋</h1>
          <p className="mt-2 text-indigo-100 text-sm leading-relaxed">
            Gap platformasiga xush kelibsiz. Bu yerda siz o‘zingizning jamoaviy gaplaringizni boshqarishingiz, navbatlarni kuzatishingiz va to‘lovlarni amalga oshirishingiz mumkin.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/gaps"
              className="bg-white text-indigo-600 font-semibold px-5 py-2.5 rounded-xl shadow-md hover:bg-indigo-50 transition flex items-center space-x-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi Gap Yaratish</span>
            </Link>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 opacity-15 pointer-events-none">
          <Coins className="w-96 h-96" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-gray-900">{activeGaps.length}</div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Faol Gaplar</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Coins className="w-7 h-7" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-gray-900">
              {totalMonthlyAmount.toLocaleString('uz-UZ')} so‘m
            </div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Oylik Majburiyat</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-gray-900">{completedGaps.length}</div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Yakunlangan Gaplar</div>
          </div>
        </div>
      </div>

      {/* Recent / My Gaps Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Sizning Gaplaringiz</h2>
            <p className="text-xs text-gray-500">Siz a’zo bo‘lgan yoki tashkil qilgan gaplar ro‘yxati</p>
          </div>
          <Link
            to="/gaps"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
          >
            <span>Barchasi</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : gaps.length === 0 ? (
          <div className="py-12 text-center text-gray-500 space-y-3">
            <Users className="w-12 h-12 mx-auto text-gray-300" />
            <p className="text-sm">Hozircha sizda hechnarsa yo‘q.</p>
            <Link
              to="/gaps"
              className="inline-block text-xs bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg"
            >
              Gap Yaratish
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gaps.slice(0, 6).map((gap) => (
              <div
                key={gap.id}
                className="bg-gray-50/70 border border-gray-200/80 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800">
                      ID: #{gap.id}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        gap.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : gap.status === 'COMPLETED'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {gap.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-base mb-1">{gap.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-4">
                    {gap.description || 'Tavsif mavjud emas'}
                  </p>

                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1.5 text-gray-500">
                        <Coins className="w-4 h-4 text-indigo-500" />
                        <span>Oylik to‘lov:</span>
                      </span>
                      <span className="font-semibold text-gray-900">
                        {gap.monthlyAmount.toLocaleString('uz-UZ')} so‘m
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1.5 text-gray-500">
                        <Users className="w-4 h-4 text-indigo-500" />
                        <span>A'zolar:</span>
                      </span>
                      <span className="font-semibold text-gray-900">
                        {gap.members?.length || 0} / {gap.maxMembers} ta
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1.5 text-gray-500">
                        <Calendar className="w-4 h-4 text-indigo-500" />
                        <span>Davomiylik:</span>
                      </span>
                      <span className="font-semibold text-gray-900">{gap.duration} oy</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-200/60 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Tashkilotchi: <strong className="text-gray-800">{gap.organizer?.fullName || 'Noma\'lum'}</strong>
                  </span>
                  <Link
                    to={`/gaps/${gap.id}`}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                  >
                    <span>Batafsil</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
