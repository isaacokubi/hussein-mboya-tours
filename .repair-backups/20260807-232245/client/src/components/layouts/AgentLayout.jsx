import { Outlet } from "react-router-dom";

import AgentSidebar from "../agent/AgentSidebar";
import AgentHeader from "../components/agent/AgentHeader";

export default function AgentLayout() {
  return (
    <div
      className="
      flex
      min-h-screen
      bg-gray-100
      "
    >
      {/* Sidebar */}

      <AgentSidebar />

      {/* Content */}

      <div
        className="
        flex
        flex-col
        flex-1
        min-w-0
        "
      >
        {/* Header */}

        <div
          className="
          sticky
          top-0
          z-30
          bg-white
          shadow-sm
          "
        >
          <AgentHeader />
        </div>

        {/* Main */}

        <main
          className="
          flex-1
          overflow-y-auto
          p-6
          lg:p-8
          "
        >
          <div
            className="
            max-w-7xl
            mx-auto
            "
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}