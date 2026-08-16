export interface ErrorResponse {
  message: string;
  code?: string;
}

export interface PagedResponse<T> {
  data: T[];
  content?: T[];
  total: number;
  page: number;
  limit: number;
}

export interface TenantResponse {
  id: string;
  name: string;
  subdomain: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface BranchResponse {
  id: string;
  name: string;
  code: string;
  country: string;
  city: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface ClientResponse {
  id: string;
  name: string;
  industry: string;
  country: string;
  contactPerson: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BLACKLISTED';
}

export interface UserProfileResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface CurrentUserResponse {
  user: UserProfileResponse;
  tenant: TenantResponse;
}

export type RequisitionStatus = 'DRAFT' | 'APPROVED' | 'PUBLISHED' | 'OPEN' | 'ON_HOLD' | 'FILLED' | 'CLOSED' | 'CANCELLED';
export type RequisitionPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type JobCategory = 'BLUE_COLLAR' | 'WHITE_COLLAR' | 'EXECUTIVE';
export type CandidateApplicationStatus = 'APPLIED' | 'SCREENING' | 'INTERVIEWING' | 'INTERVIEW_SCHEDULED' | 'INTERVIEWED' | 'SHORTLISTED' | 'SELECTED' | 'OFFERED' | 'OFFER_ACCEPTED' | 'MOBILIZED' | 'HIRED' | 'REJECTED' | 'WITHDRAWN';

export interface Requisition {
  id: string;
  title: string;
  department: string;
  location: string;
  country: string;
  category: JobCategory;
  priority: RequisitionPriority;
  status: RequisitionStatus;
  headcount: number;
  description: string;
  requirements: string;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateDocument {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url?: string;
  uploadedAt: string;
}

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location?: string;
  resumeUrl?: string;
  skills: string[];
  experienceYears: number;
  documents?: CandidateDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface CandidateApplication {
  id: string;
  candidateId: string;
  requisitionId: string;
  status: CandidateApplicationStatus;
  appliedAt?: string;
  updatedAt?: string;
  candidate?: Candidate;
  requisition?: Requisition;
}

export interface CreateRequisitionRequest {
  title: string;
  department: string;
  location: string;
  country: string;
  category: JobCategory;
  priority: RequisitionPriority;
  headcount: number;
  description: string;
  requirements: string;
}

export type UpdateRequisitionRequest = Partial<CreateRequisitionRequest> & {
  status?: RequisitionStatus;
};

export interface CreateCandidateRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location?: string;
  skills: string[];
  experienceYears: number;
}
