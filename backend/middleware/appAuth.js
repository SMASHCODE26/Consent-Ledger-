import supabase from "../supabaseClient.js";

const appAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const token = authHeader.replace("Bearer ", "");

  const { data: apps, error } = await supabase
    .from("apps")
    .select("*")
    .eq("app_secret", token)
    .limit(1);

  if (error || !apps || apps.length === 0) {
    return res.status(401).json({ error: "Invalid app credentials" });
  }

  // Attach app info to request
  req.app = apps[0];

  next();
};

export default appAuth;
