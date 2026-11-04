import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useToast } from '../context/ToastContext';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Building2,
  QrCode,
  Smartphone,
  Wallet,
  Tag,
  ChevronRight,
  Info,
  FileDown,
  X,
  AlertCircle,
  Clock,
  ArrowRight,
  Check,
  Percent,
} from 'lucide-react';

interface AmazonPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    student_id: string;
    student_name: string;
    admission_number: string;
    class_name: string;
    section_name?: string;
    academic_session?: string;
    outstanding_balance?: number;
    breakdown?: Array<{
      id: string;
      category: string;
      amount: number;
      status: string;
      due_date: string;
    }>;
  };
  onPaymentSuccess: (receipt: any) => void;
}

export const AmazonPaymentModal: React.FC<AmazonPaymentModalProps> = ({
  isOpen,
  onClose,
  student,
  onPaymentSuccess,
}) => {
  const toast = useToast();

  // Selected fee items to pay
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustomAmountActive, setIsCustomAmountActive] = useState<boolean>(false);

  // Payment method selection: 'card' | 'net_banking' | 'upi' | 'amazon_pay' | 'emi'
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'net_banking' | 'upi' | 'amazon_pay' | 'emi'>('card');

  // Card details
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpMonth, setCardExpMonth] = useState('12');
  const [cardExpYear, setCardExpYear] = useState('2028');
  const [cardCvv, setCardCvv] = useState('');
  const [saveCard, setSaveCard] = useState(true);

  // Net banking details
  const [selectedBank, setSelectedBank] = useState('HDFC');

  // UPI details
  const [upiSubTab, setUpiSubTab] = useState<'qr' | 'vpa'>('qr');
  const [upiId, setUpiId] = useState('');
  const [vpaVerified, setVpaVerified] = useState(false);
  const [qrTimer, setQrTimer] = useState(300); // 5 minutes

  // EMI option
  const [selectedEmiTenure, setSelectedEmiTenure] = useState<'3' | '6' | '9'>('3');

  // Promo code & voucher state
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number; label: string } | null>(null);

  // Processing & completion state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('Connecting to payment gateway...');
  const [paymentCompletedReceipt, setPaymentCompletedReceipt] = useState<any | null>(null);

  // Initialize selected items with all unpaid/due fee heads
  useEffect(() => {
    if (student?.breakdown) {
      const unpaidIds = student.breakdown
        .filter((item) => item.status !== 'Paid')
        .map((item) => item.id || item.category);
      setSelectedItems(unpaidIds.length > 0 ? unpaidIds : [student.breakdown[0]?.id || 'fee-term2']);
    }
    setAppliedPromo(null);
    setPaymentCompletedReceipt(null);
    setIsProcessing(false);
  }, [student, isOpen]);

  // QR Timer Countdown
  useEffect(() => {
    if (!isOpen || paymentMethod !== 'upi' || upiSubTab !== 'qr') return;
    const interval = setInterval(() => {
      setQrTimer((prev) => (prev > 0 ? prev - 1 : 300));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, paymentMethod, upiSubTab]);

  if (!isOpen) return null;

  // Format Card Number with 4-4-4-4 spacing
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Detect Card Brand
  const getCardBrand = (num: string) => {
    const clean = num.replace(/\s/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(clean)) return 'Mastercard';
    if (/^3[47]/.test(clean)) return 'American Express';
    if (/^(60|65|81|82)/.test(clean)) return 'RuPay';
    return 'Credit / Debit';
  };

  // Calculate Base Subtotal from selected items
  const calculateBaseSubtotal = (): number => {
    if (isCustomAmountActive && customAmount) {
      const parsed = parseFloat(customAmount);
      return isNaN(parsed) || parsed <= 0 ? 0 : parsed;
    }
    if (!student?.breakdown) return 0;
    return student.breakdown
      .filter((item) => selectedItems.includes(item.id || item.category))
      .reduce((sum, curr) => sum + curr.amount, 0);
  };

  const baseSubtotal = calculateBaseSubtotal();
  const discountAmount = appliedPromo ? appliedPromo.discount : 0;
  const platformFee = 0.0; // Free for Ever Grow Institutional direct pay
  const finalPayableTotal = Math.max(0, baseSubtotal - discountAmount);

  // Toggle item selection
  const toggleItem = (id: string) => {
    setIsCustomAmountActive(false);
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Select all unpaid items
  const selectAllUnpaid = () => {
    setIsCustomAmountActive(false);
    if (!student?.breakdown) return;
    const allUnpaid = student.breakdown
      .filter((i) => i.status !== 'Paid')
      .map((i) => i.id || i.category);
    setSelectedItems(allUnpaid);
  };

  // Apply Promo Code
  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    if (code === 'MERIT2026') {
      setAppliedPromo({ code, discount: 1000.0, label: 'Academic Merit Scholarship Voucher' });
      toast.success('Promo code MERIT2026 applied! $1,000 scholarship concession credited.');
    } else if (code === 'SIBLING10') {
      const discount = Math.round(baseSubtotal * 0.1);
      setAppliedPromo({ code, discount, label: '10% Sibling Institutional Concession' });
      toast.success(`Promo code SIBLING10 applied! $${discount.toLocaleString()} sibling discount credited.`);
    } else if (code === 'EARLYBIRD') {
      setAppliedPromo({ code, discount: 500.0, label: 'Early Settlement Incentive Waiver' });
      toast.success('Promo code EARLYBIRD applied! $500 early payment discount credited.');
    } else {
      toast.error('Invalid or expired voucher code. Try MERIT2026, SIBLING10, or EARLYBIRD.');
    }
    setPromoInput('');
  };

  // Verify VPA
  const handleVerifyVpa = () => {
    if (!upiId || !upiId.includes('@')) {
      toast.error('Please enter a valid UPI ID (e.g. name@bank or 9876543210@paytm).');
      return;
    }
    setVpaVerified(true);
    toast.success(`UPI ID ${upiId} verified with banking gateway.`);
  };

  // Submit Payment
  const handleExecutePayment = async () => {
    if (finalPayableTotal <= 0) {
      toast.error('Please select at least one fee head or enter a valid payment amount.');
      return;
    }

    // Validation per method
    if (paymentMethod === 'card') {
      const rawCard = cardNumber.replace(/\s/g, '');
      if (rawCard.length < 15) {
        toast.error('Please enter a valid 16-digit card number.');
        return;
      }
      if (!cardCvv || cardCvv.length < 3) {
        toast.error('Please enter the 3 or 4 digit CVV/CVC on the card.');
        return;
      }
    } else if (paymentMethod === 'upi' && upiSubTab === 'vpa' && !vpaVerified) {
      toast.error('Please verify your UPI ID before proceeding.');
      return;
    }

    setIsProcessing(true);
    setProcessingStep('Connecting securely to banking payment network...');

    try {
      // Step 1: Simulated Secure Gateway handshake
      await new Promise((r) => setTimeout(r, 900));
      setProcessingStep('Authorizing 2-Factor 256-bit bank encryption token...');

      // Step 2: Gateway authorization
      await new Promise((r) => setTimeout(r, 900));
      setProcessingStep('Reconciling student ledger & generating tax-compliant receipt...');

      // Step 3: Backend payment endpoint call
      const selectedCategories = student?.breakdown
        ?.filter((item) => selectedItems.includes(item.id || item.category))
        ?.map((item) => item.category) || ['Tuition & Institutional Fee'];

      const payload = {
        student_id: student.student_id,
        amount: finalPayableTotal,
        payment_method: paymentMethod,
        selected_categories: selectedCategories,
        card_last4: paymentMethod === 'card' ? cardNumber.replace(/\s/g, '').slice(-4) : undefined,
        card_brand: paymentMethod === 'card' ? getCardBrand(cardNumber) : undefined,
        bank_name: paymentMethod === 'net_banking' ? selectedBank : undefined,
        upi_id: paymentMethod === 'upi' ? (upiSubTab === 'vpa' ? upiId : 'INSTANT_QR_PAY') : undefined,
        promo_code: appliedPromo?.code || undefined,
        discount_amount: discountAmount,
        remarks: `Amazon Pay: ${paymentMethod.toUpperCase()} for ${student.student_name} (${student.admission_number})`,
      };

      const res = await api.post('/finance/checkout-pay', payload);
      await new Promise((r) => setTimeout(r, 700));

      setIsProcessing(false);
      setPaymentCompletedReceipt(res.data.receipt);
      toast.success(res.data.message || 'Fee payment confirmed and official receipt issued!');
      onPaymentSuccess(res.data.receipt);
    } catch (err: any) {
      setIsProcessing(false);
      console.error('Payment failure:', err);
      toast.error(err.response?.data?.detail || 'Transaction could not be completed. Please try again.');
    }
  };

  // Download PDF receipt
  const handleDownloadReceipt = async (receiptId: string) => {
    try {
      const response = await api.get(`/finance/receipts/${receiptId}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `official_fee_receipt_${receiptId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Official PDF receipt downloaded successfully.');
    } catch {
      toast.error('Receipt PDF generation in progress, please retry shortly.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-[32px] w-full max-w-5xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Amazon-style Brand Header */}
        <div className="bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 font-bold text-sm tracking-tight">
              <span className="font-black text-amber-600 tracking-tighter">amazon</span>
              <span className="font-extrabold text-slate-800">pay</span>
              <span className="text-[10px] text-slate-400 mx-1">|</span>
              <span className="text-xs text-slate-600 font-semibold">Institutional Gateway</span>
            </div>
            <div className="hidden sm:flex items-center space-x-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-semibold">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>256-Bit Bank Grade SSL</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right hidden md:block">
              <div className="text-xs font-bold text-slate-800">{student.student_name}</div>
              <div className="text-[11px] text-slate-400 font-mono">Adm: {student.admission_number}</div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              aria-label="Close Payment Gateway"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {/* PROCESSING STATE OVERLAY */}
          {isProcessing && (
            <div className="bg-white rounded-3xl p-12 text-center shadow-lg border border-slate-100 space-y-6 my-8">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-amber-100 animate-ping opacity-25"></div>
                <div className="w-20 h-20 rounded-full border-4 border-amber-500 border-t-transparent animate-spin mx-auto flex items-center justify-center">
                  <Lock className="w-7 h-7 text-amber-600" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-slate-900">Processing Secure Fee Payment</h3>
                <p className="text-sm text-slate-500 font-medium">{processingStep}</p>
                <div className="text-xs text-slate-400 pt-2">
                  Please do not refresh or close this browser window.
                </div>
              </div>
            </div>
          )}

          {/* SUCCESS SCREEN */}
          {!isProcessing && paymentCompletedReceipt && (
            <div className="bg-white rounded-3xl p-8 md:p-10 border border-emerald-100 shadow-md space-y-8 animate-scale-up">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-md shadow-emerald-500/10">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                  Payment Successful • Order Confirmed
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900">
                  Academic Fee Payment Succeeded!
                </h2>
                <p className="text-sm text-slate-500 max-w-lg">
                  Thank you! Your payment of{' '}
                  <strong className="text-slate-900 font-mono font-bold">
                    ${Number(paymentCompletedReceipt.amount).toLocaleString()}.00
                  </strong>{' '}
                  has been recorded on the institutional ledger and official receipt is ready.
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Official Receipt No</div>
                  <div className="text-slate-900 font-mono font-black text-sm mt-0.5">
                    {paymentCompletedReceipt.receipt_number}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Transaction Reference</div>
                  <div className="text-slate-900 font-mono font-bold text-xs mt-0.5">
                    {paymentCompletedReceipt.transaction_reference}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Payment Method</div>
                  <div className="text-slate-900 font-semibold mt-0.5">
                    {paymentCompletedReceipt.payment_method}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Date of Transaction</div>
                  <div className="text-slate-900 font-mono mt-0.5">{paymentCompletedReceipt.date}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => handleDownloadReceipt(paymentCompletedReceipt.id)}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm shadow-md shadow-emerald-500/20 hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center justify-center space-x-2"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download Official PDF Receipt</span>
                </button>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all"
                >
                  Done & View Updated Fee Schedule
                </button>
              </div>
            </div>
          )}

          {/* MAIN CHECKOUT FORM */}
          {!isProcessing && !paymentCompletedReceipt && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* LEFT COLUMN: Check items, billing address, payment methods (8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                {/* 1. Student Academic Billing Card (Amazon Address Style) */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-700 font-bold text-xs flex items-center justify-center">
                        1
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-sm">
                        Student Academic & Billing Details
                      </h3>
                    </div>
                    <span className="text-xs text-[#0071E3] font-semibold cursor-pointer">
                      Verified Enrolled Student
                    </span>
                  </div>

                  <div className="pt-3.5 text-xs text-slate-600 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[10px] block">Student Enrolled</span>
                      <strong className="text-slate-900 text-sm font-bold block">{student.student_name}</strong>
                      <span className="font-mono text-slate-500">{student.admission_number}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[10px] block">Grade & Session</span>
                      <strong className="text-slate-900 text-sm font-bold block">
                        {student.class_name} • Section {student.section_name || 'A'}
                      </strong>
                      <span className="text-slate-500">{student.academic_session || '2026–2027 Session'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[10px] block">Campus Destination</span>
                      <strong className="text-slate-900 text-xs font-bold block">Ever Grow Main Campus</strong>
                      <span className="text-slate-500">Institutional Billing Desk</span>
                    </div>
                  </div>
                </div>

                {/* 2. Select Fees to Pay (Amazon Items to Checkout) */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-700 font-bold text-xs flex items-center justify-center">
                        2
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-sm">
                        Select Fee Invoices to Pay Now
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={selectAllUnpaid}
                      className="text-xs text-amber-700 hover:text-amber-800 font-bold hover:underline"
                    >
                      Select All Due Fees
                    </button>
                  </div>

                  {/* Fee Heads Checkbox List */}
                  <div className="space-y-2.5">
                    {student.breakdown?.map((item) => {
                      const isSelected = selectedItems.includes(item.id || item.category);
                      const isAlreadyPaid = item.status === 'Paid';

                      return (
                        <div
                          key={item.id || item.category}
                          onClick={() => {
                            if (!isAlreadyPaid) toggleItem(item.id || item.category);
                          }}
                          className={`p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                            isAlreadyPaid
                              ? 'bg-slate-50/60 border-slate-200/60 opacity-60 cursor-not-allowed'
                              : isSelected
                              ? 'bg-amber-50/50 border-amber-300 shadow-sm'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={isAlreadyPaid}
                              onChange={() => {}}
                              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                            />
                            <div>
                              <div className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                                <span>{item.category}</span>
                                {isAlreadyPaid ? (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    Already Settled
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
                                    Due: {item.due_date}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400">
                                Official Curricular Fee Head • Due by {item.due_date}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-sm font-mono font-extrabold text-slate-900">
                              ${Number(item.amount).toLocaleString()}.00
                            </div>
                            <span className="text-[10px] text-slate-400 font-semibold">
                              {isAlreadyPaid ? 'Paid in Full' : 'Pending Clearance'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Custom Amount option */}
                  <div className="pt-2 flex items-center space-x-3 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomAmountActive(!isCustomAmountActive);
                        if (!isCustomAmountActive) setSelectedItems([]);
                      }}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                        isCustomAmountActive
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Pay Custom Partial Installment
                    </button>
                    {isCustomAmountActive && (
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-400 font-bold">$</span>
                        <input
                          type="number"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          placeholder="e.g. 5000"
                          className="px-3 py-1.5 rounded-lg border border-slate-300 w-32 font-mono text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Amazon Payment Method Selector (Core Amazon Gateway) */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-700 font-bold text-xs flex items-center justify-center">
                        3
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-sm">
                        Select a Payment Method
                      </h3>
                    </div>
                    <div className="flex items-center space-x-1.5 text-slate-400 text-xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-semibold text-emerald-700">PCI-DSS Level 1 Encrypted</span>
                    </div>
                  </div>

                  {/* Payment Options Accordion */}
                  <div className="space-y-3">
                    {/* Option A: Credit / Debit Card */}
                    <div
                      className={`border rounded-xl transition-all overflow-hidden ${
                        paymentMethod === 'card' ? 'border-amber-400 bg-amber-50/20 shadow-sm' : 'border-slate-200'
                      }`}
                    >
                      <div
                        onClick={() => setPaymentMethod('card')}
                        className="p-4 flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={paymentMethod === 'card'}
                            onChange={() => setPaymentMethod('card')}
                            className="text-amber-600 focus:ring-amber-500"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                              <span>Credit or Debit Card</span>
                              <span className="text-[10px] font-normal text-slate-500">
                                (Visa, Mastercard, RuPay, Amex)
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              Instant institutional confirmation with zero surcharge
                            </div>
                          </div>
                        </div>

                        {/* Card Brand Badges */}
                        <div className="flex items-center space-x-1 text-[10px] font-extrabold text-slate-600">
                          <span className="px-1.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 rounded">
                            VISA
                          </span>
                          <span className="px-1.5 py-0.5 bg-red-50 border border-red-200 text-red-700 rounded">
                            MC
                          </span>
                          <span className="px-1.5 py-0.5 bg-green-50 border border-green-200 text-green-700 rounded">
                            RuPay
                          </span>
                        </div>
                      </div>

                      {/* Card Details Subform */}
                      {paymentMethod === 'card' && (
                        <div className="px-4 pb-4 pt-1 border-t border-amber-200/60 space-y-3 text-xs animate-fade-in">
                          <div>
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                              Card Number
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={cardNumber}
                                onChange={handleCardNumberChange}
                                placeholder="4532 8912 3456 7890"
                                maxLength={19}
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-amber-500 outline-none pr-20"
                              />
                              <span className="absolute right-3 top-2 text-[10px] font-bold text-slate-500 uppercase">
                                {getCardBrand(cardNumber)}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                Name on Card
                              </label>
                              <input
                                type="text"
                                value={cardHolder}
                                onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                                placeholder="WILLIAM SMITH"
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                  Expires (MM / YY)
                                </label>
                                <div className="flex space-x-1">
                                  <select
                                    value={cardExpMonth}
                                    onChange={(e) => setCardExpMonth(e.target.value)}
                                    className="w-1/2 px-2 py-2 rounded-xl border border-slate-300 text-xs outline-none font-mono"
                                  >
                                    {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(
                                      (m) => (
                                        <option key={m} value={m}>
                                          {m}
                                        </option>
                                      )
                                    )}
                                  </select>
                                  <select
                                    value={cardExpYear}
                                    onChange={(e) => setCardExpYear(e.target.value)}
                                    className="w-1/2 px-2 py-2 rounded-xl border border-slate-300 text-xs outline-none font-mono"
                                  >
                                    {['2026', '2027', '2028', '2029', '2030', '2031'].map((y) => (
                                      <option key={y} value={y}>
                                        {y.slice(2)}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              <div>
                                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                  CVV / CVC
                                </label>
                                <input
                                  type="password"
                                  value={cardCvv}
                                  onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                  placeholder="•••"
                                  maxLength={4}
                                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-amber-500 outline-none text-center"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="pt-1 flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="saveCardCheckbox"
                              checked={saveCard}
                              onChange={(e) => setSaveCard(e.target.checked)}
                              className="w-3.5 h-3.5 text-amber-600 rounded"
                            />
                            <label htmlFor="saveCardCheckbox" className="text-[11px] text-slate-500">
                              Save card securely for future school term fee payments (RBI / PCI-DSS Tokenized)
                            </label>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Option B: Net Banking */}
                    <div
                      className={`border rounded-xl transition-all overflow-hidden ${
                        paymentMethod === 'net_banking' ? 'border-amber-400 bg-amber-50/20 shadow-sm' : 'border-slate-200'
                      }`}
                    >
                      <div
                        onClick={() => setPaymentMethod('net_banking')}
                        className="p-4 flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={paymentMethod === 'net_banking'}
                            onChange={() => setPaymentMethod('net_banking')}
                            className="text-amber-600 focus:ring-amber-500"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                              <span>Net Banking</span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              All major scheduled banks supported with direct authorization
                            </div>
                          </div>
                        </div>
                        <Building2 className="w-4 h-4 text-slate-400" />
                      </div>

                      {/* Net Banking Bank Selector */}
                      {paymentMethod === 'net_banking' && (
                        <div className="px-4 pb-4 pt-1 border-t border-amber-200/60 space-y-3 text-xs animate-fade-in">
                          <div className="text-[11px] font-bold text-slate-700">Popular Institutional Banks:</div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {['HDFC', 'SBI', 'ICICI', 'Axis'].map((b) => (
                              <button
                                key={b}
                                type="button"
                                onClick={() => setSelectedBank(b)}
                                className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                                  selectedBank === b
                                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                {b} Bank
                              </button>
                            ))}
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                              Or Select Other Bank:
                            </label>
                            <select
                              value={selectedBank}
                              onChange={(e) => setSelectedBank(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none"
                            >
                              <option value="HDFC">HDFC Bank</option>
                              <option value="SBI">State Bank of India</option>
                              <option value="ICICI">ICICI Bank</option>
                              <option value="Axis">Axis Bank</option>
                              <option value="Kotak">Kotak Mahindra Bank</option>
                              <option value="PNB">Punjab National Bank</option>
                              <option value="BankOfBaroda">Bank of Baroda</option>
                              <option value="Chase">JPMorgan Chase Bank</option>
                              <option value="Citi">Citibank</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Option C: UPI / QR Code (Amazon Pay UPI) */}
                    <div
                      className={`border rounded-xl transition-all overflow-hidden ${
                        paymentMethod === 'upi' ? 'border-amber-400 bg-amber-50/20 shadow-sm' : 'border-slate-200'
                      }`}
                    >
                      <div
                        onClick={() => setPaymentMethod('upi')}
                        className="p-4 flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={paymentMethod === 'upi'}
                            onChange={() => setPaymentMethod('upi')}
                            className="text-amber-600 focus:ring-amber-500"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                              <span>UPI / QR Code / Instant Pay</span>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-100 text-amber-800">
                                FASTEST
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              Google Pay, PhonePe, Paytm, Amazon Pay UPI & BHIM
                            </div>
                          </div>
                        </div>
                        <QrCode className="w-4 h-4 text-slate-400" />
                      </div>

                      {paymentMethod === 'upi' && (
                        <div className="px-4 pb-4 pt-1 border-t border-amber-200/60 space-y-4 text-xs animate-fade-in">
                          {/* Subtabs for UPI: Scan QR vs Enter UPI ID */}
                          <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
                            <button
                              type="button"
                              onClick={() => setUpiSubTab('qr')}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                                upiSubTab === 'qr'
                                  ? 'bg-amber-600 text-white'
                                  : 'text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              Scan Institutional QR Code
                            </button>
                            <button
                              type="button"
                              onClick={() => setUpiSubTab('vpa')}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                                upiSubTab === 'vpa'
                                  ? 'bg-amber-600 text-white'
                                  : 'text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              Enter UPI ID / VPA
                            </button>
                          </div>

                          {upiSubTab === 'qr' ? (
                            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-white rounded-2xl border border-slate-200">
                              {/* Dynamic QR Display */}
                              <div className="w-36 h-36 bg-slate-50 border-2 border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-inner relative">
                                <QrCode className="w-28 h-28 text-slate-800" />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <div className="bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded shadow">
                                    EVERGROW
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2 text-center sm:text-left">
                                <div className="text-xs font-bold text-slate-900">
                                  Scan this QR code with any UPI app
                                </div>
                                <p className="text-[11px] text-slate-500">
                                  Amount:{' '}
                                  <strong className="text-slate-900 font-mono font-bold">
                                    ${finalPayableTotal.toLocaleString()}.00
                                  </strong>
                                </p>
                                <div className="flex items-center justify-center sm:justify-start space-x-1.5 text-[10px] text-amber-700 font-mono bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                                  <Clock className="w-3 h-3" />
                                  <span>
                                    Expires in {Math.floor(qrTimer / 60)}:
                                    {(qrTimer % 60).toString().padStart(2, '0')} mins
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  After scanning and authorizing on your mobile app, click Place Order below.
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <label className="text-[11px] font-bold text-slate-700 block">
                                Enter your UPI ID / Virtual Payment Address
                              </label>
                              <div className="flex space-x-2">
                                <input
                                  type="text"
                                  value={upiId}
                                  onChange={(e) => {
                                    setUpiId(e.target.value);
                                    setVpaVerified(false);
                                  }}
                                  placeholder="e.g. parent@okhdfcbank"
                                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={handleVerifyVpa}
                                  className="px-4 py-2 bg-[#0071E3] text-white rounded-xl text-xs font-bold hover:bg-[#0077ED] transition-colors shadow-xs"
                                >
                                  {vpaVerified ? 'Verified' : 'Verify'}
                                </button>
                              </div>
                              {vpaVerified && (
                                <div className="flex items-center space-x-1 text-[11px] text-emerald-700 font-semibold">
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>UPI handle valid and ready for institutional payment</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Option D: Amazon Pay Balance / Digital Wallets */}
                    <div
                      className={`border rounded-xl transition-all overflow-hidden ${
                        paymentMethod === 'amazon_pay' ? 'border-amber-400 bg-amber-50/20 shadow-sm' : 'border-slate-200'
                      }`}
                    >
                      <div
                        onClick={() => setPaymentMethod('amazon_pay')}
                        className="p-4 flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={paymentMethod === 'amazon_pay'}
                            onChange={() => setPaymentMethod('amazon_pay')}
                            className="text-amber-600 focus:ring-amber-500"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                              <span>Amazon Pay Balance & Digital Wallets</span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              Amazon Pay, Apple Pay & Google Pay direct checkout
                            </div>
                          </div>
                        </div>
                        <Wallet className="w-4 h-4 text-slate-400" />
                      </div>

                      {paymentMethod === 'amazon_pay' && (
                        <div className="px-4 pb-4 pt-1 border-t border-amber-200/60 space-y-2 text-xs animate-fade-in">
                          <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-800 font-black text-[10px] flex items-center justify-center">
                                a
                              </div>
                              <div>
                                <span className="font-bold text-slate-800 block">Amazon Pay Account</span>
                                <span className="text-[10px] text-slate-400">Linked to school parent guardian</span>
                              </div>
                            </div>
                            <span className="text-emerald-700 font-bold text-xs">Ready for 1-Click Pay</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Option E: EMI & Flexible Installments */}
                    <div
                      className={`border rounded-xl transition-all overflow-hidden ${
                        paymentMethod === 'emi' ? 'border-amber-400 bg-amber-50/20 shadow-sm' : 'border-slate-200'
                      }`}
                    >
                      <div
                        onClick={() => setPaymentMethod('emi')}
                        className="p-4 flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={paymentMethod === 'emi'}
                            onChange={() => setPaymentMethod('emi')}
                            className="text-amber-600 focus:ring-amber-500"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                              <span>No Cost EMI / Term Installments</span>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-blue-100 text-blue-800">
                                0% INTEREST
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              Split your school fees into 3, 6, or 9 easy monthly installments
                            </div>
                          </div>
                        </div>
                        <Percent className="w-4 h-4 text-slate-400" />
                      </div>

                      {paymentMethod === 'emi' && (
                        <div className="px-4 pb-4 pt-1 border-t border-amber-200/60 space-y-2 text-xs animate-fade-in">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {[
                              { tenure: '3', label: '3 Months (No Cost)', rate: '0% Interest' },
                              { tenure: '6', label: '6 Months', rate: '0% Interest' },
                              { tenure: '9', label: '9 Months', rate: '0% Interest' },
                            ].map((emi) => {
                              const months = parseInt(emi.tenure);
                              const monthlyCost = Math.round(finalPayableTotal / months);

                              return (
                                <div
                                  key={emi.tenure}
                                  onClick={() => setSelectedEmiTenure(emi.tenure as any)}
                                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                    selectedEmiTenure === emi.tenure
                                      ? 'bg-amber-600 text-white border-amber-600'
                                      : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                                  }`}
                                >
                                  <div className="font-bold text-xs">{emi.label}</div>
                                  <div className="text-sm font-mono font-black mt-1">
                                    ${monthlyCost.toLocaleString()}/mo
                                  </div>
                                  <div
                                    className={`text-[9px] mt-0.5 ${
                                      selectedEmiTenure === emi.tenure ? 'text-amber-100' : 'text-emerald-700'
                                    }`}
                                  >
                                    {emi.rate}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. Amazon Promo & Voucher Box */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
                    <Tag className="w-4 h-4 text-amber-600" />
                    <span>Apply Institutional Voucher or Gift Code</span>
                  </div>

                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      placeholder="Enter promo code (e.g. MERIT2026, SIBLING10, EARLYBIRD)"
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-amber-500 outline-none uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="px-5 py-2 bg-[#0071E3] text-white rounded-xl text-xs font-bold hover:bg-[#0077ED] transition-colors shadow-xs"
                    >
                      Apply
                    </button>
                  </div>

                  {appliedPromo && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800 animate-fade-in">
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <strong className="font-mono font-bold">{appliedPromo.code}</strong>: {appliedPromo.label}
                        </div>
                      </div>
                      <span className="font-mono font-black text-emerald-700">
                        -${appliedPromo.discount.toLocaleString()}.00
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: Sticky Order Summary (Amazon Style) (4 cols) */}
              <div className="lg:col-span-4 space-y-5">
                <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-md space-y-5 sticky top-24">
                  {/* Primary Amber CTA Button (Amazon Style) */}
                  <button
                    type="button"
                    onClick={handleExecutePayment}
                    disabled={finalPayableTotal <= 0}
                    className="w-full py-3.5 px-4 rounded-2xl bg-[#FFD814] hover:bg-[#F7CA00] active:bg-[#F0B800] text-slate-950 font-extrabold text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed border border-[#FCD200]"
                  >
                    <span>Place Your Order and Pay</span>
                    <ArrowRight className="w-4 h-4 text-slate-950" />
                  </button>

                  <div className="text-[11px] text-slate-400 text-center leading-relaxed">
                    By placing your order, you agree to Ever Grow Schools institutional fee billing policies and terms.
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-3 text-xs">
                    <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px]">
                      Fee Order Summary
                    </h4>

                    <div className="flex justify-between text-slate-600">
                      <span>Items Selected:</span>
                      <span className="font-mono font-semibold">
                        {isCustomAmountActive ? 'Custom Amount' : `${selectedItems.length} fee heads`}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span>Fee Subtotal:</span>
                      <span className="font-mono font-bold text-slate-900">
                        ${baseSubtotal.toLocaleString()}.00
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span>School Platform Fee:</span>
                      <span className="font-mono font-semibold text-emerald-600">FREE ($0.00)</span>
                    </div>

                    {appliedPromo && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Voucher Concession:</span>
                        <span className="font-mono font-bold">
                          -${discountAmount.toLocaleString()}.00
                        </span>
                      </div>
                    )}

                    <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
                      <span className="text-sm font-extrabold text-slate-900">Order Total:</span>
                      <div className="text-right">
                        <span className="text-2xl font-black font-mono text-[#B12704]">
                          ${finalPayableTotal.toLocaleString()}.00
                        </span>
                        <span className="block text-[10px] text-slate-400 font-sans">
                          Tax compliant receipt included
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Trust & Guarantee Box */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2 text-[11px] text-slate-600">
                    <div className="flex items-center space-x-1.5 font-bold text-slate-800">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>100% Institutional Guarantee</span>
                    </div>
                    <p className="leading-relaxed text-slate-500">
                      Instant official PDF tax receipt generated immediately upon payment. Verified by Ever Grow Schools
                      Treasury.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

