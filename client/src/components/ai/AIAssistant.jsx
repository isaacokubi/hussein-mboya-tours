/**
 * Purpose: AIAssistant reusable UI component. Main declarations: AIAssistant, sendMessage.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useState } from "react";
// Load ../../api/aiApi so this module can use its exported dependencies.
import { askAI } from "../../api/aiApi";

// Define AIAssistant; its parameters and body implement this operation.
export default function AIAssistant() {
  // Declare [open, setOpen] for use by the surrounding module or function.
  const [open, setOpen] = useState(false);
  // Declare [message, setMessage] for use by the surrounding module or function.
  const [message, setMessage] = useState("");
  // Declare [messages, setMessages] for use by the surrounding module or function.
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hello 👋 I can help you plan your African adventure." },
  ]);

  // Declare sendMessage for use by the surrounding module or function.
  const sendMessage = async () => {
    // Check the condition (!message.trim()) and run the matching branch.
    if (!message.trim()) return;
    // Declare text for use by the surrounding module or function.
    const text = message;
    // Perform the side effect or state update expressed on the following line.
    setMessages((prev) => [...prev, { role: "user", text }]);
    // Perform the side effect or state update expressed on the following line.
    setMessage("");
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Declare result for use by the surrounding module or function.
      const result = await askAI(text);
      // Perform the side effect or state update expressed on the following line.
      setMessages((prev) => [...prev, { role: "assistant", text: result?.data?.reply || "I can help with your travel plans." }]);
    } catch {
      // Perform the side effect or state update expressed on the following line.
      setMessages((prev) => [...prev, { role: "assistant", text: "Sorry, I am temporarily unavailable." }]);
    }
  };

  // Return the expression shown below to the caller.
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
