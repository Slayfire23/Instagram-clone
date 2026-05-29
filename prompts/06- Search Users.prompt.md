Create the Search Users feature.
When a user clicks the Search icon or link in the LeftSidebar, a search modal should open.
Inside that modal:
Implement debouncing, so we’re not hitting the database on every single keystroke.


As the user types a name, query the database with that search term.


Return matching users and display the results in an Instagram-style layout.


How the results should look:
Each result should be displayed in a clean row-style box:
User profile photo on the left


Next to it:


Username (top line)


Full name (below the username)


Followers count (below the full name)


All results should be stacked vertically (one below the other).
Behavior:
Each result item should have a pointer cursor.


When a user clicks on one of the results, route them to that user’s profile page.


Make the whole item clickable for better UX.


Backend:
Create the necessary server actions inside a separate file called:
server/actions/search.actions.ts
This file should handle searching the database based on the query and returning matching users.
Keep it clean, efficient, and optimized for performance.

Constraints:
Use shadcn dialogu for the modal and always use shadcn components as possible.

More in depth explanations:

🔍 Feature: Search Users Modal
What This Feature Does
This adds a search modal to your app where users can:
Click the search button


Type a name or username


See matching users in real time


Click a result


Get routed to that user’s profile


It feels very similar to Instagram’s search experience.

🧩 How It’s Implemented (Step by Step)
1️⃣ It’s a Client Component
Since this feature:
Uses state


Reacts to user typing


Uses navigation


Shows loading states


It’s built as a client component.
That allows us to use hooks like state, effects, and router navigation.

2️⃣ Modal-Based UI
When the user clicks the search icon:
A dialog/modal opens


It contains:


A search input


A clear button


A results section


The modal can be opened or closed using props passed from a parent component.

3️⃣ Real-Time Search with Debouncing
Instead of searching immediately on every keystroke:
The app waits 300ms after the user stops typing.


If the user keeps typing, the timer resets.


This is called debouncing.
Why it matters:
Prevents excessive database calls


Improves performance


Makes the UI feel smoother



4️⃣ Server Action for Searching
When the debounced timer finishes:
A server action is called.


The current search query is sent to the backend.


The backend searches the database.


Matching users are returned.


If something fails:
The error is handled


The UI doesn’t crash


Results are cleared safely



5️⃣ Database Search Logic
On the backend:
The query searches both:


username


name


It is case-insensitive.


It returns only the fields needed by the UI.


It limits results to 10 users.


It sorts by:


Highest follower count


Then alphabetically by username


This keeps the results:
Relevant


Lightweight


Fast



6️⃣ Loading State Handling
While the database is being queried:
A spinner is shown.


This tells the user something is happening.


No awkward blank screen.

7️⃣ Empty State Handling
There are three UI states:
🔎 No query yet → show “Search for users”


⏳ Searching → show spinner


❌ No results → show “No users found”


✅ Results found → display user list


So the UI always feels intentional.

8️⃣ Instagram-Style Results Layout
Each search result shows:
Profile image (left side)


Username


Full name (if available)


Followers count


All results are stacked vertically.
Each item:
Has pointer cursor


Has hover effect


Is fully clickable



9️⃣ Navigation to Profile
When a user clicks a result:
The app navigates to /profile/[username]


The modal closes automatically


That makes the experience seamless.

🧠 Overall Architecture
This feature combines:
Client-side state management


Debounced input handling


Server actions


Optimized Prisma querying


Clean UI states


Smooth navigation


It’s not just “search input” — it’s a complete, production-style search experience.