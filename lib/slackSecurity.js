import crypto from "crypto";

const FIVE_MINUTES_SECONDS = 60 * 5;

export function verifySlackRequest({ body, timestamp, signature }) {
  const signingSecret = process.env.SLACK_SIGNING_SECRET || "";
  if (!signingSecret || !body || !timestamp || !signature) return false;

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  if (Math.abs(Math.floor(Date.now() / 1000) - ts) > FIVE_MINUTES_SECONDS) return false;

  const base = `v0:${timestamp}:${body}`;
  const expected = `v0=${crypto
    .createHmac("sha256", signingSecret)
    .update(base)
    .digest("hex")}`;

  const left = Buffer.from(expected);
  const right = Buffer.from(signature);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}
