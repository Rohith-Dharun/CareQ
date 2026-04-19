"use client";

import { useEffect, useState } from "react";
import { CrownIcon, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function PlanBanner() {
    const [plan, setPlan] = useState("FREE");
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const savedPlan = localStorage.getItem("userPlan");
        if (savedPlan) {
            setPlan(savedPlan);
        }
        setIsLoaded(true);
    }, []);

    const handleCancel = () => {
        if (plan === "FREE") return;
        localStorage.removeItem("userPlan");
        setPlan("FREE");
        toast.success("Subscription cancelled. Reverted to Free plan.");
    };

    if (!isLoaded || plan === "FREE") return null;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-primary/5 border border-primary/20 rounded-2xl mb-8">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                    <CrownIcon className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-sm">Active {plan} Subscription</h3>
                    <p className="text-xs text-muted-foreground">You have full access to all {plan.toLowerCase()} features.</p>
                </div>
            </div>
            <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 rounded-xl transition-all border border-destructive/20 active:scale-95"
            >
                <XCircle className="w-4 h-4" />
                <span>Cancel Subscription</span>
            </button>
        </div>
    );
}
