
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar, Edit } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
    <div className="space-y-6">
      {/* Header with view selector and date navigation */}
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button variant="default" className="bg-green-500 hover:bg-green-600">
              Track Time
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateDate('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="min-w-[200px]">
                  <Calendar className="mr-2 h-4 w-4" />
                  {format(selectedDate, 'EEEE, MMM. do, yyyy')}
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
              size="icon"
              onClick={() => navigateDate('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* View tabs */}
        <div className="flex space-x-2">
          <Button variant="default" className="bg-green-500 hover:bg-green-600">
            Daily
          </Button>
          <Button variant="outline" onClick={() => onViewChange('weekly')}>
            Weekly
          </Button>
          <Button variant="outline" onClick={() => onViewChange('monthly')}>
            Monthly
          </Button>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800 ml-auto">
            Total Hours: {totalHours}
          </Badge>
        </div>
      </div>

      {/* Daily time tracking table */}
      <div className="overflow-auto max-h-[600px] border rounded-lg">
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
                  <Input
                    type="number"
                    value={project.hours}
                    onChange={(e) => updateProjectHours(project.id, Number(e.target.value))}
                    className="w-24 text-center"
                    min="0"
                    step="0.5"
                  />
                </td>
                <td className="p-4">
                  <div className="flex items-start space-x-2">
                    <div className="flex-1">
                      <div 
                        className={`p-2 border rounded cursor-pointer hover:bg-gray-50 ${
                          expandedNotes === project.id ? 'min-h-[100px]' : 'h-12 overflow-hidden'
                        }`}
                        onClick={() => openNotesDialog(project.id)}
                      >
                        {project.notes || (project.hours > 0 ? 'Notes required when hours > 0' : 'Click to add notes')}
                      </div>
                      {project.hours > 0 && !project.notes && (
                        <div className="text-xs text-red-600 mt-1">⚠️ Notes required</div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleExpandedNotes(project.id)}
                      className="mt-1"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notes Dialog */}
      <Dialog open={notesDialog.isOpen} onOpenChange={(open) => !open && closeNotesDialog()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Add Notes - {projects.find(p => p.id === notesDialog.projectId)?.name}
              <div className="text-sm font-normal text-gray-600">
                {format(selectedDate, 'EEEE, MMM do, yyyy')}
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={notesDialog.currentNote}
              onChange={(e) => setNotesDialog({ ...notesDialog, currentNote: e.target.value })}
              placeholder="Notes are required when hours > 0"
              className="min-h-[100px] resize-y"
              maxLength={1000}
            />
            <div className="text-xs text-gray-500">
              {notesDialog.currentNote.length}/1000 characters
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={closeNotesDialog}>
                Cancel
              </Button>
              <Button onClick={saveNotes} className="bg-green-500 hover:bg-green-600">
                Save Notes
              </Button>
            </div>
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

export default DailyTrackTime;
