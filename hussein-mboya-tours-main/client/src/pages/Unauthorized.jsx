import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow p-8 text-center">
        <h1 className="text-3xl font-bold mb-3">Access denied</h1>
        <p className="text-gray-600 mb-6">
          Your account does not have permission to open this page.
        </p>
        <Link to="/" className="inline-block px-5 py-3 rounded-lg bg-blue-600 text-white">
          Go home
        </Link>
      </div>
    </div>
  );
}
