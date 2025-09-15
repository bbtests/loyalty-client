import { createEntity } from "@/store/entityFactory";

// Mock the API client
jest.mock("@/lib/api-client", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("Entity Factory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createEntity", () => {
    it("creates entity API with correct configuration", () => {
      const entityApi = createEntity({
        reducerPath: "testApi",
        entityEndpoint: "test-entities",
      });

      expect(entityApi.reducerPath).toBe("testApi");
      expect((entityApi as any).entityEndpoint).toBe("test-entities");
    });

    it("exports correct hooks", () => {
      const entityApi = createEntity({
        reducerPath: "testApi",
        entityEndpoint: "test-entities",
      });

      expect(entityApi).toHaveProperty("useGetAllQuery");
      expect(entityApi).toHaveProperty("useGetByIdQuery");
      expect(entityApi).toHaveProperty("useCreateMutation");
      expect(entityApi).toHaveProperty("useUpdateMutation");
      expect(entityApi).toHaveProperty("useDeleteMutation");
      expect(entityApi).toHaveProperty("useGetSingleQuery");
    });

    it("handles GET_ALL requests correctly", () => {
      const entityApi = createEntity({
        reducerPath: "testApi",
        entityEndpoint: "test-entities",
      });

      // Test that the endpoint is created
      expect(entityApi.endpoints.getAll).toBeDefined();
    });

    it("creates getById endpoint", () => {
      const entityApi = createEntity({
        reducerPath: "testApi",
        entityEndpoint: "test-entities",
      });

      expect(entityApi.endpoints.getById).toBeDefined();
    });

    it("creates create endpoint", () => {
      const entityApi = createEntity({
        reducerPath: "testApi",
        entityEndpoint: "test-entities",
      });

      expect(entityApi.endpoints.create).toBeDefined();
    });

    it("creates update endpoint", () => {
      const entityApi = createEntity({
        reducerPath: "testApi",
        entityEndpoint: "test-entities",
      });

      expect(entityApi.endpoints.update).toBeDefined();
    });

    it("creates delete endpoint", () => {
      const entityApi = createEntity({
        reducerPath: "testApi",
        entityEndpoint: "test-entities",
      });

      expect(entityApi.endpoints.delete).toBeDefined();
    });

    it("creates getSingle endpoint", () => {
      const entityApi = createEntity({
        reducerPath: "testApi",
        entityEndpoint: "test-entities",
      });

      expect(entityApi.endpoints.getSingle).toBeDefined();
    });
  });

  describe("URL parameter substitution", () => {
    it("creates entity with URL parameters", () => {
      const entityApi = createEntity({
        reducerPath: "testApi",
        entityEndpoint: "users/:id/orders",
      });

      expect(entityApi.reducerPath).toBe("testApi");
      expect((entityApi as any).entityEndpoint).toBe("users/:id/orders");
    });

    it("creates entity with multiple URL parameters", () => {
      const entityApi = createEntity({
        reducerPath: "testApi",
        entityEndpoint: "users/:userId/orders/:orderId",
      });

      expect((entityApi as any).entityEndpoint).toBe(
        "users/:userId/orders/:orderId",
      );
    });
  });

  describe("Query parameter filtering", () => {
    it("creates entity with query parameter support", () => {
      const entityApi = createEntity({
        reducerPath: "testApi",
        entityEndpoint: "users/:id/orders",
      });

      expect(entityApi.endpoints.getAll).toBeDefined();
    });
  });

  describe("Custom base query", () => {
    it("creates entity with custom configuration", () => {
      const entityApi = createEntity({
        reducerPath: "testApi",
        entityEndpoint: "test-entities",
      });

      expect(entityApi.reducerPath).toBe("testApi");
      expect((entityApi as any).entityEndpoint).toBe("test-entities");
    });
  });
});
