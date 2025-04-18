import NextAuth from "next-auth";
import { authOptions } from "./options";

// Specify Node.js runtime for this API route
export const runtime = "nodejs";

// Export the handler functions
export const GET = NextAuth(authOptions);
export const POST = NextAuth(authOptions);
