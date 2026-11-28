
import { getFirestore } from "firebase-admin/firestore";

import {
  onCall,
  HttpsError
} from "firebase-functions/v2/https";

import { requireStaff } from "./auth";

export const getStaffReplyHistory = onCall(async (call) => {
  const staff = await requireStaff(call.auth?.uid);

  const requestId = call.data?.requestId;

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

  const db = getFirestore();

  const requestRef = db
    .collection("requests")
    .doc(requestId);

  const profileRef = db
    .collection("profiles")
    .doc(staff.uid);

  const teamRef = db
    .collection("teams")
    .doc(staff.teamId);

  return db.runTransaction(async (transaction) => {
    const profile = await transaction.get(profileRef);
    const team = await transaction.get(teamRef);
    const request = await transaction.get(requestRef);

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

    const query = requestRef
      .collection("replies")
      .orderBy("createdAt", "desc")
      .limit(100);

    const snapshot = await transaction.get(query);

    const replies = snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        requestId,
        authorLabel: "Staff",
        message:
          typeof data.body === "string"
            ? data.body
            : "",
        createdAt:
          data.createdAt?.toMillis?.() ?? null
      };
    });

    return { replies };
  });
});
