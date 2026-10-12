import { describe, expect, it } from "vitest";
import { formatFCFA } from "@/lib/format";

const NBSP = " ";

describe("formatFCFA", () => {
  it("sépare les milliers et ajoute la devise", () => {
    expect(formatFCFA(125000)).toBe(`125${NBSP}000${NBSP}FCFA`);
    expect(formatFCFA(1500000)).toBe(`1${NBSP}500${NBSP}000${NBSP}FCFA`);
  });

  it("gère les petits montants, zéro et les négatifs", () => {
    expect(formatFCFA(0)).toBe(`0${NBSP}FCFA`);
    expect(formatFCFA(950)).toBe(`950${NBSP}FCFA`);
    expect(formatFCFA(-4500)).toBe(`-4${NBSP}500${NBSP}FCFA`);
  });

  it("arrondit au franc près (le FCFA n'a pas de centimes)", () => {
    expect(formatFCFA(999.6)).toBe(`1${NBSP}000${NBSP}FCFA`);
  });
});
