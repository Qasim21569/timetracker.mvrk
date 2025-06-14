import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar, Edit, MessageSquare } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface ProjectEntry {
  id: string;
  name: string;
  hours: number;
  notes: string;
}

interface NotesDialogState {
  isOpen: boolean;
  projectId: string;
  currentNote: string;
}

interface DailyTrackTimeProps {
  onViewChange: (view: 'daily' | 'weekly' | 'monthly') => void;
}

const DailyTrackTime: React.FC<DailyTrackTimeProps> = ({ onViewChange }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [notesDialog, setNotesDialog] = useState<NotesDialogState>({
    isOpen: false,
    projectId: '',
    currentNote: ''
  });
  const [expandedNotes, setExpandedNotes] = useState<string>('');
  
  const [projects, setProjects] = useState<ProjectEntry[]>([
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
  const autoSave = (updatedProjects: ProjectEntry[]) => {
    console.log('Auto-saving daily data...', updatedProjects);
    setProjects(updatedProjects);
  };

  const updateProjectHours = (projectId: string, hours: number) => {
    const updatedProjects = projects.map(project => {
      if (project.id === projectId) {
        const updatedProject = { ...project, hours: Math.max(0, hours) };
        
        // If hours > 0 and no notes exist, open notes dialog
        if (hours > 0 && !project.notes) {
          setNotesDialog({
            isOpen: true,
            projectId,
            currentNote: project.notes
          });
        }
        
        return updatedProject;
      }
      return project;
    });
    autoSave(updatedProjects);
  };

  const updateProjectNotes = (projectId: string, notes: string) => {
    const updatedProjects = projects.map(project => {
      if (project.id === projectId) {
        return { ...project, notes };
      }
      return project;
    });
    autoSave(updatedProjects);
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

  const openNotesDialog = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setNotesDialog({
        isOpen: true,
        projectId,
        currentNote: project.notes
      });
    }
  };

  const closeNotesDialog = () => {
    setNotesDialog({
      isOpen: false,
      projectId: '',
      currentNote: ''
    });
  };

  const saveNotes = () => {
    updateProjectNotes(notesDialog.projectId, notesDialog.currentNote);
    closeNotesDialog();
  };

  const toggleExpandedNotes = (projectId: string) => {
    setExpandedNotes(expandedNotes === projectId ? '' : projectId);
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
              className="md:size-default"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="min-w-[180px] md:min-w-[200px] text-xs md:text-sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">{format(selectedDate, 'EEEE, MMM. do, yyyy')}</span>
                  <span className="sm:hidden">{format(selectedDate, 'MMM. do, yyyy')}</span>
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
              className="md:size-default"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* View tabs */}
        <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 sm:items-center">
          <div className="flex space-x-2">
            <Button variant="default" className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none">
              Daily
            </Button>
            <Button variant="outline" onClick={() => onViewChange('weekly')} className="flex-1 sm:flex-none">
              Weekly
            </Button>
            <Button variant="outline" onClick={() => onViewChange('monthly')} className="flex-1 sm:flex-none">
              Monthly
            </Button>
          </div>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800 sm:ml-auto text-center">
            Total Hours: {totalHours}
          </Badge>
        </div>
      </div>

      {/* Daily time tracking table */}
      <div className="overflow-x-auto border rounded-lg">
        <div className="min-w-[600px] md:min-w-0">
          <table className="w-full">
            <thead className="sticky top-0 bg-blue-600 text-white z-10">
              <tr>
                <th className="text-left p-2 md:p-4 font-semibold text-xs md:text-sm">Project</th>
                <th className="text-center p-2 md:p-4 font-semibold text-xs md:text-sm">Hours</th>
                <th className="text-left p-2 md:p-4 font-semibold text-xs md:text-sm">Notes</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project, projectIndex) => (
                <tr key={project.id} className={projectIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="p-2 md:p-4 font-medium border-r border-gray-300 bg-gray-100 text-xs md:text-sm">
                    <div className="truncate max-w-[120px] md:max-w-none" title={project.name}>
                      {project.name}
                    </div>
                  </td>
                  <td className="p-2 md:p-4 text-center border-r border-gray-300">
                    <Input
                      type="number"
                      value={project.hours || 0}
                      onChange={(e) => updateProjectHours(project.id, Number(e.target.value))}
                      className="w-16 md:w-20 text-center border-0 bg-transparent focus:bg-white focus:border focus:border-blue-300 text-xs md:text-sm mx-auto"
                      min="0"
                      step="0.5"
                    />
                  </td>
                  <td className="p-2 md:p-4 border-r border-gray-300">
                    <div className="flex items-center gap-2">
                      <Textarea
                        value={project.notes || ''}
                        onChange={(e) => updateProjectNotes(project.id, e.target.value)}
                        placeholder="Add notes..."
                        className="min-h-[32px] md:min-h-[40px] resize-none text-xs md:text-sm"
                        rows={1}
                      />
                      <Button
                        onClick={() => openNotesDialog(project.id)}
                        variant="outline"
                        size="sm"
                        className="whitespace-nowrap text-xs px-2 md:px-3"
                      >
                        <MessageSquare className="h-3 w-3 md:h-4 md:w-4" />
                        <span className="hidden sm:inline ml-1">Edit</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes Dialog */}
      <Dialog open={notesDialog.isOpen} onOpenChange={closeNotesDialog}>
        <DialogContent className="sm:max-w-[425px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base md:text-lg">Edit Notes</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Notes for {projects.find(p => p.id === notesDialog.projectId)?.name}
              </Label>
              <Textarea
                id="notes"
                value={notesDialog.currentNote}
                onChange={(e) => setNotesDialog({ ...notesDialog, currentNote: e.target.value })}
                placeholder="Enter your notes here..."
                className="min-h-[120px] md:min-h-[150px] text-sm"
                rows={6}
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={closeNotesDialog} className="order-2 sm:order-1">
              Cancel
            </Button>
            <Button onClick={saveNotes} className="bg-blue-600 hover:bg-blue-700 order-1 sm:order-2">
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Auto-save indicator */}
      <div className="text-sm text-gray-500 text-center">
        Changes are automatically saved
      </div>
    </div>
  );
};

export default DailyTrackTime;
