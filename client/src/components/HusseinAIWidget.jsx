// client/src/components/HusseinAIWidget.jsx
import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { askTravelAI } from "../api/aiApi";

const HusseinAIWidget = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "👋 Hello, I am Hussein AI. How can I help plan your trip?" },
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;
    const userMessage = { role: "user", text: message };
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    try {
      setLoading(true);
      const data = await askTravelAI(message);
      const reply = data?.data?.reply || "I can help you plan your journey.";
      setMessages((prev) => [...prev, {
        role: "assistant",
        text: reply,
        booking: reply.includes("Tour ID:"),
        tourId: reply.match(/Tour ID:\s*([a-f0-9]+)/i)?.[1],
        bookingId: reply.match(/Booking ID:\s*([a-f0-9]+)/i)?.[1],
      }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Sorry, I am unavailable right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)} className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-white shadow-xl transition hover:scale-110">
          <MessageCircle size={32} />
        </button>
      )}
      {open && (
        <div className="fixed right-0 top-0 z-50 flex h-screen w-full flex-col bg-white shadow-2xl md:w-[420px]">
          <div className="flex items-center justify-between bg-green-700 p-4 text-white">
            <div><h2 className="text-lg font-bold">Hussein AI Assistant</h2><p className="text-sm">Your travel companion</p></div>
            <button onClick={() => setOpen(false)} className="rounded p-2 hover:bg-green-800"><X size={25} /></button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-5">
            {messages.map((msg, index) => (
              <div key={index} className={`max-w-[85%] rounded-lg p-3 ${msg.role === "user" ? "ml-auto bg-green-600 text-white" : "bg-gray-100"}`}>
                {msg.text}
                {msg.booking && (
                  <button onClick={() => { window.location.href = msg.bookingId ? `/checkout/booking/${msg.bookingId}` : msg.tourId ? `/checkout/tour/${msg.tourId}` : "/tours"; }} className="mt-3 rounded-lg bg-green-600 px-4 py-2 text-sm text-white">Continue Booking</button>
                )}
              </div>
            ))}
            {loading && <div className="rounded-lg bg-gray-100 p-3">Hussein AI is typing...</div>}
          </div>
          <div className="flex gap-2 border-t p-3">
            <input value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }} placeholder="Ask Hussein AI about tours..." className="flex-1 rounded-lg border px-3" />
            <button onClick={sendMessage} className="rounded-lg bg-green-600 px-4 text-white"><Send size={20} /></button>
          </div>
        </div>
      )}
    </>
  );
};

export default HusseinAIWidget;
