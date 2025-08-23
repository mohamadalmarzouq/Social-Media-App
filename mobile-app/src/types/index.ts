// Contest types
export interface Contest {
  id: string;
  title: string;
  description?: string;
  service: string;
  filesNeeded: string[];
  packageType: string;
  expectedSubmissions: number;
  finalDesigns: number;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  currentRound: number;
  winnersNeeded: number;
  totalSubmissions: number;
  acceptedSubmissions: number;
  createdAt: string;
  ownerId: string;
  owner: {
    name: string;
    email: string;
  };
  brandGuidelines?: {
    description?: string;
    colors: string[];
    fonts: string[];
  };
}

// Submission types
export interface Submission {
  id: string;
  contestId: string;
  designerId: string;
  designer: {
    name: string;
    email: string;
  };
  files: string[];
  status: 'PENDING' | 'ACCEPTED' | 'PASSED';
  round: number;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

// Comment types
export interface Comment {
  id: string;
  submissionId: string;
  userId: string;
  user: {
    name: string;
    role: 'USER' | 'DESIGNER';
  };
  content: string;
  createdAt: string;
}

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'DESIGNER';
  createdAt: string;
}

// Dashboard stats
export interface DashboardStats {
  totalContests: number;
  activeContests: number;
  completedContests: number;
  cancelledContests: number;
}

// Contest creation form
export interface ContestFormData {
  title: string;
  description: string;
  service: string;
  filesNeeded: string[];
  packageType: string;
  brandGuidelines: {
    description: string;
    colors: string[];
    fonts: string[];
  };
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
