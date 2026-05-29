# Home Loading, error and layout Prompt:

## Output Specification

### Objective
Implement the loading state, error state, metadata, and footer for the application to match Instagram’s visual style and follow Next.js App Router best practices.

---

## Requirements

### 1. Loading Page

Create a loading.tsx file inside the app directory.

The loading page must visually match Instagram’s loading screen.

Display the Instagram logo using the file:
```
/assets/logo.svg
```

Below the Instagram logo, render the text:
```
from
```

Next to the text, render the Meta logo using the file:
```
/assets/meta-logo-3.png
```

Write the text Meta next to the Meta logo.

Ensure all content is vertically and horizontally centered on the page.

make the logo and the text below it which is 'from meta logo' closer to each others and make both of them more zoomed in

---

### 2. Error Page

Create an error.tsx file inside the app directory.

Implement an error fallback UI consistent with Instagram’s design style.

Display the Instagram logo at the top of the error page.

Follow the official Next.js error file patterns.

Code examples from the Next.js documentation will be provided and must be followed.

---

### 3. App Metadata

Open app/layout.tsx.

Add application metadata with the following values:

Title: Instagram

Description: Add an appropriate description that reflects Instagram as a social media platform for sharing photos and videos.

---

### 4. Footer Component

Create a Footer component inside:
```
app/components/Footer.tsx
```

Before implementation:

Review the footer design in the screenshots folder in the landing page image.

Analyze the layout, spacing, typography, and structure.

Recreate the footer to match the screenshot exactly.

---

### 5. Footer Placement

Import and render the Footer component inside app/layout.tsx.

Ensure the footer:

Appears at the bottom of the layout.

Remains visually anchored to the bottom of the page.

---

### Constraints

Do not create any additional files beyond those specified.

Do not implement any functionality beyond the requirements listed above.

Follow official Next.js App Router conventions and patterns.

---

# Landing Page Prompt:

## Output Specification

### Objective
Implement route protection, authentication checking, and an Instagram-style landing page using Clerk authentication and Next.js App Router conventions.

---

## Requirements

### 1. Route Protection

Open the proxy.ts file.

Protect the following routes:
```
/feed
/profile
```

Use Clerk authentication middleware patterns.

Clerk documentation examples will be provided and must be followed.

---

### 2. Authentication Checker Function

Create a new file:
```
lib/auth.ts
```

Inside this file, implement an authentication checker function that:

Behavior:

Calls a server action named getUser() to retrieve the current database user.

Do not define the getUser() server action yet — it will be implemented later.

If a database user exists:

Redirect the user to /feed.

If no database user exists:

Allow execution to continue normally.

---

### 3. Root Page Authentication Handling

Open the root page file:
```
app/page.tsx
```

Call the authentication checker function created in lib/auth.ts.

Behavior:

If the user is authenticated:

Redirect them to /feed.

If the user is not authenticated:

Render the Landing Page.

---

### 4. Landing Page Implementation

Create a landing page component inside app/components that visually matches Instagram’s official landing page design.

Preparation:

Review and analyze the landing page image provided in the screenshots folder.

Match the layout, spacing, alignment, and visual hierarchy.

---

### 5. Landing Page Layout Structure

Split the landing page into two main sections:

#### Left Section

Render the following elements in order:

Instagram app logo at the top-left

Heading text below the logo:
```
See everyday moments from your close friends.
```

Branding image below the text:
```
/public/assets/branding-image.png
```

Ensure proper spacing and alignment consistent with the screenshot.

---

#### Right Section

Render a component named:
```
SignInForm
```

Do not implement the SignInForm component yet.

Only render it as a placeholder component.

---

### 6. Separators

Add the following separators using the shadcn/ui Separator component:

Vertical Separator

Place between the left and right sections.

Horizontal Separator

Place below the landing page content.

Position it above the Footer.

---

### Constraints

Do not implement the getUser() server action yet.

Do not implement the SignInForm component yet.

Follow Next.js App Router best practices.

Follow Clerk authentication patterns from official documentation.

Match the provided screenshot design as closely as possible.

---

# SignInForm Prompt:

## Output Specification — Custom Clerk Sign-In Flow with Validation, OAuth Redirects, and Verification

### Objective

Implement a complete custom Clerk sign-in flow with:

Full validation using Zod

Type-safe form handling with React Hook Form

Instagram-style UI using shadcn/ui

OAuth authentication (Google, Facebook)

Email/password authentication

Second-factor verification support

Proper redirect handling and session activation

This must follow Next.js App Router, Clerk custom flow best practices, and match the Instagram UI shown in the screenshots folder in the landing page image.

---

## Part 1: Authentication Route Group Structure

### 1. Create Route Group

Create the following route group:
```
app/(auth)/
```

This route group will contain:

Validation schemas

Authentication components

Sign-in and verification logic

---

### 2. Create Validation Folder and File

Create:
```
app/(auth)/validations/SignIn.ts
```

This file will contain:

Zod schemas

TypeScript types

---

### 3. Sign-In Schema

Create a Zod schema with:

Email: z.email("Please enter a valid email address")

password

Requirements:

Minimum length: 8 characters

Maximum length: 100 characters

Must not be empty

Must be properly validated as a string

---

### 4. Sign-In TypeScript Type

Create and export a TypeScript type derived from the sign-in schema.

This type will be used with:

React Hook Form

Clerk sign-in logic

---

### 5. Verification Code Schema

Create a Zod schema for verification codes.

Requirements:

Required

Digits only (0–9)

No letters

No special characters

Must not be empty

Valid examples:
```
123456
9870
```

Invalid examples:
```
12a4
(empty string)
```

---

### 6. Verification Code TypeScript Type

Create and export a TypeScript type derived from the verification code schema.

---

## Part 3: SignInForm Component

### 1. Component Location

Create:
```
app/(auth)/components/SignInForm.tsx
```

---

### 2. Component Objective

Implement a fully custom Clerk sign-in form styled exactly like Instagram.

You must match the screenshots precisely (landing page image):

Layout

Spacing

Typography

Alignment

Visual hierarchy

---

### 3. Form UI Requirements

#### Title

Display:
```
Log into Instagram
```

Position:

Top-left of form container

---

#### Input Fields

Create two full-width inputs using shadcn Input.

Identifier Input

Placeholder:
```
Email
```

Password Input

Placeholder:
```
Password
```

---

#### Buttons and Actions

Include:

Forgot Password button

Login with Facebook button

Login with Google button

Create New Account button

Link to:
```
/sign-up
```

---

#### Footer Branding

At the bottom display:

Image:
```
/public/assets/meta-logo-3.png
```

Text:
```
Meta
```

---

## Part 4: OAuth Redirect Configuration

### Requirement

Inside the SignInForm component, implement OAuth authentication using Clerk.

Use:
```
signIn.authenticateWithRedirect()
```

Required Redirect Properties:

redirectUrl
```
redirectUrl: `${appUrl}/sign-in/verify`
```

Purpose:

Intermediate verification route

Clerk completes OAuth authentication here

Clerk exchanges tokens securely

Clerk prepares session creation

redirectUrlComplete
```
redirectUrlComplete: "/feed"
```

Purpose:

Final redirect after authentication completes

User lands on the authenticated feed

Final OAuth Call Structure:
```
signIn.authenticateWithRedirect({
  strategy,
  redirectUrl: `${appUrl}/sign-in/verify`,
  redirectUrlComplete: "/feed",
})
```

---

## Part 5: OAuth Authentication Flow Summary

The OAuth authentication flow consists of three phases.

### Phase 1: User Initiates OAuth

User clicks:

Log in with Google

Log in with Facebook

This calls:
```
signIn.authenticateWithRedirect()
```

Clerk redirects user to OAuth provider.

Examples:

Google OAuth

Facebook OAuth

---

### Phase 2: Provider Redirects Back to Verification Route

After authentication, user is redirected to:
```
${appUrl}/sign-in/verify
```

Purpose:

Clerk finalizes authentication

Clerk exchanges secure tokens

Clerk prepares session

---

### Phase 3: Clerk Redirects to Feed

Clerk redirects to:
```
/feed
```

because of:
```
redirectUrlComplete: "/feed"
```

Result:

Session is active

User is authenticated

Protected routes become accessible

---

## Part 6: Email and Password Sign-In Flow

### Step 1: User Submits Credentials

```
signIn.create({
  identifier: email,
  password,
})
```

Possible statuses:

complete

needs_second_factor

error

---

### Step 2: Successful Authentication

If:
```
status === "complete"
```

Then:
```
setActive({ session: sessionId })
router.push("/feed")
```

Result:

Session activated

User redirected to feed

---

### Step 3: Second Factor Required

If:
```
needs_second_factor
```

Clerk sends verification code:
```
prepareSecondFactor({
  strategy: "email_code"
})
```

Verification form is shown.

---

### Step 4: Verification Code Submission

Clerk verifies:
```
attemptSecondFactor({
  strategy: "email_code",
  code,
})
```

If successful:
```
setActive({ session })
router.push("/feed")
```

---

## Part 7: Session Activation Logic

Session activation:
```
setActive({ session: sessionId })
```

Purpose:

Authenticates user

Stores session securely

Enables protected routes

Allows Clerk to recognize authenticated user

---

## Part 8: Required Libraries and Patterns

Use:

React Hook Form

Zod

shadcn/ui

Clerk custom authentication

Follow patterns from:

shadcn documentation

Clerk documentation

Match their structure exactly. And i will provide code examples from their documentations.

---

## Part 9: Verification Route Implementation

### Objective

Implement the verification route used by Clerk to complete OAuth authentication and finalize session creation.

This route will serve as the intermediate callback endpoint for OAuth providers and will mount Clerk’s verification component to handle authentication completion automatically.

---

### 1. Create Verification Route Folder

Create the following folder:
```
app/(auth)/verify/
```

This folder will contain:

page.tsx

loading.tsx

error.tsx

---

### 2. Create Verification Loading UI

Create:
```
app/(auth)/verify/loading.tsx
```

Purpose:

This file provides visual feedback while Clerk completes authentication.

UI Requirements:

Display centered content with:

Primary text:
```
Authenticating...
```

Optional secondary text:
```
Please wait while we securely sign you in.
```

Layout Requirements:

Content must be vertically and horizontally centered

Match Instagram-style minimal loading UI

Clean typography

Proper spacing

---

### 3. Create Verification Error UI

Create:
```
app/(auth)/verify/error.tsx
```

Purpose:

Display a fallback UI if authentication fails.

UI Requirements:

Display:

Title:
```
Authentication Failed
```

Description:
```
Something went wrong while signing you in.
Please try again.
```

Optional action button:

Return to Sign In

Link to:
```
/sign-in
```

Layout Requirements:

Centered content

Instagram-style minimal error UI

Clear visual hierarchy

---

### 4. Create Verification Page

Create:
```
app/(auth)/verify/page.tsx
```

---

### 5. Component Requirement — Mount Clerk Redirect Callback Component

This page MUST mount Clerk’s redirect callback component:
```
<AuthenticateWithRedirectCallback
 signInFallbackRedirectUrl="/feed"
 signUpFallbackRedirectUrl="/feed"
/>
```

Add the clerk captcha to this page and a text saying something like authenticating

---

### 6. Purpose of AuthenticateWithRedirectCallback

This component is responsible for:

Completing OAuth authentication

Exchanging secure authentication tokens

Creating the Clerk session

Activating the user session

Redirecting the user to the appropriate destination

---

### 7. Redirect Behavior

signInFallbackRedirectUrl
```
/feed
```

Used when:

User signs in with OAuth

Clerk completes authentication successfully

signUpFallbackRedirectUrl
```
/feed
```

Used when:

User signs up via OAuth

Clerk completes account creation and authentication

---

### 8. Authentication Flow with Verification Route

Complete OAuth sequence:

Step 1 — User clicks OAuth button

```
signIn.authenticateWithRedirect()
```

User is redirected to OAuth provider.

Step 2 — OAuth provider redirects to verification route
```
/sign-in/verify
```

This loads:
```
app/(auth)/verify/page.tsx
```

Step 3 — Clerk component handles authentication
```
<AuthenticateWithRedirectCallback />
```

Clerk:

Processes authentication result

Creates session

Activates session

Step 4 — Clerk redirects user to feed
```
/feed
```

User is now authenticated.

---

### Final Authentication Flow Overview

Complete sequence:

User enters credentials OR clicks OAuth

Clerk authenticates user

OAuth → redirect to /sign-in/verify

Clerk creates session

Clerk redirects to /feed

Session becomes active

User is authenticated

---

### Constraints

Do NOT:

Implement unrelated authentication flows

Modify Clerk internal authentication behavior

Deviate from Clerk redirect pattern

Always use:

redirectUrl → verification route

redirectUrlComplete → final route

Follow:

Next.js App Router conventions

Clerk best practices

shadcn patterns

Match the screenshots exactly.

---

# SignUp Form Prompt:

## Output:

Now analyze the sign up image from the screenshots folder and create a sign-up page that looks exactly like it, using Email as the only placeholder in the email input field. Also use React Hook Form and shadcn/ui components.

Start by creating a validation file inside the auth validations folder named:
```
app/(auth)/validations/SignUp.ts
```

This file must contain validation schemas for all sign-up form fields.

Then create the following route inside the auth route group:
```
app/(auth)/sign-up/[[...sign-up]]/
```

Inside this route, create the following files:

loading.tsx

error.tsx

page.tsx

The page.tsx file must render a SignUpForm component.

Then define the SignUpForm component inside:
```
app/(auth)/components/
```

---

## Overview

Build a custom sign-up form in Next.js using Clerk’s useSignUp() hook that collects user information (email, password, name, username, birthday), handles email verification, and manages errors.

---

## Core Logic Flow

Initialize Clerk Sign-Up Hook
```
const { signUp, isLoaded, setActive } = useSignUp()
```

The useSignUp() hook provides access to the SignUp object for managing the sign-up flow. Always check isLoaded before proceeding.

---

Create Sign-Up Attempt

When the form is submitted, call signUp.create() with user data:
```
const signUpAttempt = await signUp.create({
  emailAddress,
  password,
})
```

You may also include:

• firstName

• lastName

• username

• unsafeMetadata (for birthday or additional fields)

---

Handle Sign-Up Status

Check the returned status:

If status is complete:
```
if (signUpAttempt.status === "complete") {
  await setActive({
    session: signUpAttempt.createdSessionId,
  })
}
```

If status is missing_requirements, email verification is required:
```
await signUp.prepareEmailAddressVerification({
  strategy: "email_code",
})
```

This sends a verification code to the user's email.

---

Verify Email with Code

After the user enters the verification code:
```
const signUpAttempt = await signUp.attemptEmailAddressVerification({
  code,
})
```

If verification succeeds:
```
if (signUpAttempt.status === "complete") {
  await setActive({
    session: signUpAttempt.createdSessionId,
  })
}
```

---

## Error Handling

Clerk returns errors as ClerkAPIError objects.

Use:
```
if (isClerkAPIResponseError(err)) {
  err.errors.forEach((error) => {
    // Map error.meta.paramName to form fields
  })
}
```

Common paramName values include:

• email_address

• password

• username

Map these errors to the corresponding form fields in React Hook Form.

---

## Key Implementation Details

### State Management

Track:

• isLoading → disable form during submission

• showVerification → toggle between sign-up form and verification form

• verificationCode → store email verification code

---

### Form Validation

Use Zod with React Hook Form to validate:

• email

• password

• username

• name

• birthday

before submitting to Clerk.

---

### Conditional Rendering

If showVerification is true → show verification form

Otherwise → show main sign-up form

---

### Birthday Handling

Collect birthday using:

• month

• day

• year

Combine them into a single date string and store inside unsafeMetadata.

Example:
```
unsafeMetadata: {
  birthday: "1998-04-25"
}
```

---

### CAPTCHA Requirement

Include the following element in the form:
```
<div id="clerk-captcha" />
```

This allows Clerk to render CAPTCHA protection.

---

## Summary

This implementation uses Clerk’s useSignUp() hook to:

• Create a sign-up attempt

• Handle email verification

• Verify the email using a code

• Handle and map errors correctly

• Activate the session after successful verification

The result is a fully functional custom Clerk sign-up flow built with Next.js App Router, React Hook Form, Zod, and shadcn/ui, matching the exact UI from the screenshots.