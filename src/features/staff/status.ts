
import type { RequestStatus } from './types';

const allowedTransitions: Record<RequestStatus, RequestStatus[]> = {
  Submitted: [],
  Assigned: ['In Progress'],
  'In Progress': ['Resolved'],
  Resolved: [],
};

export function getAllowedStatuses(
  currentStatus: RequestStatus
): RequestStatus[] {
  return allowedTransitions[currentStatus];
}

export function canUpdateStatus(
  currentStatus: RequestStatus,
  nextStatus: RequestStatus
): boolean {
  return getAllowedStatuses(currentStatus).includes(nextStatus);
}
