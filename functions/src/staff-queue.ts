 import {
  getFirestore,
  type DocumentData,
} from "firebase-admin/firestore";

import {
  onCall,
  HttpsError,
} from "firebase-functions/v2/https";

import { requireStaff } from "./auth";

function safeText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function safeRequest(
  id: string,
  data: DocumentData,
  teamId: string
) {
  return {
    id,
    title: safeText(data.title),
    description: safeText(data.description),
    category: safeText(data.category),
    status: safeText(data.status),
    assignedTeamId: teamId,
    anonymous: data.anonymous !== false
  };
}

export const getStaffQueue = onCall(async (call) => {
  const staff = await requireStaff(call.auth?.uid);
  const db = getFirestore();

  return db.runTransaction(async (transaction) => {
    const profile = await transaction.get(
      db.collection("profiles").doc(staff.uid)
    );

    const team = await transaction.get(
      db.collection("teams").doc(staff.teamId)
    );

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

    const snapshot = await transaction.get(
      db.collection("requests")
        .where("assignedTeamId", "==", staff.teamId)
        .limit(100)
    );

    const requests = [];

    for (const document of snapshot.docs) {
      const owner = await transaction.get(
        db.collection("requestOwners").doc(document.id)
      );

      if (
        !owner.exists ||
        typeof owner.data()?.ownerUid !== "string" ||
        !owner.data()?.ownerUid.trim()
      ) {
        continue;
      }

      requests.push(
        safeRequest(
          document.id,
          document.data(),
          staff.teamId
        )
      );
    }

    return { requests };
  });
});

export const getStaffRequest = onCall(async (call) => {
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

  return db.runTransaction(async (transaction) => {
    const profile = await transaction.get(
      db.collection("profiles").doc(staff.uid)
    );

    const team = await transaction.get(
      db.collection("teams").doc(staff.teamId)
    );

    const request = await transaction.get(
      db.collection("requests").doc(requestId)
    );

    const owner = await transaction.get(
      db.collection("requestOwners").doc(requestId)
    );

    const data = request.data();

    if (
      profile.data()?.role !== "staff" ||
      profile.data()?.teamId !== staff.teamId ||
      team.data()?.active !== true ||
      !request.exists ||
      !data ||
      data.assignedTeamId !== staff.teamId ||
      !owner.exists ||
      typeof owner.data()?.ownerUid !== "string" ||
      !owner.data()?.ownerUid.trim()
    ) {
      throw new HttpsError(
        "permission-denied",
        "Request access denied."
      );
    }

    return safeRequest(
      request.id,
      data,
      staff.teamId
    );
  });
});

