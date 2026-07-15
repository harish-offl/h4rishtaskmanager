import { uid } from './data'

export const SAMPLE_LEADS = [
  { id: uid(), name: 'Chillax Cafe', company: 'Chillax Cafe', phone: '9876543210', whatsapp: '9876543210', email: 'hello@chillaxcafe.com', industry: 'Food & Beverage', category: 'Restaurant', location: 'Chennai', source: 'Instagram', service: 'Social Media Marketing', value: 15000, assigned: 'Arjun S', priority: 'High', status: 'Proposal Sent', firstContact: '2026-06-10', lastContact: '2026-07-01', nextFollowup: '2026-07-14', expectedClose: '2026-07-20', notes: 'Interested in reels + posters package', whatsappSent: false, whatsappSentAt: null, messageCount: 0, lastWhatsappMessage: '', createdAt: new Date().toISOString() },
  { id: uid(), name: 'Naveen Grills', company: 'Naveen Grills', phone: '9988776655', whatsapp: '9988776655', email: 'naveen@grills.in', industry: 'Food & Beverage', category: 'Restaurant', location: 'Bangalore', source: 'Referral', service: 'Content Creation', value: 8000, assigned: 'Priya K', priority: 'Medium', status: 'Follow-Up Required', firstContact: '2026-06-20', lastContact: '2026-07-05', nextFollowup: '2026-07-12', expectedClose: '2026-07-25', notes: 'Follow up on WhatsApp', whatsappSent: false, whatsappSentAt: null, messageCount: 0, lastWhatsappMessage: '', createdAt: new Date().toISOString() },
  { id: uid(), name: 'SMP Foods', company: 'SMP Foods Pvt Ltd', phone: '9123456789', whatsapp: '9123456789', email: 'info@smpfoods.com', industry: 'Food & Beverage', category: 'FMCG', location: 'Mumbai', source: 'Google', service: 'Product Photography', value: 25000, assigned: 'Arjun S', priority: 'High', status: 'Converted', firstContact: '2026-05-15', lastContact: '2026-06-28', nextFollowup: '', expectedClose: '2026-07-01', notes: 'Converted to client', whatsappSent: false, whatsappSentAt: null, messageCount: 0, lastWhatsappMessage: '', createdAt: new Date().toISOString() },
  { id: uid(), name: 'Studio 11', company: 'Studio 11 Productions', phone: '9001122334', whatsapp: '9001122334', email: 'studio11@gmail.com', industry: 'Media & Entertainment', category: 'Production House', location: 'Hyderabad', source: 'LinkedIn', service: 'Video Marketing', value: 35000, assigned: 'Rahul M', priority: 'Urgent', status: 'Interested', firstContact: '2026-07-01', lastContact: '2026-07-08', nextFollowup: '2026-07-13', expectedClose: '2026-07-30', notes: 'Very interested, sent portfolio', whatsappSent: false, whatsappSentAt: null, messageCount: 0, lastWhatsappMessage: '', createdAt: new Date().toISOString() },
]

export const SAMPLE_CLIENTS = [
  { id: uid(), name: 'SMP Foods', company: 'SMP Foods Pvt Ltd', phone: '9123456789', whatsapp: '9123456789', email: 'info@smpfoods.com', address: '42, MG Road, Mumbai 400001', industry: 'Food & Beverage', services: ['Product Photography'], manager: 'Arjun S', projectValue: 25000, totalRevenue: 20000, pending: 5000, status: 'Active', createdAt: new Date().toISOString() },
  { id: uid(), name: 'Riya Bridal Studio', company: 'Riya Bridal Studio', phone: '9812345670', whatsapp: '9812345670', email: 'riya@bridalstudio.in', address: '15, Anna Nagar, Chennai 600040', industry: 'Fashion & Beauty', services: ['Social Media Marketing', 'Graphic Design'], manager: 'Priya K', projectValue: 18000, totalRevenue: 18000, pending: 0, status: 'Active', createdAt: new Date().toISOString() },
]

export const SAMPLE_PROJECTS = [
  { id: uid(), name: 'SMP Foods Product Campaign', client: 'SMP Foods', type: 'Product Photography', service: 'Photography', manager: 'Arjun S', team: ['Arjun S', 'Rahul M'], start: '2026-07-01', deadline: '2026-07-31', value: 25000, received: 20000, pending: 5000, progress: 65, priority: 'High', status: 'In Progress', description: 'Product photography for Q3 catalogue', createdAt: new Date().toISOString() },
  { id: uid(), name: 'Riya Bridal June Package', client: 'Riya Bridal Studio', type: 'Social Media Marketing', service: 'Social Media', manager: 'Priya K', team: ['Priya K'], start: '2026-06-01', deadline: '2026-06-30', value: 18000, received: 18000, pending: 0, progress: 100, priority: 'Medium', status: 'Completed', description: 'Monthly social media management', createdAt: new Date().toISOString() },
]

export const SAMPLE_TASKS = [
  { id: uid(), title: 'Edit restaurant promotional reel', description: '30-second reel for Chillax Cafe', client: 'Chillax Cafe', project: 'SMP Foods Product Campaign', assigned: 'Rahul M', createdBy: 'Arjun S', start: '2026-07-10', due: '2026-07-14', time: '17:00', priority: 'High', status: 'In Progress', progress: 40, subtasks: [], createdAt: new Date().toISOString() },
  { id: uid(), title: 'Prepare monthly content calendar', description: 'July content calendar for all clients', client: '', project: '', assigned: 'Priya K', createdBy: 'Arjun S', start: '2026-07-11', due: '2026-07-13', time: '12:00', priority: 'High', status: 'To-Do', progress: 0, subtasks: [], createdAt: new Date().toISOString() },
  { id: uid(), title: 'Follow up website lead', description: 'Call Studio 11 regarding website proposal', client: 'Studio 11', project: '', assigned: 'Arjun S', createdBy: 'Arjun S', start: '2026-07-11', due: '2026-07-11', time: '11:00', priority: 'Urgent', status: 'To-Do', progress: 0, subtasks: [], createdAt: new Date().toISOString() },
  { id: uid(), title: 'Send client invoice', description: 'Send July invoice to SMP Foods', client: 'SMP Foods', project: 'SMP Foods Product Campaign', assigned: 'Arjun S', createdBy: 'Arjun S', start: '2026-07-11', due: '2026-07-11', time: '10:00', priority: 'Urgent', status: 'Completed', progress: 100, subtasks: [], createdAt: new Date().toISOString() },
  { id: uid(), title: 'Design Instagram carousel', description: '5-slide carousel for Riya Bridal', client: 'Riya Bridal Studio', project: 'Riya Bridal June Package', assigned: 'Priya K', createdBy: 'Arjun S', start: '2026-07-12', due: '2026-07-15', time: '18:00', priority: 'Medium', status: 'To-Do', progress: 0, subtasks: [], createdAt: new Date().toISOString() },
  { id: uid(), title: 'Review campaign performance', description: 'Analyse June Meta Ads performance', client: 'SMP Foods', project: 'SMP Foods Product Campaign', assigned: 'Arjun S', createdBy: 'Arjun S', start: '2026-07-10', due: '2026-07-12', time: '15:00', priority: 'Medium', status: 'Under Review', progress: 80, subtasks: [], createdAt: new Date().toISOString() },
]

export const SAMPLE_INVOICES = [
  { id: uid(), number: 'AD-INV-001', business: 'Arrise Digital', client: 'SMP Foods', company: 'SMP Foods Pvt Ltd', date: '2026-07-01', dueDate: '2026-07-15', billing: 'Monthly - July 2026', projectType: 'Product Photography', services: [{ name: 'Product Photography', desc: '50 product shots', qty: 1, rate: 20000, discount: 0, tax: 18, total: 23600 }, { name: 'Editing & Retouching', desc: 'Post-production', qty: 1, rate: 1400, discount: 0, tax: 0, total: 1400 }], total: 25000, received: 20000, pending: 5000, cleared: 'Partially', status: 'Partially Paid', method: 'UPI', receivedDate: '2026-07-03', notes: 'Balance ₹5,000 due on delivery', createdAt: new Date().toISOString() },
  { id: uid(), number: 'AD-INV-002', business: 'Arrise Digital', client: 'Riya Bridal Studio', company: 'Riya Bridal Studio', date: '2026-06-01', dueDate: '2026-06-10', billing: 'Monthly - June 2026', projectType: 'Social Media Marketing', services: [{ name: 'Reels Editing', desc: '8 reels', qty: 8, rate: 500, discount: 0, tax: 0, total: 4000 }, { name: 'Poster Design', desc: 'Static posters', qty: 10, rate: 80, discount: 0, tax: 0, total: 800 }, { name: 'Carousel Design', desc: '5-slide carousel', qty: 2, rate: 250, discount: 0, tax: 0, total: 500 }], total: 5300, received: 5300, pending: 0, cleared: 'Yes', status: 'Paid', method: 'Bank Transfer', receivedDate: '2026-06-08', notes: '', createdAt: new Date().toISOString() },
]

export const SAMPLE_PAYMENTS = [
  { id: uid(), client: 'SMP Foods', project: 'SMP Foods Product Campaign', invoice: 'AD-INV-001', invoiceTotal: 25000, paid: 20000, remaining: 5000, date: '2026-07-03', mode: 'UPI', ref: 'UPI/2026/07/SMP001', status: 'Partial', notes: 'Advance payment', createdAt: new Date().toISOString() },
  { id: uid(), client: 'Riya Bridal Studio', project: 'Riya Bridal June Package', invoice: 'AD-INV-002', invoiceTotal: 5300, paid: 5300, remaining: 0, date: '2026-06-08', mode: 'Bank Transfer', ref: 'NEFT/2026/06/RBS001', status: 'Paid', notes: 'Full payment received', createdAt: new Date().toISOString() },
]

export const SAMPLE_REVENUE = [
  { id: uid(), date: '2026-07-03', client: 'SMP Foods', project: 'SMP Foods Product Campaign', service: 'Product Photography', invoice: 'AD-INV-001', amount: 20000, method: 'UPI', notes: '', createdAt: new Date().toISOString() },
  { id: uid(), date: '2026-06-08', client: 'Riya Bridal Studio', project: 'Riya Bridal June Package', service: 'Social Media Marketing', invoice: 'AD-INV-002', amount: 5300, method: 'Bank Transfer', notes: '', createdAt: new Date().toISOString() },
  { id: uid(), date: '2026-07-05', client: 'Direct Client', project: '', service: 'Video Editing', invoice: '', amount: 12000, method: 'Cash', notes: 'Walk-in client payment', createdAt: new Date().toISOString() },
  { id: uid(), date: '2026-07-08', client: 'SMP Foods', project: 'SMP Foods Product Campaign', service: 'Meta Ads', invoice: '', amount: 18000, method: 'UPI', notes: 'Monthly ads retainer', createdAt: new Date().toISOString() },
  { id: uid(), date: '2026-07-09', client: 'Studio 11', project: '', service: 'Video Marketing', invoice: '', amount: 30200, method: 'Bank Transfer', notes: '', createdAt: new Date().toISOString() },
]

export const SAMPLE_EXPENSES = [
  { id: uid(), date: '2026-07-01', category: 'Software Subscription', title: 'Adobe Creative Cloud', vendor: 'Adobe', amount: 4500, method: 'Credit Card', paidBy: 'Arjun S', project: '', notes: 'Monthly subscription', recurring: true, createdAt: new Date().toISOString() },
  { id: uid(), date: '2026-07-01', category: 'Software Subscription', title: 'Canva Pro', vendor: 'Canva', amount: 999, method: 'UPI', paidBy: 'Priya K', project: '', notes: '', recurring: true, createdAt: new Date().toISOString() },
  { id: uid(), date: '2026-07-05', category: 'Advertising', title: 'Meta Ads Boost', vendor: 'Meta', amount: 3000, method: 'Credit Card', paidBy: 'Arjun S', project: 'SMP Foods Product Campaign', notes: 'Client campaign boost', recurring: false, createdAt: new Date().toISOString() },
  { id: uid(), date: '2026-07-07', category: 'Freelancer Payment', title: 'Freelance Photographer', vendor: 'Kiran P', amount: 8000, method: 'UPI', paidBy: 'Arjun S', project: 'SMP Foods Product Campaign', notes: 'Shoot day payment', recurring: false, createdAt: new Date().toISOString() },
  { id: uid(), date: '2026-07-09', category: 'Internet', title: 'Airtel Business', vendor: 'Airtel', amount: 999, method: 'Bank Transfer', paidBy: 'Arjun S', project: '', notes: '', recurring: true, createdAt: new Date().toISOString() },
  { id: uid(), date: '2026-07-10', category: 'Hosting and Domain', title: 'AWS Hosting', vendor: 'Amazon', amount: 2200, method: 'Credit Card', paidBy: 'Arjun S', project: '', notes: '', recurring: true, createdAt: new Date().toISOString() },
  { id: uid(), date: '2026-07-11', category: 'Miscellaneous', title: 'Office supplies', vendor: 'Local Shop', amount: 500, method: 'Cash', paidBy: 'Priya K', project: '', notes: '', recurring: false, createdAt: new Date().toISOString() },
]

export const SAMPLE_TODOS = [
  { id: uid(), title: 'Follow up pending leads', desc: 'Call Naveen Grills and Studio 11', assigned: 'Arjun S', due: '2026-07-11', time: '10:00', priority: 'High', status: 'To-Do', repeat: 'Daily', createdBy: 'Arjun S', createdAt: new Date().toISOString() },
  { id: uid(), title: 'Check client messages', desc: 'Reply to all WhatsApp and email messages', assigned: 'Priya K', due: '2026-07-11', time: '09:00', priority: 'High', status: 'In Progress', repeat: 'Daily', createdBy: 'Arjun S', createdAt: new Date().toISOString() },
  { id: uid(), title: 'Send invoices', desc: 'Send July invoices to all active clients', assigned: 'Arjun S', due: '2026-07-15', time: '12:00', priority: 'Medium', status: 'To-Do', repeat: 'Monthly', createdBy: 'Arjun S', createdAt: new Date().toISOString() },
  { id: uid(), title: 'Review designs', desc: 'Review all pending design deliverables', assigned: 'Arjun S', due: '2026-07-12', time: '16:00', priority: 'Medium', status: 'To-Do', repeat: 'No Repeat', createdBy: 'Priya K', createdAt: new Date().toISOString() },
  { id: uid(), title: 'Conduct team meeting', desc: 'Weekly sync with full team', assigned: 'Arjun S', due: '2026-07-14', time: '11:00', priority: 'Low', status: 'Completed', repeat: 'Weekly', createdBy: 'Arjun S', createdAt: new Date().toISOString() },
]

export const SAMPLE_TEAM = [
  { id: uid(), name: 'Arjun S', email: 'arjun@arrrise.in', phone: '9876543000', role: 'Admin', dept: 'Management', avatar: 'AS', createdAt: new Date().toISOString() },
  { id: uid(), name: 'Priya K', email: 'priya@arrrise.in', phone: '9876543001', role: 'Graphic Designer', dept: 'Design', avatar: 'PK', createdAt: new Date().toISOString() },
  { id: uid(), name: 'Rahul M', email: 'rahul@arrrise.in', phone: '9876543002', role: 'Video Editor', dept: 'Production', avatar: 'RM', createdAt: new Date().toISOString() },
]
