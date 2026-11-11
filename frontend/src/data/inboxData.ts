export interface MessageItem {
  id: string;
  fromName: string;
  fromRole: 'teacher' | 'coordinator' | 'parent';
  fromUsername: string;
  toName: string;
  toRole: 'teacher' | 'coordinator' | 'parent';
  toUsername: string;
  subject: string;
  body: string;
  timestamp: string;
  date: string;
  read: boolean;
  isUrgent?: boolean;
}

export const defaultMessages: MessageItem[] = [
  {
    id: 'MSG-001',
    fromName: 'Michael Chang',
    fromRole: 'teacher',
    fromUsername: 'teacher1',
    toName: 'Elena Rostova (Academic Coordinator)',
    toRole: 'coordinator',
    toUsername: 'coordinator1',
    subject: 'I am on leave today',
    body: 'Dear Coordinator Elena,\n\nI am on leave today due to sudden high fever and throat infection. Please arrange a faculty substitution for Grade 10-A Period 2 Mathematics (09:15 AM - 10:00 AM). Lesson notes have been shared in the faculty drive.\n\nRegards,\nMichael Chang',
    timestamp: '08:15 AM',
    date: 'Today',
    read: false,
    isUrgent: true,
  },
  {
    id: 'MSG-002',
    fromName: 'Elena Rostova (Academic Coordinator)',
    fromRole: 'coordinator',
    fromUsername: 'coordinator1',
    toName: 'Michael Chang',
    toRole: 'teacher',
    toUsername: 'teacher1',
    subject: 'Re: I am on leave today — Substitution Assigned',
    body: 'Hi Michael,\n\nLeave acknowledged and approved in the faculty register. Mr. David Joseph has been assigned for Period 2 Mathematics substitution. Please rest and get well soon!\n\nBest,\nElena Rostova',
    timestamp: '08:35 AM',
    date: 'Today',
    read: true,
  },
  {
    id: 'MSG-003',
    fromName: 'William Smith (Parent)',
    fromRole: 'parent',
    fromUsername: 'parent1',
    toName: 'Michael Chang',
    toRole: 'teacher',
    toUsername: 'teacher1',
    subject: "Query on Liam's Science Olympiad Preparation",
    body: "Dear Mr. Chang,\n\nCould you please share the recommended reference chapters and mock test schedule for Liam's Inter-School Science Olympiad preparation? He is eager to prepare this weekend.\n\nThank you,\nWilliam Smith",
    timestamp: 'Yesterday, 04:45 PM',
    date: 'Yesterday',
    read: true,
  },
  {
    id: 'MSG-004',
    fromName: 'Elena Rostova (Academic Coordinator)',
    fromRole: 'coordinator',
    fromUsername: 'coordinator1',
    toName: 'William Smith (Parent)',
    toRole: 'parent',
    toUsername: 'parent1',
    subject: 'Term 1 Parent-Teacher Interaction & Review Meeting',
    body: "Dear Mr. Smith,\n\nYou are cordially invited to our Term 1 Academic Wing Council Review on Nov 15 at 03:30 PM in the School Auditorium. We will discuss Liam's academic progress and term project evaluation.\n\nWarm regards,\nElena Rostova",
    timestamp: '10 Nov, 11:20 AM',
    date: '10 Nov',
    read: true,
  },
];

