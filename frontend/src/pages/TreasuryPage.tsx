import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  Landmark,
  Receipt,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Building,
  TrendingDown,
  ShieldCheck,
  ArrowUpRight,
  RefreshCw,
  Wallet,
  Clock,
  Sparkles,
  Search,
} from 'lucide-react';

interface InstitutionalLoan {
  id: string;
  facility_name: string;
  lender: string;
  principal_amount: string;
  outstanding_balance: string;
  monthly_emi: string;
  interest_rate: string;
  next_due_date: string;
  tenure_months_remaining: number;
  purpose: string;
  status: string;
}

interface VendorBill {
  id: string;
  vendor_name: string;
  category: string;
  invoice_number: string;
  amount: string;
  due_date: string;
  urgency: string;
  priority_color: string;
  description: string;
  is_paid: boolean;
  status: string;
  paid_at?: string;
}

interface TreasuryGovernanceData {
  total_active_students: number;
  total_active_staff: number;
  total_teachers: number;
  institutional_loans: InstitutionalLoan[];
  total_debt_outstanding: string;
  total_monthly_emi: string;
  vendor_bills: VendorBill[];
  unpaid_bills_count: number;
  treasury_liquidity: {
    liquid_cash_reserves: string;
    monthly_fee_collection_run_rate: string;
    operating_reserve_months: string;
  };
}

export const TreasuryPage: React.FC = () => {
  const [data, setData] = useState<TreasuryGovernanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'paid'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Settle Bill Modal
  const [selectedBill, setSelectedBill] = useState<VendorBill | null>(null);
  const [paying, setPaying] = useState(false);
  const [paySuccessMsg, setPaySuccessMsg] = useState<string | null>(null);

  const fetchTreasury = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/dashboards/super-admin');
      setData(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load institutional treasury data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTreasury();
  }, []);

  const handlePayBill = async () => {
    if (!selectedBill) return;
    try {
      setPaying(true);
      await api.post('/dashboards/super-admin/pay-bill', { bill_id: selectedBill.id });
      setPaySuccessMsg(`Payment of ₹${selectedBill.amount} to ${selectedBill.vendor_name} successfully authorized.`);

      if (data) {
        setData({
          ...data,
          unpaid_bills_count: Math.max(0, data.unpaid_bills_count - 1),
          vendor_bills: data.vendor_bills.map((b) =>
            b.id === selectedBill.id
              ? {
                  ...b,
                  is_paid: true,
                  status: 'Paid & Settled',
                  paid_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }
              : b
          ),
        });
      }

      setTimeout(() => {
        setSelectedBill(null);
        setPaySuccessMsg(null);
      }, 1600);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Error processing payment transaction');
    } finally {
      setPaying(false);
    }
  };

  const bills = data?.vendor_bills || [];
  const filteredBills = bills.filter((bill) => {
    const matchesTab =
      filterTab === 'all'
        ? true
        : filterTab === 'pending'
        ? !bill.is_paid
        : bill.is_paid;
    const matchesSearch =
      bill.vendor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-[#0071E3] border-t-transparent rounded-full animate-spin"></div>
        <div className="text-slate-500 font-medium text-sm">Loading Institutional Treasury & Debt Portfolio...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/80 rounded-[28px] border border-blue-100/60 backdrop-blur-md shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-[#0071E3] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Super Admin Executive Governance
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1D1D1F] tracking-tight">
            Institutional Treasury & Liabilities
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Live institutional capital debt balances, banking credit lines, and accounts payable disbursement engine.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchTreasury}
            className="ios-gloss-btn-secondary inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold"
          >
            <RefreshCw className="w-4 h-4 text-[#0071E3]" />
            Sync Ledger
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Top 3 High-Level Treasury KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Outstanding Loans */}
        <div className="bg-white p-6 rounded-[24px] border border-black/[0.06] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Outstanding Debt
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Landmark className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
            ₹{data?.total_debt_outstanding || '0'}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>{data?.institutional_loans.length || 0} Banking Facilities</span>
            <span className="font-semibold text-slate-700">EMI: ₹{data?.total_monthly_emi}/mo</span>
          </div>
        </div>

        {/* Pending Bills To Pay */}
        <div className="bg-white p-6 rounded-[24px] border border-black/[0.06] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Accounts Payable (Bills to Pay)
            </span>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
            {data?.unpaid_bills_count || 0} <span className="text-base font-semibold text-slate-500">Invoices Due</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>Critical Campus Utilities & Books</span>
            <span className="font-semibold text-rose-600">Action Required</span>
          </div>
        </div>

        {/* Liquid Reserves & Runway */}
        <div className="bg-white p-6 rounded-[24px] border border-black/[0.06] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Operating Liquidity Reserves
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
            ₹{data?.treasury_liquidity.liquid_cash_reserves || '0'}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>Fee Run-Rate: ₹{data?.treasury_liquidity.monthly_fee_collection_run_rate}/mo</span>
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {data?.treasury_liquidity.operating_reserve_months}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: INSTITUTIONAL LOANS PORTFOLIO */}
      <div className="bg-white rounded-[28px] border border-black/[0.06] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-black/[0.05]">
          <div>
            <div className="flex items-center gap-2">
              <Landmark className="w-5 h-5 text-[#0071E3]" />
              <h2 className="text-lg font-bold text-[#1D1D1F]">
                Institutional Loans & Debt Portfolio ({data?.institutional_loans.length || 0})
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Active commercial credit facilities taken for campus science lab construction, smart classrooms, and 4 GPS school buses.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium self-start sm:self-auto">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            All Facilities in Good Standing
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
          {data?.institutional_loans.map((loan) => (
            <div
              key={loan.id}
              className="p-5 rounded-[22px] bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                      {loan.lender}
                    </span>
                    <h3 className="text-sm font-bold text-[#1D1D1F] mt-2 leading-snug">
                      {loan.facility_name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">{loan.purpose}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                    Active
                  </span>
                </div>

                <div className="mt-4 p-3.5 rounded-xl bg-white border border-slate-200/60 shadow-2xs space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[11px] text-slate-500">Outstanding Balance:</span>
                    <span className="text-base font-bold text-[#1D1D1F]">
                      ₹{loan.outstanding_balance}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-[11px] text-slate-500">
                    <span>Sanctioned Principal:</span>
                    <span>₹{loan.principal_amount}</span>
                  </div>
                  <div className="flex justify-between items-baseline text-[11px] text-slate-500">
                    <span>Interest Rate:</span>
                    <span className="font-semibold text-slate-700">{loan.interest_rate}</span>
                  </div>
                  <div className="flex justify-between items-baseline text-[11px] text-slate-500">
                    <span>Tenure Remaining:</span>
                    <span className="font-semibold text-slate-700">{loan.tenure_months_remaining} Months</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Monthly EMI</span>
                  <span className="font-bold text-[#1D1D1F]">₹{loan.monthly_emi}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[10px]">Next Auto-Debit</span>
                  <span className="font-semibold text-blue-600">{loan.next_due_date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: ACCOUNTS PAYABLE - VENDOR BILLS TO PAY */}
      <div className="bg-white rounded-[28px] border border-black/[0.06] p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-black/[0.05]">
          <div>
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-rose-500" />
              <h2 className="text-lg font-bold text-[#1D1D1F]">
                Accounts Payable: Operating Bills to Pay ({bills.length})
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Monthly campus operational invoices (Electricity grid, High-speed fiber telecom, Fleet fuel diesel, Textbooks, Sanitization).
            </p>
          </div>

          {/* Controls: Search & Tabs */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search vendor or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-[#1D1D1F] focus:outline-none focus:border-[#0071E3] w-48 bg-slate-50/50"
              />
            </div>
            <div className="inline-flex p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setFilterTab('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filterTab === 'all'
                    ? 'bg-white text-[#1D1D1F] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterTab('pending')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filterTab === 'pending'
                    ? 'bg-white text-rose-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Pending ({bills.filter((b) => !b.is_paid).length})
              </button>
              <button
                onClick={() => setFilterTab('paid')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filterTab === 'paid'
                    ? 'bg-white text-emerald-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Settled ({bills.filter((b) => b.is_paid).length})
              </button>
            </div>
          </div>
        </div>

        {/* Bills Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.04] text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Vendor & Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Bill Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03]">
              {filteredBills.map((bill) => {
                const isPaid = bill.is_paid;
                const isCritical = bill.urgency === 'Urgent' && !isPaid;

                return (
                  <tr key={bill.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#1D1D1F] text-sm">{bill.vendor_name}</div>
                      <div className="text-[11px] text-slate-500">{bill.description}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium text-[11px]">
                        {bill.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 font-medium">
                      {bill.invoice_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className={isCritical ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                          {bill.due_date}
                        </span>
                      </div>
                      {isCritical && (
                        <span className="text-[10px] text-rose-600 font-semibold uppercase tracking-wider block mt-0.5">
                          High Urgency
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-sm font-bold text-[#1D1D1F]">
                        ₹{bill.amount}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Settled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Pending Payment
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isPaid ? (
                        <span className="text-[11px] text-slate-400 font-medium italic">
                          Paid {bill.paid_at ? `(${bill.paid_at})` : 'via Bank RTGS'}
                        </span>
                      ) : (
                        <button
                          onClick={() => setSelectedBill(bill)}
                          className="ios-gloss-btn-emerald inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Pay Bill
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredBills.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No vendor bills match your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Settle Bill Confirmation Squircle Modal */}
      {selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[30px] p-6 max-w-md w-full shadow-2xl border border-black/[0.08] relative">
            <div className="flex items-center justify-between pb-4 border-b border-black/[0.05]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1D1D1F]">Authorize Vendor Disbursement</h3>
                  <p className="text-[11px] text-slate-500">Super Admin Commercial Treasury Approval</p>
                </div>
              </div>
            </div>

            {paySuccessMsg ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="text-sm font-bold text-slate-800">{paySuccessMsg}</div>
                <p className="text-xs text-slate-500">Ledger balance updated and bank transaction voucher recorded.</p>
              </div>
            ) : (
              <div className="py-5 space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Vendor:</span>
                    <span className="font-bold text-slate-800">{selectedBill.vendor_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Invoice:</span>
                    <span className="font-mono text-slate-700">{selectedBill.invoice_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Category:</span>
                    <span className="text-slate-700">{selectedBill.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Details:</span>
                    <span className="text-slate-700">{selectedBill.description}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200">
                    <span className="font-semibold text-slate-600">Disbursement Amount:</span>
                    <span className="text-base font-extrabold text-[#0071E3]">
                      ₹{selectedBill.amount}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 bg-blue-50/70 p-3 rounded-xl border border-blue-100 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0071E3] shrink-0 mt-0.5" />
                  <span>
                    This action executes institutional bank RTGS clearance and records the settlement in the annual audit book.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    onClick={() => setSelectedBill(null)}
                    disabled={paying}
                    className="ios-gloss-btn-secondary px-4 py-2 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePayBill}
                    disabled={paying}
                    className="ios-gloss-btn-emerald px-5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2"
                  >
                    {paying ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Authorizing Bank RTGS...
                      </>
                    ) : (
                      <>Authorize & Settle Bill</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
