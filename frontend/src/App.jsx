import { useState } from "react";

function App() {
  const [form, setForm] = useState({
    user_id: "",
    app_id: "",
    data_type: "",
    purpose: "",
    expires_at: ""
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const submitConsent = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await fetch("http://localhost:4000/consent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
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
    } catch (err) {
      setError("Backend not reachable");
    }
  };

  return (
    <div style={{ padding: "30px", maxWidth: "500px" }}>
      <h1>ConsentLedger</h1>
      <h3>Grant Consent</h3>

      <form onSubmit={submitConsent}>
        <input
          name="user_id"
          placeholder="User ID"
          value={form.user_id}
          onChange={handleChange}
          required
        />
        <br /><br />

        <input
          name="app_id"
          placeholder="App ID"
          value={form.app_id}
          onChange={handleChange}
          required
        />
        <br /><br />

        <input
          name="data_type"
          placeholder="Data Type (e.g. email)"
          value={form.data_type}
          onChange={handleChange}
          required
        />
        <br /><br />

        <input
          name="purpose"
          placeholder="Purpose"
          value={form.purpose}
          onChange={handleChange}
          required
        />
        <br /><br />

        <input
          type="date"
          name="expires_at"
          value={form.expires_at}
          onChange={handleChange}
        />
        <br /><br />

        <button type="submit">Grant Consent</button>
      </form>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default App;
