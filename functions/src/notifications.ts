
import {
  getFirestore,
  FieldValue
} from "firebase-admin/firestore";

import {
  onCall,
  HttpsError
} from "firebase-functions/v2/https";

export const getStudentNotifications = onCall(async (call) => {
  const uid = call.auth?.uid;

  if (!uid) {
    throw new HttpsError(
      "unauthenticated",
      "Please sign in first."
    );
  }

  const db = getFirestore();

  const snapshot = await db
    .collection("users")
    .doc(uid)
    .collection("notifications")
    .orderBy("createdAt", "desc")
    .limit(100)
    .get();

  const notifications = snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      requestId: data.requestId,
      title: data.title ?? "",
      message: data.message ?? "",
      type: data.type ?? "",
      read: data.readAt != null,
      createdAt:
        data.createdAt?.toMillis?.() ?? null
    };
  });

  return { notifications };
});

export const markStudentNotificationRead = onCall(async (call) => {
  const uid = call.auth?.uid;

  if (!uid) {
    throw new HttpsError(
      "unauthenticated",
      "Please sign in first."
    );
  }

  const notificationId = call.data?.notificationId;

  if (
    typeof notificationId !== "string" ||
    !notificationId.trim() ||
    notificationId.includes("/") ||
    notificationId === "." ||
    notificationId === ".."
  ) {
    throw new HttpsError(
      "invalid-argument",
      "Invalid notification ID."
    );
  }

  const db = getFirestore();

  const notificationRef = db
    .collection("users")
    .doc(uid)
    .collection("notifications")
    .doc(notificationId);

  await db.runTransaction(async (transaction) => {
    const notification = await transaction.get(
      notificationRef
    );

    if (!notification.exists) {
      throw new HttpsError(
        "not-found",
        "Notification not found."
      );
    }

    if (notification.data()?.readAt != null) {
      return;
    }

    transaction.update(notificationRef, {
      readAt: FieldValue.serverTimestamp()
    });
  });

  return { success: true };
});
