import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { gapService } from '../services/gapService';
import { roundService } from '../services/roundService';
import { paymentService } from '../services/paymentService';
import { userService } from '../services/userService';
import { Gap, Round, Payment, User } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Calendar,
  Coins,
  Play,
  UserPlus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  XCircle,
  Search,
  X,
  Clock,
  Sparkles,
  Check,
  HandCoins,
} from 'lucide-react';
import { API_URL } from '../services/api';

export const GapDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const gapId = Number(id);

  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [gap, setGap] = useState<Gap | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [roundPaymentsMap, setRoundPaymentsMap] = useState<Record<number, Payment[]>>({});
  const [loadingRounds, setLoadingRounds] = useState(false);

  // Users for Add Member Modal
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Member Modal State
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Receiver Confirmation Modal State
  const [payConfirmTarget, setPayConfirmTarget] = useState<{
    paymentId: number;
    payerName: string;
    amount: number;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalError, setModalError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (gapId) {
      loadData();
    }
  }, [gapId]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await gapService.findOne(gapId);
      const gapData = res.data?.data || res.data;
      setGap(gapData);

      // Load rounds & payments
      await fetchRoundsAndPayments(gapId);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gap ma’lumotlarini yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoundsAndPayments = async (targetGapId: number) => {
    setLoadingRounds(true);
    try {
      const roundsRes = await roundService.findByGap(targetGapId); // GET /api/v1/round/gap/:gapId
      const rData = roundsRes.data?.data || roundsRes.data || [];
      const roundsList: Round[] = Array.isArray(rData) ? rData : [];
      setRounds(roundsList);

      // Fetch payments for each round
      const paymentsMap: Record<number, Payment[]> = {};
      await Promise.all(
        roundsList.map(async (r) => {
          try {
            const payRes = await paymentService.findByRound(r.id); // GET /api/v1/payments/round/:roundId
            const pData = payRes.data?.data || payRes.data || [];
            paymentsMap[r.id] = Array.isArray(pData) ? pData : [];
          } catch (e) {
            paymentsMap[r.id] = [];
          }
        })
      );
      setRoundPaymentsMap(paymentsMap);
    } catch (e) {
      setRounds([]);
      setRoundPaymentsMap({});
    } finally {
      setLoadingRounds(false);
    }
  };

  const fetchUsersForSelection = async () => {
    setLoadingUsers(true);
    setModalError('');
    const userMap = new Map<number, User>();

    try {
      try {
        const usersRes = await userService.findAll();
        const uData = usersRes.data?.data || usersRes.data || [];
        if (Array.isArray(uData)) {
          uData.forEach((u: User) => userMap.set(u.id, u));
        }
      } catch (e) {
        // Not SUPER_ADMIN
      }

      try {
        const gapsRes = await gapService.findAll();
        const gData = gapsRes.data?.data || gapsRes.data || [];
        if (Array.isArray(gData)) {
          gData.forEach((g: Gap) => {
            if (g.organizer) userMap.set(g.organizer.id, g.organizer);
            if (Array.isArray(g.members)) {
              g.members.forEach((m) => {
                if (m.user) userMap.set(m.user.id, m.user);
              });
            }
          });
        }
      } catch (e) {
        // ignore
      }

      setAllUsers(Array.from(userMap.values()));
    } catch (err: any) {
      setModalError('Foydalanuvchilarni yuklashda xatolik yuz berdi');
    } finally {
      setLoadingUsers(false);
    }
  };

  const openAddMemberModal = () => {
    // Only allow opening if gap.status === 'ACTIVE' && gap.duration === 0
    if (gap?.status !== 'ACTIVE' || gap?.duration !== 0) return;

    setSelectedUserId(null);
    setSearchQuery('');
    setModalError('');
    setShowMemberModal(true);
    fetchUsersForSelection();
  };

  const handleStartGap = async () => {
    if (!gap) return;
    setError('');
    setSuccess('');
    setActionLoading(true);

    try {
      await gapService.startGap(gap.id);

      try {
        await roundService.createRounds(gap.id);
      } catch (roundErr: any) {
        console.warn('Rounds creation step info:', roundErr.response?.data?.message || roundErr);
      }

      setSuccess('Gap muvaffaqiyatli boshlandi va raundlar shakllantirildi!');
      await loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Gapni boshlashda xatolik yuz berdi');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelGap = async () => {
    if (!gap || !window.confirm('Haqiqatan ham ushbu gapni bekor qilmoqchimisiz?')) return;
    setError('');
    setSuccess('');
    setActionLoading(true);

    try {
      await gapService.cancel(gap.id);
      setSuccess('Gap bekor qilindi');
      await loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Gapni bekor qilishda xatolik');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteGap = async () => {
    if (!gap || !window.confirm('Ushbu gapni o‘chirmoqchimisiz? Ushbu amalni ortga qaytarib bo‘lmaydi!')) return;
    setError('');
    setActionLoading(true);

    try {
      await gapService.remove(gap.id);
      navigate('/gaps');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Gapni o‘chirishda xatolik');
      setActionLoading(false);
    }
  };

  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    if (!selectedUserId) {
      setModalError('Foydalanuvchi tanlanmagan');
      return;
    }

    if (!gap) return;
    setActionLoading(true);

    try {
      await gapService.addMember(gap.id, selectedUserId);
      setSuccess('A’zo muvaffaqiyatli qo‘shildi!');
      setShowMemberModal(false);
      setSelectedUserId(null);
      await loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setModalError(Array.isArray(msg) ? msg.join(', ') : msg || 'A’zoni qo‘shishda xatolik yuz berdi');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (memberUserId: number) => {
    if (!gap || !window.confirm('Haqiqatan ham ushbu a’zoni gapdan chiqarmoqchimisiz?')) return;
    setError('');
    setSuccess('');
    setActionLoading(true);

    try {
      await gapService.removeMember(gap.id, memberUserId);
      setSuccess('A’zo chiqarib tashlandi');
      await loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'A’zoni chiqarishda xatolik');
    } finally {
      setActionLoading(false);
    }
  };

  // Receiver Payment Confirmation Execution Handler
  const executeReceiverPaymentConfirm = async () => {
    if (!payConfirmTarget) return;
    setError('');
    setSuccess('');
    setActionLoading(true);

    const { paymentId } = payConfirmTarget;

    try {
      await paymentService.pay(paymentId);
      setSuccess('To‘lov tasdiqlandi va pul olindi deb belgilandi!');
      setPayConfirmTarget(null);
      await loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'To‘lovni tasdiqlashda xatolik yuz berdi');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered users for modal selection
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return allUsers;
    const q = searchQuery.toLowerCase().trim();
    return allUsers.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.phone.toLowerCase().includes(q) ||
        String(u.id) === q
    );
  }, [allUsers, searchQuery]);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!gap) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center text-gray-500">
        <p>Gap topilmadi</p>
        <Link to="/gaps" className="text-indigo-600 hover:underline mt-2 inline-block text-sm">
          Ro‘yxatga qaytish
        </Link>
      </div>
    );
  }

  const isOrganizer = currentUser?.id === gap.organizerId;
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const canManage = isOrganizer || isSuperAdmin;
  const existingMemberUserIds = gap.members.map((m) => m.userId);
  const isGapFull = gap.members.length >= gap.maxMembers;

  return (
    <div className="space-y-8">
      {/* Back button & header */}
      <div className="flex items-center justify-between">
        <Link
          to="/gaps"
          className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-indigo-600 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Gaplar ro‘yxatiga qaytish</span>
        </Link>

        {canManage && (
          <div className="flex items-center space-x-2">
            {gap.status === 'ACTIVE' && rounds.length === 0 && (
              <button
                onClick={handleStartGap}
                disabled={actionLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Gapni Boshlash</span>
              </button>
            )}

            {gap.status === 'ACTIVE' && gap.duration === 0 && (
              <button
                onClick={handleCancelGap}
                disabled={actionLoading}
                className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Bekor qilish</span>
              </button>
            )}

            <button
              onClick={handleDeleteGap}
              disabled={actionLoading}
              className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>O‘chirish</span>
            </button>
          </div>
        )}
      </div>

      {/* Alerts */}
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

      {/* Gap Header Card */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-100 text-indigo-800">
                ID: #{gap.id}
              </span>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  gap.status === 'ACTIVE'
                    ? 'bg-emerald-100 text-emerald-800'
                    : gap.status === 'COMPLETED'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                STATUS: {gap.status}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900">{gap.name}</h1>
            <p className="text-gray-500 text-sm mt-1">{gap.description || 'Tavsif berilmagan'}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl flex items-center space-x-4 border border-gray-200/60">
            <div className="text-right">
              <div className="text-xs text-gray-500">Tashkilotchi:</div>
              <div className="font-bold text-gray-900">{gap.organizer?.fullName}</div>
              <div className="text-xs text-gray-400">{gap.organizer?.phone}</div>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-indigo-50/50 border border-indigo-100 p-5 rounded-2xl flex items-center space-x-4">
            <div className="p-3 bg-indigo-600 text-white rounded-xl">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase">Oylik To'lov</div>
              <div className="text-xl font-bold text-gray-900">
                {gap.monthlyAmount.toLocaleString('uz-UZ')} so‘m
              </div>
            </div>
          </div>

          <div className="bg-purple-50/50 border border-purple-100 p-5 rounded-2xl flex items-center space-x-4">
            <div className="p-3 bg-purple-600 text-white rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase">A'zolar Soni</div>
              <div className="text-xl font-bold text-gray-900">
                {gap.members?.length || 0} / {gap.maxMembers} ta
              </div>
            </div>
          </div>

          <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl flex items-center space-x-4">
            <div className="p-3 bg-emerald-600 text-white rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase">Davomiyligi</div>
              <div className="text-xl font-bold text-gray-900">{gap.duration || gap.members?.length || 0} oy</div>
            </div>
          </div>
        </div>
      </div>

      {/* Members Section */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">A'zolar Ro'yxati ({gap.members.length})</h2>
            <p className="text-xs text-gray-500">Gapda qatnashayotgan barcha a’zolar</p>
          </div>

          {/* Add Member button is ONLY visible if gap.status === 'ACTIVE' && gap.duration === 0 */}
          {canManage && gap.status === 'ACTIVE' && gap.duration === 0 && (
            <button
              onClick={openAddMemberModal}
              disabled={isGapFull}
              className={`font-semibold px-4 py-2 rounded-xl text-xs transition flex items-center space-x-1.5 cursor-pointer ${
                isGapFull
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
              }`}
              title={isGapFull ? "Maksimal a'zolar soniga etilgan" : "Yangi a'zo qo'shish"}
            >
              <UserPlus className="w-4 h-4" />
              <span>{isGapFull ? "Gap to'lgan" : "A'zo Qo'shish"}</span>
            </button>
          )}
        </div>

        <div className="divide-y divide-gray-100">
          {gap.members.map((member) => {
            const isMemberOrganizer = member.userId === gap.organizerId;
            const memberAvatar = member.user?.avatar
              ? `${API_URL.replace('/api/v1', '')}/${member.user.avatar.replace(/^\//, '')}`
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  member.user?.fullName || 'Member'
                )}&background=818cf8&color=fff`;

            return (
              <div
                key={member.id}
                className="py-4 flex items-center justify-between hover:bg-gray-50/50 px-3 rounded-xl transition"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={memberAvatar}
                    alt={member.user?.fullName}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  />
                  <div>
                    <div className="font-bold text-gray-900 text-sm flex items-center space-x-2">
                      <span>{member.user?.fullName}</span>
                      {isMemberOrganizer && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          TASHKILOTCHI (OWNER)
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">{member.user?.phone}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-xs text-gray-400">
                    Qo‘shildi: {new Date(member.joinAt).toLocaleDateString('uz-UZ')}
                  </span>

                  {/* Remove member button ONLY allowed if gap is NOT started (gap.duration === 0) */}
                  {canManage && !isMemberOrganizer && gap.status === 'ACTIVE' && gap.duration === 0 && (
                    <button
                      onClick={() => handleRemoveMember(member.userId)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition cursor-pointer"
                      title="Gapdan chiqarish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ## Roundlar va to'lovlar Section */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center space-x-2">
              <span>Roundlar va to'lovlar</span>
              {gap.status === 'COMPLETED' && (
                <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  COMPLETED
                </span>
              )}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Har bir round bo'yicha pul oluvchi (receiver) va ishtirokchilarning to'lov holatlari
            </p>
          </div>
        </div>

        {loadingRounds ? (
          <div className="py-12 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : rounds.length === 0 ? (
          <div className="py-12 text-center text-gray-500 space-y-3 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            <Coins className="w-10 h-10 mx-auto text-gray-300" />
            <p className="text-sm font-medium">Bu gap uchun hali roundlar yaratilmagan.</p>
            {isOrganizer && gap.status === 'ACTIVE' && gap.duration === 0 && (
              <button
                onClick={handleStartGap}
                disabled={actionLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl text-xs cursor-pointer inline-flex items-center space-x-1.5 shadow-md"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Gapni Boshlash</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {rounds.map((round) => {
              const isActiveRound = round.status === 'ACTIVE';
              const isCompletedRound = round.status === 'COMPLETED';
              const payments = roundPaymentsMap[round.id] || [];
              const isRoundReceiver = round.receiverId === currentUser?.id;

              const receiverAvatar = round.receiver?.avatar
                ? `${API_URL.replace('/api/v1', '')}/${round.receiver.avatar.replace(/^\//, '')}`
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    round.receiver?.fullName || 'Receiver'
                  )}&background=10b981&color=fff`;

              return (
                <div
                  key={round.id}
                  className={`rounded-2xl border transition overflow-hidden ${
                    isActiveRound
                      ? 'border-indigo-500 shadow-md ring-2 ring-indigo-500/10 bg-white'
                      : isCompletedRound
                      ? 'border-gray-200/90 bg-gray-50/40'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  {/* Round Header */}
                  <div
                    className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b ${
                      isActiveRound
                        ? 'bg-linear-to-r from-indigo-50 via-purple-50 to-white border-indigo-100'
                        : 'bg-gray-50/70 border-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span
                        className={`font-black text-xs px-3 py-1 rounded-xl uppercase tracking-wider ${
                          isActiveRound
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : isCompletedRound
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        ROUND {round.roundNumber}
                      </span>

                      {isActiveRound && (
                        <span className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full animate-pulse">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>HOZIRGI FAOL RAUND</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-xs text-gray-500 font-medium">Status:</span>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          isActiveRound
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : isCompletedRound
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {round.status}
                      </span>
                    </div>
                  </div>

                  {/* Receiver Information Block */}
                  <div className="p-5 border-b border-gray-100 bg-white">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Qabul qiluvchi (Pul oluvchi):
                    </div>
                    <div className="flex items-center space-x-4">
                      <img
                        src={receiverAvatar}
                        alt={round.receiver?.fullName}
                        className="w-11 h-11 rounded-full object-cover border-2 border-emerald-400 shadow-xs"
                      />
                      <div>
                        <div className="font-bold text-gray-900 text-base">
                          {round.receiver?.fullName || `User ID: ${round.receiverId}`}
                          {isRoundReceiver && (
                            <span className="ml-2 text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                              (SIZ)
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">
                          {round.receiver?.phone}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payments List Block */}
                  <div className="p-5 bg-white space-y-3">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      To'lovlar:
                    </div>

                    <div className="space-y-2">
                      {gap.members.map((member) => {
                        const isReceiver = member.userId === round.receiverId;
                        const existingPayment = payments.find((p) => p.userId === member.userId);

                        const isCurrentUserPayer = member.userId === currentUser?.id;
                        const amount = existingPayment?.amount || gap.monthlyAmount;
                        const isPaid = existingPayment?.status === 'PAID';

                        const canReceiverConfirm =
                          !isReceiver &&
                          isRoundReceiver &&
                          isActiveRound &&
                          !isPaid &&
                          !!existingPayment;

                        const memberAvatar = member.user?.avatar
                          ? `${API_URL.replace('/api/v1', '')}/${member.user.avatar.replace(/^\//, '')}`
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              member.user?.fullName || 'User'
                            )}&background=818cf8&color=fff`;

                        return (
                          <div
                            key={member.id}
                            className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                              isPaid
                                ? 'bg-emerald-50/40 border-emerald-100'
                                : canReceiverConfirm
                                ? 'bg-amber-50/50 border-amber-200'
                                : 'bg-gray-50/50 border-gray-100'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <img
                                src={memberAvatar}
                                alt={member.user?.fullName}
                                className="w-9 h-9 rounded-full object-cover border border-gray-200"
                              />
                              <div>
                                <div className="font-bold text-gray-900 text-sm flex items-center space-x-2">
                                  <span>{member.user?.fullName}</span>
                                  {isCurrentUserPayer && !isReceiver && (
                                    <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded-full">
                                      SIZ (TOLOVCHI)
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500">{member.user?.phone}</div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end space-x-4">
                              {!isReceiver && (
                                <div className="font-extrabold text-gray-900 text-sm">
                                  {amount.toLocaleString('uz-UZ')} so'm
                                </div>
                              )}

                              {isReceiver ? (
                                <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                                  <span>👑 Pul oluvchi</span>
                                </span>
                              ) : isPaid ? (
                                <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-200">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>✅ Pul olindi</span>
                                </span>
                              ) : (
                                <div className="flex items-center space-x-2">
                                  <span className="inline-flex items-center space-x-1 text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>⏳ KUTILMOQDA</span>
                                  </span>

                                  {canReceiverConfirm && existingPayment && (
                                    <button
                                      onClick={() =>
                                        setPayConfirmTarget({
                                          paymentId: existingPayment.id,
                                          payerName: member.user?.fullName || `User #${member.userId}`,
                                          amount,
                                        })
                                      }
                                      disabled={actionLoading}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs shadow-md transition cursor-pointer disabled:opacity-50 inline-flex items-center space-x-1.5"
                                    >
                                      <HandCoins className="w-4 h-4" />
                                      <span>[ Pulni oldim ]</span>
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Gapga Yangi A'zo Qo'shish</h2>
                <p className="text-xs text-gray-500">Tizimdagi foydalanuvchilar orasidan tanlang</p>
              </div>
              <button
                onClick={() => setShowMemberModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-center text-red-700 text-xs shrink-0">
                <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <div className="relative shrink-0">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Foydalanuvchini qidirish (ism, telefon yoki ID bo'yicha)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition"
              />
            </div>

            <div className="flex-1 overflow-y-auto min-h-[250px] space-y-2 pr-1 divide-y divide-gray-100">
              {loadingUsers ? (
                <div className="py-12 flex justify-center items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-12 text-center text-gray-500 space-y-2">
                  <Users className="w-10 h-10 mx-auto text-gray-300" />
                  <p className="text-sm font-medium">Hech qanday foydalanuvchi topilmadi</p>
                  <p className="text-xs text-gray-400">Qidiruv so'rovini o'zgartirib ko'ring</p>
                </div>
              ) : (
                filteredUsers.map((u) => {
                  const isOwner = u.id === gap.organizerId;
                  const isAlreadyMember = existingMemberUserIds.includes(u.id);
                  const isDisabled = isOwner || isAlreadyMember;
                  const isSelected = selectedUserId === u.id;

                  const userAvatar = u.avatar
                    ? `${API_URL.replace('/api/v1', '')}/${u.avatar.replace(/^\//, '')}`
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        u.fullName
                      )}&background=6366f1&color=fff`;

                  return (
                    <div
                      key={u.id}
                      onClick={() => {
                        if (!isDisabled) {
                          setSelectedUserId(u.id);
                          setModalError('');
                        }
                      }}
                      className={`pt-2 pb-2 px-3 rounded-2xl flex items-center justify-between transition cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 border border-indigo-200'
                          : isDisabled
                          ? 'bg-gray-50/60 opacity-60 cursor-not-allowed'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3.5">
                        <img
                          src={userAvatar}
                          alt={u.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                        <div>
                          <div className="font-bold text-gray-900 text-sm flex items-center space-x-2">
                            <span>{u.fullName}</span>
                            <span className="text-[10px] text-gray-400 font-mono">#{u.id}</span>
                          </div>
                          <div className="text-xs text-gray-500">{u.phone}</div>
                        </div>
                      </div>

                      <div>
                        {isOwner ? (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                            Tashkilotchi (OWNER)
                          </span>
                        ) : isAlreadyMember ? (
                          <span className="bg-gray-200 text-gray-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                            Allaqachon a'zo
                          </span>
                        ) : isSelected ? (
                          <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-xl flex items-center space-x-1 shadow-xs">
                            <Check className="w-3.5 h-3.5" />
                            <span>Tanlandi</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUserId(u.id);
                              setModalError('');
                            }}
                            className="bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 text-gray-700 font-semibold px-3 py-1 rounded-xl text-xs transition"
                          >
                            Tanlash
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100 shrink-0">
              <div className="text-xs text-gray-500">
                {selectedUserId ? (
                  <span className="text-indigo-600 font-semibold">
                    Tanlangan foydalanuvchi ID: #{selectedUserId}
                  </span>
                ) : (
                  <span>Ro'yxatdan foydalanuvchini tanlang</span>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50 transition cursor-pointer"
                >
                  Bekor qilish
                </button>

                <button
                  type="button"
                  onClick={handleAddMemberSubmit}
                  disabled={actionLoading || !selectedUserId}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition cursor-pointer disabled:opacity-50 flex items-center space-x-1.5 shadow-md"
                >
                  {actionLoading ? (
                    <span>Qo'shilmoqda...</span>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Qo'shish</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receiver Payment Confirmation Modal */}
      {payConfirmTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                <HandCoins className="w-5 h-5 text-emerald-600" />
                <span>Pul Kelib Tushganini Tasdiqlash</span>
              </h3>
              <button
                onClick={() => setPayConfirmTarget(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100 text-center space-y-2">
              <p className="text-sm font-semibold text-gray-800">
                <strong className="text-emerald-900">{payConfirmTarget.payerName}</strong> tomonidan yuborilgan{' '}
                <strong className="text-emerald-900">{payConfirmTarget.amount.toLocaleString('uz-UZ')} so'm</strong> pulni olganingizni tasdiqlaysizmi?
              </p>
              <p className="text-xs text-gray-500">
                Tasdiqlangandan so'ng to'lov holati <strong className="text-emerald-700 font-bold">PAID (To'langan)</strong> ga o'tadi.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setPayConfirmTarget(null)}
                disabled={actionLoading}
                className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50 transition cursor-pointer"
              >
                Bekor qilish
              </button>

              <button
                type="button"
                onClick={executeReceiverPaymentConfirm}
                disabled={actionLoading}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-md transition cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
              >
                {actionLoading ? (
                  <span>Tasdiqlanmoqda...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Pulni oldim</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
