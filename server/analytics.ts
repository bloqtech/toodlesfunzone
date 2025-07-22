import { Request, Response } from 'express';
import { db } from './db';
import { bookings, users, packages, birthdayParties } from '@shared/schema';
import { eq, and, gte, lte, count, sql, desc } from 'drizzle-orm';

// User behavior analytics
export async function getUserAnalytics(req: Request, res: Response) {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    // User registration analytics
    const userRegistrations = await db
      .select({
        date: sql<string>`DATE(${users.createdAt})`,
        count: count()
      })
      .from(users)
      .where(and(
        gte(users.createdAt, start),
        lte(users.createdAt, end)
      ))
      .groupBy(sql`DATE(${users.createdAt})`)
      .orderBy(sql`DATE(${users.createdAt})`);

    // User engagement by role
    const usersByRole = await db
      .select({
        role: users.role,
        count: count()
      })
      .from(users)
      .groupBy(users.role);

    // Active users (users who made bookings in the period)
    const activeUsers = await db
      .select({
        userId: bookings.userId,
        bookingCount: count(),
        totalSpent: sql<string>`SUM(${bookings.totalAmount})`
      })
      .from(bookings)
      .where(and(
        gte(bookings.createdAt, start),
        lte(bookings.createdAt, end),
        eq(bookings.status, 'confirmed')
      ))
      .groupBy(bookings.userId)
      .orderBy(desc(count()));

    res.json({
      userRegistrations,
      usersByRole,
      activeUsers: activeUsers.length,
      topUsers: activeUsers.slice(0, 10)
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({ message: 'Failed to fetch user analytics' });
  }
}

// Booking conversion analytics
export async function getBookingAnalytics(req: Request, res: Response) {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    // Booking conversion funnel
    const totalBookings = await db
      .select({ count: count() })
      .from(bookings)
      .where(and(
        gte(bookings.createdAt, start),
        lte(bookings.createdAt, end)
      ));

    const confirmedBookings = await db
      .select({ count: count() })
      .from(bookings)
      .where(and(
        gte(bookings.createdAt, start),
        lte(bookings.createdAt, end),
        eq(bookings.status, 'confirmed')
      ));

    const cancelledBookings = await db
      .select({ count: count() })
      .from(bookings)
      .where(and(
        gte(bookings.createdAt, start),
        lte(bookings.createdAt, end),
        eq(bookings.status, 'cancelled')
      ));

    // Popular time slots
    const popularTimeSlots = await db
      .select({
        timeSlotId: bookings.timeSlotId,
        count: count()
      })
      .from(bookings)
      .where(and(
        gte(bookings.createdAt, start),
        lte(bookings.createdAt, end),
        eq(bookings.status, 'confirmed')
      ))
      .groupBy(bookings.timeSlotId)
      .orderBy(desc(count()))
      .limit(10);

    // Package popularity
    const packagePopularity = await db
      .select({
        packageId: bookings.packageId,
        count: count(),
        revenue: sql<string>`SUM(${bookings.totalAmount})`
      })
      .from(bookings)
      .where(and(
        gte(bookings.createdAt, start),
        lte(bookings.createdAt, end),
        eq(bookings.status, 'confirmed')
      ))
      .groupBy(bookings.packageId)
      .orderBy(desc(count()));

    // Daily booking trends
    const dailyBookings = await db
      .select({
        date: sql<string>`DATE(${bookings.createdAt})`,
        count: count(),
        revenue: sql<string>`SUM(${bookings.totalAmount})`
      })
      .from(bookings)
      .where(and(
        gte(bookings.createdAt, start),
        lte(bookings.createdAt, end),
        eq(bookings.status, 'confirmed')
      ))
      .groupBy(sql`DATE(${bookings.createdAt})`)
      .orderBy(sql`DATE(${bookings.createdAt})`);

    const conversionRate = totalBookings[0].count > 0 
      ? (confirmedBookings[0].count / totalBookings[0].count) * 100 
      : 0;

    res.json({
      conversionRate: Math.round(conversionRate * 100) / 100,
      totalBookings: totalBookings[0].count,
      confirmedBookings: confirmedBookings[0].count,
      cancelledBookings: cancelledBookings[0].count,
      popularTimeSlots,
      packagePopularity,
      dailyBookings
    });
  } catch (error) {
    console.error('Error fetching booking analytics:', error);
    res.status(500).json({ message: 'Failed to fetch booking analytics' });
  }
}

// Revenue analytics
export async function getRevenueAnalytics(req: Request, res: Response) {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    // Total revenue
    const totalRevenue = await db
      .select({
        total: sql<string>`SUM(${bookings.totalAmount})`
      })
      .from(bookings)
      .where(and(
        gte(bookings.createdAt, start),
        lte(bookings.createdAt, end),
        eq(bookings.status, 'confirmed')
      ));

    // Revenue by package type
    const revenueByPackage = await db
      .select({
        packageId: bookings.packageId,
        revenue: sql<string>`SUM(${bookings.totalAmount})`,
        count: count()
      })
      .from(bookings)
      .leftJoin(packages, eq(bookings.packageId, packages.id))
      .where(and(
        gte(bookings.createdAt, start),
        lte(bookings.createdAt, end),
        eq(bookings.status, 'confirmed')
      ))
      .groupBy(bookings.packageId);

    // Monthly revenue trend
    const monthlyRevenue = await db
      .select({
        month: sql<string>`DATE_TRUNC('month', ${bookings.createdAt})`,
        revenue: sql<string>`SUM(${bookings.totalAmount})`,
        bookingCount: count()
      })
      .from(bookings)
      .where(and(
        gte(bookings.createdAt, start),
        lte(bookings.createdAt, end),
        eq(bookings.status, 'confirmed')
      ))
      .groupBy(sql`DATE_TRUNC('month', ${bookings.createdAt})`)
      .orderBy(sql`DATE_TRUNC('month', ${bookings.createdAt})`);

    // Average order value
    const avgOrderValue = await db
      .select({
        avg: sql<string>`AVG(${bookings.totalAmount})`
      })
      .from(bookings)
      .where(and(
        gte(bookings.createdAt, start),
        lte(bookings.createdAt, end),
        eq(bookings.status, 'confirmed')
      ));

    res.json({
      totalRevenue: totalRevenue[0].total || '0',
      averageOrderValue: avgOrderValue[0].avg || '0',
      revenueByPackage,
      monthlyRevenue
    });
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    res.status(500).json({ message: 'Failed to fetch revenue analytics' });
  }
}