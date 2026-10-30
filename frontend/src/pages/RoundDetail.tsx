import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { roundService } from '../services/roundService';
import { paymentService } from '../services/paymentService';
import { Round, Payment } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { API_URL } from '../services/api';

export const RoundDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const roundId = Number(id);

  const { user: currentUser } = useAuth();

  const [round, setRound] = useState<Round | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (roundId) {
      loadData();
    }
  }, [roundId]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await roundService.findOne(roundId);
      const rData = res.data?.data || res.data;
      setRound(rData);

      try {
        const payRes = await paymentService.findByRound(roundId);
        const pData = payRes.data?.data || payRes.data || [];
        setPayments(Array.isArray(pData) ? pData : []);
      } catch (e) {
        // ignore
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Raund ma’lumotlarini yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = async () => {
    setError('');
    setSuccess('');
    setActionLoading(true);

    try {
      // POST /payments body: { roundId }
      await paymentService.create(roundId);
      setSuccess('To‘lov yozuvi muvaffaqiyatli yaratildi!');
      await loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'To‘lov yaratishda xatolik yuz berdi');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePay = async (paymentId: number) => {
    setError('');
    setSuccess('');
    setActionLoading(true);

    try {
      // PATCH /payments/:id/pay (no body)
      await paymentService.pay(paymentId);
      setSuccess('To‘lov muvaffaqiyatli amalga oshirildi!');
      await loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'To‘lov qilishda xatolik yuz berdi');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!round) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center text-gray-500">
        <p>Raund topilmadi</p>
        <Link to="/gaps" className="text-indigo-600 hover:underline text-sm mt-2 inline-block">
          Gaplarga qaytish
        </Link>
      </div>
    );
  }

  const receiverAvatar = round.receiver?.avatar
    ? `${API_URL.replace('/api/v1', '')}/${round.receiver.avatar.replace(/^\//, '')}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
        round.receiver?.fullName || 'Receiver'
      )}&background=10b981&color=fff`;

  const myPayment = payments.find((p) => p.userId === currentUser?.id);

  return (
    <div className="space-y-8">
      {/* Back Link */}
      <div>
        <Link
          to={`/gaps/${round.gapId}`}
          className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-indigo-600 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Gap tafsilotlariga qaytish</span>
        </Link>
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

      {/* Round Info Card */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-100 text-indigo-800">
                Raund #{round.roundNumber}
              </span>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  round.status === 'COMPLETED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : round.status === 'ACTIVE'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                STATUS: {round.status}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              Gap #{round.gapId} - Raund #{round.roundNumber}
            </h1>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-100 p-4 rounded-2xl flex items-center space-x-4">
            <img
              src={receiverAvatar}
              alt={round.receiver?.fullName}
              className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400"
            />
            <div>
              <div className="text-xs text-emerald-800 font-semibold uppercase">Pul Oluvchi A'zo</div>
              <div className="font-bold text-gray-900">{round.receiver?.fullName}</div>
              <div className="text-xs text-gray-500">{round.receiver?.phone}</div>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Raund To‘lovlari Ro'yxati ({payments.length})
            </h2>

            {!myPayment && (
              <button
                onClick={handleCreatePayment}
                disabled={actionLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition flex items-center space-x-1 cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>To‘lov yaratish</span>
              </button>
            )}
          </div>

          {payments.length === 0 ? (
            <div className="py-8 text-center text-gray-500 text-sm space-y-3">
              <p>Hali bu raund uchun to‘lovlar shakllantirilmagan.</p>
              <button
                onClick={handleCreatePayment}
                disabled={actionLoading}
                className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg text-xs cursor-pointer"
              >
                To‘lov shakllantirish
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                    <th className="py-3 px-4 rounded-l-xl">Ishtirokchi</th>
                    <th className="py-3 px-4">Summa</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Sana</th>
                    <th className="py-3 px-4 rounded-r-xl text-right">Amal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {payments.map((payment) => {
                    const isMyPayment = payment.userId === currentUser?.id;
                    const canPay = isMyPayment && payment.status === 'PENDING';

                    return (
                      <tr key={payment.id} className="hover:bg-gray-50/50 transition">
                        <td className="py-4 px-4">
                          <div className="font-semibold text-gray-900">
                            {payment.user?.fullName || `User #${payment.userId}`}
                          </div>
                          <div className="text-xs text-gray-400">{payment.user?.phone}</div>
                        </td>
                        <td className="py-4 px-4 font-bold text-gray-900">
                          {payment.amount ? `${payment.amount.toLocaleString('uz-UZ')} so‘m` : '-'}
                        </td>
                        <td className="py-4 px-4">
                          {payment.status === 'PAID' ? (
                            <span className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>TO'LANGAN</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">
                              <Clock className="w-3.5 h-3.5" />
                              <span>KUTILMOQDA</span>
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-xs text-gray-500">
                          {payment.paidAt
                            ? new Date(payment.paidAt).toLocaleDateString('uz-UZ')
                            : '-'}
                        </td>
                        <td className="py-4 px-4 text-right">
                          {canPay ? (
                            <button
                              onClick={() => handlePay(payment.id)}
                              disabled={actionLoading}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-1.5 rounded-lg text-xs shadow-xs transition cursor-pointer disabled:opacity-50 inline-flex items-center space-x-1"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>To‘lash</span>
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">
                              {payment.status === 'PAID' ? 'Bajarildi' : 'Kutilmoqda'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
