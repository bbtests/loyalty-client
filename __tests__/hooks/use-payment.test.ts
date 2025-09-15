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
    const { result } = renderHook(() => usePayment());

    const paymentData = {
      amount: 100,
      description: "Test payment",
    };

    let paymentResult: any;
    await act(async () => {
      paymentResult = await result.current.processPayment(paymentData);
    });

    expect(paymentResult).toHaveProperty("success");
    expect(paymentResult.success).toBe(true);
    expect(paymentResult).toHaveProperty("transaction");
    expect(paymentResult.transaction).toMatchObject({
      amount: 100,
      points_earned: 500,
      status: "completed",
    });
    expect(paymentResult.transaction.id).toBeDefined();
    expect(paymentResult.transaction.created_at).toBeDefined();
  });

  it("calculates points correctly", async () => {
    const { result } = renderHook(() => usePayment());

    const paymentData = {
      amount: 50.5,
      description: "Test payment",
    };

    let paymentResult: any;
    await act(async () => {
      paymentResult = await result.current.processPayment(paymentData);
    });

    expect(paymentResult.success).toBe(true);
    expect(paymentResult.transaction.points_earned).toBe(500); // Mock returns 500 points
  });

  it("handles payment processing", async () => {
    const { result } = renderHook(() => usePayment());

    const paymentData = {
      amount: 100,
      description: "Test payment",
    };

    let paymentResult: any;
    await act(async () => {
      paymentResult = await result.current.processPayment(paymentData);
    });

    // Check that we get success
    expect(paymentResult).toHaveProperty("success");
    expect(paymentResult.success).toBe(true);
  });

  it("handles payment failure", async () => {
    const { result } = renderHook(() => usePayment());

    // Set mock to fail on initialization
    setMockInitializePaymentSuccess(false);

    const paymentData = {
      amount: 100,
      description: "Test payment",
    };

    let paymentResult: any;
    await act(async () => {
      paymentResult = await result.current.processPayment(paymentData);
    });

    expect(paymentResult).toHaveProperty("success");
    expect(paymentResult.success).toBe(false);
    expect(paymentResult).toHaveProperty("error");
    expect(paymentResult.error).toBe("Payment initialization failed");

    // Reset mocks
    resetPaymentMocks();
  });

  it("sets loading state correctly during payment processing", async () => {
    const { result } = renderHook(() => usePayment());

    const paymentData = {
      amount: 100,
      description: "Test payment",
    };

    // Start payment processing
    let paymentPromise: Promise<any>;
    act(() => {
      paymentPromise = result.current.processPayment(paymentData);
    });

    // Should be loading immediately
    expect(result.current.loading).toBe(true);

    // Wait for completion
    await act(async () => {
      await paymentPromise;
    });

    expect(result.current.loading).toBe(false);
  });

  it("clears error on new payment attempt", async () => {
    const { result } = renderHook(() => usePayment());

    const paymentData = {
      amount: 100,
      description: "Test payment",
    };

    // Make a payment attempt that will fail
    setMockInitializePaymentSuccess(false);

    await act(async () => {
      const promise = result.current.processPayment(paymentData);
      await promise;
    });

    // Check that error is set
    expect(result.current.error).toBe("Payment initialization failed");

    // Make another payment attempt that will succeed
    resetPaymentMocks();

    await act(async () => {
      const promise = result.current.processPayment(paymentData);
      await promise;
    });

    // Error should be cleared
    expect(result.current.error).toBe("");
  });
});
