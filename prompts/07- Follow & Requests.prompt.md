First, start by creating a `FollowButton` component.  
This button will handle all the follow logic depending on the account type.

---

## How the Follow Logic Should Work

When a user clicks **Follow** on someone’s profile:

- If the account is **public** → they should follow them instantly.
- If the account is **private** → instead of following immediately, a follow request should be sent.

So basically:

- **Public account = instant follow**
- **Private account = send request**

---

## Follow Requests Flow (For Private Accounts)

If a follow request is sent:

- The private account user should receive a notification.

Inside that notification, they should be able to:

- Accept the request  
- Reject the request  

### If they accept:

- The sender officially becomes a follower.
- The sender should also receive a notification saying their request was accepted.

### If they reject:

- The request is removed.
- No follow relationship is created.

---

## Notifications Feature

Now we’re also building the Notifications system.

When a user receives:

- A follow request  
- Or when their request gets accepted  

They should be notified.

---

## Notifications UI

When the user clicks the **Notifications** button in the `LeftSidebar`:

- A notification modal should appear.
- Use **shadcn Sheet** for this.

It should:

- Slide smoothly from the left.
- Be positioned exactly above the left sidebar.
- Hide the sidebar while open (so it feels like it replaces it).
- Feel clean and smooth — not like a random popup.

---

## Implementation Order

1. Create the `FollowButton` component.

2. Implement:
   - Instant follow for public accounts.
   - Follow request system for private accounts.

3. Build the notifications backend logic.

4. Create the Notifications UI using **shadcn Sheet**.

5. Handle accept/reject inside the notifications panel.

6. Add notification when a request is accepted.

---

## Final Goal

We’re building a complete follow system like Instagram:

- Smart follow logic  
- Private account requests  
- Real-time notifications  
- Clean sliding notification panel UI  