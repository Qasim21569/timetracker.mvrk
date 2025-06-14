
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface ProjectEntry {
  id: string;
  name: string;
  hours: number;
  notes: string;
}

const DailyTrackTime = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectEntry[]>([
    { id: '1', name: 'Internal Meetings', hours: 1, notes: 'Team standup and planning session' },
    { id: '2', name: 'Project X', hours: 4, notes: 'Frontend development work' },
    { id: '3', name: 'Project Y', hours: 3, notes: 'Backend API implementation' },
  ]);
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null);

  // Calculate total hours
  const totalHours = projects.reduce((sum, project) => sum + project.hours, 0);

  // Auto-save functionality
  const autoSave = (updatedProjects: ProjectEntry[]) => {
    // Simulate API call for auto-save
    console.log('Auto-saving data...', updatedProjects);
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
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setIsCalendarOpen(false);
    }
  };

  const toggleNotesExpansion = (projectId: string) => {
    setExpandedNotes(expandedNotes === projectId ? null : projectId);
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
                  {format(selectedDate, 'EEE. - MMM. do, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  initialFocus
                  className="pointer-events-auto"
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
          <Button variant="outline">Weekly</Button>
          <Button variant="outline">Monthly</Button>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800 ml-auto">
            Total Daily Hours: {totalHours}
          </Badge>
        </div>
      </div>

      {/* Time tracking table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-auto max-h-[600px]">
            <table className="w-full">
              <thead className="sticky top-0 bg-blue-600 text-white z-10">
                <tr>
                  <th className="text-left p-4 font-semibold">Project</th>
                  <th className="text-center p-4 font-semibold">Hours</th>
                  <th className="text-left p-4 font-semibold">Notes</th>
                  <th className="w-16 p-4"></th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project, index) => (
                  <tr key={project.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-4 font-medium">{project.name}</td>
                    <td className="p-4 text-center">
                      <Input
                        type="number"
                        value={project.hours}
                        onChange={(e) => updateProjectHours(project.id, Number(e.target.value))}
                        className="w-20 mx-auto text-center"
                        min="0"
                        step="0.5"
                      />
                    </td>
                    <td className="p-4">
                      {expandedNotes === project.id ? (
                        <Textarea
                          value={project.notes}
                          onChange={(e) => updateProjectNotes(project.id, e.target.value)}
                          placeholder={project.hours > 0 ? "Notes required when hours > 0" : "Notes (optional)"}
                          className="min-h-[100px] resize-y"
                          maxLength={1000}
                          required={project.hours > 0}
                        />
                      ) : (
                        <div 
                          className="min-h-[40px] p-2 border rounded cursor-pointer hover:bg-gray-50"
                          onClick={() => toggleNotesExpansion(project.id)}
                        >
                          {project.notes || (project.hours > 0 ? "Click to add required notes" : "Click to add notes")}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        {project.notes.length}/1000 characters
                      </div>
                    </td>
                    <td className="p-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleNotesExpansion(project.id)}
                      >
                        {expandedNotes === project.id ? 'Collapse' : 'Expand'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Auto-save indicator */}
      <div className="text-sm text-gray-500 text-center">
        Changes are automatically saved
      </div>
    </div>
  );
};

export default DailyTrackTime;
