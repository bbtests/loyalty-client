import { renderHook, act, waitFor } from "@testing-library/react";
import { useLoyaltyData } from "@/hooks/use-loyalty-data";
import { useSimulateAchievementMutation } from "@/store/achievements";

// Mock the store hooks
const mockUseGetUserLoyaltyDataQuery = jest.fn();
const mockUseInitializePaymentMutation = jest.fn();
const mockUseVerifyPaymentMutation = jest.fn();
const mockUseProcessPurchaseAfterPaymentMutation = jest.fn();

jest.mock("@/store/loyalty", () => ({
  useGetUserLoyaltyDataQuery: () => mockUseGetUserLoyaltyDataQuery(),
  useInitializePaymentMutation: () => mockUseInitializePaymentMutation(),
  useVerifyPaymentMutation: () => mockUseVerifyPaymentMutation(),
  useProcessPurchaseAfterPaymentMutation: () => mockUseProcessPurchaseAfterPaymentMutation(),
}));

jest.mock("@/store/achievements", () => ({
  useSimulateAchievementMutation: jest.fn(),
}));

// Get the mocked hook
const mockUseSimulateAchievementMutation = useSimulateAchievementMutation as jest.MockedFunction<typeof useSimulateAchievementMutation>;

// Mock next-auth
jest.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { id: "1" }, accessToken: "mock-token" },
  }),
}));

// Mock timers
jest.useFakeTimers();

describe("useLoyaltyData Hook", () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
    
    // Set up default mocks
    mockUseGetUserLoyaltyDataQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    });
    
    mockUseInitializePaymentMutation.mockReturnValue([
      jest.fn(),
    ]);
    
    mockUseVerifyPaymentMutation.mockReturnValue([
      jest.fn(),
    ]);
    
    mockUseProcessPurchaseAfterPaymentMutation.mockReturnValue([
      jest.fn(),
    ]);

    // Mock successful simulateAchievementMutation response by default
    const mockMutation = jest.fn().mockImplementation(() => ({
      unwrap: () => Promise.resolve({
        id: 1,
        name: "Test Achievement",
        description: "Test achievement description",
      }),
    })) as any;
    mockUseSimulateAchievementMutation.mockReturnValue([mockMutation, { reset: jest.fn() }]);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  it("returns loading state initially", () => {
    // Set mock to loading state
    mockUseGetUserLoyaltyDataQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: undefined,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useLoyaltyData());

    expect(result.current.loading).toBe(true);
    expect(result.current.loyaltyData).toBe(undefined);
  });

  it("loads loyalty data successfully", async () => {
    const mockLoyaltyData = {
      user_id: 1,
      points: { available: 100, total_earned: 200, total_redeemed: 100 },
      achievements: [],
      badges: [],
      current_badge: null,
    };

    // Set mock to return data
    mockUseGetUserLoyaltyDataQuery.mockReturnValue({
      data: mockLoyaltyData,
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useLoyaltyData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.loyaltyData).toEqual(mockLoyaltyData);
    });
  });

  it("handles error state", async () => {
    // Set mock to return error
    mockUseGetUserLoyaltyDataQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: "Network error" },
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useLoyaltyData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe("Network error");
    });
  });

  it("simulates achievement successfully", async () => {
    const mockLoyaltyData = {
      user_id: 1,
      points: { available: 100, total_earned: 200, total_redeemed: 100 },
      achievements: [],
      badges: [],
      current_badge: null,
    };

    const mockRefetch = jest.fn();
    
    mockUseGetUserLoyaltyDataQuery.mockReturnValue({
      data: mockLoyaltyData,
      isLoading: false,
      error: undefined,
      refetch: mockRefetch,
    });

    const { result } = renderHook(() => useLoyaltyData());

    await act(async () => {
      await result.current.simulateAchievement();
    });

    // Should show the modal instead of making API call
    expect(result.current.showAchievementModal).toBe(true);
  });

  it("handles simulate achievement error", async () => {
    mockUseGetUserLoyaltyDataQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    });

    // Mock simulateAchievementMutation to throw an error
    const mockErrorMutation = jest.fn().mockImplementation(() => ({
      unwrap: () => Promise.reject(new Error("Failed to simulate achievement")),
    })) as any;
    mockUseSimulateAchievementMutation.mockReturnValue([mockErrorMutation, { reset: jest.fn() }]);

    const { result } = renderHook(() => useLoyaltyData());

    const mockAchievement = {
      id: 1,
      name: "Test Achievement",
      description: "Test description",
      badge_icon: "trophy",
      unlocked_at: "2023-01-01T00:00:00Z",
    };

    await act(async () => {
      await result.current.handleAchievementSelection(mockAchievement);
    });

    // Should handle error gracefully
    expect(result.current.error).toBe("Failed to simulate achievement");
  });

  it("refreshes data successfully", () => {
    const mockRefetch = jest.fn();
    
    mockUseGetUserLoyaltyDataQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: undefined,
      refetch: mockRefetch,
    });

    const { result } = renderHook(() => useLoyaltyData());

    act(() => {
      result.current.refreshData();
    });

    expect(mockRefetch).toHaveBeenCalled();
  });
});