import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TimeEntry, Project } from '@/data/dummyData';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDaysInMonth, subMonths, eachMonthOfInterval } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MonthlyChartProps {
  timeEntries: TimeEntry[];
  projects: Project[];
}

export const MonthlyChart: React.FC<MonthlyChartProps> = ({ timeEntries, projects }) => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(format(now, 'yyyy-MM'));

  const generateDailyData = () => {
    const selectedDate = new Date(selectedMonth);
    const daysInSelectedMonth = getDaysInMonth(selectedDate);
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);

    // Since projects are already user-specific from getUserProjects, use all time entries
    const userEntries = timeEntries;

    const monthEntries = userEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= monthStart && entryDate <= monthEnd;
    });

    // Create array of days (1-31)
    const dailyData = [];
    for (let day = 1; day <= daysInSelectedMonth; day++) {
      const dayEntries = monthEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getDate() === day;
      });
      
      const totalHours = dayEntries.reduce((sum, entry) => sum + entry.hours, 0);
      
      dailyData.push({
        day: day,
        hours: Math.round(totalHours * 10) / 10, // Round to 1 decimal
        dayName: format(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day), 'EEE')
      });
    }

    return dailyData;
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

  const dailyData = generateDailyData();
  const monthOptions = generateMonthOptions();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-semibold text-slate-900">Day {data.day} ({data.dayName})</p>
          <p className="text-blue-600">
            Hours: <span className="font-bold">{data.hours}h</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (dailyData.every(d => d.hours === 0)) {
    return (
      <div className="space-y-4">
        {/* Month Filter */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Daily Hours</h3>
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
            <div className="text-4xl mb-2">📊</div>
            <p>No time entries for {format(new Date(selectedMonth), 'MMMM yyyy')}</p>
            <p className="text-sm">Start tracking time to see daily trends</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Month Filter */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Daily Hours</h3>
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
          <LineChart data={dailyData} margin={{ top: 10, right: 30, left: 20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
              label={{ value: 'Day of Month', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle' } }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
              label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="hours" 
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
