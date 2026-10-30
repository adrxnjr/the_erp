import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { DollarSign, FileDown, CheckCircle } from 'lucide-react';

export const FeesPage: React.FC = () => {
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

  const fetchData = async () => {
    try {
      const [stdRes] = await Promise.all([
        api.get('/students'),
        api.get('/academic/years'),
      ]);
      const studentItems = Array.isArray(stdRes.data)
        ? stdRes.data
        : stdRes.data?.items || [];
      setStudents(studentItems);
    } catch (e) {
      console.error(e);
      setStudents([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    try {
      const res = await api.post('/finance/payments', {
        student_id: selectedStudent.id,
        amount: parseFloat(paymentForm.amount),
        payment_method: paymentForm.payment_method,
        transaction_reference: paymentForm.transaction_reference || undefined,
        remarks: paymentForm.remarks,
      });

      setRecentReceipt(res.data.receipt);
      setIsPayModalOpen(false);
      alert(`Payment recorded! Receipt No: ${res.data.receipt.receipt_number}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error processing payment');
    }
  };

  const handleDownloadReceiptPdf = async (receiptId: string) => {
    try {
      const response = await api.get(`/finance/receipts/${receiptId}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt_${receiptId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      alert('Error downloading receipt PDF');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">Fee Cashier & Receipts</h1>
          <p className="text-sm text-[#86868B]">
            Process payments with atomic sequential receipt numbers and PDF generation.
          </p>
        </div>
      </div>

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
                Amount Paid: ${recentReceipt.total_amount}
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

      {/* Student Ledger Quick Actions - iOS Table */}
      <div className="ios-card rounded-[22px] overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/[0.02] text-[#86868B] text-[11px] uppercase font-semibold border-b border-black/[0.05]">
            <tr>
              <th className="px-6 py-4">Admission No</th>
              <th className="px-6 py-4">Student Name</th>
              <th className="px-6 py-4 text-right">Cashier Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.04]">
            {(Array.isArray(students) ? students : []).map((s) => (
              <tr key={s.id} className="hover:bg-black/[0.02] transition-colors">
                <td className="px-6 py-4 font-mono font-semibold text-[#0071E3]">
                  {s.admission_number}
                </td>
                <td className="px-6 py-4 font-semibold text-[#1D1D1F]">{s.full_name}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => {
                      setSelectedStudent(s);
                      setPaymentForm((prev) => ({
                        ...prev,
                        transaction_reference: `REF-${Date.now().toString().slice(-6)}`,
                      }));
                      setIsPayModalOpen(true);
                    }}
                    className="ios-gloss-btn px-4 py-1.5 text-xs font-semibold space-x-1.5"
                  >
                    <DollarSign className="w-3.5 h-3.5 text-white" />
                    <span>Collect Payment</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Collect Payment Modal - Apple iOS Modal Style */}
      {isPayModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/25 backdrop-blur-md flex items-center justify-center p-4">
          <div className="ios-modal rounded-[30px] max-w-md w-full p-7 shadow-2xl border border-white/80 space-y-4">
            <h2 className="text-xl font-bold text-[#1D1D1F] tracking-tight">
              Collect Fee: {selectedStudent.full_name}
            </h2>
            <form onSubmit={handleProcessPayment} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-[#86868B] mb-1">
                  Payment Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-[14px] text-sm focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:bg-white transition-all text-[#1D1D1F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#86868B] mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentForm.payment_method}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, payment_method: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-[14px] text-sm focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:bg-white transition-all text-[#1D1D1F]"
                >
                  <option value="upi">UPI / Instant Transfer</option>
                  <option value="bank_transfer">Bank Wire</option>
                  <option value="cash">Cash Register</option>
                  <option value="cheque">Cheque</option>
                  <option value="card">Credit / Debit Card</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#86868B] mb-1">
                  Transaction Reference
                </label>
                <input
                  type="text"
                  value={paymentForm.transaction_reference}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, transaction_reference: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-[14px] text-sm focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:bg-white transition-all text-[#1D1D1F]"
                />
              </div>

              <div className="flex justify-end space-x-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="ios-gloss-btn-secondary px-5 py-2 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ios-gloss-btn px-6 py-2 text-xs font-semibold"
                >
                  Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
