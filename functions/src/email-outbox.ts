
import {
  getFirestore,
  FieldValue,
  type Transaction
} from "firebase-admin/firestore";

import { createHash } from "node:crypto";

interface StatusEmailEvent {
  requestId: string;
  ownerUid: string;
  eventId: string;
  status: string;
}

export function queueStatusEmail(
  transaction: Transaction,
  event: StatusEmailEvent
): void {
  const db = getFirestore();

  const outboxId = createHash("sha256")
    .update(JSON.stringify([
      "status",
      event.requestId,
      event.eventId
    ]))
    .digest("hex");

  const outboxRef = db
    .collection("mailOutbox")
    .doc(outboxId);

  transaction.create(outboxRef, {
    requestId: event.requestId,
    recipientUid: event.ownerUid,
    eventId: event.eventId,
    type: "status-update",
    requestStatus: event.status,
    deliveryState: "pending",
    attempts: 0,
    createdAt: FieldValue.serverTimestamp(),
    sentAt: null,
    lastError: null
  });
}
