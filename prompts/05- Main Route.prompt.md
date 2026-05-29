# Main Application Implementation Guide

## Global Instruction

Implement all specified features and ensure that any required supporting functionality—such as server actions, utility functions, schemas, database queries, and integrations—is properly implemented to support them.

⚠️ For every route you create, always include corresponding `loading.tsx` and `error.tsx` files to ensure consistent UX and error handling across the application.

---

# Main Route

## Route Structure

Create a route group named `(main)`.

Inside this route group:

- Add `loading.tsx` and `error.tsx` files consistent with the app’s existing design patterns.
- Create a `layout.tsx` file that serves as the shared layout for all routes inside `(main)`.

## Profile Route

Inside `(main)`, create a `profile` route.

Within the `profile` route:

- Add `loading.tsx`
- Add `error.tsx`

### Profile Loading UI

The `profile/loading.tsx` file should:

- Implement a loading skeleton closely resembling the Instagram profile layout.
- Use the `Skeleton` component from shadcn/ui.
- Render the Instagram icon to provide a familiar loading experience.

---

# User Profile Page

Create the main `profile/page.tsx` file.

## Features

### 1. Data Fetching

Use server actions:

- `getProfile()`
- `getUserOwnPosts()`
- `getUnreadNotificationCount()`

---

### 2. Sidebar Integration

Include `LeftSidebar`:

- Pass `profilePromise`
- Pass `notificationCountPromise`

---

### 3. Profile Header

Render `ProfileHeader` with:

- User info (name, username, bio, image, stats)
- `isOwnProfile = true`
- Story Highlights section
- “New” story button

---

### 4. Tabbed Interface (shadcn Tabs)

Tabs:

- Posts (LayoutGrid)
- Reels (Video)
- Saved (Bookmark)
- Tagged (CircleUser)

Active tab uses line variant styling.

---

### 5. Dynamic Rendering

Posts tab:

- If posts exist → render grid of `ProfilePostCard`
- Else → show empty state CTA

Reels tab:

- Filter posts: `post.type === "REEL"`
- Grid or empty state

Saved & Tagged:

- Placeholder UI

---

### 6. Layout & Responsiveness

- `grid-cols-3` for posts
- Centered empty states
- Tailwind spacing and hover effects

---

### 7. Interactions

CTAs:

- Share first photo
- Share first reel
- Add new story highlight

---

# Other Users Profile Page

Implements public profile viewing.

## Data Fetching

- `getProfile()`
- `getProfileByUsername(username)`
- `getUserPostsByUsername(username)`
- `getFollowStatus(profileUser.id)`
- `getUnreadNotificationCount()`

Use `Promise.all` where possible.

---

## Redirect Logic

- If username matches current user → redirect to `/profile`
- If profile not found → `notFound()`

---

## Private Account Handling

If private and not following:

- Show lock icon
- Hide tabbed content
- Display follow-required message

---

## Tabs

- Posts (LayoutGrid)
- Reels (Video)

`isOwnPost = false`

---

# ProfileHeader Component

Create inside `(main)/components`.

## Features

- Profile image (fallback to `/assets/logo-black.svg`)
- Responsive sizes
- Username `<h1>`
- Stats (Posts, Followers, Following)
- Bio, Name, Website
- Conditional buttons:

Own profile:
- Edit Profile
- View Archive

Other profile:
- Follow / Unfollow
- Message

Fully responsive layout.

---

# ProfilePostCard Component

Supports image and video posts.

## Features

- Image: `next/image`
- Video: `<video>`
- Mute/Unmute
- Vertical volume slider
- Hover overlay (likes + comments)
- Opens `PostModal`
- Handles `isOwnPost`

---

# PostModal Component

Full-featured modal with:

- Image/video display
- Volume & mute controls
- Author info
- Like/Unlike (optimistic updates)
- Comments with recursive replies
- Pagination for comments
- Inline reply forms
- Delete confirmation (AlertDialog)
- Responsive layout (media left, details right)

---

# Edit Profile Feature

Create inside `profile/edit`.

## Page Features

- Fetch `getProfile()`
- Fetch `getUnreadNotificationCount()`
- Prepare initial form data
- Include `LeftSidebar`
- Render `EditProfileForm`
- `export const dynamic = "force-dynamic"`

### Animation

Create `animate-fade-in` in `globals.css`.

Apply to all pages from now on.

---

# EditProfileForm Component

Create `components` folder inside `edit`.

## Features

- React Hook Form
- Zod validation schema (required)
- Fields:
  - Username
  - Website
  - Bio (500 char limit)
  - Gender
  - Private toggle
- UploadThing profile image upload
- Live preview
- Server action: `updateUserProfile`
- Loading state
- Redirect to `/profile` on success
- Cancel button

⚠️ Do not forget to create the Zod schema.

---

# LeftSidebar Component

Create inside `(main)/components`.

Replicate the Instagram-style sidebar from screenshots.

## Structure

- Collapsed icon-only sidebar
- Expands on hover
- Top section:
  - Feed
  - Create
  - Search
  - Notifications
  - Profile
- Bottom section:
  - Extra links
  - Logout

---

## Functionality

- Render links dynamically
- Active route styling
- Use React `use()` hook for:
  - Profile
  - Notifications

---

### Special Behaviors

- Create → `CreateMenu`
- Search → `SearchModal`
- Notifications → `NotificationsBar` + badge
- Profile → show avatar (fallback if missing)

Badge logic:

- If count > 9 → show `9+`

---

## Logout

- Confirmation dialog (AlertDialog)
- Use `Clerk.signOut()`

---

## Interactive UX

- Expands on hover (`isExpanded`)
- Uses `Sheet` for expanded mode
- Handles `onMouseEnter`, `onMouseLeave`, `onPointerDownOutside`
- Accessible with `VisuallyHidden`

---

## Styling

- TailwindCSS
- Rounded, shadowed components
- Responsive
- Notification badge adapts collapsed vs expanded

---

# Final Summary

This implementation includes:

- Dynamic profile system (own & public)
- Follow system with private account handling
- Fully interactive Instagram-style sidebar
- Infinite-scroll-ready structure
- Post modal with nested comments & replies
- Edit profile system with validation & upload
- Reusable components
- Server actions integration
- Zod validation schemas
- Optimistic UI updates
- Loading & error boundaries on every route
- Consistent animation across the entire app
- Responsive, modern social media UI