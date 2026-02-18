export interface User {
  id: number;
  email: string;
  role: 'student' | 'employer';
  isActive: boolean;
  name?: string;
  dateJoined: string;
}

export interface StudentProfile {
  id: number;
  user: User;
  fullName: string;
  age: number;
  city: string;
  university: string;
  skills: string[];
  description: string;
  resume?: string; // PDF URL
}

export interface EmployerProfile {
  id: number;
  user: User;
  companyName: string;
  description: string;
  city: string;
  website?: string;
  contactInfo: string;
  isVerified: boolean;
}

export interface Internship {
  id: number;
  title: string;
  description: string;
  requirements: string;
  skills: string[];
  format: 'online' | 'offline' | 'hybrid';
  city: string;
  duration: string;
  isPaid: boolean;
  salary?: number;
  status: 'active' | 'closed';
  dateCreated: string;
  createdAt: string; // Used in some screens
  deadline: string;  // Required for date calculations in screens
  employer: EmployerProfile;
  applicationsCount?: number;
}

export interface Application {
  id: number;
  student: StudentProfile;
  internship: Internship;
  coverLetter: string;
  status: 'sent' | 'accepted' | 'rejected';
  dateApplied: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  role: 'student' | 'employer';
}

export interface InternshipFilters {
  city?: string;
  format?: 'online' | 'offline' | 'hybrid';
  isPaid?: boolean;
  skills?: string[];
  search?: string;
  sortBy?: 'date' | 'deadline' | 'salary';
}