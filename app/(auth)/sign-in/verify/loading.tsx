export default function VerifyLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-3">
      <p className="text-lg font-medium">Authenticating...</p>
      <p className="text-sm text-muted-foreground">
        Please wait while we securely sign you in.
      </p>
    </div>
  );
}