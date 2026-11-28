
import {
  getFirestore,
  FieldValue
} from "firebase-admin/firestore";

import {
  onCall,
  HttpsError
} from "firebase-functions/v2/https";

import { requireStaff } from "./auth";

export const sendStaffReply = onCall(async (call) => {
  const staff = await requireStaff(call.auth?.uid);

  const requestId = call.data?.requestId;
  const message = call.data?.message;
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
    typeof message !== "string" ||
    !message.trim() ||
    message.trim().length > 1000
  ) {
    throw new HttpsError(
      "invalid-argument",
      "Reply must contain 1 to 1000 characters."
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

  const replyRef = requestRef
    .collection("replies")
    .doc(eventId);

  const profileRef = db
    .collection("profiles")
    .doc(staff.uid);

  const teamRef = db
    .collection("teams")
    .doc(staff.teamId);

  await db.runTransaction(async (transaction) => {
    const profile = await transaction.get(profileRef);
    const team = await transaction.get(teamRef);
    const request = await transaction.get(requestRef);
    const owner = await transaction.get(ownerRef);
    const existingReply = await transaction.get(replyRef);

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

    if (
      !request.exists ||
      request.data()?.assignedTeamId !== staff.teamId
    ) {
      throw new HttpsError(
        "permission-denied",
        "Request access denied."
      );
    }

    if (existingReply.exists) {
      if (
        existingReply.data()?.staffId !== staff.uid ||
        existingReply.data()?.body !== message.trim()
      ) {
        throw new HttpsError(
          "already-exists",
          "Event ID already used."
        );
      }

      return;
    }

    const ownerUid = owner.data()?.ownerUid;

    if (
      typeof ownerUid !== "string" ||
      !ownerUid.trim() ||
      ownerUid.includes("/")
    ) {
      throw new HttpsError(
        "failed-precondition",
        "Request owner is unavailable."
      );
    }

    const notificationRef = db
      .collection("users")
      .doc(ownerUid)
      .collection("notifications")
      .doc(`reply-${requestId}-${eventId}`);

    transaction.create(replyRef, {
      staffId: staff.uid,
      authorLabel: "Staff",
      body: message.trim(),
      createdAt: FieldValue.serverTimestamp()
    });

    transaction.create(notificationRef, {
      requestId,
      title: "New Staff Reply",
      message: "A staff member replied to your request.",
      type: "reply",
      createdAt: FieldValue.serverTimestamp(),
      readAt: null
    });

    transaction.update(requestRef, {
      updatedAt: FieldValue.serverTimestamp()
    });
  });

  return {
    success: true,
    replyId: eventId
  };
});
