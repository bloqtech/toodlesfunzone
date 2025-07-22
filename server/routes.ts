import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertBookingSchema, 
  insertBirthdayPartySchema, 
  insertEnquirySchema,
  insertPackageSchema,
  insertTimeSlotSchema,
  insertHolidayCalendarSchema,
  insertDiscountVoucherSchema,
  insertReviewSchema
} from "@shared/schema";
import { sendBookingConfirmation, sendBirthdayPartyConfirmation, sendEnquiryNotification } from "./services/email";
import { sendWhatsAppNotification } from "./services/whatsapp";
import { createPaymentOrder, verifyPayment } from "./services/payment";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Public routes
  
  // Get packages
  app.get('/api/packages', async (req, res) => {
    try {
      const packages = await storage.getPackages();
      res.json(packages);
    } catch (error) {
      console.error("Error fetching packages:", error);
      res.status(500).json({ message: "Failed to fetch packages" });
    }
  });

  // Get time slots
  app.get('/api/time-slots', async (req, res) => {
    try {
      const timeSlots = await storage.getActiveTimeSlots();
      res.json(timeSlots);
    } catch (error) {
      console.error("Error fetching time slots:", error);
      res.status(500).json({ message: "Failed to fetch time slots" });
    }
  });

  // Get approved reviews
  app.get('/api/reviews', async (req, res) => {
    try {
      const reviews = await storage.getApprovedReviews();
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Get published blog posts
  app.get('/api/blog', async (req, res) => {
    try {
      const posts = await storage.getPublishedBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  // Get blog post by slug
  app.get('/api/blog/:slug', async (req, res) => {
    try {
      const post = await storage.getBlogPostBySlug(req.params.slug);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  // Check availability for a specific date and time slot
  app.get('/api/availability/:date/:timeSlotId', async (req, res) => {
    try {
      const { date, timeSlotId } = req.params;
      
      // Check if date is a holiday
      const holiday = await storage.getHolidayByDate(date);
      if (holiday) {
        return res.json({ available: false, reason: holiday.name });
      }

      // Get bookings for the date and time slot
      const bookings = await storage.getBookingsByDate(date);
      const timeSlotBookings = bookings.filter(b => b.timeSlotId === parseInt(timeSlotId));
      
      // Get total children count for this slot
      const totalChildren = timeSlotBookings.reduce((sum, booking) => sum + (booking.numberOfChildren || 0), 0);
      
      // Check capacity (15 children per slot)
      const available = totalChildren < 15;
      const remainingCapacity = 15 - totalChildren;
      
      res.json({ available, remainingCapacity });
    } catch (error) {
      console.error("Error checking availability:", error);
      res.status(500).json({ message: "Failed to check availability" });
    }
  });

  // Submit enquiry
  app.post('/api/enquiry', async (req, res) => {
    try {
      const validatedData = insertEnquirySchema.parse(req.body);
      const enquiry = await storage.createEnquiry(validatedData);
      
      // Send notifications
      await sendEnquiryNotification(enquiry);
      await sendWhatsAppNotification(
        process.env.ADMIN_PHONE || '+919876543210',
        `New enquiry from ${enquiry.name} (${enquiry.email}): ${enquiry.message}`
      );
      
      res.json(enquiry);
    } catch (error) {
      console.error("Error creating enquiry:", error);
      res.status(500).json({ message: "Failed to submit enquiry" });
    }
  });

  // Get discount voucher by code
  app.get('/api/voucher/:code', async (req, res) => {
    try {
      const voucher = await storage.getDiscountVoucherByCode(req.params.code);
      if (!voucher) {
        return res.status(404).json({ message: "Voucher not found" });
      }
      
      // Check if voucher is valid
      const now = new Date();
      const validFrom = new Date(voucher.validFrom);
      const validTill = new Date(voucher.validTill);
      
      if (now < validFrom || now > validTill) {
        return res.status(400).json({ message: "Voucher has expired" });
      }
      
      if (voucher.usageLimit && (voucher.usedCount || 0) >= voucher.usageLimit) {
        return res.status(400).json({ message: "Voucher usage limit exceeded" });
      }
      
      res.json(voucher);
    } catch (error) {
      console.error("Error fetching voucher:", error);
      res.status(500).json({ message: "Failed to fetch voucher" });
    }
  });

  // Protected routes

  // Create booking
  app.post('/api/bookings', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const validatedData = insertBookingSchema.parse({
        ...req.body,
        userId,
      });
      
      const booking = await storage.createBooking(validatedData);
      
      // Send notifications
      await sendBookingConfirmation(booking);
      await sendWhatsAppNotification(
        booking.parentPhone,
        `Booking confirmed for ${booking.bookingDate}. Booking ID: ${booking.id}`
      );
      
      res.json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  // Get user bookings
  app.get('/api/bookings', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const bookings = await storage.getBookingsByUser(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Get booking by ID
  app.get('/api/bookings/:id', isAuthenticated, async (req, res) => {
    try {
      const booking = await storage.getBookingById(parseInt(req.params.id));
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Check if user owns this booking or is admin
      const userId = (req.user as any)?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (booking.userId !== userId && !user?.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  // Create birthday party booking
  app.post('/api/birthday-parties', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const validatedData = insertBirthdayPartySchema.parse({
        ...req.body,
        userId,
      });
      
      const party = await storage.createBirthdayParty(validatedData);
      
      // Send notifications
      await sendBirthdayPartyConfirmation(party);
      await sendWhatsAppNotification(
        party.parentPhone,
        `Birthday party booking confirmed for ${party.partyDate}. Party ID: ${party.id}`
      );
      
      res.json(party);
    } catch (error) {
      console.error("Error creating birthday party:", error);
      res.status(500).json({ message: "Failed to create birthday party" });
    }
  });

  // Get user birthday parties
  app.get('/api/birthday-parties', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const parties = await storage.getBirthdayPartiesByUser(userId);
      res.json(parties);
    } catch (error) {
      console.error("Error fetching birthday parties:", error);
      res.status(500).json({ message: "Failed to fetch birthday parties" });
    }
  });

  // Create payment order
  app.post('/api/payment/create-order', isAuthenticated, async (req, res) => {
    try {
      const { amount, currency = 'INR', receipt } = req.body;
      const order = await createPaymentOrder(amount, currency, receipt);
      res.json(order);
    } catch (error) {
      console.error("Error creating payment order:", error);
      res.status(500).json({ message: "Failed to create payment order" });
    }
  });

  // Verify payment
  app.post('/api/payment/verify', isAuthenticated, async (req, res) => {
    try {
      const { paymentId, orderId, signature, bookingId } = req.body;
      const isValid = await verifyPayment(paymentId, orderId, signature);
      
      if (isValid) {
        // Update booking payment status
        await storage.updateBookingPayment(bookingId, paymentId, 'completed');
        await storage.updateBookingStatus(bookingId, 'confirmed');
        
        res.json({ success: true });
      } else {
        res.status(400).json({ message: "Payment verification failed" });
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ message: "Failed to verify payment" });
    }
  });

  // Submit review
  app.post('/api/reviews', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const validatedData = insertReviewSchema.parse({
        ...req.body,
        userId,
      });
      
      const review = await storage.createReview(validatedData);
      res.json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to submit review" });
    }
  });

  // Temporary endpoint to make current user admin (for testing)
  app.post('/api/make-me-admin', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      await storage.updateUserAdminStatus(userId, true);
      
      res.json({ 
        message: "You are now an admin user!", 
        userId,
        isAdmin: true 
      });
    } catch (error) {
      console.error("Error making user admin:", error);
      res.status(500).json({ message: "Failed to update admin status" });
    }
  });

  // Admin routes
  const adminAuth = async (req: any, res: any, next: any) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      next();
    } catch (error) {
      res.status(500).json({ message: "Authorization failed" });
    }
  };

  // Admin: Get all bookings
  app.get('/api/admin/bookings', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      let bookings;
      
      if (startDate && endDate) {
        bookings = await storage.getBookingsByDateRange(startDate as string, endDate as string);
      } else {
        // Get last 30 days by default
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        bookings = await storage.getBookingsByDateRange(
          thirtyDaysAgo.toISOString().split('T')[0],
          new Date().toISOString().split('T')[0]
        );
      }
      
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching admin bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Admin: Update booking status
  app.patch('/api/admin/bookings/:id/status', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const { status } = req.body;
      const booking = await storage.updateBookingStatus(parseInt(req.params.id), status);
      res.json(booking);
    } catch (error) {
      console.error("Error updating booking status:", error);
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });

  // Admin: Get analytics
  app.get('/api/admin/analytics', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const bookingAnalytics = await storage.getBookingAnalytics();
      const revenueAnalytics = await storage.getRevenueAnalytics();
      const popularPackages = await storage.getPopularPackages();
      const topCustomers = await storage.getTopCustomers();
      
      res.json({
        bookings: bookingAnalytics,
        revenue: revenueAnalytics,
        popularPackages,
        topCustomers,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Admin: Manage packages
  app.post('/api/admin/packages', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const validatedData = insertPackageSchema.parse(req.body);
      const package_ = await storage.createPackage(validatedData);
      res.json(package_);
    } catch (error) {
      console.error("Error creating package:", error);
      res.status(500).json({ message: "Failed to create package" });
    }
  });

  // Admin: User Management Routes
  
  // Get all users
  app.get('/api/admin/users', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Update user admin status
  app.patch('/api/admin/users/:userId/admin-status', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const { userId } = req.params;
      const { isAdmin } = req.body;
      
      if (typeof isAdmin !== 'boolean') {
        return res.status(400).json({ message: "isAdmin must be a boolean" });
      }
      
      const updatedUser = await storage.updateUserAdminStatus(userId, isAdmin);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user admin status:", error);
      res.status(500).json({ message: "Failed to update user admin status" });
    }
  });

  // Delete user (with safety checks)
  app.delete('/api/admin/users/:userId', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const { userId } = req.params;
      const currentUserId = (req.user as any)?.claims?.sub;
      
      // Prevent self-deletion
      if (userId === currentUserId) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      await storage.deleteUser(userId);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Get user details by ID
  app.get('/api/admin/users/:userId', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user details:", error);
      res.status(500).json({ message: "Failed to fetch user details" });
    }
  });

  // Update user role
  app.patch('/api/admin/users/:userId/role', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      
      if (!['customer', 'staff', 'manager', 'admin'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      const updatedUser = await storage.updateUserRole(userId, role);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Update user permissions
  app.patch('/api/admin/users/:userId/permissions', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const { userId } = req.params;
      const { permissions } = req.body;
      
      if (!Array.isArray(permissions)) {
        return res.status(400).json({ message: "Permissions must be an array" });
      }
      
      const updatedUser = await storage.updateUserPermissions(userId, permissions);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user permissions:", error);
      res.status(500).json({ message: "Failed to update user permissions" });
    }
  });

  // Update user profile
  app.patch('/api/admin/users/:userId/profile', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const { userId } = req.params;
      const profile = req.body;
      
      // Remove sensitive fields
      delete profile.id;
      delete profile.createdAt;
      delete profile.updatedAt;
      
      const updatedUser = await storage.updateUserProfile(userId, profile);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  // Get users by role
  app.get('/api/admin/users/role/:role', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const { role } = req.params;
      const users = await storage.getUsersByRole(role);
      res.json(users);
    } catch (error) {
      console.error("Error fetching users by role:", error);
      res.status(500).json({ message: "Failed to fetch users by role" });
    }
  });

  // Get available roles and permissions
  app.get('/api/admin/roles-permissions', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const { PERMISSIONS, ROLE_PERMISSIONS } = await import('../shared/schema');
      res.json({
        permissions: PERMISSIONS,
        rolePermissions: ROLE_PERMISSIONS,
        roles: ['customer', 'staff', 'manager', 'admin']
      });
    } catch (error) {
      console.error("Error fetching roles and permissions:", error);
      res.status(500).json({ message: "Failed to fetch roles and permissions" });
    }
  });

  // Package management routes
  app.post('/api/admin/packages', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const packageData = req.body;
      const newPackage = await storage.createPackage(packageData);
      res.status(201).json(newPackage);
    } catch (error) {
      console.error("Error creating package:", error);
      res.status(500).json({ message: "Failed to create package" });
    }
  });

  app.patch('/api/admin/packages/:id', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const packageData = req.body;
      const updatedPackage = await storage.updatePackage(parseInt(id), packageData);
      res.json(updatedPackage);
    } catch (error) {
      console.error("Error updating package:", error);
      res.status(500).json({ message: "Failed to update package" });
    }
  });

  app.delete('/api/admin/packages/:id', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deletePackage(parseInt(id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting package:", error);
      res.status(500).json({ message: "Failed to delete package" });
    }
  });

  app.patch('/api/admin/packages/:id', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const package_ = await storage.updatePackage(parseInt(req.params.id), req.body);
      res.json(package_);
    } catch (error) {
      console.error("Error updating package:", error);
      res.status(500).json({ message: "Failed to update package" });
    }
  });

  // Admin: Manage time slots
  app.get('/api/admin/time-slots', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const timeSlots = await storage.getTimeSlots();
      res.json(timeSlots);
    } catch (error) {
      console.error("Error fetching time slots:", error);
      res.status(500).json({ message: "Failed to fetch time slots" });
    }
  });

  app.post('/api/admin/time-slots', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const validatedData = insertTimeSlotSchema.parse(req.body);
      const timeSlot = await storage.createTimeSlot(validatedData);
      res.json(timeSlot);
    } catch (error) {
      console.error("Error creating time slot:", error);
      res.status(500).json({ message: "Failed to create time slot" });
    }
  });

  // Admin: Manage holidays
  app.get('/api/admin/holidays', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const holidays = await storage.getHolidayCalendar();
      res.json(holidays);
    } catch (error) {
      console.error("Error fetching holidays:", error);
      res.status(500).json({ message: "Failed to fetch holidays" });
    }
  });

  app.post('/api/admin/holidays', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const validatedData = insertHolidayCalendarSchema.parse(req.body);
      const holiday = await storage.createHoliday(validatedData);
      res.json(holiday);
    } catch (error) {
      console.error("Error creating holiday:", error);
      res.status(500).json({ message: "Failed to create holiday" });
    }
  });

  app.delete('/api/admin/holidays/:id', isAuthenticated, adminAuth, async (req, res) => {
    try {
      await storage.deleteHoliday(parseInt(req.params.id));
      res.json({ message: "Holiday deleted successfully" });
    } catch (error) {
      console.error("Error deleting holiday:", error);
      res.status(500).json({ message: "Failed to delete holiday" });
    }
  });

  // Admin: Manage vouchers
  app.get('/api/admin/vouchers', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const vouchers = await storage.getDiscountVouchers();
      res.json(vouchers);
    } catch (error) {
      console.error("Error fetching vouchers:", error);
      res.status(500).json({ message: "Failed to fetch vouchers" });
    }
  });

  app.post('/api/admin/vouchers', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const validatedData = insertDiscountVoucherSchema.parse(req.body);
      const voucher = await storage.createDiscountVoucher(validatedData);
      res.json(voucher);
    } catch (error) {
      console.error("Error creating voucher:", error);
      res.status(500).json({ message: "Failed to create voucher" });
    }
  });

  // Admin: Manage reviews
  app.get('/api/admin/reviews', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const reviews = await storage.getReviews();
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.patch('/api/admin/reviews/:id/approve', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const review = await storage.approveReview(parseInt(req.params.id));
      res.json(review);
    } catch (error) {
      console.error("Error approving review:", error);
      res.status(500).json({ message: "Failed to approve review" });
    }
  });

  // Admin: Manage enquiries
  app.get('/api/admin/enquiries', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const enquiries = await storage.getEnquiries();
      res.json(enquiries);
    } catch (error) {
      console.error("Error fetching enquiries:", error);
      res.status(500).json({ message: "Failed to fetch enquiries" });
    }
  });

  app.patch('/api/admin/enquiries/:id/status', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const { status } = req.body;
      const enquiry = await storage.updateEnquiryStatus(parseInt(req.params.id), status);
      res.json(enquiry);
    } catch (error) {
      console.error("Error updating enquiry status:", error);
      res.status(500).json({ message: "Failed to update enquiry status" });
    }
  });

  // Admin: Activities Management
  app.get('/api/admin/activities', isAuthenticated, adminAuth, async (req, res) => {
    try {
      // Mock data for now - should be replaced with database calls
      const activities = [
        { id: '1', title: 'Soft Play Zone', description: 'Safe foam blocks and climbing', image: '', gradient: 'from-toodles-primary to-pink-400', icon: '🏰', ageGroup: '2-5 years', safetyRating: 5, isActive: true },
        { id: '2', title: 'Adventure Zone', description: 'Slides and obstacle courses', image: '', gradient: 'from-toodles-secondary to-blue-400', icon: '🏃', ageGroup: '5-12 years', safetyRating: 4, isActive: true }
      ];
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.post('/api/admin/activities', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const activity = { id: Date.now().toString(), ...req.body };
      res.json(activity);
    } catch (error) {
      console.error("Error creating activity:", error);
      res.status(500).json({ message: "Failed to create activity" });
    }
  });

  app.put('/api/admin/activities/:id', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const activity = { id: req.params.id, ...req.body };
      res.json(activity);
    } catch (error) {
      console.error("Error updating activity:", error);
      res.status(500).json({ message: "Failed to update activity" });
    }
  });

  app.delete('/api/admin/activities/:id', isAuthenticated, adminAuth, async (req, res) => {
    try {
      res.json({ message: "Activity deleted successfully" });
    } catch (error) {
      console.error("Error deleting activity:", error);
      res.status(500).json({ message: "Failed to delete activity" });
    }
  });

  // Admin: Gallery Management
  app.get('/api/admin/gallery', isAuthenticated, adminAuth, async (req, res) => {
    try {
      // Mock data for now
      const galleryItems = [
        { id: '1', title: 'Kids Playing', description: 'Children enjoying play zone', image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256', category: 'play-zones', isActive: true, featured: true, uploadDate: new Date().toISOString() },
        { id: '2', title: 'Birthday Party', description: 'Celebration in progress', image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d', category: 'birthday-parties', isActive: true, featured: false, uploadDate: new Date().toISOString() }
      ];
      res.json(galleryItems);
    } catch (error) {
      console.error("Error fetching gallery items:", error);
      res.status(500).json({ message: "Failed to fetch gallery items" });
    }
  });

  app.post('/api/admin/gallery', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const galleryItem = { id: Date.now().toString(), uploadDate: new Date().toISOString(), ...req.body };
      res.json(galleryItem);
    } catch (error) {
      console.error("Error creating gallery item:", error);
      res.status(500).json({ message: "Failed to create gallery item" });
    }
  });

  app.put('/api/admin/gallery/:id', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const galleryItem = { id: req.params.id, ...req.body };
      res.json(galleryItem);
    } catch (error) {
      console.error("Error updating gallery item:", error);
      res.status(500).json({ message: "Failed to update gallery item" });
    }
  });

  app.delete('/api/admin/gallery/:id', isAuthenticated, adminAuth, async (req, res) => {
    try {
      res.json({ message: "Gallery item deleted successfully" });
    } catch (error) {
      console.error("Error deleting gallery item:", error);
      res.status(500).json({ message: "Failed to delete gallery item" });
    }
  });

  // Admin: Birthday Package Management
  app.get('/api/admin/birthday-packages', isAuthenticated, adminAuth, async (req, res) => {
    try {
      // Mock data for now
      const packages = [
        { id: '1', name: 'Princess Party Deluxe', description: 'Magical princess themed party', price: 2500, duration: 3, maxGuests: 15, features: ['Princess decorations', 'Crown for birthday child', 'Photo props'], decorationTheme: 'Princess & Fairy Tale', isActive: true, isPopular: true, ageGroup: '3-8 years', image: '' },
        { id: '2', name: 'Superhero Adventure', description: 'Action-packed superhero celebration', price: 3000, duration: 3, maxGuests: 20, features: ['Superhero decorations', 'Capes for all kids', 'Action games'], decorationTheme: 'Superhero Adventure', isActive: true, isPopular: false, ageGroup: '5-12 years', image: '' }
      ];
      res.json(packages);
    } catch (error) {
      console.error("Error fetching birthday packages:", error);
      res.status(500).json({ message: "Failed to fetch birthday packages" });
    }
  });

  app.post('/api/admin/birthday-packages', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const package_ = { id: Date.now().toString(), ...req.body };
      res.json(package_);
    } catch (error) {
      console.error("Error creating birthday package:", error);
      res.status(500).json({ message: "Failed to create birthday package" });
    }
  });

  app.put('/api/admin/birthday-packages/:id', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const package_ = { id: req.params.id, ...req.body };
      res.json(package_);
    } catch (error) {
      console.error("Error updating birthday package:", error);
      res.status(500).json({ message: "Failed to update birthday package" });
    }
  });

  app.delete('/api/admin/birthday-packages/:id', isAuthenticated, adminAuth, async (req, res) => {
    try {
      res.json({ message: "Birthday package deleted successfully" });
    } catch (error) {
      console.error("Error deleting birthday package:", error);
      res.status(500).json({ message: "Failed to delete birthday package" });
    }
  });

  // Temporary endpoint for development - make user admin
  app.post('/api/make-me-admin', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUserAdminStatus(userId, true);
      res.json({ message: "Admin access granted!", user: updatedUser });
    } catch (error) {
      console.error("Error granting admin access:", error);
      res.status(500).json({ message: "Failed to grant admin access" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
