# Output:

I need you to create the schema for this project that will reflect the business logic of this app.

🔵 model User  
This represents any user in instagram.  

model User {  
Defines a Prisma model called User. This will become a User table in our database.

🆔 Primary Key  
id String @id @default(cuid())  

id → Column name  
String → Data type  
@id → Primary key  
@default(cuid()) → Automatically generate a unique ID using cuid()  

So every user gets a unique string ID like:  
clx9z8abc0000xyz123  

🔐 Clerk Authentication Fields  

clerkId String @unique  
Stores the user ID from Clerk  
@unique → No two users can have the same Clerk ID  

email String @unique  
User email  
Must be unique  

username String @unique  
Public username  
Also unique  

📝 Optional Profile Fields  

name String?  
bio String?  
image String?  
website String?  
gender String?  

The ? means optional.  
These fields can be null.

🔒 Privacy  

isPrivate Boolean @default(false)  

Boolean field  
Defaults to false  
Controls whether account is private  

⏱ Timestamps  

createdAt DateTime @default(now())  
Automatically set when user is created  

updatedAt DateTime @updatedAt  
Automatically updates whenever record changes  

🔁 Relations in User  
These define relationships with other models.

🖼 Posts  

posts Post[]  
One user → many posts  
(One-to-many relationship)

📖 Stories  

stories Story[]  
One user → many stories  

👀 Viewed Stories  

viewedStories ViewedStory[]  
Tracks which stories this user has viewed.

❤️ Interactions (Likes, Comments, Follows)  

sentInteractions Interaction[] @relation("SentInteractions")  
Interactions this user created.  

receivedInteractions Interaction[] @relation("ReceivedInteractions")  
Interactions targeting this user.  

🔔 Notifications  

sentNotifications Notification[] @relation("SentNotifications")  
receivedNotifications Notification[] @relation("ReceivedNotifications")  

👥 Followers System (Self Relation)  

followers User[] @relation("UserFollows")  
following User[] @relation("UserFollows")  

User follows other users.

🔁 This Is a Self Many-to-Many Relation  

You are relating the User model to itself.  
This creates a classic:  

User ↔ User (Follow system)  

One user can follow many users.  
One user can be followed by many users.  

That’s a many-to-many self relation.

---

🟣 model Post  
Represents a user post.

model Post {

🆔 ID  

id String @id @default(cuid())  
Primary key.

🖼 Type  

type PostType  

Uses enum PostType:  
IMAGE  
REEL  

📂 Media  

mediaUrl String  
Stores image/video URL.  

mediaType MediaType @default(IMAGE)  

Enum:  
IMAGE  
VIDEO  

Defaults to IMAGE.

📝 Caption  

caption String?  
Optional text caption.

⏱ Timestamps  

createdAt DateTime @default(now())  
updatedAt DateTime @updatedAt  

👤 Author Relation  

authorId String  
Foreign key.  

author User @relation(fields: [authorId], references: [id], onDelete: Cascade)  

fields: [authorId] → uses this column  
references: [id] → references User.id  
onDelete: Cascade → if user deleted → delete posts  

🔁 Relations  

interactions Interaction[]  
notifications Notification[]  

Post can have many likes/comments and notifications.

---

🟡 enum PostType  

enum PostType {  
 IMAGE  
 REEL  
}

Limits allowed values.

---

🟡 enum MediaType  

enum MediaType {  
 IMAGE  
 VIDEO  
}

---

🟢 model Story  
Instagram-style story.

model Story {

Basic Fields  

id String @id @default(cuid())  
mediaUrl String  
mediaType MediaType  

Timestamps  

createdAt DateTime @default(now())  
updatedAt DateTime @updatedAt  

Author  

authorId String  
author User @relation(fields: [authorId], references: [id], onDelete: Cascade)

👀 Who Viewed It  

viewedBy ViewedStory[]  

Connects to ViewedStory.

⚡ Indexes  

@@index([authorId])  
@@index([createdAt])  

Improves performance when:  

Fetching stories by author  
Sorting by date  

}

---

🟠 model ViewedStory  
Tracks story views.

model ViewedStory {

Fields  

id String @id @default(cuid())  
viewedAt DateTime @default(now())  

User Relation  

userId String  
user User @relation(fields: [userId], references: [id], onDelete: Cascade)

Story Relation  

storyId String  
story Story @relation(fields: [storyId], references: [id], onDelete: Cascade)

🚫 Prevent Duplicate Views  

@@unique([userId, storyId])  

Same user cannot view same story twice (in DB).

Indexes  

@@index([userId])  
@@index([storyId])

}

---

🔴 model Interaction  

Handles:  

Likes  
Comments  
Follows  
Follow Requests  

Fields  

id String @id @default(cuid())  
type InteractionType  
content String?  
createdAt DateTime @default(now())  

content used for comments  

Who Sent It  

userId String  
user User @relation("SentInteractions", fields: [userId], references: [id], onDelete: Cascade)

Optional Post  

postId String?  
post Post? @relation(fields: [postId], references: [id], onDelete: Cascade)

If it's a LIKE or COMMENT on a post.

Optional Target User  

targetUserId String?  
targetUser User? @relation("ReceivedInteractions", fields: [targetUserId], references: [id], onDelete: Cascade)

Used for FOLLOW or FOLLOW_REQUEST.

💬 Nested Comments (Replies)  

parentId String?  
parent Interaction? @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)

replies Interaction[] @relation("CommentReplies")

This is a self-relation.

Allows:  

Comment  
Reply  
Reply to reply  

}

---

🟡 enum InteractionType  

enum InteractionType {  
 LIKE  
 COMMENT  
 FOLLOW  
 FOLLOW_REQUEST  
}

---

🔔 model Notification  

Handles user notifications.

Basic Fields  

id String @id @default(cuid())  
type NotificationType  
isRead Boolean @default(false)  
createdAt DateTime @default(now())  

Sender  

senderId String  
sender User @relation("SentNotifications", fields: [senderId], references: [id], onDelete: Cascade)

Who triggered notification.

Recipient  

recipientId String  
recipient User @relation("ReceivedNotifications", fields: [recipientId], references: [id], onDelete: Cascade)

Who receives it.

Optional Post  

postId String?  
post Post? @relation(fields: [postId], references: [id], onDelete: Cascade)

Used for:  

LIKE  
COMMENT  
REPLY  

⚡ Indexes  

@@index([recipientId, isRead])  
@@index([recipientId, createdAt])  

Makes queries fast like:  

Get unread notifications  
Get latest notifications  

}

---

🟡 enum NotificationType  

enum NotificationType {  
 LIKE  
 COMMENT  
 REPLY  
 FOLLOW  
 FOLLOW_REQUEST  
 FOLLOW_REQUEST_REJECTED  
 FOLLOW_REQUEST_ACCEPTED  
}

Defines allowed notification types.

---

🧠 Big Picture Architecture  

We built:  

✅ Users  
✅ Posts (image/reel)  
✅ Stories + viewers  
✅ Likes & comments  
✅ Follow system  
✅ Nested replies  
✅ Notifications  
✅ Privacy support  
✅ Performance indexes  

This is production-level relational modeling.

---

🧩 FULL SCHEMA DIAGRAM (Text-Based)

┌────────────┐  
│    User    │  
└────────────┘  
id (PK)  
clerkId (U)  
email (U)  
username (U)  
...  
isPrivate  
createdAt  
updatedAt  
     │  
     │ 1  
     │  
     ▼  
┌────────────┐  
│    Post    │  
└────────────┘  
id (PK)  
type  
mediaUrl  
mediaType  
caption  
authorId (FK → User.id)  
     │  
     │ 1  
     │  
     ▼  
┌──────────────┐  
│ Interaction  │  
└──────────────┘  
id (PK)  
type  
content  
userId (FK → User.id)          ← sender  
postId (FK → Post.id)          ← optional  
targetUserId (FK → User.id)    ← optional  
parentId (FK → Interaction.id) ← self relation  

👥 USER FOLLOW RELATION (Self Many-to-Many)

User  
 ▲         ▲  
 │         │  
followers  following  
 │         │  
 └─── UserFollows ───┘  
       (Join Table)  

Behind the scenes:  

_UserFollows  
-----------------  
A (followerId)  
B (followingId)  

💬 COMMENT REPLIES (Self One-to-Many)

Interaction (Comment)  
       │  
       ▼  
Interaction (Reply)  
       │  
       ▼  
Interaction (Reply to Reply)  

Database-wise:

Interaction  
-----------------  
id  
parentId → Interaction.id  

📖 STORIES  

User (1)  
  │  
  ▼  
Story (Many)  
  │  
  ▼  
ViewedStory (Many)  
  │  
  ▼  
User (Viewer)  

🔔 NOTIFICATIONS  

User (sender)  
    │  
    ▼  
Notification  
    │  
    ▼  
User (recipient)  

Optional link to post:  

Notification  
  │  
  ▼  
Post  

---

🔁 FULL RELATION OVERVIEW  

User  
├── Posts  
├── Stories  
├── ViewedStories  
├── SentInteractions  
├── ReceivedInteractions  
├── SentNotifications  
├── ReceivedNotifications  
├── Followers (User ↔ User)  
└── Following (User ↔ User)  

Post  
├── Interactions  
└── Notifications  

Story  
└── ViewedBy  

Interaction  
├── Post (optional)  
├── TargetUser (optional)  
├── Parent (self)  
└── Replies (self)  

Notification  
├── Sender (User)  
├── Recipient (User)  
└── Post (optional)  

---

Constraint:  
Do not create any other files or generate any other code.