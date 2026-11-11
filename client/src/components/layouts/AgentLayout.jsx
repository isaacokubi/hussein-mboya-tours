/**
 * Purpose: Agent Layout reusable UI component. Main declarations: AgentLayout.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { Outlet } from "react-router-dom";

// Load ../agent/AgentSidebar so this module can use its exported dependencies.
import AgentSidebar from "../agent/AgentSidebar";
// Load ../agent/AgentHeader so this module can use its exported dependencies.
import AgentHeader from "../agent/AgentHeader";

// Define AgentLayout; its parameters and body implement this operation.
export default function AgentLayout() {
  // Return the expression shown below to the caller.
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
