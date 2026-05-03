import { Router, Request, Response } from "express";
import logger from "@/config/logger";
import { CampusService } from "@/services/campus.service";
import { requireAuth, optionalAuth } from "@/middleware/auth";
import { ValidationError, NotFoundError } from "@/middleware/errorHandler";

const router = Router();

/**
 * GET /api/campus/buildings
 * Get all buildings
 */
router.get(
  "/buildings",
  optionalAuth,
  async (req: Request, res: Response, next) => {
    try {
      logger.info("Campus: Fetching all buildings");

      const buildings = await CampusService.getBuildings();

      res.json({
        count: buildings.length,
        buildings,
      });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * GET /api/campus/buildings/:id
 * Get building by ID
 */
router.get(
  "/buildings/:id",
  optionalAuth,
  async (req: Request, res: Response, next) => {
    try {
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      logger.info(`Campus: Fetching building ${id}`);

      const building = await CampusService.getBuildingById(id);

      if (!building) {
        throw new NotFoundError(`Building ${id} not found`);
      }

      res.json(building);
    } catch (err) {
      next(err);
    }
  },
);

/**
 * GET /api/campus/buildings/category/:category
 * Get buildings by category
 */
router.get(
  "/buildings/category/:category",
  optionalAuth,
  async (req: Request, res: Response, next) => {
    try {
      let category = Array.isArray(req.params.category)
        ? req.params.category[0]
        : req.params.category;

      if (
        !["academic", "service", "residence", "sport"].includes(category as any)
      ) {
        throw new ValidationError(
          "Invalid category. Must be: academic, service, residence, or sport",
        );
      }

      logger.info(`Campus: Fetching buildings for category ${category}`);

      const buildings = await CampusService.getBuildingsByCategory(
        category as any,
      );

      res.json({
        category,
        count: buildings.length,
        buildings,
      });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * GET /api/campus/routes/:from/:to
 * Get route between two buildings
 */
router.get(
  "/routes/:from/:to",
  optionalAuth,
  async (req: Request, res: Response, next) => {
    try {
      const from = Array.isArray(req.params.from)
        ? req.params.from[0]
        : req.params.from;
      const to = Array.isArray(req.params.to)
        ? req.params.to[0]
        : req.params.to;

      logger.info(`Campus: Finding route from ${from} to ${to}`);

      const route = await CampusService.getRouteBetweenBuildings(from, to);

      if (!route) {
        throw new NotFoundError(`No route found from ${from} to ${to}`);
      }

      res.json(route);
    } catch (err) {
      next(err);
    }
  },
);

/**
 * GET /api/campus/routes
 * Get all routes
 */
router.get(
  "/routes",
  optionalAuth,
  async (_req: Request, res: Response, next) => {
    try {
      logger.info("Campus: Fetching all routes");

      const routes = await CampusService.getRoutes();

      res.json({
        count: routes.length,
        routes,
      });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * GET /api/campus/nearby
 * Get buildings near coordinates
 * Query params: lat, lng, radius=1 (km)
 */
router.get(
  "/nearby",
  optionalAuth,
  async (req: Request, res: Response, next) => {
    try {
      let { lat, lng, radius } = req.query;

      // Handle arrays (shouldn't happen but TypeScript requires this)
      if (Array.isArray(lat)) lat = lat[0];
      if (Array.isArray(lng)) lng = lng[0];
      if (Array.isArray(radius)) radius = radius[0];

      if (!lat || !lng) {
        throw new ValidationError(
          "latitude (lat) and longitude (lng) required",
        );
      }

      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);
      const radiusKm = parseInt(radius as string) || 1;

      if (isNaN(latitude) || isNaN(longitude)) {
        throw new ValidationError("Invalid latitude or longitude");
      }

      logger.info(`Campus: Finding buildings near (${latitude}, ${longitude})`);

      const buildings = await CampusService.getBuildingsNearby(
        latitude,
        longitude,
        radiusKm,
      );

      res.json({
        location: { latitude, longitude },
        radius: radiusKm,
        count: buildings.length,
        buildings,
      });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * POST /api/campus/bookmark
 * Add building to user bookmarks (protected)
 * Request body: { buildingId: string }
 */
router.post(
  "/bookmark",
  requireAuth,
  async (req: Request, res: Response, next) => {
    try {
      const { buildingId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new ValidationError("User ID required");
      }

      if (!buildingId) {
        throw new ValidationError("Building ID required");
      }

      logger.info(`Campus: User ${userId} bookmarking building ${buildingId}`);

      // Verify building exists
      const building = await CampusService.getBuildingById(buildingId);
      if (!building) {
        throw new NotFoundError(`Building ${buildingId} not found`);
      }

      const bookmark = await CampusService.addBookmark(userId, buildingId);

      res.status(201).json({
        message: "Building bookmarked successfully",
        bookmark,
      });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * DELETE /api/campus/bookmark/:buildingId
 * Remove building from user bookmarks (protected)
 */
router.delete(
  "/bookmark/:buildingId",
  requireAuth,
  async (req: Request, res: Response, next) => {
    try {
      const buildingId = Array.isArray(req.params.buildingId)
        ? req.params.buildingId[0]
        : req.params.buildingId;
      const userId = req.user?.id;

      if (!userId) {
        throw new ValidationError("User ID required");
      }

      logger.info(
        `Campus: User ${userId} removing bookmark for building ${buildingId}`,
      );

      await CampusService.removeBookmark(userId, buildingId);

      res.json({
        message: "Bookmark removed successfully",
      });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * GET /api/campus/bookmarks
 * Get user's bookmarked buildings (protected)
 */
router.get(
  "/bookmarks",
  requireAuth,
  async (req: Request, res: Response, next) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new ValidationError("User ID required");
      }

      logger.info(`Campus: Fetching bookmarks for user ${userId}`);

      const bookmarks = await CampusService.getUserBookmarks(userId);

      res.json({
        count: bookmarks.length,
        bookmarks,
      });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
