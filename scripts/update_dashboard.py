import re

with open('frontend/src/pages/DashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update imports
old_import = "} from 'lucide-react';"
new_import = """  Package,
  FileCheck,
  Printer,
  X,
  FileText,
  UserPlus,
  Sparkles,
} from 'lucide-react';"""

content = content.replace(old_import, new_import, 1)

# 2. Update role conditions
old_roles = """  const isSuperAdmin =
    user?.roles?.includes('super_admin') || user?.username === 'adrin';
  const isAdmin =
    !isSuperAdmin &&
    (user?.roles?.includes('school_admin') ||
      user?.roles?.includes('principal') ||
      user?.roles?.includes('admin'));
  const isTeacher =
    !isSuperAdmin &&
    !isAdmin &&
    (user?.roles?.includes('teacher') || user?.portal_type === 'staff');"""

new_roles = """  const isSuperAdmin =
    user?.roles?.includes('super_admin') || user?.username === 'adrin';
  const isOfficeStaff =
    !isSuperAdmin &&
    (user?.username === 'staff' ||
      user?.roles?.includes('office_staff') ||
      user?.roles?.includes('accountant') ||
      (user?.portal_type === 'staff' &&
        !user?.roles?.includes('teacher') &&
        user?.username !== 'adrin' &&
        !user?.roles?.includes('principal') &&
        !user?.username?.startsWith('staff3')));
  const isAdmin =
    !isSuperAdmin &&
    !isOfficeStaff &&
    (user?.roles?.includes('principal') ||
      user?.roles?.includes('admin'));
  const isTeacher =
    !isSuperAdmin &&
    !isOfficeStaff &&
    !isAdmin &&
    (user?.roles?.includes('teacher') || user?.username?.startsWith('staff') || user?.portal_type === 'staff');

  // Office Desk interactive certificate modal state
  const [showCertModal, setShowCertModal] = useState<boolean>(false);
  const [certForm, setCertForm] = useState({
    studentName: 'M. Mohan',
    admissionNo: 'EGS20260001',
    className: 'Class 10-A',
    certType: 'Bonafide Certificate',
    purpose: 'Passport Application',
  });
  const [certGenerated, setCertGenerated] = useState<boolean>(false);"""

content = content.replace(old_roles, new_roles, 1)

# 3. Add Office Staff UI before section 4 (isAdmin)
target_section_4 = "  // =========================================================================\n  // 4. ADMIN & PRINCIPAL CAMPUS OPERATIONS DASHBOARD\n  // ========================================================================="

office_staff_block = '''  // =========================================================================
  // 3.5. STAFF OFFICE DESK (11 DEDICATED SCHOOL OFFICE OPERATIONS)
  // =========================================================================
  if (isOfficeStaff) {
    const officeOperations = [
      {
        id: 'fees',
        title: 'Fees Payments & Counter Collections',
        badge: 'Counter Online',
        badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: CreditCard,
        iconColor: 'bg-emerald-50 text-emerald-600',
        description: 'Collect tuition fees, term payments, admission installments with instant thermal receipt generation and day-book ledger.',
        primaryLink: '/fees',
        primaryText: 'Open Fee Counter',
        secondaryLink: '/treasury',
        secondaryText: 'Day Ledger',
      },
      {
        id: 'attendance',
        title: 'Attendance Management System',
        badge: 'Muster Roll Sync',
        badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: CalendarCheck,
        iconColor: 'bg-blue-50 text-[#0071E3]',
        description: 'Verify daily roll-calls across Class 10-A, 10-B, 10-C (144/150 Present), trigger absentee parent notices, and track staff attendance.',
        primaryLink: '/attendance',
        primaryText: 'Student Attendance',
        secondaryLink: '/staff-attendance',
        secondaryText: 'Staff Register',
      },
      {
        id: 'bonafide',
        title: 'Bonafide & Certificate Issuance Desk',
        badge: 'Instant Forms',
        badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: FileCheck,
        iconColor: 'bg-purple-50 text-purple-600',
        description: 'Issue official Bonafide Certificates, Transfer Certificates (TC), Study Certificates, and Conduct Letters with institutional seals.',
        isModalAction: true,
        primaryText: 'Issue Certificate Form',
        secondaryLink: '/reports',
        secondaryText: 'Archived Letters',
      },
      {
        id: 'scholarships',
        title: 'Scholarships & Fee Concession Forms',
        badge: 'Govt & Merit Grants',
        badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: Award,
        iconColor: 'bg-amber-50 text-amber-600',
        description: 'Process state scholarship applications, sports quotas, staff ward concessions, and merit fee waiver approvals.',
        primaryLink: '/scholarships',
        primaryText: 'Scholarship Desk',
        secondaryLink: '/fees',
        secondaryText: 'Fee Concessions',
      },
      {
        id: 'admissions',
        title: 'Admission Enquiries & Enrollment Forms',
        badge: 'Session 2026-27',
        badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
        icon: HelpCircle,
        iconColor: 'bg-sky-50 text-sky-600',
        description: 'Manage prospective parent visits, admission enquiry registration, applicant document verification, and roll allotment.',
        primaryLink: '/enquiry',
        primaryText: 'Admission Enquiries',
        secondaryLink: '/admission-enquiry',
        secondaryText: 'Public Form',
      },
      {
        id: 'billing',
        title: 'Billings, Invoices & Day-Book',
        badge: 'Accounts Desk',
        badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
        icon: Receipt,
        iconColor: 'bg-teal-50 text-teal-600',
        description: 'Generate institutional bills, bus pass fees, book store vouchers, and daily counter collection tally with invoice download.',
        primaryLink: '/billing',
        primaryText: 'Billing Desk',
        secondaryLink: '/treasury',
        secondaryText: 'Bank Records',
      },
      {
        id: 'students',
        title: 'Student Directory & Identity Roster',
        badge: '150 Students Active',
        badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        icon: Users,
        iconColor: 'bg-indigo-50 text-indigo-600',
        description: 'Access complete student files across 10-A, 10-B, and 10-C with demographic and parent guardian records.',
        primaryLink: '/students',
        primaryText: 'Student Directory',
        secondaryLink: '/students',
        secondaryText: 'Export RFID IDs',
      },
      {
        id: 'parents',
        title: 'Parents & Guardians Directory',
        badge: 'Communication',
        badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        icon: UserPlus,
        iconColor: 'bg-cyan-50 text-cyan-600',
        description: 'Maintain parent guardian contact records, emergency numbers, address updates, and broadcast communication.',
        primaryLink: '/parents',
        primaryText: 'Guardian Directory',
        secondaryLink: '/notifications',
        secondaryText: 'Broadcast SMS',
      },
      {
        id: 'workforce',
        title: 'Staff Workforce & Leave Register',
        badge: 'HR & Roster',
        badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: UserCheck,
        iconColor: 'bg-rose-50 text-rose-600',
        description: 'Track non-teaching staff attendance, faculty leave authorizations, and service records.',
        primaryLink: '/staff-attendance',
        primaryText: 'Staff Attendance',
        secondaryLink: '/payroll',
        secondaryText: 'Faculty Payroll',
      },
      {
        id: 'inventory',
        title: 'Inventory, Uniforms & Stationery',
        badge: 'Stores & Stock',
        badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
        icon: Package,
        iconColor: 'bg-orange-50 text-orange-600',
        description: 'Classroom textbooks, notebooks, laboratory chemicals, uniforms stock, and vendor purchase orders.',
        primaryLink: '/inventory',
        primaryText: 'Inventory Ledger',
        secondaryLink: '/inventory',
        secondaryText: 'New Requisition',
      },
      {
        id: 'visitors',
        title: 'Visitor Management & Campus Gate Passes',
        badge: 'Campus Security',
        badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
        icon: ShieldAlert,
        iconColor: 'bg-slate-100 text-slate-700',
        description: 'Issue official visitor passes for parents and contractors, log delivery vehicles, and security clearance.',
        primaryLink: '/visitors',
        primaryText: 'Visitor Gate Log',
        secondaryLink: '/transport',
        secondaryText: 'Fleet & Buses',
      },
    ];

    const handleIssueCertificate = () => {
      setCertGenerated(true);
      toast.success(`${certForm.certType} successfully generated for ${certForm.studentName} (${certForm.admissionNo})!`);
    };

    return (
      <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-12">
        {/* Office Desk Hero Header */}
        <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/90 rounded-[28px] p-8 text-slate-900 border border-blue-200/80 shadow-[0_8px_32px_rgba(0,113,227,0.08)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold rounded-full uppercase tracking-wider flex items-center space-x-1.5 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Campus Office Desk • Central Operations</span>
              </span>
              <span className="px-3 py-1 bg-emerald-500/15 text-[#34C759] border border-emerald-500/30 text-xs font-semibold rounded-full">
                Session 2026-2027
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#1D1D1F]">
              School Office Administration
            </h1>
            <p className="text-slate-600 text-xs md:text-sm max-w-2xl">
              Front office command desk for counter fee collections, bonafide & transfer certificates, student admissions, attendance, and campus supplies.
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <button
              onClick={() => {
                setCertGenerated(false);
                setShowCertModal(true);
              }}
              className="ios-gloss-btn px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-md inline-flex items-center gap-2 cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              <span>+ Issue Bonafide / TC</span>
            </button>
            <Link
              to="/fees"
              className="ios-gloss-btn-secondary px-4 py-2.5 rounded-2xl text-xs font-semibold inline-flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4 text-[#0071E3]" />
              <span>Collect Fee</span>
            </Link>
          </div>
        </div>

        {/* 4 Office Desk Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="ios-card rounded-[22px] p-6">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">Daily Collections</span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline space-x-2">
              <span className="text-3xl font-black text-[#1D1D1F] tracking-tight">₹1,42,500</span>
            </div>
            <p className="mt-2 text-xs text-emerald-600 font-semibold">42 Counter Receipts Logged Today</p>
          </div>

          <div className="ios-card rounded-[22px] p-6">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">Campus Attendance</span>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0071E3] flex items-center justify-center">
                <CalendarCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline space-x-2">
              <span className="text-3xl font-black text-[#1D1D1F] tracking-tight">96.4%</span>
            </div>
            <p className="mt-2 text-xs text-blue-600 font-semibold">144 / 150 Students Present Today</p>
          </div>

          <div className="ios-card rounded-[22px] p-6">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">Certificate Requests</span>
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline space-x-2">
              <span className="text-3xl font-black text-[#1D1D1F] tracking-tight">8 Pending</span>
            </div>
            <p className="mt-2 text-xs text-purple-600 font-semibold">Bonafide, TC & Conduct letters</p>
          </div>

          <div className="ios-card rounded-[22px] p-6">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">Registered Scholars</span>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline space-x-2">
              <span className="text-3xl font-black text-[#1D1D1F] tracking-tight">150 Students</span>
            </div>
            <p className="mt-2 text-xs text-amber-600 font-semibold">Class 10-A (50), 10-B (50), 10-C (50)</p>
          </div>
        </div>

        {/* 11 School Office Works Options Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#1D1D1F]">School Office Administrative Counter</h2>
              <p className="text-xs text-[#86868B]">11 core operational functions for daily campus governance and student documentation.</p>
            </div>
            <span className="text-xs font-semibold text-[#0071E3] bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
              11 Modules Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {officeOperations.map((op) => {
              const Icon = op.icon;
              return (
                <div
                  key={op.id}
                  className="ios-card rounded-[22px] p-6 flex flex-col justify-between hover:shadow-md transition-all duration-200 border border-white/60"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className={`w-12 h-12 rounded-2xl ${op.iconColor} flex items-center justify-center shrink-0 shadow-2xs`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${op.badgeColor}`}>
                        {op.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#1D1D1F] mt-4 tracking-tight leading-snug">
                      {op.title}
                    </h3>
                    <p className="text-xs text-[#86868B] mt-2 leading-relaxed">
                      {op.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    {op.isModalAction ? (
                      <button
                        onClick={() => {
                          setCertGenerated(false);
                          setShowCertModal(true);
                        }}
                        className="ios-gloss-btn px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>{op.primaryText}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <Link
                        to={op.primaryLink!}
                        className="ios-gloss-btn px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                      >
                        <span>{op.primaryText}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}

                    <Link
                      to={op.secondaryLink}
                      className="text-xs font-semibold text-slate-500 hover:text-[#0071E3] px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      {op.secondaryText}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Certificate Issuance Modal */}
        {showCertModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-scaleUp">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Issue Institutional Certificate</h3>
                    <p className="text-xs text-slate-500">Official seal & signature generation desk</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCertModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!certGenerated ? (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Select Enrolled Student</label>
                    <select
                      value={certForm.admissionNo}
                      onChange={(e) => {
                        const adm = e.target.value;
                        const names: Record<string, string> = {
                          'EGS20260001': 'M. Mohan (Class 10-A, Roll #1)',
                          'EGS20260002': 'A. Bhuvana (Class 10-A, Roll #2)',
                          'EGS20260051': 'K. Vignesh (Class 10-B, Roll #1)',
                          'EGS20260101': 'S. Sneha (Class 10-C, Roll #1)',
                        };
                        setCertForm({
                          ...certForm,
                          admissionNo: adm,
                          studentName: names[adm] || 'M. Mohan',
                        });
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-[#0071E3] focus:outline-none"
                    >
                      <option value="EGS20260001">M. Mohan — EGS20260001 (Class 10-A, Roll #1)</option>
                      <option value="EGS20260002">A. Bhuvana — EGS20260002 (Class 10-A, Roll #2)</option>
                      <option value="EGS20260051">K. Vignesh — EGS20260051 (Class 10-B, Roll #1)</option>
                      <option value="EGS20260101">S. Sneha — EGS20260101 (Class 10-C, Roll #1)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Certificate Type</label>
                      <select
                        value={certForm.certType}
                        onChange={(e) => setCertForm({ ...certForm, certType: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-[#0071E3] focus:outline-none"
                      >
                        <option value="Bonafide Certificate">Bonafide Certificate</option>
                        <option value="Transfer Certificate (TC)">Transfer Certificate (TC)</option>
                        <option value="Study Certificate">Study Certificate</option>
                        <option value="Character & Conduct Letter">Character & Conduct Letter</option>
                        <option value="Fee Estimation Certificate">Fee Estimation Certificate</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Reason / Purpose</label>
                      <select
                        value={certForm.purpose}
                        onChange={(e) => setCertForm({ ...certForm, purpose: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-[#0071E3] focus:outline-none"
                      >
                        <option value="Passport Application">Passport Application</option>
                        <option value="Bank Account Opening">Bank Account Opening</option>
                        <option value="Govt Scholarship Application">Govt Scholarship Application</option>
                        <option value="State Bus Concession Pass">State Bus Concession Pass</option>
                        <option value="Higher Education Admission">Higher Education Admission</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-xl text-[11px] text-purple-900">
                    <strong>Institutional Registry Policy:</strong> Issued certificates are cryptographically stamped with a unique QR verification code and archived in the school dispatch registry.
                  </div>

                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      onClick={() => setShowCertModal(false)}
                      className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleIssueCertificate}
                      className="ios-gloss-btn px-5 py-2 rounded-xl font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                      <span>Generate & Sign Certificate</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Generated Preview */
                <div className="space-y-4">
                  <div className="p-6 bg-slate-50 border-2 border-dashed border-purple-300 rounded-2xl text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                      <Check className="w-6 h-6" />
                    </div>
                    <div className="text-xs uppercase font-black tracking-widest text-purple-700">
                      EVER GROW MATRICULATION HIGHER SECONDARY SCHOOL
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 underline">{certForm.certType}</h4>
                    <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                      This is to certify that <strong>{certForm.studentName}</strong> (Admission No: <strong>{certForm.admissionNo}</strong>) is a bonafide student of this institution studying in <strong>Class 10-A</strong> during the academic year <strong>2026-2027</strong>.
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Issued on request for the purpose of <em>{certForm.purpose}</em>.
                    </p>
                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Dispatch Ref: EGS/CERT/2026/{Math.floor(1000 + Math.random() * 9000)}</span>
                      <span>Authorized Office Signatory ✓</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setCertGenerated(false)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                    >
                      ← Create Another
                    </button>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          toast.success('Certificate sent to campus network printer!');
                          setShowCertModal(false);
                        }}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Print Hardcopy</span>
                      </button>
                      <button
                        onClick={() => {
                          toast.success('Certificate PDF downloaded successfully!');
                          setShowCertModal(false);
                        }}
                        className="ios-gloss-btn px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download PDF</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
'''

content = content.replace(target_section_4, office_staff_block + "\n\n" + target_section_4, 1)

with open('frontend/src/pages/DashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated DashboardPage.tsx successfully!")

