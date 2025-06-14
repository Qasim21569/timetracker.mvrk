
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Filter, Download } from 'lucide-react';

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

const allUsers = ['All Users', 'Vuk Stajic', 'Diego Oviedo', 'Pretend Person'];
const allProjects = ['All Projects', 'Internal Meetings', 'Project X', 'Project Y'];
const months = [
  'January 2025', 'February 2025', 'March 2025', 'April 2025', 'May 2025', 'June 2025',
  'July 2025', 'August 2025', 'September 2025', 'October 2025', 'November 2025', 'December 2025'
];

const ReportsInterface = () => {
  const [selectedUser, setSelectedUser] = useState('All Users');
  const [selectedProject, setSelectedProject] = useState('All Projects');
  const [selectedMonth, setSelectedMonth] = useState('January 2025');
  const [showReport, setShowReport] = useState(false);

  const handleGenerateReport = () => {
    setShowReport(true);
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

  const userTotals = calculateUserTotals();
  const overallTotal = calculateOverallTotal();

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
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month} value={month}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Badge variant="outline">{selectedMonth}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead className="text-center">Vuk Stajic</TableHead>
                  <TableHead className="text-center">Diego Oviedo</TableHead>
                  <TableHead className="text-center">Pretend Person</TableHead>
                  <TableHead className="text-center">Total Hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dummyReportData.map((row) => (
                  <TableRow key={row.project}>
                    <TableCell className="font-medium">{row.project}</TableCell>
                    <TableCell className="text-center">{row.users['Vuk Stajic']}</TableCell>
                    <TableCell className="text-center">{row.users['Diego Oviedo']}</TableCell>
                    <TableCell className="text-center">{row.users['Pretend Person']}</TableCell>
                    <TableCell className="text-center font-medium">{row.projectTotal}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2">
                  <TableCell className="font-bold">Total Hours</TableCell>
                  <TableCell className="text-center font-bold">{userTotals['Vuk Stajic']}</TableCell>
                  <TableCell className="text-center font-bold">{userTotals['Diego Oviedo']}</TableCell>
                  <TableCell className="text-center font-bold">{userTotals['Pretend Person']}</TableCell>
                  <TableCell className="text-center font-bold text-primary">{overallTotal}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportsInterface;
