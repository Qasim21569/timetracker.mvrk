import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';

// Define styles for PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    textAlign: 'center',
  },
  logo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0ea5e9',
    marginBottom: 10,
    textAlign: 'center',
  },
  logoContainer: {
    alignSelf: 'center',
    marginBottom: 15,
  },
  logoImage: {
    maxWidth: 150,
    maxHeight: 60,
    objectFit: 'contain',
  },
  logoPlaceholder: {
    width: 120,
    height: 40,
    backgroundColor: '#F3F4F6',
    border: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 10,
    color: '#6B7280',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 20,
  },
  projectInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
    paddingBottom: 10,
    borderBottom: 1,
    borderBottomColor: '#CCCCCC',
  },
  infoBlock: {
    flexDirection: 'column',
    marginHorizontal: 15,
  },
  infoLabel: {
    fontSize: 9,
    color: '#666666',
    marginBottom: 2,
    textAlign: 'center',
  },
  infoValue: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  employeeSection: {
    marginBottom: 25,
  },
  employeeName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 4,
  },
  table: {
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderBottom: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: 1,
    borderBottomColor: '#F3F4F6',
    paddingVertical: 6,
    paddingHorizontal: 5,
    minHeight: 25,
  },
  subtotalRow: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderTop: 2,
    borderTopColor: '#D1D5DB',
    paddingVertical: 8,
    paddingHorizontal: 5,
    fontWeight: 'bold',
  },
  dateColumn: {
    width: '25%',
    fontSize: 9,
  },
  hoursColumn: {
    width: '15%',
    fontSize: 9,
    textAlign: 'center',
  },
  notesColumn: {
    width: '60%',
    fontSize: 9,
    paddingRight: 10,
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#374151',
  },
  totalSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    textAlign: 'center',
  },
  totalText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#666666',
    fontSize: 8,
    borderTop: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
  },
});

interface TimeEntry {
  id: string;
  date: string;
  hours: number;
  note: string;
}

interface EmployeeData {
  userId: string;
  name: string;
  entries: TimeEntry[];
  subtotal: number;
}

interface PDFReportProps {
  employeeData: EmployeeData[];
  projectName: string;
  clientName: string;
  reportPeriod: string;
  month: string;
  totalHours: number;
  logoUrl?: string; // Optional logo URL
}

const PDFDocument: React.FC<PDFReportProps> = ({
  employeeData,
  projectName,
  clientName,
  reportPeriod,
  month,
  totalHours,
  logoUrl,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        {/* Company Logo */}
        <View style={styles.logoContainer}>
          {logoUrl ? (
            <Image style={styles.logoImage} src={logoUrl} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>COMPANY LOGO</Text>
            </View>
          )}
        </View>
        <Text style={styles.title}>
          Monthly Time Cards - {format(new Date(month + '-01'), 'MMMM yyyy')}
        </Text>
        <Text style={styles.subtitle}>For {clientName}</Text>
      </View>

      {/* Project Info - Removed Report Period as requested */}
      <View style={styles.projectInfo}>
        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>Client:</Text>
          <Text style={styles.infoValue}>{clientName}</Text>
        </View>
        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>Project:</Text>
          <Text style={styles.infoValue}>{projectName}</Text>
        </View>
      </View>

      {/* Employee Tables */}
      {employeeData.map((employee, index) => (
        <View key={employee.userId} style={styles.employeeSection}>
          <Text style={styles.employeeName}>{employee.name}</Text>
          
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.dateColumn, styles.tableHeaderText]}>Date</Text>
              <Text style={[styles.hoursColumn, styles.tableHeaderText]}>Hours</Text>
              <Text style={[styles.notesColumn, styles.tableHeaderText]}>Notes</Text>
            </View>
            
            {/* Table Rows */}
            {employee.entries.map((entry) => (
              <View key={entry.id} style={styles.tableRow}>
                <Text style={styles.dateColumn}>
                  {format(new Date(entry.date), 'MM/dd/yyyy')}
                </Text>
                <Text style={styles.hoursColumn}>
                  {entry.hours.toFixed(2)}
                </Text>
                <Text style={styles.notesColumn}>
                  {entry.note || '-'}
                </Text>
              </View>
            ))}
            
            {/* Subtotal Row */}
            <View style={styles.subtotalRow}>
              <Text style={styles.dateColumn}>Subtotal:</Text>
              <Text style={styles.hoursColumn}>{employee.subtotal.toFixed(2)}</Text>
              <Text style={styles.notesColumn}></Text>
            </View>
          </View>
        </View>
      ))}

      {/* Total Hours */}
      <View style={styles.totalSection}>
        <Text style={styles.totalText}>TOTAL HOURS: {totalHours.toFixed(2)}</Text>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        Generated on {format(new Date(), 'MMMM d, yyyy \'at\' h:mm a')}
      </Text>
    </Page>
  </Document>
);

interface PDFDownloadButtonProps extends PDFReportProps {
  fileName?: string;
}

export const PDFDownloadButton: React.FC<PDFDownloadButtonProps> = ({
  fileName = 'time-report.pdf',
  ...props
}) => (
  <PDFDownloadLink
    document={<PDFDocument {...props} />}
    fileName={fileName}
  >
    {({ blob, url, loading, error }) => (
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
        disabled={loading}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {loading ? 'Generating PDF...' : 'Download PDF'}
      </button>
    )}
  </PDFDownloadLink>
);

export default PDFDocument;
