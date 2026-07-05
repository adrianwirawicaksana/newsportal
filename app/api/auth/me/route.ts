import { NextRequest } from "next/server";
import {
  getAuthenticatedUser,
  getErrorResponse,
  getSuccessResponse,
} from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return getErrorResponse("Unauthenticated", 401);
  }

  return getSuccessResponse({ user });
}
