import { useState } from 'react'


function App() {
  
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  
  const handleAsk = async () => {
    setError("");
    setAnswer("");
    const q = question.trim();
    if (!q) {
      setError("Please enter a question.");
      return;
    }
    setLoading(true);
    try {
      // Call your Spring Boot endpoint
      const res = await fetch(`/api/chat/ask?question=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const text = await res.text();
      setAnswer(text);
    } catch (e) {
      setError("Could not fetch the answer. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 font-sans">
      <h1 className="text-3xl font-bold mb-4 text-center">Ask me Anything</h1>
      <textarea
        rows={3}
        className="w-full p-3 border rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Type your question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <button
        onClick={handleAsk}
        disabled={loading}
        className="mt-4 w-full bg-sky-300 text-white py-2 rounded-md hover:bg-sky-400 disabled:bg-gray-400"
      >
        {loading ? "Thinking..." : "Ask"}
      </button>
      <div className="mt-6 p-4 border rounded-md bg-gray-50 min-h-[100px]">
        {answer || "Your answer will appear here."}
      </div>
    </div>
  );

}

export default App
