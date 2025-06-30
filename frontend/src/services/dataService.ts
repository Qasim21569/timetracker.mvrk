import { User, Project, TimeEntry, dummyUsers, dummyProjects, dummyTimeEntries } from '@/data/dummyData';

// Storage keys
const STORAGE_KEYS = {
  USERS: 'timetracker_users',
  PROJECTS: 'timetracker_projects',
  TIME_ENTRIES: 'timetracker_time_entries',
  INITIALIZED: 'timetracker_initialized'
};

// Initialize localStorage with dummy data if not already initialized
export const initializeData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(dummyUsers));
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(dummyProjects));
    localStorage.setItem(STORAGE_KEYS.TIME_ENTRIES, JSON.stringify(dummyTimeEntries));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }
};

// Generic helper functions
const getFromStorage = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return [];
  }
};

const saveToStorage = <T>(key: string, data: T[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// User management functions
export const userService = {
  getAll: (): User[] => getFromStorage<User>(STORAGE_KEYS.USERS),
  
  getById: (id: string): User | undefined => {
    const users = getFromStorage<User>(STORAGE_KEYS.USERS);
    return users.find(user => user.id === id);
  },
  
  getByEmail: (email: string): User | undefined => {
    const users = getFromStorage<User>(STORAGE_KEYS.USERS);
    return users.find(user => user.email === email);
  },
  
  create: (userData: Omit<User, 'id'>): User => {
    const users = getFromStorage<User>(STORAGE_KEYS.USERS);
    const newUser: User = {
      ...userData,
      id: Date.now().toString(), // Simple ID generation
    };
    const updatedUsers = [...users, newUser];
    saveToStorage(STORAGE_KEYS.USERS, updatedUsers);
    return newUser;
  },
  
  update: (id: string, userData: Partial<Omit<User, 'id'>>): User | null => {
    const users = getFromStorage<User>(STORAGE_KEYS.USERS);
    const userIndex = users.findIndex(user => user.id === id);
    
    if (userIndex === -1) return null;
    
    const updatedUser = { ...users[userIndex], ...userData };
    users[userIndex] = updatedUser;
    saveToStorage(STORAGE_KEYS.USERS, users);
    return updatedUser;
  },
  
  delete: (id: string): boolean => {
    const users = getFromStorage<User>(STORAGE_KEYS.USERS);
    const filteredUsers = users.filter(user => user.id !== id);
    
    if (filteredUsers.length === users.length) return false;
    
    saveToStorage(STORAGE_KEYS.USERS, filteredUsers);
    // Also clean up related time entries
    timeEntryService.deleteByUserId(id);
    return true;
  }
};

// Project management functions
export const projectService = {
  getAll: (): Project[] => getFromStorage<Project>(STORAGE_KEYS.PROJECTS),
  
  getById: (id: string): Project | undefined => {
    const projects = getFromStorage<Project>(STORAGE_KEYS.PROJECTS);
    return projects.find(project => project.id === id);
  },
  
  getByUserId: (userId: string): Project[] => {
    const projects = getFromStorage<Project>(STORAGE_KEYS.PROJECTS);
    return projects.filter(project => project.assignedUserIds.includes(userId));
  },
  
  create: (projectData: Omit<Project, 'id'>): Project => {
    const projects = getFromStorage<Project>(STORAGE_KEYS.PROJECTS);
    const newProject: Project = {
      ...projectData,
      id: `p${Date.now()}`, // Simple ID generation with prefix
    };
    const updatedProjects = [...projects, newProject];
    saveToStorage(STORAGE_KEYS.PROJECTS, updatedProjects);
    return newProject;
  },
  
  update: (id: string, projectData: Partial<Omit<Project, 'id'>>): Project | null => {
    const projects = getFromStorage<Project>(STORAGE_KEYS.PROJECTS);
    const projectIndex = projects.findIndex(project => project.id === id);
    
    if (projectIndex === -1) return null;
    
    const updatedProject = { ...projects[projectIndex], ...projectData };
    projects[projectIndex] = updatedProject;
    saveToStorage(STORAGE_KEYS.PROJECTS, projects);
    return updatedProject;
  },
  
  delete: (id: string): boolean => {
    const projects = getFromStorage<Project>(STORAGE_KEYS.PROJECTS);
    const filteredProjects = projects.filter(project => project.id !== id);
    
    if (filteredProjects.length === projects.length) return false;
    
    saveToStorage(STORAGE_KEYS.PROJECTS, filteredProjects);
    // Also clean up related time entries
    timeEntryService.deleteByProjectId(id);
    return true;
  }
};

// Time entry management functions
export const timeEntryService = {
  getAll: (): TimeEntry[] => getFromStorage<TimeEntry>(STORAGE_KEYS.TIME_ENTRIES),
  
  getById: (id: string): TimeEntry | undefined => {
    const entries = getFromStorage<TimeEntry>(STORAGE_KEYS.TIME_ENTRIES);
    return entries.find(entry => entry.id === id);
  },
  
  getByUserId: (userId: string): TimeEntry[] => {
    const entries = getFromStorage<TimeEntry>(STORAGE_KEYS.TIME_ENTRIES);
    return entries.filter(entry => entry.userId === userId);
  },
  
  getByUserIdAndDate: (userId: string, date: string): TimeEntry[] => {
    const entries = getFromStorage<TimeEntry>(STORAGE_KEYS.TIME_ENTRIES);
    return entries.filter(entry => entry.userId === userId && entry.date === date);
  },
  
  getByProjectId: (projectId: string): TimeEntry[] => {
    const entries = getFromStorage<TimeEntry>(STORAGE_KEYS.TIME_ENTRIES);
    return entries.filter(entry => entry.projectId === projectId);
  },
  
  create: (entryData: Omit<TimeEntry, 'id'>): TimeEntry => {
    const entries = getFromStorage<TimeEntry>(STORAGE_KEYS.TIME_ENTRIES);
    const newEntry: TimeEntry = {
      ...entryData,
      id: `t${Date.now()}`, // Simple ID generation with prefix
    };
    const updatedEntries = [...entries, newEntry];
    saveToStorage(STORAGE_KEYS.TIME_ENTRIES, updatedEntries);
    return newEntry;
  },
  
  update: (id: string, entryData: Partial<Omit<TimeEntry, 'id'>>): TimeEntry | null => {
    const entries = getFromStorage<TimeEntry>(STORAGE_KEYS.TIME_ENTRIES);
    const entryIndex = entries.findIndex(entry => entry.id === id);
    
    if (entryIndex === -1) return null;
    
    const updatedEntry = { ...entries[entryIndex], ...entryData };
    entries[entryIndex] = updatedEntry;
    saveToStorage(STORAGE_KEYS.TIME_ENTRIES, entries);
    return updatedEntry;
  },
  
  upsert: (entryData: { userId: string; projectId: string; date: string; hours: number; notes?: string }): TimeEntry => {
    const entries = getFromStorage<TimeEntry>(STORAGE_KEYS.TIME_ENTRIES);
    const existingEntry = entries.find(entry => 
      entry.userId === entryData.userId && 
      entry.projectId === entryData.projectId && 
      entry.date === entryData.date
    );
    
    if (existingEntry) {
      return timeEntryService.update(existingEntry.id, entryData) || existingEntry;
    } else {
      return timeEntryService.create(entryData);
    }
  },
  
  delete: (id: string): boolean => {
    const entries = getFromStorage<TimeEntry>(STORAGE_KEYS.TIME_ENTRIES);
    const filteredEntries = entries.filter(entry => entry.id !== id);
    
    if (filteredEntries.length === entries.length) return false;
    
    saveToStorage(STORAGE_KEYS.TIME_ENTRIES, filteredEntries);
    return true;
  },
  
  deleteByUserId: (userId: string): void => {
    const entries = getFromStorage<TimeEntry>(STORAGE_KEYS.TIME_ENTRIES);
    const filteredEntries = entries.filter(entry => entry.userId !== userId);
    saveToStorage(STORAGE_KEYS.TIME_ENTRIES, filteredEntries);
  },
  
  deleteByProjectId: (projectId: string): void => {
    const entries = getFromStorage<TimeEntry>(STORAGE_KEYS.TIME_ENTRIES);
    const filteredEntries = entries.filter(entry => entry.projectId !== projectId);
    saveToStorage(STORAGE_KEYS.TIME_ENTRIES, filteredEntries);
  }
};

// Initialize data when service is imported
initializeData(); 