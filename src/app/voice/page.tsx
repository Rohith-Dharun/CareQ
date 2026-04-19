"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import WelcomeSection from "@/components/Voice Agent/WelcomeSection";
import FeatureCards from "@/components/Voice Agent/FeatureCards";
import VapiWidget from "@/components/Voice Agent/VapiWidget";
import ProPlanRequired from "@/components/Voice Agent/ProPlanRequired";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function VoicePage() {
    const [plan, setPlan] = useState<string | null>(null);

    useEffect(() => {
        const savedPlan = localStorage.getItem("userPlan");
        setPlan(savedPlan ?? "FREE");
    }, []);

    // Still loading from localStorage — render nothing to avoid flash
    if (plan === null) return null;

    // FREE plan — show upgrade prompt
    if (plan === "FREE") return <ProPlanRequired />;

    // PRO or PREMIUM — show voice assistant
    return (
        <div className="min-h-screen bg-background">
            <NavBar />
            <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
                <WelcomeSection />
                <FeatureCards />
            </div>

            <div className="max-w-5xl mx-auto px-6 pb-20">
                <ErrorBoundary fallback={<div className="p-4 text-red-500 bg-red-50 border border-red-100 rounded-xl">Voice widget failed to load.</div>}>
                    <VapiWidget />
                </ErrorBoundary>
            </div>
        </div>
    );
}