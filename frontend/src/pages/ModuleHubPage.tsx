import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
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
  ShieldCheck,
  CheckCircle2,
  Database,
  Key,
  RefreshCw,
  CreditCard,
  Activity,
  Layers,
  Clock,
  Lock,
  Server,
  Globe,
  Building,
  Save,
  SlidersHorizontal,
  LayoutGrid,
  ToggleLeft,
  ToggleRight,
  GraduationCap,
  Bus,
  Trophy,
  BookOpen,
  Compass,
  ChevronRight,
  Eye,
  Shield,
  Users,
  ArrowRight,
  Sliders,
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
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [assignRoleModalUser, setAssignRoleModalUser] = useState<any | null>(null);
  const [assignedRoleChoice, setAssignedRoleChoice] = useState<string>('Teacher');
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [newUserForm, setNewUserForm] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    role: 'Teacher',
  });

  const [managedUsers, setManagedUsers] = useState([
    { id: 'usr-1', username: 'adrin', fullName: 'Adrin (Super Admin)', assignedRole: 'Super Admin', category: 'admin', portalScope: 'Full Institutional Governance', status: 'Active', email: 'correspondent@evergrow.edu', phone: '+91 98450 11001', lastLogin: '10 mins ago', permissions: ['Full Access', 'Financial Sanctions', 'System Customization', 'Affiliation Governance'] },
    { id: 'usr-vice', username: 'viceadmin', fullName: 'Dr. Marcus Vance (Vice Admin)', assignedRole: 'Vice Admin', category: 'admin', portalScope: 'Operational Administration & Campus Supervision', status: 'Active', email: 'viceadmin@evergrow.edu', phone: '+91 98450 11015', lastLogin: '15 mins ago', permissions: ['Staff Oversight', 'Timetable Management', 'Student Discipline', 'Administrative Governance'] },
    { id: 'usr-2', username: 'principal', fullName: 'Dr. Arthur Vance', assignedRole: 'Super Admin', category: 'admin', portalScope: 'Academic Council & Faculty Appraisals', status: 'Active', email: 'principal@evergrow.edu', phone: '+91 98450 11002', lastLogin: '25 mins ago', permissions: ['Academic Governance', 'Faculty Reviews', 'Exam Approvals', 'Disciplinary Oversight'] },
    { id: 'usr-3', username: 'staff', fullName: 'Elena Rostova (Office Desk)', assignedRole: 'Vice Admin', category: 'admin', portalScope: 'Office Desk, Admissions & Counter Operations', status: 'Active', email: 'office.desk@evergrow.edu', phone: '+91 98450 11003', lastLogin: 'Just now', permissions: ['150 Student Directory', 'Fee Collection & Dues', 'Gate Pass Checkpoints', 'Bonafide Issuance'] },
    { id: 'usr-4', username: 'coordinator1', fullName: 'Dr. Elena Rostova', assignedRole: 'Coordinator', category: 'coordinator', portalScope: 'Grades 10–12 Senior Secondary Wing', status: 'Active', email: 'coordinator@evergrow.edu', phone: '+91 98450 11004', lastLogin: '1 hour ago', permissions: ['Senior Syllabus Governance', 'Term 1/2 Exam Moderation', 'Grading Scheme Review'] },
    { id: 'usr-5', username: 'coordinator2', fullName: 'Prof. Ramesh Joshi', assignedRole: 'Coordinator', category: 'coordinator', portalScope: 'Grades 6–9 Middle School Wing', status: 'Active', email: 'coordinator.middle@evergrow.edu', phone: '+91 98450 11005', lastLogin: '3 hours ago', permissions: ['Middle School Curriculum', 'Unit Tests Scheduling', 'Remedial Programs'] },
    { id: 'usr-6', username: 'coordinator3', fullName: 'Mrs. Anita Deshmukh', assignedRole: 'Coordinator', category: 'coordinator', portalScope: 'Grades 1–5 Primary Wing', status: 'Active', email: 'coordinator.primary@evergrow.edu', phone: '+91 98450 11006', lastLogin: 'Yesterday', permissions: ['Primary Competency Framework', 'Early Childhood Assessment', 'Activity Timetables'] },
    { id: 'usr-7', username: 'teacher1', fullName: 'Michael Chang', assignedRole: 'Teacher', category: 'faculty', portalScope: 'Grade 10-A Mentor & CS Faculty', status: 'Active', email: 'michael.chang@evergrow.edu', phone: '+91 98450 11007', lastLogin: '5 mins ago', permissions: ['Class 10-A Roll-Call', 'Python & CS Marks Entry', 'Homework Dissemination', 'Parent SMS Alerts'] },
    { id: 'usr-8', username: 'teacher2', fullName: 'Mrs. Radhika Green', assignedRole: 'Teacher', category: 'faculty', portalScope: 'English Literature Lead Faculty', status: 'Active', email: 'radhika.green@evergrow.edu', phone: '+91 98450 11008', lastLogin: '45 mins ago', permissions: ['English Subject Grading', 'Drama & Debate Mentorship', 'Classroom Attendance'] },
    { id: 'usr-9', username: 'teacher3', fullName: 'Dr. S. Nair', assignedRole: 'Teacher', category: 'faculty', portalScope: 'Chemistry & Science Block Lead', status: 'Active', email: 's.nair@evergrow.edu', phone: '+91 98450 11009', lastLogin: '2 hours ago', permissions: ['Science Lab Safety', 'Titration Practicals Scoring', 'CBSE External Vivas'] },
    { id: 'usr-10', username: 'teacher4', fullName: 'Coach David', assignedRole: 'Teacher', category: 'faculty', portalScope: 'Athletics & Sports Director', status: 'Active', email: 'coach.david@evergrow.edu', phone: '+91 98450 11010', lastLogin: '4 hours ago', permissions: ['Sports Attendance', 'Inter-School Meet Rosters', 'Physical Fitness Records'] },
    { id: 'usr-11', username: 'accountant1', fullName: 'Ramesh Sundaram', assignedRole: 'Vice Admin', category: 'admin', portalScope: 'Treasury Reserves & Faculty Payroll', status: 'Active', email: 'accounts@evergrow.edu', phone: '+91 98450 11011', lastLogin: '30 mins ago', permissions: ['Payroll Disbursement (₹38.5L)', 'Bank Transfer Batches', 'Tax/PF Remittance Ledger'] },
    { id: 'usr-12', username: 'parent1', fullName: 'Rajesh Sharma', assignedRole: 'Parent', category: 'parent', portalScope: 'Guardian of Liam Smith (Grade 10-A)', status: 'Active', email: 'rajesh.sharma@gmail.com', phone: '+91 94431 87238', lastLogin: 'Today', permissions: ['Report Card Viewing', 'Tuition Fee Payment Gateway', 'Bus #04 GPS Radar', 'Leave Requests'] },
    { id: 'usr-13', username: 'parent2', fullName: 'Sunita Patel', assignedRole: 'Parent', category: 'parent', portalScope: 'Guardian of Aarav Patel (Grade 10-A)', status: 'Active', email: 'sunita.patel@outlook.com', phone: '+91 98224 45910', lastLogin: 'Yesterday', permissions: ['Fee Receipts Download', 'Attendance History', 'Teacher Meeting Booking'] },
    { id: 'usr-14', username: 'student1', fullName: 'Liam Smith', assignedRole: 'Student', category: 'student', portalScope: 'Grade 10-A • Roll 01 (Student Desk)', status: 'Active', email: 'liam.smith@evergrow.edu', phone: '+91 94431 87239', lastLogin: 'Active Now', permissions: ['Timetable Routine', 'Homework Submissions', 'Gamified Rewards & 1,450 XP', 'Library Catalog'] },
    { id: 'usr-15', username: 'student2', fullName: 'Aarav Patel', assignedRole: 'Student', category: 'student', portalScope: 'Grade 10-A • Roll 02 (Student Desk)', status: 'Active', email: 'aarav.patel@evergrow.edu', phone: '+91 98224 45911', lastLogin: '3 hours ago', permissions: ['Daily Lecture Routine', 'Term 1 Gradebook', 'Online Learning Modules'] },
    { id: 'usr-16', username: 'student3', fullName: 'Ananya Seth', assignedRole: 'Student', category: 'student', portalScope: 'Grade 10-A • Roll 03 (Student Desk)', status: 'Active', email: 'ananya.seth@evergrow.edu', phone: '+91 98110 33499', lastLogin: '1 hour ago', permissions: ['Daily Lecture Routine', 'Term 1 Gradebook', 'Olympiad Study Materials'] },
  ]);

  const handleApplyRoleAssignment = (userId: string, newRole: string) => {
    setManagedUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          let cat = 'faculty';
          let scope = u.portalScope;
          let perms = u.permissions;
          if (newRole === 'Super Admin') {
            cat = 'admin';
            scope = 'Full Institutional Governance & System Settings';
            perms = ['Full Access', 'Financial Sanctions', 'System Customization', 'Affiliation Governance'];
          } else if (newRole === 'Vice Admin') {
            cat = 'admin';
            scope = 'Operational Administration & Campus Supervision';
            perms = ['Staff Oversight', 'Timetable Management', 'Student Discipline', 'Administrative Governance'];
          } else if (newRole === 'Coordinator') {
            cat = 'coordinator';
            scope = 'Academic Wing Oversight & Syllabus Review';
            perms = ['Syllabus Governance', 'Exam Moderation', 'Grading Scheme Review'];
          } else if (newRole === 'Teacher') {
            cat = 'faculty';
            scope = 'Subject Faculty & Classroom Mentorship';
            perms = ['Attendance Roll-Call', 'Marks & Exam Entry', 'Homework Dissemination', 'Parent Alerts'];
          } else if (newRole === 'Parent') {
            cat = 'parent';
            scope = 'Guardian Portal & Scholar Oversight';
            perms = ['Report Card Viewing', 'Tuition Fee Payment', 'Bus GPS Radar', 'Leave Requests'];
          } else if (newRole === 'Student') {
            cat = 'student';
            scope = 'Student Desk & Academic Routine';
            perms = ['Timetable Routine', 'Homework Submissions', 'Gamified Rewards', 'Library Catalog'];
          }
          return {
            ...u,
            assignedRole: newRole,
            category: cat,
            portalScope: scope,
            permissions: perms,
          };
        }
        return u;
      })
    );
    toast.success(`Role Assigned: User successfully updated to ${newRole}`);
    setAssignRoleModalUser(null);
  };

  const handleCreateNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.fullName.trim() || !newUserForm.username.trim()) {
      toast.error('Please enter both Full Name and Username.');
      return;
    }
    const newId = `usr-${Date.now()}`;
    let cat = 'faculty';
    let scope = 'General Portal Access';
    let perms = ['Standard School Access'];
    if (newUserForm.role === 'Super Admin') {
      cat = 'admin';
      scope = 'Full Institutional Governance & System Settings';
      perms = ['Full Access', 'Financial Sanctions', 'System Customization', 'Affiliation Governance'];
    } else if (newUserForm.role === 'Vice Admin') {
      cat = 'admin';
      scope = 'Operational Administration & Campus Supervision';
      perms = ['Staff Oversight', 'Timetable Management', 'Student Discipline', 'Administrative Governance'];
    } else if (newUserForm.role === 'Coordinator') {
      cat = 'coordinator';
      scope = 'Academic Wing Oversight & Syllabus Review';
      perms = ['Syllabus Governance', 'Exam Moderation', 'Grading Scheme Review'];
    } else if (newUserForm.role === 'Teacher') {
      cat = 'faculty';
      scope = 'Subject Faculty & Classroom Mentorship';
      perms = ['Attendance Roll-Call', 'Marks & Exam Entry', 'Homework Dissemination', 'Parent Alerts'];
    } else if (newUserForm.role === 'Parent') {
      cat = 'parent';
      scope = 'Guardian Portal & Scholar Oversight';
      perms = ['Report Card Viewing', 'Tuition Fee Payment', 'Bus GPS Radar', 'Leave Requests'];
    } else if (newUserForm.role === 'Student') {
      cat = 'student';
      scope = 'Student Desk & Academic Routine';
      perms = ['Timetable Routine', 'Homework Submissions', 'Gamified Rewards', 'Library Catalog'];
    }

    const newUser = {
      id: newId,
      username: newUserForm.username.toLowerCase().trim(),
      fullName: newUserForm.fullName.trim(),
      assignedRole: newUserForm.role,
      category: cat,
      portalScope: scope,
      status: 'Active',
      email: newUserForm.email.trim() || `${newUserForm.username.toLowerCase()}@evergrow.edu`,
      phone: newUserForm.phone.trim() || '+91 98450 00000',
      lastLogin: 'Never (New)',
      permissions: perms,
    };

    setManagedUsers((prev) => [newUser, ...prev]);
    toast.success(`User Account Created: @${newUser.username} assigned as ${newUser.assignedRole}`);
    setShowAddUserModal(false);
    setNewUserForm({
      fullName: '',
      username: '',
      email: '',
      phone: '',
      role: 'Teacher',
    });
  };

  // =========================================================================
  // 9. INSTITUTIONAL SETTINGS & ERP MODULES CUSTOMIZER STATE
  // =========================================================================
  const [settingsActiveTab, setSettingsActiveTab] = useState<'modules' | 'affiliation' | 'academic' | 'timings' | 'security'>('modules');
  const [settingsModuleSearch, setSettingsModuleSearch] = useState('');
  const [settingsModuleCategory, setSettingsModuleCategory] = useState('all');

  const [erpModules, setErpModules] = useState<{ [key: string]: { enabled: boolean; title: string; category: string; description: string; usage: string; route: string; icon: any } }>({
    admissions: { enabled: true, title: 'Admissions & Inquiries', category: 'Admissions', description: 'Student online application processing, applicant verification, and entrance token management.', usage: 'Used by Office Desk staff to admit new scholars, review parent documents, and generate official Student IDs.', route: '/admissions', icon: UserPlus },
    fees: { enabled: true, title: 'Fees, Billing & Counter Receipts', category: 'Finance', description: 'Real-time cash/UPI/card fee payments, customizable tuition fee structures, and printable GST receipts.', usage: 'Used by Office Desk and Treasury to collect fees, print immediate receipts, and grant sibling/merit fee waivers.', route: '/fees', icon: CreditCard },
    examinations: { enabled: true, title: 'Examinations & CBSE Report Cards', category: 'Academics', description: 'Term 1 & Term 2 exam sessions, teacher marks spreadsheet entry, and automated report card generation.', usage: 'Used by Subject Teachers to evaluate scores and Academic Coordinators to publish audited CBSE report cards.', route: '/examinations', icon: GraduationCap },
    attendance: { enabled: true, title: 'Attendance & Biometric Roll-Call', category: 'Daily Operations', description: 'Daily period-by-period roll-call registers with instant automated SMS notifications to parents of absentees.', usage: 'Used by Class Teachers for morning roll-call and Office Desk to enforce the mandatory 75% CBSE exam rule.', route: '/attendance', icon: Calendar },
    rewards: { enabled: true, title: 'Campus Rewards & Gamified Honors', category: 'Student Motivation', description: '18-day streak counters, scholar XP points (1,450 XP), tier badges, and digital honors (Student exclusive).', usage: 'Used exclusively by Students for motivation; teachers award badges for academic excellence and perfect attendance.', route: '/rewards', icon: Trophy },
    transport: { enabled: true, title: 'Transport Fleet & Bus GPS Radar', category: 'Safety & Logistics', description: 'Real-time satellite GPS tracking of 12 campus buses, geofenced bus stops, and driver compliance monitoring.', usage: 'Used by Parents to monitor their child\'s live bus route and by Office Staff to manage fleet speed and maintenance.', route: '/transport', icon: Bus },
    visitors: { enabled: true, title: 'Campus Gate Passes & Visitors', category: 'Campus Security', description: 'Live RFID check-in badges for visiting parents, supply vendor gate passes, and vehicle parking security logs.', usage: 'Used by Campus Security to log all campus visitors, verify parent identity, and issue authorized visitor badges.', route: '/visitors', icon: ShieldCheck },
    tuitions: { enabled: true, title: 'Partner Tuitions & Academies', category: 'Academics', description: 'Curated directory of verified after-school coaching institutions, subject batches, and academic inquiries.', usage: 'Used by Parents and Students to find accredited tutoring centers for Olympiad and Board examination prep.', route: '/tuitions', icon: BookOpen },
    library: { enabled: true, title: 'Library & Digital Catalog', category: 'Resources', description: 'Barcode book circulation management for 12,450+ physical volumes and 1,800+ downloadable digital ePubs.', usage: 'Used by Students and Faculty to search catalog, borrow books, read ePubs, and track return deadlines.', route: '/library', icon: Library },
    socialWall: { enabled: true, title: 'Campus Social Wall & Circulars', category: 'Community', description: 'Official campus noticeboard for sports highlights, event photos, and urgent administrative circulars.', usage: 'Used by leadership to broadcast announcements and circulars.', route: '/social', icon: Trophy },
    payroll: { enabled: true, title: 'Faculty Payroll & Compensation', category: 'Finance', description: 'Monthly salary disbursement processing for 60 professors and 20 staff, PF deductions, and bank transfer batches.', usage: 'Used by the Correspondent and Treasury to authorize the ₹38,50,000 monthly payroll and generate salary slips.', route: '/payroll', icon: Receipt },
    career: { enabled: true, title: 'AI Career Guidance & RIASEC Test', category: 'Student Counseling', description: 'Psychometric career mapping, college degree eligibility analyzer, and competitive entrance exam roadmaps.', usage: 'Used by Senior Secondary Students (Grades 10–12) to discover personalized career roadmaps and university paths.', route: '/career', icon: Compass },
  });

  const toggleModuleStatus = (key: string) => {
    setErpModules((prev) => {
      const current = prev[key];
      const updated = !current.enabled;
      toast.success(`${current.title} is now ${updated ? 'Enabled & Active' : 'Disabled / Hidden in Navigation'}.`);
      return {
        ...prev,
        [key]: { ...current, enabled: updated },
      };
    });
  };

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
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Broadcast Alerts & Notifications</h1>
                <p className="text-xs text-slate-500">Instant SMS, WhatsApp broadcasts, and emergency notifications</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                SMS & WhatsApp Gateway Active
              </span>
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
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Inventory & Asset Management</h1>
                <p className="text-xs text-slate-500">Uniforms, textbooks, lab equipment, and school assets</p>
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
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Homework & Circulars</h1>
                <p className="text-xs text-slate-500">Homework assignments, syllabus problem sets, and school circulars</p>
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
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Counter Billings & Fee Receipts</h1>
                <p className="text-xs text-slate-500">Tuition billing, electronic bank receipts, and cash vouchers</p>
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
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Scholarships & Merit Waivers</h1>
                <p className="text-xs text-slate-500">Board merit scholarships, sports concessions, and fee waivers</p>
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
                <p className="text-xs text-slate-500">Staff leaves, fee concessions, purchase vouchers, and Transfer Certificates</p>
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
                  <h1 className="text-xl font-black text-slate-800 tracking-tight">Parent Accounts & Guardians</h1>
                  <p className="text-xs text-slate-500">Guardian profiles, contact records, and linked students</p>
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
          8. LIBRARY MODULE (COMPREHENSIVELY ENRICHED)
          ───────────────────────────────────────────────────────────── */}
      {moduleKey === 'library' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-600 text-white flex items-center justify-center shadow-md shadow-teal-500/25 shrink-0">
                <Library className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Library & Learning Repository</h1>
                <p className="text-xs text-slate-500">12,450+ physical volumes, reference literature, and eBooks</p>
              </div>
            </div>
            <button
              onClick={() => toast.success('Book checkout terminal ready. Scan student RFID card or barcode to issue book.')}
              className="px-4 py-2.5 rounded-xl bg-[#0071E3] hover:bg-blue-600 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-blue-500/25 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Issue Book (Barcode)</span>
            </button>
          </div>

          {/* 4 Stat Cards */}
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

          {/* Books Catalog & Circulation Ledger */}
          <div className="p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-black text-slate-800">Circulation Catalog & Master Inventory</h2>
                <p className="text-xs text-slate-500">Live shelf availability and accession numbers across campus library racks</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                  Racks A-1 to Z-12 Active
                </span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs bg-white">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Title & Author</th>
                    <th className="py-3 px-4">ISBN / Accession</th>
                    <th className="py-3 px-4">Category & Rack</th>
                    <th className="py-3 px-4 text-center">Copies (Avail/Total)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {[
                    { title: 'NCERT Mathematics Class 10 Comprehensive', author: 'NCERT Board Editorial', isbn: 'ISBN 978-81-7450-716-1', cat: 'CBSE Curriculum', rack: 'Rack M-04', avail: 45, total: 50, status: 'Available' },
                    { title: 'Concepts of Physics (Vol 1 & 2)', author: 'Dr. H.C. Verma', isbn: 'ISBN 978-81-7709-187-8', cat: 'Pure Sciences (Physics)', rack: 'Rack P-12', avail: 28, total: 35, status: 'Available' },
                    { title: 'Fundamentals of Organic Chemistry', author: 'Morrison & Boyd', isbn: 'ISBN 978-01-3017-852-7', cat: 'Pure Sciences (Chemistry)', rack: 'Rack C-08', avail: 18, total: 20, status: 'Available' },
                    { title: 'Introduction to Algorithms (4th Edition)', author: 'Cormen, Leiserson, Rivest', isbn: 'ISBN 978-02-6204-630-5', cat: 'Computer Science', rack: 'Rack CS-02', avail: 12, total: 15, status: 'Available' },
                    { title: 'The Complete Works of William Shakespeare', author: 'Oxford World Classics', isbn: 'ISBN 978-01-9926-717-0', cat: 'English Literature', rack: 'Rack L-01', avail: 8, total: 10, status: 'Available' },
                    { title: 'Indian Polity for Competitive Examinations', author: 'M. Laxmikanth', isbn: 'ISBN 978-93-5260-363-2', cat: 'General Studies', rack: 'Rack GS-05', avail: 22, total: 25, status: 'Available' },
                    { title: 'English Grammar in Use & Composition', author: 'Raymond Murphy', isbn: 'ISBN 978-11-0845-765-1', cat: 'Language Arts', rack: 'Rack E-03', avail: 34, total: 40, status: 'Available' },
                  ].map((bk, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{bk.title}</div>
                        <div className="text-[11px] text-slate-500">By {bk.author}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">{bk.isbn}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-700 block">{bk.cat}</span>
                        <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md font-mono">{bk.rack}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800">
                        <span className="text-teal-700">{bk.avail}</span> / {bk.total}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {bk.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => toast.success(`Reserved copy of "${bk.title}" for borrower checkout.`)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#0071E3] hover:text-white text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                        >
                          Checkout
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Student Book Loans */}
          <div className="p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-black text-slate-800">Active Student Book Loans & Due Tracker</h2>
                <p className="text-xs text-slate-500">Circulation ledger monitoring return dates and statutory library dues</p>
              </div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                5 Active Loans Shown
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs bg-white">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Borrower Student</th>
                    <th className="py-3 px-4">Book Title Borrowed</th>
                    <th className="py-3 px-4">Issue Date</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4 text-center">Return Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {[
                    { student: 'M. Mohan (Class 10-A)', adm: 'EGS20260001', book: 'Concepts of Physics (Vol 1)', issued: '2026-11-01', due: '2026-11-15', status: 'On Schedule', statusColor: 'bg-emerald-100 text-emerald-800' },
                    { student: 'A. Bhuvana (Class 10-A)', adm: 'EGS20260002', book: 'NCERT Mathematics Class 10', issued: '2026-11-03', due: '2026-11-17', status: 'On Schedule', statusColor: 'bg-emerald-100 text-emerald-800' },
                    { student: 'K. Vignesh (Class 10-B)', adm: 'EGS20260051', book: 'Introduction to Algorithms', issued: '2026-10-25', due: '2026-11-08', status: 'Due in 2 Days', statusColor: 'bg-amber-100 text-amber-800' },
                    { student: 'S. Sneha (Class 10-C)', adm: 'EGS20260101', book: 'William Shakespeare Selected Plays', issued: '2026-11-02', due: '2026-11-16', status: 'On Schedule', statusColor: 'bg-emerald-100 text-emerald-800' },
                    { student: 'R. Hari (Class 10-A)', adm: 'EGS20260005', book: 'Fundamentals of Organic Chemistry', issued: '2026-10-20', due: '2026-11-03', status: 'Overdue (₹15 Fine)', statusColor: 'bg-rose-100 text-rose-800' },
                  ].map((loan, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{loan.student}</div>
                        <div className="font-mono text-[10px] text-slate-400">{loan.adm}</div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{loan.book}</td>
                      <td className="py-3 px-4 text-slate-500">{loan.issued}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{loan.due}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${loan.statusColor}`}>
                          {loan.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => toast.success(`Book "${loan.book}" checked in and returned to library shelf!`)}
                          className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-600 hover:text-white text-teal-700 text-xs font-semibold transition-all cursor-pointer"
                        >
                          Check-in
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
          9. PAYROLL MODULE (COMPREHENSIVELY ENRICHED)
          ───────────────────────────────────────────────────────────── */}
      {moduleKey === 'payroll' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 shrink-0">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Faculty Payroll & Compensation</h1>
                <p className="text-xs text-slate-500">Monthly salary processing, PF contributions, and bank transfer batches</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => toast.success('Bank NEFT payment batch file (ICICI-CORP-PAYROLL.TXT) generated successfully!')}
                className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-300 shadow-sm cursor-pointer"
              >
                Export NEFT Batch (CSV)
              </button>
              <button
                onClick={() => toast.success('Disbursing monthly NEFT payroll batch to 80 institutional accounts...')}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-500/25 cursor-pointer"
              >
                <DollarSign className="w-4 h-4 text-white" />
                <span>Authorize Monthly Payroll (₹38.5L)</span>
              </button>
            </div>
          </div>

          {/* 4 Stat Cards */}
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

          {/* Faculty & Staff Payroll Ledger */}
          <div className="p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-black text-slate-800">Faculty & Staff Compensation Master Ledger</h2>
                <p className="text-xs text-slate-500">Breakdown of basic salary, HRA allowances, provident fund (PF), and net direct bank disbursal</p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Cycle: October - November 2026
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs bg-white">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Employee ID</th>
                    <th className="py-3 px-4">Faculty Member</th>
                    <th className="py-3 px-4">Department / Designation</th>
                    <th className="py-3 px-4 text-right">Basic Pay</th>
                    <th className="py-3 px-4 text-right">Allowances</th>
                    <th className="py-3 px-4 text-right">Deductions (PF/TDS)</th>
                    <th className="py-3 px-4 text-right">Net Payable</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Payslip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {[
                    { id: 'EMP-FAC-001', name: 'Dr. Arthur Vance', role: 'Senior Secondary Coordinator', dept: 'Senior Wing (Mathematics)', basic: '₹75,000', allow: '₹22,500', ded: '₹10,200', net: '₹87,300', status: 'Disbursed' },
                    { id: 'EMP-FAC-002', name: 'Mrs. Rachel Green', role: 'Middle School Coordinator', dept: 'Middle Wing (English)', basic: '₹68,000', allow: '₹20,400', ded: '₹9,100', net: '₹79,300', status: 'Disbursed' },
                    { id: 'EMP-FAC-003', name: 'Ms. Sarah Jenkins', role: 'Primary Wing Coordinator', dept: 'Primary Wing (Foundations)', basic: '₹62,000', allow: '₹18,600', ded: '₹8,300', net: '₹72,300', status: 'Disbursed' },
                    { id: 'EMP-FAC-004', name: 'Mr. David Joseph', role: 'Senior PGT Computer Science', dept: 'Computer Science & AI', basic: '₹58,000', allow: '₹17,400', ded: '₹7,800', net: '₹67,600', status: 'Disbursed' },
                    { id: 'EMP-FAC-005', name: 'Mrs. Anitha Raman', role: 'TGT General Science (10-A Mentor)', dept: 'Physics & Chemistry', basic: '₹52,000', allow: '₹15,600', ded: '₹7,000', net: '₹60,600', status: 'Disbursed' },
                    { id: 'EMP-STF-001', name: 'Mr. K. Sundaram', role: 'Senior Office Accountant', dept: 'Office Administration', basic: '₹45,000', allow: '₹13,500', ded: '₹6,100', net: '₹52,400', status: 'Disbursed' },
                    { id: 'EMP-STF-002', name: 'Mrs. M. Lakshmi', role: 'Campus Administrative Officer', dept: 'Front Office Desk', basic: '₹42,000', allow: '₹12,600', ded: '₹5,700', net: '₹48,900', status: 'Disbursed' },
                  ].map((emp, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-500">{emp.id}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{emp.name}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{emp.role}</div>
                        <div className="text-[10px] text-slate-500">{emp.dept}</div>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-700">{emp.basic}</td>
                      <td className="py-3 px-4 text-right text-emerald-600">{emp.allow}</td>
                      <td className="py-3 px-4 text-right text-rose-600 font-mono">-{emp.ded}</td>
                      <td className="py-3 px-4 text-right font-black text-slate-900">{emp.net}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {emp.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => toast.success(`Official Payslip generated for ${emp.name} (Ref: PAY/2026/${emp.id}). Downloading PDF...`)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 text-xs font-semibold transition-all cursor-pointer"
                        >
                          Payslip PDF
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
          10. EVENTS & CAMPUS CALENDAR (COMPREHENSIVELY ENRICHED)
          ───────────────────────────────────────────────────────────── */}
      {moduleKey === 'events' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white flex items-center justify-center shadow-md shadow-pink-500/25 shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Events & Academic Calendar</h1>
                <p className="text-xs text-slate-500">Board exams, sports meet, science fair, and term holidays</p>
              </div>
            </div>
            <button
              onClick={() => toast.success('Campus Event scheduler opened. Date registered on institutional calendar.')}
              className="px-4 py-2.5 rounded-xl bg-[#0071E3] hover:bg-blue-600 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-md shadow-blue-500/25"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Schedule Campus Event</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Annual Athletics Meet & March Past', date: 'November 22, 2026', time: '08:00 AM - 04:00 PM', venue: 'Main Sports Stadium', incharge: 'PE Department Lead', badge: 'Sports & Athletics', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
              { title: 'Class 10 Board Prelim 1 (Science)', date: 'December 02, 2026', time: '09:30 AM - 12:30 PM', venue: 'Academic Examination Halls', incharge: 'Dr. Arthur Vance', badge: 'Academic Assessment', color: 'bg-blue-50 text-blue-700 border-blue-200' },
              { title: 'Grand Winter Cultural Fest & Carnival', date: 'December 18, 2026', time: '10:00 AM - 06:00 PM', venue: 'Open Air Auditorium', incharge: 'Coordinators Council', badge: 'Arts & Culture', color: 'bg-purple-50 text-purple-700 border-purple-200' },
            ].map((evt, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${evt.color}`}>{evt.badge}</span>
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full">{evt.date}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm leading-snug">{evt.title}</h3>
                <div className="text-xs text-slate-500 space-y-1 pt-2 border-t border-slate-100">
                  <div>Timing: <strong className="text-slate-700">{evt.time}</strong></div>
                  <div>Venue: <strong className="text-slate-700">{evt.venue}</strong></div>
                  <div>Incharge: <strong className="text-slate-700">{evt.incharge}</strong></div>
                </div>
                <button
                  onClick={() => toast.success(`RSVP confirmed for "${evt.title}". Added to personal calendar.`)}
                  className="w-full mt-2 py-1.5 rounded-xl bg-slate-50 hover:bg-[#0071E3] hover:text-white text-slate-700 text-xs font-semibold transition-all border border-slate-200"
                >
                  Confirm Attendance / RSVP
                </button>
              </div>
            ))}
          </div>

          {/* Full Academic Term Calendar Table */}
          <div className="p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-black text-slate-800">Term Calendar & Upcoming Institutional Dates</h2>
                <p className="text-xs text-slate-500">Official scheduled activities, statutory holidays, and committee meetings</p>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                Term 1 & 2 Schedules
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs bg-white">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Scheduled Date</th>
                    <th className="py-3 px-4">Event / Milestone</th>
                    <th className="py-3 px-4">Target Participants</th>
                    <th className="py-3 px-4">Venue & Timing</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {[
                    { date: 'Nov 14, 2026', event: 'Children’s Day Special Assembly & Science Expo', audience: 'All Grades (1 to 12)', venue: 'Central Courtyard (09:00 AM)', status: 'Confirmed' },
                    { date: 'Nov 22, 2026', event: 'Annual Inter-House Athletics Meet 2026', audience: 'Student Athletes & Parents', venue: 'Main Sports Complex (All Day)', status: 'Confirmed' },
                    { date: 'Nov 28, 2026', event: 'Class 10 Parent-Teacher Evaluation Conference', audience: 'Class 10 Parents & Faculty', venue: 'Academic Classrooms (10:00 AM)', status: 'Confirmed' },
                    { date: 'Dec 02, 2026', event: 'CBSE Secondary Board Preparatory Exam Phase 1', audience: 'Enrolled Class 10 Students', venue: 'Examination Block (09:30 AM)', status: 'Scheduled' },
                    { date: 'Dec 18, 2026', event: 'Ever Grow Winter Carnival & Science Fair', audience: 'All Campus Community', venue: 'Auditorium & Grounds', status: 'Scheduled' },
                    { date: 'Dec 24, 2026', event: 'Winter Vacation Commences (Term Break)', audience: 'Full School Faculty & Students', venue: 'Campus Wide', status: 'Official Holiday' },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">{row.date}</td>
                      <td className="py-3 px-4 font-bold text-blue-700">{row.event}</td>
                      <td className="py-3 px-4 text-slate-600">{row.audience}</td>
                      <td className="py-3 px-4 text-slate-500">{row.venue}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          row.status === 'Official Holiday' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {row.status}
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
          11. VISITORS & GATE PASS (COMPREHENSIVELY ENRICHED)
          ───────────────────────────────────────────────────────────── */}
      {moduleKey === 'visitors' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center shadow-md shrink-0">
                <ShieldAlert className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Visitors & Gate Pass Security</h1>
                <p className="text-xs text-slate-500">Gate check-ins, visitor badges, and security logs</p>
              </div>
            </div>
            <button
              onClick={() => toast.success('New Visitor Gate Pass #GP-2026-089 issued! Badge printed for security checkpoint.')}
              className="px-4 py-2.5 rounded-xl bg-[#0071E3] hover:bg-blue-600 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-md shadow-blue-500/25"
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

          {/* Live Visitor Security Ledger */}
          <div className="p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-black text-slate-800">Campus Entry Checkpoint & Gate Pass Register</h2>
                <p className="text-xs text-slate-500">Live RFID gate passes, visitor identity verification, and vehicle departure logs</p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Gate 1 & Gate 2 Monitored
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs bg-white">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Pass ID</th>
                    <th className="py-3 px-4">Visitor Name & Contact</th>
                    <th className="py-3 px-4">Host / Department Visited</th>
                    <th className="py-3 px-4">Purpose</th>
                    <th className="py-3 px-4 font-mono">Vehicle No</th>
                    <th className="py-3 px-4">Check-in Time</th>
                    <th className="py-3 px-4 text-center">Security Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {[
                    { pass: 'GP-2026-081', name: 'R. Sundararajan (Parent)', phone: '+91 94431 87210', host: 'Accounts Office (Mr. Sundaram)', purpose: 'Term Fee Cash Settlement', veh: 'TN-69-AB-1234', inTime: '09:45 AM', status: 'Active on Campus', statusColor: 'bg-blue-100 text-blue-800' },
                    { pass: 'GP-2026-082', name: 'K. Senthil Kumar (Vendor)', phone: '+91 98422 99887', host: 'Science Lab (Mrs. Anitha)', purpose: 'Chemistry Lab Consumables Delivery', veh: 'TN-69-C-4589', inTime: '10:15 AM', status: 'Active on Campus', statusColor: 'bg-blue-100 text-blue-800' },
                    { pass: 'GP-2026-083', name: 'Dr. V. Meenakshi (Inspector)', phone: '+91 98944 55667', host: 'Principal Desk & Administration', purpose: 'CBSE Affiliation Review', veh: 'KA-01-ME-8890', inTime: '10:30 AM', status: 'Active on Campus', statusColor: 'bg-blue-100 text-blue-800' },
                    { pass: 'GP-2026-084', name: 'T. Murugan (Parent)', phone: '+91 94861 33445', host: 'Class 10-B (Mr. David Joseph)', purpose: 'Student Progress Discussion', veh: 'TN-69-K-7712', inTime: '11:00 AM', status: 'Active on Campus', statusColor: 'bg-blue-100 text-blue-800' },
                    { pass: 'GP-2026-079', name: 'P. Balakrishnan (Courier)', phone: '+91 97900 11223', host: 'Front Office Reception', purpose: 'Board Examination Hall Tickets Postal', veh: 'Pedestrian', inTime: '08:30 AM', status: 'Checked Out 09:10 AM', statusColor: 'bg-slate-100 text-slate-700' },
                  ].map((v, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">{v.pass}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{v.name}</div>
                        <div className="font-mono text-[10px] text-slate-400">{v.phone}</div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{v.host}</td>
                      <td className="py-3 px-4 text-slate-600">{v.purpose}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{v.veh}</td>
                      <td className="py-3 px-4 text-slate-600">{v.inTime}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${v.statusColor}`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {v.status.includes('Active') ? (
                          <button
                            onClick={() => toast.success(`Visitor ${v.name} checkout verified. Gate barrier lifted.`)}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 text-xs font-semibold transition-all cursor-pointer"
                          >
                            Mark Exit
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Archived</span>
                        )}
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
          12. HELPDESK & COMPLAINTS (COMPREHENSIVELY ENRICHED)
          ───────────────────────────────────────────────────────────── */}
      {moduleKey === 'helpdesk' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-rose-500/25 shrink-0">
                <LifeBuoy className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Helpdesk & Grievance Support</h1>
                <p className="text-xs text-slate-500">Service tickets: Transport, login assistance, and facility maintenance</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-200">
                98% Resolution SLA Met
              </span>
              <button
                onClick={() => toast.success('Ticket submission dialog opened. Support specialist notified.')}
                className="px-4 py-2 rounded-xl bg-[#0071E3] hover:bg-blue-600 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-md shadow-blue-500/25"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Create Support Ticket</span>
              </button>
            </div>
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

          {/* Active Helpdesk Tickets Table */}
          <div className="p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-black text-slate-800">Live Support Tickets & Parent Grievances</h2>
                <p className="text-xs text-slate-500">Service desk tickets assigned to departmental coordinators and administrators</p>
              </div>
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                5 Active Enquiries
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs bg-white">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Ticket ID</th>
                    <th className="py-3 px-4">Requester / Student</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Issue Description</th>
                    <th className="py-3 px-4 text-center">Priority</th>
                    <th className="py-3 px-4">Date Logged</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {[
                    { id: 'TKT-2026-401', user: 'Mrs. S. Karpagam (Parent)', child: 'Student: M. Mohan (10-A)', cat: 'Bus Route Change', desc: 'Requesting stop modification to Millerpuram 4th Street for Bus Route #4.', priority: 'Medium', pColor: 'bg-blue-50 text-blue-700 border-blue-200', date: 'Nov 08, 2026', status: 'In Progress', sColor: 'bg-amber-100 text-amber-800' },
                    { id: 'TKT-2026-402', user: 'Mr. P. Raman (Parent)', child: 'Student: A. Bhuvana (10-A)', cat: 'Portal Login Credential', desc: 'Parent mobile app password reset link expired; need OTP re-trigger.', priority: 'High', pColor: 'bg-rose-50 text-rose-700 border-rose-200', date: 'Nov 09, 2026', status: 'Assigned to IT', sColor: 'bg-blue-100 text-blue-800' },
                    { id: 'TKT-2026-403', user: 'Mr. K. Narayanan (Parent)', child: 'Student: K. Vignesh (10-B)', cat: 'Fee Receipt Duplicate', desc: 'Requires digital duplicate of Term 1 tuition receipt for income tax filing.', priority: 'Normal', pColor: 'bg-slate-50 text-slate-700 border-slate-200', date: 'Nov 09, 2026', status: 'Resolved', sColor: 'bg-emerald-100 text-emerald-800' },
                    { id: 'TKT-2026-404', user: 'Mrs. V. Revathi (Faculty)', child: 'Staff Desk', cat: 'Classroom Projector', desc: 'Audio HDMI cable replacement needed in Science Laboratory Smart Classroom 2.', priority: 'High', pColor: 'bg-rose-50 text-rose-700 border-rose-200', date: 'Nov 10, 2026', status: 'Under Maintenance', sColor: 'bg-amber-100 text-amber-800' },
                    { id: 'TKT-2026-405', user: 'Mr. T. Arumugam (Parent)', child: 'Student: S. Sneha (10-C)', cat: 'Scholarship Application', desc: 'Seeking clarification regarding income certificate submission deadline for state scheme.', priority: 'Normal', pColor: 'bg-slate-50 text-slate-700 border-slate-200', date: 'Nov 10, 2026', status: 'In Progress', sColor: 'bg-amber-100 text-amber-800' },
                  ].map((tkt, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-rose-600">{tkt.id}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{tkt.user}</div>
                        <div className="text-[10px] text-slate-500">{tkt.child}</div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{tkt.cat}</td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs">{tkt.desc}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${tkt.pColor}`}>
                          {tkt.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{tkt.date}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${tkt.sColor}`}>
                          {tkt.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => toast.success(`Ticket ${tkt.id} marked as resolved! Notification sent to ${tkt.user}.`)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 text-xs font-semibold transition-all cursor-pointer"
                        >
                          Resolve
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
          13. ANALYTICS MODULE (COMPREHENSIVELY ENRICHED)
          ───────────────────────────────────────────────────────────── */}
      {moduleKey === 'analytics' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Executive Analytics & Intelligence</h1>
                <p className="text-xs text-slate-500">Board pass projections, fee velocity, and performance alerts</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1.5 rounded-full border border-blue-200">
                Live BI Engine Connected
              </span>
              <button
                onClick={() => toast.success('Analytics data refreshed. Synchronized with live database telemetry.')}
                className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 shadow-xs cursor-pointer"
                title="Refresh Analytics"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 4 Primary Top-Level Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF]">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Projected Board Pass Rate</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">100%</div>
              <p className="text-[10px] text-slate-500 mt-0.5">Grade 10 CBSE Benchmark</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF]">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Student Retention</div>
              <div className="text-2xl font-black text-blue-600 mt-1">98.6%</div>
              <p className="text-[10px] text-slate-500 mt-0.5">Annual Re-enrollment Velocity</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF]">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Term Fee Realization</div>
              <div className="text-2xl font-black text-purple-600 mt-1">97.3%</div>
              <p className="text-[10px] text-slate-500 mt-0.5">₹1.72 Cr / ₹1.85 Cr Collected</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF]">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Statutory Attendance Rate</div>
              <div className="text-2xl font-black text-slate-800 mt-1">94.2%</div>
              <p className="text-[10px] text-rose-600 font-semibold mt-0.5">3 At-Risk Flags (&lt;75%)</p>
            </div>
          </div>

          {/* Academic Performance & Subject Benchmarks */}
          <div className="p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-black text-slate-800">Academic Grading Breakdown & Subject Performance</h2>
                <p className="text-xs text-slate-500">Curriculum competency mastery and term evaluation scores across 150 enrolled scholars</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Term 1 Results Published
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Grade Distribution Breakdown */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">Scholastic Grade Distribution</h3>
                <div className="space-y-2.5">
                  {[
                    { grade: 'A+ (Distinction 90–100%)', count: '63 Scholars', pct: 42, color: 'bg-emerald-500' },
                    { grade: 'A (First Class 80–89%)', count: '54 Scholars', pct: 36, color: 'bg-blue-500' },
                    { grade: 'B+ (High Merit 70–79%)', count: '24 Scholars', pct: 16, color: 'bg-indigo-500' },
                    { grade: 'B & Support Needed (60–69%)', count: '9 Scholars', pct: 6, color: 'bg-amber-500' },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-800">{item.grade}</span>
                        <span className="text-slate-600 font-mono">{item.count} ({item.pct}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subject Averages Benchmarks */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">Core Subject Averages</h3>
                <div className="space-y-2.5">
                  {[
                    { subject: 'Computer Science & AI (CS)', avg: 91.2, faculty: 'Adrin / Mr. David Joseph', color: 'bg-blue-600' },
                    { subject: 'English Literature & Language', avg: 88.5, faculty: 'Mrs. Rachel Green', color: 'bg-teal-600' },
                    { subject: 'Mathematics & Calculus', avg: 84.6, faculty: 'Dr. Arthur Vance', color: 'bg-purple-600' },
                    { subject: 'General Science & Physics', avg: 82.8, faculty: 'Mrs. Anitha Raman', color: 'bg-emerald-600' },
                  ].map((sub, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <div>
                          <span className="text-slate-900">{sub.subject}</span>
                          <span className="text-[10px] text-slate-400 block font-normal">{sub.faculty}</span>
                        </div>
                        <span className="text-slate-800 font-black text-sm font-mono">{sub.avg}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-full ${sub.color} rounded-full`} style={{ width: `${sub.avg}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Velocity & Campus Operational Telemetry */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Financial Velocity */}
            <div className="p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-3">
              <h2 className="text-base font-black text-slate-800">Fee Inflow & Realization Velocity</h2>
              <p className="text-xs text-slate-500">Session 2026-2027 annual tuition, laboratory, and bus pass realization</p>
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <div className="text-slate-500 font-medium">Gross Billed</div>
                  <div className="text-base font-black text-slate-900 mt-0.5">₹1,85,00,000</div>
                  <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">150 Scholars Ledger</div>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <div className="text-slate-500 font-medium">Collected to Date</div>
                  <div className="text-base font-black text-emerald-600 mt-0.5">₹1,72,50,000</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">93.2% Realized</div>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <div className="text-slate-500 font-medium">Outstanding Balances</div>
                  <div className="text-base font-black text-amber-600 mt-0.5">₹12,50,000</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Dec Installments Due</div>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <div className="text-slate-500 font-medium">Scholarships Disbursed</div>
                  <div className="text-base font-black text-purple-600 mt-0.5">₹8,40,000</div>
                  <div className="text-[10px] text-purple-600 font-semibold mt-0.5">Merit & RTE Subsidies</div>
                </div>
              </div>
            </div>

            {/* Transport & Safety Telemetry */}
            <div className="p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-3">
              <h2 className="text-base font-black text-slate-800">Transport & Campus Operations Safety Index</h2>
              <p className="text-xs text-slate-500">Live vehicle tracking, RFID gate clock-ins, and campus safety metrics</p>
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <div className="text-slate-500 font-medium">Active Fleet Buses</div>
                  <div className="text-base font-black text-blue-600 mt-0.5">24 Vehicles</div>
                  <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">100% On-Schedule GPS</div>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <div className="text-slate-500 font-medium">Gate Swipes Logged</div>
                  <div className="text-base font-black text-slate-900 mt-0.5">842 Today</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">&lt;200ms RFID Verification</div>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <div className="text-slate-500 font-medium">Campus Punctuality</div>
                  <div className="text-base font-black text-emerald-600 mt-0.5">97.8%</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">On-Time Morning Roll</div>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <div className="text-slate-500 font-medium">Safety Compliances</div>
                  <div className="text-base font-black text-teal-600 mt-0.5">100% Cleared</div>
                  <div className="text-[10px] text-teal-600 font-semibold mt-0.5">Fire & Police Verified</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          14. ROLES & USERS MODULE (COMPREHENSIVELY ENRICHED)
          ───────────────────────────────────────────────────────────── */}
      {moduleKey === 'roles-users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white flex items-center justify-center shadow-md shadow-blue-600/25 shrink-0">
                <UserCog className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">Roles, Permissions & User Access Management</h1>
                <p className="text-xs text-slate-500">Multi-portal RBAC governance: Super Admin (Correspondent), Staff Office Desk, Principal, Faculty, Guardians & Students</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAddUserModal(true)}
                className="px-4 py-2.5 rounded-xl bg-[#0071E3] hover:bg-blue-600 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-blue-500/25 cursor-pointer transition-all"
              >
                <UserPlus className="w-4 h-4 text-white" />
                <span>Add User Account</span>
              </button>
              <button
                onClick={() => toast.success('RBAC security audit log exported successfully.')}
                className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center space-x-1.5 border border-slate-200 shadow-xs cursor-pointer transition-all"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span>Audit Export</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[4px_4px_10px_#C8D0DC,-4px_-4px_10px_#FFFFFF] border border-white/60">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total System Accounts</span>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-2xl font-black text-slate-900">{managedUsers.length}</span>
                <span className="text-xs font-bold text-emerald-600">100% Active</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Across all portal scopes</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[4px_4px_10px_#C8D0DC,-4px_-4px_10px_#FFFFFF] border border-white/60">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">RBAC Role Profiles</span>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-2xl font-black text-blue-600">6 Roles</span>
                <span className="text-xs font-bold text-blue-600">Enforced</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Super Admin, Vice Admin, Coordinator, Teacher, Parent, Student</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[4px_4px_10px_#C8D0DC,-4px_-4px_10px_#FFFFFF] border border-white/60">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Role Assignment Desk</span>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-2xl font-black text-purple-600">Live</span>
                <span className="text-xs font-bold text-purple-600">Dynamic</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Instant role switching & assignment</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[4px_4px_10px_#C8D0DC,-4px_-4px_10px_#FFFFFF] border border-white/60">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Authentication Health</span>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-2xl font-black text-emerald-600">99.9%</span>
                <span className="text-xs font-bold text-emerald-600">Verified</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">JWT Tokens with auto-rotation</p>
            </div>
          </div>

          {/* User Directory Filter & Table */}
          <div className="p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Role Filter Pills */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { key: 'all', label: 'All Roles', count: managedUsers.length },
                  { key: 'Super Admin', label: 'Super Admin', count: managedUsers.filter(u => u.assignedRole === 'Super Admin').length },
                  { key: 'Vice Admin', label: 'Vice Admin', count: managedUsers.filter(u => u.assignedRole === 'Vice Admin').length },
                  { key: 'Coordinator', label: 'Coordinator', count: managedUsers.filter(u => u.assignedRole === 'Coordinator').length },
                  { key: 'Teacher', label: 'Teacher', count: managedUsers.filter(u => u.assignedRole === 'Teacher').length },
                  { key: 'Parent', label: 'Parent', count: managedUsers.filter(u => u.assignedRole === 'Parent').length },
                  { key: 'Student', label: 'Student', count: managedUsers.filter(u => u.assignedRole === 'Student').length },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setUserRoleFilter(tab.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      userRoleFilter === tab.key
                        ? 'bg-[#0071E3] text-white shadow-sm'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search name, username, email..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs bg-white">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-3 px-4">User & Username</th>
                    <th className="py-3 px-4">Current Assigned Role</th>
                    <th className="py-3 px-4">Assign Role (Quick)</th>
                    <th className="py-3 px-4">Portal Scope</th>
                    <th className="py-3 px-4">Key Permissions</th>
                    <th className="py-3 px-4">Contact Info</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {managedUsers
                    .filter((u) => {
                      if (userRoleFilter !== 'all' && u.assignedRole !== userRoleFilter) return false;
                      if (!userSearchTerm.trim()) return true;
                      const term = userSearchTerm.toLowerCase();
                      return (
                        u.fullName.toLowerCase().includes(term) ||
                        u.username.toLowerCase().includes(term) ||
                        u.email.toLowerCase().includes(term) ||
                        u.assignedRole.toLowerCase().includes(term)
                      );
                    })
                    .map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{u.fullName}</div>
                          <div className="font-mono text-[10px] text-blue-600 font-semibold">@{u.username}</div>
                          <div className="text-[10px] text-slate-400">Seen: {u.lastLogin}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-block ${
                            u.assignedRole === 'Super Admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                            u.assignedRole === 'Vice Admin' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                            u.assignedRole === 'Coordinator' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                            u.assignedRole === 'Teacher' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            u.assignedRole === 'Parent' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {u.assignedRole}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={u.assignedRole}
                            onChange={(e) => handleApplyRoleAssignment(u.id, e.target.value)}
                            className="text-[11px] font-bold bg-[#EBEEF2] border border-slate-300 rounded-lg px-2 py-1 text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="Super Admin">Super Admin</option>
                            <option value="Vice Admin">Vice Admin</option>
                            <option value="Coordinator">Coordinator</option>
                            <option value="Teacher">Teacher</option>
                            <option value="Parent">Parent</option>
                            <option value="Student">Student</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium max-w-[170px]">
                          {u.portalScope}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {u.permissions?.slice(0, 2).map((p, i) => (
                              <span key={i} className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600 border border-slate-200">
                                {p}
                              </span>
                            ))}
                            {(u.permissions?.length || 0) > 2 && (
                              <span className="text-[10px] text-slate-400 font-semibold self-center">
                                +{u.permissions.length - 2} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          <div className="font-mono text-[11px] text-slate-800">{u.email}</div>
                          <div className="text-[10px] text-slate-400">{u.phone}</div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => {
                                setAssignRoleModalUser(u);
                                setAssignedRoleChoice(u.assignedRole);
                              }}
                              className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-[#0071E3] text-[10px] font-bold border border-blue-200 transition-colors cursor-pointer"
                              title="Assign Role"
                            >
                              Assign Role
                            </button>
                            <button
                              onClick={() => toast.success(`Password reset link dispatched for @${u.username}.`)}
                              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition-colors cursor-pointer"
                              title="Reset Password"
                            >
                              Reset
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Role & Permission Access Control Matrix */}
          <div className="p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-4">
            <div className="flex items-center space-x-3 border-b border-slate-200 pb-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Enterprise Role-Based Access Control (RBAC) Matrix</h3>
                <p className="text-[11px] text-slate-500">Definitive permission mapping across all 8 core campus modules</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs bg-white">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200 text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Campus Function / Module</th>
                    <th className="py-3 px-3 text-center">Super Admin</th>
                    <th className="py-3 px-3 text-center">Vice Admin</th>
                    <th className="py-3 px-3 text-center">Coordinator</th>
                    <th className="py-3 px-3 text-center">Teacher</th>
                    <th className="py-3 px-3 text-center">Parent</th>
                    <th className="py-3 px-3 text-center">Student</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px] font-semibold text-slate-700">
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-slate-900">Student Directory (150 Enrolled)</td>
                    <td className="py-2.5 px-3 text-center"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">Full</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">Full</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-bold">Wing Only</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-bold">Class Only</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-bold">Ward Only</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-bold">Self Only</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-slate-900">Fee Counter, Cash & Invoices</td>
                    <td className="py-2.5 px-3 text-center"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">Sanction</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">Audit</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="text-slate-400">✕</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="text-slate-400">✕</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-bold">Pay Dues</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded">View Status</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-slate-900">Examinations & Mark Entries</td>
                    <td className="py-2.5 px-3 text-center"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">Publish</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">Approve</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">Moderate</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-bold">Grade Input</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded">View Grades</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded">View Grades</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-slate-900">Class Timetable & Periods</td>
                    <td className="py-2.5 px-3 text-center"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">Full</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">Oversight</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">Manage Wing</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded">View Periods</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded">View Schedule</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded">View Schedule</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-slate-900">Transport Bus GPS Radar</td>
                    <td className="py-2.5 px-3 text-center"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">Fleet Admin</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">Live Radar</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-bold">Live Radar</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded">View Route</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">Ward Bus</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">Assigned Bus</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-slate-900">Treasury Reserves & Payroll</td>
                    <td className="py-2.5 px-3 text-center"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">Authorize</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">Audit</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="text-slate-400">✕</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="text-slate-400">✕</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="text-slate-400">✕</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="text-slate-400">✕</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-slate-900">Gate Passes & Visitor RFID</td>
                    <td className="py-2.5 px-3 text-center"><span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded">Audit Log</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded">Audit Log</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="text-slate-400">✕</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="text-slate-400">✕</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="text-slate-400">✕</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="text-slate-400">✕</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-slate-900">Institutional ERP Settings</td>
                    <td className="py-2.5 px-3 text-center"><span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-bold">Exclusive</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="text-slate-500 bg-slate-50 px-2 py-0.5 rounded">Read Only</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="text-slate-400">✕</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="text-slate-400">✕</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="text-slate-400">✕</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="text-slate-400">✕</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ASSIGN ROLE MODAL */}
          {assignRoleModalUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
              <div className="bg-[#EBEEF2] shadow-[10px_10px_30px_#A3B1C6,-10px_-10px_30px_#FFFFFF] rounded-3xl border border-white max-w-lg w-full p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Assign Account Role</h3>
                    <p className="text-xs text-slate-500">
                      Configure RBAC permissions for <strong className="text-slate-800">{assignRoleModalUser.fullName}</strong> (@{assignRoleModalUser.username})
                    </p>
                  </div>
                  <button
                    onClick={() => setAssignRoleModalUser(null)}
                    className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Select Assigned Role:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { role: 'Super Admin', desc: 'Full institutional governance & settings' },
                      { role: 'Vice Admin', desc: 'Operational oversight & campus supervision' },
                      { role: 'Coordinator', desc: 'Academic wing oversight & syllabus' },
                      { role: 'Teacher', desc: 'Roll-call, mark entry & homework' },
                      { role: 'Parent', desc: 'Ward progress, fee receipts & bus GPS' },
                      { role: 'Student', desc: 'Student desk, routine & library' },
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.role}
                        onClick={() => setAssignedRoleChoice(item.role)}
                        className={`p-3 rounded-2xl text-left transition-all border cursor-pointer ${
                          assignedRoleChoice === item.role
                            ? 'bg-blue-50 border-blue-500 shadow-sm'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-900">{item.role}</span>
                          {assignedRoleChoice === item.role && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setAssignRoleModalUser(null)}
                    className="px-4 py-2 rounded-xl bg-white text-slate-700 font-bold text-xs border border-slate-200 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyRoleAssignment(assignRoleModalUser.id, assignedRoleChoice)}
                    className="px-4 py-2 rounded-xl bg-[#0071E3] text-white font-bold text-xs hover:bg-blue-600 shadow-md shadow-blue-500/25 cursor-pointer"
                  >
                    Confirm & Assign Role
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ADD USER MODAL */}
          {showAddUserModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
              <div className="bg-[#EBEEF2] shadow-[10px_10px_30px_#A3B1C6,-10px_-10px_30px_#FFFFFF] rounded-3xl border border-white max-w-lg w-full p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Add User & Assign Role</h3>
                    <p className="text-xs text-slate-500">Create an institutional user account and assign immediate role</p>
                  </div>
                  <button
                    onClick={() => setShowAddUserModal(false)}
                    className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCreateNewUser} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Jennifer Lawrence"
                      value={newUserForm.fullName}
                      onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold outline-none focus:ring-2 focus:ring-[#0071E3]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Username</label>
                      <input
                        type="text"
                        placeholder="e.g. jlawrence"
                        value={newUserForm.username}
                        onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold outline-none focus:ring-2 focus:ring-[#0071E3]"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Assign Initial Role</label>
                      <select
                        value={newUserForm.role}
                        onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#0071E3]"
                      >
                        <option value="Super Admin">Super Admin</option>
                        <option value="Vice Admin">Vice Admin</option>
                        <option value="Coordinator">Coordinator</option>
                        <option value="Teacher">Teacher</option>
                        <option value="Parent">Parent</option>
                        <option value="Student">Student</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                      <input
                        type="email"
                        placeholder="e.g. j.lawrence@evergrow.edu"
                        value={newUserForm.email}
                        onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold outline-none focus:ring-2 focus:ring-[#0071E3]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
                      <input
                        type="text"
                        placeholder="e.g. +91 98450 12345"
                        value={newUserForm.phone}
                        onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold outline-none focus:ring-2 focus:ring-[#0071E3]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setShowAddUserModal(false)}
                      className="px-4 py-2 rounded-xl bg-white text-slate-700 font-bold text-xs border border-slate-200 hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#0071E3] text-white font-bold text-xs hover:bg-blue-600 shadow-md shadow-blue-500/25 cursor-pointer"
                    >
                      Create User & Assign Role
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          15. API INTEGRATIONS MODULE (COMPREHENSIVELY ENRICHED)
          ───────────────────────────────────────────────────────────── */}
      {moduleKey === 'integrations' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 shrink-0">
                <Workflow className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Enterprise Integrations & Gateways</h1>
                <p className="text-xs text-slate-500">Connected telemetry, WhatsApp API, payment gateway, and backups</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>6 Gateways Online • 99.98% Uptime</span>
              </span>
              <button
                onClick={() => toast.success('API health ping broadcasted. All 6 gateway endpoints responding normally.')}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs shadow-xs cursor-pointer"
              >
                Ping All Gateways
              </button>
            </div>
          </div>

          {/* 6 Master Integration Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                id: 'whatsapp',
                title: 'WhatsApp Business Cloud API',
                provider: 'Meta Graph API v19.0',
                status: 'Connected (Verified Sender)',
                statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
                desc: 'Automated instant fee receipts, student absence notices, and homework notifications dispatched to verified parent numbers.',
                metric: '1,420 Templates Dispatched',
                metricSub: '99.4% Verified Delivery',
                icon: Phone,
                iconBg: 'bg-emerald-50 text-emerald-600',
              },
              {
                id: 'payment',
                title: 'Payment Gateway (Razorpay & Cashfree)',
                provider: 'Merchant ID: MERCH_EGS_84920',
                status: 'Live (Auto-Settlement Active)',
                statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
                desc: 'Parent UPI, debit/credit cards, and NetBanking counter collections with direct T+1 institutional bank account reconciliation.',
                metric: '₹1,42,500 Processed Today',
                metricSub: '0.0% Chargeback Rate',
                icon: CreditCard,
                iconBg: 'bg-blue-50 text-[#0071E3]',
              },
              {
                id: 'gps',
                title: 'AIS-140 GPS Fleet Telemetry Server',
                provider: 'Traccar Enterprise Protocol',
                status: 'Streaming 1 Hz Live',
                statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
                desc: 'Live geo-coordinate streaming for 24 campus buses with parent ETA notifications, speed compliance, and route boundary alerts.',
                metric: '24 Buses Online',
                metricSub: '0 Speed Violations Logged',
                icon: Server,
                iconBg: 'bg-indigo-50 text-indigo-600',
              },
              {
                id: 'biometric',
                title: 'ZK-Teco Biometric & RFID Turnstiles',
                provider: 'TCP/IP Port 4370 Direct Socket',
                status: '4 Turnstiles Active',
                statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
                desc: 'Hardware attendance synchronization for student RFID entry badges and faculty biometric muster roll clock-in.',
                metric: '842 Swipes Logged Today',
                metricSub: '<180ms Recognition Latency',
                icon: Activity,
                iconBg: 'bg-purple-50 text-purple-600',
              },
              {
                id: 'sms',
                title: 'Fast2SMS & Jio DLT SMS Gateway',
                provider: 'DLT Entity ID: 110142958000',
                status: 'Verified DLT Sender',
                statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
                desc: 'Regulatory transactional SMS fallback for emergency circulars, severe weather campus closures, and staff 2FA authentication.',
                metric: '24,500 Credits Remaining',
                metricSub: 'Header: EGROWS',
                icon: Send,
                iconBg: 'bg-amber-50 text-amber-600',
              },
              {
                id: 'backup',
                title: 'Automated Cloud Database S3 Backup',
                provider: 'AWS S3 & Cloud Storage (Mumbai Region)',
                status: 'AES-256 Daily 02:00 AM Cron',
                statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
                desc: 'Geo-redundant encrypted database snapshots, student documents vault, and fee ledger audit logs retention for 7 years.',
                metric: '184 MB Snapshot Verified',
                metricSub: 'Zero Data Loss Tolerance',
                icon: Database,
                iconBg: 'bg-teal-50 text-teal-600',
              },
            ].map((gw) => {
              const Icon = gw.icon;
              return (
                <div key={gw.id} className="p-5 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-2xl ${gw.iconBg} flex items-center justify-center border border-slate-200/60`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${gw.statusColor}`}>
                        {gw.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{gw.title}</h3>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">{gw.provider}</div>
                      <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">{gw.desc}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{gw.metric}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">{gw.metricSub}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toast.success(`Diagnostic test completed for ${gw.title}. Connection healthy.`)}
                        className="w-full py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all cursor-pointer"
                      >
                        Run Diagnostic Test
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Webhook Stream & API Event Log Table */}
          <div className="p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-black text-slate-800">Live Webhook Dispatch & Gateway Ingress Stream</h2>
                <p className="text-xs text-slate-500">Real-time telemetry event trace, HTTP response codes, and network round-trip latencies</p>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 font-mono">
                Auto-Polling: 5s
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs bg-white">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Event Timestamp</th>
                    <th className="py-3 px-4">Service Gateway</th>
                    <th className="py-3 px-4">Webhook Event Type</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Latency</th>
                    <th className="py-3 px-4 text-right">Payload Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {[
                    { time: 'Just now (10:48:12)', service: 'WhatsApp Cloud API', event: 'message.template.delivered', status: '200 OK', lat: '124ms', detail: 'Fee receipt template sent to +91 94431 87230' },
                    { time: '1 min ago (10:47:05)', service: 'Razorpay UPI Ingress', event: 'payment.captured', status: '200 OK', lat: '210ms', detail: '₹14,500 Term 2 Fee collected for S001' },
                    { time: '2 mins ago (10:46:00)', service: 'AIS-140 GPS Server', event: 'fleet.geofence.boundary_exit', status: '200 OK', lat: '88ms', detail: 'Bus #04 exited Whitefield depot radius' },
                    { time: '4 mins ago (10:44:18)', service: 'ZK-Teco Biometric Turnstile', event: 'gate.rfid.clock_in', status: '200 OK', lat: '42ms', detail: 'Student M. Mohan badge verified at Gate 1' },
                    { time: '7 mins ago (10:41:00)', service: 'Jio DLT SMS Gateway', event: 'sms.dispatch.delivered', status: '200 OK', lat: '340ms', detail: 'Morning roll-call attendance summary SMS' },
                    { time: 'Today, 02:00:00 AM', service: 'AWS S3 Cloud Backup', event: 'vault.snapshot.completed', status: '200 OK', lat: '1.2s', detail: 'Encrypted database snapshot dump: 184 MB' },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-600 font-semibold">{row.time}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{row.service}</td>
                      <td className="py-3 px-4 font-mono text-blue-600">{row.event}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500">{row.lat}</td>
                      <td className="py-3 px-4 text-right text-slate-600 max-w-xs truncate">{row.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          16. INSTITUTIONAL SETTINGS & ERP MODULES DIRECTORY
          ───────────────────────────────────────────────────────────── */}
      {moduleKey === 'settings' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center shadow-md shadow-slate-700/25 shrink-0">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Institutional Settings & Customize ERP Modules</h1>
                <p className="text-xs text-slate-500">
                  Explore all campus ERP features, understand what each module does and how to use it, and configure institutional affiliation standards.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => toast.success('All institutional parameters and module configurations have been successfully saved.')}
                className="px-4 py-2.5 rounded-xl bg-[#0071E3] hover:bg-blue-600 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-blue-500/25 cursor-pointer transition-all"
              >
                <Save className="w-4 h-4 text-white" />
                <span>Save & Apply Settings</span>
              </button>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_5px_#C8D0DC,inset_-2px_-2px_5px_#FFFFFF]">
            {[
              { id: 'modules', label: 'Customize ERP Modules (12)', icon: LayoutGrid, desc: 'Feature switchboard & capabilities' },
              { id: 'affiliation', label: 'CBSE Affiliation & Legal', icon: Building, desc: 'School board accreditation' },
              { id: 'academic', label: 'Academic & Passing Rules', icon: GraduationCap, desc: '75% attendance & grading scale' },
              { id: 'timings', label: 'Campus Hours & Bell Timings', icon: Clock, desc: 'Daily bells & bus dispatch' },
              { id: 'security', label: 'Security & Backup Policies', icon: ShieldCheck, desc: 'Lockout & cloud backups' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = settingsActiveTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSettingsActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-[3px_3px_7px_#C8D0DC,-3px_-3px_7px_#FFFFFF]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#0071E3]' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: CUSTOMIZE ERP MODULES SWITCHBOARD & DIRECTORY */}
          {settingsActiveTab === 'modules' && (
            <div className="space-y-6">
              {/* Directory Filter & Search */}
              <div className="p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">ERP Features Directory & Module Controls</h3>
                    <p className="text-xs text-slate-500">
                      Understand each setting's purpose, see how your institution can use it, and toggle modules active or hidden.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    {/* Search */}
                    <div className="relative w-full sm:w-60">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search module or use case..."
                        value={settingsModuleSearch}
                        onChange={(e) => setSettingsModuleSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                      />
                    </div>
                  </div>
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-200">
                  {['all', 'Academics', 'Finance', 'Daily Operations', 'Safety & Logistics', 'Campus Security', 'Student Motivation', 'Resources', 'Community', 'Student Counseling'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSettingsModuleCategory(cat)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        settingsModuleCategory === cat
                          ? 'bg-[#0071E3] text-white'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {cat === 'all' ? 'All Categories (12)' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Module Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {Object.entries(erpModules)
                  .filter(([_, mod]) => {
                    if (settingsModuleCategory !== 'all' && mod.category !== settingsModuleCategory) return false;
                    if (!settingsModuleSearch.trim()) return true;
                    const q = settingsModuleSearch.toLowerCase();
                    return (
                      mod.title.toLowerCase().includes(q) ||
                      mod.description.toLowerCase().includes(q) ||
                      mod.usage.toLowerCase().includes(q) ||
                      mod.category.toLowerCase().includes(q)
                    );
                  })
                  .map(([key, mod]) => {
                    const ModIcon = mod.icon;
                    return (
                      <div
                        key={key}
                        className={`p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border transition-all flex flex-col justify-between ${
                          mod.enabled ? 'border-white/80' : 'border-slate-300 opacity-75'
                        }`}
                      >
                        <div className="space-y-3.5">
                          {/* Card Top: Icon, Title & Toggle Switch */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center space-x-3">
                              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                                mod.enabled ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-600'
                              }`}>
                                <ModIcon className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-extrabold text-sm text-slate-900 leading-snug">{mod.title}</h4>
                                <span className="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                                  {mod.category}
                                </span>
                              </div>
                            </div>

                            {/* Toggle Button */}
                            <button
                              type="button"
                              onClick={() => toggleModuleStatus(key)}
                              className={`px-3 py-1.5 rounded-xl text-[11px] font-black flex items-center space-x-1.5 transition-all cursor-pointer ${
                                mod.enabled
                                  ? 'bg-emerald-500 text-white shadow-sm hover:bg-emerald-600'
                                  : 'bg-slate-300 text-slate-700 hover:bg-slate-400'
                              }`}
                              title={mod.enabled ? 'Click to disable module' : 'Click to enable module'}
                            >
                              <span>{mod.enabled ? 'Active' : 'Disabled'}</span>
                            </button>
                          </div>

                          {/* "What this is" Block */}
                          <div className="p-3 rounded-2xl bg-white/90 border border-slate-200/80 space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                              What this setting is:
                            </span>
                            <p className="text-xs text-slate-700 leading-relaxed">
                              {mod.description}
                            </p>
                          </div>

                          {/* "What you can use it for" Block */}
                          <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-blue-700">
                              How the school can use it:
                            </span>
                            <p className="text-xs text-slate-700 leading-relaxed font-medium">
                              {mod.usage}
                            </p>
                          </div>
                        </div>

                        {/* Card Bottom: Navigation Shortcut */}
                        <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                          <span className="text-[11px] font-mono text-slate-400">Route: {mod.route}</span>
                          <Link
                            to={mod.route}
                            className="inline-flex items-center space-x-1 font-bold text-[#0071E3] hover:underline"
                          >
                            <span>Open Module</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 2: CBSE AFFILIATION & OFFICIAL REGISTRY */}
          {settingsActiveTab === 'affiliation' && (
            <div className="p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-6">
              <div className="flex items-center space-x-3 border-b border-slate-200 pb-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0071E3] flex items-center justify-center border border-blue-200">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">CBSE Affiliation & Official Regulatory Credentials</h3>
                  <p className="text-xs text-slate-500">Official accreditation identifiers displayed on report cards and certificates</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                  <label className="block text-slate-600 font-bold">Institution Legal Name</label>
                  <p className="text-[11px] text-slate-400">Used on CBSE official mark sheets, Transfer Certificates (TC), and bonafide badges.</p>
                  <input
                    type="text"
                    defaultValue="Ever Grow Schools (CBSE Senior Secondary)"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                  <label className="block text-slate-600 font-bold">CBSE Affiliation Number</label>
                  <p className="text-[11px] text-slate-400">Official 7-digit CBSE registration number recognized by New Delhi.</p>
                  <input
                    type="text"
                    defaultValue="1930842"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                  <label className="block text-slate-600 font-bold">CBSE School Code</label>
                  <p className="text-[11px] text-slate-400">Unique exam center code allocated for Board exam registration.</p>
                  <input
                    type="text"
                    defaultValue="45892"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                  <label className="block text-slate-600 font-bold">Active Academic Session</label>
                  <p className="text-[11px] text-slate-400">Current running academic term governing attendance and fee calendars.</p>
                  <input
                    type="text"
                    defaultValue="2026–2027 Academic Session"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 md:col-span-2">
                  <label className="block text-slate-600 font-bold">Official Campus Address & Board Jurisdiction</label>
                  <p className="text-[11px] text-slate-400">Physical campus location and regional CBSE directorate zone.</p>
                  <input
                    type="text"
                    defaultValue="Ever Grow Knowledge Park, Whitefield, Bangalore - 560066 • CBSE Regional Office Chennai / South Zone"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ACADEMIC & PASSING RULES */}
          {settingsActiveTab === 'academic' && (
            <div className="p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-6">
              <div className="flex items-center space-x-3 border-b border-slate-200 pb-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Academic Evaluation Thresholds & Passing Rules</h3>
                  <p className="text-xs text-slate-500">Criteria for board exam eligibility, passing marks, and grade boundaries</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                  <label className="block text-slate-600 font-bold">Mandatory Attendance Threshold</label>
                  <p className="text-[11px] text-slate-400">CBSE Rule: Students with &lt;75% attendance are automatically flagged for debarment.</p>
                  <input
                    type="text"
                    defaultValue="75.0% Minimum Attendance"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-rose-600 font-black focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                  <label className="block text-slate-600 font-bold">Minimum Passing Marks Standard</label>
                  <p className="text-[11px] text-slate-400">Theory and practical cut-offs required for passing grade promotion.</p>
                  <input
                    type="text"
                    defaultValue="35% Theory / 40% Practical Vivas"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                  <label className="block text-slate-600 font-bold">Assessment Weightage Distribution</label>
                  <p className="text-[11px] text-slate-400">Split between continuous internal assessments (CIE) and end-term finals.</p>
                  <input
                    type="text"
                    defaultValue="40% Internal Assessment + 60% Term Final"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                  <label className="block text-slate-600 font-bold">Moderation & Grading Scheme</label>
                  <p className="text-[11px] text-slate-400">Governing scale for Grade Point Average (GPA 10.0 scale) and grade bands.</p>
                  <input
                    type="text"
                    defaultValue="9-Point CBSE Scale (A1, A2, B1, B2, C1, C2, D, E1, E2)"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CAMPUS HOURS & TIMINGS */}
          {settingsActiveTab === 'timings' && (
            <div className="p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-6">
              <div className="flex items-center space-x-3 border-b border-slate-200 pb-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Campus Working Hours & Daily Bell Routine</h3>
                  <p className="text-xs text-slate-500">Instructional periods, morning roll-call, and afternoon bus dispersal schedule</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                  <label className="block text-slate-600 font-bold">Campus Gates Open</label>
                  <p className="text-[11px] text-slate-400">Security gates open for early student arrivals.</p>
                  <input
                    type="text"
                    defaultValue="07:45 AM"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-black focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                  <label className="block text-slate-600 font-bold">Morning Assembly & Roll-Call</label>
                  <p className="text-[11px] text-slate-400">Official cutoff for morning student punctuality.</p>
                  <input
                    type="text"
                    defaultValue="08:30 AM"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-black focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                  <label className="block text-slate-600 font-bold">Dispersal & Bus Departures</label>
                  <p className="text-[11px] text-slate-400">Closing bell and 12-bus transport fleet departures.</p>
                  <input
                    type="text"
                    defaultValue="03:45 PM"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-black focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 md:col-span-3">
                  <label className="block text-slate-600 font-bold">Saturday Instructional Policy</label>
                  <p className="text-[11px] text-slate-400">Working Saturday hours for co-curricular activities, remedial coaching, and parent consultations.</p>
                  <input
                    type="text"
                    defaultValue="1st & 3rd Saturday Working (08:30 AM – 12:45 PM Half Day) • 2nd & 4th Saturday Holiday"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SECURITY & BACKUP POLICIES */}
          {settingsActiveTab === 'security' && (
            <div className="p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-6">
              <div className="flex items-center space-x-3 border-b border-slate-200 pb-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Security, Account Lockout & Cloud Backup Safeguards</h3>
                  <p className="text-xs text-slate-500">Protection against credential brute-forcing, automated data backups, and session integrity</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                  <label className="block text-slate-600 font-bold">Failed Login Account Lockout</label>
                  <p className="text-[11px] text-slate-400">Protects student and staff credentials by freezing accounts after failed password attempts.</p>
                  <input
                    type="text"
                    defaultValue="5 Failed Attempts (15-Minute Cooldown)"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                  <label className="block text-slate-600 font-bold">Idle Session Expiry Timeout</label>
                  <p className="text-[11px] text-slate-400">Automatically logs out unattended teacher or staff browser windows on campus computers.</p>
                  <input
                    type="text"
                    defaultValue="30 Minutes Idle Timeout"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                  <label className="block text-slate-600 font-bold">Automated Database Cloud Snapshots</label>
                  <p className="text-[11px] text-slate-400">Nightly encrypted SQL snapshots archived with SHA-256 data validation.</p>
                  <input
                    type="text"
                    defaultValue="Daily at 02:00 AM (Encrypted AWS S3 Vault)"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                  <label className="block text-slate-600 font-bold">Audit Logging Trail</label>
                  <p className="text-[11px] text-slate-400">Immutable trace recording all marks modifications, fee edits, and staff permission shifts.</p>
                  <input
                    type="text"
                    defaultValue="Enabled (Retained for 365 Days for CBSE Audits)"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-emerald-700 font-bold focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ModuleHubPage;
