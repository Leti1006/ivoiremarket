// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QuantityControl } from "@/features/cart/components/quantity-control";

afterEach(cleanup);

describe("QuantityControl", () => {
  it("augmente et diminue la quantité", () => {
    const onChange = vi.fn();
    render(<QuantityControl label="Quantité" value={2} min={1} max={5} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Augmenter la quantité" }));
    fireEvent.click(screen.getByRole("button", { name: "Diminuer la quantité" }));
    expect(onChange.mock.calls).toEqual([[3], [1]]);
  });

  it("désactive les boutons aux limites", () => {
    render(<QuantityControl label="Quantité" value={1} min={1} max={1} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Augmenter la quantité" })).toHaveProperty("disabled", true);
    expect(screen.getByRole("button", { name: "Diminuer la quantité" })).toHaveProperty("disabled", true);
  });
});
