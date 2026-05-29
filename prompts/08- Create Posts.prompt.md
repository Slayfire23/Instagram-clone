# Build the “Create Post” Feature

Here’s the full flow:

## 1️⃣ Clicking the Create Button
When a user clicks **Create** in the `LeftSidebar`, a **Create Menu modal** should pop up.

Inside that modal, we’ll show **two options**:

- **Post** → with a post icon  
- **AI** → with an AI icon  

For now, we’ll only implement the **Post** option. The AI option can just be visible in the UI.

---

## 2️⃣ Clicking “Post”
- Opens the **Create Post modal**.  
- This modal should let the user **upload a file** using the `UploadDropzone` component from **UploadThing**.  
- Make sure to match the **layout, spacing, and design** exactly like the screenshots for both the **Create Menu modal** and the **Create Post modal**.

---

## 3️⃣ Post Submission Form
After the user uploads a file:

- Display a **file preview** of the uploaded media.  
- Include form inputs:
  - **Post Type** → dropdown or select: `Image` or `Reel`  
  - **Caption** → text input for the post caption  
- Include **two buttons**:
  - **Submit** → saves the post  
  - **Discard** → cancels the upload and closes the form  
- While submitting:
  - Show a **“Submitting…”** text to indicate progress

---

## 4️⃣ Saving the Post
When the user submits a post:

- The post needs to be **saved to our database**.  
- For this, create **server actions** in a file called `server/actions/post.actions.ts`.  
- You’ll need actions like:
  - `createPost` → to save a new post  
  - `getUserOwnPosts` → to fetch posts of the logged-in user  
  - `getUserPostsByUsername` → to fetch posts by any username  
  - `getPostById` → to fetch a single post  
  - `deletePost` → to delete a post  

---

## Summary of Flow
1. Click **Create** → **Create Menu modal** appears  
2. Click **Post** → **Create Post modal** opens  
3. Upload file with **UploadDropzone**  
4. Fill out post submission form:
   - File preview  
   - Post Type (Image/Reel)  
   - Caption  
   - Submit / Discard buttons  
   - Show **“Submitting…”** while saving  
5. Submit → save the post to the database using `createPost`  
6. Use other server actions (`getUserOwnPosts`, etc.) to fetch posts wherever needed  
7. Design should match the screenshots exactly  

---

Basically, we’re creating a full **post creation flow**: modal, uploader, preview, form inputs, database save, loading states, and all the server actions needed to manage posts.
