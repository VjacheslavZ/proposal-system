import { unstable_rethrow } from "next/navigation";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ErrorCode = "VALIDATION_ERROR" | "INVALID_JSON" | "NOT_FOUND" | "INVALID_STATUS_TRANSITION" | "INTERNAL_ERROR";

/** An expected error that maps to an HTTP response. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
  }
}

export const notFound = (message: string) => new ApiError(404, "NOT_FOUND", message);

function errorResponse(status: number, code: ErrorCode, message: string, details?: unknown) {
  return NextResponse.json({ error: { code, message, details } }, { status });
}

/** Wraps a route handler so every failure returns the same JSON error shape. */
export function withErrorHandling<Args extends unknown[]>(handler: (...args: Args) => Promise<Response>) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      // Let Next.js handle its own control-flow errors (e.g. `connection()` during prerendering).
      unstable_rethrow(error);
      if (error instanceof ApiError) {
        return errorResponse(error.status, error.code, error.message);
      }
      if (error instanceof ZodError) {
        const details = error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }));
        return errorResponse(400, "VALIDATION_ERROR", "Request body is invalid", details);
      }
      console.error(error);
      return errorResponse(500, "INTERNAL_ERROR", "Something went wrong");
    }
  };
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ApiError(400, "INVALID_JSON", "Request body must be valid JSON");
  }
}
