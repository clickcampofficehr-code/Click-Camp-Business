import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { SupportTicket, ExpenseClaim, CrmDealer } from '../../types';
import {
  LifeBuoy,
  CreditCard,
  Building2,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  FileText,
  Search,
  Check,
  X
} from 'lucide-react';

export const SupportFinanceWorkspace: React.FC = () => {
  const {
    tickets,
    createTicket,
    resolveTicket,
    expenses,
    submitExpense,
    reviewExpense,
    dealers,
    addDealer,
    currentUser
  } = useWorkspace();

  const [activeSection, setActiveSection] = useState<'tickets' | 'expenses' | 'crm'>('tickets');

  // New ticket state
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketCat, setTicketCat] = useState<SupportTicket['category']>('IT Support');
  const [ticketPriority, setTicketPriority] = useState<SupportTicket['priority']>('High');

  // New expense claim state
  const [isNewExpenseOpen, setIsNewExpenseOpen] = useState(false);
  const [expCategory, setExpCategory] = useState<ExpenseClaim['category']>('Client Meals');
  const [expAmount, setExpAmount] = useState('3200');
  const [expReceipt, setExpReceipt] = useState('REC-CC-9921');
  const [expNotes, setExpNotes] = useState('');

  // New CRM dealer state
  const [isNewDealerOpen, setIsNewDealerOpen] = useState(false);
  const [dealerName, setDealerName] = useState('');
  const [dealerPartnerType, setDealerPartnerType] = useState<CrmDealer['partnerType']>('Tier 1 Elite');
  const [dealerContact, setDealerContact] = useState('');
  const [dealerPhone, setDealerPhone] = useState('+91 ');
  const [dealerEmail, setDealerEmail] = useState('');
  const [dealerRegion, setDealerRegion] = useState('North India (Delhi NCR)');

  const [crmSearch, setCrmSearch] = useState('');

  const filteredDealers = dealers.filter(
    (d) =>
      d.dealerName.toLowerCase().includes(crmSearch.toLowerCase()) ||
      d.contactPerson.toLowerCase().includes(crmSearch.toLowerCase()) ||
      d.region.toLowerCase().includes(crmSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-neutral-900 text-white rounded-2xl p-5 sm:p-6 border border-neutral-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Module 9: Enterprise Support & Partners
            </span>
            <span className="text-xs text-neutral-400">Integrated Helpdesk & CRM</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-1.5 flex items-center gap-2">
            <span>Support Helpdesk, Finance & Partner CRM</span>
            <LifeBuoy className="w-5 h-5 text-amber-400" />
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 mt-1">
            Resolve IT & HR tickets, reconcile expense reimbursement claims, and oversee tier-1 dealer accounts.
          </p>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-1 bg-neutral-800/80 p-1 rounded-xl border border-neutral-700">
          {[
            { id: 'tickets', label: 'Support Helpdesk' },
            { id: 'expenses', label: 'Expense Claims' },
            { id: 'crm', label: 'Partner CRM' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as typeof activeSection)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeSection === tab.id ? 'bg-amber-500 text-neutral-950 font-bold shadow-xs' : 'text-neutral-300 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 1: SUPPORT TICKETS */}
      {activeSection === 'tickets' && (
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <LifeBuoy className="w-4 h-4 text-amber-600" />
                <span>Internal Support & IT Helpdesk</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Raise tickets for hardware replacements, VPN access, HR policies, or software licenses.
              </p>
            </div>

            <button
              onClick={() => setIsNewTicketOpen(true)}
              className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>Raise Ticket</span>
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {tickets.map((t) => (
              <div
                key={t.id}
                className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-neutral-900">{t.id}</span>
                    <span className="font-bold text-neutral-900">{t.title}</span>
                    <span className="px-2 py-0.2 bg-neutral-200 text-neutral-700 rounded text-[10px] font-semibold">
                      {t.category}
                    </span>
                    <span
                      className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                        t.priority === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {t.priority} Priority
                    </span>
                  </div>
                  <p className="text-neutral-500 text-[11px] mt-1">
                    Submitted by: {t.submittedByName} on {t.createdAt}
                  </p>
                  {t.resolutionNotes && (
                    <p className="text-emerald-700 text-[11px] mt-1 font-medium bg-emerald-50 p-1.5 rounded">
                      Resolution: {t.resolutionNotes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {t.status === 'resolved' ? (
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                    </span>
                  ) : (
                    <button
                      onClick={() => resolveTicket(t.id, 'Resolved and verified by Systems Administrator')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition cursor-pointer shadow-xs"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: EXPENSE CLAIMS */}
      {activeSection === 'expenses' && (
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Employee Expense Claims & Reimbursements</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Submit corporate expenses for client dinners, travel, or infrastructure tools.
              </p>
            </div>

            <button
              onClick={() => setIsNewExpenseOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Claim Expense</span>
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider text-[10px] border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-3">Receipt Ref</th>
                  <th className="py-2.5 px-3">Employee</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Approval Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-800">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-neutral-50/70 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-neutral-900">{exp.receiptRef}</td>
                    <td className="py-2.5 px-3 font-semibold text-neutral-900">{exp.userName}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 bg-neutral-100 text-neutral-800 rounded text-[11px] font-medium">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-neutral-900">₹{exp.amount.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-neutral-500">{exp.date}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          exp.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : exp.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {exp.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {exp.status === 'pending' && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => reviewExpense(exp.id, 'rejected')}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-[11px] font-semibold cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => reviewExpense(exp.id, 'approved')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold cursor-pointer"
                          >
                            Approve
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: CRM DEALER DIRECTORY */}
      {activeSection === 'crm' && (
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Partner & Dealer Relationship Directory</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Manage commercial tie-ups, regional dealers, and partner commission terms.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search partner or region..."
                  value={crmSearch}
                  onChange={(e) => setCrmSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <button
                onClick={() => setIsNewDealerOpen(true)}
                className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
              >
                <PlusCircle className="w-3.5 h-3.5 text-blue-400" />
                <span>Add Partner</span>
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDealers.map((d) => (
              <div
                key={d.id}
                className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 shadow-2xs space-y-2.5 text-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-neutral-900 text-sm leading-tight">{d.dealerName}</h4>
                    <span className="px-2 py-0.2 rounded bg-blue-100 text-blue-800 font-bold text-[10px] mt-1 inline-block">
                      {d.partnerType}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {d.contractStatus}
                  </span>
                </div>

                <div className="space-y-1 text-neutral-600 pt-2 border-t border-neutral-200 text-[11px]">
                  <p className="font-semibold text-neutral-900">Contact: {d.contactPerson}</p>
                  <p className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-neutral-400" /> {d.phone}</p>
                  <p className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-neutral-400" /> {d.email}</p>
                  <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-neutral-400" /> {d.region}</p>
                </div>

                <div className="pt-2 border-t border-neutral-200 flex justify-between items-center text-[11px] font-bold text-neutral-700">
                  <span>Active Managed Campaigns:</span>
                  <span className="text-emerald-700 text-xs">{d.activeAccounts} Accounts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NEW TICKET MODAL */}
      {isNewTicketOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-neutral-200 animate-in fade-in">
            <h3 className="text-base font-bold text-neutral-900">Raise IT / HR Support Ticket</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Tickets are routed directly to enterprise administrators.</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createTicket({
                  title: ticketTitle,
                  category: ticketCat,
                  priority: ticketPriority
                });
                setIsNewTicketOpen(false);
                setTicketTitle('');
              }}
              className="mt-4 space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Issue Summary</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Workstation VPN Connection Timeout"
                  value={ticketTitle}
                  onChange={(e) => setTicketTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Category</label>
                  <select
                    value={ticketCat}
                    onChange={(e) => setTicketCat(e.target.value as SupportTicket['category'])}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white"
                  >
                    <option value="IT Support">IT Support</option>
                    <option value="HR Query">HR Query</option>
                    <option value="Admin & Facilities">Admin & Facilities</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Priority</label>
                  <select
                    value={ticketPriority}
                    onChange={(e) => setTicketPriority(e.target.value as SupportTicket['priority'])}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsNewTicketOpen(false)}
                  className="px-3 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-100 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-bold cursor-pointer"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW EXPENSE MODAL */}
      {isNewExpenseOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-neutral-200 animate-in fade-in">
            <h3 className="text-base font-bold text-neutral-900">Claim Corporate Expense</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Submit verified invoices for finance reimbursement.</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitExpense({
                  category: expCategory,
                  amount: Number(expAmount) || 1000,
                  currency: 'INR',
                  receiptRef: expReceipt,
                  date: new Date().toISOString().split('T')[0],
                  notes: expNotes
                });
                setIsNewExpenseOpen(false);
                setExpAmount('');
                setExpReceipt(`REC-CC-${Math.floor(1000 + Math.random() * 9000)}`);
              }}
              className="mt-4 space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Expense Category</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as ExpenseClaim['category'])}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white"
                >
                  <option value="Client Meals">Client Meals</option>
                  <option value="Travel & Commute">Travel & Commute</option>
                  <option value="Hardware & Supplies">Hardware & Supplies</option>
                  <option value="Software Subscriptions">Software Subscriptions</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Amount (INR)</label>
                  <input
                    type="number"
                    required
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Receipt Ref</label>
                  <input
                    type="text"
                    required
                    value={expReceipt}
                    onChange={(e) => setExpReceipt(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Notes / Business Purpose</label>
                <textarea
                  rows={2}
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  placeholder="State client or business rationale..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsNewExpenseOpen(false)}
                  className="px-3 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-100 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold cursor-pointer"
                >
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW CRM DEALER MODAL */}
      {isNewDealerOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-neutral-200 animate-in fade-in">
            <h3 className="text-base font-bold text-neutral-900">Add Corporate Partner / Dealer</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Register new authorized channel partner.</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addDealer({
                  dealerName,
                  partnerType: dealerPartnerType,
                  contactPerson: dealerContact,
                  phone: dealerPhone,
                  email: dealerEmail,
                  region: dealerRegion,
                  contractStatus: 'Active'
                });
                setIsNewDealerOpen(false);
                setDealerName('');
                setDealerContact('');
              }}
              className="mt-4 space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Partner / Agency Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Digital Media"
                  value={dealerName}
                  onChange={(e) => setDealerName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Partner Tier</label>
                  <select
                    value={dealerPartnerType}
                    onChange={(e) => setDealerPartnerType(e.target.value as CrmDealer['partnerType'])}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white"
                  >
                    <option value="Tier 1 Elite">Tier 1 Elite</option>
                    <option value="Direct Dealer">Direct Dealer</option>
                    <option value="Franchise Partner">Franchise Partner</option>
                    <option value="Channel Partner">Channel Partner</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Primary Region</label>
                  <input
                    type="text"
                    required
                    value={dealerRegion}
                    onChange={(e) => setDealerRegion(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    required
                    value={dealerContact}
                    onChange={(e) => setDealerContact(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={dealerPhone}
                    onChange={(e) => setDealerPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsNewDealerOpen(false)}
                  className="px-3 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-100 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-bold cursor-pointer"
                >
                  Save Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
