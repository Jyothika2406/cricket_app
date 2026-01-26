import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import AdminSidebar from "@/components/admin/admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);

    // If the user is not logged in OR is not an admin, send them to dashboard
    if (!session || session.user.role !== "admin") {
        redirect("/dashboard");
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