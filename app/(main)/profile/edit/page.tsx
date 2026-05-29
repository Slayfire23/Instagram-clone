import { redirect } from "next/navigation";
import { getProfile } from "@/server/actions/profile.actions";
import EditProfileForm from "@/app/(main)/profile/edit/components/EditProfileForm";

export const dynamic = "force-dynamic";

export default async function EditProfilePage() {
  const profile = await getProfile();
  if (!profile) redirect("/");

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-xl font-medium mb-8">Edit profile</h1>
      <EditProfileForm
        initialData={{
          username: profile.username,
          name: profile.name,
          image: profile.image,
          bio: profile.bio,
          website: profile.website,
          gender: profile.gender,
          isPrivate: profile.isPrivate,
        }}
      />
    </div>
  );
}