import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Filter, Download, Printer, BarChart3, TrendingUp, Calendar, Users } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ProjectService, UserService, TimeTrackingService, ApiError } from '@/services/api';
import { Project, User } from '@/data/dummyData';

interface ReportData {
  project: string;
  users: { [key: string]: number };
  projectTotal: number;
}

interface UserData {
  id: string;
  name: string;
}

interface ProjectData {
  id: string;
  name: string;
}

const ReportsInterface = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState('All Users');
  const [selectedProject, setSelectedProject] = useState('All Projects');
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [showReport, setShowReport] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [allUsers, setAllUsers] = useState<string[]>(['All Users']);
  const [allProjects, setAllProjects] = useState<string[]>(['All Projects']);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Load users and projects from API
  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, projectsData] = await Promise.all([
          UserService.getAllUsers({ is_active: true }),
          ProjectService.getAllProjects()
        ]);

        const userData: UserData[] = usersData.map(user => ({
          id: user.id,
          name: user.name || `User ${user.id}` // Fallback if name is empty
        }));

        const projectData: ProjectData[] = projectsData.map(project => ({
          id: project.id,
          name: project.name || `Project ${project.id}` // Fallback if name is empty
        }));

        setUsers(userData);
        setProjects(projectData);

        // Sort users and projects alphabetically, remove duplicates and filter out empty values
        const sortedUserNames = [...new Set(userData.map(u => u.name).filter(name => name && name.trim() !== ''))].sort();
        const sortedProjectNames = [...new Set(projectData.map(p => p.name).filter(name => name && name.trim() !== ''))].sort();

        setAllUsers(['All Users', ...sortedUserNames]);
        setAllProjects(['All Projects', ...sortedProjectNames]);
        setIsDataLoaded(true);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load users and projects. Please refresh the page.');
      }
    };

    loadData();
  }, []);

  // Generate month and year options
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i); // 5 years before and after current year

  // Initialize filters from URL parameters
  useEffect(() => {
    if (allUsers.length <= 1 || allProjects.length <= 1) {
      return; // Wait for data to load
    }

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
  }, [searchParams, allUsers, allProjects]);

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      setShowReport(false);

      // Get month range
      const monthStart = startOfMonth(selectedMonth);
      const monthEnd = endOfMonth(selectedMonth);

      // Get time entries for the selected month
      const timeEntries = await TimeTrackingService.getAllTimeEntries({
        start_date: format(monthStart, 'yyyy-MM-dd'),
        end_date: format(monthEnd, 'yyyy-MM-dd')
      });

      // Process data based on selected filters
      const processedData = await processReportData(timeEntries);
      setReportData(processedData);
    setShowReport(true);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const processReportData = async (timeEntries: any[]): Promise<ReportData[]> => {
    const projectsToInclude = selectedProject === 'All Projects' 
      ? projects 
      : projects.filter(p => p.name === selectedProject);

    const usersToInclude = selectedUser === 'All Users'
      ? users
      : users.filter(u => u.name === selectedUser);

    const reportDataMap: { [projectName: string]: ReportData } = {};

    // Initialize report data for each project
    projectsToInclude.forEach(project => {
      reportDataMap[project.name] = {
        project: project.name,
        users: {},
        projectTotal: 0
      };

      // Initialize each user with 0 hours
      usersToInclude.forEach(user => {
        reportDataMap[project.name].users[user.name] = 0;
      });
    });

    // Process time entries
    timeEntries.forEach((entry: any) => {
      const project = projects.find(p => String(p.id) === String(entry.project));
      const user = users.find(u => String(u.id) === String(entry.user));

      if (!project || !user) return;

      // Check if this project and user should be included
      const shouldIncludeProject = selectedProject === 'All Projects' || project.name === selectedProject;
      const shouldIncludeUser = selectedUser === 'All Users' || user.name === selectedUser;

      if (shouldIncludeProject && shouldIncludeUser && reportDataMap[project.name]) {
        if (!reportDataMap[project.name].users[user.name]) {
          reportDataMap[project.name].users[user.name] = 0;
        }
        // Ensure hours is treated as a number to prevent string concatenation
        const hoursAsNumber = Number(entry.hours) || 0;
        reportDataMap[project.name].users[user.name] += hoursAsNumber;
        reportDataMap[project.name].projectTotal += hoursAsNumber;
      }
    });

    return Object.values(reportDataMap);
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
    const usersToCalculate = selectedUser === 'All Users' 
      ? users.map(u => u.name) 
      : [selectedUser];

    usersToCalculate.forEach(userName => {
      totals[userName] = reportData.reduce((sum, project) => sum + (project.users[userName] || 0), 0);
    });
    return totals;
  };

  const calculateOverallTotal = () => {
    return reportData.reduce((sum, project) => sum + project.projectTotal, 0);
  };

  // Filter data based on selections
  const getFilteredData = () => {
    return reportData; // Data is already filtered in processReportData
  };

  // Get visible users based on selection
  const getVisibleUsers = () => {
    if (selectedUser === 'All Users') {
      return users.map(u => u.name);
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

  if (error) {
    return (
      <div className="space-y-6 md:space-y-8 p-6 md:p-8">
        <div className="text-center py-12">
          <div className="text-red-600 text-lg mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

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
          {!isDataLoaded ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-gray-600">Loading filters...</div>
            </div>
          ) : (
            <>
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
                  {allUsers.filter(user => user && user.trim() !== '').map((user, index) => (
                    <SelectItem key={`user-${index}`} value={user}>{user}</SelectItem>
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
                  {allProjects.filter(project => project && project.trim() !== '').map((project, index) => (
                    <SelectItem key={`project-${index}`} value={project}>{project}</SelectItem>
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
                  {months.map((month, index) => (
                    <SelectItem key={`month-${index}`} value={month}>{month}</SelectItem>
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
                  {years.map((year, index) => (
                    <SelectItem key={`year-${index}`} value={year.toString()}>{year}</SelectItem>
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
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Report'}
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
            </>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Results Card */}
      {loading && (
        <Card className="card-enhanced border-0 shadow-soft">
          <div className="flex justify-center items-center py-12">
            <div className="text-lg text-gray-600">Generating report...</div>
          </div>
        </Card>
      )}

      {showReport && !loading && (
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
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={100} className="text-center py-8 text-gray-500">
                        No time entries found for the selected criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((row, index) => (
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
                  )))}
                  {filteredData.length > 0 && (showUserTotals || isSimpleUserReport) && (
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
