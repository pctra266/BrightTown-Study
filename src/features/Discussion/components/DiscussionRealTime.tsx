import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { db } from "../../Auth/services/firebase";
import { ref, onValue, push, set } from "firebase/database";

interface Message { id: string; text: string; timestamp: number; }

export default function DiscussionRealTime() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const messagesRef = ref(db, "messages");

        const unsubscribe = onValue(messagesRef, (snapshot) => {
            const data = snapshot.val();
            let loaded: Message[] = data
                ? Object.entries(data).map(([id, v]) => ({
                    id,
                    text: (v as any).text,
                    timestamp: (v as any).timestamp,
                }))
                : [];

            // sort oldest -> newest
            loaded.sort((a, b) => a.timestamp - b.timestamp);

            // If more than 20 messages, delete the oldest ones
            if (loaded.length > 20) {
                const extra = loaded.length - 20;
                const toDelete = loaded.slice(0, extra); // oldest extra messages
                toDelete.forEach((msg) => {
                    const msgRef = ref(db, `messages/${msg.id}`);
                    set(msgRef, null); // delete
                });
                // Keep only the latest 20 for display
                loaded = loaded.slice(extra);
            }

            setMessages(loaded);
        });

        return () => unsubscribe();
    }, []);


    // Scroll to bottom whenever messages change OR when the chat is opened
    useLayoutEffect(() => {
        if (!isOpen) return; // only scroll when visible
        const el = containerRef.current;
        if (!el) return;
        // run after layout — requestAnimationFrame is extra-safe
        requestAnimationFrame(() => {
            el.scrollTop = el.scrollHeight; // instant jump (no animation)
        });
    }, [messages, isOpen]);

    const sendMessage = async () => {
        if (!text.trim()) return;
        const messagesRef = ref(db, "messages");
        const newMessageRef = push(messagesRef);
        await set(newMessageRef, { text, timestamp: Date.now() });
        setText("");
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed z-50 bottom-6 right-6 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition"
            >
                💬 Chat
            </button>

            {/* Chat Box */}
            {isOpen && (
                <div className="fixed z-50 bottom-20 right-6 w-80 bg-white border border-blue-300 rounded-lg shadow-lg flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="bg-blue-600 text-white px-4 py-2 font-semibold flex justify-between items-center">
                        <span>Messages</span>
                        <button onClick={() => setIsOpen(false)}>✖</button>
                    </div>

                    {/* Messages List */}
                    <div ref={containerRef} className="flex-1 p-4 overflow-y-auto space-y-2 max-h-60">
                        {messages.map((m) => (
                            <div
                                key={m.id}
                                className="bg-blue-100 text-blue-900 px-3 py-2 rounded-md"
                            >
                                {m.text}
                            </div>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="p-2 border-t border-blue-200 flex">
                        <input
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage();
                                }
                            }}
                            placeholder="Type message..."
                            className="flex-1 border border-blue-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />

                        <button
                            onClick={sendMessage}
                            className="z-50 bg-blue-600 text-white px-4 rounded-r-md hover:bg-blue-700"
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
