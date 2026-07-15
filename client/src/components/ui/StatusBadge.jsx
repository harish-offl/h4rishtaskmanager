const MAP = {
  // Lead statuses
  'New': 'badge-info', 'Not Contacted': 'badge-neutral', 'Contacted': 'badge-neutral',
  'Follow-Up Required': 'badge-warning', 'Interested': 'badge-info', 'Meeting Scheduled': 'badge-info',
  'Proposal Sent': 'badge-warning', 'Negotiation': 'badge-warning', 'Converted': 'badge-success',
  'Not Interested': 'badge-neutral', 'Lost': 'badge-danger', 'On Hold': 'badge-neutral',
  // Task statuses
  'To-Do': 'badge-neutral', 'In Progress': 'badge-info', 'Waiting': 'badge-warning',
  'Under Review': 'badge-warning', 'Revision': 'badge-danger', 'Completed': 'badge-success',
  'Cancelled': 'badge-neutral',
  // Invoice/Payment
  'Paid': 'badge-success', 'Partially Paid': 'badge-warning', 'Pending': 'badge-neutral',
  'Overdue': 'badge-danger', 'Refunded': 'badge-neutral', 'Partial': 'badge-warning',
  // Project
  'Planning': 'badge-neutral', 'Not Started': 'badge-neutral', 'Under Review': 'badge-warning',
  'Client Approval': 'badge-warning', 'On Hold': 'badge-warning',
  // Client
  'Active': 'badge-success', 'Inactive': 'badge-neutral', 'Recurring Client': 'badge-info',
  // Priority
  'Urgent': 'badge-danger', 'High': 'badge-warning', 'Medium': 'badge-info', 'Low': 'badge-success',
}

export default function StatusBadge({ label }) {
  return <span className={`badge ${MAP[label] || 'badge-neutral'}`}>{label}</span>
}
