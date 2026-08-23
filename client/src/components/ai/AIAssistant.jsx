import { useState } from "react";
import { askAI } from "../../api/aiApi";

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hello 👋 I can help you plan your African adventure." },
  ]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    const text = message;
    setMessages((prev) => [...prev, { role: "user", text }]);
    setMessage("");
    try {
      const result = await askAI(text);
      setMessages((prev) => [...prev, { role: "assistant", text: result?.data?.reply || "I can help with your travel plans." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Sorry, I am temporarily unavailable." }]);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 flex h-96 w-80 flex-col rounded-xl bg-white shadow-xl">
          <div className="rounded-t-xl bg-green-700 p-3 text-white">AI Travel Assistant</div>
          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {messages.map((item, index) => (
              <div key={index} className={item.role === "user" ? "text-right" : "text-left"}>
                <span className="inline-block rounded-lg bg-gray-100 p-2 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 p-2">
            <input value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }} className="flex-1 rounded border p-2" />
            <button onClick={sendMessage} className="rounded bg-green-700 px-3 text-white">Send</button>
          </div>
        </div>
      )}
      <button onClick={() => setOpen((value) => !value)} className="h-14 w-14 rounded-full bg-green-700 text-white shadow-lg">🤖</button>
    </div>
  );
}
