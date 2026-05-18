import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  ensureClinicContext,
  ensureUserClinicAccess,
  ensureClinicOwner,
} from "./multitenant";
import { TRPCError } from "@trpc/server";

describe("Multi-tenant utilities", () => {
  describe("ensureClinicContext", () => {
    it("should throw error when clinicId is null", () => {
      expect(() => ensureClinicContext(null)).toThrow(TRPCError);
    });

    it("should not throw when clinicId is provided", () => {
      expect(() => ensureClinicContext(1)).not.toThrow();
    });
  });

  describe("ensureUserClinicAccess", () => {
    it("should throw error when user has no access", async () => {
      try {
        await ensureUserClinicAccess(999, 999);
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
      }
    });
  });

  describe("ensureClinicOwner", () => {
    it("should throw error when user is not clinic owner", async () => {
      try {
        await ensureClinicOwner(999, 999);
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
      }
    });
  });
});
