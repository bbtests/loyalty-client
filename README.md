# Bumpa Loyalty Program Client

A modern Next.js-based frontend application for managing a comprehensive loyalty program system with admin dashboard, user interface, and real-time data management.

## 🏗️ Architecture Overview

This client application provides a complete frontend solution featuring:

- **Admin Dashboard**: Comprehensive admin interface for program management
- **User Dashboard**: Customer-facing loyalty program interface
- **Authentication**: Unified login system with role-based access control
- **Real-time Data**: Live updates using Redux Toolkit Query
- **Responsive Design**: Mobile-first design with modern UI components
- **Type Safety**: Full TypeScript implementation

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (if running locally)
- pnpm (if running locally)

### Environment Setup

1. **Copy the environment file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Configure your environment variables:**
   ```bash
   # API Configuration
   NEXT_PUBLIC_API_URL=http://laravel.test/api/v1
   NEXT_PUBLIC_API_KEY=your_api_key_here

   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret_here

   # Development Configuration
   CLIENT_PORT=3000
   ```

## 🐳 Docker Setup

### Option 1: Run Client Only

The client can be started independently using Docker Compose:

```bash
# Start the client only
docker compose up -d

# This will start:
# - Next.js development server (localhost:3000)
# - Hot reloading enabled
# - TypeScript compilation
```

### Option 2: Run Client + API Together

From the root directory, start both services:

```bash
# Start both API and Client
docker compose --profile default up -d
```

### Option 3: Run Everything (Full Stack)

```bash
# Start all services including development tools
docker compose up -d
```

## 🔧 Local Development Setup

If you prefer to run the client locally without Docker:

### 1. Install Dependencies

```bash
# Install pnpm globally (if not already installed)
npm install -g pnpm

# Install project dependencies
pnpm install
```

### 2. Start Development Server

```bash
# Start Next.js development server
pnpm dev

# Or start on a specific port
pnpm dev --port 3001
```

## 🎨 Application Structure

### Pages & Routes

```
app/
├── page.tsx                 # Landing page
├── auth/
│   ├── login/
│   │   └── page.tsx         # Unified login page
│   └── error/
│       └── page.tsx         # Auth error handling
├── admin/
│   └── page.tsx            # Admin dashboard
└── api/
    └── auth/
        └── [...nextauth]/
            └── route.ts     # NextAuth API routes
```

### Components

```
components/
├── admin/                   # Admin-specific components
│   ├── admin-dashboard.tsx  # Main admin dashboard
│   ├── admin-overview.tsx   # Overview statistics
│   ├── user-management.tsx # User management interface
│   ├── admin-analytics.tsx  # Analytics dashboard
│   └── admin-settings.tsx   # Settings management
├── ui/                      # Reusable UI components
│   ├── button.tsx
│   ├── card.tsx
│   ├── table.tsx
│   └── ... (shadcn/ui components)
├── login.tsx               # Unified login component
├── loyalty-dashboard.tsx   # User loyalty dashboard
└── ... (other components)
```

### State Management

```
store/
├── index.ts                # Redux store configuration
├── entityFactory.ts        # RTK Query factory
├── users.ts               # User API slice
├── achievements.ts        # Achievement API slice
├── badges.ts              # Badge API slice
├── transactions.ts        # Transaction API slice
├── loyalty-points.ts      # Loyalty points API slice
└── cashback-payments.ts   # Cashback payments API slice
```

## 🔐 Authentication System

### Unified Login Experience

The application uses a single login page (`/auth/login`) for all users:

- **Admin Users**: Redirected to `/admin` dashboard
- **Regular Users**: Redirected to `/` (main dashboard)
- **Role-based Access**: Automatic role detection and routing

### Authentication Flow

1. User visits `/auth/login`
2. Enters credentials
3. NextAuth.js handles authentication
4. Role-based redirect occurs
5. Session management throughout the app

### Default Admin Credentials

- **Email**: `superadmin@example.com`
- **Password**: `password`
- **Role**: Super Admin

## 📊 Admin Dashboard Features

### Overview Tab
- **User Statistics**: Total users, active users, new registrations
- **Revenue Metrics**: Total revenue, average transaction value
- **Loyalty Points**: Total points earned, redeemed, and current
- **Achievement Stats**: Total achievements, badges earned
- **Recent Activity**: Latest transactions and user activities

### User Management Tab
- **User List**: Paginated user table with search functionality
- **User Details**: Name, email, loyalty points, achievements, badges
- **Pagination**: Previous/Next navigation
- **Search**: Real-time user search by name or email

### Analytics Tab
- **Performance Metrics**: Detailed analytics and insights
- **User Engagement**: Activity patterns and trends
- **Revenue Analysis**: Transaction patterns and revenue trends
- **Loyalty Program Health**: Points distribution and redemption rates

### Settings Tab
- **Achievement Management**: Create, edit, delete achievements
- **Badge Management**: Manage badge tiers and requirements
- **Program Configuration**: Loyalty program settings
- **System Settings**: General application configuration

## 🎯 User Dashboard Features

### Loyalty Dashboard
- **Points Overview**: Current points, earned, redeemed
- **Achievement Progress**: Unlocked achievements and progress
- **Badge Showcase**: Current badges and tier information
- **Transaction History**: Recent purchases and point earnings

### Payment Integration
- **Payment Modal**: Secure payment processing
- **Cashback Requests**: Request cashback payments
- **Payment History**: Complete transaction history
- **Point Redemption**: Redeem points for rewards

## 🔄 Real-time Data Management

### Redux Toolkit Query Integration

The application uses RTK Query for efficient data management:

```typescript
// Example: Fetching users with pagination
const { data: usersResponse, isLoading } = useGetUsersQuery({ page: currentPage })

// Example: Creating a new achievement
const [createAchievement] = useCreateAchievementMutation()
```

### API Integration

- **Automatic Caching**: Intelligent data caching and invalidation
- **Optimistic Updates**: Immediate UI updates with rollback capability
- **Error Handling**: Comprehensive error handling and user feedback
- **Loading States**: Proper loading indicators throughout the app

## 🎨 UI/UX Features

### Design System

Built with modern design principles:

- **shadcn/ui Components**: High-quality, accessible UI components
- **Tailwind CSS**: Utility-first CSS framework
- **Responsive Design**: Mobile-first approach
- **Dark/Light Mode**: Theme switching capability
- **Consistent Spacing**: Design system with consistent spacing and typography

### User Experience

- **Intuitive Navigation**: Clear navigation patterns
- **Loading States**: Proper loading indicators
- **Error Handling**: User-friendly error messages
- **Form Validation**: Real-time form validation
- **Accessibility**: WCAG compliant components

## 🧪 Development Tools

### Code Quality

```bash
# Run TypeScript type checking
pnpm type-check

# Run ESLint
pnpm lint

# Run Prettier
pnpm format
```

### Testing

```bash
# Run tests (if configured)
pnpm test

# Run tests in watch mode
pnpm test:watch
```

## 🚀 Production Deployment

### Build Process

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

### Environment Configuration

```bash
# Production environment variables
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api/v1
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_production_secret
```

### Optimization

- **Code Splitting**: Automatic code splitting by Next.js
- **Image Optimization**: Next.js Image component for optimized images
- **Bundle Analysis**: Built-in bundle analyzer
- **Performance Monitoring**: Core Web Vitals tracking

## 🔧 Troubleshooting

### Common Issues

1. **API Connection Issues**
   ```bash
   # Check API URL configuration
   echo $NEXT_PUBLIC_API_URL
   ```

2. **Authentication Issues**
   ```bash
   # Clear NextAuth session
   # Clear browser cookies and localStorage
   ```

3. **Build Issues**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   pnpm build
   ```

### Development Tips

- **Hot Reloading**: Changes reflect immediately in development
- **TypeScript Errors**: Check terminal for type errors
- **Network Tab**: Use browser dev tools to debug API calls
- **Redux DevTools**: Install Redux DevTools extension for state debugging

## 📱 Mobile Support

The application is fully responsive and mobile-optimized:

- **Mobile-first Design**: Designed for mobile devices first
- **Touch-friendly Interface**: Optimized for touch interactions
- **Responsive Tables**: Tables adapt to mobile screens
- **Mobile Navigation**: Mobile-friendly navigation patterns

## 🔒 Security Features

- **CSRF Protection**: Built-in CSRF protection
- **XSS Prevention**: Input sanitization and validation
- **Secure Authentication**: NextAuth.js security best practices
- **API Security**: Secure API communication with proper headers

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Redux Toolkit Query](https://redux-toolkit.js.org/rtk-query/overview)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.