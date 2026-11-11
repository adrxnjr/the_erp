import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Mail,
  Send,
  Inbox as InboxIcon,
  SendHorizontal,
  Clock,
  User,
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ChevronRight,
  Reply,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { defaultMessages, type MessageItem } from '../data/inboxData';

export const InboxPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  // Detect current role cleanly
  const currentRole: 'teacher' | 'coordinator' | 'parent' = useMemo(() => {
    if (user?.portal_type === 'parent') return 'parent';
    if (user?.roles?.includes('coordinator') || user?.username?.startsWith('coord')) return 'coordinator';
    if (user?.roles?.includes('teacher') || user?.username?.startsWith('teacher') || user?.full_name?.includes('Michael Chang')) return 'teacher';
    if (user?.username === 'staff') return 'coordinator';
    return 'coordinator'; // Fallback
  }, [user]);

  const currentUserName = useMemo(() => {
    if (currentRole === 'teacher') return 'Michael Chang';
    if (currentRole === 'coordinator') return 'Elena Rostova (Academic Coordinator)';
    if (currentRole === 'parent') return 'William Smith (Parent)';
    return user?.full_name || 'Staff User';
  }, [currentRole, user]);

  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'all'>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<MessageItem | null>(null);
  const [showCompose, setShowCompose] = useState(false);

  // Messages loaded from localStorage with default pre-population
  const [messages, setMessages] = useState<MessageItem[]>(() => {
    try {
      const stored = localStorage.getItem('evergrow_inbox_messages');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return defaultMessages;
  });

  // Sync across tabs & components
  useEffect(() => {
    const handleSync = () => {
      try {
        const stored = localStorage.getItem('evergrow_inbox_messages');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) setMessages(parsed);
        }
      } catch (e) {}
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('evergrow:new-message', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('evergrow:new-message', handleSync);
    };
  }, []);

  // Set default selected message on load
  useEffect(() => {
    if (!selectedMessage && messages.length > 0) {
      setSelectedMessage(messages[0]);
    }
  }, [messages, selectedMessage]);

  // Form state for new message
  const [toRecipient, setToRecipient] = useState<'coordinator' | 'teacher' | 'parent'>(() => {
    if (currentRole === 'teacher') return 'coordinator';
    if (currentRole === 'coordinator') return 'teacher';
    return 'teacher';
  });
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  const recipientOptions = useMemo(() => {
    const options = [];
    if (currentRole !== 'coordinator') {
      options.push({ value: 'coordinator', label: 'Elena Rostova (Academic Coordinator)', username: 'coordinator1' });
    }
    if (currentRole !== 'teacher') {
      options.push({ value: 'teacher', label: 'Michael Chang (Class Teacher)', username: 'teacher1' });
    }
    if (currentRole !== 'parent') {
      options.push({ value: 'parent', label: 'William Smith (Parent Guardian)', username: 'parent1' });
    }
    return options;
  }, [currentRole]);

  // Quick message template options
  const quickTemplates = useMemo(() => {
    if (currentRole === 'teacher') {
      return [
        { label: 'I am on leave today', subject: 'I am on leave today', body: 'Dear Coordinator,\n\nI am on leave today due to sudden illness. Please arrange faculty substitution for my scheduled lecture periods in Grade 10-A.\n\nThank you,\nMichael Chang' },
        { label: 'Substitution Handover', subject: 'Period 3 Math Class Handover Notes', body: 'The lesson plan for Chapter 8 Trigonometry has been uploaded to the campus drive. Exercise 8.2 problems 1-10 are assigned.' },
        { label: 'Parent Query Follow-up', subject: 'Liam\'s Term 1 Academic Performance', body: 'Dear Mr. Smith,\n\nLiam is performing exceptionally well in Mathematics and Sciences. Let us discuss his project topics during the upcoming meeting.' },
      ];
    }
    if (currentRole === 'coordinator') {
      return [
        { label: 'Leave Approved', subject: 'Re: Leave Notification — Approved', body: 'Leave is acknowledged and entered in the faculty attendance roster. Substitution has been arranged.' },
        { label: 'Council Meeting Notice', subject: 'Academic Wing Council Review Notice', body: 'Please attend the academic council review today at 04:00 PM in Conference Room 2.' },
        { label: 'Parent Circular', subject: 'School Academic Circular — Term 1', body: 'Official communication regarding examination guidelines, syllabus completion, and attendance eligibility.' },
      ];
    }
    return [
      { label: 'Child Leave Notice', subject: 'Liam Smith Absence Notification', body: 'Dear Teacher,\n\nLiam is unable to attend classes today due to a medical appointment. Kindly grant excused leave.' },
      { label: 'Progress Inquiry', subject: 'Inquiry regarding Term 1 Preparation', body: 'Dear Faculty,\n\nCould we arrange a short call regarding Liam\'s preparatory schedule for upcoming board tests?' },
    ];
  }, [currentRole]);

  // Filter messages based on active tab & search
  const visibleMessages = useMemo(() => {
    let list = messages;

    if (activeTab === 'inbox') {
      // Messages addressed to current role
      list = list.filter((m) => m.toRole === currentRole);
    } else if (activeTab === 'sent') {
      // Messages sent by current role
      list = list.filter((m) => m.fromRole === currentRole);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.subject.toLowerCase().includes(q) ||
          m.body.toLowerCase().includes(q) ||
          m.fromName.toLowerCase().includes(q) ||
          m.toName.toLowerCase().includes(q)
      );
    }

    return list;
  }, [messages, activeTab, currentRole, searchQuery]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) {
      toast.error('Please enter both a subject and message body.');
      return;
    }

    const selectedTarget = recipientOptions.find((o) => o.value === toRecipient) || recipientOptions[0];
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: MessageItem = {
      id: 'MSG-' + Date.now(),
      fromName: currentUserName,
      fromRole: currentRole,
      fromUsername: user?.username || 'user',
      toName: selectedTarget.label,
      toRole: toRecipient,
      toUsername: selectedTarget.username,
      subject: subject.trim(),
      body: body.trim(),
      timestamp: timeStr,
      date: 'Today',
      read: false,
      isUrgent,
    };

    const updated = [newMsg, ...messages];
    setMessages(updated);
    try {
      localStorage.setItem('evergrow_inbox_messages', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('evergrow:new-message'));
    } catch (err) {}

    toast.success(`Message sent to ${selectedTarget.label}! It is now delivered to their inbox.`);
    setSelectedMessage(newMsg);
    setSubject('');
    setBody('');
    setShowCompose(false);
  };

  const handleReply = (msg: MessageItem) => {
    setToRecipient(msg.fromRole);
    setSubject(msg.subject.startsWith('Re:') ? msg.subject : `Re: ${msg.subject}`);
    setBody(`\n\n--- In reply to ${msg.fromName} ---\n> ${msg.body.replace(/\n/g, '\n> ')}`);
    setShowCompose(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header Card */}
      <div className="ios-card rounded-[28px] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0071E3] to-[#0077ED] flex items-center justify-center shadow-lg text-white">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-slate-800 tracking-tight">Direct Campus Inbox</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                {currentRole === 'teacher' ? 'Faculty Portal' : currentRole === 'coordinator' ? 'Coordinator Council' : 'Parent Portal'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Unified communication hub between Teachers, Academic Coordinators, and Parents.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCompose(true)}
          className="ios-gloss-btn px-5 py-2.5 text-xs font-semibold flex items-center space-x-2 transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>New Message</span>
        </button>
      </div>

      {/* Main 2-Column Split: Message List on Left, Active Message / Compose on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Message Navigator (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Tabs & Search */}
          <div className="ios-card rounded-[22px] p-3 space-y-3">
            <div className="flex items-center space-x-1.5 bg-[#E9EEF5] p-1 rounded-xl shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF]">
              <button
                onClick={() => setActiveTab('inbox')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer border-none ${
                  activeTab === 'inbox'
                    ? 'bg-white text-[#0071E3] shadow-[2px_2px_5px_#C8D0DC,-2px_-2px_5px_#FFFFFF]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <InboxIcon className="w-3.5 h-3.5" />
                <span>Inbox ({messages.filter((m) => m.toRole === currentRole).length})</span>
              </button>
              <button
                onClick={() => setActiveTab('sent')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer border-none ${
                  activeTab === 'sent'
                    ? 'bg-white text-[#0071E3] shadow-[2px_2px_5px_#C8D0DC,-2px_-2px_5px_#FFFFFF]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <SendHorizontal className="w-3.5 h-3.5" />
                <span>Sent ({messages.filter((m) => m.fromRole === currentRole).length})</span>
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer border-none ${
                  activeTab === 'all'
                    ? 'bg-white text-[#0071E3] shadow-[2px_2px_5px_#C8D0DC,-2px_-2px_5px_#FFFFFF]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>All ({messages.length})</span>
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages by subject, name..."
                className="w-full pl-9 pr-3 py-2 bg-[#E9EEF5] rounded-xl text-xs text-slate-700 shadow-[inset_2px_2px_5px_#C8D0DC,inset_-2px_-2px_5px_#FFFFFF] border border-white/40 focus:outline-none"
              />
            </div>
          </div>

          {/* Message List */}
          <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
            {visibleMessages.length === 0 ? (
              <div className="ios-card rounded-[22px] p-8 text-center text-slate-400 space-y-2">
                <Mail className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-medium">No messages found in this folder</p>
                <button
                  onClick={() => setShowCompose(true)}
                  className="text-xs font-bold text-[#0071E3] hover:underline"
                >
                  Compose new message
                </button>
              </div>
            ) : (
              visibleMessages.map((msg) => {
                const isSelected = selectedMessage?.id === msg.id;
                const isFromMe = msg.fromRole === currentRole;
                const isUnreadForMe = !msg.read && msg.toRole === currentRole;

                return (
                  <div
                    key={msg.id}
                    onClick={() => {
                      setSelectedMessage(msg);
                      setShowCompose(false);
                      if (isUnreadForMe) {
                        const updated = messages.map((m) =>
                          m.id === msg.id ? { ...m, read: true } : m
                        );
                        setMessages(updated);
                        setSelectedMessage({ ...msg, read: true });
                        try {
                          localStorage.setItem('evergrow_inbox_messages', JSON.stringify(updated));
                          window.dispatchEvent(new CustomEvent('evergrow:new-message'));
                        } catch (e) {}
                      }
                    }}
                    className={`ios-card rounded-[20px] p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-2 border-[#0071E3] bg-blue-50/40 shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF]'
                        : 'hover:shadow-[4px_4px_10px_#C8D0DC,-4px_-4px_10px_#FFFFFF]'
                    } ${isUnreadForMe ? 'border-amber-400 bg-amber-50/20' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-[#E9EEF5] shadow-[2px_2px_4px_#C8D0DC,-2px_-2px_4px_#FFFFFF] flex items-center justify-center text-[#0071E3] text-xs font-black shrink-0">
                          {isFromMe ? 'To' : msg.fromName.charAt(0)}
                        </div>
                        <div className="truncate">
                          <span className="text-xs font-bold text-slate-800 block truncate">
                            {isFromMe ? `To: ${msg.toName}` : msg.fromName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {isFromMe ? `Delivered to ${msg.toRole}` : `From ${msg.fromRole}`}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1.5 shrink-0">
                        {isUnreadForMe && (
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-500 text-white shadow-xs">
                            NEW
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2.5">
                      <h4 className="text-xs font-bold text-slate-900 truncate flex items-center space-x-1.5">
                        {msg.isUrgent && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                        )}
                        <span>{msg.subject}</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                        {msg.body}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Message Detail View OR Compose Box (7 cols) */}
        <div className="lg:col-span-7">
          {showCompose ? (
            /* Compose New Message Form */
            <div className="ios-card rounded-[28px] p-6 space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#0071E3] flex items-center justify-center">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-800">Compose Direct Message</h2>
                    <p className="text-[11px] text-slate-400">
                      From: <span className="font-bold text-slate-700">{currentUserName}</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCompose(false)}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>

              {/* Quick Template Pills */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Quick Message Templates:
                </label>
                <div className="flex flex-wrap gap-2">
                  {quickTemplates.map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setSubject(tpl.subject);
                        setBody(tpl.body);
                      }}
                      className="px-3 py-1 rounded-full text-[11px] font-semibold bg-[#E9EEF5] text-slate-700 shadow-[2px_2px_4px_#C8D0DC,-2px_-2px_4px_#FFFFFF] hover:bg-[#DCE3EF] active:shadow-[inset_2px_2px_4px_#C8D0DC] transition-all cursor-pointer border-none"
                    >
                      <Sparkles className="w-3 h-3 inline-block mr-1 text-[#0071E3]" />
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Select Recipient:
                  </label>
                  <select
                    value={toRecipient}
                    onChange={(e) => setToRecipient(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-[#E9EEF5] rounded-xl text-xs font-semibold text-slate-800 shadow-[inset_2px_2px_5px_#C8D0DC,inset_-2px_-2px_5px_#FFFFFF] border border-white/40 focus:outline-none"
                  >
                    {recipientOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label} ({opt.value.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Subject:</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. I am on leave today"
                    className="w-full px-3.5 py-2.5 bg-[#E9EEF5] rounded-xl text-xs text-slate-800 font-semibold shadow-[inset_2px_2px_5px_#C8D0DC,inset_-2px_-2px_5px_#FFFFFF] border border-white/40 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Message Body:</label>
                  <textarea
                    required
                    rows={6}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Type your message here... (e.g. I am on leave today, please arrange substitution for Period 2)"
                    className="w-full px-3.5 py-3 bg-[#E9EEF5] rounded-xl text-xs text-slate-800 shadow-[inset_2px_2px_5px_#C8D0DC,inset_-2px_-2px_5px_#FFFFFF] border border-white/40 focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center space-x-2 text-xs font-semibold text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isUrgent}
                      onChange={(e) => setIsUrgent(e.target.checked)}
                      className="rounded accent-[#0071E3]"
                    />
                    <span>Mark as Urgent / Action Required</span>
                  </label>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowCompose(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="ios-gloss-btn px-6 py-2.5 text-xs font-bold flex items-center space-x-2 shadow-md cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Message</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : selectedMessage ? (
            /* Selected Message Reading View */
            <div className="ios-card rounded-[28px] p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-200/60 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base font-black text-slate-900 tracking-tight">
                      {selectedMessage.subject}
                    </h2>
                    {selectedMessage.isUrgent && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-rose-100 text-rose-700 border border-rose-200">
                        Urgent
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">From: {selectedMessage.fromName}</span>
                    <span>•</span>
                    <span>To: {selectedMessage.toName}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-700 block">
                    {selectedMessage.timestamp}
                  </span>
                  <span className="text-[10px] text-slate-400">{selectedMessage.date}</span>
                </div>
              </div>

              {/* Message Content */}
              <div className="p-5 rounded-2xl bg-white/70 border border-slate-200/60 shadow-inner">
                <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                  {selectedMessage.body}
                </p>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Delivered via Ever Grow Campus Messenger</span>
                </div>

                <div className="flex items-center space-x-3">
                  {!selectedMessage.read && selectedMessage.toRole === currentRole && (
                    <button
                      onClick={() => {
                        const updated = messages.map((m) =>
                          m.id === selectedMessage.id ? { ...m, read: true } : m
                        );
                        setMessages(updated);
                        setSelectedMessage({ ...selectedMessage, read: true });
                        try {
                          localStorage.setItem('evergrow_inbox_messages', JSON.stringify(updated));
                          window.dispatchEvent(new CustomEvent('evergrow:new-message'));
                        } catch (e) {}
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs cursor-pointer transition-all"
                    >
                      Mark as Read
                    </button>
                  )}
                  <button
                    onClick={() => handleReply(selectedMessage)}
                    className="ios-gloss-btn px-5 py-2 text-xs font-bold flex items-center space-x-1.5 shadow-md cursor-pointer"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    <span>Reply</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="ios-card rounded-[28px] p-12 text-center text-slate-400">
              <Mail className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-semibold">Select a message to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

