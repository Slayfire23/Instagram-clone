## Feed Page

Create the **feed page** inside `(main)/feed`. This will act as the **main home page of the app**, similar to Instagram. It is where users land and see content from people they follow.

Start by creating the **loading** and **error** files.

The feed page should now look like this (desktop layout):

| Left Sidebar | Feed (center) | Right Sidebar |

---

## 🧠 What the Feed Page Should Do

When a user opens the feed:

They should see **posts only from people they follow**

At the top, we’ll have a **Stories section**

Below that, we’ll render posts using a **FeedPostCard**

Posts should load using **infinite scroll**

Each post should support:

❤️ Likes  
💬 Comments  
↩️ Replies to comments  
🔁 Replies to replies  

And it should **feel and look like Instagram**

If you need visual reference, you can look at Instagram’s layout to guide your **spacing, comment nesting, and interaction flow**.

also look at the feed screenshot.

---

## 📍 Route Setup

Create the feed route:

/feed

This page will:

Fetch posts from **followed users**

Render **Stories section** (placeholder for now)

Render the **post feed with infinite scrolling**

---

## 🟣 Stories (For Now)

We are **NOT implementing stories yet**.

Just create a clean placeholder component at the top like:

`<StoriesPlaceholder />`

It can just be a **horizontal scroll container with dummy circles** saying:

**“Stories Coming Soon”**

Later we’ll replace this with **real stories logic**.

---

## 📰 Feed Posts (Main Focus)

Now the important part.

We’ll display posts using a **FeedPostCard** component.

Each card should include:

User avatar + username  
Post image/content  
Like button  
Comment button  
Share icon (optional for now)  
Caption  
Comments preview  
Add comment input  

---

## ♾ Infinite Scrolling

We don’t want pagination buttons.

Instead:

Load first batch of posts (e.g. 5 or 10)

When user scrolls near bottom → fetch next batch

Append to existing posts

Show loading spinner while fetching

This should feel **smooth and seamless**.

---

## ❤️ Likes System

Inside **FeedPostCard**:

User can **like/unlike a post**

Like count updates instantly (**optimistic UI**)

If someone likes your post → **create a notification**

---

## 💬 Comments System

Now this is important.

We want it structured like **Instagram**.

### Level 1 → Comments
A user comments on a post.

### Level 2 → Replies to comments
A user replies to a comment.

### Level 3 → Replies to replies
Just like **Instagram threading**.

Each reply should:

Be slightly indented

Show username

Show **Reply** button

Support **nested rendering cleanly**

Make sure:

Comment count updates properly

Reply toggling works

Replies can collapse/expand if needed

---

## 🔔 Notifications (Very Important)

Now let’s make the feed **interactive**.

We need notifications for:

Someone liked your post

Someone commented on your post

Someone replied to your comment

Someone replied to your reply

Each of these should:

Create a **notification entry in DB**

Appear in **user notifications panel**

Be **markable as read**

This makes the page **feel alive**.

---

## 🎨 UI Goal

We want it to:

Look clean

White background

Proper spacing

Instagram-style buttons

Rounded avatars

Subtle gray text for timestamps

Smooth hover effects

Don’t overdesign it.

Keep it **minimal and modern**.

---

## 📍 RightSidebar Component

Create:

`components/RightSidebar.tsx`

This should only appear on desktop screens:

`lg:block hidden`

---

## 🟣 What the RightSidebar Should Contain

We want it to feel **exactly like Instagram**.

### 1️⃣ Logged-in User Info (Top Section)

At the top:

User avatar

Username

Full name (lighter text)

Optional **“Switch”** text on the right (like Instagram)

Keep it **clean and horizontally aligned**.

---

### 2️⃣ Suggested Users Section

Below that:

Title row:

`Suggested for you          See All`

Then render a list of **suggested accounts**.

Each suggestion item:

Avatar

Username

Small description (e.g. “Follows you” or “New to Instagram”)

Follow button (**compact variant**)

Use your existing **FollowButton** with:

`variant="compact"`

Limit to **5 suggestions**.

---

### 3️⃣ Footer Section (Optional but Recommended)

At the bottom:

Small muted links:

`About · Help · Press · API · Privacy · Terms`

Small copyright text

Very subtle styling  
Very small font  
Gray color  

---

## 🧠 How Suggestions Should Work

Suggested users can be:

People **not followed by current user**

Exclude **self**

Exclude **already requested users**

Maybe sort by **newest or random**

Keep it **simple for now**.

---

## 🔥 Summary

On the Feed page we are implementing:

Stories placeholder at the top

Posts from **followed users only**

**Infinite scroll**

**Like system**

**Full comment + nested reply system**

**Notifications on interactions**

**Instagram-style UI**

**RightSidebar**

We’re basically building the **heart of the app** right now.

Take it step by step.

Start with **fetching followed users’ posts**

Then **infinite scroll**

Then **interactions**

Then **notifications**

Let’s build it properly 👌