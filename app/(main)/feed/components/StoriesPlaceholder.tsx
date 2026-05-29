import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const placeholders = Array.from({ length: 8 }, (_, i) => i);

export default function StoriesPlaceholder() {
  return (
    <div className="flex gap-4 overflow-x-auto py-4 px-2 border-b scrollbar-hide">
      {placeholders.map((i) => (
        <div key={i} className="flex flex-col items-center gap-1 shrink-0">
          <div className="rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
            <Avatar className="h-14 w-14 border-2 border-white">
              <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                {i + 1}
              </AvatarFallback>
            </Avatar>
          </div>
          <span className="text-[11px] text-muted-foreground truncate w-16 text-center">
            {i === 0 ? "Your story" : `user_${i}`}
          </span>
        </div>
      ))}
    </div>
  );
}