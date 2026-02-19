import { useState, useEffect } from "react";
import algosdk from "algosdk";
import { PeraWalletConnect } from "@perawallet/connect";

/* ================= CONFIG ================= */

const peraWallet = new PeraWalletConnect();
const appId = 755774056; // <-- MAKE SURE THIS IS YOUR NEW DEPLOYED ID

const algodClient = new algosdk.Algodv2(
  "",
  "https://testnet-api.algonode.cloud",
  ""
);

const encoder = new TextEncoder();

/* ================= APP ================= */

function App() {
  const [wallet, setWallet] = useState(null);
  const [page, setPage] = useState("consent");
  const [loading, setLoading] = useState(false);

  /* ===== Restore session safely ===== */
  useEffect(() => {
    const restore = async () => {
      const accounts = await peraWallet.reconnectSession();
      if (accounts && accounts.length > 0) {
        setWallet(accounts[0]);
      }
    };
    restore();
  }, []);

  /* ===== Connect ===== */
  const connectWallet = async () => {
    const accounts = await peraWallet.connect();
    if (accounts.length > 0) {
      setWallet(accounts[0]);
    }
  };

  /* ===== Generic Contract Call ===== */
  const callContract = async (action, value = null) => {
    const currentWallet = wallet; // prevent stale state

    if (!currentWallet) {
      alert("Connect wallet first");
      return;
    }

    setLoading(true);

    try {
      console.log("Using wallet:", currentWallet);

      const params = await algodClient.getTransactionParams().do();

      const appArgs = [encoder.encode(action)];
      if (value) {
        appArgs.push(encoder.encode(value));
      }

      const txn = algosdk.makeApplicationNoOpTxnFromObject({
        from: currentWallet,
        appIndex: appId,
        appArgs,
        suggestedParams: params,
      });

      const signed = await peraWallet.signTransaction([
        {
          txn,
          signers: [currentWallet],
        },
      ]);

      // 🔥 FIX: Handle Pera return format safely
      const signedTxn =
        signed[0] instanceof Uint8Array
          ? signed[0]
          : signed[0].blob;

      const { txId } = await algodClient
        .sendRawTransaction(signedTxn)
        .do();

      await algosdk.waitForConfirmation(algodClient, txId, 2);

      alert("Transaction successful");
    } catch (err) {
      console.error("REAL ERROR:", err);
      alert(err?.message || "Transaction failed");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-6">

        <h1 className="text-3xl font-bold text-indigo-700 mb-4">
          ConsentLedger
        </h1>

        {!wallet ? (
          <button
            onClick={connectWallet}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg mb-4"
          >
            Connect Wallet
          </button>
        ) : (
          <p className="text-green-600 mb-4">
            Connected: {wallet.slice(0, 10)}...
          </p>
        )}

        {/* NAVIGATION */}
        <div className="flex gap-3 mb-6">
          <NavButton active={page === "consent"} onClick={() => setPage("consent")}>
            Consent
          </NavButton>
          <NavButton active={page === "audit"} onClick={() => setPage("audit")}>
            Audit
          </NavButton>
        </div>

        {page === "consent" && (
          <ConsentPage callContract={callContract} />
        )}

        {page === "audit" && (
          <AuditPage callContract={callContract} />
        )}

        {loading && <p>Processing transaction...</p>}
      </div>
    </div>
  );
}

/* ================= UI ================= */

function NavButton({ active, children, ...props }) {
  return (
    <button
      {...props}
      className={`px-5 py-2 rounded-lg font-medium ${
        active
          ? "bg-indigo-600 text-white"
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
      className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-indigo-400"
    />
  );
}

/* ================= CONSENT PAGE ================= */

function ConsentPage({ callContract }) {
  const [form, setForm] = useState({
    user_id: "",
    app_id: "",
    data_type: "",
    purpose: "",
    expires_at: ""
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submitConsent = async (e) => {
    e.preventDefault();

    const payload = JSON.stringify(form);
    const hash = btoa(payload).slice(0, 32);

    await callContract("create", hash);

    setForm({
      user_id: "",
      app_id: "",
      data_type: "",
      purpose: "",
      expires_at: ""
    });
  };

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-indigo-700">
        Grant Consent
      </h2>

      <form onSubmit={submitConsent} className="grid gap-3">
        <Input name="user_id" placeholder="User ID" value={form.user_id} onChange={handleChange} required />
        <Input name="app_id" placeholder="App ID" value={form.app_id} onChange={handleChange} required />
        <Input name="data_type" placeholder="Data Type" value={form.data_type} onChange={handleChange} required />
        <Input name="purpose" placeholder="Purpose" value={form.purpose} onChange={handleChange} required />
        <Input type="date" name="expires_at" value={form.expires_at} onChange={handleChange} />

        <button className="bg-indigo-600 text-white py-2 rounded-lg">
          Grant Consent
        </button>
      </form>
    </section>
  );
}

/* ================= AUDIT PAGE ================= */

function AuditPage({ callContract }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-indigo-700">
        Audit Controls
      </h2>

      <button
        onClick={() => callContract("anchor", "audit_hash_demo")}
        className="bg-purple-600 text-white px-4 py-2 rounded-lg"
      >
        Anchor Audit Hash
      </button>

      <button
        onClick={() => callContract("revoke")}
        className="bg-red-600 text-white px-4 py-2 rounded-lg"
      >
        Revoke Consent
      </button>
    </section>
  );
}

export default App;
