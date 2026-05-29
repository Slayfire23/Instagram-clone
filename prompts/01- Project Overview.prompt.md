# Prompt for giving context to Claude and making it understand what I want to build

I need you to act as a senior software engineer on this project and as an expert in the modern Next.js stack, following best practices in modern software development.

This project is an identical Instagram clone.  
Not just “inspired by” Instagram — it should feel identical, so that when someone uses it, they feel like they are actually using Instagram.

You must focus only on the requirements I give you.  
❌ Do not suggest additional features  
❌ Do not suggest other libraries or frameworks  

This is the exact tech stack for the project — nothing more and nothing less:

- Claude Code → AI pair programmer  
- Next.js 16 (App Router)  
- TypeScript  
- React  
- Tailwind CSS  
- shadcn/ui → fast, beautiful UI  
- Clerk → authentication  
- Prisma + PostgreSQL → production-ready database layer  
- Zod → validation & AI-safe schemas  
- UploadThing → media uploads (critical for an Instagram clone)  

Again:  
👉 Do not suggest any other libraries or frameworks.

---

# 📌 Application requirements

These are the only features I want in the app:

- A database schema that does not exceed 6 models under any circumstances  
- A landing page that also includes the sign-in interface  
- A sign-up page  
- A feed page  
- This will be rich and include multiple elements (e.g. stories, feed, etc)  
- A search modal  
- A notifications modal  
- A create post modal  
- A profile page  
  - For the page owner  
  - For other users’ profiles  

---

# 🧠 Development & coding rules

Always follow the existing coding style of the project

- Naming conventions  
- File structure  
- Component patterns  

Follow best practices for client-side code

- Avoid using useEffect unless it is strictly unavoidable  
- Prefer server components  
- Prefer derived state  
- Prefer event-driven logic  

Do not overcomplicate solutions

- Always write clean, readable, and maintainable code  
- Break logic into small, well-structured components and utilities  
- Follow best practices for any code you write  

When I provide official documentation or examples, you must match the same patterns.

---

# ⚙️ Next.js route best practices (required)

When creating any route in the Next.js App Router:

- Always include an error.tsx file as an error fallback  
- Always include a loading.tsx file as a loading fallback  
- Treat these files as mandatory best practices for proper UX and resilience  
- Follow the same coding style and project structure when generating these files  

---

# 📷 Visual reference rules

I will provide screenshots inside a folder named screenshots

You must analyze the images inside this folder carefully

Treat these screenshots as the primary and ongoing reference for:

- UI  
- UX  
- Layout  
- Behavior  

We will always use these screenshots as a reference throughout the project.

---

# ⚠️ Certainty & knowledge constraint

If you do not know something, are uncertain, or do not have enough information, you must explicitly say:

“I don’t know.”

Do not guess, do not assume, and do not hallucinate behavior or implementation details.

In such cases, do not proceed or generate anything until you are 100% confident and have enough information to move forward.

---

# ✅ Understanding confirmation (required)

Provide a clear, structured overview of your understanding of:

- The project goal  
- The constraints  
- The allowed tech stack  
- The required features  
- The development rules  

Explicitly mention any uncertainties or missing information.  
Wait for my confirmation or corrections before proceeding.

---

# ⚠️ Important instruction

Do not generate any code or implementation yet.  
This prompt is only to help you understand the project I want to build.