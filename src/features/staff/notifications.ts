
import type {
  StudentNotification,
  RequestStatus,
} from './types';

export function createReplyNotification(
  requestId: string,
  eventId: string
): StudentNotification {
  return {
    id: `notification-${eventId}`,
    requestId,
    title: 'New Staff Reply',
    message: 'A staff member has replied to your request.',
    read: false,
  };
}

export function createStatusNotification(
  requestId: string,
  status: RequestStatus,
  eventId: string
): StudentNotification {
  return {
    id: `notification-${eventId}`,
    requestId,
    title: 'Request Status Updated',
    message: `Your request status has changed to ${status}.`,
    read: false,
  };
}

export function markNotificationAsRead(
  notification: StudentNotification
): StudentNotification {
  return {
    ...notification,
    read: true,
  };
}
