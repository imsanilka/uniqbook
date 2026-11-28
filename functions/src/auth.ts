
import { getFirestore } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";

export interface StaffProfile {
  uid: string;
  role: "staff";
  teamId: string;
}

export async function requireStaff(
  uid: string | undefined
): Promise<StaffProfile> {
  if (!uid) {
    throw new HttpsError(
      "unauthenticated",
      "Please sign in first."
    );
  }

  const db = getFirestore();

  const profile = await db
    .collection("profiles")
    .doc(uid)
    .get();

  if (!profile.exists) {
    throw new HttpsError(
      "permission-denied",
      "Staff profile not found."
    );
  }

  const data = profile.data();

  if (data?.role !== "staff") {
    throw new HttpsError(
      "permission-denied",
      "Staff access required."
    );
  }

  const teamId = data.teamId;

  if (
    typeof teamId !== "string" ||
    !teamId.trim() ||
    teamId.includes("/")
  ) {
    throw new HttpsError(
      "permission-denied",
      "No valid team assigned."
    );
  }

  const team = await db
    .collection("teams")
    .doc(teamId)
    .get();

  if (!team.exists || team.data()?.active !== true) {
    throw new HttpsError(
      "permission-denied",
      "Assigned team is not active."
    );
  }

  return {
    uid,
    role: "staff",
    teamId
  };
}
