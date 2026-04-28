import { beforeEach } from "vitest";
import { resetDb } from "../db/test-utils.js";

beforeEach(async () => {
  await resetDb();
});
