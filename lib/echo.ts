// Client-side only Laravel Echo configuration
// This file is only imported on the client side to avoid SSR issues

let echo: any = null;
let isInitialized = false;

// Declare Pusher on window for Laravel Echo
declare global {
  interface Window {
    Pusher: any;
    Echo: any;
  }
}

export async function initializeEcho(accessToken?: string): Promise<any> {
  if (typeof window === "undefined" || isInitialized) {
    return echo;
  }

  try {
    // Dynamic imports to avoid SSR issues
    const Echo = (await import("laravel-echo")).default;
    const Pusher = (await import("pusher-js")).default;

    // Set Pusher on window for Laravel Echo
    window.Pusher = Pusher;

    // Create Echo instance
    echo = new Echo({
      broadcaster: "reverb",
      key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || "bumpa-app-key",
      wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || "reverb",
      wsPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || "8080"),
      wssPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || "8080"),
      forceTLS: false,
      enabledTransports: ["ws"],
      authEndpoint: process.env.NEXT_PUBLIC_REVERB_AUTH_ENDPOINT || "/api/v1/broadcasting/auth",
      auth: {
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : "",
        },
      },
    });

    // Set Echo on window for global access
    window.Echo = echo;
    isInitialized = true;

    return echo;
  } catch (error) {
    console.error("Echo initialization error:", error);
    return null;
  }
}
