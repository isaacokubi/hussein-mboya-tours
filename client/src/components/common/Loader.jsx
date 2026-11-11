/**
 * Purpose: Loader reusable UI component. Main declarations: Loader.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
export default function Loader() {
  // Return the expression shown below to the caller.
  return (
    <div className="
      min-h-screen
      flex
      items-center
      justify-center
    ">

      <div className="
        w-12
        h-12
        border-4
        border-green-600
        border-t-transparent
        rounded-full
        animate-spin
      " />

    </div>
  );
}
