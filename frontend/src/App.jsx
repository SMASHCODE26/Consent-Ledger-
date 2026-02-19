import { useState } from "react";
import algosdk from "algosdk";
import { PeraWalletConnect } from "@perawallet/connect";
import contract from "./AlgoConsent.json";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

/* ================= BLOCKCHAIN CONFIG ================= */

const peraWallet = new PeraWalletConnect();
const appId = 755774056;

const algodClient = new algosdk.Algodv2(
  "",
  "https://testnet-api.algonode.cloud",
  ""
);

const encoder = new TextEncoder();

/* ================= APP ROOT ================= */

function App() {
  const [page, setPage] = useState("consent");
  const [wallet, setWallet] = useState(null);

  const connectWallet = async () => {
  try {
    await peraWallet.disconnect(); // reset old session
  } catch {}

  const accounts = await peraWallet.connect();
  setWallet(accounts[0]);
};


  const callContract = async (method, args = []) => {
  if (!wallet) return alert("Connect wallet first");

  const suggestedParams = await algodClient.getTransactionParams().do();

  const atc = new algosdk.AtomicTransactionComposer();

  const abiMethod = new algosdk.ABIMethod({
    name: method,
    args:
      method === "revoke_consent"
        ? []
        : [{ type: "string", name: "value" }],
    returns:
      method === "get_consent_status"
        ? { type: "uint64" }
        : { type: "string" },
  });

  atc.addMethodCall({
    appID: appId,
    method: abiMethod,
    methodArgs: args,
    sender: wallet,
    suggestedParams,
    signer: async (txnGroup) => {
      const signedTxns = await peraWallet.signTransaction([
        {
          txn: txnGroup[0].txn,
          signers: [wallet],
        },
      ]);
      return signedTxns;
    },
  });

  await atc.execute(algodClient, 2);
};







  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-6">
        <h1 className="text-3xl font-bold text-indigo-700 mb-1">
          ConsentLedger
        </h1>
        <p className="text-gray-600 mb-4">
          Decentralized Consent & Data Usage Tracker
        </p>

        {wallet ? (
          <p className="text-green-600 text-sm mb-4">
            Connected: {wallet}...
          </p>
        ) : (
          <button
            onClick={connectWallet}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg mb-4"
          >
            Connect Wallet
          </button>
        )}

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

        {page === "consent" && <ConsentPage callContract={callContract} />}
        {page === "access" && <AccessPage />}
        {page === "audit" && <AuditPage callContract={callContract} />}
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

function ConsentPage({ callContract }) {
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
      // Simple demo hash from form data
      const payload = JSON.stringify(form);
      const hash = btoa(payload).slice(0, 32);

      await callContract("create_consent", [hash]);

      setMessage("Consent granted & anchored on-chain");
      setForm({
        user_id: "",
        app_id: "",
        data_type: "",
        purpose: "",
        expires_at: ""
      });
    } catch (err) {
      setError("Transaction failed");
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
        <Input name="data_type" placeholder="Data Type" value={form.data_type} onChange={handleChange} required />
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

/* ================= ACCESS PAGE ================= */

function AccessPage() {
  return (
    <section>
      <h2 className="text-xl font-semibold text-indigo-700">
        Access Controlled On-Chain
      </h2>
      <p className="text-gray-600">
        Data access decisions are enforced by Algorand smart contract state.
      </p>
    </section>
  );
}

/* ================= AUDIT PAGE ================= */

function AuditPage({ callContract }) {
  const anchorAudit = async () => {
    await callContract("anchor_audit_hash", ["audit_hash_demo"]);
    alert("Audit hash anchored on-chain");
  };

  const revoke = async () => {
    await callContract("revoke_consent");
    alert("Consent revoked on-chain");
  };

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-indigo-700">
        Audit Controls
      </h2>

      <button
        onClick={anchorAudit}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
      >
        Anchor Audit Hash
      </button>

      <button
        onClick={revoke}
        className="bg-red-600 text-white px-4 py-2 rounded-lg"
      >
        Revoke Consent
      </button>
    </section>
  );
}

export default App;
