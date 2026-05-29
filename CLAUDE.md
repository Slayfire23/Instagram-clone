# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run lint      # Run ESLint
```

## Tech Stack

- **Next.js 16** (App Router) + **TypeScript** + **React 19**
- **Tailwind CSS v4** — configured via `@import "tailwindcss"` in `globals.css`, not `tailwind.config.js`
- **shadcn/ui** — component library
- **Clerk** — authentication (v7, using `@clerk/nextjs/legacy` hooks for custom flows)
- **Prisma + PostgreSQL** — database
- **Zod v4** — schema validation (`z.email()` syntax, not `z.string().email()`)
- **UploadThing** — media uploads
- **date-fns** — date parsing/formatting (used for birthday in sign-up)
- **React Hook Form** + **@hookform/resolvers/zod** — form state and validation

## Path Aliases

`@/*` maps to the project root (e.g., `@/app/...`, `@/lib/...`, `@/components/...`).

## Middleware

`proxy.ts` (root level) is the Next.js 16 middleware file — **not** `middleware.ts`. It uses Clerk to protect `/feed` and `/profile` routes.

## Architecture

This is an Instagram clone. Route structure:

- `/` — Landing page with sign-in form (split layout: branding left, SignInForm right)
- `/(auth)/sign-in/[[...sign-in]]` — Same landing page (Clerk catch-all)
- `/(auth)/sign-in/verify` — OAuth SSO callback page (`AuthenticateWithRedirectCallback`)
- `/(auth)/sign-up/[[...sign-up]]` — Sign-up page with custom form
- `/(main)/` — Route group for authenticated app pages (contains `LeftSidebar`)
- `/feed` — Main feed (stories placeholder, posts from followed users + self, right sidebar)
- `/profile/[username]` — User profile (posts grid, follow/unfollow, edit profile)
- `/reels`, `/messages`, `/explore` — **not yet built** (nav links exist in LeftSidebar)

The `(auth)` and `(main)` route groups are invisible in URLs.

Modals (Search, Notifications, Create Post, Post detail) are triggered from the sidebar or feed and rendered as overlays — not separate routes.

Every route directory must include `error.tsx` and `loading.tsx`.

## API Routes

- `/api/uploadthing` — UploadThing file upload endpoint (`core.ts` defines `imageUploader` for profile pics (64MB) and `mediaUploader` for posts accepting both images and videos (64MB / 256MB), requires auth)
- `/api/webhooks/clerk` — Clerk webhook handler (syncs `user.created` and `user.deleted` events to PostgreSQL via Prisma)

## Server Actions

- `server/actions/user.actions.ts` — `getUser()`, `createOrUpdateUser()`, `deleteUser()` — Prisma-based user CRUD. **Always use `getUser(clerkUser.id)` instead of inline `prisma.user.findUnique`.**
- `server/actions/profile.actions.ts` — `getProfile()` (current user), `getProfileByUsername()`, `updateUserProfile()` (with Zod validation via `editProfileSchema`)
- `server/actions/post.actions.ts` — `createPost()`, `getPostById()`, `deletePost()`, `getUserOwnPosts()`, `getUserPostsByUsername()`, `getFeedPosts(cursor?)` (cursor-based pagination, includes self + followed users), `getSuggestedUsers()`
- `server/actions/interaction.actions.ts` — `likePost()`, `unlikePost()`, `hasUserLikedPost()`, `getLikeCount()`, `addComment()` (supports `parentId` for replies), `deleteComment()`, `getComments(postId, cursor?)`, `getCommentReplies(commentId)`
- `server/actions/follow.actions.ts` — `getFollowStatus()`, `followUser()`, `unfollowUser()`, `cancelFollowRequest()`, `toggleFollow()`, `acceptFollowRequest()`, `rejectFollowRequest()`. Exports `FollowStatus` type: `"self" | "following" | "requested" | "none"`
- `server/actions/notification.actions.ts` — `createNotification()`, `deleteNotification()`, `markNotificationAsRead()`, `getNotifications()`, `markAllNotificationsAsRead()`, `getUnreadNotificationCount()`. Exports `FollowNotificationType` union type.
- `server/actions/search.actions.ts` — user search
- `server/actions/story.actions.ts` — `getFeedStoryGroups()` (one circle per followed user + self, 24h filter), `getStoriesByAuthor(authorId)` (all stories for viewer, oldest-first), `createStory(mediaUrl, mediaType)` (calls `revalidatePath("/feed")`), `markStoryViewed(storyId)` (upsert, calls `revalidatePath("/feed")`), `deleteStory(storyId)`, `getStoryViewers(storyId)` (owner only, excludes owner from count at DB level). Exports `StoryWithMeta` and `FeedStoryGroup` types.

## Database Schema

Prisma models (generated to `app/generated/prisma/`): `User`, `Post`, `Story`, `ViewedStory`, `Interaction`, `Notification`.

## Clerk Authentication

- Import custom flow hooks from `@clerk/nextjs/legacy`: `useSignIn`, `useSignUp`
- Import error utility from `@clerk/nextjs/errors`: `isClerkAPIResponseError`
- Use `catch (err)` without `: unknown` annotation so `isClerkAPIResponseError` type guard works
- OAuth strategy type: use inline literal `"oauth_google" | "oauth_facebook"` — do not import `OAuthStrategy` from `@clerk/types`
- Captcha: `<div id="clerk-captcha" />` must be present on any page that calls `signUp.create()` or handles OAuth redirects
- `AuthenticateWithRedirectCallback` imported from `@clerk/nextjs` (not legacy)

## Components Built

### `app/components/LandingPage.tsx`
Split layout — left half: Instagram logo + tagline + branding image; right half: `SignInForm`. Separated by a full-height `Separator` (vertical) and a full-width `Separator` (horizontal) at the bottom that intersects it.

### `app/components/Footer.tsx`
Footer with nav links and "© 2026 Instagram from Meta" copyright line.

### `app/(auth)/components/SignInForm.tsx`
Custom Clerk sign-in form. Fields: email + password. OAuth buttons: Google and Facebook (inline SVG logos). Second-factor (email code) verification step. Links: "Forgot password?" (ghost), "Create new account" (blue-bordered). Meta logo + "Meta" text footer. Captcha div included.

### `app/(auth)/components/SignUpForm.tsx`
Custom Clerk sign-up form. Fields: email, password, birthday (Month/Day/Year selects via `date-fns`), full name, username. Stores birthday in `unsafeMetadata`. Email verification step: shows Instagram logo, email sent to address, 6-digit code input. Captcha div included before submit.

### `app/(auth)/validations/SignIn.ts`
Zod schemas: `signInSchema` (email + password) and `verificationCodeSchema` (digits-only code).

### `app/(auth)/validations/SignUp.ts`
Zod schemas: `signUpSchema` (email, password, fullName, username, month, day, year) and `signUpVerificationSchema` (digits-only code).

### `app/(auth)/sign-in/verify/page.tsx`
OAuth SSO callback page. Shows Instagram logo (96px), "Authenticating..." message, captcha div, and `AuthenticateWithRedirectCallback` redirecting to `/feed`.

### `app/(main)/layout.tsx`
Layout for all authenticated pages. Fetches current user + unread notification count server-side, passes them as promises to `LeftSidebar`.

### `app/(main)/components/LeftSidebar.tsx`
Persistent collapsible sidebar for authenticated pages. Collapsed state: 72px wide, icon-only. Expanded state: full labels via shadcn Sheet overlay. Nav items: Home (`/feed`), Reels, Messages, Search, Explore, Notifications, Create Post, Profile. Includes user avatar, logout with AlertDialog confirmation, notification badge support, and active route highlighting. Wired to `NotificationsPanel`, `CreateMenu`, and `CreatePostModal`.

### `app/(main)/components/NotificationsPanel.tsx`
Sheet sliding from left. Shows notification list (LIKE, COMMENT, REPLY, FOLLOW, FOLLOW_REQUEST, FOLLOW_REQUEST_ACCEPTED, FOLLOW_REQUEST_REJECTED). Post thumbnails use `next/image` for images and `<video>` for videos. Clicking a post thumbnail fetches the post and opens `PostModal`. Accept/reject buttons for follow requests.

### `app/(main)/components/CreateMenu.tsx`
Dialog with Post (clickable, opens `CreatePostModal`) and AI (disabled) options.

### `app/(main)/components/CreatePostModal.tsx`
Two-step flow: UploadDropzone (using `mediaUploader` endpoint) → Preview + form (Post Type select, Caption with 80 char limit + counter, Submit/Discard). Auto-detects video files to set `mediaType`/`postType`. Frontend Zod validation before submit.

### `app/(main)/components/PostModal.tsx`
Full-screen dialog (`!max-w-4xl w-[95vw] h-[75vh]`). Shows post media on the left and comments/interactions on the right. Supports like (optimistic), add comment, reply, delete comment, delete post (own posts only), load more comments, load replies. Used in both the profile page and notifications panel.

### `app/(main)/components/ProfileHeader.tsx`
Displays user avatar, name, username, bio, post/follower/following counts. Shows `FollowButton` or Edit Profile button depending on ownership. Uses `FollowStatus` type.

### `app/(main)/components/ProfilePostCard.tsx`
Grid post card using shadcn `Card`. Shows media (image or video). On hover: dark overlay with like + comment counts. On click: fetches data and opens `PostModal`. Manages its own modal state internally.

### `app/(main)/components/FollowButton.tsx`
Client component with `useTransition`. Handles Follow/Following/Requested states with loading spinner. Supports `variant="compact"` (text-only, no background) for use in `RightSidebar` suggestions.

### `app/(main)/components/SearchModal.tsx`
User search modal.

### `app/(main)/validations/CreatePost.ts`
Shared Zod schema used by both frontend and backend:
```typescript
export const CAPTION_MAX = 80;
export const createPostSchema = z.object({
  mediaUrl: z.url(),
  mediaType: z.enum(["IMAGE", "VIDEO"]),
  type: z.enum(["IMAGE", "REEL"]),
  caption: z.string().max(CAPTION_MAX).optional(),
});
```

### `app/(main)/profile/page.tsx` and `app/(main)/profile/[username]/page.tsx`
Profile pages. Posts tab shows all posts (images + reels) using `ProfilePostCard` grid. `ProfileHeader` receives `id`, `followStatus`, and counts. Server components — no event handler props passed to client components.

### `app/(main)/feed/page.tsx`
Server component. Fetches initial feed posts, suggested users, and story groups in parallel. Renders `StoryCarousel`, `FeedContent`, and `RightSidebar`.

### `app/(main)/feed/components/FeedContent.tsx`
Client component. Renders `FeedPostCard` list with **infinite scroll** via `IntersectionObserver`. Sentinel div at bottom triggers next page fetch (`getFeedPosts(cursor)`). Shows spinner while loading, "You're all caught up!" when exhausted.

### `app/(main)/feed/components/FeedPostCard.tsx`
Full Instagram-style post card using shadcn `Card` (`rounded-lg border shadow-none mb-4`). Features: optimistic likes (`useOptimistic` + `useTransition`), inline comment section with nested replies (border-left indented), reply-to support, load more comments/replies (cursor-based). All interactive elements use shadcn `Button`. Video posts autoplay muted with mute toggle.

### `app/(main)/feed/components/RightSidebar.tsx`
Desktop-only (`hidden lg:block`). Shows current user info with "Switch" button, suggested users list (5 max, with `FollowButton variant="compact"`), and Instagram-style footer links.

### `app/(main)/feed/components/StoryCarousel.tsx`
Horizontal story circles using shadcn `Carousel` (Embla-based, `dragFree`). "Add story" button on the far left with a blue plus badge. Own story circle shown if active stories exist. Others' circles follow. Gradient ring = has unviewed stories; gray ring = all viewed. Clicking a circle opens `StoryViewer`; clicking the plus opens `CreateStoryModal`. Updates ring state locally via `onStoryGroupViewed` callback.

### `app/(main)/feed/components/StoryViewer.tsx`
Full-screen black overlay for viewing stories. One story at a time with: shadcn `Progress` bars across the top (one per story, fills in real time), auto-advance at end. Images use a 30s interval timer; videos track `currentTime / duration`. Left/right tap zones + arrow buttons for navigation (arrows hide at boundaries). Header shows avatar, username, timestamp, mute toggle (videos), eye icon + view count (owner only), delete button (owner only), close button. Viewers panel uses shadcn `Sheet` from the right side (landscape rectangle, `w-105 max-h-75`, vertically positioned at 55%). Delete uses `AlertDialog`. View tracking: `markStoryViewed` called on story ID change only (not full object) to prevent infinite loops. Progress intervals stored in refs and always cleaned up before starting new ones.

### `app/(main)/feed/components/CreateStoryModal.tsx`
Two-step flow inside shadcn `Dialog`: UploadDropzone (`mediaUploader` endpoint) → 9:16 aspect ratio preview (image or video with controls) + Share/Change/Cancel buttons. Auto-detects video by file extension. Calls `createStory` server action on submit.

### `lib/auth.ts`
`checkAuth()` utility — redirects already-authenticated users to `/feed`.

### `lib/prisma.ts`
Prisma client singleton for database access.

## Coding Rules

- Default to **server components**; use `"use client"` only when strictly necessary
- Avoid `useEffect` unless unavoidable — prefer derived state and event-driven logic
- Keep components small and focused; break logic into utilities
- Use shadcn/ui components (`Button`, `Input`, `Card`, `Separator`, etc.) — **never raw HTML elements with manual Tailwind when a shadcn equivalent exists**
- Always use `getUser(clerkUser.id)` helper — never inline `prisma.user.findUnique({ where: { clerkId } })`
- Server components must not pass event handler props to client components
- Screenshots in `/screenshots/` are the primary reference for UI/UX/layout fidelity

## Assets

Static assets (logos, branding image) are in `/public/assets/`:
- `/assets/logo.svg` — Instagram logo
- `/assets/meta-logo-3.png` — Meta logo
- `/assets/branding-image.png` — App preview branding image

## shadcn/ui Components Installed

`components/ui/`: `button`, `input`, `separator`, `avatar`, `badge`, `tooltip`, `sheet`, `alert-dialog`, `card`, `dialog`, `label`, `select`, `skeleton`, `switch`, `tabs`, `textarea`, `carousel`, `progress`