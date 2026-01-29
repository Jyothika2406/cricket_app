import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import AdminSidebar from "@/components/admin/admin-sidebar";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);

    // If the user is not logged in, redirect to login
    if (!session?.user?.email) {
        redirect("/login?error=Please login to access admin panel");
    }

    // CRITICAL: Verify admin role from database (never trust session alone)
    await dbConnect();
    const user = await User.findOne({ email: session.user.email });

    if (!user || user.role !== "admin") {
        // User is not an admin, redirect to dashboard with error
        redirect("/dashboard?error=Access denied. Admin privileges required.");
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            <AdminSidebar user={session.user} />
            <main className="flex-1 min-h-screen lg:ml-72">
                <div className="p-4 md:p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}