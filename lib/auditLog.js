import fs from "fs";
import path from "path";

const AUDIT_DIR = path.join(process.cwd(), ".internal", "audit");

function ensureAuditDir() {
  fs.mkdirSync(AUDIT_DIR, { recursive: true });
}

export function appendAuditEvent(channel, payload) {
  try {
    ensureAuditDir();
    const filePath = path.join(AUDIT_DIR, `${channel}.log`);
    const line = JSON.stringify({ timestamp: new Date().toISOString(), ...payload });
    fs.appendFileSync(filePath, `${line}\n`, "utf8");
    return true;
  } catch (error) {
    console.error("Failed to append audit event:", error);
    return false;
  }
}