import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { TimeTrackingService, ProjectService, ApiError } from '@/services/api';
import { timeEntryService } from '@/services/dataService';
import { Project, TimeEntry } from '@/data/dummyData';
import { useAuth } from '@/contexts/AuthContext';

interface ProjectEntry {
  id: string;
  name: string;
  hours: number;
  notes: string;
  status?: 'active' | 'inactive' | 'not_started' | 'no_dates';
  hasDateIssue?: boolean;
  isReadOnly?: boolean;
}

interface DailyTrackTimeProps {
  onViewChange: (view: 'daily' | 'weekly' | 'monthly') => void;
}

const DailyTrackTime: React.FC<DailyTrackTimeProps> = ({ onViewChange }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const textareaRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({});
  
  // Debouncing and save status states
  const [savingStatus, setSavingStatus] = useState<{ [key: string]: 'idle' | 'saving' | 'saved' | 'error' }>({});
  const [lastSaved, setLastSaved] = useState<{ [key: string]: Date }>({});
  const debounceTimers = useRef<{ [key: string]: NodeJS.Timeout }>({});
  
  const [projects, setProjects] = useState<ProjectEntry[]>([]);
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

  // Load user's projects and time entries
  useEffect(() => {
    if (user) {
      loadProjectsAndTimeEntries();
    }
  }, [user, selectedDate]);

  const loadProjectsAndTimeEntries = async () => {
    if (!user) return;

    try {
      // Get all projects (they already include assignment info from backend)
      const allProjects = await ProjectService.getAllProjects();
      
      // Filter projects assigned to current user
      const assignedProjects = allProjects.filter(project => 
        (project as any).assigned_user_ids?.includes(parseInt(user.id))
      );
      
      // Get time entries for this user and date
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const timeEntries = await TimeTrackingService.getAllTimeEntries({
        date: dateString
      });
      
      // Filter time entries for current user
      const userTimeEntries = timeEntries.filter(entry => 
        (entry as any).user === parseInt(user.id)
      );
    
      // Get projects that are currently active on the selected date
      const activeProjects = assignedProjects.filter(project => 
        isProjectActiveOnDate(project, selectedDate)
      );
      
      // Get projects that have existing time entries (even if inactive now)
      const projectsWithEntries = assignedProjects.filter(project => 
        userTimeEntries.some(entry => String((entry as any).project) === String(project.id))
      );
      
      // Combine active projects and projects with existing entries (avoid duplicates)
      const allRelevantProjects = [...activeProjects];
      projectsWithEntries.forEach(project => {
        if (!allRelevantProjects.find(p => p.id === project.id)) {
          allRelevantProjects.push(project);
        }
      });
    
      // Create project entries with existing time data
      const projectEntries: ProjectEntry[] = allRelevantProjects.map(project => {
        const existingEntry = userTimeEntries.find(entry => 
          String((entry as any).project) === String(project.id)
        );
        const hasDateIssue = !(project as any).start_date || !(project as any).end_date;
        const isCurrentlyActive = isProjectActiveOnDate(project, selectedDate);
        
        return {
          id: String(project.id),
          name: project.name,
          hours: Number(existingEntry?.hours || 0),
          notes: (existingEntry as any)?.note || '', // Note: backend uses 'note' not 'notes'
          status: (project as any).status,
          hasDateIssue: hasDateIssue,
          isReadOnly: !isCurrentlyActive && !hasDateIssue // Read-only if inactive and has proper dates
        };
      });

      setProjects(projectEntries);
    } catch (error) {
      console.error('Error loading projects and time entries:', error);
    }
  };

  // Calculate total hours for the day
  const totalHours = projects.reduce((sum, project) => sum + Number(project.hours || 0), 0);

  // Track pending API calls to prevent race conditions
  const pendingCalls = useRef<{ [key: string]: boolean }>({});

  // Save hours to API with better error handling
  const saveHoursToDatabase = async (projectId: string, hours: number) => {
    if (!user) return;
    
    // Prevent multiple simultaneous calls for same project
    const callKey = `${projectId}-${format(selectedDate, 'yyyy-MM-dd')}`;
    if (pendingCalls.current[callKey]) {
      console.log('Skipping duplicate call for:', callKey);
      return;
    }
    
    try {
      pendingCalls.current[callKey] = true;
      setSavingStatus(prev => ({ ...prev, [projectId]: 'saving' }));
      
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const existingProject = projects.find(p => p.id === projectId);
      
      // Check if time entry exists with retry logic
      let timeEntries = await TimeTrackingService.getAllTimeEntries({
        date: dateString
      });
      
      let existingEntry = timeEntries.find(entry => 
        String((entry as any).project) === String(projectId) && 
        (entry as any).user === parseInt(user.id)
      );
      
      // If no existing entry found, wait a bit and retry (handles race condition)
      if (!existingEntry) {
        console.log('No existing entry found, waiting and retrying...');
        await new Promise(resolve => setTimeout(resolve, 500));
        timeEntries = await TimeTrackingService.getAllTimeEntries({
          date: dateString
        });
        existingEntry = timeEntries.find(entry => 
          String((entry as any).project) === String(projectId) && 
          (entry as any).user === parseInt(user.id)
        );
      }
      
      if (existingEntry) {
        console.log('Updating existing entry:', existingEntry.id);
        // Update existing entry using proper API service
        await TimeTrackingService.updateTimeEntry((existingEntry as any).id, {
          project: parseInt(projectId),
          date: dateString,
          hours: hours,
          note: existingProject?.notes || ''
        } as any);
      } else {
        console.log('Creating new entry for project:', projectId);
        // Create new entry
        await TimeTrackingService.createTimeEntry({
          project: parseInt(projectId),
          date: dateString,
          hours: hours,
          note: existingProject?.notes || ''
        });
      }
      
      setSavingStatus(prev => ({ ...prev, [projectId]: 'saved' }));
      
    } catch (error) {
      console.error('Failed to save hours:', error);
      setSavingStatus(prev => ({ ...prev, [projectId]: 'error' }));
      
      // Auto-hide error status after 5 seconds
      setTimeout(() => {
        setSavingStatus(prev => ({ ...prev, [projectId]: 'idle' }));
      }, 5000);
    } finally {
      // Clear pending call flag
      pendingCalls.current[callKey] = false;
    }
  };

  // Save notes to API with debouncing and race condition protection
  const saveNotesToDatabase = async (projectId: string, notes: string) => {
    if (!user) return;
    
    // Prevent multiple simultaneous calls for same project
    const callKey = `${projectId}-${format(selectedDate, 'yyyy-MM-dd')}-notes`;
    if (pendingCalls.current[callKey]) {
      console.log('Skipping duplicate notes call for:', callKey);
      return;
    }
    
    try {
      pendingCalls.current[callKey] = true;
      setSavingStatus(prev => ({ ...prev, [projectId]: 'saving' }));
      
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const existingProject = projects.find(p => p.id === projectId);
      
      // Check if time entry exists with retry logic
      let timeEntries = await TimeTrackingService.getAllTimeEntries({
        date: dateString
      });
      
      let existingEntry = timeEntries.find(entry => 
        String((entry as any).project) === String(projectId) && 
        (entry as any).user === parseInt(user.id)
      );
      
      // If no existing entry found, wait a bit and retry (handles race condition)
      if (!existingEntry) {
        console.log('No existing entry found for notes, waiting and retrying...');
        await new Promise(resolve => setTimeout(resolve, 500));
        timeEntries = await TimeTrackingService.getAllTimeEntries({
          date: dateString
        });
        existingEntry = timeEntries.find(entry => 
          String((entry as any).project) === String(projectId) && 
          (entry as any).user === parseInt(user.id)
        );
      }
      
      if (existingEntry) {
        console.log('Updating existing entry notes:', existingEntry.id);
        // Update existing entry using proper API service
        await TimeTrackingService.updateTimeEntry((existingEntry as any).id, {
          project: parseInt(projectId),
          date: dateString,
          hours: existingProject?.hours || 0,
          note: notes
        } as any);
      } else {
        console.log('Creating new entry for notes, project:', projectId);
        // Create new entry
        await TimeTrackingService.createTimeEntry({
          project: parseInt(projectId),
          date: dateString,
          hours: existingProject?.hours || 0,
          note: notes
        });
      }
      
      setSavingStatus(prev => ({ ...prev, [projectId]: 'saved' }));
      setLastSaved(prev => ({ ...prev, [projectId]: new Date() }));
      
      // Auto-hide saved status after 3 seconds
      setTimeout(() => {
        setSavingStatus(prev => ({ ...prev, [projectId]: 'idle' }));
      }, 3000);
      
    } catch (error) {
      console.error('Failed to save notes:', error);
      setSavingStatus(prev => ({ ...prev, [projectId]: 'error' }));
      
      // Auto-hide error status after 5 seconds
      setTimeout(() => {
        setSavingStatus(prev => ({ ...prev, [projectId]: 'idle' }));
      }, 5000);
    } finally {
      // Clear pending call flag
      pendingCalls.current[callKey] = false;
    }
  };

  // Function to resize textarea based on content
  const resizeTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    const computed = window.getComputedStyle(textarea);
    const lineHeight = parseInt(computed.lineHeight) || 20;
    const paddingTop = parseInt(computed.paddingTop) || 0;
    const paddingBottom = parseInt(computed.paddingBottom) || 0;
    const minHeight = lineHeight + paddingTop + paddingBottom;
    
    textarea.style.height = Math.max(minHeight, textarea.scrollHeight) + 'px';
  };

  // Effect to resize textareas on initial render and when projects change
  useEffect(() => {
    Object.values(textareaRefs.current).forEach(textarea => {
      if (textarea) {
        resizeTextarea(textarea);
      }
    });
  }, [projects]);

  // Cleanup debounce timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(timer => {
        if (timer) clearTimeout(timer);
      });
    };
  }, []);

  // Helper function to get save status display
  const getSaveStatusDisplay = (projectId: string) => {
    const status = savingStatus[projectId] || 'idle';
    const lastSaveTime = lastSaved[projectId];

    switch (status) {
      case 'saving':
        return { text: 'Saving...', className: 'text-blue-600' };
      case 'saved':
        return { 
          text: `Saved ${lastSaveTime ? format(lastSaveTime, 'HH:mm:ss') : ''}`, 
          className: 'text-green-600' 
        };
      case 'error':
        return { text: 'Save failed - will retry', className: 'text-red-600' };
      default:
        return null;
    }
  };

  const updateProjectHours = (projectId: string, hours: number) => {
    const validHours = Math.max(0, hours);
    
    // Update UI immediately
    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        return { ...project, hours: validHours };
      }
      return project;
    }));
    
    // Save to localStorage
    saveHoursToDatabase(projectId, validHours);
  };

  // Debounced save function - this will call the save after user stops typing
  const debouncedSaveNotes = useCallback((projectId: string, notes: string) => {
    // Clear existing timer for this project
    if (debounceTimers.current[projectId]) {
      clearTimeout(debounceTimers.current[projectId]);
    }

    // Set new timer for 800ms debounce
    debounceTimers.current[projectId] = setTimeout(() => {
      saveNotesToDatabase(projectId, notes);
    }, 800);
  }, [user, selectedDate, projects]);

  // Immediate UI update function (no API call - instant feedback)
  const updateProjectNotesUI = (projectId: string, notes: string) => {
    // Limit notes to 1000 characters
    const limitedNotes = notes.slice(0, 1000);
    
    // Update UI immediately for responsive experience
    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        return { ...project, notes: limitedNotes };
      }
      return project;
    }));
  };

  // Combined function for notes update (UI + debounced API)
  const updateProjectNotes = (projectId: string, notes: string) => {
    const limitedNotes = notes.slice(0, 1000);
    
    // 1. Update UI immediately (no lag for user)
    updateProjectNotesUI(projectId, limitedNotes);
    
    // 2. Debounced API call (only after user stops typing)
    debouncedSaveNotes(projectId, limitedNotes);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    setSelectedDate(direction === 'next' ? addDays(selectedDate, 1) : subDays(selectedDate, 1));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setIsCalendarOpen(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header with view selector and date navigation */}
      <div className="flex flex-col space-y-3 md:space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex space-x-2">
            <Button
              variant="default"
              size="sm"
              className="text-xs md:text-sm"
            >
              Daily
            </Button>
            <Button
              variant={onViewChange ? "outline" : "default"}
              size="sm"
              onClick={() => onViewChange('weekly')}
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
              onClick={() => navigateDate('prev')}
              className="flex items-center text-xs md:text-sm"
            >
              <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
              Previous Day
            </Button>

            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs md:text-sm">
                  <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  {format(selectedDate, 'EEEE, MMM dd, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('next')}
              className="flex items-center text-xs md:text-sm"
            >
              Next Day
              <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </div>

          <Badge variant="secondary" className="text-xs md:text-sm py-1 px-2 md:px-3">
            Total Hours: {totalHours}
          </Badge>
        </div>
      </div>

      {/* Daily time tracking table */}
      <div className="overflow-auto border rounded-lg">
        {projects.length === 0 ? (
          <div className="text-center py-12 px-6">
            <div className="mb-4">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Projects Available</h3>
              <p className="text-gray-500 mb-2">
                No projects are available for logging time on {format(selectedDate, 'MMM dd, yyyy')}.
              </p>
              <p className="text-gray-500 text-sm">
                This could be because:
                <br />• You are not assigned to any projects
                <br />• No projects were active on this date
                <br />• Projects need start and end dates to be set
              </p>
            </div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="sticky top-0 bg-blue-600 text-white z-10">
              <tr>
                <th className="text-left p-4 font-semibold w-1/4">Project</th>
                <th className="text-center p-4 font-semibold w-1/6">Hours</th>
                <th className="text-left p-4 font-semibold w-7/12">Notes</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project, projectIndex) => (
                <tr key={project.id} className={projectIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="p-4 font-medium w-1/4">
                    <div className="flex items-center gap-2">
                      <span>{project.name}</span>
                      {project.hasDateIssue && (
                        <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                          No Dates
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-4 w-1/6 text-center">
                    <input
                      type="number"
                      value={project.hours || 0}
                      onChange={(e) => updateProjectHours(project.id, Number(e.target.value))}
                      className="w-20 text-center border rounded px-2 py-1 mx-auto"
                      min="0"
                      step="0.5"
                    />
                  </td>
                  <td className="p-4 w-7/12">
                    <textarea
                      ref={(el) => { textareaRefs.current[project.id] = el; }}
                      value={project.notes || ''}
                      onChange={(e) => updateProjectNotes(project.id, e.target.value)}
                      placeholder="Add notes..."
                      className="w-full resize-none p-2 border rounded bg-gray-50 focus:bg-white focus:border-blue-300 outline-none overflow-y-hidden"
                      style={{
                        minHeight: '36px',
                        lineHeight: '1.4',
                        wordWrap: 'break-word',
                        whiteSpace: 'pre-wrap'
                      }}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        resizeTextarea(target);
                      }}
                      onFocus={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        setTimeout(() => resizeTextarea(target), 0);
                      }}
                      maxLength={1000}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Save status messages - moved outside and below the container */}
      <div className="space-y-1">
        {projects.map((project) => {
          const statusDisplay = getSaveStatusDisplay(project.id);
          if (!statusDisplay) return null;
          
          return (
            <div key={project.id} className={`text-xs ${statusDisplay.className} flex items-center justify-between bg-gray-50 p-2 rounded`}>
              <span className="font-medium">{project.name}:</span>
              <span>{statusDisplay.text}</span>
            </div>
          );
        })}
      </div>

      <div className="text-sm text-gray-500 text-center">
        Changes are automatically saved
      </div>
    </div>
  );
};

export default DailyTrackTime;
