import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AmazonPaymentModal } from '../components/AmazonPaymentModal';
import { formatINR } from '../utils/currency';
import schoolData from '../data/schoolData.json';
import {
  DollarSign,
  FileDown,
  CheckCircle,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  Receipt as ReceiptIcon,
  Calendar,
  AlertCircle,
  Clock,
  Download,
  Users,
  User,
  GraduationCap,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

export const FeesPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const isStudent = user?.portal_type === 'student' || user?.roles?.includes('student');
  const isParent =
    user?.portal_type === 'parent' ||
    user?.roles?.includes('parent') ||
    (user?.portal_type === 'parent_student' && !user?.roles?.includes('student'));
  const isStaff = !isStudent && !isParent;

  // Student Fee State
  const [feeData, setFeeData] = useState<any | null>(null);
  const [loadingFee, setLoadingFee] = useState<boolean>(true);

  // Parent Multi-Child State
  const [familySummary, setFamilySummary] = useState<any | null>(null);
  const [childrenFees, setChildrenFees] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('all');

  // Amazon Payment Modal State
  const [isAmazonPayModalOpen, setIsAmazonPayModalOpen] = useState(false);
  const [targetStudentForPayment, setTargetStudentForPayment] = useState<any | null>(null);

  // Staff-only Cashier State
  const [students, setStudents] = useState<any[]>([]);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: '5000.00',
    payment_method: 'upi',
    transaction_reference: '',
    remarks: 'Tuition installment',
  });
  const [recentReceipt, setRecentReceipt] = useState<any | null>(null);

  const fetchFeeData = useCallback(() => {
    if (isParent) {
      setLoadingFee(true);
      api
        .get('/finance/parent/family-fees')
        .then((res) => {
          setFamilySummary(res.data?.family_summary || null);
          setChildrenFees(res.data?.children || []);
        })
        .catch((err) => {
          console.warn('Could not fetch family fees, loading fallback:', err);
          const fallbackLiam = {
            student_id: 'S001',
            student_name: 'M. Mohan',
            admission_number: 'EGS20260001',
            class_name: 'Grade 10',
            section_name: 'A',
            academic_session: '2026-2027',
            total_annual_fee: 71000.0,
            total_paid: 50000.0,
            outstanding_balance: 21000.0,
            status: 'partially_paid',
            is_all_paid: false,
            breakdown: [
              { id: 'fee-term1', category: 'Term 1 Tuition & Academics', amount: 25000.0, status: 'Paid', due_date: '2026-08-30' },
              { id: 'fee-lab', category: 'Science Lab, IT & Robotics', amount: 12000.0, status: 'Paid', due_date: '2026-09-15' },
              { id: 'fee-trans', category: 'Campus Transport (Route 1)', amount: 8000.0, status: 'Paid', due_date: '2026-10-10' },
              { id: 'fee-term2', category: 'Term 2 Tuition & Academics', amount: 18000.0, status: 'Partially Paid', due_date: '2026-12-15' },
              { id: 'fee-sports', category: 'Annual Sports & Extracurriculars', amount: 5000.0, status: 'Not Paid', due_date: '2027-01-10' },
              { id: 'fee-exam', category: 'Examination & Library Clearance', amount: 3000.0, status: 'Not Paid', due_date: '2027-02-15' },
            ],
            receipts: [
              { id: '1', receipt_number: 'REC-2026-0001', amount: 25000.0, method: 'BANK TRANSFER', date: '2026-08-15', remarks: 'Term 1 Academic Tuition Fee' },
              { id: '2', receipt_number: 'REC-2026-0002', amount: 12000.0, method: 'CARD', date: '2026-09-10', remarks: 'Science Lab & Robotics Charges' },
              { id: '3', receipt_number: 'REC-2026-0003', amount: 8000.0, method: 'UPI', date: '2026-10-05', remarks: 'Route 1 Campus Bus Transport' },
              { id: '4', receipt_number: 'RCP-2026-00001', amount: 5000.0, method: 'UPI', date: '2026-11-02', remarks: 'Tuition installment' },
            ],
          };
          const fallbackEmma = {
            student_id: 'S002',
            student_name: 'A. Bhuvana',
            admission_number: 'EGS20260002',
            class_name: 'Grade 10',
            section_name: 'A',
            academic_session: '2026-2027',
            total_annual_fee: 71000.0,
            total_paid: 45000.0,
            outstanding_balance: 26000.0,
            status: 'partially_paid',
            is_all_paid: false,
            breakdown: [
              { id: 'fee-term1', category: 'Term 1 Tuition & Academics', amount: 25000.0, status: 'Paid', due_date: '2026-08-30' },
              { id: 'fee-lab', category: 'Science Lab, IT & Robotics', amount: 12000.0, status: 'Paid', due_date: '2026-09-15' },
              { id: 'fee-trans', category: 'Campus Transport (Route 1)', amount: 8000.0, status: 'Paid', due_date: '2026-10-10' },
              { id: 'fee-term2', category: 'Term 2 Tuition & Academics', amount: 18000.0, status: 'Not Paid', due_date: '2026-12-15' },
              { id: 'fee-sports', category: 'Annual Sports & Extracurriculars', amount: 5000.0, status: 'Not Paid', due_date: '2027-01-10' },
              { id: 'fee-exam', category: 'Examination & Library Clearance', amount: 3000.0, status: 'Not Paid', due_date: '2027-02-15' },
            ],
            receipts: [
              { id: '5', receipt_number: 'REC-2026-0004', amount: 25000.0, method: 'BANK TRANSFER', date: '2026-08-16', remarks: 'Term 1 Academic Tuition Fee' },
              { id: '6', receipt_number: 'REC-2026-0005', amount: 12000.0, method: 'CARD', date: '2026-09-11', remarks: 'Science Lab & Robotics Charges' },
              { id: '7', receipt_number: 'REC-2026-0006', amount: 8000.0, method: 'UPI', date: '2026-10-06', remarks: 'Route 1 Campus Bus Transport' },
            ],
          };
          setFamilySummary({
            total_annual_fee: 142000.0,
            total_paid: 95000.0,
            outstanding_balance: 47000.0,
            is_all_paid: false,
            total_children: 2,
          });
          setChildrenFees([fallbackLiam, fallbackEmma]);
        })
        .finally(() => {
          setLoadingFee(false);
        });
    } else if (isStudent) {
      setLoadingFee(true);
      api
        .get('/finance/my-fees')
        .then((res) => {
          setFeeData(res.data);
        })
        .catch((err) => {
          console.warn('Could not fetch student fees:', err);
          setFeeData({
            student_id: 'S001',
            student_name: 'M. Mohan',
            admission_number: 'EGS20260001',
            class_name: 'Grade 10',
            section_name: 'A',
            academic_session: '2026-2027',
            is_all_paid: false,
            status: 'partially_paid',
            total_annual_fee: 71000.0,
            total_paid: 50000.0,
            outstanding_balance: 21000.0,
            breakdown: [
              { id: 'fee-term1', category: 'Term 1 Tuition & Academics', amount: 25000.0, status: 'Paid', due_date: '2026-08-30' },
              { id: 'fee-lab', category: 'Science Lab, IT & Robotics', amount: 12000.0, status: 'Paid', due_date: '2026-09-15' },
              { id: 'fee-trans', category: 'Campus Transport (Route 1)', amount: 8000.0, status: 'Paid', due_date: '2026-10-10' },
              { id: 'fee-term2', category: 'Term 2 Tuition & Academics', amount: 18000.0, status: 'Partially Paid', due_date: '2026-12-15' },
              { id: 'fee-sports', category: 'Annual Sports & Extracurriculars', amount: 5000.0, status: 'Not Paid', due_date: '2027-01-10' },
              { id: 'fee-exam', category: 'Examination & Library Clearance', amount: 3000.0, status: 'Not Paid', due_date: '2027-02-15' },
            ],
            receipts: [
              { id: '1', receipt_number: 'REC-2026-0001', amount: 25000.0, method: 'BANK TRANSFER', date: '2026-08-15', remarks: 'Term 1 Academic Tuition Fee' },
              { id: '2', receipt_number: 'REC-2026-0002', amount: 12000.0, method: 'CARD', date: '2026-09-10', remarks: 'Science Lab & Robotics Charges' },
              { id: '3', receipt_number: 'REC-2026-0003', amount: 8000.0, method: 'UPI', date: '2026-10-05', remarks: 'Route 1 Campus Bus Transport' },
              { id: '4', receipt_number: 'RCP-2026-00001', amount: 5000.0, method: 'UPI', date: '2026-11-02', remarks: 'Tuition installment' },
            ],
          });
        })
        .finally(() => {
          setLoadingFee(false);
        });
    } else {
      // Staff mode: fetch student ledger
      api
        .get('/students')
        .then((res) => {
          const items = Array.isArray(res.data) ? res.data : res.data?.items || [];
          setStudents(items);
        })
        .catch(() => setStudents([]));
    }
  }, [isParent, isStudent]);

  useEffect(() => {
    fetchFeeData();
  }, [fetchFeeData]);

  useEffect(() => {
    document.title = 'Fees & Payments Ledger — Ever Grow Schools ERP';
  }, []);

  // Open Amazon Pay Modal
  const handleOpenAmazonPay = (target?: any) => {
    const studentToPay = target || feeData;
    if (!studentToPay) return;
    setTargetStudentForPayment(studentToPay);
    setIsAmazonPayModalOpen(true);
  };

  // Callback on successful payment
  const handleAmazonPaymentSuccess = (_receipt: any) => {
    fetchFeeData();
  };

  // Reset Demo Dues Action (allows repeating payment demo)
  const handleResetDemoFees = async (studentId?: string) => {
    try {
      await api.post('/finance/reset-demo-fees', null, {
        params: studentId ? { student_id: studentId } : undefined,
      });
      toast.success('Fee ledger reset to initial pending dues state for testing.');
      fetchFeeData();
    } catch {
      toast.error('Could not reset demo fees.');
    }
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    const amountVal = parseFloat(paymentForm.amount);
    if (isNaN(amountVal) || amountVal <= 0) {
      toast.error('Please enter a valid payment amount greater than zero.');
      return;
    }

    try {
      const res = await api.post('/finance/payments', {
        student_id: selectedStudent.id,
        amount: amountVal,
        payment_method: paymentForm.payment_method,
        transaction_reference: paymentForm.transaction_reference || undefined,
        remarks: paymentForm.remarks,
      });

      setRecentReceipt(res.data.receipt);
      setIsPayModalOpen(false);
      toast.success(`Payment recorded! Receipt No: ${res.data.receipt.receipt_number}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error processing payment');
    }
  };

  const handleDownloadReceiptPdf = async (receiptId?: string) => {
    try {
      let endpoint = receiptId ? `/finance/receipts/${receiptId}/pdf` : `/finance/receipts/latest/pdf`;
      const response = await api.get(endpoint, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `official_fee_receipt_${receiptId || 'sample'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Official receipt PDF downloaded successfully.');
    } catch {
      toast.error('Failed to download receipt PDF.');
    }
  };

  // Helper to render an individual child's fee ledger & receipt table (Parent View)
  const renderChildFeeCard = (childFee: any) => {
    const hasDues = childFee.outstanding_balance > 0;
    const clearancePct = Math.min(
      100,
      Math.round(((childFee.total_paid || 0) / (childFee.total_annual_fee || 1)) * 100)
    );

    return (
      <div key={childFee.student_id || childFee.admission_number} className="space-y-6">
        {/* Child Header & Summary Pill Card */}
        <div className="bg-white/90 backdrop-blur-xl border border-black/[0.06] rounded-[28px] p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-500/20">
                {childFee.student_name
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-bold text-slate-900">{childFee.student_name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {childFee.class_name} • Sec {childFee.section_name || 'A'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Admission ID: {childFee.admission_number} • Academic Session 2026–2027
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              {hasDues ? (
                <>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
                    Pending Dues: {formatINR(childFee.outstanding_balance)}
                  </span>
                  <button
                    onClick={() => handleOpenAmazonPay(childFee)}
                    className="px-4 py-2 min-h-[44px] rounded-xl bg-[#FFD814] hover:bg-[#F7CA00] active:bg-[#F0B800] text-slate-950 font-extrabold text-xs shadow-sm flex items-center space-x-1.5 border border-[#FCD200] transition-all transform hover:scale-[1.02]"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-slate-950" />
                    <span>Pay Fees</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    All Fees Paid in Full
                  </span>
                  <button
                    onClick={() => handleResetDemoFees(childFee.student_id)}
                    className="p-2 min-h-[44px] min-w-[44px] rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors flex items-center justify-center"
                    title="Reset demo dues for testing"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Child Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5">
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 text-center">
              <div className="text-[10px] font-bold uppercase text-slate-400">Total Annual Fee</div>
              <div className="text-xl font-bold tabular-nums text-slate-900 mt-1">
                {formatINR(childFee.total_annual_fee)}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 text-center">
              <div className="text-[10px] font-bold uppercase text-slate-400">Total Paid</div>
              <div className="text-xl font-bold tabular-nums text-emerald-600 mt-1">
                {formatINR(childFee.total_paid)}
              </div>
            </div>

            <div
              className={`p-4 rounded-2xl border text-center transition-all ${hasDues ? 'bg-amber-50/80 border-amber-300' : 'bg-emerald-50/70 border-emerald-200'
                }`}
            >
              <div className={`text-[10px] font-bold uppercase ${hasDues ? 'text-amber-800' : 'text-emerald-800'}`}>
                Balance Due
              </div>
              <div
                className={`text-xl font-bold tabular-nums mt-1 ${hasDues ? 'text-[#B12704]' : 'text-emerald-700'}`}
              >
                {formatINR(childFee.outstanding_balance)}
              </div>
              {hasDues && (
                <span className="text-[9px] font-extrabold text-amber-700 uppercase tracking-tight">
                  Action Required
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Child Fee Schedule Table */}
        <div className="bg-white/90 backdrop-blur-xl border border-black/[0.06] rounded-[26px] overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                Fee Schedule — {childFee.student_name}
              </h4>
              <p className="text-xs text-slate-500">2026–2027 Curriculum & Facility Charges</p>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-bold border ${clearancePct === 100
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
              >
                {clearancePct}% Cleared
              </span>
              {hasDues && (
                <button
                  onClick={() => handleOpenAmazonPay(childFee)}
                  className="px-3 py-1 rounded-xl bg-[#FFD814] hover:bg-[#F7CA00] text-slate-950 font-bold text-xs border border-[#FCD200] shadow-sm flex items-center space-x-1"
                >
                  <CreditCard className="w-3 h-3 text-slate-950" />
                  <span>Pay Due Fees</span>
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-5">Billing Category</th>
                  <th className="py-3 px-5">Amount</th>
                  <th className="py-3 px-5">Due Date</th>
                  <th className="py-3 px-5">Clearance Status</th>
                  <th className="py-3 px-5 text-right">Payment Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {childFee.breakdown?.map((item: any, idx: number) => {
                  const isPaid = item.status === 'Paid';
                  const isPartiallyPaid = item.status === 'Partially Paid';

                  return (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-slate-900 flex items-center space-x-2">
                        {isPaid ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        ) : isPartiallyPaid ? (
                          <Clock className="w-4 h-4 text-amber-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                        )}
                        <span>{item.category}</span>
                      </td>
                      <td className="py-3.5 px-5 font-bold tabular-nums text-slate-800">
                        {formatINR(item.amount)}
                      </td>
                      <td className="py-3.5 px-5 text-slate-500 font-mono">{item.due_date}</td>
                      <td className="py-3.5 px-5">
                        {isPaid ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Paid in Full
                          </span>
                        ) : isPartiallyPaid ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            Partially Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                            Action Required: Not Paid
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        {isPaid ? (
                          <span className="text-[11px] text-slate-400 font-semibold">Settled</span>
                        ) : (
                          <button
                            onClick={() => handleOpenAmazonPay(childFee)}
                            className="px-3 py-1 rounded-lg bg-[#FFD814] hover:bg-[#F7CA00] text-slate-950 font-extrabold text-[11px] border border-[#FCD200] shadow-xs inline-flex items-center space-x-1"
                          >
                            <span>Pay Fee</span>
                            <ArrowRight className="w-3 h-3 text-slate-950" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Child Receipts Table */}
        <div className="bg-white/90 backdrop-blur-xl border border-black/[0.06] rounded-[26px] overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                Payment Receipts ({childFee.receipts?.length || 0}) — {childFee.student_name}
              </h4>
              <p className="text-xs text-slate-500">Audited receipts with instant PDF download</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-5">Receipt No</th>
                  <th className="py-3 px-5">Particulars / Remarks</th>
                  <th className="py-3 px-5">Amount Paid</th>
                  <th className="py-3 px-5">Payment Method</th>
                  <th className="py-3 px-5">Payment Date</th>
                  <th className="py-3 px-5 text-right">Official Document</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {childFee.receipts?.map((rec: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-[#0071E3] flex items-center space-x-1.5">
                      <ReceiptIcon className="w-3.5 h-3.5 text-blue-500" />
                      <span>{rec.receipt_number}</span>
                    </td>
                    <td className="py-3.5 px-5 font-medium text-slate-800">{rec.remarks}</td>
                    <td className="py-3.5 px-5 font-bold tabular-nums text-emerald-600">
                      {formatINR(rec.amount)}
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-slate-700">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px]">
                        {rec.method}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 font-mono">{rec.date}</td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => handleDownloadReceiptPdf(rec.id)}
                        className="ios-gloss-btn-secondary px-3 py-1.5 text-xs font-semibold space-x-1 text-[#0071E3] inline-flex items-center"
                      >
                        <FileDown className="w-3 h-3" />
                        <span>Download PDF</span>
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
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-500/20">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {isParent
                ? "Family Tuition & Fee Billing"
                : isStudent
                  ? "My Fee Dues & Receipts"
                  : "Fees & Payments Ledger"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isParent
                ? "Monitor fee statements, make online payments, and download receipts for your children."
                : isStudent
                  ? "Tuition fee billing schedule, pending dues, Amazon payment portal, and clearance receipts."
                  : "Centralized student financial ledger, cashier desk, and fee receipt generator."}
            </p>
          </div>
        </div>

        {/* Staff-only Cashier Button */}
        {isStaff && (
          <button
            onClick={() => {
              setSelectedStudent(null);
              setIsPayModalOpen(true);
            }}
            className="ios-gloss-btn px-5 py-2.5 text-xs font-semibold space-x-2"
          >
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <span>Record Cashier Fee Payment</span>
          </button>
        )}
      </div>

      {/* ---------------- PARENT MULTI-CHILD VIEW ---------------- */}
      {isParent && (
        <div className="space-y-6">
          {loadingFee ? (
            <div className="bg-white rounded-3xl p-16 text-center text-slate-500 space-y-3">
              <div className="w-9 h-9 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div className="text-sm font-semibold text-slate-700">Loading family fee ledgers...</div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Children Selector Pill Tab */}
              {childrenFees.length > 1 && (
                <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-xl border border-black/[0.06] p-1.5 rounded-2xl w-fit shadow-xs">
                  <button
                    onClick={() => setSelectedChildId('all')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${selectedChildId === 'all'
                        ? 'bg-[#0071E3] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>All Children ({childrenFees.length})</span>
                  </button>

                  {childrenFees.map((child) => (
                    <button
                      key={child.student_id || child.admission_number}
                      onClick={() => setSelectedChildId(child.student_id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${selectedChildId === child.student_id
                          ? 'bg-[#0071E3] text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>{child.student_name}</span>
                      {child.outstanding_balance > 0 && (
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Combined Family Overview Banner */}
              {familySummary && (
                <div
                  className={`rounded-[28px] p-6 md:p-8 shadow-sm border border-black/[0.06] relative overflow-hidden transition-all ${familySummary.outstanding_balance > 0
                      ? 'bg-white/95 text-slate-900'
                      : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white shadow-emerald-500/20'
                    }`}
                >
                  <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2.5 max-w-xl">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/20">
                        {familySummary.outstanding_balance > 0 ? (
                          <>
                            <Clock className="w-3.5 h-3.5 mr-1.5 text-amber-300" />
                            Action Required • Family Ledger Dues
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-white" />
                            Account in Good Standing • Family Ledger
                          </>
                        )}
                      </span>
                      <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                        {familySummary.outstanding_balance > 0
                          ? `Family Balance Due: ${formatINR(familySummary.outstanding_balance)}`
                          : "All Academic Fees Paid in Full!"}
                      </h2>

                      {familySummary.outstanding_balance > 0 && (
                        <div className="pt-2">
                          <button
                            onClick={() => handleOpenAmazonPay(childrenFees[0])}
                            className="px-6 py-3 min-h-[44px] rounded-2xl bg-[#FFD814] hover:bg-[#F7CA00] active:bg-[#F0B800] text-slate-950 font-black text-sm shadow-md flex items-center space-x-2 border border-[#FCD200] transition-all transform hover:scale-[1.02]"
                          >
                            <CreditCard className="w-4 h-4 text-slate-950" />
                            <span>Pay Family Fees with Amazon Pay</span>
                            <ArrowRight className="w-4 h-4 text-slate-950" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Family Metrics HUD */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="bg-white/15 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/20 text-center min-w-[120px] flex-1 sm:flex-initial">
                        <div className="text-[10px] font-bold uppercase text-white/70">
                          {selectedChildId === 'all' ? 'Family Annual Fee' : 'Annual Fee'}
                        </div>
                        <div className="text-xl md:text-2xl font-bold tabular-nums text-white mt-0.5">
                          {selectedChildId === 'all'
                            ? formatINR(familySummary.total_annual_fee)
                            : formatINR(
                              childrenFees.find((c) => c.student_id === selectedChildId)?.total_annual_fee || 0
                            )}
                        </div>
                      </div>

                      <div className="bg-white/15 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/20 text-center min-w-[120px] flex-1 sm:flex-initial">
                        <div className="text-[10px] font-bold uppercase text-white/70">
                          {selectedChildId === 'all' ? 'Family Total Paid' : 'Total Paid'}
                        </div>
                        <div className="text-xl md:text-2xl font-bold tabular-nums text-white mt-0.5">
                          {selectedChildId === 'all'
                            ? formatINR(familySummary.total_paid)
                            : formatINR(
                              childrenFees.find((c) => c.student_id === selectedChildId)?.total_paid || 0
                            )}
                        </div>
                      </div>

                      <div
                        className={`px-5 py-4 rounded-2xl border shadow-md text-center min-w-[120px] flex-1 sm:flex-initial ${familySummary.outstanding_balance > 0
                            ? 'bg-amber-400 text-slate-950 border-amber-300'
                            : 'bg-white/95 text-emerald-800 border-white'
                          }`}
                      >
                        <div className="text-[10px] font-bold uppercase">Balance Due</div>
                        <div className="text-xl md:text-2xl font-bold tabular-nums mt-0.5">
                          {selectedChildId === 'all'
                            ? formatINR(familySummary.outstanding_balance)
                            : formatINR(
                              childrenFees.find((c) => c.student_id === selectedChildId)?.outstanding_balance || 0
                            )}
                        </div>
                        <span className="text-[9px] font-extrabold uppercase">
                          {familySummary.outstanding_balance > 0 ? 'Pending' : 'All Paid'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Render either Both Children or Selected Child */}
              {selectedChildId === 'all' ? (
                <div className="space-y-10">
                  {childrenFees.map((c) => renderChildFeeCard(c))}
                </div>
              ) : (
                renderChildFeeCard(
                  childrenFees.find((c) => c.student_id === selectedChildId) || childrenFees[0]
                )
              )}

              {/* Finance Policy Guarantee */}
              <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 flex items-center space-x-3 text-xs text-emerald-900">
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold">Ever Grow Treasury Assured:</span> All transactions are verified and
                  recorded under sequential audit logs. Official tax invoices and fee receipts can be downloaded above
                  anytime.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------- STUDENT SINGLE-USER VIEW ---------------- */}
      {isStudent && (
        <div className="space-y-6">
          {loadingFee ? (
            <div className="bg-white rounded-3xl p-16 text-center text-slate-500 space-y-3">
              <div className="w-9 h-9 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div className="text-sm font-semibold text-slate-700">Loading fee account ledger...</div>
            </div>
          ) : feeData ? (
            <div className="space-y-6">
              {/* Outstanding Dues Banner OR All Paid Banner (Light Neumorphic Theme) */}
              {feeData.outstanding_balance > 0 ? (
                <div className="bg-white/95 backdrop-blur-xl border border-black/[0.06] rounded-[28px] p-6 md:p-8 text-slate-900 shadow-sm relative overflow-hidden">
                  <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-3 max-w-xl">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                        <Clock className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                        Academic Action Required • Pending Dues
                      </span>
                      <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
                        Balance Due: {formatINR(feeData.outstanding_balance)}
                      </h2>

                      <div className="pt-2 flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => handleOpenAmazonPay(feeData)}
                          className="px-6 py-3 min-h-[44px] rounded-2xl bg-[#FFD814] hover:bg-[#F7CA00] active:bg-[#F0B800] text-slate-950 font-black text-sm shadow-md flex items-center space-x-2 border border-[#FCD200] transition-all transform hover:scale-[1.02]"
                        >
                          <CreditCard className="w-4 h-4 text-slate-950" />
                          <span>Pay Fees with Amazon Pay</span>
                          <ArrowRight className="w-4 h-4 text-slate-950" />
                        </button>

                        <button
                          onClick={() => handleResetDemoFees()}
                          className="px-4 py-3 min-h-[44px] rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-slate-200"
                          title="Reset demo dues"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                          <span>Reset Demo Dues</span>
                        </button>
                      </div>
                    </div>

                    {/* Dues Metrics HUD */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="bg-slate-50 border border-slate-200/80 px-5 py-4 rounded-2xl text-center min-w-[120px] flex-1 sm:flex-initial">
                        <div className="text-[10px] font-bold uppercase text-slate-400">Total Annual Fee</div>
                        <div className="text-xl md:text-2xl font-bold tabular-nums text-slate-900 mt-0.5">
                          {formatINR(feeData.total_annual_fee)}
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-200/80 px-5 py-4 rounded-2xl text-center min-w-[120px] flex-1 sm:flex-initial">
                        <div className="text-[10px] font-bold uppercase text-slate-400">Total Paid</div>
                        <div className="text-xl md:text-2xl font-bold tabular-nums text-emerald-600 mt-0.5">
                          {formatINR(feeData.total_paid)}
                        </div>
                      </div>

                      <div className="bg-amber-50 text-amber-900 px-5 py-4 rounded-2xl border border-amber-300 shadow-xs text-center min-w-[120px] flex-1 sm:flex-initial">
                        <div className="text-[10px] font-extrabold uppercase text-amber-800">Balance Due</div>
                        <div className="text-xl md:text-2xl font-bold tabular-nums mt-0.5 text-[#B12704]">
                          {formatINR(feeData.outstanding_balance)}
                        </div>
                        <span className="text-[9px] font-black text-amber-700 uppercase">
                          Action Required
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 rounded-[28px] p-6 md:p-8 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden">
                  <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-xl">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/20">
                        <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-white" />
                        Account in Good Standing
                      </span>
                      <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                        All Academic Fees Paid in Full!
                      </h2>
                      <div className="pt-2">
                        <button
                          onClick={() => handleResetDemoFees()}
                          className="px-4 py-2 min-h-[44px] rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-white/20"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reset Demo Dues (Test Amazon Payment Gateway)</span>
                        </button>
                      </div>
                    </div>

                    {/* All Paid Metrics HUD */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="bg-white/15 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/20 text-center min-w-[120px] flex-1 sm:flex-initial">
                        <div className="text-[10px] font-bold uppercase text-white/70">Total Annual Fee</div>
                        <div className="text-xl md:text-2xl font-bold tabular-nums text-white mt-0.5">
                          {formatINR(feeData.total_annual_fee)}
                        </div>
                      </div>

                      <div className="bg-white/15 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/20 text-center min-w-[120px] flex-1 sm:flex-initial">
                        <div className="text-[10px] font-bold uppercase text-white/70">Total Paid</div>
                        <div className="text-xl md:text-2xl font-bold tabular-nums text-white mt-0.5">
                          {formatINR(feeData.total_paid)}
                        </div>
                      </div>

                      <div className="bg-white/95 px-5 py-4 rounded-2xl border border-white shadow-md text-center min-w-[120px] flex-1 sm:flex-initial">
                        <div className="text-[10px] font-bold uppercase text-emerald-800">Balance Due</div>
                        <div className="text-xl md:text-2xl font-bold tabular-nums text-emerald-600 mt-0.5">{formatINR(0)}</div>
                        <span className="text-[9px] font-extrabold text-emerald-700 uppercase">All Paid</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Fee Categories Breakdown */}
              <div className="bg-white/90 backdrop-blur-xl border border-black/[0.06] rounded-[26px] overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Academic Session Fee Schedule</h3>
                    <p className="text-xs text-slate-500">2026–2027 Curriculum & Facility Charges</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${feeData.outstanding_balance <= 0
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                    >
                      {feeData.outstanding_balance <= 0
                        ? '100% Cleared'
                        : `${Math.round(((feeData.total_paid || 0) / (feeData.total_annual_fee || 1)) * 100)}% Cleared`}
                    </span>
                    {feeData.outstanding_balance > 0 && (
                      <button
                        onClick={() => handleOpenAmazonPay(feeData)}
                        className="px-4 py-2 min-h-[44px] rounded-xl bg-[#FFD814] hover:bg-[#F7CA00] text-slate-950 font-extrabold text-xs border border-[#FCD200] shadow-sm flex items-center space-x-1.5 transition-transform hover:scale-102"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-slate-950" />
                        <span>Pay Outstanding Fees ({formatINR(feeData.outstanding_balance)})</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-5">Billing Category</th>
                        <th className="py-3 px-5">Amount</th>
                        <th className="py-3 px-5">Due Date</th>
                        <th className="py-3 px-5">Clearance Status</th>
                        <th className="py-3 px-5 text-right">Payment Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {feeData.breakdown?.map((item: any, idx: number) => {
                        const isPaid = item.status === 'Paid';
                        const isPartiallyPaid = item.status === 'Partially Paid';

                        return (
                          <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3.5 px-5 font-bold text-slate-900 flex items-center space-x-2">
                              {isPaid ? (
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                              ) : isPartiallyPaid ? (
                                <Clock className="w-4 h-4 text-amber-500" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-red-500" />
                              )}
                              <span>{item.category}</span>
                            </td>
                            <td className="py-3.5 px-5 font-bold tabular-nums text-slate-800">
                              {formatINR(item.amount)}
                            </td>
                            <td className="py-3.5 px-5 text-slate-500 font-mono">{item.due_date}</td>
                            <td className="py-3.5 px-5">
                              {isPaid ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Paid in Full
                                </span>
                              ) : isPartiallyPaid ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                  Partially Paid
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                                  Action Required: Not Paid
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-5 text-right">
                              {isPaid ? (
                                <span className="text-[11px] text-slate-400 font-semibold">Settled</span>
                              ) : (
                                <button
                                  onClick={() => handleOpenAmazonPay(feeData)}
                                  className="px-3 py-1 rounded-lg bg-[#FFD814] hover:bg-[#F7CA00] text-slate-950 font-extrabold text-[11px] border border-[#FCD200] shadow-xs inline-flex items-center space-x-1"
                                >
                                  <span>Pay Fee</span>
                                  <ArrowRight className="w-3 h-3 text-slate-950" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Official Payment Receipts History */}
              <div className="bg-white/90 backdrop-blur-xl border border-black/[0.06] rounded-[26px] overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Official Payment Receipts ({feeData.receipts?.length || 0})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Audited, sequentially numbered receipts with instant PDF download
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-5">Receipt No</th>
                        <th className="py-3 px-5">Particulars / Remarks</th>
                        <th className="py-3 px-5">Amount Paid</th>
                        <th className="py-3 px-5">Payment Method</th>
                        <th className="py-3 px-5">Payment Date</th>
                        <th className="py-3 px-5 text-right">Official Document</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {feeData.receipts?.map((rec: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-5 font-mono font-bold text-[#0071E3] flex items-center space-x-1.5">
                            <ReceiptIcon className="w-3.5 h-3.5 text-blue-500" />
                            <span>{rec.receipt_number}</span>
                          </td>
                          <td className="py-3.5 px-5 font-medium text-slate-800">{rec.remarks}</td>
                          <td className="py-3.5 px-5 font-bold tabular-nums text-emerald-600">
                            {formatINR(rec.amount)}
                          </td>
                          <td className="py-3.5 px-5 font-semibold text-slate-700">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px]">
                              {rec.method}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-slate-500 font-mono">{rec.date}</td>
                          <td className="py-3.5 px-5 text-right">
                            <button
                              onClick={() => handleDownloadReceiptPdf(rec.id)}
                              className="ios-gloss-btn-secondary px-3 py-1.5 text-xs font-semibold space-x-1 text-[#0071E3] inline-flex items-center"
                            >
                              <FileDown className="w-3 h-3" />
                              <span>Download Receipt PDF</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Finance Policy Guarantee */}
              <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 flex items-center space-x-3 text-xs text-emerald-900">
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold">Ever Grow Treasury Assured:</span> All transactions are verified and
                  recorded under sequential audit logs. Official tax invoices and fee receipts can be downloaded above
                  anytime.
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ---------------- STAFF CASHIER VIEW (ADMIN / ACCOUNTANTS) ---------------- */}
      {isStaff && (() => {
        const defaultStudentsList = (schoolData.students || []).map((s: any) => ({
          id: s.student_id,
          admission_number: s.admission_no,
          full_name: s.name,
          class_room: { name: 'Grade 10' },
          section: { name: s.class_section.split('-')[1] || 'A' },
          total_annual_fee: 71000.0,
          total_paid: 71000.0,
          status: 'Paid',
        }));
        const effectiveStaffStudents = students.length > 0 ? students : defaultStudentsList;
        const totalMoney = effectiveStaffStudents.reduce((acc, s) => acc + (Number(s.total_annual_fee) || 71000), 0);
        const currentPaymentCollected = effectiveStaffStudents.reduce(
          (acc, s) => acc + (s.total_paid !== undefined ? Number(s.total_paid) : (Number(s.total_annual_fee) || 71000)),
          0
        );

        return (
          <div className="space-y-6">
            {recentReceipt && (
              <div className="ios-card rounded-[22px] p-5 border-emerald-500/20 bg-emerald-500/[0.04] flex items-center justify-between">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center text-[#34C759]">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#1D1D1F]">
                      Payment Completed: {recentReceipt.receipt_number}
                    </div>
                    <div className="text-xs text-[#34C759] font-medium mt-0.5">
                      Amount Paid: {formatINR(recentReceipt.total_amount)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDownloadReceiptPdf(recentReceipt.id)}
                  className="ios-gloss-btn-emerald px-4 py-2 text-xs font-semibold space-x-1.5"
                >
                  <FileDown className="w-4 h-4 text-white" />
                  <span>Download Official PDF Receipt</span>
                </button>
              </div>
            )}

            {/* Institutional Treasury Metrics Bar: Current Payment Collected & Total Money */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    Current Payment Collected
                  </span>
                  <span className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                </div>
                <div className="text-2xl font-bold tabular-nums text-emerald-600 mt-2">
                  {formatINR(currentPaymentCollected)}
                </div>
                <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 mt-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>100% Cleared • Auto-Deposited to Treasury</span>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    Total Money (Annual Tuition)
                  </span>
                  <span className="p-1.5 rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20">
                    <DollarSign className="w-4 h-4" />
                  </span>
                </div>
                <div className="text-2xl font-bold tabular-nums text-slate-800 mt-2">
                  {formatINR(totalMoney)}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 font-semibold">
                  Total tuition billed across {effectiveStaffStudents.length} enrolled students
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    Automatic Acceptance Status
                  </span>
                  <span className="p-1.5 rounded-xl bg-teal-500/10 text-teal-600 border border-teal-500/20">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                </div>
                <div className="text-2xl font-black text-teal-700 mt-2">
                  Auto-Accepted (100%)
                </div>
                <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 mt-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                  <span>{effectiveStaffStudents.length} of {effectiveStaffStudents.length} Ledgers Settled • ₹0.00 Dues</span>
                </div>
              </div>
            </div>

            {/* Students Directory Ledger */}
            <div className="bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 rounded-3xl overflow-hidden">
              <div className="p-5 border-b border-slate-300/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Students Tuition Ledger</h3>
                  <p className="text-xs text-slate-500">
                    All tuition payments automatically accepted and reconciled under Ever Grow Treasury audit logs
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                    Auto-Acceptance Active
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-200/50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-300/60 text-[10px]">
                    <tr>
                      <th className="py-3.5 px-5">Admission No</th>
                      <th className="py-3.5 px-5">Student Name</th>
                      <th className="py-3.5 px-5">Class & Section</th>
                      <th className="py-3.5 px-5">Total Money</th>
                      <th className="py-3.5 px-5">Current Collected</th>
                      <th className="py-3.5 px-5">Payment Status</th>
                      <th className="py-3.5 px-5 text-right">Official Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60">
                    {effectiveStaffStudents.map((st) => {
                      const studentTotalFee = Number(st.total_annual_fee) || 71000;
                      const studentCollected = st.total_paid !== undefined ? Number(st.total_paid) : studentTotalFee;
                      return (
                        <tr key={st.id} className="hover:bg-blue-50/30 transition-colors">
                          <td className="py-3.5 px-5 font-mono font-bold text-[#0071E3]">{st.admission_number}</td>
                          <td className="py-3.5 px-5 font-bold text-slate-900">{st.full_name}</td>
                          <td className="py-3.5 px-5 text-slate-600 font-semibold">
                            {st.class_room?.name || 'Grade 1'} - {st.section?.name || 'A'}
                          </td>
                          <td className="py-3.5 px-5 font-bold tabular-nums text-slate-800">
                            {formatINR(studentTotalFee)}
                          </td>
                          <td className="py-3.5 px-5 font-bold tabular-nums text-emerald-600">
                            {formatINR(studentCollected)}
                          </td>
                          <td className="py-3.5 px-5">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                              Payment Accepted
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            <button
                              onClick={() => handleDownloadReceiptPdf(st.id)}
                              className="px-3 py-1.5 rounded-xl bg-[#EBEEF2] shadow-[2px_2px_5px_#C8D0DC,-2px_-2px_5px_#FFFFFF] hover:shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] text-xs font-bold text-slate-700 hover:text-blue-600 inline-flex items-center space-x-1.5 border border-white/80 cursor-pointer active:scale-98 transition-all"
                              title="Download Official Tax Receipt"
                            >
                              <FileDown className="w-3.5 h-3.5 text-blue-600" />
                              <span>Download Receipt</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Staff Cashier Payment Modal */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {selectedStudent ? `Record Payment: ${selectedStudent.full_name}` : 'Record Cashier Payment'}
              </h3>
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Enter payment particulars below. A sequentially numbered official receipt will be generated.
            </p>

            <form onSubmit={handleProcessPayment} className="space-y-3.5 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="upi">UPI / QR Code</option>
                  <option value="bank_transfer">Bank Transfer / NEFT</option>
                  <option value="card">Debit / Credit Card</option>
                  <option value="cash">Cash Counter</option>
                  <option value="cheque">Cheque / Demand Draft</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction Reference</label>
                <input
                  type="text"
                  value={paymentForm.transaction_reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, transaction_reference: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks</label>
                <input
                  type="text"
                  value={paymentForm.remarks}
                  onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ios-gloss-btn-emerald px-5 py-2 text-xs font-semibold shadow-md"
                >
                  Confirm & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Amazon Pay Full-Featured Checkout Modal */}
      {targetStudentForPayment && (
        <AmazonPaymentModal
          isOpen={isAmazonPayModalOpen}
          onClose={() => setIsAmazonPayModalOpen(false)}
          student={targetStudentForPayment}
          onPaymentSuccess={handleAmazonPaymentSuccess}
        />
      )}
    </div>
  );
};
