import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Filter, Download, Printer } from 'lucide-react';
import { format } from 'date-fns';

interface ReportData {
  project: string;
  users: { [key: string]: number };
  projectTotal: number;
}

const dummyReportData: ReportData[] = [
  {
    project: 'Internal Meetings',
    users: { 'Vuk Stajic': 24, 'Diego Oviedo': 20, 'Pretend Person': 21 },
    projectTotal: 65
  },
  {
    project: 'Project X',
    users: { 'Vuk Stajic': 30, 'Diego Oviedo': 15, 'Pretend Person': 25 },
    projectTotal: 70
  },
  {
    project: 'Project Y',
    users: { 'Vuk Stajic': 14, 'Diego Oviedo': 36, 'Pretend Person': 27 },
    projectTotal: 77
  }
];

// Sort users alphabetically with "All Users" at the top
const allUsers = ['All Users', ...['Vuk Stajic', 'Diego Oviedo', 'Pretend Person'].sort()];

// Sort projects alphabetically with "All Projects" at the top  
const allProjects = ['All Projects', ...['Internal Meetings', 'Project X', 'Project Y'].sort()];

const ReportsInterface = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedUser, setSelectedUser] = useState('All Users');
  const [selectedProject, setSelectedProject] = useState('All Projects');
  // Set default to current month instead of new Date()
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [showReport, setShowReport] = useState(false);

  // Generate month and year options
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i); // 5 years before and after current year

  // Initialize filters from URL parameters
  useEffect(() => {
    const userParam = searchParams.get('user');
    const projectParam = searchParams.get('project');
    const monthParam = searchParams.get('month');

    if (userParam && allUsers.includes(userParam)) {
      setSelectedUser(userParam);
    }
    if (projectParam && allProjects.includes(projectParam)) {
      setSelectedProject(projectParam);
    }
    if (monthParam) {
      try {
        const parsedDate = new Date(monthParam);
        if (!isNaN(parsedDate.getTime())) {
          setSelectedMonth(parsedDate);
        }
      } catch (error) {
        console.log('Invalid date parameter');
      }
    }

    // If any parameters were set, automatically generate the report
    if (userParam || projectParam || monthParam) {
      setShowReport(true);
    }
  }, [searchParams]);

  const handleGenerateReport = () => {
    setShowReport(true);
  };

  const handleMonthChange = (monthName: string) => {
    const monthIndex = months.indexOf(monthName);
    const newDate = new Date(selectedMonth.getFullYear(), monthIndex, 1);
    setSelectedMonth(newDate);
  };

  const handleYearChange = (yearStr: string) => {
    const year = parseInt(yearStr);
    const newDate = new Date(year, selectedMonth.getMonth(), 1);
    setSelectedMonth(newDate);
  };

  const calculateUserTotals = () => {
    const totals: { [key: string]: number } = {};
    ['Vuk Stajic', 'Diego Oviedo', 'Pretend Person'].forEach(user => {
      totals[user] = dummyReportData.reduce((sum, project) => sum + (project.users[user] || 0), 0);
    });
    return totals;
  };

  const calculateOverallTotal = () => {
    return dummyReportData.reduce((sum, project) => sum + project.projectTotal, 0);
  };

  // Filter data based on selections
  const getFilteredData = () => {
    let filteredData = [...dummyReportData];
    
    // Filter by project if not "All Projects"
    if (selectedProject !== 'All Projects') {
      filteredData = filteredData.filter(item => item.project === selectedProject);
    }
    
    return filteredData;
  };

  // Get visible users based on selection
  const getVisibleUsers = () => {
    if (selectedUser === 'All Users') {
      return ['Vuk Stajic', 'Diego Oviedo', 'Pretend Person'];
    }
    return [selectedUser];
  };

  const userTotals = calculateUserTotals();
  const overallTotal = calculateOverallTotal();
  const filteredData = getFilteredData();
  const visibleUsers = getVisibleUsers();

  // Determine what to show based on selections
  const showAllUsers = selectedUser === 'All Users';
  const showAllProjects = selectedProject === 'All Projects';
  const showProjectTotals = showAllUsers;
  const showUserTotals = showAllProjects;
  const showOverallTotal = showAllUsers && showAllProjects;
  
  // Special case: Single User + All Projects = Simple table format
  const isSimpleUserReport = !showAllUsers && showAllProjects;
  
  // Special case: All Users + Specific Project = Show Print Report button
  const showPrintReport = showAllUsers && !showAllProjects;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Generate and view time tracking reports</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">User</label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allUsers.map(user => (
                    <SelectItem key={user} value={user}>{user}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Project</label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allProjects.map(project => (
                    <SelectItem key={project} value={project}>{project}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Month</label>
              <div className="grid grid-cols-2 gap-2">
                <Select 
                  value={months[selectedMonth.getMonth()]} 
                  onValueChange={handleMonthChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(month => (
                      <SelectItem key={month} value={month}>{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select 
                  value={selectedMonth.getFullYear().toString()} 
                  onValueChange={handleYearChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={handleGenerateReport}>
              Generate Report
            </Button>
            {showReport && (
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
            {showReport && showPrintReport && (
              <Button variant="outline" className="bg-purple-100 hover:bg-purple-200 text-purple-800 border-purple-300">
                <Printer className="h-4 w-4 mr-2" />
                Print Report
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {showReport && (
        <Card>
          <CardHeader>
            <CardTitle>Time Report Results</CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">{selectedUser}</Badge>
              <Badge variant="outline">{selectedProject}</Badge>
              <Badge variant="outline">{format(selectedMonth, "MMMM yyyy")}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  {isSimpleUserReport ? (
                    <TableHead className="text-center">{selectedUser}</TableHead>
                  ) : (
                    visibleUsers.map(user => (
                      <TableHead key={user} className="text-center">{user}</TableHead>
                    ))
                  )}
                  {showProjectTotals && (
                    <TableHead className="text-center">Project Totals</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((row) => (
                  <TableRow key={row.project}>
                    <TableCell className="font-medium">{row.project}</TableCell>
                    {isSimpleUserReport ? (
                      <TableCell className="text-center">{row.users[selectedUser]}</TableCell>
                    ) : (
                      visibleUsers.map(user => (
                        <TableCell key={user} className="text-center">{row.users[user]}</TableCell>
                      ))
                    )}
                    {showProjectTotals && (
                      <TableCell className="text-center font-medium">{row.projectTotal}</TableCell>
                    )}
                  </TableRow>
                ))}
                {(showUserTotals || isSimpleUserReport) && (
                  <TableRow className="border-t-2">
                    <TableCell className="font-bold">
                      {isSimpleUserReport ? 'User Totals' : 'User Totals'}
                    </TableCell>
                    {isSimpleUserReport ? (
                      <TableCell className="text-center font-bold">{userTotals[selectedUser]}</TableCell>
                    ) : (
                      visibleUsers.map(user => (
                        <TableCell key={user} className="text-center font-bold">{userTotals[user]}</TableCell>
                      ))
                    )}
                    {showOverallTotal && (
                      <TableCell className="text-center font-bold text-primary bg-blue-600 text-white">
                        Overall Total<br/>{overallTotal}
                      </TableCell>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportsInterface;
