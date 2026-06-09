const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;
const root = __dirname;

app.disable("x-powered-by");

app.use(
  express.static(root, {
    extensions: ["html"],
    maxAge: "1h",
    setHeaders(res, filePath) {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-store");
      }
      if (filePath.endsWith(".json")) {
        res.setHeader("Cache-Control", "no-store");
      }
    }
  })
);

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, app: "relaydesk-assist-chat" });
});

app.get("/dashboard", (_req, res) => {
  res.sendFile(path.join(root, "app.html"));
});

app.get("*", (req, res) => {
  if (req.path.startsWith("/assets/") || req.path.startsWith("/css/") || req.path.startsWith("/js/") || req.path.startsWith("/data/")) {
    return res.status(404).send("Not found");
  }
  return res.sendFile(path.join(root, "index.html"));
});

app.listen(port, () => {
  console.log(`RelayDesk app listening on port ${port}`);
});
