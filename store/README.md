# Store Documentation

This directory contains the Redux store configuration and API management using RTK Query with a custom entity factory pattern.

## Overview

The store is built around a custom `entityFactory` that provides a standardized way to create CRUD API endpoints with support for dynamic path segments and query parameters.

## Core Files

### `entityFactory.ts`
The main factory function that creates standardized API endpoints for any entity type.

### Entity Stores
Individual store files for each entity (e.g., `distributors.ts`, `deliveries.ts`, etc.) that use the entity factory.

## Entity Factory Usage

### Basic Entity Creation

```typescript
import { createEntity } from "./entityFactory";
import type { YourEntity } from "../types/your-entity";

export const yourEntity = createEntity<YourEntity>({
  reducerPath: "yourEntityApi",
  entityEndpoint: "your-entity",
});

export const {
  useGetAllQuery: useGetYourEntitiesQuery,
  useGetByIdQuery: useGetYourEntityQuery,
  useCreateMutation: useCreateYourEntityMutation,
  useUpdateMutation: useUpdateYourEntityMutation,
  useDeleteMutation: useDeleteYourEntityMutation,
} = yourEntity;
```

### Available Endpoints

Each entity automatically gets these endpoints:

- **`getAll`** - Get all entities with optional filtering
- **`getById`** - Get a single entity by ID
- **`getSingle`** - Get a single entity with query parameters
- **`create`** - Create a new entity
- **`update`** - Update an existing entity (PUT)
- **`patch`** - Partially update an entity (PATCH)
- **`delete`** - Delete an entity

## Advanced Features

### Extra Path Segments

The entity factory supports dynamic path segments using the `extraPath` parameter:

```typescript
// Get distributor performance data
// URL: GET /distributors/4c9a76d0-6ceb-4632-af9d-45997ec50f77/performance
const { data } = distributors.useGetByIdQuery({
  id: "4c9a76d0-6ceb-4632-af9d-45997ec50f77",
  extraPath: "performance"
});

// Get all distributors with performance data
// URL: GET /distributors/performance
const { data } = distributors.useGetAllQuery({
  extraPath: "performance"
});

// Create a new performance record
// URL: POST /distributors/performance
const [createPerformance] = distributors.useCreateMutation();
createPerformance({
  data: { score: 95, period: "Q1" },
  extraPath: "performance"
});
```

### Query Parameters

Use the `params` object to add query string parameters:

```typescript
// Get filtered data with query parameters
// URL: GET /distributors?status=active&limit=10
const { data } = distributors.useGetAllQuery({
  params: { 
    status: "active", 
    limit: 10,
    page: 1 
  }
});

// Combine params with extraPath
// URL: GET /distributors/analytics?period=monthly&year=2024
const { data } = distributors.useGetSingleQuery({
  params: { 
    period: "monthly", 
    year: 2024 
  },
  extraPath: "analytics"
});
```

## Examples of Using params with extraPath

### 1. Basic Query with Parameters
```typescript
// Get distributors with query parameters
// URL: GET /distributors?status=active&limit=10
const { data } = distributors.useGetAllQuery({
  params: { 
    status: "active", 
    limit: 10,
    page: 1 
  }
});
```

### 2. Query with Parameters AND extraPath
```typescript
// Get distributor performance with filters
// URL: GET /distributors/performance?period=monthly&year=2024
const { data } = distributors.useGetSingleQuery({
  params: { 
    period: "monthly", 
    year: 2024 
  },
  extraPath: "performance"
});
```

### 3. Complex Filtering Example
```typescript
// Get delivery analytics with multiple filters
// URL: GET /deliveries/analytics?status=delivered&date_from=2024-01-01&date_to=2024-12-31&vehicle_type=truck
const { data } = deliveries.useGetAllQuery({
  params: {
    status: "delivered",
    date_from: "2024-01-01",
    date_to: "2024-12-31",
    vehicle_type: "truck",
    sort_by: "created_at",
    sort_order: "desc"
  },
  extraPath: "analytics"
});
```

### 4. Pagination Example
```typescript
// Get paginated orders with extra path
// URL: GET /orders/reports?page=2&per_page=25&status=pending
const { data } = orders.useGetAllQuery({
  params: {
    page: 2,
    per_page: 25,
    status: "pending",
    include: "customer,items"
  },
  extraPath: "reports"
});
```

### 5. Search with Filters
```typescript
// Search distributors with location filter
// URL: GET /distributors/search?q=warehouse&location=lagos&radius=50
const { data } = distributors.useGetSingleQuery({
  params: {
    q: "warehouse",
    location: "lagos",
    radius: 50,
    limit: 20
  },
  extraPath: "search"
});
```

### 6. Date Range Filtering
```typescript
// Get performance metrics for date range
// URL: GET /distributors/4c9a76d0-6ceb-4632-af9d-45997ec50f77/metrics?start_date=2024-01-01&end_date=2024-03-31&metric_type=sales
const { data } = distributors.useGetByIdQuery({
  id: "4c9a76d0-6ceb-4632-af9d-45997ec50f77",
  params: {
    start_date: "2024-01-01",
    end_date: "2024-03-31",
    metric_type: "sales",
    granularity: "daily"
  },
  extraPath: "metrics"
});
```

### 7. Settings with Configuration
```typescript
// Get delivery settings with specific configuration
// URL: GET /deliveries/settings?config_type=notification&user_id=123
const { data } = deliveries.useGetSingleQuery({
  params: {
    config_type: "notification",
    user_id: "123",
    include_defaults: true
  },
  extraPath: "settings"
});
```

### 8. Mutation with Parameters
```typescript
// Update distributor performance with validation
// URL: PUT /distributors/4c9a76d0-6ceb-4632-af9d-45997ec50f77/performance?validate=true&notify=true
const [updatePerformance] = distributors.useUpdateMutation();

await updatePerformance({
  id: "4c9a76d0-6ceb-4632-af9d-45997ec50f77",
  data: { score: 95, period: "Q1" },
  extraPath: "performance",
  config: {
    params: {
      validate: true,
      notify: true,
      audit: true
    }
  }
});
```

### 9. Dynamic Parameters Based on State
```typescript
// React component example with dynamic parameters
function DistributorAnalytics({ distributorId, selectedPeriod, selectedYear }) {
  const { data, isLoading } = distributors.useGetByIdQuery({
    id: distributorId,
    params: {
      period: selectedPeriod, // "monthly", "quarterly", "yearly"
      year: selectedYear,
      include_comparison: true,
      format: "detailed"
    },
    extraPath: "analytics"
  });

  // Component logic...
}
```

### 10. Conditional Parameters
```typescript
// Conditional parameters based on user role
function getDistributorData(userRole: string, distributorId: string) {
  const baseParams = {
    distributor_id: distributorId,
    include_basic: true
  };

  const roleSpecificParams = userRole === 'admin' 
    ? { include_sensitive: true, include_financial: true }
    : { include_public: true };

  return distributors.useGetByIdQuery({
    id: distributorId,
    params: { ...baseParams, ...roleSpecificParams },
    extraPath: "detailed"
  });
}
```

## Real-World Examples

### Settings Management
```typescript
// Get delivery settings
const { data: settings } = deliveries.useGetSingleQuery({
  extraPath: "settings"
});

// Update delivery settings
const [updateSettings] = deliveries.useUpdateMutation();
await updateSettings({
  data: { max_distance: 100, cost_per_km: 2.5 },
  extraPath: "settings"
});
```

### Performance Tracking
```typescript
// Get distributor performance metrics
const { data: metrics } = distributors.useGetByIdQuery({
  id: distributorId,
  params: {
    start_date: "2024-01-01",
    end_date: "2024-03-31",
    metric_type: "sales"
  },
  extraPath: "metrics"
});
```

### Search and Filtering
```typescript
// Search with filters
const { data: results } = distributors.useGetSingleQuery({
  params: {
    q: "warehouse",
    location: "lagos",
    radius: 50,
    limit: 20
  },
  extraPath: "search"
});
```

## API Method Signatures

### Query Methods

```typescript
// GetAll
useGetAllQuery(params?: QueryArg<Record<string, any>> | void)

// GetById  
useGetByIdQuery(id: IdArg | string)

// GetSingle
useGetSingleQuery(params?: QueryArg<Record<string, any>> | void)
```

### Mutation Methods

```typescript
// Create
useCreateMutation()
// Usage: create({ data: T, extraPath?: string })

// Update
useUpdateMutation()
// Usage: update({ id: string, data: T, extraPath?: string })

// Patch
usePatchMutation()
// Usage: patch({ id: string, data: T, extraPath?: string })

// Delete
useDeleteMutation()
// Usage: delete({ id: string, extraPath?: string })
```

## Type Definitions

### QueryArg
```typescript
type QueryArg<T = any> = T | { 
  params?: T; 
  config?: ApiRequestConfig; 
  extraPath?: string 
};
```

### IdArg
```typescript
type IdArg = { 
  id: string; 
  config?: ApiRequestConfig; 
  extraPath?: string 
};
```

### MutationArg
```typescript
type MutationArg<T = any> = { 
  data: T; 
  config?: ApiRequestConfig; 
  extraPath?: string 
} | T;
```

## Error Handling

The entity factory includes built-in error handling:

```typescript
const { data, error, isLoading } = distributors.useGetByIdQuery({
  id: "invalid-id",
  extraPath: "performance"
});

if (error) {
  console.error('API Error:', error);
  // Handle error state
}
```

## Configuration Options

### EntityApiOptions
```typescript
type EntityApiOptions<T, CreateT = Partial<T>, UpdateT = Partial<T>> = {
  reducerPath: string;        // Redux store path
  entityEndpoint: string;     // API endpoint base path
  tagTypes?: string[];        // RTK Query cache tags
};
```

## Best Practices

1. **Consistent Naming**: Use descriptive reducer paths and endpoint names
2. **Type Safety**: Always provide proper TypeScript types for your entities
3. **Error Handling**: Implement proper error handling in your components
4. **Caching**: Leverage RTK Query's automatic caching for better performance
5. **Extra Paths**: Use extraPath for related endpoints that share the same data structure
6. **Parameters**: Use params for filtering, pagination, and search functionality

## Store Integration

The store is integrated with the main Redux store in `index.ts`:

```typescript
import { configureStore } from '@reduxjs/toolkit';
import { distributors } from './distributors';
import { deliveries } from './deliveries';
// ... other entities

export const store = configureStore({
  reducer: {
    [distributors.reducerPath]: distributors.reducer,
    [deliveries.reducerPath]: deliveries.reducer,
    // ... other reducers
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      distributors.middleware,
      deliveries.middleware,
      // ... other middleware
    ),
});
```

## Migration Guide

### From Basic RTK Query

If you're migrating from basic RTK Query endpoints:

1. Replace manual endpoint definitions with `createEntity`
2. Update component imports to use the generated hooks
3. Add `extraPath` support where needed
4. Update API calls to use the new parameter structure

### Example Migration

**Before:**
```typescript
// Manual endpoint definition
const distributorsApi = createApi({
  endpoints: (builder) => ({
    getDistributors: builder.query({
      query: () => '/distributors',
    }),
  }),
});
```

**After:**
```typescript
// Using entity factory
export const distributors = createEntity<Distributor>({
  reducerPath: "distributorsApi",
  entityEndpoint: "distributors",
});
```

## Troubleshooting

### Common Issues

1. **URL Building**: Ensure `extraPath` is properly extracted from arguments
2. **Type Errors**: Make sure entity types match the API response structure
3. **Cache Issues**: Use proper cache tags for invalidation
4. **Parameter Handling**: Check that params are properly URL-encoded

### Debug Tips

1. Check the Network tab to see the actual API calls being made
2. Use Redux DevTools to inspect the store state
3. Add console logs to see the extracted parameters
4. Verify the API endpoint structure matches your expectations

## Contributing

When adding new entities:

1. Create the entity type in `types/`
2. Create the store file using `createEntity`
3. Export the generated hooks
4. Add the reducer to the main store
5. Update this documentation with examples

## License

This store implementation is part of the DepleteIQ client application.
