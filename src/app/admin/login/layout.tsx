export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  // This layout allows unauthenticated access to admin login page
  return <>{children}</>;
}
