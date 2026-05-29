# User actions prompt:

## Output:

Create a server directory in the root of the project. Inside it, create a subdirectory named actions and a file named:
```
server/actions/user.actions.ts
```

Within this file, define three server-side actions that interact with the database, following Next.js and Prisma best practices. Each action should use try/catch blocks to handle errors gracefully.

---

## Actions to Define

### getUser()
Retrieves a user from the database based on a provided identifier.

---

### createOrUpdateUser()
Receives user data from Clerk webhooks and creates a new user or updates an existing user in the database.

---

### deleteUser()
Deletes a user from the database using a provided identifier.

---

## Guidelines

Encapsulate all database operations in try/catch blocks.

Log and handle errors gracefully to prevent application crashes.

Follow server-side conventions for Next.js and Prisma.

At this stage, only define these actions;