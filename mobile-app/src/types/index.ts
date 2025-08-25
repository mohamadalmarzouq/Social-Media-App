// Contest types
export interface Contest {
  id: string;
  title: string;
  description?: string;
  platform: 'INSTAGRAM' | 'TIKTOK';
  packageQuota: number;
  expectedSubmissions: number;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  round: number;
  acceptedCount: number;
  createdAt: string;
  updatedAt: string;
  fileType?: string;
  packageType?: string;
  winningSubmissionId?: string;
  winnersNeeded: number;
  logoFileTypes: string[];
  _count: {
    submissions: number;
  };
  brand?: {
    logoUrl?: string;
    colors: string[];
  };
}

// Winning design types for work API
export interface WinningDesign {
  id: string;
  submission: {
    id: string;
    contest: {
      id: string;
      title: string;
      platform: string;
      round: number;
    };
    designer: {
      name: string;
      email: string;
    };
    round: number;
    createdAt: string;
  };
  assets: Array<{
    id: string;
    url: string;
    filename: string;
    type: string;
    width?: number;
    height?: number;
    mimeType: string;
    fileSize: number;
  }>;
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
  assets?: Array<{
    id: string;
    url: string;
    filename: string;
    type: string;
  }>;
  files?: string[]; // Keep for backward compatibility
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
