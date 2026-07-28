import { config } from "dotenv";
import { resolve } from "node:path";

import { deliverOtp, verifyDeliveredOtp } from "@/lib/members/confirm";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

function parseArgs(argv: string[]) {
  let email: string | undefined;
  let code: string | undefined;
  let verify = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--email" && argv[i + 1]) {
      email = argv[++i];
    } else if (arg === "--code" && argv[i + 1]) {
      code = argv[++i];
    } else if (arg === "--verify") {
      verify = true;
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
  }

  return { email, code, verify };
}

function printHelp() {
  console.log(`Usage:
  Send OTP via Resend (requires DATABASE_URL + RESEND_* in .env.local):
    npm run members:send-otp-test -- --email user@SERVER_ID.mailosaur.net

  Verify OTP locally:
    npm run members:send-otp-test -- --verify --email user@example.com --code 123456

  See docs/members/mailosaur-qa.md for Mailosaur setup.`);
}

async function main() {
  const { email, code, verify } = parseArgs(process.argv.slice(2));

  if (!email) {
    console.error("Missing --email");
    printHelp();
    process.exit(1);
  }

  if (verify) {
    if (!code) {
      console.error("--verify requires --code");
      process.exit(1);
    }
    const result = await verifyDeliveredOtp({
      email,
      code,
    });
    console.log("OTP verified:", result);
    return;
  }

  const result = await deliverOtp({ email });
  console.log("OTP sent:");
  console.log(`  to:        ${result.email}`);
  console.log(`  expires:   ${result.expiresAt.toISOString()}`);
  console.log(`  messageId: ${result.messageId}`);
  console.log("");
  console.log(
    "Check Mailosaur inbox for the 6-digit code (docs/members/mailosaur-qa.md).",
  );
}

main().catch((error) => {
  console.error("OTP test failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
