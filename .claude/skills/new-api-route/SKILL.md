---
name: new-api-route
description: Create a new API route following the project's established patterns - Zod validation, error handling, Supabase integration
argument-hint: [route-path] [method] [description]
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Edit, Write, Bash(npm run build:*)
---

# Create New API Route

Create a new API route: **$ARGUMENTS**

## Before Creating:

1. **Read existing routes** to match the exact patterns:
   - `src/app/api/payment/route.ts` (public route with Stripe)
   - `src/app/api/admin/orders/route.ts` (admin protected route)
   - `src/app/api/econt/cities/route.ts` (external API integration)

2. **Determine the route type:**
   - Public API → `src/app/api/<name>/route.ts`
   - Admin API → `src/app/api/admin/<name>/route.ts` (auto-protected by middleware)
   - Webhook → `src/app/api/webhooks/<name>/route.ts`

## Route Template (follow exactly):

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { z } from "zod";

// 1. Define Zod schema for input validation
const requestSchema = z.object({
  // Define fields...
});

export async function POST(request: NextRequest) {
  try {
    // 2. Parse body
    const body = await request.json();

    // 3. Validate with Zod
    const validated = requestSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // 4. Create Supabase server client
    const supabase = createServerClient();

    // 5. Business logic here...

    // 6. Return success
    return NextResponse.json({ success: true, data: result });

  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
```

## Checklist:
- [ ] Input validated with Zod
- [ ] Uses server Supabase client (NOT browser client)
- [ ] Prices verified server-side (never trust client data)
- [ ] Search inputs sanitized (remove `%`, `_`, special chars)
- [ ] Error responses follow format: `{ error: string, code?: string }`
- [ ] Success responses follow format: `{ success: true, data: ... }`
- [ ] Pagination uses `limit` (max 100) and `offset` params
- [ ] Admin routes are inside `src/app/api/admin/` (middleware protects them)
- [ ] `npm run build` passes after creation
