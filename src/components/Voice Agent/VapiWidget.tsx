"use client";

import { useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";
import { useUser } from "@clerk/nextjs";
import { Send, Mic, MicOff, Loader2 } from "lucide-react";

interface ChatMessage {
    role: "user" | "assistant" | "system";
    content: string;
}

export default function VapiWidget() {
    const { user } = useUser();
    const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState("");
    const [partialTranscript, setPartialTranscript] = useState("");

    const vapiRef = useRef<Vapi | null>(null);
    const isInitialized = useRef(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, partialTranscript]);

    useEffect(() => {
        if (isInitialized.current) return;
        isInitialized.current = true;

        const token = process.env.NEXT_PUBLIC_VAPI_TOKEN || process.env.NEXT_PUBLIC_VAPI_API_KEY;
        const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

        if (!token) {
            setStatus("error");
            setErrorMessage("Vapi token is missing.");
            return;
        }
        if (!assistantId) {
            setStatus("error");
            setErrorMessage("Vapi Assistant ID is missing.");
            return;
        }

        try {
            const vapi = new Vapi(token);
            vapiRef.current = vapi;

            vapi.on("call-start", () => {
                setStatus("connected");
                setErrorMessage(null);
                setMessages([{ role: "assistant", content: "Hello! I am your AI health assistant. How can I help you today?" }]);
            });

            vapi.on("call-end", () => {
                setStatus("idle");
                setPartialTranscript("");
            });

            vapi.on("message", (msg: any) => {
                console.log("[Vapi Event]", msg.type, msg);
                if (msg.type === "transcript") {
                    if (msg.transcriptType === "partial") {
                        setPartialTranscript(msg.transcript);
                    } else if (msg.transcriptType === "final") {
                        setPartialTranscript("");
                        setMessages((prev) => [...prev, { role: msg.role === "assistant" ? "assistant" : "user", content: msg.transcript }]);
                    }
                }

                // Show feedback when VAPI executes server-side function tools
                if (msg.type === "function-call") {
                    const fnName = msg.functionCall?.name;
                    if (fnName === "book_appointment" || fnName === "bookAppointment") {
                        setMessages((prev) => [...prev, { role: "system", content: "📋 Booking your appointment..." }]);
                    } else if (fnName === "get_available_doctors" || fnName === "getAvailableDoctors") {
                        setMessages((prev) => [...prev, { role: "system", content: "🔍 Finding available doctors..." }]);
                    } else if (fnName === "get_available_slots" || fnName === "getAvailableSlots") {
                        setMessages((prev) => [...prev, { role: "system", content: "📅 Checking available time slots..." }]);
                    }
                }

                // Show function result feedback
                if (msg.type === "function-call-result") {
                    const result = msg.functionCallResult;
                    if (result?.forwardToClientEnabled === false || !result) return;
                    // Results are handled by the AI's spoken response
                }
            });

            vapi.on("error", (err: any) => {
                let msg = "An unexpected error occurred.";
                if (typeof err === "string") msg = err;
                else if (err instanceof Error) msg = err.message;
                else if (err && typeof err === "object") msg = String(err.message || err.error || JSON.stringify(err));
                if (msg === "{}" || !msg) msg = "Connection failed.";

                setStatus("error");
                setErrorMessage(msg);
            });

        } catch (err) {
            setStatus("error");
            setErrorMessage(err instanceof Error ? err.message : "Failed to initialize.");
        }

        return () => {
            vapiRef.current?.stop();
            vapiRef.current?.removeAllListeners();
            vapiRef.current = null;
        };
    }, []);

    const toggleCall = () => {
        if (status === "connected") {
            vapiRef.current?.stop();
        } else {
            setStatus("connecting");
            const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
            vapiRef.current?.start(assistantId!, {
                variableValues: {
                    userName: user?.firstName || "Patient",
                    clerkUserId: user?.id || "",
                }
            }).catch((err) => {
                setStatus("error");
                setErrorMessage(String(err));
            });
        }
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || status !== "connected") return;

        // Vapi SDK provides send method for text inputs to trigger the AI
        vapiRef.current?.send({
            type: "add-message",
            message: {
                role: "user",
                content: inputText
            }
        });

        setMessages((prev) => [...prev, { role: "user", content: inputText }]);
        setInputText("");
    };

    if (status === "error") {
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-3xl">
                <p className="text-red-700 font-bold mb-2">Voice Assistant Error</p>
                <p className="text-sm text-red-600 mb-4">{errorMessage}</p>
                <button onClick={() => window.location.reload()} className="text-sm border p-2 rounded-lg bg-white">Reload Page</button>
            </div>
        );
    }

    return (
        <div className="flex flex-col bg-card border border-border rounded-3xl shadow-xl overflow-hidden h-[600px]">
            {/* Header */}
            <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                        JARVIS Assistant
                        {status === "connected" && <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span>}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        {status === "connecting" ? "Connecting..." : status === "connected" ? "Listening & Ready" : "Idle - Click mic to start"}
                    </p>
                </div>
                <button
                    onClick={toggleCall}
                    disabled={status === "connecting"}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${status === "connected"
                        ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                        : "bg-primary text-primary-foreground hover:opacity-90"
                        }`}
                >
                    {status === "connecting" ? <Loader2 className="w-4 h-4 animate-spin" /> :
                        status === "connected" ? <><MicOff className="w-4 h-4" /> Stop AI</> :
                            <><Mic className="w-4 h-4" /> Start JARVIS</>}
                </button>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-4 bg-muted/10">
                {messages.length === 0 && status !== "connected" && (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                        <Mic className="w-12 h-12 mb-4" />
                        <p>Start JARVIS to begin voice or text chat</p>
                    </div>
                )}

                {messages.map((m, i) => (
                    <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : m.role === "system" ? "items-center" : "items-start"}`}>
                        <div className={`
                            px-4 py-2.5 max-w-[80%] rounded-2xl text-sm shadow-sm
                            ${m.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" :
                                m.role === "system" ? "bg-muted text-muted-foreground text-xs font-mono shadow-none italic rounded-full px-6" :
                                    "bg-card border border-border rounded-bl-sm"}
                        `}>
                            {m.content}
                        </div>
                    </div>
                ))}

                {/* Partial Transcript typing indicator */}
                {partialTranscript && (
                    <div className="flex flex-col items-end">
                        <div className="px-4 py-2.5 max-w-[80%] bg-primary/20 text-foreground rounded-2xl border border-primary/30 rounded-br-sm italic text-sm">
                            {partialTranscript}
                            <span className="animate-pulse ml-1">...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-card border-t border-border flex items-center gap-2">
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={status === "connected" ? "Type a message or just speak..." : "Start JARVIS to chat"}
                    disabled={status !== "connected"}
                    className="flex-1 bg-muted/50 border border-border rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={!inputText.trim() || status !== "connected"}
                    className="p-3 bg-primary text-primary-foreground rounded-full disabled:opacity-50 hover:opacity-90 transition-opacity"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
}