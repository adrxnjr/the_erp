import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  CheckSquare,
  Bell,
  UserPlus,
  FileText,
  Library,
  Receipt,
  Package,
  Calendar,
  ShieldAlert,
  LifeBuoy,
  BarChart3,
  UserCog,
  Workflow,
  Settings,
  Plus,
  Search,
  Download,
  Phone,
  Send,
  Award,
  Printer,
  DollarSign,
  X,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import schoolData from '../data/schoolData.json';

export const ModuleHubPage: React.FC = () => {
  const location = useLocation();
  const toast = useToast();
  const pathname = location.pathname;

  // Determine current module from route pathname
  let moduleKey = 'approvals';
  if (pathname.includes('/notifications')) moduleKey = 'notifications';
  else if (pathname.includes('/parents')) moduleKey = 'parents';
  else if (pathname.includes('/homework')) moduleKey = 'homework';
  else if (pathname.includes('/library')) moduleKey = 'library';
  else if (pathname.includes('/payroll')) moduleKey = 'payroll';
  else if (pathname.includes('/inventory')) moduleKey = 'inventory';
  else if (pathname.includes('/events')) moduleKey = 'events';
  else if (pathname.includes('/visitors')) moduleKey = 'visitors';
  else if (pathname.includes('/helpdesk')) moduleKey = 'helpdesk';
  else if (pathname.includes('/analytics')) moduleKey = 'analytics';
  else if (pathname.includes('/roles-users')) moduleKey = 'roles-users';
  else if (pathname.includes('/integrations')) moduleKey = 'integrations';
  else if (pathname.includes('/settings')) moduleKey = 'settings';
  else if (pathname.includes('/billing')) moduleKey = 'billing';
  else if (pathname.includes('/scholarships')) moduleKey = 'scholarships';

  useEffect(() => {
    const titles: Record<string, string> = {
      approvals: 'Approvals & Sanctions Desk — Ever Grow Schools ERP',
      notifications: 'Broadcast Alerts & SMS Circulars — Ever Grow Schools ERP',
      parents: 'Parent Accounts & Children Roster — Ever Grow Schools ERP',
      homework: 'Homework & Institutional Circulars — Ever Grow Schools ERP',
      library: 'Campus Library & Digital Catalog — Ever Grow Schools ERP',
      payroll: 'Faculty Payroll & Compensation — Ever Grow Schools ERP',
      inventory: 'Inventory & Purchases Ledger — Ever Grow Schools ERP',
      events: 'Events & Academic Calendar — Ever Grow Schools ERP',
      visitors: 'Visitors & Campus Gate Pass — Ever Grow Schools ERP',
      helpdesk: 'Helpdesk & Grievance Complaints — Ever Grow Schools ERP',
      analytics: 'Institutional Trends & Risk Analytics — Ever Grow Schools ERP',
      'roles-users': 'User Account Management & Roles — Ever Grow Schools ERP',
      integrations: 'Gateways & Third-Party Integrations — Ever Grow Schools ERP',
      settings: 'Institutional Preferences & Settings — Ever Grow Schools ERP',
      billing: 'Office Counter Billing & Fee Invoices — Ever Grow Schools ERP',
      scholarships: 'Scholarship Sanctions & Fee Concessions — Ever Grow Schools ERP',
    };
    document.title = titles[moduleKey] || 'School ERP Administration';
  }, [moduleKey]);

  // =========================================================================
  // 1. NOTIFICATIONS MODULE STATE & ACTIONS
  // =========================================================================
  const [broadcastChannel, setBroadcastChannel] = useState<'whatsapp' | 'sms' | 'portal' | 'emergency'>('whatsapp');
  const [broadcastAudience, setBroadcastAudience] = useState<string>('All Parents');
  const [broadcastCategory, setBroadcastCategory] = useState<string>('Academic Notice');
  const [broadcastPriority, setBroadcastPriority] = useState<'Normal' | 'High' | 'Urgent'>('Normal');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');

  const [broadcastsList, setBroadcastsList] = useState([
    {
      id: 'BC-2026-101',
      title: 'Term 2 Board Examination Timetable Published',
      message: 'Official Class 10 Board preliminary schedule has been released. Download hall tickets from the student portal.',
      category: 'Academic Notice',
      channel: 'WhatsApp & In-App',
      audience: 'Class 10 Parents (150 Guardians)',
      priority: 'High',
      date: 'Today, 10:15 AM',
      deliveredCount: '150 / 150',
      status: 'Delivered 100%',
    },
    {
      id: 'BC-2026-102',
      title: 'Heavy Rain Warning: School Bus Corridors Monitored',
      message: 'All 24 school transport fleets equipped with live GPS telemetry. Delays along coastal routes kept under 8 minutes.',
      category: 'Weather & Transport',
      channel: 'SMS Gateway',
      audience: 'Transport Fleet Riders (340 Parents)',
      priority: 'Urgent',
      date: 'Yesterday, 04:30 PM',
      deliveredCount: '340 / 340',
      status: 'Delivered 100%',
    },
    {
      id: 'BC-2026-103',
      title: 'Term 1 Fee Clearance & Counter Billing Reminder',
      message: 'Kindly settle outstanding fee installments before Friday to generate official examination entrance passes.',
      category: 'Fee Alert',
      channel: 'SMS & WhatsApp',
      audience: 'All Parents (1,840 Guardians)',
      priority: 'Normal',
      date: 'Nov 07, 2026',
      deliveredCount: '1,812 / 1,840',
      status: 'Delivered 98.5%',
    },
    {
      id: 'BC-2026-104',
      title: 'Annual Sports Meet 2026 Registration Open',
      message: 'Track and field athletics event registrations are now open for Grades 6 through 12. Submit team entries to PE coordinator.',
      category: 'Academic Notice',
      channel: 'In-App Portal',
      audience: 'All Students & Parents',
      priority: 'Normal',
      date: 'Nov 05, 2026',
      deliveredCount: '2,490 / 2,500',
      status: 'Delivered 99.6%',
    },
  ]);

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      toast.error('Please enter both title and message for the broadcast.');
      return;
    }

    const newBroadcast = {
      id: `BC-2026-${Date.now().toString().slice(-3)}`,
      title: broadcastTitle.trim(),
      message: broadcastMessage.trim(),
      category: broadcastCategory,
      channel: broadcastChannel === 'whatsapp' ? 'WhatsApp Broadcast' : broadcastChannel === 'sms' ? 'SMS Gateway' : broadcastChannel === 'emergency' ? 'Emergency Siren + SMS' : 'In-App Alert',
      audience: broadcastAudience,
      priority: broadcastPriority,
      date: 'Just now',
      deliveredCount: '150 / 150',
      status: 'Delivered 100%',
    };

    setBroadcastsList([newBroadcast, ...broadcastsList]);
    setBroadcastTitle('');
    setBroadcastMessage('');
    toast.success(`Broadcast '${newBroadcast.title}' dispatched to ${broadcastAudience} via ${newBroadcast.channel}!`);
  };

  // =========================================================================
  // 2. INVENTORY & PURCHASES MODULE STATE
  // =========================================================================
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState<string>('All');
  const [showPOModal, setShowPOModal] = useState(false);
  const [newPOForm, setNewPOForm] = useState({
    itemName: '',
    category: 'Science & Lab Supplies',
    quantity: 10,
    unitPrice: 500,
    vendor: 'Supreme Educational Supplies',
  });

  const [inventoryItems, setInventoryItems] = useState([
    { sku: 'SKU-UNIF-01', name: 'Standard School Uniform Blazer (Navy)', category: 'Uniforms & Kits', stock: 840, threshold: 200, unitCost: 1200, vendor: 'Raymond Apparel Ltd', status: 'In Stock' },
    { sku: 'SKU-UNIF-02', name: 'Sports Track Suit & T-Shirt Set', category: 'Uniforms & Kits', stock: 450, threshold: 150, unitCost: 850, vendor: 'Raymond Apparel Ltd', status: 'In Stock' },
    { sku: 'SKU-BOOK-10', name: 'CBSE Class 10 NCERT Math & Science Bundle', category: 'Textbooks & Guides', stock: 1200, threshold: 300, unitCost: 650, vendor: 'National Book Trust', status: 'In Stock' },
    { sku: 'SKU-BOOK-12', name: 'Senior Secondary Entrance Exam Question Bank', category: 'Textbooks & Guides', stock: 85, threshold: 100, unitCost: 450, vendor: 'Arihant Publishers', status: 'Low Stock' },
    { sku: 'SKU-CHEM-04', name: 'Chemistry Laboratory Borosilicate Flasks & Pipettes', category: 'Science & Lab Supplies', stock: 140, threshold: 50, unitCost: 280, vendor: 'Borosil Scientific', status: 'In Stock' },
    { sku: 'SKU-PHYS-02', name: 'Optics Convex Lens & Optical Bench Kit', category: 'Science & Lab Supplies', stock: 24, threshold: 30, unitCost: 1450, vendor: 'VWR Educational India', status: 'Low Stock' },
    { sku: 'SKU-IT-08', name: 'Interactive Smart Board Stylus Pens (Active)', category: 'IT & Electronics', stock: 45, threshold: 15, unitCost: 1800, vendor: 'BenQ Technologies', status: 'In Stock' },
    { sku: 'SKU-IT-12', name: 'RFID Smart Student ID Cards (NFC 13.56MHz)', category: 'IT & Electronics', stock: 600, threshold: 250, unitCost: 45, vendor: 'CardTech Systems', status: 'In Stock' },
    { sku: 'SKU-SPRT-01', name: 'Tournament Basketball & Volleyball Match Balls', category: 'Sports & Fitness', stock: 18, threshold: 20, unitCost: 950, vendor: 'Cosco Sports Goods', status: 'Low Stock' },
    { sku: 'SKU-STAT-03', name: 'Term Examination Answer Booklet (32 Pages)', category: 'Textbooks & Guides', stock: 4800, threshold: 1000, unitCost: 12, vendor: 'Apex Security Printers', status: 'In Stock' },
  ]);

  const handleRestockItem = (sku: string) => {
    setInventoryItems((prev) =>
      prev.map((item) =>
        item.sku === sku
          ? { ...item, stock: item.stock + 50, status: 'In Stock' }
          : item
      )
    );
    toast.success(`Restocked 50 units for item ${sku}.`);
  };

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPOForm.itemName.trim()) {
      toast.error('Item name is required.');
      return;
    }
    const newSku = `SKU-REQ-${Date.now().toString().slice(-4)}`;
    setInventoryItems([
      {
        sku: newSku,
        name: newPOForm.itemName,
        category: newPOForm.category,
        stock: Number(newPOForm.quantity),
        threshold: 20,
        unitCost: Number(newPOForm.unitPrice),
        vendor: newPOForm.vendor,
        status: 'In Stock',
      },
      ...inventoryItems,
    ]);
    setShowPOModal(false);
    toast.success(`Purchase Requisition raised for ${newPOForm.itemName} (${newPOForm.quantity} units).`);
  };

  // =========================================================================
  // 3. HOMEWORK & CIRCULARS MODULE STATE
  // =========================================================================
  const [homeworkTab, setHomeworkTab] = useState<'homework' | 'circulars'>('homework');
  const [homeworkClassFilter, setHomeworkClassFilter] = useState<string>('All');
  const [showHomeworkModal, setShowHomeworkModal] = useState(false);
  const [newHomeworkForm, setNewHomeworkForm] = useState({
    title: '',
    subject: 'Mathematics',
    classSection: '10-A',
    teacher: 'Suresh Kumar',
    dueDate: '2026-11-12',
    description: '',
  });

  const [homeworkList, setHomeworkList] = useState([
    {
      id: 'HW-101',
      subject: 'Mathematics',
      title: 'Chapter 4: Quadratic Equations & Roots Analysis',
      classSection: '10-A',
      teacher: 'Suresh Kumar',
      dueDate: 'Tomorrow by 08:30 AM',
      submittedCount: 48,
      totalCount: 50,
      status: 'Active',
      description: 'Solve textbook exercises 4.2 and 4.3. Graph the parabolas for problem 5 on square-grid paper.',
    },
    {
      id: 'HW-102',
      subject: 'General Science',
      title: 'Chemical Reactions & Equations Balancing Sheet',
      classSection: '10-B',
      teacher: 'Anita Rao',
      dueDate: 'Thursday by 09:00 AM',
      submittedCount: 44,
      totalCount: 50,
      status: 'Active',
      description: 'Complete 25 redox reaction balancings and note observations for exothermic synthesis experiment.',
    },
    {
      id: 'HW-103',
      subject: 'English Literature',
      title: 'Essay: The Theme of Resilience in "First Flight"',
      classSection: '10-C',
      teacher: 'Sarah Jenkins',
      dueDate: 'Friday by 04:00 PM',
      submittedCount: 41,
      totalCount: 50,
      status: 'Active',
      description: 'Write a 350-word critical evaluation of the protagonist journey with quotes from chapters 2 & 3.',
    },
    {
      id: 'HW-104',
      subject: 'Social Studies',
      title: 'Map Plotting: Major Soil Formations in Southern India',
      classSection: '10-A',
      teacher: 'Rajesh Varma',
      dueDate: 'Saturday 08:30 AM',
      submittedCount: 50,
      totalCount: 50,
      status: 'Completed',
      description: 'Plot Black soil, Red soil, and Laterite zones on outline map of India with legend index.',
    },
    {
      id: 'HW-105',
      subject: 'Computer Science',
      title: 'Python Lab: Binary Search Algorithm & Recursion',
      classSection: '10-B',
      teacher: 'Kavita Menon',
      dueDate: 'Monday 09:00 AM',
      submittedCount: 39,
      totalCount: 50,
      status: 'Active',
      description: 'Implement binary search function in Python with recursion limit verification and time complexity comment.',
    },
  ]);

  const [circularsList] = useState([
    {
      id: 'CIR-2026-088',
      title: 'Term 2 Board Preliminary Examinations Schedule & Hall Tickets',
      authority: 'Correspondent & Principal Office',
      date: 'Nov 08, 2026',
      target: 'Class 10 & 12 Students / Parents',
      category: 'Academic & Board Exams',
      pdfSize: '1.2 MB',
    },
    {
      id: 'CIR-2026-087',
      title: 'Annual Science & Robotics Exhibition: Entry Guidelines',
      authority: 'Department of STEM & Innovation',
      date: 'Nov 06, 2026',
      target: 'All Classes (Grades 6 to 12)',
      category: 'Campus Co-Curricular',
      pdfSize: '840 KB',
    },
    {
      id: 'CIR-2026-086',
      title: 'Winter Uniform Mandatory Transition from November 15',
      authority: 'Administrative Wing & Campus Discipline',
      date: 'Nov 03, 2026',
      target: 'All Students & Parents',
      category: 'Institutional Policy',
      pdfSize: '420 KB',
    },
    {
      id: 'CIR-2026-085',
      title: 'Parent-Teacher Meeting (PTM) for Term 1 Marks Review',
      authority: 'Academic Council & Wing Leads',
      date: 'Oct 28, 2026',
      target: 'Class 10-A, 10-B, 10-C Guardians',
      category: 'PTM & Student Performance',
      pdfSize: '650 KB',
    },
  ]);

  const handlePublishHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHomeworkForm.title.trim() || !newHomeworkForm.description.trim()) {
      toast.error('Homework title and description are required.');
      return;
    }
    const newHw = {
      id: `HW-${Date.now().toString().slice(-3)}`,
      subject: newHomeworkForm.subject,
      title: newHomeworkForm.title.trim(),
      classSection: newHomeworkForm.classSection,
      teacher: newHomeworkForm.teacher,
      dueDate: newHomeworkForm.dueDate,
      submittedCount: 0,
      totalCount: 50,
      status: 'Active',
      description: newHomeworkForm.description.trim(),
    };
    setHomeworkList([newHw, ...homeworkList]);
    setShowHomeworkModal(false);
    toast.success(`Homework published for Class ${newHomeworkForm.classSection}!`);
  };

  // =========================================================================
  // 4. BILLINGS & INVOICES (OFFICE DESK)
  // =========================================================================
  const [billingList] = useState([
    { invoiceNo: 'INV-2026-0412', studentName: 'M. Mohan', admNo: 'EGS20260001', classSection: '10-A', category: 'Term 2 Academic Tuition & Lab', amount: 25000, mode: 'UPI (GPay)', status: 'Paid & Cleared', date: 'Today, 11:20 AM' },
    { invoiceNo: 'INV-2026-0413', studentName: 'A. Bhuvana', admNo: 'EGS20260002', classSection: '10-A', category: 'Term 2 Tuition & Transport Route #4', amount: 32500, mode: 'NetBanking (HDFC)', status: 'Paid & Cleared', date: 'Today, 10:45 AM' },
    { invoiceNo: 'INV-2026-0414', studentName: 'S. Hari', admNo: 'EGS20260003', classSection: '10-A', category: 'Term 2 Tuition Installment', amount: 25000, mode: 'Counter Cash Voucher', status: 'Paid & Cleared', date: 'Today, 09:30 AM' },
    { invoiceNo: 'INV-2026-0415', studentName: 'M. Ranjith', admNo: 'EGS20260004', classSection: '10-A', category: 'Term 2 Tuition & Smart Lab Pass', amount: 27500, mode: 'Cheque (#401928)', status: 'Cheque in Clearance', date: 'Yesterday' },
    { invoiceNo: 'INV-2026-0416', studentName: 'R. Hari', admNo: 'EGS20260005', classSection: '10-A', category: 'Term 2 Academic Tuition', amount: 25000, mode: 'UPI (PhonePe)', status: 'Paid & Cleared', date: 'Yesterday' },
  ]);

  // =========================================================================
  // 5. SCHOLARSHIPS & CONCESSIONS (OFFICE DESK & CORRESPONDENT)
  // =========================================================================
  const [scholarshipsList] = useState([
    { id: 'SCH-01', studentName: 'M. Mohan', classSection: '10-A', scheme: "Chairman's 100% Board Merit Waiver", percentage: '100%', amount: '₹50,000 / Year', sanctionedBy: 'Correspondent Office', status: 'Active & Verified' },
    { id: 'SCH-02', studentName: 'A. Bhuvana', classSection: '10-A', scheme: 'Sports Excellence State Player Concession', percentage: '50%', amount: '₹25,000 / Year', sanctionedBy: 'Sports Council & Staff Desk', status: 'Active & Verified' },
    { id: 'SCH-03', studentName: 'S. Hari', classSection: '10-A', scheme: 'Sibling Tuition Discount Scheme', percentage: '25%', amount: '₹12,500 / Year', sanctionedBy: 'Office Administration Desk', status: 'Active & Verified' },
    { id: 'SCH-04', studentName: 'M. Ishwarya', classSection: '10-A', scheme: 'Special Academic Merit Scholarship', percentage: '50%', amount: '₹25,000 / Year', sanctionedBy: 'Correspondent Office', status: 'Active & Verified' },
    { id: 'SCH-05', studentName: 'E. Deepika', classSection: '10-A', scheme: 'Need-Based Financial Assistance Grant', percentage: '40%', amount: '₹20,000 / Year', sanctionedBy: 'Trustee Board', status: 'Active & Verified' },
  ]);

  // =========================================================================
  // 6. APPROVALS STATE
  // =========================================================================
  const [approvalsList, setApprovalsList] = useState([
    { id: 'APP-101', type: 'Faculty Medical Leave', requester: 'Suresh Kumar (Math Lead)', date: 'Today, 09:30 AM', reason: 'Medical emergency leave for 2 days', amount: '-', status: 'Pending' },
    { id: 'APP-102', type: 'Merit Fee Concession', requester: 'M. Mohan (Grade 10-A)', date: 'Yesterday', reason: 'Chairman 100% merit waiver certification', amount: '₹50,000', status: 'Pending' },
    { id: 'APP-103', type: 'Transfer Certificate (TC)', requester: 'K. Divya (Grade 10-A)', date: 'Nov 08, 2026', reason: 'Guardian job relocation to Chennai', amount: '-', status: 'Pending' },
    { id: 'APP-104', type: 'Science Lab Glassware Requisition', requester: 'Science Department Lead', date: 'Nov 07, 2026', reason: 'Chemistry laboratory renewal of apparatus', amount: '₹14,500', status: 'Pending' },
    { id: 'APP-105', type: 'Sports Tournament Travel Sanction', requester: 'Physical Education Director', date: 'Nov 06, 2026', reason: 'State Inter-School Athletics Championship bus fare', amount: '₹18,200', status: 'Pending' },
  ]);

  const handleApprovalAction = (id: string, action: 'Approve' | 'Reject') => {
    setApprovalsList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: action === 'Approve' ? 'Approved' : 'Rejected' } : item
      )
    );
    toast.success(`Request ${id} has been marked as ${action}d.`);
  };

  // =========================================================================
  // 7. PARENTS MODULE STATE
  // =========================================================================
  const [parentSearch, setParentSearch] = useState('');

  // =========================================================================
  // 8. ROLES & USERS STATE
  // =========================================================================
  const [managedUsers] = useState([
    { id: 'usr-1', username: 'adrin', fullName: 'Adrin (Correspondent)', assignedRole: 'Super Admin', portalScope: 'Full Institutional Governance', status: 'Active', email: 'correspondent@evergrow.edu' },
    { id: 'usr-2', username: 'staff', fullName: 'Campus Office Staff Desk', assignedRole: 'Vice Admin', portalScope: 'Office Desk & Student Records', status: 'Active', email: 'office.desk@evergrow.edu' },
    { id: 'usr-3', username: 'principal', fullName: 'Dr. Arthur Vance', assignedRole: 'Principal', portalScope: 'Academic Council & Appraisals', status: 'Active', email: 'principal@evergrow.edu' },
    { id: 'usr-4', username: 'coordinator1', fullName: 'Dr. Elena Rostova', assignedRole: 'Coordinator', portalScope: 'Grades 10–12 Senior Secondary', status: 'Active', email: 'coordinator@evergrow.edu' },
    { id: 'usr-5', username: 'staff3', fullName: 'Suresh Kumar', assignedRole: 'Teacher', portalScope: 'Mathematics Lead Faculty', status: 'Active', email: 'suresh.math@evergrow.edu' },
    { id: 'usr-6', username: 'parent1', fullName: 'Rajesh Sharma', assignedRole: 'Parent', portalScope: 'Guardian Portal (M. Mohan)', status: 'Active', email: 'rajesh.sharma@gmail.com' },
    { id: 'usr-7', username: 'student1', fullName: 'M. Mohan', assignedRole: 'Student', portalScope: 'Grade 10-A Student Portal', status: 'Active', email: 'mohan.10a@evergrow.edu' },
  ]);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-7xl mx-auto">
      {/* ─────────────────────────────────────────────────────────────
          1. NOTIFICATIONS & ALERTS MODULE
          ───────────────────────────────────────────────────────────── */}
      {moduleKey === 'notifications' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/25 shrink-0">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Broadcast Alerts & Campus Notifications</h1>
                <p className="text-xs text-slate-500">Dispatch instant SMS circulars, WhatsApp broadcasts, and emergency notifications to parents & faculty</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                SMS & WhatsApp Gateway Active
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] border border-white/60">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Total Broadcasts</div>
              <div className="text-2xl font-black text-slate-800 mt-1">52 Alerts</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Across Academic Year 2026-27</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] border border-white/60">
              <div className="text-[11px] font-bold text-slate-400 uppercase">SMS Delivery Success</div>
              <div className="text-2xl font-black text-blue-600 mt-1">99.4%</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">4,120 Messages Delivered</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] border border-white/60">
              <div className="text-[11px] font-bold text-slate-400 uppercase">WhatsApp Read Rate</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">94.8%</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Verified Parent Handsets</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] border border-white/60">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Emergency Siren</div>
              <div className="text-2xl font-black text-slate-800 mt-1">Standby</div>
              <div className="text-[11px] text-slate-400 font-semibold mt-0.5">Zero Active Disasters</div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-300/60 pb-3">
              <div className="flex items-center space-x-2">
                <Send className="w-4 h-4 text-orange-500" />
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">Compose New Institutional Broadcast</h2>
              </div>
              <span className="text-xs text-slate-500">Authorized: Correspondent & Admin Office</span>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Dispatch Channel</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'whatsapp', label: 'WhatsApp' },
                      { id: 'sms', label: 'SMS Gateway' },
                      { id: 'portal', label: 'In-App Portal' },
                      { id: 'emergency', label: '🚨 Emergency' },
                    ].map((ch) => (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => setBroadcastChannel(ch.id as any)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                          broadcastChannel === ch.id
                            ? 'bg-[#0071E3] text-white shadow-xs'
                            : 'bg-white/80 text-slate-600 hover:bg-white'
                        }`}
                      >
                        {ch.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Audience</label>
                  <select
                    value={broadcastAudience}
                    onChange={(e) => setBroadcastAudience(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="All Parents">All Parents & Guardians (1,840)</option>
                    <option value="Class 10 Parents">Class 10 Parents (150 Guardians across 10-A, 10-B, 10-C)</option>
                    <option value="Class 10-A Parents">Class 10-A Parents (50 Guardians)</option>
                    <option value="Teaching Faculty">Teaching Faculty (60 Staff)</option>
                    <option value="Transport Riders">Transport Bus Fleet Riders (340 Students)</option>
                    <option value="Board of Trustees">Board of Trustees & Leadership</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Priority & Category</label>
                  <div className="flex space-x-2">
                    <select
                      value={broadcastCategory}
                      onChange={(e) => setBroadcastCategory(e.target.value)}
                      className="w-1/2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 outline-none"
                    >
                      <option value="Academic Notice">Academic Notice</option>
                      <option value="Weather & Transport">Weather & Bus Alert</option>
                      <option value="Fee Alert">Fee Reminder</option>
                      <option value="Event Notice">PTM / Sports Circular</option>
                      <option value="Emergency Notice">Emergency Alert</option>
                    </select>

                    <select
                      value={broadcastPriority}
                      onChange={(e) => setBroadcastPriority(e.target.value as any)}
                      className="w-1/2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 outline-none"
                    >
                      <option value="Normal">Normal</option>
                      <option value="High">High Priority</option>
                      <option value="Urgent">🚨 Urgent</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Broadcast Headline / Subject (e.g. Term 2 Board Practical Dates Released)..."
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  rows={2}
                  placeholder="Enter full broadcast text to be sent via SMS/WhatsApp..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0071E3] hover:bg-blue-600 text-white text-xs font-bold flex items-center space-x-2 shadow-md shadow-blue-500/25 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                  <span>Send Broadcast Now</span>
                </button>
              </div>
            </form>
          </div>

          <div className="p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">Broadcast Dispatch History</h2>
              <span className="text-xs font-bold text-slate-500">{broadcastsList.length} Total Dispatches</span>
            </div>

            <div className="divide-y divide-slate-200/60">
              {broadcastsList.map((bc) => (
                <div key={bc.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black text-slate-800">{bc.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        bc.priority === 'Urgent'
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : bc.priority === 'High'
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {bc.priority}
                      </span>
                      <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                        {bc.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1">{bc.message}</p>
                    <div className="text-[11px] text-slate-400 flex items-center space-x-2">
                      <span>Channel: <strong className="text-slate-600">{bc.channel}</strong></span>
                      <span>•</span>
                      <span>Audience: <strong className="text-slate-600">{bc.audience}</strong></span>
                      <span>•</span>
                      <span>{bc.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 shrink-0">
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                      ✓ {bc.status}
                    </span>
                    <button
                      onClick={() => toast.success(`Resending broadcast '${bc.title}' to ${bc.audience}...`)}
                      className="px-3 py-1.5 rounded-xl bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold border border-slate-200 shadow-xs cursor-pointer"
                    >
                      Resend
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. INVENTORY & PURCHASES MODULE
          ───────────────────────────────────────────────────────────── */}
      {moduleKey === 'inventory' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 shrink-0">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Inventory, Procurement & Asset Management</h1>
                <p className="text-xs text-slate-500">Institutional stores: Uniform kits, CBSE textbooks, science laboratories, smart classroom technology, and sports assets</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowPOModal(true)}
                className="px-4 py-2.5 rounded-xl bg-[#0071E3] hover:bg-blue-600 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-blue-500/25 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Raise Purchase Requisition</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] border border-white/60">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Total Inventory Valuation</div>
              <div className="text-2xl font-black text-slate-800 mt-1">₹18,45,000</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Audited for FY 2026-27</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] border border-white/60">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Active Purchase Orders</div>
              <div className="text-2xl font-black text-blue-600 mt-1">14 POs Active</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Supply pipeline on schedule</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] border border-white/60">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Critical Low Stock Alerts</div>
              <div className="text-2xl font-black text-amber-600 mt-1">3 Items</div>
              <div className="text-[11px] text-amber-700 font-semibold mt-0.5">Below safe reorder buffer</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] border border-white/60">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Approved Campus Vendors</div>
              <div className="text-2xl font-black text-slate-800 mt-1">12 Suppliers</div>
              <div className="text-[11px] text-slate-400 font-semibold mt-0.5">Annual rate contracts locked</div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-1.5 p-1 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] w-fit">
                {['All', 'Uniforms & Kits', 'Textbooks & Guides', 'Science & Lab Supplies', 'IT & Electronics', 'Sports & Fitness'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setInventoryCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      inventoryCategoryFilter === cat
                        ? 'bg-[#0071E3] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs bg-white">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">SKU Code</th>
                    <th className="py-3 px-4">Asset / Item Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-center">Stock Level</th>
                    <th className="py-3 px-4 text-right">Unit Price</th>
                    <th className="py-3 px-4">Authorized Vendor</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {inventoryItems
                    .filter((item) => inventoryCategoryFilter === 'All' || item.category === inventoryCategoryFilter)
                    .map((item) => (
                      <tr key={item.sku} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">{item.sku}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{item.name}</td>
                        <td className="py-3 px-4 text-slate-600">{item.category}</td>
                        <td className="py-3 px-4 text-center font-bold text-slate-800">
                          {item.stock} Units
                          <div className="text-[10px] text-slate-400 font-normal">Reorder at {item.threshold}</div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">₹{item.unitCost.toLocaleString()}</td>
                        <td className="py-3 px-4 text-slate-600">{item.vendor}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'In Stock'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleRestockItem(item.sku)}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 cursor-pointer"
                          >
                            + Restock (50)
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {showPOModal && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-bold text-slate-900 text-sm">Raise Purchase Order / Requisition</h3>
                  <button onClick={() => setShowPOModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleCreatePO} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Item Description</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Physics Optical Prism Sets (Batch of 20)"
                      value={newPOForm.itemName}
                      onChange={(e) => setNewPOForm({ ...newPOForm, itemName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                      <select
                        value={newPOForm.category}
                        onChange={(e) => setNewPOForm({ ...newPOForm, category: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold outline-none"
                      >
                        <option value="Science & Lab Supplies">Science & Lab Supplies</option>
                        <option value="Uniforms & Kits">Uniforms & Kits</option>
                        <option value="Textbooks & Guides">Textbooks & Guides</option>
                        <option value="IT & Electronics">IT & Electronics</option>
                        <option value="Sports & Fitness">Sports & Fitness</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={newPOForm.quantity}
                        onChange={(e) => setNewPOForm({ ...newPOForm, quantity: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Unit Price (₹)</label>
                      <input
                        type="number"
                        min="1"
                        value={newPOForm.unitPrice}
                        onChange={(e) => setNewPOForm({ ...newPOForm, unitPrice: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Authorized Vendor</label>
                      <input
                        type="text"
                        value={newPOForm.vendor}
                        onChange={(e) => setNewPOForm({ ...newPOForm, vendor: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-3 border-t">
                    <button
                      type="button"
                      onClick={() => setShowPOModal(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#0071E3] hover:bg-blue-600 text-white text-xs font-bold"
                    >
                      Submit Requisition
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. HOMEWORK & CIRCULARS MODULE
          ───────────────────────────────────────────────────────────── */}
      {moduleKey === 'homework' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Homework Assignments & Institutional Circulars</h1>
                <p className="text-xs text-slate-500">Curriculum problem sets, chapter assignments, and official school circulars released by Correspondent & Principal</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowHomeworkModal(true)}
                className="px-4 py-2.5 rounded-xl bg-[#0071E3] hover:bg-blue-600 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-blue-500/25 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Publish New Assignment</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] border border-white/60">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Active Homework Tasks</div>
              <div className="text-2xl font-black text-slate-800 mt-1">38 Tasks</div>
              <div className="text-[11px] text-blue-600 font-semibold mt-0.5">Across Grades 10-A, 10-B, 10-C</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] border border-white/60">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Official Circulars</div>
              <div className="text-2xl font-black text-purple-600 mt-1">14 Circulars</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Signed by Correspondent</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] border border-white/60">
              <div className="text-[11px] font-bold text-slate-400 uppercase">On-Time Submission Rate</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">94.8%</div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">Verified homework compliance</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] border border-white/60">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Term Syllabus Covered</div>
              <div className="text-2xl font-black text-slate-800 mt-1">82.5%</div>
              <div className="text-[11px] text-slate-400 font-semibold mt-0.5">On track for board prelims</div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setHomeworkTab('homework')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    homeworkTab === 'homework'
                      ? 'bg-[#0071E3] text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Class Homework & Tasks ({homeworkList.length})
                </button>
                <button
                  onClick={() => setHomeworkTab('circulars')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    homeworkTab === 'circulars'
                      ? 'bg-[#0071E3] text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Official Institutional Circulars ({circularsList.length})
                </button>
              </div>

              {homeworkTab === 'homework' && (
                <div className="flex items-center space-x-1.5 p-1 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] w-fit">
                  {['All', '10-A', '10-B', '10-C'].map((cls) => (
                    <button
                      key={cls}
                      onClick={() => setHomeworkClassFilter(cls)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold ${
                        homeworkClassFilter === cls ? 'bg-[#0071E3] text-white shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      {cls === 'All' ? 'All Classes' : `Class ${cls}`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {homeworkTab === 'homework' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {homeworkList
                  .filter((hw) => homeworkClassFilter === 'All' || hw.classSection === homeworkClassFilter)
                  .map((hw) => (
                    <div
                      key={hw.id}
                      className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {hw.subject} • Class {hw.classSection}
                        </span>
                        <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          Due: {hw.dueDate}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{hw.title}</h3>
                        <p className="text-xs text-slate-600 mt-1">{hw.description}</p>
                      </div>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500">Mentor: <strong className="text-slate-700">{hw.teacher}</strong></span>
                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                            {hw.submittedCount} / {hw.totalCount} Submitted
                          </span>
                          <button
                            onClick={() => toast.success(`Downloaded worksheet PDF for ${hw.title}`)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                            title="Download Worksheet"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {homeworkTab === 'circulars' && (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs bg-white">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Circular Ref</th>
                      <th className="py-3 px-4">Title & Subject</th>
                      <th className="py-3 px-4">Issued Authority</th>
                      <th className="py-3 px-4">Target Audience</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Issue Date</th>
                      <th className="py-3 px-4 text-right">Official Document</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {circularsList.map((cir) => (
                      <tr key={cir.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">{cir.id}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{cir.title}</td>
                        <td className="py-3 px-4 text-slate-700 font-semibold">{cir.authority}</td>
                        <td className="py-3 px-4 text-slate-600">{cir.target}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            {cir.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{cir.date}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => toast.success(`Downloading signed official circular: ${cir.id}.pdf`)}
                            className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 inline-flex items-center space-x-1 cursor-pointer"
                          >
                            <Download className="w-3 h-3" />
                            <span>PDF ({cir.pdfSize})</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {showHomeworkModal && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-bold text-slate-900 text-sm">Publish Homework Assignment</h3>
                  <button onClick={() => setShowHomeworkModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handlePublishHomework} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Assignment Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chapter 5 Arithmetic Progressions Exercise"
                      value={newHomeworkForm.title}
                      onChange={(e) => setNewHomeworkForm({ ...newHomeworkForm, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                      <select
                        value={newHomeworkForm.subject}
                        onChange={(e) => setNewHomeworkForm({ ...newHomeworkForm, subject: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold outline-none"
                      >
                        <option value="Mathematics">Mathematics</option>
                        <option value="General Science">General Science</option>
                        <option value="English Literature">English Literature</option>
                        <option value="Social Studies">Social Studies</option>
                        <option value="Computer Science">Computer Science</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Class Section</label>
                      <select
                        value={newHomeworkForm.classSection}
                        onChange={(e) => setNewHomeworkForm({ ...newHomeworkForm, classSection: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold outline-none"
                      >
                        <option value="10-A">Class 10-A (50 Students)</option>
                        <option value="10-B">Class 10-B (50 Students)</option>
                        <option value="10-C">Class 10-C (50 Students)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Instructions / Exercises</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Instructions, questions to solve, or textbook page numbers..."
                      value={newHomeworkForm.description}
                      onChange={(e) => setNewHomeworkForm({ ...newHomeworkForm, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                    ></textarea>
                  </div>
                  <div className="flex justify-end space-x-2 pt-3 border-t">
                    <button
                      type="button"
                      onClick={() => setShowHomeworkModal(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#0071E3] hover:bg-blue-600 text-white text-xs font-bold"
                    >
                      Publish Homework
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. BILLINGS & INVOICES (OFFICE DESK)
          ───────────────────────────────────────────────────────────── */}
      {moduleKey === 'billing' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 shrink-0">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Counter Billings, Invoices & Fee Collection</h1>
                <p className="text-xs text-slate-500">School accounts desk: Term tuition billing, electronic bank receipts, cash vouchers, and GST clearance statements</p>
              </div>
            </div>
            <button
              onClick={() => toast.success('Printing Day Book Counter Ledger for today...')}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#0071E3]" />
              <span>Print Counter Day Book</span>
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] border border-white/60">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Today Counter Collection</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">₹2,45,000</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">8 Invoices cleared today</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] border border-white/60">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Online & UPI Gateway</div>
              <div className="text-2xl font-black text-blue-600 mt-1">72.4%</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Instant bank credit</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] border border-white/60">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Cash & Cheques Collected</div>
              <div className="text-2xl font-black text-purple-600 mt-1">₹68,500</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Deposited to Treasury Vault</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] border border-white/60">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Class 10 Clearance</div>
              <div className="text-2xl font-black text-slate-800 mt-1">146 / 150</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">97.3% Fee clearance rate</div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-4">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">Recent Counter Invoices & Clearance Receipts</h2>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs bg-white">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Invoice Number</th>
                    <th className="py-3 px-4">Student & Admission</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Fee Breakdown</th>
                    <th className="py-3 px-4 text-right">Total Paid</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Receipt Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {billingList.map((inv) => (
                    <tr key={inv.invoiceNo} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">{inv.invoiceNo}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{inv.studentName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{inv.admNo}</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-700">{inv.classSection}</td>
                      <td className="py-3 px-4 text-slate-600">{inv.category}</td>
                      <td className="py-3 px-4 text-right font-mono font-black text-slate-900">₹{inv.amount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-slate-700 font-semibold">{inv.mode}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => toast.success(`Generated official fee receipt for ${inv.studentName} (${inv.invoiceNo})`)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 inline-flex items-center space-x-1 cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. SCHOLARSHIPS & WAIVERS (OFFICE DESK & CORRESPONDENT)
          ───────────────────────────────────────────────────────────── */}
      {moduleKey === 'scholarships' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 text-white flex items-center justify-center shadow-md shadow-amber-500/25 shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Institutional Scholarships & Merit Waivers</h1>
                <p className="text-xs text-slate-500">Board merit scholarships, state sports concessions, sibling waivers, and need-based financial aid sanctioned by Correspondent</p>
              </div>
            </div>
            <button
              onClick={() => toast.success('Scholarship application desk open for Academic Year 2026-27.')}
              className="px-4 py-2.5 rounded-xl bg-[#0071E3] hover:bg-blue-600 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-blue-500/25 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Sanction New Scholarship</span>
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] border border-white/60">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Total Sanctioned Grants</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">₹6,40,000</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Annual scholarship budget</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] border border-white/60">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Student Beneficiaries</div>
              <div className="text-2xl font-black text-blue-600 mt-1">24 Scholars</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Across Grades 10 to 12</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] border border-white/60">
              <div className="text-[11px] font-bold text-slate-400 uppercase">100% Full Waivers</div>
              <div className="text-2xl font-black text-purple-600 mt-1">6 Students</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">95%+ Board scorers</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] border border-white/60">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Sports Concessions</div>
              <div className="text-2xl font-black text-amber-600 mt-1">8 Athletes</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">State medalists</div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-4">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">Registered Scholarship Scholars & Grant Approvals</h2>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs bg-white">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Scholarship ID</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Concession Scheme</th>
                    <th className="py-3 px-4 text-center">Waiver %</th>
                    <th className="py-3 px-4 text-right">Annual Value</th>
                    <th className="py-3 px-4">Sanctioned By</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Certificate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {scholarshipsList.map((sch) => (
                    <tr key={sch.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-amber-600">{sch.id}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{sch.studentName}</td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{sch.classSection}</td>
                      <td className="py-3 px-4 text-slate-800 font-bold">{sch.scheme}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">
                          {sch.percentage}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-emerald-700">{sch.amount}</td>
                      <td className="py-3 px-4 text-slate-600">{sch.sanctionedBy}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {sch.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => toast.success(`Viewing official scholarship award letter for ${sch.studentName}`)}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 cursor-pointer"
                        >
                          Certificate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. APPROVALS DESK
          ───────────────────────────────────────────────────────────── */}
      {moduleKey === 'approvals' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
                <CheckSquare className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Executive Approvals & Sanctions Desk</h1>
                <p className="text-xs text-slate-500">Official sign-off workflow: Staff leaves, fee concessions, department purchase vouchers, and Transfer Certificates</p>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full border border-blue-200">
              {approvalsList.filter((a) => a.status === 'Pending').length} Pending Decision
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF]">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Pending Requests</div>
              <div className="text-2xl font-black text-amber-600 mt-1">{approvalsList.filter((a) => a.status === 'Pending').length} Action Items</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF]">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Approved This Month</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">42 Sanctioned</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF]">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Total Value Cleared</div>
              <div className="text-2xl font-black text-slate-800 mt-1">₹1,84,500</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF]">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Average Clearance</div>
              <div className="text-2xl font-black text-blue-600 mt-1">4.2 Hours</div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-4">
            <div className="divide-y divide-slate-200">
              {approvalsList.map((appr) => (
                <div key={appr.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-blue-600">{appr.id}</span>
                      <span className="text-xs font-black text-slate-900">{appr.type}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        appr.status === 'Pending' ? 'bg-amber-100 text-amber-800' : appr.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {appr.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium">{appr.reason}</p>
                    <div className="text-[11px] text-slate-400 flex items-center space-x-2">
                      <span>Requester: <strong className="text-slate-600">{appr.requester}</strong></span>
                      <span>•</span>
                      <span>Amount: <strong className="text-slate-600">{appr.amount}</strong></span>
                      <span>•</span>
                      <span>{appr.date}</span>
                    </div>
                  </div>
                  {appr.status === 'Pending' && (
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleApprovalAction(appr.id, 'Approve')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleApprovalAction(appr.id, 'Reject')}
                        className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 text-xs font-bold border border-rose-200 transition-all cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          7. PARENTS DIRECTORY (FOR STAFF DESK)
          ───────────────────────────────────────────────────────────── */}
      {moduleKey === 'parents' && (() => {
        const studentMap = (schoolData.students || []).reduce((acc: any, std: any) => {
          acc[std.student_id] = std;
          return acc;
        }, {});

        const allParents = (schoolData.parents || []).map((p: any) => {
          const linkedStudents = (p.student_ids || []).map((sId: string) => {
            const s = studentMap[sId];
            return s ? `${s.name} (${s.class_section})` : sId;
          });
          return {
            id: p.parent_id,
            name: p.name,
            phone: p.phone,
            email: p.email,
            occupation: p.occupation,
            relationship: p.relationship,
            childrenCount: linkedStudents.length,
            children: linkedStudents.join(', ') || 'Class 10 Student',
          };
        });

        const filteredParents = allParents.filter((p: any) =>
          p.name.toLowerCase().includes(parentSearch.toLowerCase()) ||
          p.phone.includes(parentSearch) ||
          p.children.toLowerCase().includes(parentSearch.toLowerCase())
        );

        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 shrink-0">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-800 tracking-tight">Parent Accounts & Student Guardians Roster</h1>
                  <p className="text-xs text-slate-500">Verified guardian profiles, emergency contact records, linked wards, and direct SMS dialer</p>
                </div>
              </div>
              <div className="text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                {allParents.length} Registered Guardians
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-4">
              <input
                type="text"
                placeholder="Search guardian by name, phone, or child's name..."
                value={parentSearch}
                onChange={(e) => setParentSearch(e.target.value)}
                className="w-full sm:w-80 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold outline-none"
              />

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs bg-white">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Guardian Name</th>
                      <th className="py-3 px-4">Relation</th>
                      <th className="py-3 px-4">Enrolled Child (Wards)</th>
                      <th className="py-3 px-4">Phone Number</th>
                      <th className="py-3 px-4">Occupation</th>
                      <th className="py-3 px-4 text-right">Quick Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredParents.slice(0, 20).map((p: any) => (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">{p.name}</td>
                        <td className="py-3 px-4 text-slate-600">{p.relationship}</td>
                        <td className="py-3 px-4 font-semibold text-blue-700">{p.children}</td>
                        <td className="py-3 px-4 font-mono text-slate-700">{p.phone}</td>
                        <td className="py-3 px-4 text-slate-600">{p.occupation}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => toast.success(`Calling guardian ${p.name} at ${p.phone}...`)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 inline-flex items-center space-x-1 cursor-pointer"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Call / SMS</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ─────────────────────────────────────────────────────────────
          8. LIBRARY MODULE
          ───────────────────────────────────────────────────────────── */}
      {moduleKey === 'library' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-600 text-white flex items-center justify-center shadow-md shadow-teal-500/25 shrink-0">
                <Library className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Campus Library & Digital Learning Repository</h1>
                <p className="text-xs text-slate-500">12,450+ titles: NCERT textbooks, reference literature, scientific periodicals, and electronic eBooks</p>
              </div>
            </div>
            <button
              onClick={() => toast.success('Book checkout terminal ready for barcode scanning.')}
              className="px-4 py-2.5 rounded-xl bg-[#0071E3] hover:bg-blue-600 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-blue-500/25 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Issue Book (Barcode)</span>
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF]">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Total Catalog Titles</div>
              <div className="text-2xl font-black text-slate-800 mt-1">12,450 Books</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF]">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Currently Borrowed</div>
              <div className="text-2xl font-black text-blue-600 mt-1">342 Issued</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF]">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Digital eBooks</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">1,800 ePubs</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF]">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Overdue Returns</div>
              <div className="text-2xl font-black text-rose-600 mt-1">18 Reminders</div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          9. PAYROLL MODULE
          ───────────────────────────────────────────────────────────── */}
      {moduleKey === 'payroll' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 shrink-0">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Faculty Payroll & Compensation Disbursement</h1>
                <p className="text-xs text-slate-500">Monthly salary processing, PF contributions, professional tax deductions, and bank transfer batches</p>
              </div>
            </div>
            <button
              onClick={() => toast.success('Disbursing monthly NEFT payroll batch to 80 institutional accounts...')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-500/25 cursor-pointer"
            >
              <DollarSign className="w-4 h-4 text-white" />
              <span>Authorize Monthly Payroll (₹38.5L)</span>
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF]">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Monthly Salary Outflow</div>
              <div className="text-2xl font-black text-slate-800 mt-1">₹38,50,000</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF]">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Teaching Faculty</div>
              <div className="text-2xl font-black text-blue-600 mt-1">60 Professors</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF]">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Administrative Staff</div>
              <div className="text-2xl font-black text-purple-600 mt-1">20 Workforce</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF]">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Statutory Deductions</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">₹4,20,000</div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          10. EVENTS & CAMPUS CALENDAR
          ───────────────────────────────────────────────────────────── */}
      {moduleKey === 'events' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white flex items-center justify-center shadow-md shadow-pink-500/25 shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Institutional Events & Academic Calendar</h1>
                <p className="text-xs text-slate-500">Board exams, annual sports meet, science olympiad, parent conferences, and term holidays</p>
              </div>
            </div>
            <button
              onClick={() => toast.success('Event scheduler dialog opened.')}
              className="px-4 py-2.5 rounded-xl bg-[#0071E3] hover:bg-blue-600 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Schedule Campus Event</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Annual Athletics Meet & March Past', date: 'November 22, 2026', time: '08:00 AM - 04:00 PM', venue: 'Main Sports Stadium', incharge: 'PE Department Lead' },
              { title: 'Class 10 Board Prelim 1 (Science)', date: 'December 02, 2026', time: '09:30 AM - 12:30 PM', venue: 'Academic Examination Halls', incharge: 'Dr. Arthur Vance' },
              { title: 'Grand Winter Cultural Fest & Carnival', date: 'December 18, 2026', time: '10:00 AM - 06:00 PM', venue: 'Open Air Auditorium', incharge: 'Coordinators Council' },
            ].map((evt, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full w-fit">{evt.date}</div>
                <h3 className="font-bold text-slate-900 text-sm">{evt.title}</h3>
                <div className="text-xs text-slate-500 space-y-1 pt-1 border-t">
                  <div>Timing: <strong className="text-slate-700">{evt.time}</strong></div>
                  <div>Venue: <strong className="text-slate-700">{evt.venue}</strong></div>
                  <div>Incharge: <strong className="text-slate-700">{evt.incharge}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          11. VISITORS & GATE PASS
          ───────────────────────────────────────────────────────────── */}
      {moduleKey === 'visitors' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center shadow-md shrink-0">
                <ShieldAlert className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Visitors & Campus Gate Pass Security Desk</h1>
                <p className="text-xs text-slate-500">Real-time gate check-ins, parent visitor badges, vendor supply permits, and vehicle security logs</p>
              </div>
            </div>
            <button
              onClick={() => toast.success('Issuing new visitor digital gate badge...')}
              className="px-4 py-2.5 rounded-xl bg-[#0071E3] hover:bg-blue-600 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Issue Gate Pass</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF]">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Active Visitors on Campus</div>
              <div className="text-2xl font-black text-blue-600 mt-1">4 Visitors</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF]">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Today Total Check-ins</div>
              <div className="text-2xl font-black text-slate-800 mt-1">28 Visitors</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF]">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Vehicles Parked</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">16 Vehicles</div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          12. HELPDESK & COMPLAINTS
          ───────────────────────────────────────────────────────────── */}
      {moduleKey === 'helpdesk' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-rose-500/25 shrink-0">
                <LifeBuoy className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Helpdesk, Grievances & Parent Support</h1>
                <p className="text-xs text-slate-500">Service desk tickets: Transport queries, student portal logins, fee adjustments, and campus maintenance</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-200">
              98% Resolution SLA Met
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF]">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Open Grievance Tickets</div>
              <div className="text-2xl font-black text-amber-600 mt-1">5 Open</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF]">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Resolved This Month</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">48 Resolved</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF]">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Avg Response Time</div>
              <div className="text-2xl font-black text-blue-600 mt-1">1.2 Days</div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          13. ANALYTICS MODULE
          ───────────────────────────────────────────────────────────── */}
      {moduleKey === 'analytics' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Executive Analytics & Institutional Intelligence</h1>
                <p className="text-xs text-slate-500">Board pass rate projections, student retention curves, fee collection velocity, and academic risk alerts</p>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1.5 rounded-full border border-blue-200">
              Live BI Engine Connected
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF]">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Projected Board Pass Rate</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">100%</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF]">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Student Retention</div>
              <div className="text-2xl font-black text-blue-600 mt-1">98.6%</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF]">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Term Fee Collection Speed</div>
              <div className="text-2xl font-black text-purple-600 mt-1">97.3%</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF]">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Academic Risk Prediction</div>
              <div className="text-2xl font-black text-slate-800 mt-1">Low (3 Flags)</div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          14. ROLES & USERS MODULE
          ───────────────────────────────────────────────────────────── */}
      {moduleKey === 'roles-users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white flex items-center justify-center shadow-md shadow-blue-600/25 shrink-0">
                <UserCog className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Roles, Permissions & User Access Management</h1>
                <p className="text-xs text-slate-500">Multi-portal RBAC governance: Super Admin (Correspondent), Staff Office Desk, Principal, Faculty, Guardians & Students</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
              {managedUsers.length} Active System Accounts
            </span>
          </div>

          <div className="p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-4">
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs bg-white">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Assigned Role</th>
                    <th className="py-3 px-4">Portal Scope</th>
                    <th className="py-3 px-4">Account Email</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {managedUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{u.fullName}</div>
                        <div className="font-mono text-[10px] text-slate-400">@{u.username}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                          {u.assignedRole}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{u.portalScope}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{u.email}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {u.status}
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

      {/* ─────────────────────────────────────────────────────────────
          15. INTEGRATIONS & SETTINGS MODULES
          ───────────────────────────────────────────────────────────── */}
      {(moduleKey === 'integrations' || moduleKey === 'settings') && (
        <div className="p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
              <Workflow className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800">
                {moduleKey === 'integrations' ? 'API Gateways & Integrations' : 'Institutional Preferences'}
              </h2>
              <p className="text-xs text-slate-500">Connected campus telemetry, WhatsApp Business API, and automated daily backups</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-white border border-slate-200">
              <div className="font-bold text-slate-900">WhatsApp Business Cloud API</div>
              <div className="text-emerald-600 font-semibold mt-1">● Connected (Verified Sender)</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200">
              <div className="font-bold text-slate-900">GPS Fleet Telemetry Server</div>
              <div className="text-emerald-600 font-semibold mt-1">● 24 Buses Streaming Live</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleHubPage;
