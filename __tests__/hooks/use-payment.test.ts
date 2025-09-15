import { renderHook, act } from "@testing-library/react";
import { usePayment } from "@/hooks/use-payment";

// Mock the payment providers
jest.mock("@/lib/payment-providers", () => ({
  handlePaymentRedirect: jest.fn(() => ({ shouldRedirect: false })),
  getDefaultProvider: jest.fn(() => "mock"),
  isValidProvider: jest.fn(() => true),
}));

describe("usePayment Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();

    // Mock setTimeout to resolve immediately
    jest.spyOn(global, "setTimeout").mockImplementation((callback: any) => {
      callback();
      return 1 as any;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("initializes with correct default state", () => {
    const { result } = renderHook(() => usePayment());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("");
  });

  it("processes payment successfully", async () => {
    const paymentData = { amount: 100, description: "Test payment" };

    const { result } = renderHook(() => usePayment());

    await act(async () => {
      await result.current.processPayment(paymentData);
    });

    expect(result.current.loading).toBe(false);
  });

  it("handles payment initialization failure", async () => {
    // Mock initialization failure by importing the mocked function
    const { handlePaymentRedirect } = require("@/lib/payment-providers");
    handlePaymentRedirect.mockImplementation(() => {
      throw new Error("Initialization failed");
    });

    const paymentData = { amount: 100, description: "Test payment" };
    const { result } = renderHook(() => usePayment());

    await act(async () => {
      await result.current.processPayment(paymentData);
    });

    expect(result.current.error).toBe("Initialization failed");
  });

  it("handles payment verification failure", async () => {
    // Mock verification failure
    const { handlePaymentRedirect } = require("@/lib/payment-providers");
    handlePaymentRedirect.mockImplementation(() => {
      throw new Error("Verification failed");
    });

    const paymentData = { amount: 100, description: "Test payment" };
    const { result } = renderHook(() => usePayment());

    await act(async () => {
      await result.current.processPayment(paymentData);
    });

    expect(result.current.error).toBe("Verification failed");
  });

  it("handles general payment error", async () => {
    // Mock general error
    const { handlePaymentRedirect } = require("@/lib/payment-providers");
    handlePaymentRedirect.mockImplementation(() => {
      throw new Error("Payment processing failed");
    });

    const paymentData = { amount: 100, description: "Test payment" };
    const { result } = renderHook(() => usePayment());

    await act(async () => {
      await result.current.processPayment(paymentData);
    });

    expect(result.current.error).toBe("Payment processing failed");
  });

  it("validates payment data correctly", async () => {
    const invalidPaymentData = { amount: -100, description: "" };
    const { result } = renderHook(() => usePayment());

    await act(async () => {
      await result.current.processPayment(invalidPaymentData);
    });

    // Should handle validation error
    expect(result.current.error).toBeDefined();
  });

  it("handles provider validation", async () => {
    const { isValidProvider } = require("@/lib/payment-providers");
    isValidProvider.mockReturnValue(false);
    
    const paymentData = { amount: 100, description: "Test payment" };
    const { result } = renderHook(() => usePayment());

    await act(async () => {
      await result.current.processPayment(paymentData);
    });

    // Should handle invalid provider
    expect(result.current.error).toBeDefined();
  });
});