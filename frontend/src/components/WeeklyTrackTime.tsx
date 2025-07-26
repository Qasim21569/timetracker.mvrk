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

      // Create project entries with weekly data
      const projectEntries: ProjectEntry[] = userProjects.map(project => {
        const weeklyHours: { [dayIndex: number]: number } = {};
        const weeklyNotes: { [dayIndex: number]: string } = {};

        // Initialize all days to 0 hours and empty notes
        for (let i = 0; i < 7; i++) {
          weeklyHours[i] = 0;
          weeklyNotes[i] = '';
        }

        // Fill in actual data from time entries
        userTimeEntries.forEach(entry => {
          if (String((entry as any).project) === String(project.id)) {
            const entryDate = new Date((entry as any).date);
            const dayIndex = (entryDate.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
            weeklyHours[dayIndex] = Number(entry.hours || 0);
            weeklyNotes[dayIndex] = (entry as any).note || '';
          }
        });

        return {
          id: String(project.id),
          name: project.name,
          weeklyHours,
          weeklyNotes
        };
      });

      setProjects(projectEntries);
    } catch (error) {
      console.error('Error loading weekly data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get Monday of the selected week
  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
  
  // Generate days of the week starting from Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Calculate daily totals
  const dailyTotals = weekDays.map((_, dayIndex) => 
    projects.reduce((sum, project) => sum + Number(project.weeklyHours[dayIndex] || 0), 0)
  );

  // Calculate total weekly hours
  const totalWeeklyHours = dailyTotals.reduce((sum, dayTotal) => sum + Number(dayTotal || 0), 0);

  // Auto-save functionality - save to API
  const autoSave = async (updatedProjects: ProjectEntry[]) => {
    setProjects(updatedProjects);
    
    // Save changes to API (will implement per-entry saving)
    console.log('Auto-saving weekly data to API...', updatedProjects);
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

  const updateProjectHours = (projectId: string, dayIndex: number, hours: number) => {
    const project = projects.find(p => p.id === projectId);
    const newHours = Math.max(0, hours);
    
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
    
    const updatedProjects = projects.map(project => {
      if (project.id === projectId) {
        const updatedHours = { ...project.weeklyHours, [dayIndex]: newHours };
        return { ...project, weeklyHours: updatedHours };
      }
      return project;
    });
    
    // Save to API
    const currentNotes = project?.weeklyNotes[dayIndex] || '';
    saveTimeEntryToAPI(projectId, dayIndex, newHours, currentNotes);
    
    autoSave(updatedProjects);
  };

  const updateProjectNotes = (projectId: string, dayIndex: number, notes: string) => {
    const project = projects.find(p => p.id === projectId);
    
    const updatedProjects = projects.map(project => {
      if (project.id === projectId) {
        const updatedNotes = { ...project.weeklyNotes, [dayIndex]: notes };
        return { ...project, weeklyNotes: updatedNotes };
      }
      return project;
    });
    
    // Save to API
    const currentHours = project?.weeklyHours[dayIndex] || 0;
    saveTimeEntryToAPI(projectId, dayIndex, currentHours, notes);
    
    autoSave(updatedProjects);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setSelectedWeek(direction === 'next' ? addWeeks(selectedWeek, 1) : subWeeks(selectedWeek, 1));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Always start from Monday of the selected week
      const mondayOfWeek = startOfWeek(date, { weekStartsOn: 1 });
      setSelectedWeek(mondayOfWeek);
      setIsCalendarOpen(false);
    }
  };

  const openNotesDialog = (projectId: string, dayIndex: number, currentNote: string, isForced: boolean = false) => {
    setNotesDialog({
      isOpen: true,
      projectId,
      dayIndex,
      currentNote,
      isForced
    });
  };

  const closeNotesDialog = () => {
    setNotesDialog({
      isOpen: false,
      projectId: '',
      dayIndex: 0,
      currentNote: '',
      isForced: false
    });
  };

  const saveNotes = () => {
    updateProjectNotes(notesDialog.projectId, notesDialog.dayIndex, notesDialog.currentNote);
    
    // If this was a forced dialog (hours added without notes), now update the hours
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
          autoSave(updatedProjects);
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
            
          </div>
          
          <div className="flex items-center justify-center sm:justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('prev')}
              className="md:size-default flex-shrink-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[200px] md:w-[250px] text-xs md:text-sm flex-shrink-0 justify-start">
                  <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline truncate">Week of {format(weekStart, 'MMM. do, yyyy')}</span>
                  <span className="sm:hidden truncate">{format(weekStart, 'MMM. do')}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  mode="single"
                  selected={selectedWeek}
                  onSelect={handleDateSelect}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('next')}
              className="md:size-default flex-shrink-0"
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
            <Button variant="default" className="bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none">
              Weekly
            </Button>
            <Button variant="outline" onClick={() => onViewChange('monthly')} className="hover:bg-blue-50 flex-1 sm:flex-none">
              Monthly
            </Button>
          </div>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800 sm:ml-auto text-center">
            Total Hours For Week: {totalWeeklyHours}
          </Badge>
        </div>
      </div>

      {/* Weekly time tracking table */}
      {loading ? (
        <div className="flex justify-center items-center py-8 border rounded-lg">
          <div className="text-lg text-gray-600">Loading weekly data...</div>
        </div>
      ) : (
      <div className="overflow-x-auto border rounded-lg">
        <div className="min-w-[800px]">
          <table className="w-full">
            <thead className="sticky top-0 bg-blue-600 text-white z-10">
              <tr>
                <th className="text-left p-2 md:p-4 font-semibold border-r border-blue-500 text-xs md:text-sm">Project</th>
                {weekDays.map((day, index) => (
                  <th key={index} className="text-center p-1 md:p-2 font-semibold border-r border-blue-500 min-w-[100px] md:min-w-[120px]">
                    <div className="flex flex-col">
                      <span className="text-xs md:text-sm">{getDayName(day)}. - {getDayDate(day)}</span>
                      <span className="text-xs font-normal">Total: {dailyTotals[index]}</span>
                    </div>
                  </th>
                ))}
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
                  {weekDays.map((_, dayIndex) => (
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
                        onChange={(e) => updateProjectHours(project.id, dayIndex, Number(e.target.value))}
                        className="w-full text-center border-0 bg-transparent focus:bg-white focus:border focus:border-blue-300 text-xs md:text-sm min-w-0"
                        min="0"
                        step="0.5"
                        onClick={(e) => e.stopPropagation()}
                        data-project={project.id}
                        data-day={dayIndex}
                      />
                      {project.weeklyHours[dayIndex] > 0 && (
                        <div className="text-xs mt-1">
                          {project.weeklyNotes[dayIndex] ? (
                            <span className="text-green-600">📝</span>
                          ) : (
                            <span className="text-red-600">⚠️</span>
                          )}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
                          ))}
            </tbody>
          </table>
        )}
      </div>
      )}

      {/* Notes Dialog */}
      <Dialog open={notesDialog.isOpen} onOpenChange={closeNotesDialog}>
        <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base md:text-lg">Edit Notes</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                Project: <span className="font-medium">{projects.find(p => p.id === notesDialog.projectId)?.name}</span>
              </div>
              <div className="text-sm text-gray-600">
                Day: <span className="font-medium">{weekDays[notesDialog.dayIndex] ? format(weekDays[notesDialog.dayIndex], 'EEEE, MMM do') : ''}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Textarea
                value={notesDialog.currentNote}
                onChange={(e) => setNotesDialog({ ...notesDialog, currentNote: e.target.value })}
                placeholder={notesDialog.isForced ? "Notes are required when hours > 0" : "Enter your notes here..."}
                className="min-h-[120px] md:min-h-[150px] text-sm"
                rows={6}
              />
              {notesDialog.isForced && (
                <div className="text-xs text-red-600">
                  ⚠️ Notes are required when you add hours to a project
                </div>
                      )}
      </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-end sm:space-x-2">
            <Button 
              variant="outline" 
              onClick={closeNotesDialog}
              className="order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={saveNotes} 
              className="bg-blue-600 hover:bg-blue-700 text-white order-1 sm:order-2"
              disabled={notesDialog.isForced && !notesDialog.currentNote.trim()}
            >
              Save Notes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Auto-save indicator */}
      <div className="text-sm text-gray-500 text-center">
        Changes are automatically saved
      </div>
    </div>
  );
};

export default WeeklyTrackTime;
