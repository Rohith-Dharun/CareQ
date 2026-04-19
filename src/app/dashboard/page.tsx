import NavBar from "@/components/NavBar";
import WelcomeSection from "@/components/Dashboard Page/WelcomeSection";
import MainActions from "@/components/Dashboard Page/MainActions";
import ActivityOverview from "@/components/Dashboard Page/ActivityOverview";
import PlanBanner from "@/components/Dashboard Page/PlanBanner";

// NOTE: This is intentionally a Server Component so that WelcomeSection
// can use currentUser() from @clerk/nextjs/server.
// Plan persistence is handled client-side inside PlanBanner (a client component).
function DashboardPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <NavBar />
            <div className="max-w-7xl mx-auto px-6 py-8 pt-24 space-y-8">
                <PlanBanner />
                <WelcomeSection />
                <MainActions />
                <ActivityOverview />
            </div>
        </div>
    );
}

export default DashboardPage;