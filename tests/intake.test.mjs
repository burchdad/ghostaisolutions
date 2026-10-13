import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../components/QualificationIntake.js", import.meta.url), "utf8");
// Run the component's pure helper without importing JSX or mounting the intake.
const helper = source.match(/^function isValidContactEmail\(value\) \{[\s\S]*?^\}/m)?.[0];
assert.ok(helper, "the component must define its email-format helper");
const isValidContactEmail = vm.runInNewContext(`(${helper})`);

test("email format accepts ordinary addresses, aliases, subdomains, and surrounding whitespace", () => {
  for (const email of [
    "person@example.com",
    "first.last+project@example.co.uk",
    "o'connor@example.solutions",
    "team@marketing.example.com",
    "  person@example.com  ",
  ]) {
    assert.equal(isValidContactEmail(email), true, email);
  }
});

test("email format rejects empty addresses and obvious typos", () => {
  for (const email of [
    "",
    "   ",
    "person",
    "person@example",
    "person@",
    "@example.com",
    "person@@example.com",
    "person example@example.com",
    "person@exam ple.com",
    "person@example.",
    null,
    undefined,
  ]) {
    assert.equal(isValidContactEmail(email), false, String(email));
  }
});

test("Contact step checks email format and connects accessible error feedback", () => {
  assert.match(source, /if \(step === 0\) return form\.name\.trim\(\) && isValidContactEmail\(form\.email\)/);
  assert.match(source, /aria-invalid=\{emailIsInvalid\}/);
  assert.match(source, /aria-describedby=\{emailIsInvalid \? fieldId\("email-error"\) : undefined\}/);
  assert.match(source, /<p id=\{fieldId\("email-error"\)\}/);
});

test("success message confirms submission without promising email delivery", () => {
  assert.match(source, /Your intake was submitted, and we will follow up with the right next step\./);
  assert.doesNotMatch(source, /a confirmation email is on the way/);
});

test("email alternative uses the configured support address", () => {
  assert.ok(source.includes('href={`mailto:${supportEmail}`}'));
  assert.doesNotMatch(source, /href="#blueprint"/);
});
