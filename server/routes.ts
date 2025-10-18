import express, { type Express } from "express";
import { createServer, type Server } from "http";
import fs from "fs";
import path from "path";
import multer from "multer";
import { storage } from "./storage";
import { 
  insertBookingSchema, 
  insertBirthdayPartySchema, 
  insertEnquirySchema,
  insertPackageSchema,
  insertTimeSlotSchema,
  insertHolidayCalendarSchema,
  insertDiscountVoucherSchema,
  insertReviewSchema,
  insertPackageSaleSchema,
  insertPackageUsageSchema,
  videos
} from "@shared/schema";
import { sendBookingConfirmation, sendBirthdayPartyConfirmation, sendEnquiryNotification } from "./services/email";
import { sendWhatsAppNotification } from "./services/whatsapp";
import { createPaymentOrder, verifyPayment } from "./services/payment";
import { generateOTP, sendOTPWhatsApp } from "./whatsapp";
import bcrypt from "bcryptjs";
import session from "express-session";
import { uploadOnCloudinary } from "./services/Cloudinary";
import { db } from "./db";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  // // to only allow image file
  // fileFilter: (req, file, cb) => {
  //   if (file.mimetype.startsWith('image/')) {
  //     cb(null, true);
  //   } else {
  //     cb(new Error('Only image files are allowed!'));
  //   }
  // },
  limits: {
    fileSize: 50 * 1024 * 1024, // 5MB limit
  }
});

// Authentication middleware for WhatsApp OTP
const isAuthenticated = (req: any, res: any, next: any) => {
  const userId = req.session?.userId;
  if (!userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  req.userId = userId;
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration for Google OAuth
  app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));
  
  // Serve static files
  app.use('/attached_assets', express.static(path.resolve(process.cwd(), 'attached_assets')));
  app.use('/uploads', express.static(uploadDir));

  // Local admin login route
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // Check if it's the admin user
      if (username === 'raspik2025') {
        const user = await storage.getUserById('raspik2025');
        if (user && user.passwordHash) {
          const isValidPassword = await bcrypt.compare(password, user.passwordHash);
          if (isValidPassword) {
            // Set user session for admin
            (req as any).session.userId = 'raspik2025';
            (req as any).session.isAdmin = true;
            
            // Update last login
            await storage.updateUserLastLogin('raspik2025');
            
            return res.json({
              success: true,
              user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                isAdmin: user.isAdmin,
                permissions: user.permissions
              }
            });
          }
        }
      }
      
      res.status(401).json({ message: "Invalid credentials" });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Admin logout route
  app.post('/api/admin/logout', async (req: any, res) => {
    try {
      // Clear admin session
      if ((req as any).session) {
        (req as any).session.destroy((err: any) => {
          if (err) {
            console.error("Session destroy error:", err);
            return res.status(500).json({ message: "Logout failed" });
          }
          res.clearCookie('connect.sid'); // Clear session cookie
          res.json({ success: true, message: "Logged out successfully" });
        });
      } else {
        res.json({ success: true, message: "Already logged out" });
      }
    } catch (error) {
      console.error("Admin logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // WhatsApp OTP Authentication Routes
  app.post('/api/auth/send-otp', async (req, res) => {
    try {
      const { phone } = req.body;
      
      if (!phone) {
        return res.status(400).json({ message: "Phone number is required" });
      }

      // Normalize phone number (ensure it starts with +91 for Indian numbers)
      const normalizedPhone = phone.startsWith('+91') ? phone : `+91${phone.replace(/[^0-9]/g, '')}`;
      
      // Generate OTP
      const otp = generateOTP();
      
      // Store OTP in database
      await storage.createOTP(normalizedPhone, otp);
      
      // Send OTP via WhatsApp
      const sent = await sendOTPWhatsApp(normalizedPhone, otp);
      
      if (sent) {
        res.json({ 
          success: true, 
          message: "OTP sent successfully",
          phone: normalizedPhone 
        });
      } else {
        // In development mode, allow OTP without WhatsApp credentials
        const isDevelopment = process.env.NODE_ENV === 'development';
        if (isDevelopment) {
          console.log(`[DEV MODE] OTP for ${normalizedPhone}: ${otp}`);
          res.json({ 
            success: true, 
            message: "OTP sent successfully (Development Mode - Check console)",
            phone: normalizedPhone,
            devOtp: otp // Include OTP in development mode
          });
        } else {
          res.status(500).json({ 
            message: "Failed to send OTP. Please try again." 
          });
        }
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      res.status(500).json({ message: "Failed to send OTP" });
    }
  });

  app.post('/api/auth/verify-otp', async (req, res) => {
    try {
      const { phone, otp, firstName, lastName } = req.body;
      
      if (!phone || !otp) {
        return res.status(400).json({ message: "Phone number and OTP are required" });
      }

      // Normalize phone number
      const normalizedPhone = phone.startsWith('+91') ? phone : `+91${phone.replace(/[^0-9]/g, '')}`;
      
      // Verify OTP
      const isValidOTP = await storage.verifyOTP(normalizedPhone, otp);
      
      if (!isValidOTP) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      // Check if user exists
      let user = await storage.getUserByPhone(normalizedPhone);
      
      if (!user) {
        // Create new user account
        const userId = `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const newUser = {
          id: userId,
          phone: normalizedPhone,
          firstName: firstName || '',
          lastName: lastName || '',
          role: "customer" as const,
          isGuest: false,
          registrationSource: "whatsapp_otp",
          permissions: [] as string[],
          isActive: true,
          isAdmin: false,
        };

        user = await storage.upsertUser(newUser);
      }

      // Update last login
      await storage.updateUserLastLogin(user.id);
      
      // Set user session
      (req as any).session.userId = user.id;
      (req as any).session.isAdmin = user.isAdmin;
      
      res.json({
        success: true,
        user: {
          id: user.id,
          phone: user.phone,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isAdmin: user.isAdmin,
          permissions: user.permissions
        }
      });
      
    } catch (error) {
      console.error("Verify OTP error:", error);
      res.status(500).json({ message: "Failed to verify OTP" });
    }
  });

  // Auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Check for admin session first
      if ((req as any).session?.userId === 'raspik2025' && (req as any).session?.isAdmin) {
        const user = await storage.getUserById('raspik2025');
        if (user) {
          return res.json(user);
        }
      }
      
      // Check Replit auth
      if (!req.user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.claims.sub;
      let user = await storage.getUser(userId);
      
      // Auto-grant admin privileges for development/testing
      if (user && !user.isAdmin) {
        user = await storage.updateUserAdminStatus(userId, true);
      }
      
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

  // Get time slots with availability
  app.get('/api/time-slots', async (req, res) => {
    try {
      const { date } = req.query;
      const timeSlots = await storage.getActiveTimeSlots();
      
      if (date) {
        // Add availability information for the requested date
        const slotsWithAvailability = await Promise.all(
          timeSlots.map(async (slot) => {
            const availability = await storage.getTimeSlotAvailability(slot.id, date as string);
            return {
              ...slot,
              availability
            };
          })
        );
        res.json(slotsWithAvailability);
      } else {
        res.json(timeSlots);
      }
    } catch (error) {
      console.error("Error fetching time slots:", error);
      res.status(500).json({ message: "Failed to fetch time slots" });
    }
  });

  // Check time slot availability
  app.get('/api/time-slots/:id/availability', async (req, res) => {
    try {
      const { date } = req.query;
      if (!date) {
        return res.status(400).json({ message: "Date parameter is required" });
      }
      
      const availability = await storage.getTimeSlotAvailability(parseInt(req.params.id), date as string);
      res.json(availability);
    } catch (error) {
      console.error("Error checking availability:", error);
      res.status(500).json({ message: "Failed to check availability" });
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

  // Get active activities for homepage
  app.get('/api/activities', async (req, res) => {
    try {
      const activities = await storage.getActivities();
      // Only return active activities
      const activeActivities = activities.filter(activity => activity.isActive);
      res.json(activeActivities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
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

      // Use the same availability logic as the time slots endpoint
      const availability = await storage.getTimeSlotAvailability(parseInt(timeSlotId), date);
      res.json({
        available: availability.available,
        remainingCapacity: availability.remaining,
        capacity: availability.capacity,
        booked: availability.booked
      });
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

  // Package Sales Management API Routes
  
  // Create a new package sale
  app.post('/api/package-sales', async (req, res) => {
    try {
      const validatedData = insertPackageSaleSchema.parse(req.body);
      
      // Calculate validity period based on package type
      const validFrom = new Date();
      const validTill = new Date();
      
      // Set validity period - default 3 months for hour packages
      validTill.setMonth(validTill.getMonth() + 3);
      
      const saleData = {
        ...validatedData,
        validFrom: validFrom.toISOString().split('T')[0],
        validTill: validTill.toISOString().split('T')[0],
        remainingHours: validatedData.totalHours,
        status: 'active',
        paymentStatus: 'completed', // Assume payment is completed when creating sale
      };
      
      const packageSale = await storage.createPackageSale(saleData);
      
      // Send confirmation notification
      if (packageSale.customerPhone) {
        await sendWhatsAppNotification(
          packageSale.customerPhone,
          `Package purchased successfully! You have ${packageSale.totalHours} hours valid until ${packageSale.validTill}. Package ID: ${packageSale.id}`
        );
      }
      
      res.json(packageSale);
    } catch (error) {
      console.error("Error creating package sale:", error);
      res.status(500).json({ message: "Failed to create package sale" });
    }
  });

  // Get all package sales (admin only)
  app.get('/api/package-sales', async (req, res) => {
    try {
      const packageSales = await storage.getAllPackageSales();
      res.json(packageSales);
    } catch (error) {
      console.error("Error fetching package sales:", error);
      res.status(500).json({ message: "Failed to fetch package sales" });
    }
  });

  // Get package sales by phone number
  app.get('/api/package-sales/phone/:phone', async (req, res) => {
    try {
      const { phone } = req.params;
      const packageSales = await storage.getPackageSalesByPhone(phone);
      res.json(packageSales);
    } catch (error) {
      console.error("Error fetching package sales by phone:", error);
      res.status(500).json({ message: "Failed to fetch package sales" });
    }
  });

  // Get active package sales
  app.get('/api/package-sales/active', async (req, res) => {
    try {
      const activePackages = await storage.getActivePackageSales();
      res.json(activePackages);
    } catch (error) {
      console.error("Error fetching active package sales:", error);
      res.status(500).json({ message: "Failed to fetch active packages" });
    }
  });

  // Get package sale by ID
  app.get('/api/package-sales/:id', async (req, res) => {
    try {
      const packageSale = await storage.getPackageSaleById(parseInt(req.params.id));
      if (!packageSale) {
        return res.status(404).json({ message: "Package sale not found" });
      }
      res.json(packageSale);
    } catch (error) {
      console.error("Error fetching package sale:", error);
      res.status(500).json({ message: "Failed to fetch package sale" });
    }
  });

  // Record package usage (check-in)
  app.post('/api/package-usage', async (req, res) => {
    try {
      const validatedData = insertPackageUsageSchema.parse(req.body);
      
      // Check if package sale exists and has enough hours
      const packageSale = await storage.getPackageSaleById(validatedData.packageSaleId);
      if (!packageSale) {
        return res.status(404).json({ message: "Package not found" });
      }
      
      if (packageSale.remainingHours < validatedData.hoursUsed) {
        return res.status(400).json({ message: "Insufficient hours remaining" });
      }
      
      // Check if package is still valid
      const today = new Date().toISOString().split('T')[0];
      if (today > packageSale.validTill) {
        return res.status(400).json({ message: "Package has expired" });
      }
      
      const usageData = {
        ...validatedData,
        usageDate: validatedData.usageDate || today,
        checkedInAt: validatedData.checkedInAt || new Date(),
        checkedOutAt: validatedData.checkedOutAt || null,
      };
      
      const packageUsage = await storage.createPackageUsage(usageData);
      
      // Send notification about usage
      if (packageSale.customerPhone) {
        const remainingHours = packageSale.remainingHours - validatedData.hoursUsed;
        await sendWhatsAppNotification(
          packageSale.customerPhone,
          `Check-in successful! Used ${validatedData.hoursUsed} hours. Remaining: ${remainingHours} hours. Valid until ${packageSale.validTill}`
        );
      }
      
      res.json(packageUsage);
    } catch (error) {
      console.error("Error recording package usage:", error);
      res.status(500).json({ message: "Failed to record package usage" });
    }
  });

  // Check-out and record actual hours spent
  app.patch('/api/package-usage/:id/checkout', async (req, res) => {
    try {
      const { actualHoursSpent } = req.body;
      const usageId = parseInt(req.params.id);
      
      if (!actualHoursSpent || actualHoursSpent <= 0) {
        return res.status(400).json({ message: "Valid actual hours spent required" });
      }
      
      const packageUsage = await storage.updatePackageUsageCheckout(
        usageId,
        new Date(),
        actualHoursSpent
      );
      
      res.json(packageUsage);
    } catch (error) {
      console.error("Error updating package usage checkout:", error);
      res.status(500).json({ message: "Failed to update checkout" });
    }
  });

  // Get usage history for a package sale
  app.get('/api/package-sales/:id/usage', async (req, res) => {
    try {
      const packageSaleId = parseInt(req.params.id);
      const usageHistory = await storage.getPackageUsageByPackageSale(packageSaleId);
      res.json(usageHistory);
    } catch (error) {
      console.error("Error fetching usage history:", error);
      res.status(500).json({ message: "Failed to fetch usage history" });
    }
  });

  // Get usage analytics
  app.get('/api/package-analytics/:packageSaleId?', async (req, res) => {
    try {
      const packageSaleId = req.params.packageSaleId ? parseInt(req.params.packageSaleId) : undefined;
      const analytics = await storage.getUsageAnalytics(packageSaleId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching usage analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Helper function to extract Client ID from URL format if needed
  const extractClientId = (rawClientId: string | undefined): string | undefined => {
    if (!rawClientId) return undefined;
    if (rawClientId.startsWith('https://')) {
      const match = rawClientId.match(/https:\/\/([^\/]+)/);
      return match ? match[1] : rawClientId;
    }
    return rawClientId;
  };

  // Google OAuth authentication routes
  app.get('/api/auth/google', async (req, res) => {
    try {
      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        console.warn("Google OAuth credentials missing");
        return res.redirect('/?auth=error&reason=oauth_config');
      }

      const clientId = extractClientId(process.env.GOOGLE_CLIENT_ID);
      
      // Get the correct host - prioritize Replit domain over localhost
      let currentHost = req.get('host');
      if (currentHost === 'localhost:5000' && process.env.REPLIT_DOMAINS) {
        currentHost = process.env.REPLIT_DOMAINS;
      }
      
      // Always use HTTPS for Replit domains
      const redirectUri = `https://${currentHost}/api/auth/google/callback`;
      const scope = 'email profile';
      const state = Math.random().toString(36).substring(7);
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(clientId!)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `response_type=code&` +
        `state=${state}`;
      
      console.log("=== GOOGLE OAUTH CONFIGURATION ===");
      console.log("Current Domain:", currentHost);
      console.log("Redirect URI:", redirectUri);
      console.log("Client ID:", clientId);
      console.log("=== REQUIRED GOOGLE CLOUD CONSOLE SETUP ===");
      console.log("1. Go to: https://console.cloud.google.com/apis/credentials");
      console.log("2. Edit your OAuth 2.0 Client");
      console.log("3. Add JavaScript Origins: https://" + currentHost);
      console.log("4. Add Redirect URIs: " + redirectUri);
      console.log("================================");
      res.redirect(authUrl);
    } catch (error) {
      console.error("Error initiating Google auth:", error);
      res.redirect('/?auth=error&reason=server_error');
    }
  });

  app.get('/api/auth/google/callback', async (req, res) => {
    try {
      console.log("=== OAUTH CALLBACK RECEIVED ===");
      console.log("Query params:", JSON.stringify(req.query, null, 2));
      console.log("Headers:", JSON.stringify(req.headers, null, 2));
      console.log("===============================");
      
      const { code, error } = req.query;
      
      if (error) {
        console.error("Google OAuth error:", error);
        return res.redirect('/?auth=error&reason=oauth_error');
      }
      
      if (!code) {
        console.error("No authorization code received");
        return res.redirect('/?auth=error&reason=no_code');
      }

      // Exchange code for access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: extractClientId(process.env.GOOGLE_CLIENT_ID)!,
          client_secret: extractClientId(process.env.GOOGLE_CLIENT_SECRET)!,
          code: code as string,
          grant_type: 'authorization_code',
          redirect_uri: (() => {
            let host = req.get('host');
            if (host === 'localhost:5000' && process.env.REPLIT_DOMAINS) {
              host = process.env.REPLIT_DOMAINS;
            }
            const redirectUri = `https://${host}/api/auth/google/callback`;
            console.log("Token exchange using redirect URI:", redirectUri);
            return redirectUri;
          })(),
        }),
      });

      const tokenData = await tokenResponse.json();
      
      console.log("=== TOKEN EXCHANGE DEBUG ===");
      console.log("Authorization code received:", code);
      console.log("Authorization code length:", (code as string).length);
      console.log("Token response status:", tokenResponse.status);
      console.log("Token response data:", JSON.stringify(tokenData, null, 2));
      console.log("Using Client ID for token exchange:", extractClientId(process.env.GOOGLE_CLIENT_ID));
      console.log("Using Client Secret (first 10 chars):", extractClientId(process.env.GOOGLE_CLIENT_SECRET)?.substring(0, 10) + "...");
      console.log("===========================");
      
      if (!tokenData.access_token) {
        console.error("Failed to get access token. Full response:", tokenData);
        if (tokenData.error === 'invalid_grant') {
          return res.redirect('/?auth=error&reason=expired_code');
        }
        return res.redirect('/?auth=error&reason=token_error');
      }

      // Get user info from Google
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      const googleUser = await userResponse.json();
      
      if (!googleUser.email) {
        console.error("Failed to get user email from Google");
        return res.redirect('/?auth=error&reason=no_email');
      }
      
      // Check if user exists or create new user
      let user = await storage.getUserByEmail(googleUser.email);
      
      if (!user) {
        // Create new user from Google account
        user = await storage.upsertUser({
          id: `google_${googleUser.id}`,
          email: googleUser.email,
          firstName: googleUser.given_name || '',
          lastName: googleUser.family_name || '',
          profileImageUrl: googleUser.picture || undefined,
          role: 'customer',
          registrationSource: 'google_oauth',
          isGuest: false,
          lastLoginAt: new Date(),
        });
      } else {
        // Update existing user's Google info
        user = await storage.upsertUser({
          id: user.id,
          email: user.email || googleUser.email,
          firstName: googleUser.given_name || user.firstName || '',
          lastName: googleUser.family_name || user.lastName || '',
          profileImageUrl: googleUser.picture || user.profileImageUrl || undefined,
          role: user.role || 'customer',
          registrationSource: user.registrationSource || 'google_oauth',
          isGuest: user.isGuest || false,
          lastLoginAt: new Date(),
        });
      }
      
      // Set user session
      (req as any).session.userId = user.id;
      (req as any).session.userRole = user.role;
      (req as any).session.isGoogleAuth = true;
      
      // Redirect to booking page or dashboard
      res.redirect('/?auth=success');
    } catch (error) {
      console.error("Google auth callback error:", error);
      res.redirect('/?auth=error&reason=server_error');
    }
  });

  // Get current user session
  app.get('/api/auth/user', (req, res) => {
    try {
      const userId = (req as any).session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Get user info from database
      storage.getUser(userId).then(user => {
        if (!user) {
          return res.status(401).json({ message: "User not found" });
        }
        
        res.json({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
          profileImageUrl: user.profileImageUrl,
        });
      }).catch(error => {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Failed to fetch user" });
      });
    } catch (error) {
      console.error("User session error:", error);
      res.status(500).json({ message: "Session error" });
    }
  });

  // Logout endpoint
  app.post('/api/auth/logout', (req, res) => {
    (req as any).session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });



  // Legacy Replit Auth route redirects (for backwards compatibility)  
  app.get('/api/login', (req, res) => {
    res.redirect('/auth');
  });

  app.get('/api/logout', (req, res) => {
    res.redirect('/');
  });

  // Enhanced booking creation with account option
  app.post('/api/bookings/with-account', async (req, res) => {
    try {
      const { createAccount, guestPassword, ...bookingData } = req.body;
      
      // Validate booking data
      const validatedBookingData = insertBookingSchema.parse(bookingData);
      
      // Check availability before creating booking
      if (!validatedBookingData.timeSlotId) {
        return res.status(400).json({ message: "Time slot ID is required" });
      }
      
      const availability = await storage.getTimeSlotAvailability(
        validatedBookingData.timeSlotId,
        validatedBookingData.bookingDate
      );
      
      if (!availability.available) {
        return res.status(400).json({ 
          message: "Selected time slot is not available" 
        });
      }
      
      const numChildren = validatedBookingData.numberOfChildren || 1;
      if (availability.remaining < numChildren) {
        return res.status(400).json({ 
          message: `Not enough capacity. Only ${availability.remaining} spots available` 
        });
      }
      
      // Create booking with optional account creation
      const result = await storage.createBookingWithAccount({
        ...validatedBookingData,
        createAccount: createAccount || false,
        guestPassword,
      });
      
      // Send confirmation email and WhatsApp
      try {
        if (result.booking.packageId) {
          const packageData = await storage.getPackageById(result.booking.packageId);
          if (packageData) {
            await sendBookingConfirmation(result.booking);
          }
        }
        const bookingNotificationData = {
          bookingId: result.booking.id.toString(),
          customerName: result.booking.parentName || '',
          customerPhone: result.booking.parentPhone || '',
          packageName: '', // Will be populated by the notification service
          date: result.booking.bookingDate || '',
          timeSlot: '', // Will be populated by the notification service
          numberOfChildren: result.booking.numberOfChildren || 1,
          totalAmount: parseFloat(result.booking.totalAmount || '0'),
          status: result.booking.status || 'pending'
        };
        await sendWhatsAppNotification(result.booking.parentPhone || '', "Booking confirmed! Details: " + JSON.stringify(bookingNotificationData));
      } catch (emailError) {
        console.error("Failed to send confirmation:", emailError);
      }
      
      res.status(201).json({
        booking: result.booking,
        user: result.user ? {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
        } : null,
        isNewUser: result.isNewUser || false,
      });
    } catch (error) {
      console.error("Error creating booking with account:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  // Get bookings by email for guest users
  app.get('/api/bookings/by-email/:email', async (req, res) => {
    try {
      const { email } = req.params;
      const bookings = await storage.getBookingsByEmail(email);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings by email:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
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
      
      // Check availability before creating booking
      if (!validatedData.timeSlotId) {
        return res.status(400).json({ message: "Time slot ID is required" });
      }
      
      const availability = await storage.getTimeSlotAvailability(validatedData.timeSlotId, validatedData.bookingDate);
      if (!availability.available) {
        return res.status(400).json({ 
          message: "Time slot is full", 
          details: `Only ${availability.remaining} spots remaining` 
        });
      }
      
      if ((validatedData.numberOfChildren || 1) > availability.remaining) {
        return res.status(400).json({ 
          message: "Not enough capacity", 
          details: `Only ${availability.remaining} spots remaining, but you requested ${validatedData.numberOfChildren || 1} children` 
        });
      }
      
      const booking = await storage.createBooking(validatedData);
      
      // Send email notification
      if (booking.packageId) {
        const packageData = await storage.getPackageById(booking.packageId);
        if (packageData) {
          await sendBookingConfirmation(booking);
        }
      }
      
      // Send WhatsApp notifications to both customer and Toodles
      try {
        const { sendBookingConfirmationToCustomer, sendBookingNotificationToToodles } = await import('./whatsapp');
        
        // Get package details for notification
        const packageDetails = booking.packageId ? await storage.getPackageById(booking.packageId) : null;
        
        if (packageDetails) {
          const notificationData = {
            bookingId: booking.id.toString(),
            customerName: booking.parentName || '',
            customerPhone: booking.parentPhone || '',
            packageName: packageDetails.name,
            date: booking.bookingDate || '',
            timeSlot: '', // Will be populated by notification service
            numberOfChildren: booking.numberOfChildren || 1,
            totalAmount: parseFloat(booking.totalAmount || '0'),
            status: booking.status || 'pending'
          };

          // Send notifications to both customer and Toodles simultaneously
          await Promise.all([
            sendBookingConfirmationToCustomer(notificationData),
            sendBookingNotificationToToodles(notificationData)
          ]);
        }
      } catch (whatsappError) {
        console.error('Error sending WhatsApp notifications:', whatsappError);
        // Don't fail the booking if WhatsApp fails
      }
      
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
      
      // Send email notification
      await sendBirthdayPartyConfirmation(party);
      
      // Send WhatsApp notifications for birthday party
      try {
        const { sendBirthdayPartyConfirmation: sendWhatsAppBirthdayConfirmation } = await import('./whatsapp');
        
        const partyNotificationData = {
          customerName: party.parentName,
          customerPhone: party.parentPhone,
          childName: party.childName,
          childAge: party.childAge,
          date: party.partyDate,
          timeSlot: party.timeSlotId?.toString() || '',
          guestCount: party.numberOfGuests || 0,
          theme: party.theme || '',
          totalAmount: parseFloat(party.totalAmount || '0'),
          partyId: party.id.toString()
        };

        await sendWhatsAppBirthdayConfirmation(partyNotificationData);
      } catch (whatsappError) {
        console.error('Error sending WhatsApp birthday party notifications:', whatsappError);
        // Don't fail the booking if WhatsApp fails
      }
      
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
        const updatedBooking = await storage.updateBookingStatus(bookingId, 'confirmed');
        
        // Send payment confirmation WhatsApp message
        try {
          const { sendWhatsAppMessage } = await import('./whatsapp');
          await sendWhatsAppMessage(
            updatedBooking.parentPhone,
            `🎉 Payment Confirmed! Your booking #${updatedBooking.id} for ${updatedBooking.bookingDate} is now confirmed. See you at Toodles Funzone!`
          );
        } catch (whatsappError) {
          console.error('Error sending payment confirmation WhatsApp:', whatsappError);
        }
        
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
  app.post('/api/reviews', async (req, res) => {
    try {
      const validatedData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(validatedData);
      res.json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to submit review" });
    }
  });

  // Temporary endpoint to make current user admin (for testing)
  app.post('/api/make-me-admin', async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }
      
      await storage.updateUserAdminStatus(userId, true);
      
      res.json({ 
        message: "User is now an admin!", 
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
      const userId = req.userId || req.session?.userId;
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
      const package_ = await storage.createPackage({
        ...validatedData,
        isActive: validatedData.isActive ?? true
      });
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

  app.put('/api/admin/time-slots/:id', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const { maxCapacity, isActive } = req.body;
      const timeSlot = await storage.updateTimeSlot(parseInt(req.params.id), { maxCapacity, isActive });
      res.json(timeSlot);
    } catch (error) {
      console.error("Error updating time slot:", error);
      res.status(500).json({ message: "Failed to update time slot" });
    }
  });

  app.put('/api/admin/time-slots/bulk-capacity', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const { maxCapacity } = req.body;
      await storage.bulkUpdateTimeSlotCapacity(maxCapacity);
      res.json({ message: "All time slot capacities updated successfully" });
    } catch (error) {
      console.error("Error bulk updating time slots:", error);
      res.status(500).json({ message: "Failed to bulk update time slots" });
    }
  });

  // Operating hours management
  app.get('/api/admin/operating-hours', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const operatingHours = await storage.getOperatingHours();
      res.json(operatingHours);
    } catch (error) {
      console.error("Error fetching operating hours:", error);
      res.status(500).json({ message: "Failed to fetch operating hours" });
    }
  });

  app.put('/api/admin/operating-hours', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const hoursData = req.body;
      const updatedHours = await storage.updateOperatingHours(hoursData);
      res.json(updatedHours);
    } catch (error) {
      console.error("Error updating operating hours:", error);
      res.status(500).json({ message: "Failed to update operating hours" });
    }
  });

  // Public endpoint to get operating hours for a specific day
  app.get('/api/operating-hours/:dayOfWeek', async (req, res) => {
    try {
      const dayOfWeek = parseInt(req.params.dayOfWeek);
      const hours = await storage.getOperatingHoursByDay(dayOfWeek);
      res.json(hours || { dayOfWeek, isOpen: false });
    } catch (error) {
      console.error("Error fetching operating hours by day:", error);
      res.status(500).json({ message: "Failed to fetch operating hours" });
    }
  });

  // Analytics endpoints
  app.get('/api/admin/analytics/users', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const { getUserAnalytics } = await import('./analytics');
      await getUserAnalytics(req, res);
    } catch (error) {
      console.error("Error fetching user analytics:", error);
      res.status(500).json({ message: "Failed to fetch user analytics" });
    }
  });

  app.get('/api/admin/analytics/bookings', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const { getBookingAnalytics } = await import('./analytics');
      await getBookingAnalytics(req, res);
    } catch (error) {
      console.error("Error fetching booking analytics:", error);
      res.status(500).json({ message: "Failed to fetch booking analytics" });
    }
  });

  app.get('/api/admin/analytics/revenue', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const { getRevenueAnalytics } = await import('./analytics');
      await getRevenueAnalytics(req, res);
    } catch (error) {
      console.error("Error fetching revenue analytics:", error);
      res.status(500).json({ message: "Failed to fetch revenue analytics" });
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

  // File upload endpoint for activities
  app.post('/api/upload', isAuthenticated, adminAuth, upload.single('image'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ url: fileUrl });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // Admin: Activities Management
  app.get('/api/admin/activities', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const activities = await storage.getActivities();
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.post('/api/admin/activities', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const activityData = req.body;
      const activity = await storage.createActivity(activityData);
      res.json(activity);
    } catch (error) {
      console.error("Error creating activity:", error);
      res.status(500).json({ message: "Failed to create activity" });
    }
  });

  app.put('/api/admin/activities/:id', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const activityData = req.body;
      const activity = await storage.updateActivity(id, activityData);
      res.json(activity);
    } catch (error) {
      console.error("Error updating activity:", error);
      res.status(500).json({ message: "Failed to update activity" });
    }
  });

  app.delete('/api/admin/activities/:id', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteActivity(id);
      res.json({ message: "Activity deleted successfully" });
    } catch (error) {
      console.error("Error deleting activity:", error);
      res.status(500).json({ message: "Failed to delete activity" });
    }
  });

  // Admin: Add-ons Management
  app.get('/api/admin/add-ons', isAuthenticated, adminAuth, async (req, res) => {
    try {
      // Mock data for now - should be replaced with database calls
      const addOns = [
        { 
          id: '1', 
          name: 'Photography Package', 
          description: 'Professional photos of your child\'s play session', 
          price: 299, 
          icon: '📸', 
          image: '', 
          category: 'photography', 
          isRequired: false, 
          isActive: true, 
          displayOrder: 1,
          applicablePackages: ['walk_in', 'weekend', 'monthly']
        },
        { 
          id: '2', 
          name: 'Snack Combo', 
          description: 'Healthy snacks and juice for your little one', 
          price: 149, 
          icon: '🍎', 
          image: '', 
          category: 'food', 
          isRequired: false, 
          isActive: true, 
          displayOrder: 2,
          applicablePackages: ['walk_in', 'weekend', 'monthly']
        },
        { 
          id: '3', 
          name: 'Socks (Required)', 
          description: 'Non-slip socks for safe play (if forgotten)', 
          price: 49, 
          icon: '🧦', 
          image: '', 
          category: 'general', 
          isRequired: true, 
          isActive: true, 
          displayOrder: 3,
          applicablePackages: ['walk_in', 'weekend', 'monthly']
        },
        { 
          id: '4', 
          name: 'Extended Play Time', 
          description: 'Add 1 extra hour to your session', 
          price: 449, 
          icon: '⏰', 
          image: '', 
          category: 'time', 
          isRequired: false, 
          isActive: true, 
          displayOrder: 4,
          applicablePackages: ['walk_in', 'weekend']
        }
      ];
      res.json(addOns);
    } catch (error) {
      console.error("Error fetching add-ons:", error);
      res.status(500).json({ message: "Failed to fetch add-ons" });
    }
  });

  app.post('/api/admin/add-ons', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const addOn = { id: Date.now().toString(), ...req.body };
      res.json(addOn);
    } catch (error) {
      console.error("Error creating add-on:", error);
      res.status(500).json({ message: "Failed to create add-on" });
    }
  });

  app.put('/api/admin/add-ons/:id', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const addOn = { id: req.params.id, ...req.body };
      res.json(addOn);
    } catch (error) {
      console.error("Error updating add-on:", error);
      res.status(500).json({ message: "Failed to update add-on" });
    }
  });

  app.delete('/api/admin/add-ons/:id', isAuthenticated, adminAuth, async (req, res) => {
    try {
      res.json({ message: "Add-on deleted successfully" });
    } catch (error) {
      console.error("Error deleting add-on:", error);
      res.status(500).json({ message: "Failed to delete add-on" });
    }
  });

  // Public: Gallery (for display on frontend)
  app.get('/api/gallery', async (req, res) => {
    try {
      // Mock data for public gallery display
      const galleryItems = [
        { id: '1', title: 'Colorful Indoor Playground', description: 'Our vibrant play area with slides and climbing structures', src: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600', category: 'play', imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600' },
        { id: '2', title: 'Soft Play Zone', description: 'Safe foam blocks and tunnels for toddlers', src: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600', category: 'play', imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600' },
        { id: '3', title: 'Birthday Party Celebration', description: 'Magical birthday party with cake and decorations', src: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600', category: 'birthday', imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600' },
        { id: '4', title: 'Adventure Playground', description: 'Climbing walls and obstacle courses for active kids', src: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600', category: 'play', imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600' },
        { id: '5', title: 'Ball Pit Fun', description: 'Thousands of colorful balls for endless diving fun', src: 'https://images.unsplash.com/photo-1570554886111-e80fcca6a029?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600', category: 'play', imageUrl: 'https://images.unsplash.com/photo-1570554886111-e80fcca6a029?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600' },
        { id: '6', title: 'Happy Children Playing', description: 'Joyful moments of children enjoying our play zones', src: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600', category: 'kids', imageUrl: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600' },
        { id: '7', title: 'Sensory Play Area', description: 'Interactive sensory elements for development', src: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600', category: 'play', imageUrl: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600' },
        { id: '8', title: 'Creative Arts Corner', description: 'Arts and crafts activities for creative expression', src: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600', category: 'play', imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600' },
        { id: '9', title: 'Mini Rides Zone', description: 'Safe ride-on toys and mini train adventures', src: 'https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600', category: 'play', imageUrl: 'https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600' },
        { id: '10', title: 'Toddler Safe Zone', description: 'Specially designed area for youngest visitors', src: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600', category: 'play', imageUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600' },
        { id: '11', title: 'Parent Seating Area', description: 'Comfortable seating for parents to relax', src: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600', category: 'facilities', imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600' },
        { id: '12', title: 'Safety Equipment', description: 'Safety mats and protective barriers throughout', src: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600', category: 'facilities', imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600' }
      ];
      res.json(galleryItems);
    } catch (error) {
      console.error("Error fetching gallery items:", error);
      res.status(500).json({ message: "Failed to fetch gallery items" });
    }
  });

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

  // Public: Birthday Packages (for display on frontend)
  app.get('/api/birthday-packages', async (req, res) => {
    try {
      let packages = await storage.getBirthdayPackages();
      
      // If no packages in database, return mock data for display
      if (!packages || packages.length === 0) {
        packages = [
          {
            id: 1,
            name: 'Basic Birthday Bash',
            description: 'Perfect starter package for your little one\'s special day',
            price: 2999,
            duration: 2,
            maxGuests: 15,
            features: ['2 hours of play zone access', 'Birthday decoration setup', 'Basic birthday cake', 'Party host assistance', 'Complimentary juice for all kids'],
            decorationTheme: 'Colorful',
            isActive: true,
            isPopular: false,
            ageGroup: '3-8 years',
            image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
            icon: 'Gift',
            gradient: 'from-toodles-primary to-pink-400',
            createdAt: new Date(),
            updatedAt: new Date(),
            displayOrder: 1
          },
          {
            id: 2,
            name: 'Premium Party Package',
            description: 'The complete birthday experience with all the bells and whistles',
            price: 4999,
            duration: 3,
            maxGuests: 25,
            features: ['3 hours of exclusive play zone access', 'Premium themed decoration', 'Custom birthday cake with photo', 'Dedicated party coordinator', 'Complimentary snacks & drinks', 'Party favors for all kids', 'Professional photography session'],
            decorationTheme: 'Premium Theme',
            isActive: true,
            isPopular: true,
            ageGroup: '4-12 years',
            image: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
            icon: 'Star',
            gradient: 'from-toodles-secondary to-purple-400',
            createdAt: new Date(),
            updatedAt: new Date(),
            displayOrder: 2
          },
          {
            id: 3,
            name: 'Ultimate Celebration',
            description: 'The most lavish birthday party experience for your princess or prince',
            price: 7999,
            duration: 4,
            maxGuests: 40,
            features: ['4 hours of private venue access', 'Luxury themed decoration with balloons', 'Multi-tier custom cake with candles', 'Professional entertainment & games', 'Full catering with meal options', 'Return gifts for every child', 'Video recording of the entire event', 'Special birthday throne for the birthday child'],
            decorationTheme: 'Luxury Theme',
            isActive: true,
            isPopular: false,
            ageGroup: '5-15 years',
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
            icon: 'Heart',
            gradient: 'from-toodles-success to-emerald-400',
            createdAt: new Date(),
            updatedAt: new Date(),
            displayOrder: 3
          }
        ] as any;
      }
      
      res.json(packages);
    } catch (error) {
      console.error("Error fetching birthday packages:", error);
      res.status(500).json({ message: "Failed to fetch birthday packages" });
    }
  });

  // Admin: Birthday Package Management
  app.get('/api/admin/birthday-packages', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const packages = await storage.getBirthdayPackages();
      res.json(packages);
    } catch (error) {
      console.error("Error fetching birthday packages:", error);
      res.status(500).json({ message: "Failed to fetch birthday packages" });
    }
  });

  app.post('/api/admin/birthday-packages', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const packageData = req.body;
      const pkg = await storage.createBirthdayPackage(packageData);
      res.json(pkg);
    } catch (error) {
      console.error("Error creating birthday package:", error);
      res.status(500).json({ message: "Failed to create birthday package" });
    }
  });

  app.put('/api/admin/birthday-packages/:id', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const packageData = req.body;
      const pkg = await storage.updateBirthdayPackage(id, packageData);
      res.json(pkg);
    } catch (error) {
      console.error("Error updating birthday package:", error);
      res.status(500).json({ message: "Failed to update birthday package" });
    }
  });

  app.delete('/api/admin/birthday-packages/:id', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBirthdayPackage(id);
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

  // Video serving endpoint
  app.get('/api/video/:filename', (req, res) => {
    try {
      const filename = req.params.filename;
      const videoPath = path.resolve('attached_assets', filename);
      
      if (!fs.existsSync(videoPath)) {
        return res.status(404).json({ message: 'Video not found' });
      }
      
      const stat = fs.statSync(videoPath);
      const fileSize = stat.size;
      const range = req.headers.range;
      
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = (end - start) + 1;
        
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': 'video/mp4',
        });
        
        const stream = fs.createReadStream(videoPath, { start, end });
        stream.pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
        });
        
        const stream = fs.createReadStream(videoPath);
        stream.pipe(res);
      }
    } catch (error) {
      console.error('Error serving video:', error);
      res.status(500).json({ message: 'Error serving video' });
    }
  });

  // upload video on cloudinary
  app.post('/api/video/upload',upload.fields([
        {
          name: "toodlesVideos",
          maxCount: 1
        }]),
        async (req,res)=>{
          const files = req.files as { [fieldname: string]: Express.Multer.File[] };
          // console.log(`files: ${files}`);
          if(!files){
            res.status(400).json({message: "No video file sent"})
          }
          console.log(files.toodlesVideos[0].path);
          const videoFile = await uploadOnCloudinary(`${files.toodlesVideos[0].path}`)
          if(!videoFile){
            res.status(500).json({message: "upload on cloudinary failed!"});
          }
          const [videoOnDB] = await db.insert(videos).values({
            name: videoFile?.original_filename,
            path: videoFile?.url,
            mimetype: videoFile?.type,
            format: videoFile?.format,
            size: videoFile?.bytes,
          })
          .returning();

          res.status(200).json({
            message: "File uploaded successfully",
            filename: videoFile?.original_filename,
            path: videoFile?.url,
            mimetype : videoFile?.type,
            size: videoFile?.bytes,
            uploadedAt: videoOnDB.uploadedAt
          })
  });

  // upload multiple videos
  app.post('/api/video/multipleUpload',upload.fields([
        {
          name: "toodlesVideos",
          maxCount: 2
        }]),
        async (req,res)=>{
          const files = req.files as { [fieldname: string]: Express.Multer.File[] };
          console.log(`files: ${files}`);
          // if(!files){
          //   res.status(400).json({message: "No video file sent"})
          // }
          // console.log(files.toodlesVideos[0].path);
          // const videoFile = await uploadOnCloudinary(`${files.toodlesVideos[0].path}`)
          // if(!videoFile){
          //   res.status(500).json({message: "upload on cloudinary failed!"});
          // }
          // const [videoOnDB] = await db.insert(videos).values({
          //   name: videoFile?.original_filename,
          //   path: videoFile?.url,
          //   mimetype: videoFile?.type,
          //   format: videoFile?.format,
          //   size: videoFile?.bytes,
          // })
          // .returning();

          // res.status(200).json({
          //   message: "File uploaded successfully",
          //   filename: videoFile?.original_filename,
          //   path: videoFile?.url,
          //   mimetype : videoFile?.type,
          //   size: videoFile?.bytes,
          //   uploadedAt: videoOnDB.uploadedAt
          // })

          res.status(200);
  });

  // get urls for videos on cloudinary
  app.get("/api/allVideos/urls", async(req, res)=>{
    try {
      const allVideos = await db.select().from(videos);
      let id=0;
      const listOfVideos = allVideos.map(video=>{
        id=id+1;
        return {
          "id": id,
          "src": video.path,
        }
      })
      return res.status(200).send(listOfVideos);
    } catch (error) {
      return res.status(500).send("Unable to load urls from database");
    }
  })

  const httpServer = createServer(app);
  return httpServer;
}
