"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import NavBar from "@/components/NavBar";
import { CreditCard, Lock, ArrowLeft, Loader2 } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { toast } from "sonner";

function PaymentContent() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    const planId = searchParams.get("plan") || "PRO";

    const [isProcessing, setIsProcessing] = useState(false);
    const [formData, setFormData] = useState({
        cardNumber: "",
        expiry: "",
        cvv: "",
        cardholderName: ""
    });

    useEffect(() => {
        if (isLoaded && !user) {
            router.push("/");
        }
    }, [isLoaded, user, router]);

    if (!isLoaded || !user) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (formData.cardNumber.length < 16 || formData.expiry.length < 4 || formData.cvv.length < 3 || !formData.cardholderName) {
            toast.error("Please fill in all fields correctly.");
            return;
        }

        setIsProcessing(true);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simulate success
        localStorage.setItem("userPlan", planId);
        toast.success(`Successfully upgraded to ${planId}!`);

        setIsProcessing(false);
        router.push("/dashboard");
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <NavBar />
            <main className="max-w-xl mx-auto px-6 py-8 pt-24">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to plans</span>
                </button>

                <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-bold">Secure Payment</h1>
                            <p className="text-sm text-muted-foreground">Upgrade for {planId} access</p>
                        </div>
                        <div className="bg-primary/10 p-3 rounded-full">
                            <Lock className="w-6 h-6 text-primary" />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Cardholder Name</label>
                            <input
                                type="text"
                                name="cardholderName"
                                placeholder="John Doe"
                                required
                                value={formData.cardholderName}
                                onChange={handleInputChange}
                                className="w-full bg-background border border-border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Card Number</label>
                            <div className="relative">
                                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    name="cardNumber"
                                    placeholder="4444 4444 4444 4444"
                                    maxLength={16}
                                    required
                                    value={formData.cardNumber}
                                    onChange={handleInputChange}
                                    className="w-full bg-background border border-border pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Expiry Date</label>
                                <input
                                    type="text"
                                    name="expiry"
                                    placeholder="MM/YY"
                                    maxLength={5}
                                    required
                                    value={formData.expiry}
                                    onChange={handleInputChange}
                                    className="w-full bg-background border border-border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">CVV</label>
                                <input
                                    type="password"
                                    name="cvv"
                                    placeholder="123"
                                    maxLength={3}
                                    required
                                    value={formData.cvv}
                                    onChange={handleInputChange}
                                    className="w-full bg-background border border-border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isProcessing}
                                className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <span>Pay Now</span>
                                )}
                            </button>
                        </div>

                        <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
                            <Lock className="w-3 h-3" />
                            Your payment is secured with bank-level encryption
                        </p>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default function PaymentPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PaymentContent />
        </Suspense>
    );
}
