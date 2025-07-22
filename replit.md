# Toodles Funzone - Indoor Kids Play Zone Platform

## Overview

This is a full-stack web application for Toodles Funzone, an indoor kids play zone business. The platform provides a comprehensive booking system for play sessions, birthday parties, and includes an advanced admin dashboard with role-based access control (RBAC). The system features 4 user roles (Customer, Staff, Manager, Admin) with 14 granular permissions for precise access management. Admins can edit all user details, assign roles, and manage permissions through an intuitive interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with custom Toodles theme colors
- **UI Components**: Radix UI primitives with shadcn/ui components
- **State Management**: React Query (TanStack Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds
- **Analytics**: Google Analytics 4 integration with custom event tracking
- **SEO**: Comprehensive meta tags, structured data, sitemap, and robots.txt
- **Performance**: Core Web Vitals tracking and user engagement metrics

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store

### Design System
- **Color Scheme**: Highly festive and vibrant Toodles theme with bright pink, sky blue, sunny yellow, fresh green, vibrant purple, and cheerful orange
- **Background**: Beautiful gradient backgrounds (pink-to-blue for light mode, purple-to-blue for dark mode)
- **Typography**: Fredoka One for display text, Open Sans for body text, Baloo 2 for accent text
- **Animations**: Playful animations including bounce, wiggle, float, rainbow, and pulse-glow effects
- **Component Library**: Enhanced shadcn/ui components with festive styling
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

## Key Components

### User Management & Role-Based Access Control (RBAC)
- **Authentication**: Google OAuth for customer authentication (setup pending credentials) and local admin authentication for superuser access
- **Admin Superuser**: Local admin account (username: raspik2025) with bcryptjs password hashing for secure admin access
- **Customer Authentication**: Google OAuth integration with fallback to guest checkout system
- **Guest Checkout**: Complete guest booking system without requiring account creation
- **Booking Integration**: Seamless account creation during booking flow with Google authentication or guest mode
- **User Roles**: 4-tier system (Customer, Staff, Manager, Admin)
- **Permissions**: 14 granular permissions for precise access control
- **Advanced User Management**: Full profile editing, role assignment, permission management
- **Session Management**: PostgreSQL storage with role persistence and customer sessions
- **Permission System**: Hierarchical permissions with role-based defaults and custom overrides
- **Admin Portal**: Dedicated admin login route (/admin/login) for local administrator access
- **Customer Portal**: Customer login/registration routes (/api/customer/login, /api/customer/register)
- **Booking History**: Customers can view booking history by email (guest) or account (registered users)

### Sequential Video Showcase System
- **Sequential Video Display**: Displays 10 uploaded videos in sequence with auto-advance and loop functionality
- **Video Player Component**: Custom video player with analytics tracking for play/pause events
- **Static File Serving**: Direct video file serving with Express static middleware for reliable playback
- **Responsive Design**: Optimized video display across different device sizes  
- **Auto-Advance Support**: Muted auto-play with configurable advance timing and manual controls

### Booking System
- **Enhanced Booking Flow**: Multi-step booking process with package selection, time slots, date picking, and customer information
- **Guest & Registered Bookings**: Dual booking system supporting both guest checkout and account-based bookings
- **Account Creation During Booking**: Optional customer account creation during the booking process with password setup
- **Play Session Bookings**: Time slot-based booking system with admin-configurable hours
- **Birthday Party Bookings**: Specialized party booking with themes and packages (supports guest and registered users)
- **Package Management**: Different pricing tiers (walk-in, weekend, monthly)
- **Capacity Management**: Admin-controlled capacity limits per time slot with real-time availability tracking
- **Operating Hours**: Flexible daily schedule definition (default: Mon-Fri 10am-8pm, Sat 9am-9pm, Sun closed)
- **Booking History**: Email-based booking lookup for guests and account dashboard for registered users

### Content Management
- **Activities**: Showcase of play zone facilities and equipment
- **Packages**: Pricing and feature comparison
- **Gallery**: Photo gallery with category filtering
- **Reviews**: Customer testimonials and feedback system

### Admin Dashboard & RBAC System
- **User Management**: Advanced interface for editing user profiles, roles, and permissions
- **Role Management**: 4-tier role system with hierarchical permissions
- **Permission Control**: 14 granular permissions for precise access control
- **Booking Management**: View, edit, and manage all bookings (role-based access)
- **Holiday Calendar**: Mark dates as holidays or private events
- **Discount Vouchers**: Create and manage promotional codes
- **Advanced Analytics**: Comprehensive user behavior, booking conversion, and revenue analytics
- **Capacity Management**: Define individual time slot capacity limits and bulk updates
- **Operating Hours Management**: Define custom daily operating hours for flexible scheduling
- **Performance Monitoring**: Real-time tracking of Core Web Vitals and user engagement

## Data Flow

### Authentication Flow
1. User clicks login → redirected to Replit Auth
2. Successful authentication → user session created
3. User data stored in PostgreSQL with profile information
4. Session tokens managed through secure cookies

### Booking Flow
1. User selects package and time slot
2. System checks availability against existing bookings
3. Voucher codes validated if provided
4. Payment processing through Razorpay integration
5. Email and WhatsApp notifications sent
6. Booking confirmation stored in database

### Admin Operations
1. Admin login through same auth system with role check
2. Dashboard provides overview of daily operations
3. Booking modifications update database and trigger notifications
4. Holiday calendar affects availability calculations
5. Voucher system applies discounts at checkout

## External Dependencies

### Payment Integration
- **Razorpay**: Primary payment gateway for booking transactions
- **Payment Verification**: Webhook handling for payment confirmations
- **Refund Management**: Support for cancellations and refunds

### Communication Services
- **Email Service**: Nodemailer for booking confirmations and notifications
- **WhatsApp Business API**: Comprehensive automated messaging system for dual notifications
- **Dual Notification System**: Both customers and business receive WhatsApp notifications for bookings
- **Multi-Event Notifications**: Booking confirmations, birthday party bookings, payment confirmations, and cancellations
- **Rich Message Format**: Structured messages with booking details, business information, and branding

### Database and Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database queries and migrations
- **Connection Pooling**: Efficient database connection management

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across frontend and backend
- **ESLint/Prettier**: Code formatting and linting
- **Replit Integration**: Development environment optimization

## Deployment Strategy

### Development Environment
- **Hot Reloading**: Vite dev server with HMR
- **Database Seeding**: Automatic population of initial data
- **Environment Variables**: Secure configuration management
- **Development Banner**: Replit-specific development indicators

### Production Build
- **Frontend**: Vite build with optimized bundling
- **Backend**: ESBuild compilation for Node.js runtime
- **Static Assets**: Efficient serving of images and fonts
- **Database Migrations**: Automated schema updates

### Monitoring and Maintenance
- **Error Handling**: Comprehensive error boundaries and logging
- **Performance**: Optimized queries and caching strategies
- **Security**: Input validation and sanitization
- **Backup**: Regular database backups and recovery procedures

The application is designed to be scalable, maintainable, and user-friendly, providing a complete solution for managing an indoor kids play zone business with modern web technologies.