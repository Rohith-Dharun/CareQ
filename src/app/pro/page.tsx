"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import { CrownIcon, CheckIcon } from "lucide-react";
import { useEffect, useState } from "react";

const plans = [
    {
        name: "Free",
        price: "0",
        description: "Perfect for getting started",
        features: ["Unlimited health tracking", "Basic AI tips", "5 consultations/mo"],
        buttonText: "Current Plan",
        id: "FREE",
    },
    {
        name: "Pro",
        price: "19",
        description: "Advanced features for serious health care",
        features: ["Everything in Free", "Unlimited AI consultations", "Priority support", "Monthly reports"],
        buttonText: "Upgrade",
        id: "PRO",
    },
    {
        name: "Premium",
        price: "49",
        description: "The ultimate health care experience",
        features: ["Everything in Pro", "One-on-one virtual coach", "Family sub-accounts", "Early access features"],
        buttonText: "Upgrade",
        id: "PREMIUM",
    },
];

export default function PricingPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [currentPlan, setCurrentPlan] = useState("FREE");

    useEffect(() => {
        const savedPlan = localStorage.getItem("userPlan");
        if (savedPlan) {
            setCurrentPlan(savedPlan);
        }
    }, []);

    if (!isLoaded) return null;
    if (!user) {
        router.push("/");
        return null;
    }

    const handleUpgrade = (planId: string) => {
        if (planId === "FREE") return;
        router.push(`/payment?plan=${planId}`);
    };

    return (
        <div className="min-h-screen bg-background">
            <NavBar />
            <main className="max-w-7xl mx-auto px-6 py-8 pt-24">
                <div className="mb-12">
                    <div className="flex flex-col md:flex-row items-center justify-between bg-gradient-to-br from-primary/10 to-background rounded-3xl p-8 border border-primary/20 gap-8">
                        <div className="space-y-4 max-w-2xl text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium text-primary">Membership Plans</span>
                            </div>
                            <h1 className="text-4xl font-bold mb-2">Unlock Premium AI Health Care</h1>
                            <p className="text-muted-foreground">
                                Select the perfect plan for your health care needs. All plans include secure access and bank-level encryption.
                            </p>
                        </div>
                        <div className="hidden lg:block">
                            <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                                <CrownIcon className="w-16 h-16 text-primary" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative flex flex-col p-8 bg-card rounded-3xl border ${currentPlan === plan.id ? "border-primary shadow-lg shadow-primary/10" : "border-border/50"
                                } transition-all hover:shadow-xl hover:scale-[1.02]`}
                        >
                            {currentPlan === plan.id && (
                                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase">
                                    Current
                                </div>
                            )}
                            <div className="mb-8">
                                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                <p className="text-muted-foreground text-sm h-10">{plan.description}</p>
                            </div>
                            <div className="mb-8">
                                <span className="text-4xl font-bold">${plan.price}</span>
                                <span className="text-muted-foreground ml-2">/month</span>
                            </div>
                            <ul className="space-y-4 mb-8 flex-grow">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 text-sm text-foreground/80">
                                        <CheckIcon className="w-5 h-5 text-primary shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => handleUpgrade(plan.id)}
                                disabled={currentPlan === plan.id}
                                className={`w-full py-3 rounded-xl font-semibold transition-all ${currentPlan === plan.id
                                    ? "bg-muted text-muted-foreground cursor-default"
                                    : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md active:scale-95"
                                    }`}
                            >
                                {currentPlan === plan.id ? "Current Plan" : "Upgrade"}
                            </button>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}