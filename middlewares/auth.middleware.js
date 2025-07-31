import jwt from "jsonwebtoken";

export const isLoggedIn = async (req, res, next) => {
  try {
    console.log(req.cookies);
    let token = req.cookies?.access_token;
    console.log("token found", token ? "YES" : "NO");

    if (!token) {
      console.log("no token");
      return res.status(401).json({
        success: false,
        message: "Authentication failed",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_USER_SECRET);
    console.log("decoded data", decoded);
    req.user = decoded;

    return next();
  } catch (err) {
    console.log("auth middleware failure");
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
