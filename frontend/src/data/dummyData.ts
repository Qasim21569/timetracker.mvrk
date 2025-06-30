
export type UserRole = "admin" | "user";

export interface User {
  id: string;
  email: string;
  password?: string; // In a real app, this would be a hash
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

export const dummyUsers: User[] = [
  {
    id: "1",
    email: "admin@example.com",
    password: "password",
    name: "Admin User",
    role: "admin",
    avatarUrl: "https://i.pravatar.cc/150?u=admin@example.com",
  },
  {
    id: "2",
    email: "user@example.com",
    password: "password",
    name: "Regular User",
    role: "user",
    avatarUrl: "https://i.pravatar.cc/150?u=user@example.com",
  },
];

export interface Project {
  id: string;
  name: string;
  client: string;
  assignedUserIds: string[];
}

export const dummyProjects: Project[] = [
  { id: "p1", name: "Website Redesign", client: "Tech Solutions Inc.", assignedUserIds: ["1", "2"] },
  { id: "p2", name: "Mobile App Dev", client: "Innovate Ltd.", assignedUserIds: ["2"] },
  { id: "p3", name: "Marketing Campaign", client: "Global Corp", assignedUserIds: ["1"] },
];

export interface TimeEntry {
  id: string;
  userId: string;
  projectId: string;
  date: string; // YYYY-MM-DD
  hours: number;
  notes?: string;
  requiresNote?: boolean;
}

export const dummyTimeEntries: TimeEntry[] = [
  { id: "t1", userId: "2", projectId: "p1", date: "2025-06-10", hours: 5, notes: "Worked on homepage design." },
  { id: "t2", userId: "2", projectId: "p2", date: "2025-06-10", hours: 3, notes: "Fixed login bug." },
  { id: "t3", userId: "1", projectId: "p1", date: "2025-06-11", hours: 8, notes: "Client meeting and requirement gathering.", requiresNote: true },
];
