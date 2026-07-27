import { useState } from "react";
import { MessageCircle, X } from "lucide-react";

const HusseinAIWidget = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}

      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="
          fixed
          bottom-6
          right-6
          z-50
          bg-green-600
          text-white
          rounded-full
          w-16
          h-16
          shadow-xl
          flex
          items-center
          justify-center
          hover:scale-110
          transition
          "
        >
          <MessageCircle size={32} />
        </button>
      )}

      {/* AI PANEL */}

      {open && (
        <div
          className="
          fixed
          right-0
          top-0
          h-screen
          w-full
          md:w-[420px]
          bg-white
          shadow-2xl
          z-50
          flex
          flex-col
          "
        >
          {/* Header */}

          <div
            className="
            flex
            justify-between
            items-center
            bg-green-700
            text-white
            p-4
            "
          >
            <div>
              <h2 className="font-bold text-lg">Hussein AI Assistant</h2>

              <p className="text-sm">Your travel companion</p>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="
              hover:bg-green-800
              p-2
              rounded
              "
            >
              <X size={25} />
            </button>
          </div>

          {/* AI CONTENT */}

          <div className="flex-1 p-5 overflow-y-auto">
            <div className="bg-gray-100 rounded-lg p-4">
              <p>👋 Hello, I am Hussein AI.</p>

              <p className="mt-2">Ask me about:</p>

              <ul className="mt-3 space-y-2">
                <li>🦁 Safari destinations</li>

                <li>🏨 Hotels in Kenya</li>

                <li>✈️ Travel planning</li>

                <li>💰 Trip budgets</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HusseinAIWidget;
