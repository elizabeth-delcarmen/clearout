import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useListings } from "@/hooks/useListings";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Should I relist anything tonight?",
  "Which items are underperforming?",
  "What's my best time to upload?",
  "Am I being throttled?",
];

export function AdvisorTab() {
  const { listings } = useListings();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text.trim() }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("advisor", {
        body: { messages: next, listings },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      toast.error(msg);
      setMessages([...next, { role: "assistant", content: "Sorry — I hit an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-150px)]">
      <div className="flex-1 overflow-y-auto safe-x py-4 min-w-0">
        <div className="rounded-[12px] bg-primary/10 p-3.5 mb-4">
          <div className="text-[13px] font-bold text-primary font-sans-ui">🤖 AI Advisor</div>
          <div className="text-[12px] text-muted-foreground font-sans-ui leading-relaxed mt-1">
            Asks questions based on your actual logged data — not generic tips. The more you log, the smarter the answers.
          </div>
        </div>

        {messages.length === 0 ? (
          <div className="space-y-2.5">
            <div className="text-[11px] font-bold uppercase tracking-[1px] text-muted-foreground font-sans-ui mb-2">
              Ask me anything about your listings
            </div>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="w-full text-left bg-card border-[1.5px] border-border rounded-[12px] px-3.5 py-3 text-[13px] font-medium font-sans-ui hover:border-primary transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] px-3.5 py-2.5 font-sans-ui text-[14px] leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "self-end bg-primary text-primary-foreground rounded-[14px_14px_4px_14px]"
                    : "self-start bg-card border-[1.5px] border-border rounded-[14px_14px_14px_4px]"
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="self-start bg-card border-[1.5px] border-border rounded-[14px_14px_14px_4px] px-3.5 py-2.5 text-[14px] text-muted-foreground font-sans-ui">
                Thinking…
              </div>
            )}
            <div ref={endRef} />
          </div>
        )}
      </div>

      <div className="sticky bottom-0 bg-background pt-2 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pb-[calc(1rem+env(safe-area-inset-bottom))] flex gap-2 border-t border-border">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send(input);
          }}
          placeholder="Ask about your listings…"
          className="flex-1 rounded-[12px] border-[1.5px] border-border bg-card px-3.5 py-2.5 text-[14px] font-sans-ui focus:border-primary focus:outline-none"
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || loading}
          className={`rounded-[12px] px-4 py-2.5 text-[14px] font-bold font-sans-ui ${
            !input.trim() || loading ? "bg-[#ccc] text-white cursor-not-allowed" : "bg-primary text-primary-foreground"
          }`}
        >
          →
        </button>
      </div>
    </div>
  );
}