 
import { getApps, initializeApp } from "firebase-admin/app";

if (getApps().length === 0) {
  initializeApp();
}

export {
  getStaffQueue,
  getStaffRequest
} from "./staff-queue";

export {
  sendStaffReply
} from "./staff-replies";

export {
  updateStaffRequestStatus
} from "./staff-status";

export {
  getStaffReplyHistory
} from "./staff-history";

export {
  getStudentNotifications,
  markStudentNotificationRead
} from "./notifications";

export { getStudentReplyHistory } from "./student-replies";
