---
name: fix-bug
description: Fix a bug following the mandatory full analysis protocol from CLAUDE.md. Use when a bug is reported or an error needs fixing.
argument-hint: [error-description or file-path]
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Edit, Bash(npm run build:*), Bash(npx tsc:*)
---

# Fix Bug - Full Analysis Protocol

Fix the following bug: **$ARGUMENTS**

## MANDATORY Steps (from CLAUDE.md - NEVER skip any):

### Step 1: Reproduce & Understand
- Read the file(s) where the error occurs
- Understand what the code is supposed to do
- Identify the exact line(s) causing the issue

### Step 2: Analyze Data Types
- Check all `interface` / `type` definitions involved
- If changing a type, find ALL places where it's used with Grep
- Verify type compatibility across the entire chain

### Step 3: Trace Dependencies
Use Grep to find ALL files that:
- Import the changed function/type/constant
- Call the changed function
- Use the changed type
- Reference the same data

### Step 4: Follow the Data Chain
If data flows through multiple functions (A → B → C → D):
- Read and verify EACH function in the chain
- Check transformations at each step
- Verify return types match expected inputs

### Step 5: Check Edge Cases
- What happens with `null` / `undefined`?
- What happens with empty arrays/objects?
- What happens with boundary values (0, -1, max)?
- Are fallback values correct?

### Step 6: Apply the Fix
- Make the MINIMUM change needed
- Don't refactor surrounding code
- Don't add unnecessary improvements
- Keep it simple and focused

### Step 7: Verify
Run `npm run build` and ensure:
- [ ] Zero TypeScript errors
- [ ] No new warnings
- [ ] All related files compile

### Step 8: Final Checklist
Before saying "done":
- [ ] Read ALL related files
- [ ] Traced data chain from start to end
- [ ] Types match everywhere
- [ ] `npm run build` passes
- [ ] No hardcoded values that should be dynamic
- [ ] Fallback values are correct

## Project-Specific Patterns to Check:
- **Cart store** (`src/stores/cart-store.ts`): Check persist middleware, localStorage sync
- **Checkout store** (`src/stores/checkout-store.ts`): Check step validation, shipping/payment state
- **API routes**: Verify Zod validation, server-side price verification, error response format
- **Supabase queries**: Check RLS policies, correct client (browser vs server)
- **Stripe**: Verify webhook signature, payment intent flow
- **Econt**: Check API response parsing, city/office data format
