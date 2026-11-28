
import { httpsCallable } from 'firebase/functions';

import { getFirebaseFunctions } from '@/lib/firebase';

import type {
  StaffRequest,
  RequestStatus,
  StudentNotification,
} from './types';

export interface StaffReplyRecord {
  id: string;
  requestId: string;
  authorLabel: string;
  message: string;
  createdAt: number | null;
}

export async function fetchStaffQueue() {
  const callable = httpsCallable<
    Record<string, never>,
    { requests: StaffRequest[] }
  >(
    getFirebaseFunctions(),
    'getStaffQueue'
  );

  const result = await callable({});

  return result.data.requests;
}

export async function fetchStaffRequest(
  requestId: string
) {
  const callable = httpsCallable<
    { requestId: string },
    StaffRequest
  >(
    getFirebaseFunctions(),
    'getStaffRequest'
  );

  const result = await callable({ requestId });

  return result.data;
}

export async function submitStaffReply(
  requestId: string,
  message: string,
  eventId: string
) {
  const callable = httpsCallable<
    {
      requestId: string;
      message: string;
      eventId: string;
    },
    {
      success: boolean;
      replyId: string;
    }
  >(
    getFirebaseFunctions(),
    'sendStaffReply'
  );

  const result = await callable({
    requestId,
    message,
    eventId,
  });

  return result.data;
}

export async function changeStaffRequestStatus(
  requestId: string,
  status: RequestStatus,
  eventId: string
) {
  const callable = httpsCallable<
    {
      requestId: string;
      status: RequestStatus;
      eventId: string;
    },
    {
      success: boolean;
      status: RequestStatus;
      eventId: string;
    }
  >(
    getFirebaseFunctions(),
    'updateStaffRequestStatus'
  );

  const result = await callable({
    requestId,
    status,
    eventId,
  });

  return result.data;
}

export async function fetchStaffReplyHistory(
  requestId: string
) {
  const callable = httpsCallable<
    { requestId: string },
    { replies: StaffReplyRecord[] }
  >(
    getFirebaseFunctions(),
    'getStaffReplyHistory'
  );

  const result = await callable({ requestId });

  return result.data.replies;
}

export async function fetchStudentNotifications() {
  const callable = httpsCallable<
    Record<string, never>,
    { notifications: StudentNotification[] }
  >(
    getFirebaseFunctions(),
    'getStudentNotifications'
  );

  const result = await callable({});

  return result.data.notifications;
}

export async function readStudentNotification(
  notificationId: string
) {
  const callable = httpsCallable<
    { notificationId: string },
    { success: boolean }
  >(
    getFirebaseFunctions(),
    'markStudentNotificationRead'
  );

  const result = await callable({
    notificationId,
  });

  return result.data;
}
