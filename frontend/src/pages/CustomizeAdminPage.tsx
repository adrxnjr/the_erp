import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  Palette,
  Building,
  GraduationCap,
  LayoutGrid,
  CreditCard,
  Shield,
  MessageSquare,
  FileText,
  Sliders,
  Bus,
  Lock,
  Database,
  History,
  CheckCircle2,
  Save,
  RefreshCw,
  Eye,
  ToggleLeft,
  ToggleRight,
  Upload,
  Download,
  RotateCcw,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useBranding } from '../context/BrandingContext';

interface CustomizeTab {
  id: string;
  label: string;
  icon: any;
  description: string;
}

const CUSTOMIZE_TABS: CustomizeTab[] = [
  { id: 'branding', label: 'Branding', icon: Palette, description: 'School visual identity, logos, and color palette' },
  { id: 'profile', label: 'School Profile', icon: Building, description: 'Official institution details, affiliation, and address' },
  { id: 'academic', label: 'Academic Setup', icon: GraduationCap, description: 'Term dates, grading scales, and timetable periods' },
  { id: 'navigation', label: 'Navigation & Modules', icon: LayoutGrid, description: 'Toggle ERP modules visibility (e.g. Hostel, Tuitions)' },
  { id: 'finance', label: 'Finance', icon: CreditCard, description: 'Fee heads, currency format, and billing configurations' },
  { id: 'permissions', label: 'Roles & Permissions', icon: Shield, description: 'Access control matrices and administrative privileges' },
  { id: 'communication', label: 'Communication', icon: MessageSquare, description: 'SMS gateway, WhatsApp templates, and email notifications' },
  { id: 'documents', label: 'Documents & Templates', icon: FileText, description: 'TC format, Bonafide certificates, and student ID badges' },
  { id: 'fields', label: 'Custom Fields', icon: Sliders, description: 'Add custom data fields for students, parents, and staff' },
  { id: 'transport', label: 'Transport Settings', icon: Bus, description: 'GPS ping cadence, geofencing, and driver compliance alerts' },
  { id: 'security', label: 'Security & Access', icon: Lock, description: 'Session timeouts, lockout rules, and password policies' },
  { id: 'backup', label: 'Data & Backup', icon: Database, description: 'Database snapshots, export schedules, and data recovery' },
  { id: 'audit', label: 'Audit Log', icon: History, description: 'Immutable trail of administrative edits and user actions' },
];

export const CustomizeAdminPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'branding';
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const toast = useToast();

  useEffect(() => {
    document.title = 'Institutional Customize & Governance — Ever Grow Schools ERP';
  }, []);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  // State for interactive toggles
  const [modules, setModules] = useState({
    hostel: false,
    tuitions: true,
    transport: true,
    rewards: true,
    career: true,
    socialWall: true,
    gatePass: true,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    schoolName,
    tagline,
    customLogoUrl,
    activeLogo,
    updateSchoolName,
    updateTagline,
    updateLogo,
    resetLogo,
  } = useBranding();

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG, SVG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateLogo(reader.result);
        toast.success('New logo applied immediately across all portals, sidebar, and navbar!');
      }
    };
    reader.onerror = () => {
      toast.error('Failed to read image file.');
    };
    reader.readAsDataURL(file);

    if (e.target) {
      e.target.value = '';
    }
  };

  const handleResetLogo = () => {
    resetLogo();
    toast.showToast('Reset to default Ever Grow institutional ribbon logo.', 'info');
  };

  const [branding, setBranding] = useState({
    primaryColor: '#0066FF',
    accentColor: '#C25E2E',
    affiliationNo: 'CBSE Affiliation No: 1930482',
    isoCertified: true,
  });

  const [security, setSecurity] = useState({
    sessionTimeoutMins: 30,
    maxFailedAttempts: 5,
    lockoutDurationMins: 15,
    requirePasswordResetDays: 90,
    mfaEnabled: true,
  });

  const handleSave = (sectionName: string) => {
    toast.success(`${sectionName} configurations saved successfully.`);
  };

  const currentTabObj = CUSTOMIZE_TABS.find((t) => t.id === activeTab) || CUSTOMIZE_TABS[0];

  return (
    <div className="space-y-6 animate-fadeIn pb-12 select-none">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                Institutional Customization & Governance
              </h1>
              <p className="text-xs text-slate-500">
                Super Admin Master Control Panel • Centralized Configuration for Ever Grow Schools
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleSave(currentTabObj.label)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Main Container: Tabs on Left, Content on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sub-Tabs Navigation */}
        <div className="lg:col-span-1 space-y-1.5 p-3 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
          <div className="px-3 py-2 text-[10px] font-black uppercase text-slate-400 tracking-wider">
            Customization Modules
          </div>
          <div className="space-y-1 max-h-[640px] overflow-y-auto pr-1">
            {CUSTOMIZE_TABS.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-2xl text-left text-xs transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-[#EBEEF2] text-blue-600 font-bold shadow-[inset_3px_3px_6px_#C8D0DC,inset_-3px_-3px_6px_#FFFFFF] border-white/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-[#EBEEF2] hover:shadow-[3px_3px_7px_#C8D0DC,-3px_-3px_7px_#FFFFFF] border-transparent font-semibold'
                  }`}
                >
                  <TabIcon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Active Tab Content */}
        <div className="lg:col-span-3 p-6 sm:p-8 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-6">
          <div className="border-b border-slate-300/60 pb-4">
            <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center space-x-2">
              <currentTabObj.icon className="w-5 h-5 text-blue-600" />
              <span>{currentTabObj.label}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">{currentTabObj.description}</p>
          </div>

          {/* Tab 1: Branding */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Institution Name</label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => updateSchoolName(e.target.value)}
                    placeholder="e.g. Ever Grow International Schools"
                    className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#EBEEF2] shadow-[inset_2px_2px_5px_#C8D0DC,inset_-2px_-2px_5px_#FFFFFF] border border-white/60 focus:outline-none text-slate-800 font-semibold"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Updates immediately across sidebar, navbar, and portal headers.</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Official Motto / Tagline</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => updateTagline(e.target.value)}
                    placeholder="e.g. Excellence in Holistic Education"
                    className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#EBEEF2] shadow-[inset_2px_2px_5px_#C8D0DC,inset_-2px_-2px_5px_#FFFFFF] border border-white/60 focus:outline-none text-slate-800 font-semibold"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Displayed alongside school branding and official reports.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Primary Brand Blue</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={branding.primaryColor}
                      onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                      className="w-10 h-10 rounded-xl cursor-pointer border border-white/80 bg-[#EBEEF2]"
                    />
                    <span className="text-xs font-mono font-bold text-slate-600">{branding.primaryColor}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Muted Orange Accent</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={branding.accentColor}
                      onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                      className="w-10 h-10 rounded-xl cursor-pointer border border-white/80 bg-[#EBEEF2]"
                    />
                    <span className="text-xs font-mono font-bold text-slate-600">{branding.accentColor}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_5px_#C8D0DC,inset_-2px_-2px_5px_#FFFFFF] border border-white/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">Logo Preview & Asset Sync</span>
                    <p className="text-[11px] text-slate-500">
                      Current logo deployed across Sidebar, Navbar, PDF Receipts, Student ID Cards, and Social Wall header.
                    </p>
                  </div>
                  {customLogoUrl ? (
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-blue-100 text-blue-700 border border-blue-200">
                      Custom Logo Active
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-slate-200 text-slate-600 border border-slate-300">
                      Default Ribbon Active
                    </span>
                  )}
                </div>

                {/* Logo Live Preview Thumbnail */}
                <div className="p-3.5 rounded-xl bg-white/70 border border-white shadow-inner flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-[#EBEEF2] shadow-[2px_2px_5px_#C8D0DC,-2px_-2px_5px_#FFFFFF] p-1.5 flex items-center justify-center border border-white/80 shrink-0">
                    <img
                      src={activeLogo}
                      alt="Active Logo Preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <div className="text-xs font-black text-slate-800">{schoolName}</div>
                    <div className="text-[11px] font-semibold text-slate-500">{tagline}</div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {customLogoUrl
                        ? 'Custom uploaded graphic is dynamically powering the sidebar, navbar, and print documents.'
                        : 'Default institutional vector artwork is currently rendered.'}
                    </p>
                  </div>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/svg+xml,image/jpeg,image/webp"
                  onChange={handleLogoFileUpload}
                  className="hidden"
                />

                {/* Action Buttons */}
                <div className="pt-1 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-[#EBEEF2] shadow-[3px_3px_6px_#C8D0DC,-3px_-3px_6px_#FFFFFF] hover:shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1.5 border border-white/80 cursor-pointer active:scale-98 transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload New SVG/PNG Logo</span>
                  </button>

                  {customLogoUrl && (
                    <button
                      type="button"
                      onClick={handleResetLogo}
                      className="px-3.5 py-2 rounded-xl bg-[#EBEEF2] shadow-[3px_3px_6px_#C8D0DC,-3px_-3px_6px_#FFFFFF] hover:shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] text-xs font-bold text-slate-600 hover:text-rose-600 flex items-center space-x-1.5 border border-white/80 cursor-pointer active:scale-98 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset to Default Logo</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: School Profile */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Affiliation Code</label>
                  <input
                    type="text"
                    defaultValue="CBSE/AFF/1930482/2026"
                    className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#EBEEF2] shadow-[inset_2px_2px_5px_#C8D0DC,inset_-2px_-2px_5px_#FFFFFF] border border-white/60 text-slate-800 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Principal In-Charge</label>
                  <input
                    type="text"
                    defaultValue="Dr. Arthur Vance, Ph.D."
                    className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#EBEEF2] shadow-[inset_2px_2px_5px_#C8D0DC,inset_-2px_-2px_5px_#FFFFFF] border border-white/60 text-slate-800 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Campus Helpline Email</label>
                  <input
                    type="email"
                    defaultValue="principal@evergrowschools.edu"
                    className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#EBEEF2] shadow-[inset_2px_2px_5px_#C8D0DC,inset_-2px_-2px_5px_#FFFFFF] border border-white/60 text-slate-800 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Emergency Contact Hotline</label>
                  <input
                    type="text"
                    defaultValue="+91 (044) 2894-8800"
                    className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#EBEEF2] shadow-[inset_2px_2px_5px_#C8D0DC,inset_-2px_-2px_5px_#FFFFFF] border border-white/60 text-slate-800 font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Academic Setup */}
          {activeTab === 'academic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[3px_3px_7px_#C8D0DC,-3px_-3px_7px_#FFFFFF] border border-white/60">
                  <div className="text-xs font-bold text-slate-700">Academic Year</div>
                  <div className="text-lg font-black text-blue-600 mt-1">2026 – 2027</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">June 1 to March 31</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[3px_3px_7px_#C8D0DC,-3px_-3px_7px_#FFFFFF] border border-white/60">
                  <div className="text-xs font-bold text-slate-700">Daily Periods</div>
                  <div className="text-lg font-black text-emerald-600 mt-1">8 Periods</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">45 Minutes Each</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[3px_3px_7px_#C8D0DC,-3px_-3px_7px_#FFFFFF] border border-white/60">
                  <div className="text-xs font-bold text-slate-700">Grading System</div>
                  <div className="text-lg font-black text-purple-600 mt-1">CBSE 10-Point GPA</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Cumulative Scale</div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Navigation & Modules (Hostel can be switched off here!) */}
          {activeTab === 'navigation' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Enable or disable campus ERP modules. Toggling an item dynamically updates sidebar availability across portals.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[3px_3px_7px_#C8D0DC,-3px_-3px_7px_#FFFFFF] border border-white/60 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Hostel & Boarding</div>
                    <div className="text-[10px] text-slate-500">Residential wing operations (Hostel module)</div>
                  </div>
                  <button
                    onClick={() => {
                      setModules({ ...modules, hostel: !modules.hostel });
                      toast.showToast(`Hostel module ${!modules.hostel ? 'Enabled' : 'Disabled'}.`, 'info');
                    }}
                    className="p-1 text-slate-700 cursor-pointer"
                  >
                    {modules.hostel ? (
                      <ToggleRight className="w-8 h-8 text-blue-600" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-400" />
                    )}
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[3px_3px_7px_#C8D0DC,-3px_-3px_7px_#FFFFFF] border border-white/60 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Extended Tuition Centers</div>
                    <div className="text-[10px] text-slate-500">After-school tuition directory</div>
                  </div>
                  <button
                    onClick={() => setModules({ ...modules, tuitions: !modules.tuitions })}
                    className="p-1 text-slate-700 cursor-pointer"
                  >
                    {modules.tuitions ? (
                      <ToggleRight className="w-8 h-8 text-blue-600" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-400" />
                    )}
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[3px_3px_7px_#C8D0DC,-3px_-3px_7px_#FFFFFF] border border-white/60 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Live GPS Fleet Transit</div>
                    <div className="text-[10px] text-slate-500">Real-time bus tracking</div>
                  </div>
                  <button
                    onClick={() => setModules({ ...modules, transport: !modules.transport })}
                    className="p-1 text-slate-700 cursor-pointer"
                  >
                    {modules.transport ? (
                      <ToggleRight className="w-8 h-8 text-blue-600" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-400" />
                    )}
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[3px_3px_7px_#C8D0DC,-3px_-3px_7px_#FFFFFF] border border-white/60 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Gamified Merit Rewards</div>
                    <div className="text-[10px] text-slate-500">Points & badges system</div>
                  </div>
                  <button
                    onClick={() => setModules({ ...modules, rewards: !modules.rewards })}
                    className="p-1 text-slate-700 cursor-pointer"
                  >
                    {modules.rewards ? (
                      <ToggleRight className="w-8 h-8 text-blue-600" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Finance */}
          {activeTab === 'finance' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Standard Currency</label>
                  <input
                    type="text"
                    defaultValue="INR (₹) — Indian Rupee"
                    disabled
                    className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#EBEEF2] shadow-[inset_2px_2px_5px_#C8D0DC,inset_-2px_-2px_5px_#FFFFFF] border border-white/60 text-slate-600 font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tax Exemption Code</label>
                  <input
                    type="text"
                    defaultValue="80G / 12AA Certified"
                    className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#EBEEF2] shadow-[inset_2px_2px_5px_#C8D0DC,inset_-2px_-2px_5px_#FFFFFF] border border-white/60 text-slate-800 font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 6: Roles & Permissions */}
          {activeTab === 'permissions' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[3px_3px_7px_#C8D0DC,-3px_-3px_7px_#FFFFFF] border border-white/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800">Role-Based Access Control (RBAC)</span>
                    <p className="text-[11px] text-slate-500">Super Admin, Principal, Coordinator, Teacher, Parent, Student</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Enforced
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 7: Communication */}
          {activeTab === 'communication' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[3px_3px_7px_#C8D0DC,-3px_-3px_7px_#FFFFFF] border border-white/60 space-y-3">
                <span className="text-xs font-bold text-slate-800">Integrated Gateways</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF]">
                    <div className="font-bold text-slate-800">WhatsApp Business API</div>
                    <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Connected (Meta Cloud)</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF]">
                    <div className="font-bold text-slate-800">DLT SMS Gateway</div>
                    <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Active (TRAI Verified)</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 8: Documents & Templates */}
          {activeTab === 'documents' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[3px_3px_7px_#C8D0DC,-3px_-3px_7px_#FFFFFF] border border-white/60 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">Transfer Certificate (TC) Template</div>
                  <div className="text-[10px] text-slate-500">CBSE Affiliation Rule 19 Format with digital QR verification</div>
                </div>
                <button className="px-3 py-1.5 rounded-lg bg-[#EBEEF2] shadow-[2px_2px_5px_#C8D0DC,-2px_-2px_5px_#FFFFFF] text-xs font-bold text-slate-700 hover:text-blue-600 flex items-center space-x-1 cursor-pointer">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[3px_3px_7px_#C8D0DC,-3px_-3px_7px_#FFFFFF] border border-white/60 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">Official Student ID Badge</div>
                  <div className="text-[10px] text-slate-500">ISO 85mm x 54mm credit-card landscape layout</div>
                </div>
                <button className="px-3 py-1.5 rounded-lg bg-[#EBEEF2] shadow-[2px_2px_5px_#C8D0DC,-2px_-2px_5px_#FFFFFF] text-xs font-bold text-slate-700 hover:text-blue-600 flex items-center space-x-1 cursor-pointer">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 9: Custom Fields */}
          {activeTab === 'fields' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Define specialized metadata fields to collect during student enrollment or faculty onboarding.
              </p>
              <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[3px_3px_7px_#C8D0DC,-3px_-3px_7px_#FFFFFF] border border-white/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800">Blood Group & Allergies Record</span>
                  <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">Student Profile</span>
                </div>
                <span className="text-xs text-slate-500 font-bold">Mandatory</span>
              </div>
            </div>
          )}

          {/* Tab 10: Transport Settings */}
          {activeTab === 'transport' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">GPS Telemetry Interval</label>
                  <input
                    type="text"
                    defaultValue="Every 15 Seconds"
                    className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#EBEEF2] shadow-[inset_2px_2px_5px_#C8D0DC,inset_-2px_-2px_5px_#FFFFFF] border border-white/60 text-slate-800 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Campus Geofence Radius</label>
                  <input
                    type="text"
                    defaultValue="150 Meters"
                    className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#EBEEF2] shadow-[inset_2px_2px_5px_#C8D0DC,inset_-2px_-2px_5px_#FFFFFF] border border-white/60 text-slate-800 font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 11: Security & Access */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Session Inactivity Timeout</label>
                  <input
                    type="number"
                    value={security.sessionTimeoutMins}
                    onChange={(e) => setSecurity({ ...security, sessionTimeoutMins: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#EBEEF2] shadow-[inset_2px_2px_5px_#C8D0DC,inset_-2px_-2px_5px_#FFFFFF] border border-white/60 text-slate-800 font-semibold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Minutes until automatic sign-out</span>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Max Failed Logins</label>
                  <input
                    type="number"
                    value={security.maxFailedAttempts}
                    onChange={(e) => setSecurity({ ...security, maxFailedAttempts: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#EBEEF2] shadow-[inset_2px_2px_5px_#C8D0DC,inset_-2px_-2px_5px_#FFFFFF] border border-white/60 text-slate-800 font-semibold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Attempts before account lockout</span>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Lockout Duration</label>
                  <input
                    type="number"
                    value={security.lockoutDurationMins}
                    onChange={(e) => setSecurity({ ...security, lockoutDurationMins: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#EBEEF2] shadow-[inset_2px_2px_5px_#C8D0DC,inset_-2px_-2px_5px_#FFFFFF] border border-white/60 text-slate-800 font-semibold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Minutes account remains locked</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 12: Data & Backup */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[3px_3px_7px_#C8D0DC,-3px_-3px_7px_#FFFFFF] border border-white/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Automated Daily Snapshot</div>
                    <div className="text-[10px] text-slate-500">Every night at 02:00 AM IST • Retained for 90 days</div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                    Active
                  </span>
                </div>
                <div className="pt-2 flex items-center space-x-3">
                  <button
                    onClick={() => toast.success('Institutional database backup export generated.')}
                    className="px-3.5 py-2 rounded-xl bg-[#EBEEF2] shadow-[2px_2px_5px_#C8D0DC,-2px_-2px_5px_#FFFFFF] hover:text-blue-600 text-xs font-bold text-slate-700 flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Immediate Backup Snapshot (SQL/ZIP)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 13: Audit Log */}
          {activeTab === 'audit' && (
            <div className="space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-300/60 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      <th className="py-2 px-3">Timestamp</th>
                      <th className="py-2 px-3">Actor</th>
                      <th className="py-2 px-3">Action</th>
                      <th className="py-2 px-3">Module</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 font-medium text-slate-700">
                    <tr>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">Today 10:45 AM</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">adrin (Super Admin)</td>
                      <td className="py-2.5 px-3">Update System Configuration</td>
                      <td className="py-2.5 px-3">Customization</td>
                      <td className="py-2.5 px-3"><span className="text-emerald-600 font-bold">SUCCESS</span></td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">Today 09:12 AM</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">principal</td>
                      <td className="py-2.5 px-3">Approve Attendance Correction</td>
                      <td className="py-2.5 px-3">Attendance</td>
                      <td className="py-2.5 px-3"><span className="text-emerald-600 font-bold">SUCCESS</span></td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">Yesterday 04:30 PM</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">staff5 (Accountant)</td>
                      <td className="py-2.5 px-3">Fee Concession Authorization</td>
                      <td className="py-2.5 px-3">Fees</td>
                      <td className="py-2.5 px-3"><span className="text-emerald-600 font-bold">SUCCESS</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
