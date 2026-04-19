import Vapi from "@vapi-ai/web";

// Safe browser-only singleton — never runs on the server
let vapiInstance: Vapi | null = null;

export function getVapi(): Vapi {
    if (typeof window === "undefined") {
        throw new Error("Vapi can only be used in the browser");
    }

    if (!vapiInstance) {
        const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY;
        if (!apiKey) {
            throw new Error(
                "NEXT_PUBLIC_VAPI_API_KEY is missing. Check your .env file."
            );
        }

        // Vapi v2 initialization takes the Public Key as a string.
        // Wrapping it in an object { apiKey } is only for Server SDKs.
        if (!apiKey.startsWith("pub_")) {
            console.warn(
                "[Vapi] The API key does not start with 'pub_'. Ensure you are using a Public Key from the Vapi dashboard."
            );
        }

        console.log("[Vapi] Initializing with key:", apiKey.slice(0, 8) + "...");

        // Standard Web SDK v2 initialization uses the string token directly.
        vapiInstance = new Vapi(apiKey);
    }

    return vapiInstance;
}