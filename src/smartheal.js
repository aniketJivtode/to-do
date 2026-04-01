const SmartHeal = {
  init({ endpoint, projectId }) {
    this.endpoint = endpoint;
    this.projectId = projectId;
    this.sentErrors = new Map(); // Cache for deduplication
    this.dedupWindow = 5 * 60 * 1000; // 5 minutes

    this.intercept();
  },

  async send(payload) {
    try {
      await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          projectId: this.projectId,
        }),
      });
    } catch (e) {}
  },

  generateSignature(error) {
    const message = error?.message || error.toString();
    const stack = error?.stack || "";
    // Create a simple hash-like signature from message and first few lines of stack
    const stackLines = stack.split("\n").slice(0, 3).join("").trim();
    return `${message}|${stackLines}`;
  },

  shouldSendError(error) {
    const signature = this.generateSignature(error);
    const now = Date.now();

    if (this.sentErrors.has(signature)) {
      const lastSent = this.sentErrors.get(signature);
      if (now - lastSent < this.dedupWindow) {
        return false; // Too soon, skip
      }
    }

    this.sentErrors.set(signature, now);

    // Cleanup old entries periodically (every 100 errors)
    if (this.sentErrors.size > 100) {
      this.cleanupOldErrors();
    }

    return true;
  },

  cleanupOldErrors() {
    const now = Date.now();
    const cutoff = now - this.dedupWindow;

    for (const [signature, timestamp] of this.sentErrors.entries()) {
      if (timestamp < cutoff) {
        this.sentErrors.delete(signature);
      }
    }
  },

  capture(error) {
    if (!this.shouldSendError(error)) {
      return; // Skip duplicate
    }

    this.send({
      message: error?.message || error.toString(),
      stack: error?.stack,
      source: typeof window !== "undefined" ? "frontend" : "backend",
    });
  },

  intercept() {
    const originalError = console.error;

    console.error = (...args) => {
      const errorMessage =
        args[0] instanceof Error ? args[0].message : args.join(" ");

      this.capture(
        args[0] instanceof Error ? args[0] : new Error(args.join(" ")),
      );

      originalError(...args);
    };

    // Capture uncaught errors
    window.onerror = (message, source, lineno, colno, error) => {
      this.capture(error || new Error(message));
    };
  },
};

export default SmartHeal;
