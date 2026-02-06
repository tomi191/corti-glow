import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

async function isValidSession(token: string): Promise<boolean> {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data, error } = await supabase
            .from("admin_sessions")
            .select("token")
            .eq("token", token)
            .gt("expires_at", new Date().toISOString())
            .single();

        if (error) {
            console.error("Session validation error:", error.message);
            return false;
        }

        return !!data;
    } catch (err) {
        console.error("Session validation failed:", err);
        return false;
    }
}

export default async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Protect Admin Routes
    if (path.startsWith("/admin") || path.startsWith("/api/admin")) {
        const authCookie = request.cookies.get("admin_session")?.value;

        // Allow public admin paths
        if (path === "/admin/login" || path === "/api/admin/auth") {
            return NextResponse.next();
        }

        // Validate session token against DB
        if (!authCookie || !(await isValidSession(authCookie))) {
            // API requests: Return 401 JSON
            if (path.startsWith("/api/")) {
                return NextResponse.json(
                    { error: "Unauthorized access" },
                    { status: 401 }
                );
            }

            // Page requests: Redirect to login
            const url = request.nextUrl.clone();
            url.pathname = "/admin/login";
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Only match admin routes
        "/admin/:path*",
        "/api/admin/:path*",
    ]
};
