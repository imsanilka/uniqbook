
export type UserRole = 'student' | 'staff' | 'admin';

export type RequestStatus =
  | 'Submitted'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved';

export interface StaffProfile {
  uid: string;
  role: 'staff';
  teamId: string;
}

export interface StaffRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  status: RequestStatus;
  assignedTeamId: string;
  anonymous: boolean;
}

export interface StaffReply {
  id: string;
  requestId: string;
  staffId: string;
  message: string;
}

export interface StudentNotification {
  id: string;
  requestId: string;
  title: string;
  message: string;
  read: boolean;
}
