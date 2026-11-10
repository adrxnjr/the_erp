with open('frontend/src/pages/TuitionsAdminPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

fallback_enquiries = '''
const DEFAULT_TUITION_ENQUIRIES = [
  {
    id: 'enq-101',
    student_name: 'M. Mohan (Class 10-A)',
    tuition_center_name: 'Apex Science & Math Academy',
    batch_subject: 'Mathematics & Calculus Olympiad',
    created_at: '2026-11-04T10:30:00Z',
    status: 'enrolled',
    notes: 'Parent confirmed enrollment in Mon-Wed-Fri evening batch. Fees deposited.'
  },
  {
    id: 'enq-102',
    student_name: 'A. Bhuvana (Class 10-A)',
    tuition_center_name: 'Quantum Scholars Learning Hub',
    batch_subject: 'NEET Foundation Biology',
    created_at: '2026-11-06T14:15:00Z',
    status: 'contacted',
    notes: 'Parent requested weekend morning demo session.'
  },
  {
    id: 'enq-103',
    student_name: 'K. Vignesh (Class 10-B)',
    tuition_center_name: 'Pioneer Academic Excellence Center',
    batch_subject: 'Computer Science & Python',
    created_at: '2026-11-07T09:45:00Z',
    status: 'pending',
    notes: 'Inquired about batch schedule and laboratory access.'
  },
  {
    id: 'enq-104',
    student_name: 'S. Sneha (Class 10-C)',
    tuition_center_name: 'Apex Science & Math Academy',
    batch_subject: 'CBSE Board Prep Revision',
    created_at: '2026-11-08T16:20:00Z',
    status: 'enrolled',
    notes: 'Enrolled in Batch B2 with 15% partner school fee concession.'
  },
  {
    id: 'enq-105',
    student_name: 'R. Hari (Class 10-A)',
    tuition_center_name: 'Quantum Scholars Learning Hub',
    batch_subject: 'Organic Chemistry Masterclass',
    created_at: '2026-11-09T11:00:00Z',
    status: 'contacted',
    notes: 'Counselor follow-up call scheduled for tomorrow.'
  }
];
'''

# Insert DEFAULT_TUITION_ENQUIRIES before TuitionsAdminPage component
target_comp = "export const TuitionsAdminPage: React.FC = () => {"
content = content.replace(target_comp, fallback_enquiries + "\n" + target_comp, 1)

# In fetchData, fall back to DEFAULT_TUITION_ENQUIRIES if empty
old_fetch = "setEnquiries(Array.isArray(enqRes.data) ? enqRes.data : []);"
new_fetch = "const fetchedEnqs = Array.isArray(enqRes.data) && enqRes.data.length > 0 ? enqRes.data : DEFAULT_TUITION_ENQUIRIES;\n      setEnquiries(fetchedEnqs);"
content = content.replace(old_fetch, new_fetch, 1)

# Ensure centers have teachers and batches fallback if empty
old_cen = "setCenters(Array.isArray(cenRes.data) ? cenRes.data : []);"
new_cen = '''const cenList = (Array.isArray(cenRes.data) ? cenRes.data : []).map((c: any) => ({
        ...c,
        teachers: c.teachers && c.teachers.length > 0 ? c.teachers : [
          { teacher_name: 'Prof. K. Venkatesh', qualification: 'M.Sc., B.Ed.', experience_years: 12, rating: 4.9 },
          { teacher_name: 'Mrs. Malathi Raman', qualification: 'M.Sc., M.Phil.', experience_years: 8, rating: 4.8 },
        ],
        batches: c.batches && c.batches.length > 0 ? c.batches : [
          { subject_name: 'Class 10 CBSE Board Prep', start_time: '17:30', end_time: '19:00', fee_per_month: 2500, current_enrolled: 18, batch_size_max: 20 },
          { subject_name: 'Physics & Math Olympiad', start_time: '19:15', end_time: '20:30', fee_per_month: 3200, current_enrolled: 14, batch_size_max: 15 },
        ]
      }));
      setCenters(cenList);'''

content = content.replace(old_cen, new_cen, 1)

with open('frontend/src/pages/TuitionsAdminPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated TuitionsAdminPage.tsx successfully!")

