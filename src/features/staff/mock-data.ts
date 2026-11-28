
import type { StaffProfile, StaffRequest } from './types';

export const mockStaff: StaffProfile = {
  uid: 'demo-staff-001',
  role: 'staff',
  teamId: 'it-support',
};

export const mockRequests: StaffRequest[] = [
  {
    id: 'REQ-001',
    title: 'Unable to access student portal',
    description: 'The student portal displays a login error.',
    category: 'IT Support',
    status: 'Assigned',
    assignedTeamId: 'it-support',
    anonymous: false,
  },
  {
    id: 'REQ-002',
    title: 'Wi-Fi connection issue',
    description: 'Unable to connect to the university Wi-Fi.',
    category: 'IT Support',
    status: 'In Progress',
    assignedTeamId: 'it-support',
    anonymous: true,
  },
  {
    id: 'REQ-003',
    title: 'Lecture hall air conditioning issue',
    description: 'The air conditioning is not working.',
    category: 'Facilities',
    status: 'Assigned',
    assignedTeamId: 'facilities',
    anonymous: false,
  },
];
