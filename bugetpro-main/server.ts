import express from "express";
import path from "path";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import client from "prom-client";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // =========================================================
  // Basic Express Configuration
  // =========================================================

  app.use(express.json());

  // =========================================================
  // Prometheus Metrics
  // =========================================================

  const register = new client.Registry();

  // Node.js / process metrics
  client.collectDefaultMetrics({
    register,
  });

  // Total HTTP requests
  const httpRequestCounter = new client.Counter({
    name: "budgetpro_http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status_code"],
  });

  // HTTP request duration
  const httpRequestDuration = new client.Histogram({
    name: "budgetpro_http_request_duration_seconds",
    help: "HTTP request duration in seconds",
    labelNames: ["method", "route", "status_code"],
    buckets: [0.1, 0.3, 0.5, 1, 2, 5],
  });

  register.registerMetric(httpRequestCounter);
  register.registerMetric(httpRequestDuration);

  // =========================================================
  // HTTP Metrics Middleware
  // =========================================================

  app.use((req, res, next) => {
    const start = process.hrtime.bigint();

    res.on("finish", () => {
      // Do not count Prometheus scraping itself
      if (req.path === "/metrics") {
        return;
      }

      const duration =
        Number(process.hrtime.bigint() - start) / 1_000_000_000;

      const route = req.route?.path || req.path;

      httpRequestCounter.inc({
        method: req.method,
        route,
        status_code: res.statusCode.toString(),
      });

      httpRequestDuration.observe(
        {
          method: req.method,
          route,
          status_code: res.statusCode.toString(),
        },
        duration
      );
    });

    next();
  });

  // =========================================================
  // Health Check
  // =========================================================

  app.get("/api/health", (req, res) => {
    res.status(200).json({
      status: "healthy",
      service: "BudgetPro",
      timestamp: new Date().toISOString(),
    });
  });

  // =========================================================
  // Prometheus Metrics Endpoint
  // =========================================================

  app.get("/metrics", async (req, res) => {
    try {
      res.set("Content-Type", register.contentType);

      const metrics = await register.metrics();

      res.end(metrics);
    } catch (error) {
      console.error("Metrics Error:", error);

      res.status(500).json({
        error: "Failed to generate metrics",
      });
    }
  });

  // =========================================================
  // Razorpay Configuration
  // =========================================================

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_dummy_id",
    key_secret:
      process.env.RAZORPAY_KEY_SECRET || "rzp_test_dummy_secret",
  });

  // =========================================================
  // Razorpay - Create Order
  // =========================================================

  app.post("/api/payment/create-order", async (req, res) => {
    try {
      const { amount, currency = "INR" } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({
          error: "Invalid amount",
        });
      }

      const options = {
        amount: amount * 100,
        currency,
        receipt: `receipt_${Date.now()}`,
      };

      const order = await razorpay.orders.create(options);

      res.json(order);
    } catch (error) {
      console.error("Razorpay Order Error:", error);

      res.status(500).json({
        error: "Failed to create order",
      });
    }
  });

  // =========================================================
  // Razorpay - Verify Payment
  // =========================================================

  app.post("/api/payment/verify", (req, res) => {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      } = req.body;

      if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature
      ) {
        return res.status(400).json({
          status: "failure",
          message: "Missing payment verification fields",
        });
      }

      const sign =
        razorpay_order_id + "|" + razorpay_payment_id;

      const expectedSign = crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET ||
            "rzp_test_dummy_secret"
        )
        .update(sign)
        .digest("hex");

      if (razorpay_signature === expectedSign) {
        return res.json({
          status: "success",
          message: "Payment verified successfully",
        });
      }

      return res.status(400).json({
        status: "failure",
        message: "Invalid signature",
      });
    } catch (error) {
      console.error("Verification Error:", error);

      res.status(500).json({
        error: "Verification failed",
      });
    }
  });

  // =========================================================
  // Development Mode - Vite
  // =========================================================

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } =
      await import("vite");

    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: "spa",
    });

    app.use(vite.middlewares);
  }

  // =========================================================
  // Production Mode - Serve React Build
  // =========================================================

  else {
    const distPath = path.join(process.cwd(), "dist");

    app.use(express.static(distPath));

    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // =========================================================
  // Start Server
  // =========================================================

  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `Server running on http://localhost:${PORT}`
    );
  });
}

// ===========================================================
// Start Application
// ===========================================================

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});