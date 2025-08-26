import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit3, FileText, Download, Save } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { TimeTrackingService, ProjectService, UserService } from '@/services/api';
import MainLayout from '@/components/layout/MainLayout';
import { PDFDownloadButton } from '@/services/pdfService';

interface TimeEntry {
  id: string;
  date: string;
  hours: number;
  note: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    username: string;
  };
}

interface EmployeeData {
  userId: string;
  name: string;
  entries: TimeEntry[];
  subtotal: number;
}

const ReportEditExport = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [employeeData, setEmployeeData] = useState<EmployeeData[]>([]);
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [reportPeriod, setReportPeriod] = useState('');
  const [totalHours, setTotalHours] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Get parameters from URL
  const project = searchParams.get('project') || '';
  const user = searchParams.get('user') || 'All Users';
  const month = searchParams.get('month') || format(new Date(), 'yyyy-MM');

  useEffect(() => {
    loadReportData();
  }, [project, user, month]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      // Parse month to get date range
      const [year, monthNum] = month.split('-').map(Number);
      const startDate = startOfMonth(new Date(year, monthNum - 1));
      const endDate = endOfMonth(new Date(year, monthNum - 1));
      
      // Set report period
      setReportPeriod(format(startDate, 'MMMM d') + ' - ' + format(endDate, 'd, yyyy'));
      
      // Get time entries for the selected period
      const timeEntries = await TimeTrackingService.getAllTimeEntries({
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd')
      });

      // Get all projects and users for reference
      const [allProjects, allUsers] = await Promise.all([
        ProjectService.getAllProjects(),
        UserService.getAllUsers({ is_active: true })
      ]);

      // Find selected project
      const selectedProject = allProjects.find(p => p.name === project);
      if (selectedProject) {
        setProjectName(selectedProject.name);
        setClientName(selectedProject.name); // Client name = Project name as you specified
      }

      // Filter entries by project
      const projectEntries = timeEntries.filter((entry: any) => {
        const entryProject = allProjects.find(p => p.id === entry.project);
        return entryProject?.name === project;
      });

      // Group entries by user
      const groupedByUser: { [key: string]: TimeEntry[] } = {};
      projectEntries.forEach((entry: any) => {
        const userId = entry.user.toString();
        if (!groupedByUser[userId]) {
          groupedByUser[userId] = [];
        }
        
        // Find user details
        const userDetails = allUsers.find(u => String(u.id) === userId);
        
        groupedByUser[userId].push({
          id: entry.id,
          date: entry.date,
          hours: entry.hours,
          note: entry.note || '',
          user: {
            id: userId,
            first_name: (userDetails as any)?.first_name || '',
            last_name: (userDetails as any)?.last_name || '',
            username: (userDetails as any)?.username || ''
          }
        });
      });

      // Convert to EmployeeData format
      const employeeDataArray: EmployeeData[] = Object.keys(groupedByUser).map(userId => {
        const entries = groupedByUser[userId];
        const userDetails = entries[0]?.user;
        const subtotal = entries.reduce((sum, entry) => sum + Number(entry.hours), 0);
        
        return {
          userId,
          name: `${(userDetails as any)?.first_name || ''} ${(userDetails as any)?.last_name || ''}`.trim() || (userDetails as any)?.username || 'Unknown User',
          entries: entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
          subtotal
        };
      });

      // Filter by selected user if not "All Users"
      const filteredEmployeeData = user === 'All Users' 
        ? employeeDataArray 
        : employeeDataArray.filter(emp => emp.name === user);

      setEmployeeData(filteredEmployeeData);
      
      // Calculate total hours
      const total = filteredEmployeeData.reduce((sum, emp) => sum + emp.subtotal, 0);
      setTotalHours(total);

    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditEntry = (employeeIndex: number, entryIndex: number, field: 'date' | 'hours' | 'note', value: string | number) => {
    setHasUnsavedChanges(true);
    setEmployeeData(prev => {
      const updated = [...prev];
      const employee = { ...updated[employeeIndex] };
      const entries = [...employee.entries];
      
      if (field === 'hours') {
        entries[entryIndex] = { ...entries[entryIndex], hours: Number(value) };
        // Recalculate subtotal
        employee.subtotal = entries.reduce((sum, entry) => sum + Number(entry.hours), 0);
      } else {
        entries[entryIndex] = { ...entries[entryIndex], [field]: value };
      }
      
      employee.entries = entries;
      updated[employeeIndex] = employee;
      
      // Recalculate total hours
      const newTotal = updated.reduce((sum, emp) => sum + emp.subtotal, 0);
      setTotalHours(newTotal);
      
      return updated;
    });
  };

  const handleAddEntry = (employeeIndex: number) => {
    setHasUnsavedChanges(true);
    setEmployeeData(prev => {
      const updated = [...prev];
      const employee = { ...updated[employeeIndex] };
      const entries = [...employee.entries];
      
      // Add new empty entry
      entries.push({
        id: `temp-${Date.now()}`,
        date: format(new Date(), 'yyyy-MM-dd'),
        hours: 0,
        note: '',
        user: employee.entries[0]?.user || {
          id: employee.userId,
          first_name: '',
          last_name: '',
          username: ''
        }
      });
      
      employee.entries = entries;
      updated[employeeIndex] = employee;
      return updated;
    });
  };

  const handleRemoveEntry = (employeeIndex: number, entryIndex: number) => {
    setHasUnsavedChanges(true);
    setEmployeeData(prev => {
      const updated = [...prev];
      const employee = { ...updated[employeeIndex] };
      const entries = [...employee.entries];
      
      entries.splice(entryIndex, 1);
      
      // Recalculate subtotal
      employee.subtotal = entries.reduce((sum, entry) => sum + Number(entry.hours), 0);
      employee.entries = entries;
      updated[employeeIndex] = employee;
      
      // Recalculate total hours
      const newTotal = updated.reduce((sum, emp) => sum + emp.subtotal, 0);
      setTotalHours(newTotal);
      
      return updated;
    });
  };

  const generateFileName = () => {
    const monthYear = format(new Date(month + '-01'), 'yyyy-MM');
    const projectSlug = projectName.toLowerCase().replace(/\s+/g, '-');
    return `${projectSlug}-time-report-${monthYear}.pdf`;
  };

  const handleSaveChanges = () => {
    // This is for local editing only - doesn't affect database
    // Just mark as saved and provide user feedback
    setHasUnsavedChanges(false);
    
    // Show instant feedback without blocking UI
    const button = document.querySelector('[data-save-button="true"]');
    if (button) {
      const originalText = button.textContent;
      button.textContent = '✓ Saved!';
      button.classList.add('bg-green-200', 'text-green-800');
      
      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('bg-green-200', 'text-green-800');
      }, 2000);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-lg font-medium text-gray-700">Loading report data...</div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/reports')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">PDF Report View</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant={editMode ? "default" : "outline"}
              onClick={() => setEditMode(!editMode)}
              className="flex items-center gap-2"
            >
              <Edit3 className="h-4 w-4" />
              {editMode ? 'View Mode' : 'Edit Fields'}
            </Button>
            {editMode && hasUnsavedChanges && (
              <Button
                onClick={handleSaveChanges}
                variant="outline"
                data-save-button="true"
                className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200 flex items-center gap-2 transition-all duration-200"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            )}
            <PDFDownloadButton
              employeeData={employeeData}
              projectName={projectName}
              clientName={clientName}
              reportPeriod={reportPeriod}
              month={month}
              totalHours={totalHours}
              fileName={generateFileName()}
              logoUrl="/logo-color.png" // Company logo from public directory
            />
          </div>
        </div>

        {/* Report Info */}
        <Card className="bg-gray-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-gray-800">Monthly Time Cards - {format(new Date(month + '-01'), 'MMMM yyyy')}</h2>
              <p className="text-lg text-gray-600">Report Period: {reportPeriod}</p>
              <div className="flex justify-center gap-8 mt-4">
                <div>
                  <span className="text-sm text-gray-500">Client: </span>
                  <span className="font-semibold">{clientName}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Project: </span>
                  <span className="font-semibold">{projectName}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employee Tables */}
        {employeeData.map((employee, employeeIndex) => (
          <Card key={employee.userId} className="border border-gray-200">
            <CardHeader className="bg-blue-50 pb-4">
              <CardTitle className="text-lg font-bold text-gray-800">
                {employee.name}
                <span className="ml-4 text-sm font-normal text-gray-600">
                  {employee.subtotal.toFixed(2)} hours
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left p-3 font-semibold text-gray-700 border-r">Date</th>
                      <th className="text-left p-3 font-semibold text-gray-700 border-r">Hours</th>
                      <th className="text-left p-3 font-semibold text-gray-700 border-r">Notes</th>
                      {editMode && (
                        <th className="text-left p-3 font-semibold text-gray-700">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {employee.entries.map((entry, entryIndex) => (
                      <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-3 border-r">
                          {editMode ? (
                            <input
                              type="date"
                              value={entry.date}
                              onChange={(e) => handleEditEntry(employeeIndex, entryIndex, 'date', e.target.value)}
                              className="w-full p-1 border rounded"
                            />
                          ) : (
                            format(new Date(entry.date), 'EEEE, MMMM d, yyyy')
                          )}
                        </td>
                        <td className="p-3 border-r">
                          {editMode ? (
                            <input
                              type="number"
                              step="0.25"
                              min="0"
                              max="24"
                              value={entry.hours}
                              onChange={(e) => handleEditEntry(employeeIndex, entryIndex, 'hours', e.target.value)}
                              className="w-full p-1 border rounded"
                            />
                          ) : (
                            `${entry.hours}h`
                          )}
                        </td>
                        <td className="p-3 border-r">
                          {editMode ? (
                            <textarea
                              value={entry.note}
                              onChange={(e) => handleEditEntry(employeeIndex, entryIndex, 'note', e.target.value)}
                              className="w-full p-1 border rounded resize-none"
                              rows={2}
                            />
                          ) : (
                            entry.note || '-'
                          )}
                        </td>
                        {editMode && (
                          <td className="p-3">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveEntry(employeeIndex, entryIndex)}
                            >
                              Remove
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                    <tr className="border-t-2 border-gray-300 bg-gray-50">
                      <td className="p-3 font-bold border-r">Subtotal:</td>
                      <td className="p-3 font-bold border-r">{employee.subtotal.toFixed(2)}h</td>
                      <td className="p-3 border-r"></td>
                      {editMode && (
                        <td className="p-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddEntry(employeeIndex)}
                          >
                            Add Entry
                          </Button>
                        </td>
                      )}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Total Hours */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800">
                TOTAL HOURS: {totalHours.toFixed(2)}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ReportEditExport;
