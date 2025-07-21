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
      const userProjects = allProjects.filter(project => 
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
    
         // Create project entries with existing time data
     const projectEntries: ProjectEntry[] = userProjects.map(project => {
        const existingEntry = userTimeEntries.find(entry => 
          String((entry as any).project) === String(project.id)
        );
       return {
          id: String(project.id),
         name: project.name,
         hours: existingEntry?.hours || 0,
          notes: (existingEntry as any)?.note || '' // Note: backend uses 'note' not 'notes'
       };
     });

    setProjects(projectEntries);
    } catch (error) {
      console.error('Error loading projects and time entries:', error);
    }
  };

  // Calculate total hours for the day
  const totalHours = projects.reduce((sum, project) => sum + project.hours, 0);

  // Save hours to API
  const saveHoursToDatabase = async (projectId: string, hours: number) => {
    if (!user) return;
    
    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const existingProject = projects.find(p => p.id === projectId);
      
      // Check if time entry exists
      const timeEntries = await TimeTrackingService.getAllTimeEntries({
        date: dateString
      });
      
      const existingEntry = timeEntries.find(entry => 
        String((entry as any).project) === String(projectId) && 
        (entry as any).user === parseInt(user.id)
      );
      
      if (existingEntry) {
        // Update existing entry
        const response = await fetch(`http://localhost:8000/api/hours/${(existingEntry as any).id}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify({
            project: parseInt(projectId),
            date: dateString,
            hours: hours,
            note: existingProject?.notes || ''
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to update time entry');
        }
      } else {
        // Create new entry
        await TimeTrackingService.createTimeEntry({
          project: parseInt(projectId),
        date: dateString,
        hours: hours,
          note: existingProject?.notes || ''
      });
      }
      
    } catch (error) {
      console.error('Failed to save hours:', error);
    }
  };

  // Save notes to API with debouncing
  const saveNotesToDatabase = async (projectId: string, notes: string) => {
    if (!user) return;
    
    try {
      setSavingStatus(prev => ({ ...prev, [projectId]: 'saving' }));
      
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const existingProject = projects.find(p => p.id === projectId);
      
      // Check if time entry exists
      const timeEntries = await TimeTrackingService.getAllTimeEntries({
        date: dateString
      });
      
      const existingEntry = timeEntries.find(entry => 
        String((entry as any).project) === String(projectId) && 
        (entry as any).user === parseInt(user.id)
      );
      
      if (existingEntry) {
        // Update existing entry - call custom API update
        const response = await fetch(`http://localhost:8000/api/hours/${(existingEntry as any).id}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify({
            project: parseInt(projectId),
            date: dateString,
            hours: existingProject?.hours || 0,
            note: notes
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to update time entry');
        }
      } else {
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
            
          </div>
          
          <div className="flex items-center justify-center sm:justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('prev')}
              className="md:size-default flex-shrink-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[220px] md:w-[280px] text-xs md:text-sm flex-shrink-0 justify-start">
                  <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline truncate">{format(selectedDate, 'EEEE, MMM. do, yyyy')}</span>
                  <span className="sm:hidden truncate">{format(selectedDate, 'MMM. do, yyyy')}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
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
              className="md:size-default flex-shrink-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* View tabs */}
        <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 sm:items-center">
          <div className="flex space-x-2">
            <Button variant="default" className="bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none">
              Daily
            </Button>
            <Button variant="outline" onClick={() => onViewChange('weekly')} className="hover:bg-blue-50 flex-1 sm:flex-none">
              Weekly
            </Button>
            <Button variant="outline" onClick={() => onViewChange('monthly')} className="hover:bg-blue-50 flex-1 sm:flex-none">
              Monthly
            </Button>
          </div>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800 sm:ml-auto text-center">
            Total Hours: {totalHours}
          </Badge>
        </div>
      </div>

      {/* Daily time tracking table */}
      <div className="overflow-auto border rounded-lg">
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
                  <td className="p-4 font-medium w-1/4">{project.name}</td>
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
      </div>

      {/* Save status messages - moved outside and below the container */}
      <div className="space-y-1">
        {projects.map((project) => {
          const statusDisplay = getSaveStatusDisplay(project.id);
          return statusDisplay ? (
            <div key={project.id} className="text-xs flex justify-between items-center">
              <span className="font-medium text-gray-600">{project.name}:</span>
              <span className={statusDisplay.className}>
                {statusDisplay.text}
              </span>
            </div>
          ) : null;
        })}
      </div>

      {/* Auto-save indicator */}
      <div className="text-sm text-gray-500 text-center">
        Changes are automatically saved
      </div>
    </div>
  );
};

export default DailyTrackTime;
