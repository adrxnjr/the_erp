with open('frontend/src/pages/ModuleHubPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's inspect where the replacement starts: right after moduleKey === 'library' header and cards
# We want to replace lines from `/* 8. LIBRARY MODULE */` down to `/* 13. ANALYTICS MODULE */`

library_start_marker = "{/* ─────────────────────────────────────────────────────────────\n          8. LIBRARY MODULE"
analytics_start_marker = "{/* ─────────────────────────────────────────────────────────────\n          13. ANALYTICS MODULE"

idx_start = content.find(library_start_marker)
idx_end = content.find(analytics_start_marker)

if idx_start == -1 or idx_end == -1:
    print(f"Error finding markers: start={idx_start}, end={idx_end}")
    exit(1)

enriched_block = """{/* ─────────────────────────────────────────────────────────────
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
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Campus Library & Digital Learning Repository</h1>
                <p className="text-xs text-slate-500">12,450+ titles: NCERT textbooks, reference literature, scientific periodicals, and electronic eBooks</p>
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
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Faculty Payroll & Compensation Disbursement</h1>
                <p className="text-xs text-slate-500">Monthly salary processing, PF contributions, professional tax deductions, and bank transfer batches</p>
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
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Institutional Events & Academic Calendar</h1>
                <p className="text-xs text-slate-500">Board exams, annual sports meet, science olympiad, parent conferences, and term holidays</p>
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
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Visitors & Campus Gate Pass Security Desk</h1>
                <p className="text-xs text-slate-500">Real-time gate check-ins, parent visitor badges, vendor supply permits, and vehicle security logs</p>
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
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Helpdesk, Grievances & Parent Support</h1>
                <p className="text-xs text-slate-500">Service desk tickets: Transport queries, student portal logins, fee adjustments, and campus maintenance</p>
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
"""

content = content[:idx_start] + enriched_block + "\n\n      " + content[idx_end:]

with open('frontend/src/pages/ModuleHubPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated ModuleHubPage.tsx with comprehensive library, payroll, events, visitors, and helpdesk modules successfully!")

