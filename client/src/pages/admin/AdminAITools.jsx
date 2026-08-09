import HusseinAIWidget from "../../components/HusseinAIWidget";

export default function AdminAITools() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-3">AI Tools</h1>
      <p className="text-gray-600 mb-6">Use the connected AI assistant for operational questions and customer support workflows.</p>
      <HusseinAIWidget />
    </div>
  );
}
