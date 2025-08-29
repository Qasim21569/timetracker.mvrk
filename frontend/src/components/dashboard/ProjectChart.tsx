import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TimeEntry, Project } from '@/data/dummyData';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProjectChartProps {
  timeEntries: TimeEntry[];
  projects: Project[];
}

export const ProjectChart: React.FC<ProjectChartProps> = ({ timeEntries, projects }) => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(format(now, 'yyyy-MM'));
  
  // Generate colors for each project
  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ];

  const generateProjectData = () => {
    const selectedDate = new Date(selectedMonth);
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);

    console.log(`🔍 ProjectChart - Available user projects:`, projects.map(p => ({ id: p.id, name: p.name, type: typeof p.id })));
    
    // Since projects are already user-specific from getUserProjects, use all time entries
    const userEntries = timeEntries;
    console.log(`🔍 ProjectChart - Sample time entries:`, userEntries.slice(0, 3).map(e => ({ 
      project: (e as any).project, 
      projectId: e.projectId, 
      projectType: typeof ((e as any).project || e.projectId)
    })));

    // Filter entries for selected month
    const monthEntries = userEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= monthStart && entryDate <= monthEnd;
    });

    // Group by project and calculate totals
    const projectTotals = monthEntries.reduce((acc, entry) => {
      const projectId = (entry as any).project || entry.projectId;

      if (!acc[projectId]) {
        acc[projectId] = 0;
      }
      acc[projectId] += entry.hours;
      return acc;
    }, {} as Record<string, number>);
    


    // Convert to chart data format and limit to top 8 projects to reduce clutter
    const chartData = Object.entries(projectTotals)
      .map(([projectId, hours], index) => {
        // Handle both string and number project IDs with better matching
        const project = projects.find(p => {
          const pId = String(p.id);
          const entryId = String(projectId);
          return pId === entryId;
        });
        console.log(`🔍 ProjectChart - Looking for project "${projectId}" (${typeof projectId}), found:`, project?.name || 'NOT FOUND');
        
        // Try multiple ways to find the project name
        let projectName = project?.name;
        if (!projectName) {
          // Try to find by different ID matching approaches
          const alternativeProject = projects.find(p => 
            p.id == projectId || // Loose equality
            Number(p.id) === Number(projectId) || // Both as numbers
            String(p.id) === String(projectId) // Both as strings
          );
          projectName = alternativeProject?.name;
        }
        
        return {
          name: projectName || `Project ${projectId}`,
          hours: Math.round(hours * 10) / 10, // Round to 1 decimal
          color: colors[index % colors.length],
          percentage: 0 // Will be calculated below
        };
      })
      .sort((a, b) => b.hours - a.hours) // Sort by hours descending
      .slice(0, 6); // Limit to top 6 projects to reduce clutter

    // Calculate percentages
    const totalHours = chartData.reduce((sum, item) => sum + item.hours, 0);
    chartData.forEach(item => {
      item.percentage = totalHours > 0 ? Math.round((item.hours / totalHours) * 100) : 0;
    });

    return chartData;
  };

  const generateMonthOptions = () => {
    const months = [];
    const currentYear = now.getFullYear();
    
    // Generate options for current year and previous year
    for (let year = currentYear - 1; year <= currentYear; year++) {
      for (let month = 0; month < 12; month++) {
        const date = new Date(year, month, 1);
        if (date <= now) { // Don't show future months
          months.push({
            value: format(date, 'yyyy-MM'),
            label: format(date, 'MMMM yyyy')
          });
        }
      }
    }
    
    return months.reverse(); // Most recent first
  };

  const projectData = generateProjectData();
  const monthOptions = generateMonthOptions();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-semibold text-slate-900">{data.payload.name}</p>
          <p style={{ color: data.payload.color }}>
            Hours: <span className="font-bold">{data.payload.hours}h</span>
          </p>
          <p className="text-slate-600">
            {data.payload.percentage}% of total time
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="mt-4">
        <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-3 px-3 py-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-slate-700 font-medium truncate" title={entry.value}>
                  {entry.value}
                </span>
              </div>
              <span className="text-xs text-slate-500 font-medium flex-shrink-0">
                {payload.find((p: any) => p.value === entry.value)?.payload?.hours || 0}h
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (projectData.length === 0) {
    return (
      <div className="space-y-4">
        {/* Month Filter */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Project Distribution</h3>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="h-80 flex items-center justify-center text-slate-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📈</div>
            <p>No project data for {format(new Date(selectedMonth), 'MMMM yyyy')}</p>
            <p className="text-sm">Start logging time to see distribution</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Month Filter */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Project Distribution</h3>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={projectData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={85}
              paddingAngle={2}
              dataKey="hours"
            >
              {projectData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
