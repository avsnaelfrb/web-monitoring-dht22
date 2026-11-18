import express from "express";

type Reading = { temperature: number; humidity: number; receivedAt: string };

// shortcut: in-memory only, replace with DB insert/read in POST/GET handlers later.
let latest: Reading | null = null;

const app = express();
app.use(express.json());

function saveReading(req: express.Request, res: express.Response) {
  const { temperature, humidity } = req.body ?? {};
  if (!Number.isFinite(temperature) || !Number.isFinite(humidity)) {
    res.status(400).json({ error: "temperature and humidity must be numbers" });
    return;
  }
  latest = {
    temperature: Number(temperature),
    humidity: Number(humidity),
    receivedAt: new Date().toISOString(),
  };
  res.status(201).json(latest);
}

app.get("/api/readings/latest", (_req, res) => {
  res.json(latest);
});

app.post(["/api/readings", "/api/sensor"], saveReading);

if (import.meta.main) {
  const port = Number(Deno.env.get("PORT") ?? "8000");
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

export { app, latest };
