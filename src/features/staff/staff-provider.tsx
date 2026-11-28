
import {
  createContext,
  useContext,
  useState,
} from 'react';

import type { ReactNode } from 'react';

import {
  mockStaff,
  mockRequests,
} from './mock-data';

import { canUpdateStatus } from './status';

import {
  createReplyNotification,
  createStatusNotification,
  markNotificationAsRead,
} from './notifications';

import type {
  StaffRequest,
  StaffReply,
  RequestStatus,
  StudentNotification,
} from './types';

interface StaffState {
  requests: StaffRequest[];
  replies: StaffReply[];
  notifications: StudentNotification[];
}

interface StaffContextValue extends StaffState {
  updateStatus: (
    requestId: string,
    status: RequestStatus
  ) => void;

  sendReply: (
    requestId: string,
    message: string
  ) => void;

  markAsRead: (
    notificationId: string
  ) => void;

  markAllAsRead: () => void;
}

const StaffContext =
  createContext<StaffContextValue | undefined>(
    undefined
  );

let eventCounter = 0;

function createEventId() {
  eventCounter += 1;

  return `${Date.now()}-${eventCounter}`;
}

export function StaffProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [state, setState] = useState<StaffState>({
    requests: mockRequests,
    replies: [],
    notifications: [],
  });

  function updateStatus(
    requestId: string,
    status: RequestStatus
  ) {
    const eventId = createEventId();

    setState((previous) => {
      const request = previous.requests.find(
        (item) =>
          item.id === requestId &&
          item.assignedTeamId === mockStaff.teamId
      );

      if (!request) {
        return previous;
      }

      if (!canUpdateStatus(request.status, status)) {
        return previous;
      }

      const notification = createStatusNotification(
        requestId,
        status,
        eventId
      );

      return {
        ...previous,

        requests: previous.requests.map((item) =>
          item.id === requestId
            ? { ...item, status }
            : item
        ),

        notifications: [
          notification,
          ...previous.notifications,
        ],
      };
    });
  }

  function sendReply(
    requestId: string,
    message: string
  ) {
    const cleanMessage = message.trim();

    if (
      !cleanMessage ||
      cleanMessage.length > 1000
    ) {
      return;
    }

    const eventId = createEventId();

    setState((previous) => {
      const request = previous.requests.find(
        (item) =>
          item.id === requestId &&
          item.assignedTeamId === mockStaff.teamId
      );

      if (!request) {
        return previous;
      }

      const reply: StaffReply = {
        id: `reply-${eventId}`,
        requestId,
        staffId: mockStaff.uid,
        message: cleanMessage,
      };

      const notification = createReplyNotification(
        requestId,
        eventId
      );

      return {
        ...previous,

        replies: [
          ...previous.replies,
          reply,
        ],

        notifications: [
          notification,
          ...previous.notifications,
        ],
      };
    });
  }

  function markAsRead(notificationId: string) {
    setState((previous) => ({
      ...previous,

      notifications: previous.notifications.map(
        (item) =>
          item.id === notificationId
            ? markNotificationAsRead(item)
            : item
      ),
    }));
  }

  function markAllAsRead() {
    setState((previous) => ({
      ...previous,

      notifications: previous.notifications.map(
        markNotificationAsRead
      ),
    }));
  }

  return (
    <StaffContext.Provider
      value={{
        ...state,
        updateStatus,
        sendReply,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </StaffContext.Provider>
  );
}

export function useStaff() {
  const context = useContext(StaffContext);

  if (!context) {
    throw new Error(
      'useStaff must be used inside StaffProvider'
    );
  }

  return context;
}
