import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth";

// Toàn bộ endpoint của Better Auth (/api/auth/sign-in, /sign-out, /get-session…).
export const { GET, POST } = toNextJsHandler(auth);
