import * as XLSX from 'xlsx';
import { ResidentResponse } from './types';

export function exportResponsesToCSV(responses: ResidentResponse[], filename = 'FitVed_Society_Votes.csv') {
  if (!responses.length) return;

  const headers = ['Society', 'Name', 'Phone Number', 'Time Slot', 'Apartment / Tower', 'WhatsApp', 'Submitted At'];
  const rows = responses.map((r) => [
    `"${r.societyName.replace(/"/g, '""')}"`,
    `"${r.name.replace(/"/g, '""')}"`,
    `"${r.phoneNumber}"`,
    `"${r.slotLabel.replace(/"/g, '""')}"`,
    `"${(r.apartment || '-').replace(/"/g, '""')}"`,
    `"${(r.whatsapp || r.phoneNumber).replace(/"/g, '""')}"`,
    `"${new Date(r.createdAt).toLocaleString('en-IN')}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportResponsesToExcel(responses: ResidentResponse[], filename = 'FitVed_Society_Votes.xlsx') {
  if (!responses.length) return;

  const data = responses.map((r) => ({
    Society: r.societyName,
    'Resident Name': r.name,
    'Phone Number': r.phoneNumber,
    'Selected Time Slot': r.slotLabel,
    'Apartment / Tower': r.apartment || '-',
    'WhatsApp Number': r.whatsapp || r.phoneNumber,
    'Submission Date': new Date(r.createdAt).toLocaleString('en-IN'),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Votes');
  XLSX.writeFile(workbook, filename);
}
