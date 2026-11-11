import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/client';
import {
  Trophy,
  Award,
  Download,
  Flame,
  CheckCircle2,
  Clock,
  XCircle,
  Gift,
  ShoppingBag,
  TrendingUp,
  Users,
  ChevronRight,
  ShieldCheck,
  Star,
  Zap,
  Info,
  Calendar,
  AlertCircle,
  Utensils,
  BookOpen,
  Medal,
  GraduationCap,
} from 'lucide-react';
import { CustomDropdown } from '../components/CustomDropdown';

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

interface StudentBadge {
  id: string;
  student_id: string;
  badge_id: string;
  awarded_at: string;
  notes?: string;
  badge?: BadgeItem;
}

interface PointTransaction {
  id: string;
  student_id: string;
  points: number;
  reason: string;
  category: string;
  reference_id?: string;
  created_at: string;
}

interface StudentSummary {
  student_id: string;
  student_name: string;
  admission_number: string;
  class_name: string;
  section_name: string;
  total_points: number;
  current_level: 'BRONZE' | 'SILVER' | 'GOLD' | 'CHAMPION';
  next_level?: string;
  next_level_points?: number;
  progress_percent: number;
  points_this_month: number;
  points_this_term: number;
  class_rank: number;
  school_rank: number;
  earned_badges: StudentBadge[];
  all_badges: BadgeItem[];
  recent_transactions: PointTransaction[];
}

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

interface RewardItem {
  id: string;
  name: string;
  description: string;
  icon_emoji: string;
  points_cost: number;
  category: string;
  stock: number;
  is_active: boolean;
}

interface RedemptionRequest {
  id: string;
  student_id: string;
  reward_item_id: string;
  points_spent: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FULFILLED';
  requested_at: string;
  processed_at?: string;
  admin_notes?: string;
  reward_item_name: string;
  reward_item_icon: string;
}

export const StudentRewardsPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const isParent =
    user?.portal_type === 'parent' ||
    user?.roles?.includes('parent') ||
    (user?.portal_type === 'parent_student' && !user?.roles?.includes('student'));

  useEffect(() => {
    document.title = 'Gamified Student Rewards & Wall of Fame — Ever Grow Schools ERP';
  }, []);

  // State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leaderboard' | 'store'>('dashboard');
  const [children, setChildren] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  const [summary, setSummary] = useState<StudentSummary | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardScope, setLeaderboardScope] = useState<'class' | 'school'>('class');
  const [storeItems, setStoreItems] = useState<RewardItem[]>([]);
  const [myRedemptions, setMyRedemptions] = useState<RedemptionRequest[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [redeemModalItem, setRedeemModalItem] = useState<RewardItem | null>(null);
  const [redeeming, setRedeeming] = useState<boolean>(false);
  const [redeemSuccessMsg, setRedeemSuccessMsg] = useState<string>('');
  const [redeemErrorMsg, setRedeemErrorMsg] = useState<string>('');

  // 1. If Parent, fetch children list
  useEffect(() => {
    if (isParent) {
      api.get('/portal/parent/students')
        .then((res) => {
          if (Array.isArray(res.data) && res.data.length > 0) {
            setChildren(res.data);
            setSelectedStudentId(res.data[0].id);
          }
        })
        .catch(() => {});
    }
  }, [isParent]);

  // 2. Fetch Dashboard & Points Data
  const fetchStudentData = () => {
    setLoading(true);
    const params = selectedStudentId ? { student_id: selectedStudentId } : {};

    Promise.all([
      api.get('/rewards/my-points', { params }),
      api.get('/rewards/store'),
      api.get('/rewards/my-redemptions', { params }),
    ])
      .then(([summaryRes, storeRes, redemptionsRes]) => {
        setSummary(summaryRes.data);
        setStoreItems(storeRes.data);
        setMyRedemptions(redemptionsRes.data);
      })
      .catch((err) => {
        console.error('Failed to load rewards data', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStudentData();
  }, [selectedStudentId]);

  // 3. Fetch Leaderboard when tab or scope changes
  useEffect(() => {
    if (activeTab === 'leaderboard') {
      if (leaderboardScope === 'school') {
        api.get('/rewards/school-leaderboard')
          .then((res) => setLeaderboard(res.data))
          .catch(() => {});
      } else {
        api.get('/rewards/leaderboard')
          .then((res) => setLeaderboard(res.data))
          .catch(() => {});
      }
    }
  }, [activeTab, leaderboardScope, selectedStudentId]);

  // Handle Download Certificate
  const handleDownloadCertificate = async () => {
    if (!summary?.student_id) return;
    try {
      const response = await api.get(`/rewards/certificate/${summary.student_id}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificate_of_Achievement_${summary.admission_number || 'EverGrow'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Certificate of Achievement downloaded successfully.');
    } catch (err) {
      toast.error('Failed to generate achievement certificate.');
    }
  };

  // Handle Redemption Request
  const handleConfirmRedeem = async () => {
    if (!redeemModalItem) return;
    setRedeeming(true);
    setRedeemErrorMsg('');
    try {
      await api.post('/rewards/redeem', {
        reward_item_id: redeemModalItem.id,
      }, {
        params: selectedStudentId ? { student_id: selectedStudentId } : {},
      });

      setRedeemSuccessMsg(`Successfully requested "${redeemModalItem.name}". Points deducted.`);
      setRedeemModalItem(null);
      fetchStudentData();
      setTimeout(() => setRedeemSuccessMsg(''), 5000);
    } catch (err: any) {
      setRedeemErrorMsg(err?.response?.data?.message || 'Failed to submit redemption request.');
    } finally {
      setRedeeming(false);
    }
  };

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

  const getLevelTierIcon = (level?: string) => {
    switch (level?.toUpperCase()) {
      case 'CHAMPION':
        return <Trophy className="w-10 h-10 text-purple-600" />;
      case 'GOLD':
        return <Award className="w-10 h-10 text-amber-500" />;
      case 'SILVER':
        return <Medal className="w-10 h-10 text-slate-500" />;
      case 'BRONZE':
      default:
        return <Medal className="w-10 h-10 text-amber-700" />;
    }
  };

  // Level configuration
  const levelThemes = {
    BRONZE: {
      name: 'Bronze Scholar',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    SILVER: {
      name: 'Silver Scholar',
      badgeBg: 'bg-slate-200 text-slate-800 border-slate-300',
    },
    GOLD: {
      name: 'Gold Scholar',
      badgeBg: 'bg-yellow-100 text-yellow-800 border-yellow-400',
    },
    CHAMPION: {
      name: 'Champion Scholar',
      badgeBg: 'bg-purple-100 text-purple-900 border-purple-400',
    },
  };

  const currentLevelInfo = levelThemes[summary?.current_level || 'BRONZE'];

  return (
    <div className="min-h-screen bg-transparent text-slate-700 p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-[4px_4px_10px_#C5D0E0,-4px_-4px_10px_#FFFFFF]">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                Campus Gamified Rewards & Honors
              </h1>
              <p className="text-sm font-medium text-slate-500">
                Recognizing scholastic merit, attendance streaks, and behavioral excellence.
              </p>
            </div>
          </div>
        </div>

        {/* Parent Child Selector */}
        {isParent && children.length > 0 && (
          <div className="flex items-center gap-3 bg-[#E9EEF5] p-2 rounded-2xl shadow-[inset_2px_2px_5px_#C5D0E0,inset_-2px_-2px_5px_#FFFFFF] border border-white/70">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-2">Viewing Child:</span>
            <div className="w-56">
              <CustomDropdown
                value={selectedStudentId}
                onChange={(val) => setSelectedStudentId(val)}
                options={children.map((c) => ({
                  value: c.id,
                  label: `${c.full_name} (${c.class_name || 'Class'})`,
                }))}
              />
            </div>
          </div>
        )}
      </div>

      {/* Success / Error notification alerts */}
      {redeemSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-semibold flex items-center gap-3 shadow-[4px_4px_10px_#C5D0E0]">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{redeemSuccessMsg}</span>
        </div>
      )}
      {redeemErrorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-sm font-semibold flex items-center gap-3 shadow-[4px_4px_10px_#C5D0E0]">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{redeemErrorMsg}</span>
        </div>
      )}

      {/* Neumorphic Navigation Tabs */}
      <div className="flex items-center gap-2 bg-[#E9EEF5] p-1.5 rounded-2xl shadow-[inset_3px_3px_6px_#C5D0E0,inset_-3px_-3px_6px_#FFFFFF] border border-white/60 max-w-full overflow-x-auto tab-scroll-container scrollbar-none flex-nowrap">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 shrink-0 whitespace-nowrap ${
            activeTab === 'dashboard'
              ? 'bg-[#E9EEF5] text-blue-600 shadow-[4px_4px_8px_#C5D0E0,-4px_-4px_8px_#FFFFFF] border border-white/80'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>My Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 shrink-0 whitespace-nowrap ${
            activeTab === 'leaderboard'
              ? 'bg-[#E9EEF5] text-blue-600 shadow-[4px_4px_8px_#C5D0E0,-4px_-4px_8px_#FFFFFF] border border-white/80'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Leaderboard</span>
        </button>

        <button
          onClick={() => setActiveTab('store')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 shrink-0 whitespace-nowrap ${
            activeTab === 'store'
              ? 'bg-[#E9EEF5] text-blue-600 shadow-[4px_4px_8px_#C5D0E0,-4px_-4px_8px_#FFFFFF] border border-white/80'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Rewards Store</span>
        </button>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* TAB 1: MY DASHBOARD */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Hero Honor Tier Card - Pure White Neumorphic Styling */}
          <div className="bg-white rounded-3xl p-6 md:p-8 text-slate-800 shadow-[6px_6px_16px_#C5D0E0,-6px_-6px_16px_#FFFFFF] border border-slate-200/80 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shadow-inner shrink-0">
                  {getLevelTierIcon(summary?.current_level)}
                </div>
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-black tracking-wider uppercase">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>{currentLevelInfo.name}</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
                    {summary?.student_name || 'Honors Student'}
                  </h2>
                  <p className="text-xs md:text-sm text-slate-500 font-medium">
                    {summary?.class_name} • Adm: {summary?.admission_number} • Ever Grow International
                  </p>
                </div>
              </div>

              {/* Download Certificate Action */}
              <button
                onClick={handleDownloadCertificate}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-sm shadow-[0_4px_14px_rgba(245,158,11,0.25)] hover:brightness-105 active:scale-95 transition-all self-start md:self-auto shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Download Certificate</span>
              </button>
            </div>

            {/* Level Progress Bar */}
            <div className="pt-5 border-t border-slate-100 space-y-2.5">
              <div className="flex justify-between items-center text-xs md:text-sm font-semibold">
                <span className="text-slate-600 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  {summary?.next_level ? (
                    <>
                      <strong className="text-slate-900 font-bold">{summary.total_points}</strong> / {summary.next_level_points} pts to reach{' '}
                      <span className="text-amber-600 font-bold">{summary.next_level}</span>
                    </>
                  ) : (
                    <span className="text-emerald-600 font-bold">Highest Achievement Level Reached (Champion Scholar)</span>
                  )}
                </span>
                <span className="text-slate-800 font-black">{summary?.progress_percent}%</span>
              </div>

              <div className="w-full h-3 rounded-full bg-slate-100 p-0.5 border border-slate-200 shadow-inner overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 transition-all duration-500 shadow-[0_0_8px_rgba(251,191,36,0.4)]"
                  style={{ width: `${summary?.progress_percent || 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#E9EEF5] p-5 rounded-2xl shadow-[6px_6px_12px_#C5D0E0,-6px_-6px_12px_#FFFFFF] border border-white/70">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Points</span>
                <Trophy className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl md:text-3xl font-black text-slate-800">
                {summary?.total_points.toLocaleString() || 0}
                <span className="text-xs font-bold text-amber-600 ml-1">pts</span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 mt-1">Cumulative career merit</p>
            </div>

            <div className="bg-[#E9EEF5] p-5 rounded-2xl shadow-[6px_6px_12px_#C5D0E0,-6px_-6px_12px_#FFFFFF] border border-white/70">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">This Month</span>
                <Flame className="w-4 h-4 text-orange-500" />
              </div>
              <div className="text-2xl md:text-3xl font-black text-slate-800">
                +{summary?.points_this_month || 0}
                <span className="text-xs font-bold text-orange-600 ml-1">pts</span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 mt-1">Active monthly momentum</p>
            </div>

            <div className="bg-[#E9EEF5] p-5 rounded-2xl shadow-[6px_6px_12px_#C5D0E0,-6px_-6px_12px_#FFFFFF] border border-white/70">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Class Rank</span>
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl md:text-3xl font-black text-slate-800">
                #{summary?.class_rank || 1}
              </div>
              <p className="text-[11px] font-semibold text-slate-500 mt-1">In {summary?.class_name}</p>
            </div>

            <div className="bg-[#E9EEF5] p-5 rounded-2xl shadow-[6px_6px_12px_#C5D0E0,-6px_-6px_12px_#FFFFFF] border border-white/70">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">School Rank</span>
                <Award className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl md:text-3xl font-black text-slate-800">
                #{summary?.school_rank || 1}
              </div>
              <p className="text-[11px] font-semibold text-slate-500 mt-1">Across all 12 grades</p>
            </div>
          </div>

          {/* Badges Section */}
          <div className="bg-[#E9EEF5] p-6 rounded-3xl shadow-[6px_6px_12px_#C5D0E0,-6px_-6px_12px_#FFFFFF] border border-white/70 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>Merit Badges & Distinctions</span>
                </h3>
                <p className="text-xs font-medium text-slate-500">
                  Earned: {summary?.earned_badges.length || 0} of {summary?.all_badges.length || 0} configured badges
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
              {summary?.all_badges.map((badge) => {
                const earned = summary.earned_badges.some((eb) => eb.badge_id === badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-2xl border transition-all duration-300 relative group ${
                      earned
                        ? 'bg-gradient-to-br from-white to-[#F0F4FA] border-amber-300/80 shadow-[4px_4px_10px_#C5D0E0,-4px_-4px_10px_#FFFFFF]'
                        : 'bg-[#E3E8F0] border-slate-300/60 opacity-60 grayscale hover:grayscale-0 hover:opacity-100'
                    }`}
                  >
                    {earned && (
                      <span className="absolute top-3 right-3 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Unlocked
                      </span>
                    )}

                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-200/80 flex items-center justify-center mb-3">
                      {getBadgeIcon(badge)}
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">{badge.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-snug">{badge.description}</p>

                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-semibold">
                      <span className="text-amber-600">+{badge.points_reward} pts</span>
                      {!earned && (
                        <span className="text-slate-400 italic">Criteria: {badge.criteria_value}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Points Activity */}
          <div className="bg-[#E9EEF5] p-6 rounded-3xl shadow-[6px_6px_12px_#C5D0E0,-6px_-6px_12px_#FFFFFF] border border-white/70 space-y-4">
            <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span>Recent Activity & Points Ledger</span>
            </h3>

            <div className="space-y-2.5">
              {summary?.recent_transactions && summary.recent_transactions.length > 0 ? (
                summary.recent_transactions.slice(0, 5).map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-2xl bg-white/60 border border-white/80 shadow-[2px_2px_5px_#C5D0E0,-2px_-2px_5px_#FFFFFF] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                          tx.points > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {tx.points > 0 ? `+${tx.points}` : tx.points}
                      </div>
                      <div>
                        <div className="text-xs md:text-sm font-bold text-slate-800">{tx.reason}</div>
                        <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-2">
                          <span className="uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-100">
                            {tx.category}
                          </span>
                          <span>•</span>
                          <span>{new Date(tx.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-xs md:text-sm font-black ${
                        tx.points > 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {tx.points > 0 ? `+${tx.points} pts` : `${tx.points} pts`}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs font-semibold text-slate-400 italic text-center py-4">
                  No points activity recorded yet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* TAB 2: LEADERBOARD */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          {/* Scope Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Merit Leaderboard</h2>
              <p className="text-xs text-slate-500 font-semibold">
                Celebrating highest achieving students by scholarship points
              </p>
            </div>

            <div className="flex items-center gap-2 bg-[#E9EEF5] p-1 rounded-2xl shadow-[inset_2px_2px_5px_#C5D0E0,inset_-2px_-2px_5px_#FFFFFF] border border-white/60">
              <button
                onClick={() => setLeaderboardScope('class')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  leaderboardScope === 'class'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                My Class
              </button>
              <button
                onClick={() => setLeaderboardScope('school')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  leaderboardScope === 'school'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                School-wide (Top 10)
              </button>
            </div>
          </div>

          {/* Leaderboard Table Card */}
          <div className="bg-[#E9EEF5] rounded-3xl p-5 shadow-[6px_6px_12px_#C5D0E0,-6px_-6px_12px_#FFFFFF] border border-white/70 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-300/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 px-3">Rank</th>
                    <th className="pb-3 px-3">Student Name</th>
                    <th className="pb-3 px-3">Grade Level</th>
                    <th className="pb-3 px-3">Level Status</th>
                    <th className="pb-3 px-3">Total Points</th>
                    <th className="pb-3 px-3">Top Distinction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60">
                  {leaderboard.map((entry) => {
                    const isCurrentStudent =
                      entry.student_id === summary?.student_id ||
                      entry.student_name === summary?.student_name;

                    const medal =
                      entry.rank === 1
                        ? '1st'
                        : entry.rank === 2
                        ? '2nd'
                        : entry.rank === 3
                        ? '3rd'
                        : `#${entry.rank}`;

                    return (
                      <tr
                        key={entry.student_id}
                        className={`transition-all duration-150 ${
                          isCurrentStudent
                            ? 'bg-amber-100/70 font-bold border-l-4 border-amber-500'
                            : 'hover:bg-white/40'
                        }`}
                      >
                        <td className="py-3.5 px-3">
                          <span
                            className={`font-black text-xs px-2.5 py-1 rounded-xl ${
                              entry.rank === 1
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : entry.rank === 2
                                ? 'bg-slate-200 text-slate-800 border border-slate-300'
                                : entry.rank === 3
                                ? 'bg-orange-100 text-orange-900 border border-orange-300'
                                : 'text-slate-500'
                            }`}
                          >
                            {medal}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-slate-800 flex items-center gap-2">
                            <span>{entry.student_name}</span>
                            {isCurrentStudent && (
                              <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-blue-600 text-white">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">{entry.admission_number}</div>
                        </td>
                        <td className="py-3.5 px-3 text-slate-600 font-semibold">
                          {entry.class_name} {entry.section_name && `(${entry.section_name})`}
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                              entry.current_level === 'CHAMPION'
                                ? 'bg-purple-100 text-purple-800 border-purple-300'
                                : entry.current_level === 'GOLD'
                                ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                : entry.current_level === 'SILVER'
                                ? 'bg-slate-200 text-slate-800 border-slate-300'
                                : 'bg-amber-100 text-amber-800 border-amber-300'
                            }`}
                          >
                            {entry.current_level}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="font-black text-amber-600 text-base">
                            {entry.total_points.toLocaleString()}
                          </span>{' '}
                          <span className="text-xs text-slate-400 font-bold">pts</span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white/70 px-2 py-1 rounded-xl border border-white">
                            <Award className="w-3.5 h-3.5 text-amber-500" />
                            <span>{entry.top_badge_name || 'Star Scholar'}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* TAB 3: REWARDS STORE */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeTab === 'store' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                <Gift className="w-5 h-5 text-indigo-500" />
                <span>Rewards Store & Privilege Catalog</span>
              </h2>
              <p className="text-xs text-slate-500 font-semibold">
                Redeem your scholarship points for campus privileges, dining vouchers, and honors.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 px-4 py-2 rounded-2xl font-bold text-sm shadow-[4px_4px_10px_#C5D0E0]">
              <Award className="w-4 h-4 text-slate-950" />
              <span>Available Balance: {summary?.total_points.toLocaleString() || 0} pts</span>
            </div>
          </div>

          {/* Store Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {storeItems.map((item) => {
              const canAfford = (summary?.total_points || 0) >= item.points_cost;
              const inStock = item.stock === -1 || item.stock > 0;
              const disabled = !canAfford || !inStock;

              return (
                <div
                  key={item.id}
                  className="bg-[#E9EEF5] p-5 rounded-3xl shadow-[6px_6px_12px_#C5D0E0,-6px_-6px_12px_#FFFFFF] border border-white/70 flex flex-col justify-between space-y-4 hover:shadow-[8px_8px_16px_#C5D0E0,-8px_-8px_16px_#FFFFFF] transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center shadow-sm">
                        {getStoreItemIcon(item)}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        {item.category}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 text-base">{item.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-300/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-black text-indigo-700">
                        {item.points_cost}{' '}
                        <span className="text-xs font-semibold text-slate-500">pts</span>
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {item.stock === -1 ? 'Unlimited' : `${item.stock} left`}
                      </span>
                    </div>

                    <button
                      onClick={() => setRedeemModalItem(item)}
                      disabled={disabled}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
                        disabled
                          ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[4px_4px_10px_rgba(37,99,235,0.3)] hover:brightness-110 active:scale-95'
                      }`}
                    >
                      {!inStock ? 'Out of Stock' : !canAfford ? 'Need More Points' : `Redeem for ${item.points_cost} pts`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Past Redemption Requests */}
          <div className="bg-[#E9EEF5] p-6 rounded-3xl shadow-[6px_6px_12px_#C5D0E0,-6px_-6px_12px_#FFFFFF] border border-white/70 space-y-4">
            <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-600" />
              <span>My Redemptions & Request History</span>
            </h3>

            {myRedemptions.length > 0 ? (
              <div className="space-y-2.5">
                {myRedemptions.map((redemption) => {
                  const statusColors = {
                    PENDING: 'bg-amber-100 text-amber-800 border-amber-300',
                    APPROVED: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                    REJECTED: 'bg-rose-100 text-rose-800 border-rose-300',
                    FULFILLED: 'bg-purple-100 text-purple-800 border-purple-300',
                  };

                  return (
                    <div
                      key={redemption.id}
                      className="p-4 rounded-2xl bg-white/70 border border-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shadow-sm shrink-0">
                          {getStoreItemIcon({ category: redemption.reward_item_name, name: redemption.reward_item_name })}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-sm">{redemption.reward_item_name}</div>
                          <div className="text-[11px] text-slate-400">
                            Requested: {new Date(redemption.requested_at).toLocaleDateString()} • {redemption.points_spent} pts spent
                          </div>
                          {redemption.admin_notes && (
                            <div className="text-[11px] font-medium text-slate-600 mt-1 italic">
                              Admin Note: {redemption.admin_notes}
                            </div>
                          )}
                        </div>
                      </div>

                      <span
                        className={`text-xs font-bold uppercase px-3 py-1 rounded-full border self-start sm:self-auto ${
                          statusColors[redemption.status] || 'bg-slate-100'
                        }`}
                      >
                        {redemption.status === 'PENDING'
                          ? 'Pending'
                          : redemption.status === 'APPROVED'
                          ? 'Approved'
                          : redemption.status === 'REJECTED'
                          ? 'Rejected'
                          : 'Fulfilled'}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs font-semibold text-slate-400 italic text-center py-4">
                No past redemptions found. Browse the catalog above to redeem your points!
              </p>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {redeemModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#E9EEF5] rounded-3xl p-6 max-w-md w-full shadow-[10px_10px_25px_#A0AAB8,-10px_-10px_25px_#FFFFFF] border border-white space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                {getStoreItemIcon(redeemModalItem)}
              </div>
              <div>
                <h3 className="font-black text-slate-800 text-lg">Confirm Redemption</h3>
                <p className="text-xs text-slate-500 font-semibold">Ever Grow Rewards Store</p>
              </div>
            </div>

            <p className="text-sm text-slate-600">
              Are you sure you want to redeem <strong>{redeemModalItem.name}</strong> for{' '}
              <strong className="text-amber-600 font-black">{redeemModalItem.points_cost} points</strong>?
            </p>

            <div className="p-3 bg-white/70 rounded-xl text-xs text-slate-500 font-medium space-y-1 border border-white">
              <div>• Current Points: {summary?.total_points} pts</div>
              <div>• Balance after redemption: {(summary?.total_points || 0) - redeemModalItem.points_cost} pts</div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setRedeemModalItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRedeem}
                disabled={redeeming}
                className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-blue-600 text-white shadow-md hover:bg-blue-700 transition"
              >
                {redeeming ? 'Processing...' : 'Confirm & Redeem'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

