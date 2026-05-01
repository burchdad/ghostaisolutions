import { NextResponse } from "next/server";
import { getDeletionRequestStatus } from "@/lib/metaDataDeletion";

export async function GET(_request, { params }) {
  const status = getDeletionRequestStatus(params?.confirmationCode);

  if (!status) {
    return NextResponse.json(
      {
        status: "not_found",
        message: "Deletion request not found",
      },
      { status: 404 }
    );
  }

  return NextResponse.json(
    {
      confirmation_code: status.confirmationCode,
      status: status.status,
      created_at: status.createdAt,
      completed_at: status.completedAt,
      message: "If you are the requesting user, your deletion request has been processed.",
    },
    { status: 200 }
  );
}