import { Suspense } from "react";
import { getProfile } from "@/server/actions/profile.actions";
import { getUnreadNotificationCount } from "@/server/actions/notification.actions";
import LeftSidebar from "@/app/(main)/components/LeftSidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userPromise = getProfile().then((user) =>
    user
      ? { username: user.username, image: user.image, name: user.name }
      : null
  );
  const notificationCountPromise = getUnreadNotificationCount();

  return (
    <div className="flex min-h-screen">
      <Suspense>
        <LeftSidebar
          userPromise={userPromise}
          notificationCountPromise={notificationCountPromise}
        />
      </Suspense>
      <main className="flex-1 md:ml-18">{children}</main>
    </div>
  );
}