# Toodles Funzone - Indoor Kids Play Zone Platform

## Overview

This is a full-stack web application for Toodles Funzone, an indoor kids play zone business. The platform provides a comprehensive booking system for play sessions, birthday parties, and includes an admin dashboard for managing operations. The application replicates the functionality of Hamleys' play zone website while being customized for the Toodles brand.

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

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store

### Design System
- **Color Scheme**: Custom Toodles theme with bright, playful colors
- **Typography**: Fredoka One for display text, Open Sans for body text
- **Component Library**: Consistent component system using shadcn/ui
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

## Key Components

### User Management
- Replit Auth integration for secure authentication
- User profiles with admin role support
- Session management with PostgreSQL storage
- Guest checkout functionality for bookings

### Booking System
- **Play Session Bookings**: Time slot-based booking system (10 AM - 8 PM)
- **Birthday Party Bookings**: Specialized party booking with themes and packages
- **Package Management**: Different pricing tiers (walk-in, weekend, monthly)
- **Capacity Management**: Maximum 15 kids per slot with availability tracking

### Content Management
- **Activities**: Showcase of play zone facilities and equipment
- **Packages**: Pricing and feature comparison
- **Gallery**: Photo gallery with category filtering
- **Reviews**: Customer testimonials and feedback system

### Admin Dashboard
- **Booking Management**: View, edit, and manage all bookings
- **Holiday Calendar**: Mark dates as holidays or private events
- **Discount Vouchers**: Create and manage promotional codes
- **Analytics**: Basic reporting on bookings and revenue

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
- **WhatsApp Business API**: Automated messaging for booking updates
- **SMS Integration**: Backup notification system

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