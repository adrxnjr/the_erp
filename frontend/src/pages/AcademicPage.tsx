import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useToast } from '../context/ToastContext';
import {
  BookOpen,
  Calendar,
  Layers,
  GraduationCap,
  ShieldCheck,
  Lock,
  Edit3,
  CheckCircle2,
  Clock,
  BookMarked,
  ChevronDown,
  ChevronUp,
  X,
  FileText,
  AlertCircle,
  Calculator,
  FlaskConical,
  Laptop,
  Globe,
  Palette,
  Plus,
  Loader2,
} from 'lucide-react';

interface SyllabusUnit {
  unit_number: number;
  title: string;
  term?: string;
  hours?: number;
  topics?: string[];
}

interface SyllabusItem {
  id: string;
  subject_id?: string;
  subject_name: string;
  subject_code: string;
  wing_name: string;
  grade_range: string;
  academic_year: string;
  total_units: number;
  total_hours: number;
  overview: string;
  units: SyllabusUnit[];
  textbooks: string[];
  learning_outcomes: string[];
  coordinator_name: string;
  status: string;
  updated_at?: string;
}

interface CoordinatorPermission {
  can_update: boolean;
  is_coordinator: boolean;
  coordinator_name: string;
  wing_name: string;
  message: string;
}

const DEFAULT_SYLLABI: SyllabusItem[] = [
  {
    id: "syl-001",
    subject_name: "Mathematics",
    subject_code: "MATH",
    wing_name: "Senior Secondary Wing",
    grade_range: "Grades 10 to 12",
    academic_year: "2026-2027",
    total_units: 6,
    total_hours: 160,
    overview: "Comprehensive CBSE curriculum covering Differential Calculus, Quadratic Equations, Trigonometry, Coordinate Geometry, and Probability Theory.",
    units: [
      { unit_number: 1, title: "Real Numbers & Polynomials", term: "Term 1", hours: 25, topics: ["Euclid Division Lemma", "Fundamental Theorem of Arithmetic", "Zeroes of Polynomials"] },
      { unit_number: 2, title: "Linear Equations & Arithmetic Progressions", term: "Term 1", hours: 30, topics: ["Pair of Linear Equations", "nth Term of an AP", "Sum of First n Terms"] },
      { unit_number: 3, title: "Coordinate Geometry & Triangles", term: "Term 1", hours: 25, topics: ["Distance Formula", "Section Formula", "Similarity of Triangles"] },
      { unit_number: 4, title: "Introduction to Trigonometry", term: "Term 2", hours: 30, topics: ["Trigonometric Ratios", "Trigonometric Identities", "Heights & Distances Applications"] },
      { unit_number: 5, title: "Circles & Surface Areas", term: "Term 2", hours: 25, topics: ["Tangents to a Circle", "Surface Areas of Combinations", "Frustum of a Cone"] },
      { unit_number: 6, title: "Statistics & Probability", term: "Term 2", hours: 25, topics: ["Mean, Median and Mode", "Cumulative Frequency Graph", "Classical Probability"] }
    ],
    textbooks: ["NCERT Mathematics Class 10", "R.D. Sharma Mathematics Volume 1 & 2", "CBSE Mathematics Exemplar"],
    learning_outcomes: [
      "Master algebraic factorisation and quadratic graphing",
      "Prove geometric theorems on similar triangles and circle tangents",
      "Solve real-world trigonometric heights and distance models",
      "Calculate standard deviation and empirical probability distributions"
    ],
    coordinator_name: "Dr. Arthur Vance (Senior Secondary Coordinator)",
    status: "Approved & Published"
  },
  {
    id: "syl-002",
    subject_name: "Computer Science",
    subject_code: "CS",
    wing_name: "Senior Secondary Wing",
    grade_range: "Grades 10 to 12",
    academic_year: "2026-2027",
    total_units: 5,
    total_hours: 140,
    overview: "Computational thinking, Python object-oriented programming, relational SQL database structures, and foundational neural networks.",
    units: [
      { unit_number: 1, title: "Python Programming & Functions", term: "Term 1", hours: 25, topics: ["Control Structures", "Functions & Scope", "String & List Manipulations"] },
      { unit_number: 2, title: "Data Structures - Stacks & Queues", term: "Term 1", hours: 30, topics: ["Stack Operations using Lists", "Queue Implementations", "Algorithm Complexity"] },
      { unit_number: 3, title: "Relational Databases & SQL", term: "Term 2", hours: 30, topics: ["Relational Data Model", "DDL and DML Commands", "Aggregate Functions & Joins"] },
      { unit_number: 4, title: "Computer Networks & Cyber Ethics", term: "Term 2", hours: 25, topics: ["Transmission Media", "Network Devices & Topologies", "Cyber Safety & Intellectual Property"] },
      { unit_number: 5, title: "Introduction to Artificial Intelligence", term: "Term 2", hours: 30, topics: ["Machine Learning Workflow", "Prompt Engineering", "Ethics of Generative AI"] }
    ],
    textbooks: ["Computer Science with Python by Sumita Arora", "NCERT Informatics Practices", "Python Cookbook 3rd Edition"],
    learning_outcomes: [
      "Develop modular object-oriented Python scripts with error handling",
      "Execute ACID compliant SQL table queries, constraints, and joins",
      "Understand network topologies, DNS, and SSL security protocols",
      "Build basic decision tree and linear regression models"
    ],
    coordinator_name: "Dr. Arthur Vance (Senior Secondary Coordinator)",
    status: "Approved & Published"
  },
  {
    id: "syl-003",
    subject_name: "General Science",
    subject_code: "SCI",
    wing_name: "Middle School Wing",
    grade_range: "Grades 6 to 9",
    academic_year: "2026-2027",
    total_units: 6,
    total_hours: 150,
    overview: "Integrated natural sciences incorporating Physics (Forces & Energy), Chemistry (Matter & Atomic Structure), and Biology (Cell Biology & Ecosystems).",
    units: [
      { unit_number: 1, title: "Cell Structure & Functions", term: "Term 1", hours: 25, topics: ["Plant vs Animal Cells", "Cell Organelles", "Cell Division (Mitosis)"] },
      { unit_number: 2, title: "Force, Motion & Laws of Gravitation", term: "Term 1", hours: 28, topics: ["Newton's Three Laws of Motion", "Universal Law of Gravitation", "Mass vs Weight"] },
      { unit_number: 3, title: "Atoms, Molecules & Chemical Reactions", term: "Term 1", hours: 25, topics: ["Chemical Formulae", "Mole Concept", "Balancing Chemical Equations"] },
      { unit_number: 4, title: "Plant Physiology & Photosynthesis", term: "Term 2", hours: 22, topics: ["Xylem and Phloem Transport", "Chloroplast Function", "Stomatal Gas Exchange"] },
      { unit_number: 5, title: "Sound Waves & Light Optics", term: "Term 2", hours: 26, topics: ["Propagation of Sound", "Reflection & Refraction", "Structure of the Human Eye"] },
      { unit_number: 6, title: "Natural Resources & Conservation", term: "Term 2", hours: 24, topics: ["Biogeochemical Cycles", "Air and Water Pollution", "Ozone Layer Depletion"] }
    ],
    textbooks: ["NCERT Science Class 8 & 9", "Lakhmir Singh & Manjit Kaur Science Series", "Practical Science Laboratory Manual"],
    learning_outcomes: [
      "Conduct safe titration and precipitate chemical reactions in the lab",
      "Construct ray diagrams for concave and convex spherical lenses",
      "Explain respiration and cardiovascular circulation in vertebrates",
      "Calculate gravitational potential and kinetic energy vectors"
    ],
    coordinator_name: "Mrs. Rachel Green (Middle School Coordinator)",
    status: "Approved & Published"
  },
  {
    id: "syl-004",
    subject_name: "English Literature",
    subject_code: "ENG",
    wing_name: "Middle School Wing",
    grade_range: "Grades 6 to 9",
    academic_year: "2026-2027",
    total_units: 4,
    total_hours: 120,
    overview: "Literary appreciation, poetic verse forms, rhetorical composition, formal correspondence, and dramatic monologue analysis.",
    units: [
      { unit_number: 1, title: "Prose Reading - World Classic Short Stories", term: "Term 1", hours: 30, topics: ["Character Arc Analysis", "Setting and Mood", "Narrative Point of View"] },
      { unit_number: 2, title: "Poetic Devices & Metaphorical Analysis", term: "Term 1", hours: 25, topics: ["Rhyme Schemes", "Simile, Metaphor & Personification", "Alliteration & Symbolism"] },
      { unit_number: 3, title: "Advanced Writing - Editorial & Argumentative", term: "Term 2", hours: 35, topics: ["Formal Letter Formats", "Newspaper Articles", "Debate & Speech Delivery"] },
      { unit_number: 4, title: "Dramatic Arts - Shakespearean Scenes", term: "Term 2", hours: 30, topics: ["The Merchant of Venice Excerpts", "Stage Directions", "Soliloquy Interpretation"] }
    ],
    textbooks: ["First Flight Literature Reader", "Footprints without Feet Supplementary Reader", "Wren & Martin High School English Grammar"],
    learning_outcomes: [
      "Critique character motivation and thematic conflict in classic prose",
      "Compose persuasive articles following standard ICSE/CBSE formats",
      "Identify iambic pentameter, alliteration, and hyperbole in verse",
      "Deliver dramatic readings with expressive diction and cadence"
    ],
    coordinator_name: "Mrs. Rachel Green (Middle School Coordinator)",
    status: "Approved & Published"
  },
  {
    id: "syl-005",
    subject_name: "Environmental Studies",
    subject_code: "EVS",
    wing_name: "Primary Wing",
    grade_range: "Grades 1 to 5",
    academic_year: "2026-2027",
    total_units: 4,
    total_hours: 100,
    overview: "Experiential natural science focusing on community awareness, weather patterns, animal habitats, and healthy living.",
    units: [
      { unit_number: 1, title: "Living Things & Habitats", term: "Term 1", hours: 25, topics: ["Plants Around Us", "Animal Homes", "Care for Domestic Pets"] },
      { unit_number: 2, title: "Weather, Water Cycle & Seasons", term: "Term 1", hours: 25, topics: ["Rainy, Summer, Winter Seasons", "Saving Drinking Water", "Rainwater Harvesting Basics"] },
      { unit_number: 3, title: "Healthy Food, Nutrition & Hygiene", term: "Term 2", hours: 25, topics: ["Balanced Diet Pyramid", "Handwashing & Oral Hygiene", "Safe Street Food Habits"] },
      { unit_number: 4, title: "Community Helpers & Civic Duty", term: "Term 2", hours: 25, topics: ["Doctors, Police & Firefighters", "Traffic Signals", "Keeping Public Parks Clean"] }
    ],
    textbooks: ["NCERT Looking Around Primary EVS", "Oxford Environmental Studies Book 4"],
    learning_outcomes: [
      "Differentiate between herbivores, carnivores, and omnivores",
      "Trace the evaporation and condensation cycle in nature",
      "Practice personal hygiene and balanced nutritional habits",
      "Identify major public civic institutions in the local neighborhood"
    ],
    coordinator_name: "Ms. Sarah Jenkins (Primary Wing Coordinator)",
    status: "Approved & Published"
  },
  {
    id: "syl-006",
    subject_name: "Primary Mathematics",
    subject_code: "MATH",
    wing_name: "Primary Wing",
    grade_range: "Grades 1 to 5",
    academic_year: "2026-2027",
    total_units: 4,
    total_hours: 110,
    overview: "Foundational numeracy, multiplication tables, metric measurement units, currency calculations, and geometric shapes.",
    units: [
      { unit_number: 1, title: "Number Systems & Place Values", term: "Term 1", hours: 30, topics: ["Numbers up to 10,000", "Ascending & Descending Order", "Place Value Abacus"] },
      { unit_number: 2, title: "Multiplication Tables & Basic Division", term: "Term 1", hours: 30, topics: ["Tables from 2 to 12", "Repeated Subtraction as Division", "Word Problems"] },
      { unit_number: 3, title: "Length, Weight & Capacity Metrics", term: "Term 2", hours: 25, topics: ["Ruler Measurement in cm", "Kilograms vs Grams", "Liters & Milliliters Measuring Jug"] },
      { unit_number: 4, title: "Currency, Time & Basic 2D Shapes", term: "Term 2", hours: 25, topics: ["Rupee Notes & Coins", "Reading Clocks & Half-Hours", "Circles, Squares, Rectangles & Triangles"] }
    ],
    textbooks: ["Math-Magic Class 4 NCERT", "Target Mental Math Primary Edition"],
    learning_outcomes: [
      "Perform rapid mental addition and multiplication up to 12x12",
      "Convert centimeters to meters and grams to kilograms",
      "Read analog and digital clocks to the exact minute",
      "Calculate change and bills in Indian Rupees and paise"
    ],
    coordinator_name: "Ms. Sarah Jenkins (Primary Wing Coordinator)",
    status: "Approved & Published"
  }
];

export const AcademicPage: React.FC = () => {
  const toast = useToast();
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [years, setYears] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Syllabus State
  const [syllabi, setSyllabi] = useState<SyllabusItem[]>([]);
  const [permission, setPermission] = useState<CoordinatorPermission | null>(null);
  const [selectedWing, setSelectedWing] = useState<string>('all');
  const [expandedSyllabusId, setExpandedSyllabusId] = useState<string | null>(null);

  // Interactive Management Modals
  const [showYearModal, setShowYearModal] = useState<boolean>(false);
  const [yearForm, setYearForm] = useState({
    name: '',
    start_date: '',
    end_date: '',
    is_active: false,
  });
  const [yearErrors, setYearErrors] = useState<Record<string, string>>({});
  const [submittingYear, setSubmittingYear] = useState<boolean>(false);

  const [showClassModal, setShowClassModal] = useState<boolean>(false);
  const [classForm, setClassForm] = useState({
    name: '',
    level: 1,
    description: '',
  });
  const [classErrors, setClassErrors] = useState<Record<string, string>>({});
  const [submittingClass, setSubmittingClass] = useState<boolean>(false);

  const [showSubjectModal, setShowSubjectModal] = useState<boolean>(false);
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    description: '',
  });
  const [subjectErrors, setSubjectErrors] = useState<Record<string, string>>({});
  const [submittingSubject, setSubmittingSubject] = useState<boolean>(false);

  // Edit Modal State (Coordinator Only)
  const [editingSyllabus, setEditingSyllabus] = useState<SyllabusItem | null>(null);
  const [formData, setFormData] = useState<{
    overview: string;
    total_units: number;
    total_hours: number;
    textbooks: string;
    learning_outcomes: string;
    status: string;
  }>({
    overview: '',
    total_units: 6,
    total_hours: 120,
    textbooks: '',
    learning_outcomes: '',
    status: 'Approved & Published',
  });
  const [saving, setSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Academic Structure & Courses — Ever Grow Schools ERP';
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clsRes, subRes, yrRes, syllRes, permRes] = await Promise.all([
        api.get('/academic/classes'),
        api.get('/academic/subjects'),
        api.get('/academic/years'),
        api.get('/academic/syllabus'),
        api.get('/academic/syllabus/permission').catch(() => ({ data: null })),
      ]);
      setClasses(Array.isArray(clsRes.data) ? clsRes.data : []);
      setSubjects(Array.isArray(subRes.data) ? subRes.data : []);
      setYears(Array.isArray(yrRes.data) ? yrRes.data : []);
      const fetchedSyllabi = Array.isArray(syllRes.data) && syllRes.data.length > 0 ? syllRes.data : DEFAULT_SYLLABI;
      setSyllabi(fetchedSyllabi);
      if (permRes?.data) {
        setPermission(permRes.data);
      }
    } catch (e) {
      console.error('Error loading academic data:', e);
      toast.error('Failed to retrieve academic structure from campus server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 1. Handle Create Academic Year ---
  const handleCreateYear = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!yearForm.name.trim() || yearForm.name.trim().length < 3) {
      errors.name = 'Session name must be at least 3 characters (e.g. 2027-2028).';
    }
    if (!yearForm.start_date) {
      errors.start_date = 'Start date is required.';
    }
    if (!yearForm.end_date) {
      errors.end_date = 'End date is required.';
    }
    if (yearForm.start_date && yearForm.end_date && yearForm.end_date <= yearForm.start_date) {
      errors.end_date = 'End date must be later than the start date.';
    }

    if (Object.keys(errors).length > 0) {
      setYearErrors(errors);
      return;
    }
    setYearErrors({});
    setSubmittingYear(true);

    try {
      await api.post('/academic/years', {
        name: yearForm.name.trim(),
        start_date: yearForm.start_date,
        end_date: yearForm.end_date,
        is_active: yearForm.is_active,
      });

      toast.success(`Academic session "${yearForm.name}" created successfully.`);
      setShowYearModal(false);
      setYearForm({ name: '', start_date: '', end_date: '', is_active: false });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.detail || 'Failed to create academic year.');
    } finally {
      setSubmittingYear(false);
    }
  };

  // --- 2. Handle Create Class ---
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!classForm.name.trim() || classForm.name.trim().length < 2) {
      errors.name = 'Class name must be at least 2 characters (e.g. Grade 13).';
    }
    if (classForm.level < 1 || classForm.level > 15) {
      errors.level = 'Academic level must be between 1 and 15.';
    }

    if (Object.keys(errors).length > 0) {
      setClassErrors(errors);
      return;
    }
    setClassErrors({});
    setSubmittingClass(true);

    try {
      await api.post('/academic/classes', {
        name: classForm.name.trim(),
        level: Number(classForm.level),
        description: classForm.description.trim() || undefined,
      });

      toast.success(`Class "${classForm.name}" created successfully.`);
      setShowClassModal(false);
      setClassForm({ name: '', level: 1, description: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.detail || 'Failed to create class.');
    } finally {
      setSubmittingClass(false);
    }
  };

  // --- 3. Handle Create Subject ---
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!subjectForm.name.trim() || subjectForm.name.trim().length < 2) {
      errors.name = 'Subject title must be at least 2 characters.';
    }
    if (!subjectForm.code.trim() || subjectForm.code.trim().length < 2) {
      errors.code = 'Subject code must be at least 2 characters (e.g. ROB, EVS).';
    }

    if (Object.keys(errors).length > 0) {
      setSubjectErrors(errors);
      return;
    }
    setSubjectErrors({});
    setSubmittingSubject(true);

    try {
      await api.post('/academic/subjects', {
        name: subjectForm.name.trim(),
        code: subjectForm.code.trim().toUpperCase(),
        description: subjectForm.description.trim() || undefined,
      });

      toast.success(`Subject "${subjectForm.name}" registered successfully.`);
      setShowSubjectModal(false);
      setSubjectForm({ name: '', code: '', description: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.detail || 'Failed to create subject.');
    } finally {
      setSubmittingSubject(false);
    }
  };

  const handleOpenEditModal = (syll: SyllabusItem) => {
    if (!permission?.can_update) return;
    setEditingSyllabus(syll);
    setFormData({
      overview: syll.overview || '',
      total_units: syll.total_units || 6,
      total_hours: syll.total_hours || 120,
      textbooks: (syll.textbooks || []).join('\n'),
      learning_outcomes: (syll.learning_outcomes || []).join('\n'),
      status: syll.status || 'Approved & Published',
    });
  };

  const handleSaveSyllabus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSyllabus || !permission?.can_update) return;

    setSaving(true);
    try {
      const payload = {
        overview: formData.overview,
        total_units: formData.total_units,
        total_hours: formData.total_hours,
        textbooks: formData.textbooks
          .split('\n')
          .map((t) => t.trim())
          .filter((t) => t.length > 0),
        learning_outcomes: formData.learning_outcomes
          .split('\n')
          .map((o) => o.trim())
          .filter((o) => o.length > 0),
        status: formData.status,
      };

      const res = await api.put(`/academic/syllabus/${editingSyllabus.id}`, payload);
      const updatedItem = res.data;

      setSyllabi((prev) =>
        prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
      );

      toast.success('Curriculum syllabus updated and published successfully.');
      setStatusMessage('Curriculum syllabus updated and published successfully.');
      setTimeout(() => setStatusMessage(null), 4000);
      setEditingSyllabus(null);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.response?.data?.message || 'Failed to update syllabus.');
    } finally {
      setSaving(false);
    }
  };

  const getSubjectIcon = (code: string) => {
    switch ((code || '').toUpperCase()) {
      case 'MATH':
        return <Calculator className="w-4 h-4 text-blue-600" />;
      case 'CS':
        return <Laptop className="w-4 h-4 text-cyan-600" />;
      case 'SCI':
        return <FlaskConical className="w-4 h-4 text-emerald-600" />;
      case 'ENG':
        return <BookOpen className="w-4 h-4 text-purple-600" />;
      case 'SOC':
        return <Globe className="w-4 h-4 text-amber-600" />;
      default:
        return <Palette className="w-4 h-4 text-indigo-600" />;
    }
  };

  const filteredSyllabi = syllabi.filter((item) => {
    if (selectedWing === 'all') return true;
    return item.wing_name.toLowerCase().includes(selectedWing.toLowerCase());
  });

  return (
    <div className="space-y-8 pb-12 animate-fadeIn">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">Academic Structure & Courses</h1>
        <p className="text-sm text-[#86868B] mt-0.5">
          Manage academic sessions, grade levels, sections, curriculum subjects, and coordinator-governed syllabi.
        </p>
      </div>

      {statusMessage && (
        <div role="alert" aria-live="polite" className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Top Overview Cards (Classes, Subjects, Years) with Interactive Add Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Classes Card */}
        <div className="ios-card rounded-[22px] p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.05]">
              <h2 className="font-bold text-[#1D1D1F] flex items-center space-x-2">
                <div className="w-8 h-8 rounded-[10px] bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <span>Classes ({classes.length})</span>
              </h2>
              <button
                onClick={() => setShowClassModal(true)}
                aria-label="Add new class"
                className="px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            <div className="space-y-2 mt-4 max-h-[220px] overflow-y-auto pr-1">
              {loading ? (
                <div className="space-y-2 py-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-10 rounded-xl bg-slate-200/60 animate-pulse" />
                  ))}
                </div>
              ) : classes.length > 0 ? (
                classes.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 bg-black/[0.02] border border-black/[0.04] rounded-[14px] flex items-center justify-between text-sm"
                  >
                    <span className="font-semibold text-[#1D1D1F]">{c.name}</span>
                    <span className="text-xs text-[#86868B]">Level {c.level}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-400 italic">
                  No classes registered yet. Click Add to enroll a class.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subjects Card */}
        <div className="ios-card rounded-[22px] p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.05]">
              <h2 className="font-bold text-[#1D1D1F] flex items-center space-x-2">
                <div className="w-8 h-8 rounded-[10px] bg-[#5856D6]/10 text-[#5856D6] flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span>Subjects ({subjects.length})</span>
              </h2>
              <button
                onClick={() => setShowSubjectModal(true)}
                aria-label="Add new subject"
                className="px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            <div className="space-y-2 mt-4 max-h-[220px] overflow-y-auto pr-1">
              {loading ? (
                <div className="space-y-2 py-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-10 rounded-xl bg-slate-200/60 animate-pulse" />
                  ))}
                </div>
              ) : subjects.length > 0 ? (
                subjects.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 bg-black/[0.02] border border-black/[0.04] rounded-[14px] flex items-center justify-between text-sm"
                  >
                    <span className="font-semibold text-[#1D1D1F]">{s.name}</span>
                    <span className="text-xs font-mono bg-[#5856D6]/10 text-[#5856D6] px-2.5 py-0.5 rounded-full border border-[#5856D6]/20 font-semibold">
                      {s.code}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-400 italic">
                  No subjects registered. Click Add to introduce a subject.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Academic Years Card */}
        <div className="ios-card rounded-[22px] p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.05]">
              <h2 className="font-bold text-[#1D1D1F] flex items-center space-x-2">
                <div className="w-8 h-8 rounded-[10px] bg-emerald-500/10 text-[#34C759] flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <span>Academic Years ({years.length})</span>
              </h2>
              <button
                onClick={() => setShowYearModal(true)}
                aria-label="Add new academic session"
                className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            <div className="space-y-2 mt-4 max-h-[220px] overflow-y-auto pr-1">
              {loading ? (
                <div className="space-y-2 py-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-10 rounded-xl bg-slate-200/60 animate-pulse" />
                  ))}
                </div>
              ) : years.length > 0 ? (
                years.map((y) => (
                  <div
                    key={y.id}
                    className="p-3 bg-black/[0.02] border border-black/[0.04] rounded-[14px] space-y-1"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-[#1D1D1F]">{y.name}</span>
                      {y.is_active && (
                        <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/10 text-[#34C759] rounded-full border border-emerald-500/20">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#86868B]">
                      {y.start_date} to {y.end_date}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-400 italic">
                  No academic years found. Click Add to define a school session.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- SYLLABUS & CURRICULUM SECTION ---------------- */}
      <div className="space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/[0.06] pb-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0071E3] to-blue-600 flex items-center justify-center text-white shadow-xs">
                <BookMarked className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Official Curriculum Syllabi & Course Units
              </h2>
            </div>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Course modules, learning competencies, and prescribed literature governed exclusively by Academic Wing Coordinators.
            </p>
          </div>

          {/* Coordinator Authority Badge */}
          <div>
            {permission?.can_update ? (
              <div className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 space-x-1.5 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Coordinator Authority Active ({permission.coordinator_name})</span>
              </div>
            ) : (
              <div className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 space-x-1.5 shadow-xs">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Protected: Only Academic Coordinators can update syllabus</span>
              </div>
            )}
          </div>
        </div>

        {/* Wing Filter Tabs */}
        <div className="bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-2xl p-1.5 flex flex-wrap items-center gap-2 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase px-3">Filter Wing:</span>
          {[
            { id: 'all', label: `All Wings (${syllabi.length})` },
            { id: 'primary', label: 'Primary Wing (Grades 1-5)' },
            { id: 'middle', label: 'Middle School Wing (Grades 6-9)' },
            { id: 'senior', label: 'Senior Secondary Wing (Grades 10-12)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedWing(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedWing === tab.id
                  ? 'bg-gradient-to-r from-[#0071E3] to-blue-600 text-white shadow-sm shadow-blue-500/25'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-100/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Syllabi Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSyllabi.map((item) => {
            const isExpanded = expandedSyllabusId === item.id;
            return (
              <div
                key={item.id}
                className="bg-white/90 backdrop-blur-xl border border-black/[0.06] rounded-[24px] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center shadow-xs">
                        {getSubjectIcon(item.subject_code)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-slate-900 text-base">{item.subject_name}</h3>
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-[#0071E3] border border-blue-200">
                            {item.subject_code}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {item.wing_name} • <span className="font-bold text-slate-700">{item.grade_range}</span>
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                      {item.status}
                    </span>
                  </div>

                  {/* Overview */}
                  <p className="text-xs text-slate-600 leading-relaxed">{item.overview}</p>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-2.5 text-center">
                    <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Total Units</div>
                      <div className="text-sm font-extrabold text-slate-800 mt-0.5">{item.total_units} Units</div>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Total Hours</div>
                      <div className="text-sm font-extrabold text-slate-800 mt-0.5">{item.total_hours} Hours</div>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Academic Year</div>
                      <div className="text-sm font-extrabold text-[#0071E3] mt-0.5">{item.academic_year}</div>
                    </div>
                  </div>

                  {/* Expandable Course Units */}
                  <div>
                    <button
                      onClick={() => setExpandedSyllabusId(isExpanded ? null : item.id)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 flex items-center justify-between text-xs font-bold text-slate-700 transition-colors"
                    >
                      <span>Course Modules Breakdown ({item.units?.length || 0} Units)</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 space-y-2 border-l-2 border-blue-500/40 pl-3">
                        {item.units?.map((u) => (
                          <div key={u.unit_number} className="text-xs py-1">
                            <div className="font-bold text-slate-800 flex items-center justify-between">
                              <span>Unit {u.unit_number}: {u.title}</span>
                              <span className="text-[10px] text-slate-400">{u.hours} hrs • {u.term}</span>
                            </div>
                            {u.topics && u.topics.length > 0 && (
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                Topics: {u.topics.join(', ')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-black/[0.05] flex items-center justify-between text-xs">
                  <div className="text-slate-500 text-[11px]">
                    Curated by: <span className="font-bold text-slate-700">{item.coordinator_name}</span>
                  </div>

                  {permission?.can_update && (
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0071E3] border border-blue-200/80 font-bold flex items-center space-x-1.5 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Syllabus</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ---------------- MODAL 1: ADD ACADEMIC YEAR ---------------- */}
      {showYearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">New Academic Session</h3>
                  <p className="text-xs text-slate-500 font-medium">Define a school calendar session</p>
                </div>
              </div>
              <button
                onClick={() => setShowYearModal(false)}
                aria-label="Close dialog"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateYear} className="space-y-4 text-xs">
              <div>
                <label htmlFor="year-name" className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Session Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="year-name"
                  type="text"
                  placeholder="e.g. 2027-2028 Academic Year"
                  value={yearForm.name}
                  onChange={(e) => setYearForm({ ...yearForm, name: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border text-slate-900 focus:outline-none focus:ring-2 ${
                    yearErrors.name ? 'border-rose-400 ring-rose-200' : 'border-slate-200 focus:ring-blue-500'
                  }`}
                />
                {yearErrors.name && (
                  <p className="text-rose-600 text-[11px] font-semibold mt-1">{yearErrors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="year-start" className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Start Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="year-start"
                    type="date"
                    value={yearForm.start_date}
                    onChange={(e) => setYearForm({ ...yearForm, start_date: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border text-slate-900 focus:outline-none focus:ring-2 ${
                      yearErrors.start_date ? 'border-rose-400 ring-rose-200' : 'border-slate-200 focus:ring-blue-500'
                    }`}
                  />
                  {yearErrors.start_date && (
                    <p className="text-rose-600 text-[11px] font-semibold mt-1">{yearErrors.start_date}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="year-end" className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    End Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="year-end"
                    type="date"
                    value={yearForm.end_date}
                    onChange={(e) => setYearForm({ ...yearForm, end_date: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border text-slate-900 focus:outline-none focus:ring-2 ${
                      yearErrors.end_date ? 'border-rose-400 ring-rose-200' : 'border-slate-200 focus:ring-blue-500'
                    }`}
                  />
                  {yearErrors.end_date && (
                    <p className="text-rose-600 text-[11px] font-semibold mt-1">{yearErrors.end_date}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="year-active"
                  type="checkbox"
                  checked={yearForm.is_active}
                  onChange={(e) => setYearForm({ ...yearForm, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="year-active" className="text-xs font-semibold text-slate-700">
                  Set as currently active academic session
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowYearModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingYear}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submittingYear ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{submittingYear ? 'Creating...' : 'Create Session'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL 2: ADD CLASS ---------------- */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0071E3] flex items-center justify-center border border-blue-200">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Add New Class</h3>
                  <p className="text-xs text-slate-500 font-medium">Create a class grade level</p>
                </div>
              </div>
              <button
                onClick={() => setShowClassModal(false)}
                aria-label="Close dialog"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-4 text-xs">
              <div>
                <label htmlFor="class-name" className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Class Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="class-name"
                  type="text"
                  placeholder="e.g. Grade 13 or Advanced Placement"
                  value={classForm.name}
                  onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border text-slate-900 focus:outline-none focus:ring-2 ${
                    classErrors.name ? 'border-rose-400 ring-rose-200' : 'border-slate-200 focus:ring-blue-500'
                  }`}
                />
                {classErrors.name && (
                  <p className="text-rose-600 text-[11px] font-semibold mt-1">{classErrors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="class-level" className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Grade Level (1–15) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="class-level"
                  type="number"
                  min={1}
                  max={15}
                  value={classForm.level}
                  onChange={(e) => setClassForm({ ...classForm, level: parseInt(e.target.value) || 1 })}
                  className={`w-full p-2.5 rounded-xl border text-slate-900 focus:outline-none focus:ring-2 ${
                    classErrors.level ? 'border-rose-400 ring-rose-200' : 'border-slate-200 focus:ring-blue-500'
                  }`}
                />
                {classErrors.level && (
                  <p className="text-rose-600 text-[11px] font-semibold mt-1">{classErrors.level}</p>
                )}
              </div>

              <div>
                <label htmlFor="class-desc" className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description (Optional)
                </label>
                <textarea
                  id="class-desc"
                  rows={2}
                  placeholder="Curricular focus and wing placement..."
                  value={classForm.description}
                  onChange={(e) => setClassForm({ ...classForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowClassModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingClass}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submittingClass ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{submittingClass ? 'Creating...' : 'Create Class'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL 3: ADD SUBJECT ---------------- */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Add New Subject</h3>
                  <p className="text-xs text-slate-500 font-medium">Register a curriculum subject</p>
                </div>
              </div>
              <button
                onClick={() => setShowSubjectModal(false)}
                aria-label="Close dialog"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4 text-xs">
              <div>
                <label htmlFor="subject-name" className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Subject Title <span className="text-rose-500">*</span>
                </label>
                <input
                  id="subject-name"
                  type="text"
                  placeholder="e.g. Environmental Science & Sustainability"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border text-slate-900 focus:outline-none focus:ring-2 ${
                    subjectErrors.name ? 'border-rose-400 ring-rose-200' : 'border-slate-200 focus:ring-blue-500'
                  }`}
                />
                {subjectErrors.name && (
                  <p className="text-rose-600 text-[11px] font-semibold mt-1">{subjectErrors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="subject-code" className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Subject Code <span className="text-rose-500">*</span>
                </label>
                <input
                  id="subject-code"
                  type="text"
                  placeholder="e.g. EVS, ROB, ART"
                  value={subjectForm.code}
                  onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value.toUpperCase() })}
                  className={`w-full p-2.5 rounded-xl border text-slate-900 uppercase font-mono focus:outline-none focus:ring-2 ${
                    subjectErrors.code ? 'border-rose-400 ring-rose-200' : 'border-slate-200 focus:ring-blue-500'
                  }`}
                />
                {subjectErrors.code && (
                  <p className="text-rose-600 text-[11px] font-semibold mt-1">{subjectErrors.code}</p>
                )}
              </div>

              <div>
                <label htmlFor="subject-desc" className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description (Optional)
                </label>
                <textarea
                  id="subject-desc"
                  rows={2}
                  placeholder="Syllabus overview and pedagogical objectives..."
                  value={subjectForm.description}
                  onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSubject}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submittingSubject ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{submittingSubject ? 'Registering...' : 'Register Subject'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: EDIT SYLLABUS (Coordinator Only) ---------------- */}
      {editingSyllabus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl border border-slate-100 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-[#0071E3] border border-blue-200">
                    {editingSyllabus.subject_code}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900">
                    Update Curriculum Syllabus — {editingSyllabus.subject_name}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Coordinator: <b className="text-slate-700">{permission?.coordinator_name}</b> • {editingSyllabus.wing_name}
                </p>
              </div>

              <button
                onClick={() => setEditingSyllabus(null)}
                aria-label="Close dialog"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveSyllabus} className="space-y-4">
              <div>
                <label htmlFor="syllabus-overview" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Course Overview & Description
                </label>
                <textarea
                  id="syllabus-overview"
                  rows={3}
                  value={formData.overview}
                  onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  placeholder="Summarize course goals and academic scope..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="syllabus-units" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Total Units
                  </label>
                  <input
                    id="syllabus-units"
                    type="number"
                    min={1}
                    max={20}
                    value={formData.total_units}
                    onChange={(e) => setFormData({ ...formData, total_units: parseInt(e.target.value) || 6 })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  />
                </div>

                <div>
                  <label htmlFor="syllabus-hours" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Total Academic Hours
                  </label>
                  <input
                    id="syllabus-hours"
                    type="number"
                    min={10}
                    max={300}
                    value={formData.total_hours}
                    onChange={(e) => setFormData({ ...formData, total_hours: parseInt(e.target.value) || 120 })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="syllabus-books" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Prescribed Textbooks (One per line)
                </label>
                <textarea
                  id="syllabus-books"
                  rows={2}
                  value={formData.textbooks}
                  onChange={(e) => setFormData({ ...formData, textbooks: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  placeholder="Oxford Primary Mathematics 2026&#10;Cambridge Workbook"
                />
              </div>

              <div>
                <label htmlFor="syllabus-outcomes" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Key Learning Outcomes (One per line)
                </label>
                <textarea
                  id="syllabus-outcomes"
                  rows={2}
                  value={formData.learning_outcomes}
                  onChange={(e) => setFormData({ ...formData, learning_outcomes: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  placeholder="Master multi-digit computation&#10;Construct block scripts"
                />
              </div>

              <div>
                <label htmlFor="syllabus-status" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Publication Status
                </label>
                <select
                  id="syllabus-status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                >
                  <option value="Approved & Published">Approved & Published</option>
                  <option value="Under Curriculum Review">Under Curriculum Review</option>
                  <option value="Revision Pending">Revision Pending</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingSyllabus(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="ios-gloss-btn px-5 py-2.5 text-xs font-semibold text-white space-x-1.5 flex items-center shadow-md disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{saving ? 'Publishing Updates...' : 'Save & Publish Syllabus'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
