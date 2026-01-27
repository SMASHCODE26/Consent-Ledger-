// Backend trust boundary
// All consent enforcement must happen here

import express from "express";
import cors from "cors";
import supabase from "./supabaseClient.js";
import appAuth from "./middleware/appAuth.js";

const app = express();
app.use(cors());
app.use(express.json());

/* ---------------- BASIC HEALTH ---------------- */

app.get("/", (req, res) => {
  res.send("ConsentLedger backend running");
});

app.get("/health", async (req, res) => {
  const { data, error } = await supabase
    .from("consents")
    .select("*")
    .limit(1);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ status: "ok", data });
});

/* ---------------- CONSENT MANAGEMENT ---------------- */

app.post("/consent", async (req, res) => {
  const { user_id, app_id, data_type, purpose, expires_at } = req.body;

  if (!user_id || !app_id || !data_type || !purpose) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const { data, error } = await supabase
      .from("consents")
      .insert([
        {
          user_id,
          app_id,
          data_type,
          purpose,
          status: "active",
          expires_at
        }
      ])
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({
      message: "Consent granted",
      consent: data[0]
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


app.post("/_debug", (req, res) => {
  console.log("🔥 DEBUG ROUTE HIT");
  res.json({ ok: true });
});

/* ---------------- DATA ACCESS (REAL ENFORCEMENT) ---------------- */

// app.post("/data-access", appAuth, async (req, res) => {
//   const { user_id, data_type, purpose } = req.body;
//   const app_id = req.app.app_id;

//   if (!user_id || !data_type || !purpose) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   try {
//     // 1️⃣ Fetch active consent (simple & reliable)
//     const { data: consents, error } = await supabase
//       .from("consents")
//       .select("*")
//       .eq("user_id", user_id)
//       .eq("app_id", app_id)
//       .eq("data_type", data_type)
//       .eq("purpose", purpose)
//       .eq("status", "active")
//       .limit(1);

//     if (error) {
//       console.error("Consent query error:", error);
//       return res.status(500).json({ error: "Consent check failed" });
//     }

//     let allowed = false;
//     let reason = "No valid consent";

//     if (consents && consents.length > 0) {
//       const consent = consents[0];

//       // 2️⃣ Expiry check in JS (SAFE)
//       if (!consent.expires_at) {
//         allowed = true;
//       } else if (new Date(consent.expires_at) > new Date()) {
//         allowed = true;
//       } else {
//         reason = "Consent expired";
//       }
//     }

//     // 3️⃣ Log access attempt
//     await supabase.from("access_logs").insert([
//       {
//         user_id,
//         app_id,
//         data_type,
//         purpose,
//         result: allowed ? "allowed" : "denied",
//         reason
//       }
//     ]);

//     if (!allowed) {
//       return res.status(403).json({
//         allowed: false,
//         reason
//       });
//     }

//     res.json({
//       allowed: true,
//       message: "Access granted"
//     });
//   } catch (err) {
//     console.error("Data access error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

app.post("/data-access", appAuth, async (req, res) => {
  const { user_id, data_type, purpose } = req.body;
  const app_id = req.app.app_id;

  console.log("---- DATA ACCESS DEBUG ----");
  console.log("user_id:", user_id);
  console.log("app_id (from auth):", app_id);
  console.log("data_type:", data_type);
  console.log("purpose:", purpose);

  const { data: consents, error } = await supabase
    .from("consents")
    .select("*");

  console.log("ALL CONSENTS IN DB:", consents);

  if (error) {
    console.error("Supabase error:", error);
    return res.status(500).json({ error: "DB error" });
  }

  const matched = consents.find(c =>
    c.user_id === user_id &&
    c.app_id === app_id &&
    c.data_type === data_type &&
    c.purpose === purpose &&
    c.status === "active"
  );

  console.log("MATCHED CONSENT:", matched);

  const allowed = !!matched;

  await supabase.from("access_logs").insert([
    {
      user_id,
      app_id,
      data_type,
      purpose,
      result: allowed ? "allowed" : "denied",
      reason: allowed ? null : "No valid consent"
    }
  ]);

  if (!allowed) {
    return res.status(403).json({
      allowed: false,
      reason: "No valid consent"
    });
  }

  res.json({
    allowed: true,
    message: "Access granted"
  });
});


/* ---------------- REVOKE CONSENT ---------------- */

app.post("/consent/revoke", async (req, res) => {
  const { consent_id } = req.body;

  if (!consent_id) {
    return res.status(400).json({ error: "consent_id is required" });
  }

  try {
    const { data, error } = await supabase
      .from("consents")
      .update({ status: "revoked" })
      .eq("id", consent_id)
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Consent not found" });
    }

    res.json({
      message: "Consent revoked successfully",
      consent: data[0]
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------- AUDIT & TRANSPARENCY ---------------- */

app.get("/consents/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    const { data, error } = await supabase
      .from("consents")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ consents: data });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/logs/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    const { data, error } = await supabase
      .from("access_logs")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ logs: data });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------- SERVER ---------------- */

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
