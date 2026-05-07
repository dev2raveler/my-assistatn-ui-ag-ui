"use client";

import { useMemo, useRef, type ReactNode } from "react";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { HttpAgent } from "@ag-ui/client";
import { useAgUiRuntime } from "@assistant-ui/react-ag-ui";

/**
 * AG-UI runtime backed by a single assistant-ui thread.
 */
export function MyRuntimeProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const agentUrl =
    (process.env.NEXT_PUBLIC_AGUI_AGENT_URL as string | undefined) ??
    "http://localhost:8000/agent";

  const threadIdRef = useRef<string>(crypto.randomUUID());

  const agent = useMemo(() => {
    return new HttpAgent({
      url: agentUrl,
      threadId: threadIdRef.current,
      headers: {
        Accept: "text/event-stream",
      },
    });
  }, [agentUrl]);

  const runtime = useAgUiRuntime({
    agent,
    logger: {
      debug: (...a: any[]) => console.debug("[agui]", ...a),
      error: (...a: any[]) => console.error("[agui]", ...a),
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
