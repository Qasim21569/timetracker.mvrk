
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

const allUsers = ['Vuk Stajic', 'Diego Oviedo', 'Pretend Person'];
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
    allUsers.forEach(user => {
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
      <div className="flex gap-4">
        <div>
          <Label className="bg-gray-300 p-2 rounded border-2 border-gray-800 block text-center font-medium mb-2">
            User Select
          </Label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="p-2 border-2 border-gray-800 rounded bg-white"
          >
            <option value="All Users">All Users</option>
            {allUsers.map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>
        </div>

        <div>
          <Label className="bg-gray-300 p-2 rounded border-2 border-gray-800 block text-center font-medium mb-2">
            Project Select
          </Label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="p-2 border-2 border-gray-800 rounded bg-white"
          >
            {allProjects.map(project => (
              <option key={project} value={project}>{project}</option>
            ))}
          </select>
        </div>

        <div>
          <Label className="bg-gray-300 p-2 rounded border-2 border-gray-800 block text-center font-medium mb-2">
            Month Select
          </Label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="p-2 border-2 border-gray-800 rounded bg-white"
          >
            {months.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>
      </div>

      <Button
        onClick={handleGenerateReport}
        className="bg-gray-300 text-black border-2 border-gray-800 hover:bg-gray-400"
      >
        Generate Report
      </Button>

      {showReport && (
        <div className="border-4 border-blue-400 rounded-lg p-6 bg-blue-50">
          <div className="text-center mb-4">
            <p className="text-lg font-medium">
              This section displays the results of the above chosen options ONLY if there is any project with any hours added.
            </p>
            <p className="text-sm text-gray-600">
              Do not include projects with no hours entered by any user in the time period.
            </p>
            <p className="text-sm text-gray-600">
              If no results of over 0 hours found, display "No Results Found For These Filters"
            </p>
          </div>

          <div className="flex justify-center mb-4">
            <div className="flex gap-4 text-sm">
              <span className="bg-gray-300 px-3 py-1 rounded border-2 border-gray-800">{selectedUser}</span>
              <span className="bg-gray-300 px-3 py-1 rounded border-2 border-gray-800">{selectedProject}</span>
              <span className="bg-gray-300 px-3 py-1 rounded border-2 border-gray-800">{selectedMonth}</span>
            </div>
          </div>

          <div className="border-2 border-gray-800 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-teal-700">
                  <TableHead className="text-white font-bold border-r border-gray-300">Project</TableHead>
                  <TableHead className="text-white font-bold border-r border-gray-300">Vuk Stajic</TableHead>
                  <TableHead className="text-white font-bold border-r border-gray-300">Diego Oviedo</TableHead>
                  <TableHead className="text-white font-bold border-r border-gray-300">Pretend Person</TableHead>
                  <TableHead className="text-white font-bold">Project Totals</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dummyReportData.map((row, index) => (
                  <TableRow key={row.project} className={index % 2 === 0 ? 'bg-gray-200' : 'bg-gray-300'}>
                    <TableCell className="border-r border-gray-400 font-medium">{row.project}</TableCell>
                    <TableCell className="border-r border-gray-400 text-center">{row.users['Vuk Stajic']}</TableCell>
                    <TableCell className="border-r border-gray-400 text-center">{row.users['Diego Oviedo']}</TableCell>
                    <TableCell className="border-r border-gray-400 text-center">{row.users['Pretend Person']}</TableCell>
                    <TableCell className="text-center">{row.projectTotal}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-blue-300">
                  <TableCell className="border-r border-gray-400 font-bold">User Totals</TableCell>
                  <TableCell className="border-r border-gray-400 text-center font-bold">{userTotals['Vuk Stajic']}</TableCell>
                  <TableCell className="border-r border-gray-400 text-center font-bold">{userTotals['Diego Oviedo']}</TableCell>
                  <TableCell className="border-r border-gray-400 text-center font-bold">{userTotals['Pretend Person']}</TableCell>
                  <TableCell className="text-center font-bold bg-teal-700 text-white">
                    Overall Total<br />{overallTotal}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsInterface;
