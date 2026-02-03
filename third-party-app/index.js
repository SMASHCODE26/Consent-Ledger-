import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());


// app.get("/ping", (req, res) => {
//   console.log("🏓 PING HIT");
//   res.json({ ok: true });
// });

// app.post("/use-user-data", async (req, res) => {
//   console.log("🚀 Third-party route HIT");
//   console.log("Request body:", req.body);
// });
// app.post("/use-user-data", async (req, res) => {
//   const { user_id, data_type, purpose } = req.body;

//   try {
//     const response = await fetch(
//       `${process.env.CONSENT_LEDGER_URL}/data-access`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${process.env.APP_SECRET}`
//         },
//         body: JSON.stringify({
//           user_id,
//           data_type,
//           purpose
//         })
//       }
//     );

//     const result = await response.json();

//     if (!result.allowed) {
//       return res.status(403).json({
//         message: "Access blocked by ConsentLedger",
//         reason: result.reason || "No valid consent"
//       });
//     }

//     // Simulated data access
//     res.json({
//       message: "Access granted. Data processed successfully.",
//       data_used: data_type
//     });
//   } catch (err) {
//     res.status(500).json({ error: "ConsentLedger not reachable" });
//   }
// });
app.post("/use-user-data", async (req, res) => {
  // console.log("🚀 Third-party route HIT");
  // console.log("Request body:", req.body);
  console.log("Third-party app: requesting consent check");


  const { user_id, data_type, purpose } = req.body;

  try {
    const response = await fetch(
      `${process.env.CONSENT_LEDGER_URL}/data-access`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.APP_SECRET}`
        },
        body: JSON.stringify({
          user_id,
          data_type,
          purpose
        })
      }
    );

    const result = await response.json();
    console.log("Response from ConsentLedger:", result);

    if (!result.allowed) {
      return res.status(403).json({
        message: "Access blocked by ConsentLedger",
        reason: result.reason || "No valid consent"
      });
    }

    res.json({
      message: "Access granted. Data processed successfully.",
      data_used: data_type
    });
  } catch (err) {
    console.error("Error contacting ConsentLedger:", err);
    res.status(500).json({ error: "ConsentLedger not reachable" });
  }
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Third-party app running on port ${PORT}`);
});
