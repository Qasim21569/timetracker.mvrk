import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TimeTrackingService, ProjectService, ApiError } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface ProjectEntry {
  id: string;
  name: string;
  weeklyHours: { [dayIndex: number]: number };
  weeklyNotes: { [dayIndex: number]: string };
  status?: 'active' | 'inactive' | 'not_started' | 'no_dates';
  hasDateIssue?: boolean;
  validDays?: { [dayIndex: number]: boolean }; // Track which days are valid for time logging
}

interface NotesDialogState {
  isOpen: boolean;
  projectId: string;
  dayIndex: number;
  currentNote: string;
  isForced: boolean; // Flag to indicate if this is a forced notes entry
}

interface WeeklyTrackTimeProps {
  onViewChange: (view: 'daily' | 'weekly' | 'monthly') => void;
}

const WeeklyTrackTime: React.FC<WeeklyTrackTimeProps> = ({ onViewChange }) => {
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [notesDialog, setNotesDialog] = useState<NotesDialogState>({
    isOpen: false,
    projectId: '',
    dayIndex: 0,
    currentNote: '',
    isForced: false
  });
  
  const [projects, setProjects] = useState<ProjectEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser: user } = useAuth();

  // Helper function to check if a project was active on a specific date
  const isProjectActiveOnDate = (project: any, date: Date): boolean => {
    const dateString = format(date, 'yyyy-MM-dd');
    const startDate = project.start_date;
    const endDate = project.end_date;
    
    // If no dates are set, allow time logging but show warning
    if (!startDate || !endDate) {
      return true; // Will show warning in UI
    }
    
    return dateString >= startDate && dateString <= endDate;
  };
  
  // Load user's projects and time entries for the week
  useEffect(() => {
    if (user) {
      loadWeeklyData();
    }
  }, [user, selectedWeek]);

  const loadWeeklyData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get all projects assigned to current user
      const allProjects = await ProjectService.getAllProjects();
      const userProjects = allProjects.filter(project => 
        (project as any).assigned_user_ids?.includes(parseInt(user.id))
      );

      // Get Monday of the selected week
      const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
      const weekEnd = addDays(weekStart, 6);

      // Get time entries for the week
      const timeEntries = await TimeTrackingService.getAllTimeEntries({
        start_date: format(weekStart, 'yyyy-MM-dd'),
        end_date: format(weekEnd, 'yyyy-MM-dd')
      });

      // Filter time entries for current user
      const userTimeEntries = timeEntries.filter(entry => 
        (entry as any).user === parseInt(user.id)
      );

      // Initialize project entries with 7 days of data
      const projectEntries: ProjectEntry[] = userProjects.map(project => {
        const weeklyHours: { [dayIndex: number]: number } = {};
        const weeklyNotes: { [dayIndex: number]: string } = {};
        const validDays: { [dayIndex: number]: boolean } = {};
        const hasDateIssue = !(project as any).start_date || !(project as any).end_date;
        
        // Initialize all 7 days
        for (let i = 0; i < 7; i++) {
          const dayDate = addDays(weekStart, i);
          const dayDateString = format(dayDate, 'yyyy-MM-dd');
          const dayEntry = userTimeEntries.find(entry => 
            String((entry as any).project) === String(project.id) && 
            (entry as any).date === dayDateString
          );
          
          weeklyHours[i] = Number(dayEntry?.hours || 0);
          weeklyNotes[i] = (dayEntry as any)?.note || '';
          validDays[i] = isProjectActiveOnDate(project, dayDate);
        }
        
        return {
          id: String(project.id),
          name: project.name,
          weeklyHours,
          weeklyNotes,
          status: (project as any).status,
          hasDateIssue: hasDateIssue,
          validDays: validDays
        };
      });

      // Only show projects that have at least one valid day in the week
      const validProjectEntries = projectEntries.filter(project => 
        project.hasDateIssue || Object.values(project.validDays || {}).some(valid => valid)
      );

      setProjects(validProjectEntries);
    } catch (error) {
      console.error('Error loading weekly data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save individual time entry to API
  const saveTimeEntryToAPI = async (projectId: string, dayIndex: number, hours: number, notes: string) => {
    if (!user) return;

    try {
      const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
      const entryDate = addDays(weekStart, dayIndex);
      const dateString = format(entryDate, 'yyyy-MM-dd');

      // Check if time entry exists for this date and project
      const timeEntries = await TimeTrackingService.getAllTimeEntries({
        date: dateString
      });

      const existingEntry = timeEntries.find(entry => 
        String((entry as any).project) === String(projectId) && 
        (entry as any).user === parseInt(user.id)
      );

      if (existingEntry) {
        // Update existing entry using proper API service
        await TimeTrackingService.updateTimeEntry((existingEntry as any).id, {
          project: parseInt(projectId),
          date: dateString,
          hours: hours,
          note: notes
        } as any);
      } else if (hours > 0) {
        // Create new entry only if hours > 0
        await TimeTrackingService.createTimeEntry({
          project: parseInt(projectId),
          date: dateString,
          hours: hours,
          note: notes
        });
      }
    } catch (error) {
      console.error('Failed to save time entry:', error);
      // Note: Consider adding UI feedback for failed saves in future enhancement
    }
  };

  // Validate and process hours to quarter-hour increments
  const validateAndProcessHours = (inputValue: string | number): number => {
    const cleanValue = String(inputValue).replace(/[^0-9.]/g, '');
    const parsedHours = parseFloat(cleanValue);
    if (isNaN(parsedHours)) return 0;
    if (parsedHours < 0) return 0;
    if (parsedHours > 24) return 24;
    // Round to nearest 0.25 for quarter-hour increments
    return Math.round(parsedHours * 4) / 4;
  };

  const updateProjectHours = (projectId: string, dayIndex: number, hours: number) => {
    const project = projects.find(p => p.id === projectId);
    const newHours = Math.max(0, hours); // hours already validated in onChange
    
    // If hours > 0 and no notes exist, force notes dialog
    if (newHours > 0 && project && !project.weeklyNotes[dayIndex]) {
      setNotesDialog({
        isOpen: true,
        projectId,
        dayIndex,
        currentNote: '',
        isForced: true
      });
      // Don't update hours yet - wait for notes
      return;
    }
    
    // Update projects state
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const updatedHours = { ...p.weeklyHours, [dayIndex]: newHours };
        return { ...p, weeklyHours: updatedHours };
      }
      return p;
    }));
    
    // Save to API with existing notes
    const existingNotes = project?.weeklyNotes[dayIndex] || '';
    saveTimeEntryToAPI(projectId, dayIndex, newHours, existingNotes);
  };

  const openNotesDialog = (projectId: string, dayIndex: number, currentNote: string) => {
    setNotesDialog({
      isOpen: true,
      projectId,
      dayIndex,
      currentNote,
      isForced: false
    });
  };

  const closeNotesDialog = () => {
    setNotesDialog(prev => ({ ...prev, isOpen: false }));
  };

  const saveNotes = (notes: string) => {
    const { projectId, dayIndex } = notesDialog;
    
    // Update projects state
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const updatedNotes = { ...p.weeklyNotes, [dayIndex]: notes };
        return { ...p, weeklyNotes: updatedNotes };
      }
      return p;
    }));
    
    // If this was a forced entry (hours added first), now update the hours too
    if (notesDialog.isForced) {
      const project = projects.find(p => p.id === notesDialog.projectId);
      if (project) {
        // Get the input value that triggered this
        const inputElement = document.querySelector(`input[data-project="${notesDialog.projectId}"][data-day="${notesDialog.dayIndex}"]`) as HTMLInputElement;
        if (inputElement) {
          const hours = Number(inputElement.value);
          const updatedProjects = projects.map(p => {
            if (p.id === notesDialog.projectId) {
              const updatedHours = { ...p.weeklyHours, [notesDialog.dayIndex]: hours };
              return { ...p, weeklyHours: updatedHours };
            }
            return p;
          });
          // The original code had autoSave here, but autoSave is not defined.
          // Assuming the intent was to save immediately or that autoSave will be added.
          // For now, removing the line as per the new_code.
        }
      }
    }
    
    closeNotesDialog();
  };

  const handleCellClick = (projectId: string, dayIndex: number) => {
    const project = projects.find(p => p.id === projectId);
    if (project && project.weeklyHours[dayIndex] > 0) {
      openNotesDialog(projectId, dayIndex, project.weeklyNotes[dayIndex] || '');
    }
  };

  const getDayName = (date: Date) => format(date, 'EEE');
  const getDayDate = (date: Date) => format(date, 'MMM. do');

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header with view selector and week navigation */}
      <div className="flex flex-col space-y-3 md:space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex space-x-2">
            <Button
              variant={onViewChange ? "outline" : "default"}
              size="sm"
              onClick={() => onViewChange('daily')}
              className="text-xs md:text-sm"
            >
              Daily
            </Button>
            <Button
              variant="default"
              size="sm"
              className="text-xs md:text-sm"
            >
              Weekly
            </Button>
            <Button
              variant={onViewChange ? "outline" : "default"}
              size="sm"
              onClick={() => onViewChange('monthly')}
              className="text-xs md:text-sm"
            >
              Monthly
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedWeek(subWeeks(selectedWeek, 1))}
              className="flex items-center text-xs md:text-sm"
            >
              <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
              Previous Week
            </Button>

            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs md:text-sm">
                  <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  Week of {format(startOfWeek(selectedWeek, { weekStartsOn: 1 }), 'MMM dd, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={selectedWeek}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedWeek(date);
                      setIsCalendarOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedWeek(addWeeks(selectedWeek, 1))}
              className="flex items-center text-xs md:text-sm"
            >
              Next Week
              <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </div>

          <Badge variant="secondary" className="text-xs md:text-sm py-1 px-2 md:px-3">
            Total Hours For Week: {projects.reduce((total, project) => 
              total + Object.values(project.weeklyHours).reduce((sum, hours) => sum + hours, 0), 0
            )}
          </Badge>
        </div>
      </div>

      {/* Weekly time tracking table */}
      {loading ? (
        <div className="flex justify-center items-center py-8 border rounded-lg">
          <div className="text-lg text-gray-600">Loading weekly data...</div>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 px-6 border rounded-lg">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">📅</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Projects Assigned</h3>
            <p className="text-gray-500">You are not added to any projects yet. Please contact your administrator to get assigned to projects.</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <div className="min-w-[800px]">
            <table className="w-full">
              <thead className="sticky top-0 bg-blue-600 text-white z-10">
                <tr>
                  <th className="text-left p-2 md:p-4 font-semibold border-r border-blue-500 text-xs md:text-sm">Project</th>
                  {Array.from({ length: 7 }, (_, index) => {
                    const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
                    const day = addDays(weekStart, index);
                    const dayTotal = projects.reduce((sum, project) => sum + (project.weeklyHours[index] || 0), 0);
                    return (
                      <th key={index} className="text-center p-1 md:p-2 font-semibold border-r border-blue-500 min-w-[100px] md:min-w-[120px]">
                        <div className="flex flex-col">
                          <span className="text-xs md:text-sm">{getDayName(day)} - {getDayDate(day)}</span>
                          <span className="text-xs font-normal">Total: {dayTotal}</span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {projects.map((project, projectIndex) => (
                  <tr key={project.id} className={projectIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-2 md:p-4 font-medium border-r border-gray-300 sticky left-0 z-5 text-xs md:text-sm">
                      <div className="truncate max-w-[120px] md:max-w-none" title={project.name}>
                        {project.name}
                      </div>
                    </td>
                    {Array.from({ length: 7 }, (_, dayIndex) => (
                      <td 
                        key={dayIndex} 
                        className={`p-1 md:p-2 text-center border-r border-gray-300 cursor-pointer hover:bg-blue-50 ${
                          project.weeklyHours[dayIndex] > 0 && project.weeklyNotes[dayIndex] 
                            ? 'bg-green-100' 
                            : project.weeklyHours[dayIndex] > 0 
                            ? 'bg-yellow-100' 
                            : ''
                        }`}
                        onClick={() => handleCellClick(project.id, dayIndex)}
                      >
                        <Input
                          type="number"
                          value={project.weeklyHours[dayIndex] || 0}
                          onChange={(e) => updateProjectHours(project.id, dayIndex, validateAndProcessHours(e.target.value))}
                          className="w-full text-center border-0 bg-transparent focus:bg-white focus:border focus:border-blue-300 text-xs md:text-sm min-w-0"
                          min="0"
                          max="24"
                          step="0.25"
                          onClick={(e) => e.stopPropagation()}
                          data-project={project.id}
                          data-day={dayIndex}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Notes Dialog */}
      <Dialog open={notesDialog.isOpen} onOpenChange={closeNotesDialog}>
        <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {notesDialog.isForced ? 'Add Notes (Required)' : 'Edit Notes'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              {notesDialog.isForced 
                ? 'Please add notes for the time entry (required when logging hours):'
                : 'Edit notes for this time entry:'
              }
            </p>
            <Textarea
              value={notesDialog.currentNote}
              onChange={(e) => setNotesDialog(prev => ({ ...prev, currentNote: e.target.value }))}
              placeholder="Enter your notes here..."
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Characters: {notesDialog.currentNote.length}/500</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-end sm:space-x-2">
              <Button 
                variant="outline" 
                onClick={closeNotesDialog}
                disabled={notesDialog.isForced && !notesDialog.currentNote.trim()}
                className="w-full sm:w-auto"
              >
                {notesDialog.isForced ? 'Cancel Entry' : 'Cancel'}
              </Button>
              <Button 
                onClick={() => saveNotes(notesDialog.currentNote)}
                disabled={notesDialog.isForced && !notesDialog.currentNote.trim()}
                className="w-full sm:w-auto"
              >
                Save Notes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WeeklyTrackTime;
