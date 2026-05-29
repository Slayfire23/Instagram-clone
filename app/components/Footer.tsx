const NAV_LINKS = [
  "Meta",
  "About",
  "Blog",
  "Jobs",
  "Help",
  "API",
  "Privacy",
  "Terms",
  "Locations",
  "Instagram Lite",
  "Meta AI",
  "Threads",
  "Contact Uploading & Non-Users",
  "Meta Verified",
];

export default function Footer() {
  return (
    <footer className="w-full py-6 px-4">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-3">
        <nav className="flex flex-wrap justify-center gap-x-3 gap-y-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href="#"
              className="text-xs text-muted-foreground hover:underline"
            >
              {link}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>English</span>
          <span>© 2026 Instagram from Meta</span>
        </div>
      </div>
    </footer>
  );
}