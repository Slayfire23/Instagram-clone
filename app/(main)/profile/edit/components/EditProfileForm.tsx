"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadButton } from "@/lib/uploadthing";
import { updateUserProfile } from "@/server/actions/profile.actions";
import {
  editProfileSchema,
  type EditProfileType,
} from "@/app/(main)/profile/edit/validations/EditProfile";

type EditProfileFormProps = {
  initialData: {
    username: string;
    name: string | null;
    image: string | null;
    bio: string | null;
    website: string | null;
    gender: string | null;
    isPrivate: boolean;
  };
};

export default function EditProfileForm({ initialData }: EditProfileFormProps) {
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState(initialData.image);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EditProfileType>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      username: initialData.username,
      website: initialData.website ?? "",
      bio: initialData.bio ?? "",
      gender: initialData.gender ?? "",
      isPrivate: initialData.isPrivate,
    },
  });

  const bioValue = useWatch({ control, name: "bio" });
  const isPrivateValue = useWatch({ control, name: "isPrivate" });

  async function onSubmit(data: EditProfileType) {
    setIsSubmitting(true);
    setServerError(null);

    try {
      await updateUserProfile({
        username: data.username,
        website: data.website || null,
        bio: data.bio || null,
        gender: data.gender || null,
        isPrivate: data.isPrivate,
        image: imagePreview,
      });
      router.push("/profile");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setServerError(message);
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
    >
      {/* Profile image card */}
      <div className="flex items-center justify-between rounded-2xl bg-gray-50 p-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={imagePreview ?? undefined} />
            <AvatarFallback className="bg-muted text-base">
              {initialData.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{initialData.username}</span>
            <span className="text-sm text-muted-foreground">
              {initialData.name ?? ""}
            </span>
          </div>
        </div>
        <UploadButton
          endpoint="imageUploader"
          appearance={{
            button:
              "bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg cursor-pointer ut-uploading:cursor-not-allowed ut-uploading:opacity-50",
            allowedContent: "text-xs text-muted-foreground",
          }}
          onClientUploadComplete={(res) => {
            if (res?.[0]) {
              setImagePreview(res[0].ufsUrl);
            }
          }}
          onUploadError={(error) => {
            setServerError(`Upload failed: ${error.message}`);
          }}
        />
      </div>

      {/* Username */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="username" className="font-medium">Username</Label>
        <Input
          id="username"
          {...register("username")}
          className="bg-gray-50 border-gray-200"
        />
        <p className="text-xs text-muted-foreground">
          Your username can only contain letters, numbers, dots, and underscores.
        </p>
        {errors.username && (
          <p className="text-xs text-destructive">{errors.username.message}</p>
        )}
      </div>

      {/* Website */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="website" className="font-medium">Website</Label>
        <Input
          id="website"
          placeholder="https://example.com"
          {...register("website")}
          className="bg-gray-50 border-gray-200"
        />
        <p className="text-xs text-muted-foreground">
          Editing your links is only available on mobile. Visit the Instagram app
          and edit your profile to change the websites in your bio.
        </p>
        {errors.website && (
          <p className="text-xs text-destructive">{errors.website.message}</p>
        )}
      </div>

      {/* Bio */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="bio" className="font-medium">Bio</Label>
        <div className="relative">
          <Textarea
            id="bio"
            placeholder="Tell people about yourself..."
            rows={4}
            maxLength={500}
            {...register("bio")}
            className="bg-gray-50 border-gray-200 resize-none pb-8"
          />
          <span className="absolute bottom-2 right-3 text-xs text-muted-foreground">
            {bioValue?.length ?? 0} / 500
          </span>
        </div>
        {errors.bio && (
          <p className="text-xs text-destructive">{errors.bio.message}</p>
        )}
      </div>

      {/* Gender */}
      <div className="flex flex-col gap-2">
        <Label className="font-medium">Gender</Label>
        <Select
          defaultValue={initialData.gender ?? "prefer_not_to_say"}
          onValueChange={(value) =>
            setValue("gender", value === "prefer_not_to_say" ? "" : value)
          }
        >
          <SelectTrigger className="w-full bg-gray-50 border-gray-200 cursor-pointer">
            <SelectValue placeholder="Prefer not to say" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male" className="cursor-pointer">Male</SelectItem>
            <SelectItem value="female" className="cursor-pointer">Female</SelectItem>
            <SelectItem value="other" className="cursor-pointer">Other</SelectItem>
            <SelectItem value="prefer_not_to_say" className="cursor-pointer">Prefer not to say</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          This won&apos;t be part of your public profile.
        </p>
      </div>

      {/* Private account card */}
      <div className="flex items-center justify-between rounded-2xl bg-gray-50 p-4">
        <div className="flex flex-col gap-0.5">
          <Label className="font-medium">Private Account</Label>
          <p className="text-xs text-muted-foreground">
            When your account is private, only people you approve can see your
            photos and videos.
          </p>
        </div>
        <Switch
          checked={isPrivateValue}
          onCheckedChange={(checked) => setValue("isPrivate", checked)}
          className="cursor-pointer shrink-0 ml-4"
        />
      </div>

      {/* Server error */}
      {serverError && (
        <p className="text-sm text-destructive">{serverError}</p>
      )}

      {/* Actions — aligned right */}
      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/profile")}
          className="cursor-pointer"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium cursor-pointer"
        >
          {isSubmitting ? "Saving..." : "Submit"}
        </Button>
      </div>
    </form>
  );
}
