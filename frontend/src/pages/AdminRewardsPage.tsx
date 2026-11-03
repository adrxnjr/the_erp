import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
  Trophy,
  Award,
  Gift,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  TrendingUp,
  Filter,
  Check,
  X,
  Edit2,
  Save,
  AlertCircle,
  ShieldCheck,
  Zap,
  Calendar,
  GraduationCap,
  Utensils,
  BookOpen,
  Flame,
  Star,
} from 'lucide-react';
import { CustomDropdown } from '../components/CustomDropdown';

// Helper icons without emojis
const getBadgeIcon = (badge?: { category?: string; criteria_type?: string; name?: string }) => {
  const crit = (badge?.criteria_type || '').toUpperCase();
  const name = (badge?.name || '').toLowerCase();

  if (name.includes('attendance') || crit.includes('ATTENDANCE')) {
    return <Calendar className="w-6 h-6 text-blue-600" />;
  }
  if (name.includes('punctual') || crit.includes('PUNCTUAL')) {
    return <Clock className="w-6 h-6 text-emerald-600" />;
  }
  if (name.includes('top scorer') || name.includes('exam') || crit.includes('EXAM')) {
    return <GraduationCap className="w-6 h-6 text-indigo-600" />;
  }
  if (name.includes('fire') || name.includes('streak')) {
    return <Flame className="w-6 h-6 text-orange-600" />;
  }
  if (name.includes('all-rounder')) {
    return <ShieldCheck className="w-6 h-6 text-violet-600" />;
  }
  if (name.includes('champion') || crit.includes('POINTS')) {
    return <Trophy className="w-6 h-6 text-amber-500" />;
  }
  return <Award className="w-6 h-6 text-amber-600" />;
};

const getStoreItemIcon = (item?: { category?: string; name?: string }) => {
  const cat = (item?.category || '').toUpperCase();
  const name = (item?.name || '').toLowerCase();

  if (cat === 'CANTEEN' || name.includes('canteen') || name.includes('meal')) {
    return <Utensils className="w-6 h-6 text-amber-600" />;
  }
  if (cat === 'STATIONERY' || name.includes('stationery') || name.includes('art')) {
    return <BookOpen className="w-6 h-6 text-blue-600" />;
  }
  if (cat === 'PRIVILEGE' || name.includes('homework') || name.includes('pass')) {
    return <ShieldCheck className="w-6 h-6 text-indigo-600" />;
  }
  if (cat === 'RECOGNITION' || name.includes('wall of fame') || name.includes('spotlight')) {
    return <Star className="w-6 h-6 text-yellow-600" />;
  }
  if (cat === 'TROPHY' || name.includes('trophy') || name.includes('honors')) {
    return <Trophy className="w-6 h-6 text-purple-600" />;
  }
  return <Gift className="w-6 h-6 text-slate-600" />;
};

interface LeaderboardEntry {
  rank: number;
  student_id: string;
  student_name: string;
  admission_number: string;
  class_name?: string;
  section_name?: string;
  total_points: number;
  current_level: string;
  top_badge_name?: string;
  top_badge_icon?: string;
}

interface RewardRedemption {
  id: string;
  student_id: string;
  reward_item_id: string;
  points_spent: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FULFILLED';
  requested_at: string;
  processed_at?: string;
  admin_notes?: string;
  student_name: string;
  reward_item_name: string;
  reward_item_icon: string;
}

interface RewardItem {
  id: string;
  name: string;
  description: string;
  icon_emoji: string;
  points_cost: number;
  category: string;
  stock: number;
  is_active: boolean;
  created_at: string;
}

interface BadgeItem {
  id: string;
  name: string;
  description: string;
  icon_emoji: string;
  category: string;
  criteria_type: string;
  criteria_value: number;
  points_reward: number;
  is_active: boolean;
}

interface StudentOption {
  id: string;
  full_name: string;
  admission_number: string;
  class_name?: string;
}

export const AdminRewardsPage: React.FC = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'award' | 'redemptions' | 'store' | 'badges'>('overview');

  // Overview stats & leaderboard
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [totalPointsAwardedMonth, setTotalPointsAwardedMonth] = useState<number>(0);
  const [pendingRedemptionsCount, setPendingRedemptionsCount] = useState<number>(0);
  const [championCount, setChampionCount] = useState<number>(0);

  // Award Points State
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<StudentOption | null>(null);
  const [awardPointsVal, setAwardPointsVal] = useState<number>(50);
  const [awardReason, setAwardReason] = useState<string>('');
  const [awardCategory, setAwardCategory] = useState<string>('MANUAL_BONUS');
  const [awardSuccessMsg, setAwardSuccessMsg] = useState<string>('');
  const [awardErrorMsg, setAwardErrorMsg] = useState<string>('');
  const [submittingAward, setSubmittingAward] = useState<boolean>(false);

  // Redemptions State
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);
  const [redemptionFilter, setRedemptionFilter] = useState<string>('ALL');
  const [reviewModalRedemption, setReviewModalRedemption] = useState<RewardRedemption | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'APPROVED' | 'REJECTED' | 'FULFILLED'>('APPROVED');
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  // Store Management State
  const [storeItems, setStoreItems] = useState<RewardItem[]>([]);
  const [showAddItemModal, setShowAddItemModal] = useState<boolean>(false);
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemDesc, setNewItemDesc] = useState<string>('');
  const [newItemEmoji, setNewItemEmoji] = useState<string>('GIFT');
  const [newItemCost, setNewItemCost] = useState<number>(100);
  const [newItemCategory, setNewItemCategory] = useState<string>('PRIVILEGE');
  const [newItemStock, setNewItemStock] = useState<number>(-1);

  // Badges Management State
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [showAddBadgeModal, setShowAddBadgeModal] = useState<boolean>(false);
  const [newBadgeName, setNewBadgeName] = useState<string>('');
  const [newBadgeDesc, setNewBadgeDesc] = useState<string>('');
  const [newBadgeEmoji, setNewBadgeEmoji] = useState<string>('AWARD');
  const [newBadgeCategory, setNewBadgeCategory] = useState<string>('ACADEMIC');
  const [newBadgeCriteriaType, setNewBadgeCriteriaType] = useState<string>('POINTS_TOTAL');
  const [newBadgeCriteriaValue, setNewBadgeCriteriaValue] = useState<number>(500);
  const [newBadgePointsReward, setNewBadgePointsReward] = useState<number>(50);

  // Initial Data Load
  const fetchOverviewData = () => {
    // School leaderboard
    api.get('/rewards/school-leaderboard')
      .then((res) => {
        setLeaderboard(res.data);
        const champs = res.data.filter((s: LeaderboardEntry) => s.current_level === 'CHAMPION').length;
        setChampionCount(champs);
      })
      .catch(() => {});

    // Redemptions for counting pending
    api.get('/rewards/redemptions')
      .then((res) => {
        setRedemptions(res.data);
        const pending = res.data.filter((r: RewardRedemption) => r.status === 'PENDING').length;
        setPendingRedemptionsCount(pending);
      })
      .catch(() => {});

    // Store items
    api.get('/rewards/store')
      .then((res) => setStoreItems(res.data))
      .catch(() => {});

    // Badges
    api.get('/rewards/badges')
      .then((res) => setBadges(res.data))
      .catch(() => {});

    // Students list for point awarding
    api.get('/students', { params: { limit: 100 } })
      .then((res) => {
        const studentList = Array.isArray(res.data) ? res.data : res.data?.items || [];
        setStudents(
          studentList.map((s: any) => ({
            id: s.id,
            full_name: s.full_name,
            admission_number: s.admission_number,
            class_name: s.class_room?.name || s.class_name || 'Grade 1',
          }))
        );
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  // Filter redemptions
  const fetchRedemptions = (statusFilter = redemptionFilter) => {
    const params = statusFilter !== 'ALL' ? { status_filter: statusFilter } : {};
    api.get('/rewards/redemptions', { params })
      .then((res) => setRedemptions(res.data))
      .catch(() => {});
  };

  useEffect(() => {
    if (activeTab === 'redemptions') {
      fetchRedemptions(redemptionFilter);
    }
  }, [activeTab, redemptionFilter]);

  // Handle Manual Point Awarding
  const handleAwardPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      setAwardErrorMsg('Please search and select a student first.');
      return;
    }
    if (!awardReason.trim()) {
      setAwardErrorMsg('Please enter a valid commendation reason.');
      return;
    }

    setSubmittingAward(true);
    setAwardErrorMsg('');
    try {
      await api.post('/rewards/award', {
        student_id: selectedStudent.id,
        points: awardPointsVal,
        reason: awardReason.trim(),
        category: awardCategory,
      });

      setAwardSuccessMsg(`Successfully awarded ${awardPointsVal} points to ${selectedStudent.full_name}!`);
      setAwardReason('');
      setSelectedStudent(null);
      setStudentSearch('');
      fetchOverviewData();
      setTimeout(() => setAwardSuccessMsg(''), 5000);
    } catch (err: any) {
      setAwardErrorMsg(err?.response?.data?.message || 'Failed to award points.');
    } finally {
      setSubmittingAward(false);
    }
  };

  // Handle Reviewing Redemption
  const handleReviewRedemption = async () => {
    if (!reviewModalRedemption) return;
    setSubmittingReview(true);
    try {
      await api.put(`/rewards/redemptions/${reviewModalRedemption.id}`, {
        status: reviewStatus,
        admin_notes: reviewNotes.trim() || undefined,
      });
      setReviewModalRedemption(null);
      fetchRedemptions(redemptionFilter);
      fetchOverviewData();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update redemption status.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Handle Adding Store Item
  const handleAddStoreItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    try {
      const res = await api.post('/rewards/store', {
        name: newItemName.trim(),
        description: newItemDesc.trim(),
        icon_emoji: newItemEmoji.trim() || 'GIFT',
        points_cost: newItemCost,
        category: newItemCategory,
        stock: newItemStock,
        is_active: true,
      });

      setStoreItems([...storeItems, res.data]);
      setShowAddItemModal(false);
      setNewItemName('');
      setNewItemDesc('');
      setNewItemCost(100);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to add reward item.');
    }
  };

  // Handle Toggling Store Item
  const handleToggleStoreItem = async (item: RewardItem) => {
    try {
      const res = await api.put(`/rewards/store/${item.id}`, {
        is_active: !item.is_active,
      });
      setStoreItems(storeItems.map((i) => (i.id === item.id ? res.data : i)));
    } catch (err: any) {
      alert('Failed to update item state.');
    }
  };

  // Handle Adding Badge
  const handleAddBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBadgeName.trim()) return;

    try {
      const res = await api.post('/rewards/badges', {
        name: newBadgeName.trim(),
        description: newBadgeDesc.trim(),
        icon_emoji: newBadgeEmoji.trim() || 'AWARD',
        category: newBadgeCategory,
        criteria_type: newBadgeCriteriaType,
        criteria_value: newBadgeCriteriaValue,
        points_reward: newBadgePointsReward,
        is_active: true,
      });

      setBadges([...badges, res.data]);
      setShowAddBadgeModal(false);
      setNewBadgeName('');
      setNewBadgeDesc('');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to add badge.');
    }
  };

  // Handle Toggling Badge
  const handleToggleBadge = async (badge: BadgeItem) => {
    try {
      const res = await api.put(`/rewards/badges/${badge.id}`, {
        ...badge,
        is_active: !badge.is_active,
      });
      setBadges(badges.map((b) => (b.id === badge.id ? res.data : b)));
    } catch (err: any) {
      alert('Failed to update badge state.');
    }
  };

  // Filter students for search dropdown
  const filteredStudents = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.admission_number.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#E9EEF5] text-slate-700 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-[4px_4px_10px_#C5D0E0,-4px_-4px_10px_#FFFFFF]">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Rewards & Recognition Administration
            </h1>
            <p className="text-sm font-medium text-slate-500">
              Manage student merit points, criteria badges, store inventory, and redemptions.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 bg-[#E9EEF5] p-1.5 rounded-2xl shadow-[inset_3px_3px_6px_#C5D0E0,inset_-3px_-3px_6px_#FFFFFF] border border-white/60 w-fit">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition-all duration-200 ${
            activeTab === 'overview'
              ? 'bg-[#E9EEF5] text-blue-600 shadow-[4px_4px_8px_#C5D0E0,-4px_-4px_8px_#FFFFFF] border border-white/80'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('award')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition-all duration-200 ${
            activeTab === 'award'
              ? 'bg-[#E9EEF5] text-blue-600 shadow-[4px_4px_8px_#C5D0E0,-4px_-4px_8px_#FFFFFF] border border-white/80'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Award Points</span>
        </button>

        <button
          onClick={() => setActiveTab('redemptions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition-all duration-200 relative ${
            activeTab === 'redemptions'
              ? 'bg-[#E9EEF5] text-blue-600 shadow-[4px_4px_8px_#C5D0E0,-4px_-4px_8px_#FFFFFF] border border-white/80'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Redemptions</span>
          {pendingRedemptionsCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center shadow-sm">
              {pendingRedemptionsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('store')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition-all duration-200 ${
            activeTab === 'store'
              ? 'bg-[#E9EEF5] text-blue-600 shadow-[4px_4px_8px_#C5D0E0,-4px_-4px_8px_#FFFFFF] border border-white/80'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Store Management</span>
        </button>

        <button
          onClick={() => setActiveTab('badges')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition-all duration-200 ${
            activeTab === 'badges'
              ? 'bg-[#E9EEF5] text-blue-600 shadow-[4px_4px_8px_#C5D0E0,-4px_-4px_8px_#FFFFFF] border border-white/80'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Badges</span>
        </button>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* TAB 1: OVERVIEW */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top 4 KPI Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#E9EEF5] p-5 rounded-3xl shadow-[6px_6px_12px_#C5D0E0,-6px_-6px_12px_#FFFFFF] border border-white/70">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Top Scholar</span>
                <Trophy className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl md:text-2xl font-black text-slate-800 truncate">
                {leaderboard[0]?.student_name || 'N/A'}
              </div>
              <p className="text-xs font-bold text-amber-600 mt-1">
                {leaderboard[0]?.total_points.toLocaleString() || 0} pts
              </p>
            </div>

            <div className="bg-[#E9EEF5] p-5 rounded-3xl shadow-[6px_6px_12px_#C5D0E0,-6px_-6px_12px_#FFFFFF] border border-white/70">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Active Month Points</span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl md:text-3xl font-black text-slate-800">
                1,850+
              </div>
              <p className="text-xs font-semibold text-slate-500 mt-1">Awarded across grades</p>
            </div>

            <div className="bg-[#E9EEF5] p-5 rounded-3xl shadow-[6px_6px_12px_#C5D0E0,-6px_-6px_12px_#FFFFFF] border border-white/70">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Pending Redemptions</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl md:text-3xl font-black text-amber-600">
                {pendingRedemptionsCount}
              </div>
              <p className="text-xs font-semibold text-slate-500 mt-1">Awaiting approval</p>
            </div>

            <div className="bg-[#E9EEF5] p-5 rounded-3xl shadow-[6px_6px_12px_#C5D0E0,-6px_-6px_12px_#FFFFFF] border border-white/70">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Champion Scholars</span>
                <Award className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl md:text-3xl font-black text-purple-700">
                {championCount}
              </div>
              <p className="text-xs font-semibold text-slate-500 mt-1">Tier threshold (2,000+ pts)</p>
            </div>
          </div>

          {/* School-wide Top 10 Leaderboard Table */}
          <div className="bg-[#E9EEF5] rounded-3xl p-6 shadow-[6px_6px_12px_#C5D0E0,-6px_-6px_12px_#FFFFFF] border border-white/70 space-y-4">
            <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>School-Wide Top 10 Scholars</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-300 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 px-3">Rank</th>
                    <th className="pb-3 px-3">Student Name</th>
                    <th className="pb-3 px-3">Class</th>
                    <th className="pb-3 px-3">Level Tier</th>
                    <th className="pb-3 px-3">Total Points</th>
                    <th className="pb-3 px-3">Key Distinction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {leaderboard.slice(0, 10).map((entry) => (
                    <tr key={entry.student_id} className="hover:bg-white/40 transition">
                      <td className="py-3 px-3 font-black text-slate-600">
                        {entry.rank === 1 ? '1st' : entry.rank === 2 ? '2nd' : entry.rank === 3 ? '3rd' : `#${entry.rank}`}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">{entry.student_name}</div>
                        <div className="text-[11px] text-slate-400">{entry.admission_number}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-semibold">{entry.class_name}</td>
                      <td className="py-3 px-3">
                        <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                          {entry.current_level}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-black text-amber-600">
                        {entry.total_points.toLocaleString()} pts
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 bg-white/70 px-2.5 py-1 rounded-xl">
                          <Award className="w-3.5 h-3.5 text-amber-500" />
                          <span>{entry.top_badge_name || 'Merit Scholar'}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* TAB 2: AWARD POINTS */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeTab === 'award' && (
        <div className="max-w-2xl bg-[#E9EEF5] p-6 md:p-8 rounded-3xl shadow-[6px_6px_12px_#C5D0E0,-6px_-6px_12px_#FFFFFF] border border-white/70 space-y-6">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span>Manually Award Scholarship Points</span>
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Commend student achievements for academic brilliance, science fairs, sports, or exemplary character.
            </p>
          </div>

          {awardSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-semibold flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{awardSuccessMsg}</span>
            </div>
          )}
          {awardErrorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-sm font-semibold flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{awardErrorMsg}</span>
            </div>
          )}

          <form onSubmit={handleAwardPoints} className="space-y-5">
            {/* Student Search */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Select Student <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student by name or admission number..."
                  value={studentSearch}
                  onChange={(e) => {
                    setStudentSearch(e.target.value);
                    if (selectedStudent) setSelectedStudent(null);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#E9EEF5] shadow-[inset_2px_2px_5px_#C5D0E0,inset_-2px_-2px_5px_#FFFFFF] border border-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Autocomplete Dropdown List */}
              {studentSearch && !selectedStudent && (
                <div className="max-h-48 overflow-y-auto rounded-2xl bg-white shadow-xl border border-slate-200 divide-y divide-slate-100 z-20">
                  {filteredStudents.slice(0, 8).map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        setSelectedStudent(st);
                        setStudentSearch(`${st.full_name} (${st.admission_number})`);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 flex items-center justify-between transition"
                    >
                      <span className="font-bold text-slate-800">{st.full_name}</span>
                      <span className="text-xs text-slate-400 font-semibold">{st.class_name} • {st.admission_number}</span>
                    </button>
                  ))}
                  {filteredStudents.length === 0 && (
                    <div className="p-3 text-xs text-slate-400 text-center italic">No matching students found</div>
                  )}
                </div>
              )}

              {selectedStudent && (
                <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-blue-900">{selectedStudent.full_name}</span>
                    <span className="text-blue-600 ml-2">({selectedStudent.admission_number}) • {selectedStudent.class_name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudent(null);
                      setStudentSearch('');
                    }}
                    className="text-rose-500 font-bold hover:underline"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>

            {/* Points Amount & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Points Amount <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="5"
                  max="1000"
                  step="5"
                  value={awardPointsVal}
                  onChange={(e) => setAwardPointsVal(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#E9EEF5] shadow-[inset_2px_2px_5px_#C5D0E0,inset_-2px_-2px_5px_#FFFFFF] border border-white/80 text-sm font-bold text-amber-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Category
                </label>
                <div className="w-full">
                  <CustomDropdown
                    value={awardCategory}
                    onChange={(val) => setAwardCategory(val)}
                    options={[
                      { value: 'MANUAL_BONUS', label: 'Special Faculty Commendation' },
                      { value: 'ACADEMIC', label: 'Academic & Quiz Excellence' },
                      { value: 'ATTENDANCE', label: 'Attendance & Punctuality' },
                      { value: 'DISCIPLINE', label: 'Exemplary Discipline & Mentorship' },
                      { value: 'HOMEWORK', label: 'Exceptional Project Submission' },
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Commendation Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="e.g. 1st Place in Inter-School Science Fair 2026..."
                value={awardReason}
                onChange={(e) => setAwardReason(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-[#E9EEF5] shadow-[inset_2px_2px_5px_#C5D0E0,inset_-2px_-2px_5px_#FFFFFF] border border-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={submittingAward || !selectedStudent}
              className="w-full py-3 rounded-2xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[4px_4px_12px_rgba(37,99,235,0.35)] hover:brightness-110 active:scale-98 transition disabled:opacity-50"
            >
              {submittingAward ? 'Submitting Award...' : 'Submit Points Award & Publish to Wall'}
            </button>
          </form>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* TAB 3: REDEMPTIONS */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeTab === 'redemptions' && (
        <div className="space-y-5">
          {/* Status Filter Tabs */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Student Redemption Requests</h2>
              <p className="text-xs text-slate-500 font-semibold">
                Review and approve store vouchers and campus privileges
              </p>
            </div>

            <div className="flex items-center gap-2 bg-[#E9EEF5] p-1 rounded-2xl shadow-[inset_2px_2px_5px_#C5D0E0,inset_-2px_-2px_5px_#FFFFFF] border border-white/60">
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'FULFILLED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setRedemptionFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    redemptionFilter === st
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Redemptions Table */}
          <div className="bg-[#E9EEF5] rounded-3xl p-5 shadow-[6px_6px_12px_#C5D0E0,-6px_-6px_12px_#FFFFFF] border border-white/70 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-300 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 px-3">Student</th>
                    <th className="pb-3 px-3">Reward Item</th>
                    <th className="pb-3 px-3">Points Spent</th>
                    <th className="pb-3 px-3">Date Requested</th>
                    <th className="pb-3 px-3">Status</th>
                    <th className="pb-3 px-3">Admin Note</th>
                    <th className="pb-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {redemptions.map((r) => (
                    <tr key={r.id} className="hover:bg-white/40 transition">
                      <td className="py-3 px-3 font-bold text-slate-800">{r.student_name}</td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                          <span>{r.reward_item_icon}</span>
                          <span>{r.reward_item_name}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 font-black text-amber-600">{r.points_spent} pts</td>
                      <td className="py-3 px-3 text-xs text-slate-500">
                        {new Date(r.requested_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[11px] font-black uppercase px-2 py-0.5 rounded-full border ${
                            r.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : r.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : r.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : 'bg-purple-100 text-purple-800 border-purple-300'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-500 italic max-w-xs truncate">
                        {r.admin_notes || '—'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setReviewModalRedemption(r);
                            setReviewStatus(r.status === 'PENDING' ? 'APPROVED' : r.status);
                            setReviewNotes(r.admin_notes || '');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white text-blue-600 font-bold text-xs shadow-sm border border-slate-200"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                  {redemptions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-xs text-slate-400 font-semibold italic">
                        No redemption requests matching filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* TAB 4: STORE MANAGEMENT */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeTab === 'store' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Reward Store Catalog</h2>
              <p className="text-xs text-slate-500 font-semibold">
                Manage items, stock counts, and points costs available to students
              </p>
            </div>

            <button
              onClick={() => setShowAddItemModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-600 text-white font-bold text-xs shadow-md hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Reward Item</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {storeItems.map((item) => (
              <div
                key={item.id}
                className="bg-[#E9EEF5] p-5 rounded-3xl shadow-[6px_6px_12px_#C5D0E0,-6px_-6px_12px_#FFFFFF] border border-white/70 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center shadow-sm">
                      {getStoreItemIcon(item)}
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        item.is_active
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-slate-200 text-slate-500 border-slate-300'
                      }`}
                    >
                      {item.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 text-base">{item.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-300 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-amber-600 font-bold">{item.points_cost} pts</span>
                    <span className="text-slate-400">
                      {item.stock === -1 ? 'Unlimited Stock' : `${item.stock} in stock`}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleStoreItem(item)}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition ${
                      item.is_active
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    {item.is_active ? 'Disable Item' : 'Enable Item'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* TAB 5: BADGES MANAGEMENT */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeTab === 'badges' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Achievement Badges Configuration</h2>
              <p className="text-xs text-slate-500 font-semibold">
                Configure auto-awarded badges for attendance, exam scores, and points milestones
              </p>
            </div>

            <button
              onClick={() => setShowAddBadgeModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-600 text-white font-bold text-xs shadow-md hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Badge</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="bg-[#E9EEF5] p-5 rounded-3xl shadow-[6px_6px_12px_#C5D0E0,-6px_-6px_12px_#FFFFFF] border border-white/70 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center shadow-sm">
                      {getBadgeIcon(badge)}
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        badge.is_active
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-slate-200 text-slate-500 border-slate-300'
                      }`}
                    >
                      {badge.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 text-base">{badge.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">{badge.description}</p>
                  </div>

                  <div className="text-[11px] font-medium text-slate-600 bg-white/60 p-2 rounded-xl">
                    <div>Type: <strong>{badge.criteria_type}</strong></div>
                    <div>Threshold: <strong>{badge.criteria_value}</strong></div>
                    <div>Reward: <strong className="text-amber-600">+{badge.points_reward} pts</strong></div>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleBadge(badge)}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition ${
                    badge.is_active
                      ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  {badge.is_active ? 'Disable Badge' : 'Enable Badge'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* MODAL: REVIEW REDEMPTION */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {reviewModalRedemption && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-[#E9EEF5] rounded-3xl p-6 max-w-md w-full shadow-2xl border border-white space-y-4">
            <h3 className="font-black text-slate-800 text-lg">Process Redemption Request</h3>

            <div className="p-3 bg-white/70 rounded-xl space-y-1 text-xs">
              <div>Student: <strong>{reviewModalRedemption.student_name}</strong></div>
              <div>Item: <strong>{reviewModalRedemption.reward_item_name}</strong></div>
              <div>Points: <strong className="text-amber-600">{reviewModalRedemption.points_spent} pts</strong></div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase">Update Status</label>
              <div className="w-full">
                <CustomDropdown
                  value={reviewStatus}
                  onChange={(val: any) => setReviewStatus(val)}
                  options={[
                    { value: 'APPROVED', label: 'Approved' },
                    { value: 'FULFILLED', label: 'Fulfilled / Delivered' },
                    { value: 'REJECTED', label: 'Rejected (Refund Points)' },
                  ]}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase">Administrator Note</label>
              <textarea
                rows={3}
                placeholder="e.g. Voucher handed to student in room 101..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setReviewModalRedemption(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewRedemption}
                disabled={submittingReview}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white shadow hover:bg-blue-700"
              >
                {submittingReview ? 'Saving...' : 'Save & Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* MODAL: ADD STORE ITEM */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <form onSubmit={handleAddStoreItem} className="bg-[#E9EEF5] rounded-3xl p-6 max-w-md w-full shadow-2xl border border-white space-y-4">
            <h3 className="font-black text-slate-800 text-lg">Add New Reward Store Item</h3>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Item Name</label>
              <input
                type="text"
                required
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="e.g. Library Priority Pass"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Description</label>
              <textarea
                rows={2}
                required
                value={newItemDesc}
                onChange={(e) => setNewItemDesc(e.target.value)}
                placeholder="Item benefits and description..."
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Icon Tag</label>
                <input
                  type="text"
                  value={newItemEmoji}
                  onChange={(e) => setNewItemEmoji(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Points Cost</label>
                <input
                  type="number"
                  min="10"
                  required
                  value={newItemCost}
                  onChange={(e) => setNewItemCost(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-amber-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Category</label>
                <input
                  type="text"
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs uppercase"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Stock (-1 for unlimited)</label>
                <input
                  type="number"
                  value={newItemStock}
                  onChange={(e) => setNewItemStock(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddItemModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white shadow hover:bg-blue-700"
              >
                Create Item
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* MODAL: ADD CUSTOM BADGE */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {showAddBadgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <form onSubmit={handleAddBadge} className="bg-[#E9EEF5] rounded-3xl p-6 max-w-md w-full shadow-2xl border border-white space-y-4">
            <h3 className="font-black text-slate-800 text-lg">Create Custom Achievement Badge</h3>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Badge Name</label>
              <input
                type="text"
                required
                value={newBadgeName}
                onChange={(e) => setNewBadgeName(e.target.value)}
                placeholder="e.g. Science Fair Champion"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Description</label>
              <textarea
                rows={2}
                required
                value={newBadgeDesc}
                onChange={(e) => setNewBadgeDesc(e.target.value)}
                placeholder="How this badge is earned..."
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Icon Tag</label>
                <input
                  type="text"
                  value={newBadgeEmoji}
                  onChange={(e) => setNewBadgeEmoji(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Points Reward</label>
                <input
                  type="number"
                  value={newBadgePointsReward}
                  onChange={(e) => setNewBadgePointsReward(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-amber-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Criteria Type</label>
                <div className="w-full">
                  <CustomDropdown
                    value={newBadgeCriteriaType}
                    onChange={(val) => setNewBadgeCriteriaType(val)}
                    options={[
                      { value: 'POINTS_TOTAL', label: 'Points Total' },
                      { value: 'EXAM_SCORE', label: 'Exam Score %' },
                      { value: 'ATTENDANCE_STREAK', label: 'Attendance Streak Days' },
                      { value: 'MANUAL', label: 'Manual Teacher Award' },
                    ]}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Criteria Threshold</label>
                <input
                  type="number"
                  value={newBadgeCriteriaValue}
                  onChange={(e) => setNewBadgeCriteriaValue(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddBadgeModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white shadow hover:bg-blue-700"
              >
                Create Badge
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

