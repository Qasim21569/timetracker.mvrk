import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Filter, Download, Printer, BarChart3, TrendingUp, Calendar, Users } from 'lucide-react';
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
    <div className="space-y-6 md:space-y-8 p-6 md:p-8">
      {/* Enhanced Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-xl shadow-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text">Reports</h1>
        </div>
        <p className="text-base md:text-lg text-slate-600 max-w-2xl">
          Generate comprehensive time tracking reports and analyze team productivity patterns.
        </p>
      </div>

      {/* Enhanced Filters Card */}
      <Card className="card-enhanced border-0 shadow-soft">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
              <Filter className="h-5 w-5 text-white" />
            </div>
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-500" />
                User
              </label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="input-enhanced h-11">
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
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-slate-500" />
                Project
              </label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="input-enhanced h-11">
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
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-500" />
                Month
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Select 
                  value={months[selectedMonth.getMonth()]} 
                  onValueChange={handleMonthChange}
                >
                  <SelectTrigger className="input-enhanced h-11">
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
                  <SelectTrigger className="input-enhanced h-11">
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

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
            <Button 
              onClick={handleGenerateReport}
              className="btn-gradient px-6 py-3 text-base font-medium"
              size="lg"
            >
              Generate Report
            </Button>
            {showReport && (
              <>
                <Button variant="outline" className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                {showPrintReport && (
                  <Button variant="outline" className="bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-purple-700 border-purple-200">
                    <Printer className="h-4 w-4 mr-2" />
                    Print Report
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Results Card */}
      {showReport && (
        <Card className="card-enhanced border-0 shadow-soft">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-2 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              Time Report Results
            </CardTitle>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge className="bg-blue-100 text-blue-800 border border-blue-200">{selectedUser}</Badge>
              <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200">{selectedProject}</Badge>
              <Badge className="bg-purple-100 text-purple-800 border border-purple-200">{format(selectedMonth, "MMMM yyyy")}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="table-enhanced rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-purple-50">
                    <TableHead className="font-semibold text-slate-700 py-4">Project</TableHead>
                    {isSimpleUserReport ? (
                      <TableHead className="text-center font-semibold text-slate-700">{selectedUser}</TableHead>
                    ) : (
                      visibleUsers.map(user => (
                        <TableHead key={user} className="text-center font-semibold text-slate-700">{user}</TableHead>
                      ))
                    )}
                    {showProjectTotals && (
                      <TableHead className="text-center font-semibold text-slate-700">Project Totals</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((row, index) => (
                    <TableRow 
                      key={row.project} 
                      className={`
                        table-row-enhanced border-b border-slate-100
                        ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                      `}
                    >
                      <TableCell className="font-semibold text-slate-800">{row.project}</TableCell>
                      {isSimpleUserReport ? (
                        <TableCell className="text-center">{row.users[selectedUser]}</TableCell>
                      ) : (
                        visibleUsers.map(user => (
                          <TableCell key={user} className="text-center">{row.users[user]}</TableCell>
                        ))
                      )}
                      {showProjectTotals && (
                        <TableCell className="text-center font-semibold">{row.projectTotal}</TableCell>
                      )}
                    </TableRow>
                  ))}
                  {(showUserTotals || isSimpleUserReport) && (
                    <TableRow className="border-t-2 border-slate-300 bg-gradient-to-r from-blue-50 to-purple-50">
                      <TableCell className="font-bold text-slate-800">
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
                        <TableCell className="text-center font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                          Overall Total<br/>{overallTotal}
                        </TableCell>
                      )}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportsInterface;
