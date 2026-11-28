 
import {
  getFirestore,
  FieldValue
} from "firebase-admin/firestore";

import {
  onCall,
  HttpsError
} from "firebase-functions/v2/https";

import { createHash } from "node:crypto";
import { requireStaff } from "./auth";
import { queueStatusEmail } from "./email-outbox";

const allowedTransitions: Record<string, string[]> = {
  "Submitted": [],
  "Assigned": ["In Progress"],
  "In Progress": ["Resolved"],
  "Resolved": []
};

export const updateStaffRequestStatus = onCall(async (call) => {
  const staff = await requireStaff(call.auth?.uid);

  const requestId = call.data?.requestId;
  const newStatus = call.data?.status;
  const eventId = call.data?.eventId;

  if (
    typeof requestId !== "string" ||
    !requestId.trim() ||
    requestId.includes("/") ||
    requestId === "." ||
    requestId === ".."
  ) {
    throw new HttpsError(
      "invalid-argument",
      "Invalid request ID."
    );
  }

  if (
    typeof newStatus !== "string" ||
    !["In Progress", "Resolved"].includes(newStatus)
  ) {
    throw new HttpsError(
      "invalid-argument",
      "Invalid status."
    );
  }

  if (
    typeof eventId !== "string" ||
    !/^[a-zA-Z0-9_-]{16,100}$/.test(eventId)
  ) {
    throw new HttpsError(
      "invalid-argument",
      "Invalid event ID."
    );
  }

  const db = getFirestore();

  const requestRef = db
    .collection("requests")
    .doc(requestId);

  const ownerRef = db
    .collection("requestOwners")
    .doc(requestId);

  const profileRef = db
    .collection("profiles")
    .doc(staff.uid);

  const teamRef = db
    .collection("teams")
    .doc(staff.teamId);

  const eventRef = requestRef
    .collection("statusEvents")
    .doc(eventId);

  await db.runTransaction(async (transaction) => {
    const profile = await transaction.get(profileRef);
    const team = await transaction.get(teamRef);
    const request = await transaction.get(requestRef);
    const owner = await transaction.get(ownerRef);
    const existingEvent = await transaction.get(eventRef);

    if (
      profile.data()?.role !== "staff" ||
      profile.data()?.teamId !== staff.teamId ||
      team.data()?.active !== true
    ) {
      throw new HttpsError(
        "permission-denied",
        "Staff access denied."
      );
    }

    const data = request.data();

    if (
      !request.exists ||
      !data ||
      data.assignedTeamId !== staff.teamId
    ) {
      throw new HttpsError(
        "permission-denied",
        "Request access denied."
      );
    }

    if (existingEvent.exists) {
      if (
        existingEvent.data()?.staffId !== staff.uid ||
        existingEvent.data()?.newStatus !== newStatus
      ) {
        throw new HttpsError(
          "already-exists",
          "Event ID already used."
        );
      }

      return;
    }

    const currentStatus = data.status;

    if (
      typeof currentStatus !== "string" ||
      !Object.hasOwn(allowedTransitions, currentStatus) ||
      !allowedTransitions[currentStatus].includes(newStatus)
    ) {
      throw new HttpsError(
        "failed-precondition",
        "Status transition is not allowed."
      );
    }

    const ownerUid = owner.data()?.ownerUid;

    if (
      typeof ownerUid !== "string" ||
      !ownerUid.trim() ||
      ownerUid.includes("/") ||
      ownerUid === "." ||
      ownerUid === ".."
    ) {
      throw new HttpsError(
        "failed-precondition",
        "Request owner is unavailable."
      );
    }

    const notificationId = createHash("sha256")
      .update(JSON.stringify([
        "status",
        requestId,
        eventId
      ]))
      .digest("hex");

    const notificationRef = db
      .collection("users")
      .doc(ownerUid)
      .collection("notifications")
      .doc(notificationId);

    transaction.update(requestRef, {
      status: newStatus,
      updatedAt: FieldValue.serverTimestamp()
    });

    transaction.create(eventRef, {
      staffId: staff.uid,
      previousStatus: currentStatus,
      newStatus,
      createdAt: FieldValue.serverTimestamp()
    });

    transaction.create(notificationRef, {
      requestId,
      title: "Request Status Updated",
      message: `Your request status has changed to ${newStatus}.`,
      type: "status",
      createdAt: FieldValue.serverTimestamp(),
      readAt: null
    });

    queueStatusEmail(transaction, {
      requestId,
      ownerUid,
      eventId,
      status: newStatus
    });
  });

  return {
    success: true,
    status: newStatus,
    eventId
  };
});

