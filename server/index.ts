import "./env";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { verifyRazorpayWebhookSignature } from "./services/payment";
import { storage } from "./storage";

const app = express();

// Razorpay webhook must use raw body for signature verification (register before express.json())
app.post(
  "/api/payment/webhook",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    const rawBody = req.body as Buffer;
    const signature = (req.headers["x-razorpay-signature"] as string) || "";
    const secret = (process.env.RAZORPAY_WEBHOOK_SECRET || "").trim();
    if (!secret) {
      log("Razorpay webhook: RAZORPAY_WEBHOOK_SECRET not set");
      res.status(200).send("OK");
      return;
    }
    if (!verifyRazorpayWebhookSignature(rawBody, signature, secret)) {
      log("Razorpay webhook: invalid signature");
      res.status(400).send("Invalid signature");
      return;
    }
    try {
      const body = JSON.parse(rawBody.toString("utf8"));
      const event = body.event;
      if (event === "payment.captured") {
        const payment = body.payload?.payment?.entity;
        const paymentId = payment?.id;
        if (paymentId) {
          const booking = await storage.getBookingByPaymentId(paymentId);
          if (booking && booking.paymentStatus !== "completed") {
            await storage.updateBookingPayment(booking.id, paymentId, "completed");
            await storage.updateBookingStatus(booking.id, "confirmed");
            log("Razorpay webhook: booking " + booking.id + " confirmed via webhook");
          }
        }
      }
    } catch (e) {
      log("Razorpay webhook parse/handle error: " + (e as Error)?.message);
    }
    res.status(200).send("OK");
  }
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  // Check process.env.NODE_ENV directly for better cross-platform support
  const isDevelopment = process.env.NODE_ENV !== "production";
  if (isDevelopment) {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    // reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    const keyId = (process.env.RAZORPAY_KEY_ID || "").trim();
    const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
    const razorpayOk = !!(keyId && keySecret && keyId !== "your_razorpay_key_id");
    log(razorpayOk ? "Razorpay: configured" : `Razorpay: NOT configured (KEY_ID len=${keyId.length}, SECRET len=${keySecret.length})`);
  });
})();
