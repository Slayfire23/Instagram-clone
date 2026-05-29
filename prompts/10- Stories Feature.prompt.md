# Stories Feature:

Build an Instagram-style stories feature where users can share photos and videos that disappear after 24 hours.

---

## What the Feature Does

Users can create stories by uploading an image or video. These stories appear as circular avatars in a horizontal scrollable carousel at the top of the feed. Each circle represents one user who has active stories. Clicking a circle opens a full-screen viewer that plays through all of that user's stories in chronological order.

Stories expire automatically after 24 hours — they simply stop appearing. No cron job or cleanup is needed; the server filters them out by creation time.

---

## The Story Circle

Each circle shows the author's profile picture. If the current user hasn't seen any of that author's stories yet, the circle has the Instagram gradient ring (yellow to red to pink). Once all stories from that author are viewed, the ring turns gray. Below the circle is the author's username, or "Your story" if it belongs to the current user.

---

## The Feed Header Carousel

At the top of the feed, there's a horizontal carousel of story circles. On the far left (outside the carousel) is an "Add a story" button with a plus icon. Next comes the user's own story (if they have one), followed by stories from people they follow. The carousel supports drag scrolling and has left/right arrow buttons that automatically hide when there's nothing more to scroll in that direction.

---

## Creating a Story

Clicking the plus button opens a dialog with a two-step flow. First, the user sees a drag-and-drop upload area. After uploading, they see a preview of their media in a vertical 9:16 aspect ratio container. Videos get playback controls including a mute button and a volume slider. The user can then submit or cancel. On submit, the story is saved and the feed refreshes to show it.

---

## Viewing Stories

Clicking any story circle opens a full-screen viewer that slides up from the bottom. The viewer shows one story at a time with the following behavior:

**Progress bars** run across the top — one thin bar per story. Already-seen stories show a full bar, the current story fills up in real time, and upcoming stories are empty.

**Images** display for 30 seconds with a timer driving the progress bar. When time runs out, it advances to the next story.

**Videos** play at their natural duration. The progress bar follows the video's actual playback position. When the video ends, it advances to the next story.

**Navigation** works three ways: tap the left half of the screen to go back, tap the right half to go forward, or use the visible arrow buttons on the sides. You can also just let stories auto-advance.

Story Navigation Behavior:

The right arrow should advance to the next story belonging to the same user.

It must not navigate to stories from another user.

The left arrow should go to the previous story belonging to the same user.

If there is no previous story, the left arrow should be hidden.

If there is no next story, the right arrow should be hidden.

**When the last story finishes**, the viewer closes automatically.

---

## View Tracking

Every time a story appears on screen, the app records that the current user viewed it. This happens immediately when the story renders — not when the user manually clicks next or closes. This ensures that auto-played stories are tracked too.

The view is recorded using an upsert pattern: if the user already viewed this story, it just updates the timestamp. If not, it creates a new record. This prevents duplicate entries.

---

## View Count and Viewers List (Owner Only)

Story owners see an eye icon with a view count in the header. The count excludes the owner themselves — this is done at the database query level, not by subtracting 1 in code. This avoids off-by-one bugs regardless of whether the owner has viewed their own story.

Clicking the eye icon opens a side drawer listing everyone who viewed the story, showing their avatar, username, name, and how long ago they viewed it. Only the story owner can access this list.

---

## Deleting Stories (Owner Only)

Story owners also see a delete button. Clicking it shows a confirmation dialog. On confirmation, the story is removed from the local list and the viewer adjusts its position: if the deleted story was the only one, the viewer closes. If it was the first story, the viewer stays at position 0 (the next story slides into place). Otherwise, it moves back one position.

---

## Video Controls

When viewing a video story, there's a mute/unmute button in the header. Hovering over it reveals a vertical volume slider. Dragging volume to zero auto-mutes, and raising it above zero auto-unmutes.

---

## Data Architecture

The database has two tables for this feature: one for stories and one for tracking who viewed them. The stories table stores the media URL, media type (image or video), creation timestamp, and a reference to the author. The views table is a many-to-many join between users and stories with a timestamp, using a composite unique constraint on user and story to prevent duplicates.

All server functions authenticate the user first, then perform their work. They never throw errors — they return empty results or error objects instead.

When fetching stories for the feed, own stories come first, then one story per followed user (the most recent one), all filtered to the last 24 hours. When a circle is clicked, all stories from that specific author are fetched fresh at that moment (not cached ahead of time) to ensure the view state is always current.

The view count always excludes the story owner at the query level. Stories are ordered oldest-first when viewing (chronological playback) but the viewers list is ordered newest-first (most recent viewer on top).

---

## Key Patterns

- Async data is passed as promises to client components and unwrapped with React's `use()` hook inside Suspense boundaries — no `useEffect`-based fetching
- The "mark as viewed" side effect uses only the story ID as its dependency, not the full story object, to prevent infinite re-render loops when the viewed status flips
- The 24-hour expiration is enforced entirely on the server — no client-side date math
- Stories are fetched fresh per author on click, ensuring up-to-date state
- Progress intervals are stored in refs and always cleaned up before starting new ones
