// import supabase from "../supabaseClient.js";

// const appAuth = async (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader) {
//     return res.status(401).json({ error: "Missing Authorization header" });
//   }

//   const token = authHeader.replace("Bearer ", "");

//   const { data: apps, error } = await supabase
//     .from("apps")
//     .select("*")
//     .eq("app_secret", token)
//     .limit(1);

//   if (error || !apps || apps.length === 0) {
//     return res.status(401).json({ error: "Invalid app credentials" });
//   }

//   // Attach app info to request
//   req.app = apps[0];

//   next();
// };

// export default appAuth;

import supabase from "../supabaseClient.js";

const appAuth = async (req, res, next) => {
  console.log("🛂 appAuth HIT");

  const authHeader = req.headers.authorization;
  console.log("Authorization header:", authHeader);

  if (!authHeader) {
    console.log("❌ Missing Authorization header");
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const token = authHeader.replace("Bearer ", "");
  console.log("Token received:", token);

  const { data: apps, error } = await supabase
    .from("apps")
    .select("*")
    .eq("app_secret", token)
    .limit(1);

  console.log("Apps found from DB:", apps);

  if (error) {
    console.log("❌ Supabase error:", error);
    return res.status(500).json({ error: "Auth DB error" });
  }

  if (!apps || apps.length === 0) {
    console.log("❌ Invalid app credentials");
    return res.status(401).json({ error: "Invalid app credentials" });
  }

  req.app = apps[0];
  console.log("✅ App authenticated:", req.app.app_id);

  next();
};

export default appAuth;

