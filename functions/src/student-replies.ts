import { getFirestore } from "firebase-admin/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";

export const getStudentReplyHistory = onCall(async (call) => {
  const uid = call.auth?.uid;

  if (!uid) {
    throw new HttpsError(
      "unauthenticated",
      "Please sign in first."
    );
  }

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

  const ownerRef = db
    .collection("requestOwners")
    .doc(requestId);

  return db.runTransaction(async (transaction) => {
    const request = await transaction.get(requestRef);
    const owner = await transaction.get(ownerRef);

    if (
      !request.exists ||
      !owner.exists ||
      owner.data()?.ownerUid !== uid
    ) {
      throw new HttpsError(
        "permission-denied",
        "Request access denied."
      );
    }

    const snapshot = await transaction.get(
      requestRef
        .collection("replies")
        .orderBy("createdAt", "desc")
        .limit(100)
    );

    return {
      replies: snapshot.docs.map((document) => {
        const data = document.data();

        return {
          id: document.id,
          requestId,
          authorLabel: "Staff",
          message:
            typeof data.body === "string"
              ? data.body
              : "",
          createdAt:
            data.createdAt?.toMillis?.() ?? null
        };
      })
    };
  });
});
