import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getDay } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogOverlay } from '@/components/ui/dialog';
import DailyTrackTime from './DailyTrackTime';

interface MonthlyTrackTimeProps {
  onViewChange: (view: 'daily' | 'weekly' | 'monthly') => void;
}

interface DayData {
  date: Date;
  totalHours: number;
}

const MonthlyTrackTime: React.FC<MonthlyTrackTimeProps> = ({ onViewChange }) => {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDayForModal, setSelectedDayForModal] = useState<Date | null>(null);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);

  // Mock data for daily hours - in real app this would come from API/database
  const getDayHours = (date: Date): number => {
    // Generate mock hours based on date (for demo purposes)
    const dayOfMonth = date.getDate();
    const mockHours = [0, 8, 7.5, 6, 8.5, 0, 0, 5, 8, 7, 6.5, 8, 0, 0];
    return mockHours[dayOfMonth % mockHours.length] || 0;
  };

  // Calculate total hours for the month
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const monthlyTotal = monthDays.reduce((total, day) => total + getDayHours(day), 0);

  // Generate calendar days (including padding days from previous/next month)
  const getCalendarDays = (): DayData[] => {
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    const startDate = new Date(monthStart);
    const endDate = new Date(monthEnd);

    // Adjust start date to begin on Sunday (0) for calendar grid
    const startDay = getDay(monthStart);
    startDate.setDate(startDate.getDate() - startDay);

    // Adjust end date to end on Saturday (6) for calendar grid
    const endDay = getDay(monthEnd);
    endDate.setDate(endDate.getDate() + (6 - endDay));

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
    
    return calendarDays.map(date => ({
      date,
      totalHours: isSameMonth(date, selectedMonth) ? getDayHours(date) : 0
    }));
  };

  const calendarDays = getCalendarDays();

  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedMonth(direction === 'next' ? addMonths(selectedMonth, 1) : subMonths(selectedMonth, 1));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedMonth(startOfMonth(date));
      setIsCalendarOpen(false);
    }
  };

  const handleDayClick = (date: Date) => {
    if (isSameMonth(date, selectedMonth)) {
      setSelectedDayForModal(date);
      setIsDayModalOpen(true);
    }
  };

  const closeDayModal = () => {
    setIsDayModalOpen(false);
    setSelectedDayForModal(null);
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header with view selector and month navigation */}
      <div className="flex flex-col space-y-3 md:space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex space-x-2">
            
          </div>
          
          <div className="flex items-center justify-center sm:justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="md:size-default"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="min-w-[180px] md:min-w-[200px] text-xs md:text-sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  {format(selectedMonth, 'MMMM yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  mode="single"
                  selected={selectedMonth}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="md:size-default"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* View tabs */}
        <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 sm:items-center">
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => onViewChange('daily')} className="hover:bg-blue-50 flex-1 sm:flex-none">
              Daily
            </Button>
            <Button variant="outline" onClick={() => onViewChange('weekly')} className="hover:bg-blue-50 flex-1 sm:flex-none">
              Weekly
            </Button>
            <Button variant="default" className="bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none">
              Monthly
            </Button>
          </div>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800 sm:ml-auto text-center">
            Total Hours: {monthlyTotal}
          </Badge>
        </div>
      </div>

      {/* Monthly Calendar */}
      <div className="border rounded-lg overflow-hidden bg-white">
        {/* Calendar Header - Days of week */}
        <div className="grid grid-cols-7 bg-blue-600 text-white">
          {weekDays.map(day => (
            <div key={day} className="p-2 md:p-4 text-center font-semibold border-r border-blue-500 last:border-r-0 text-xs md:text-sm">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.slice(0, 3)}</span>
            </div>
          ))}
        </div>

        {/* Calendar Body - Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((dayData, index) => {
            const isCurrentMonth = isSameMonth(dayData.date, selectedMonth);
            const isToday = isSameDay(dayData.date, new Date());
            const hasHours = dayData.totalHours > 0;

            return (
              <div
                key={index}
                className={`
                  min-h-[80px] md:min-h-[100px] p-1 md:p-2 border-r border-b border-gray-200 last:border-r-0 cursor-pointer
                  ${isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-100 text-gray-400'}
                  ${isToday ? 'bg-blue-50 border-blue-300' : ''}
                  ${hasHours ? 'bg-green-50' : ''}
                `}
                onClick={() => handleDayClick(dayData.date)}
              >
                <div className="flex flex-col h-full">
                  <div className={`text-xs md:text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : ''}`}>
                    {format(dayData.date, 'd')}
                  </div>
                  {isCurrentMonth && hasHours && (
                    <div className="mt-auto">
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 px-1 py-0.5">
                        {dayData.totalHours}h
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Detail Modal */}
      <Dialog open={isDayModalOpen} onOpenChange={(open) => !open && closeDayModal()}>
        <DialogContent className="max-w-[95vw] md:max-w-6xl max-h-[90vh] overflow-y-auto bg-white border-4 border-blue-200 shadow-2xl">
          <div className="absolute right-2 md:right-4 top-2 md:top-4 z-50">
            <Button
              variant="outline"
              size="sm"
              onClick={closeDayModal}
              className="bg-white hover:bg-gray-100"
            >
              <X className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Close</span>
            </Button>
          </div>
          
          {selectedDayForModal && (
            <div className="pt-6 md:pt-8">
              <div className="mb-4 text-center">
                <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                  Daily Time Tracking
                </h2>
                <div className="text-sm md:text-base text-gray-600 mt-1">
                  {format(selectedDayForModal, 'EEEE, MMMM do, yyyy')}
                </div>
                <div className="text-xs md:text-sm text-gray-500 mt-1">
                  Click outside or use the Close button to return to calendar
                </div>
              </div>
              
              {/* Embed DailyTrackTime component but hide its header */}
              <div className="daily-track-time-embedded">
                <DailyTrackTimeEmbedded 
                  selectedDate={selectedDayForModal} 
                  onClose={closeDayModal}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Embedded version of DailyTrackTime without navigation header
interface DailyTrackTimeEmbeddedProps {
  selectedDate: Date;
  onClose: () => void;
}

const DailyTrackTimeEmbedded: React.FC<DailyTrackTimeEmbeddedProps> = ({ selectedDate }) => {
  const [projects, setProjects] = useState([
    {
      id: '1',
      name: 'Internal Meetings',
      hours: 3,
      notes: 'Team standup and sprint planning session with development updates and blocking issues discussion.'
    },
    {
      id: '2',
      name: 'Project X',
      hours: 5.5,
      notes: 'Frontend development work on new component library and API integration testing.'
    },
    {
      id: '3',
      name: 'Project Y', 
      hours: 2,
      notes: 'Backend optimization and database query improvements for better performance.'
    }
  ]);

  // Calculate total hours for the day
  const totalHours = projects.reduce((sum, project) => sum + project.hours, 0);

  // Auto-save functionality
  const autoSave = (updatedProjects: typeof projects) => {
    console.log('Auto-saving daily data for', format(selectedDate, 'yyyy-MM-dd'), updatedProjects);
    setProjects(updatedProjects);
  };

  const updateProjectHours = (projectId: string, hours: number) => {
    const updatedProjects = projects.map(project => {
      if (project.id === projectId) {
        return { ...project, hours: Math.max(0, hours) };
      }
      return project;
    });
    autoSave(updatedProjects);
  };

  return (
    <div className="space-y-4">
      {/* Total Hours Badge */}
      <div className="flex justify-center">
        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
          Total Hours: {totalHours}
        </Badge>
      </div>

      {/* Daily time tracking table */}
      <div className="overflow-auto max-h-[400px] border rounded-lg">
        <table className="w-full">
          <thead className="sticky top-0 bg-blue-600 text-white z-10">
            <tr>
              <th className="text-left p-4 font-semibold">Project</th>
              <th className="text-center p-4 font-semibold">Hours</th>
              <th className="text-left p-4 font-semibold">Notes</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project, index) => (
              <tr key={project.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="p-4 font-medium">{project.name}</td>
                <td className="p-4">
                  <input
                    type="number"
                    value={project.hours}
                    onChange={(e) => updateProjectHours(project.id, Number(e.target.value))}
                    className="w-24 text-center border rounded px-2 py-1"
                    min="0"
                    step="0.5"
                  />
                </td>
                <td className="p-4">
                  <div className="p-2 border rounded bg-gray-50 min-h-[40px]">
                    {project.notes || 'Click to add notes'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Auto-save indicator */}
      <div className="text-sm text-gray-500 text-center">
        Changes are automatically saved
      </div>
    </div>
  );
};

export default MonthlyTrackTime;
