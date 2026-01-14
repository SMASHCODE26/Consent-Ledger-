import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

/* ================= APP ROOT ================= */

function App() {
  const [page, setPage] = useState("consent");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-6">
        <h1 className="text-3xl font-bold text-indigo-700 mb-1">
          ConsentLedger
        </h1>
        <p className="text-gray-600 mb-6">
          Decentralized Consent & Data Usage Tracker
        </p>

        {/* NAVIGATION */}
        <div className="flex gap-3 mb-8">
          <NavButton active={page === "consent"} onClick={() => setPage("consent")}>
            Consent
          </NavButton>
          <NavButton active={page === "access"} onClick={() => setPage("access")}>
            App Access
          </NavButton>
          <NavButton active={page === "audit"} onClick={() => setPage("audit")}>
            Audit
          </NavButton>
        </div>

        {page === "consent" && <ConsentPage />}
        {page === "access" && <AccessPage />}
        {page === "audit" && <AuditPage />}
      </div>
    </div>
  );
}

/* ================= SHARED UI ================= */

function NavButton({ active, children, ...props }) {
  return (
    <button
      {...props}
      className={`px-5 py-2 rounded-lg font-medium transition ${
        active
          ? "bg-indigo-600 text-white shadow"
          : "bg-gray-200 hover:bg-gray-300"
      }`}
    >
      {children}
    </button>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
    />
  );
}

/* ================= CONSENT PAGE ================= */

function ConsentPage() {
  const [form, setForm] = useState({
    user_id: "",
    app_id: "",
    data_type: "",
    purpose: "",
    expires_at: ""
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submitConsent = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await fetch("http://localhost:4000/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setMessage("Consent granted successfully");
      setForm({
        user_id: "",
        app_id: "",
        data_type: "",
        purpose: "",
        expires_at: ""
      });
    } catch {
      setError("Backend not reachable");
    }
  };

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-indigo-700">
        Grant User Consent
      </h2>

      <form onSubmit={submitConsent} className="grid gap-3">
        <Input name="user_id" placeholder="User ID" value={form.user_id} onChange={handleChange} required />
        <Input name="app_id" placeholder="App ID" value={form.app_id} onChange={handleChange} required />
        <Input name="data_type" placeholder="Data Type (email, phone)" value={form.data_type} onChange={handleChange} required />
        <Input name="purpose" placeholder="Purpose" value={form.purpose} onChange={handleChange} required />
        <Input type="date" name="expires_at" value={form.expires_at} onChange={handleChange} />

        <button className="bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
          Grant Consent
        </button>
      </form>

      {message && <p className="text-green-600">{message}</p>}
      {error && <p className="text-red-600">{error}</p>}
    </section>
  );
}

/* ================= APP ACCESS PAGE ================= */

function AccessPage() {
  const [form, setForm] = useState({
    user_id: "",
    app_id: "",
    data_type: "",
    purpose: ""
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const requestAccess = async (e) => {
    e.preventDefault();
    setResult(null);

    const res = await fetch("http://localhost:4000/data-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const data = await res.json();
    setResult(data);
  };

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-indigo-700">
        Simulated App Data Request
      </h2>

      <form onSubmit={requestAccess} className="grid gap-3">
        <Input name="user_id" placeholder="User ID" value={form.user_id} onChange={handleChange} required />
        <Input name="app_id" placeholder="App ID" value={form.app_id} onChange={handleChange} required />
        <Input name="data_type" placeholder="Data Type" value={form.data_type} onChange={handleChange} required />
        <Input name="purpose" placeholder="Purpose" value={form.purpose} onChange={handleChange} required />

        <button className="bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
          Request Access
        </button>
      </form>

      {result && (
        <p
          className={`font-semibold ${
            result.allowed ? "text-green-600" : "text-red-600"
          }`}
        >
          {result.allowed ? "Access Granted" : "Access Denied"}
        </p>
      )}
    </section>
  );
}

/* ================= AUDIT PAGE ================= */

function AuditPage() {
  const [userId, setUserId] = useState("");
  const [consents, setConsents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadAudit = async () => {
    if (!userId) return;

    setLoading(true);

    const consentsRes = await fetch(`http://localhost:4000/consents/${userId}`);
    const logsRes = await fetch(`http://localhost:4000/logs/${userId}`);

    const consentsData = await consentsRes.json();
    const logsData = await logsRes.json();

    setConsents(consentsData.consents || []);
    setLogs(logsData.logs || []);
    setLoading(false);
  };

  const revokeConsent = async (consentId) => {
    await fetch("http://localhost:4000/consent/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ consent_id: consentId })
    });
    loadAudit();
  };

  /* ===== CHART DATA ===== */
  const allowedCount = logs.filter(l => l.result === "allowed").length;
  const deniedCount = logs.filter(l => l.result === "denied").length;

  const chartData = [
    { name: "Allowed", value: allowedCount },
    { name: "Denied", value: deniedCount }
  ];

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold text-indigo-700">
        Transparency & Audit Dashboard
      </h2>

      <div className="flex gap-2">
        <Input
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <button
          onClick={loadAudit}
          className="bg-indigo-600 text-white px-4 rounded-lg"
        >
          Load
        </button>
      </div>

      {loading && <p>Loading...</p>}

      {/* ===== CHART ===== */}
      <div className="bg-indigo-50 p-4 rounded-lg border">
        <h3 className="font-semibold mb-2">Access Summary</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#4f46e5" />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-sm text-gray-600 mt-2">
          Allowed vs Denied access attempts
        </p>
      </div>

      {/* ===== CONSENTS TABLE ===== */}
      <div>
        <h3 className="font-semibold mb-2">Consents</h3>
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">App</th>
              <th className="border p-2">Data</th>
              <th className="border p-2">Purpose</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {consents.map(c => (
              <tr key={c.id}>
                <td className="border p-2">{c.app_id}</td>
                <td className="border p-2">{c.data_type}</td>
                <td className="border p-2">{c.purpose}</td>
                <td className="border p-2">{c.status}</td>
                <td className="border p-2">
                  {c.status === "active" ? (
                    <button
                      onClick={() => revokeConsent(c.id)}
                      className="text-red-600 hover:underline"
                    >
                      Revoke
                    </button>
                  ) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== LOGS TABLE ===== */}
      <div>
        <h3 className="font-semibold mb-2">Access Logs</h3>
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">App</th>
              <th className="border p-2">Data</th>
              <th className="border p-2">Purpose</th>
              <th className="border p-2">Result</th>
              <th className="border p-2">Time (IST)</th>
              <th className="border p-2">Hash</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(l => (
              <tr key={l.id}>
                <td className="border p-2">{l.app_id}</td>
                <td className="border p-2">{l.data_type}</td>
                <td className="border p-2">{l.purpose}</td>
                <td className={`border p-2 font-semibold ${l.result === "allowed" ? "text-green-600" : "text-red-600"}`}>
                  {l.result}
                </td>
                <td className="border p-2">
                  {new Date(l.created_at).toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata"
                  })}{" "}
                  (IST)
                </td>
                <td className="border p-2 text-xs break-all text-gray-600">
                  {l.log_hash?.slice(0, 14)}…
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default App;
