import { supabase } from "@/config/supabase";
import logger from "@/config/logger";
import { Building, Route, UserBookmark } from "@/types/campus";

function isMissingTableError(error: unknown): error is { message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    String((error as { message: string }).message).includes(
      "Could not find the table",
    )
  );
}

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: string }).message);
  }

  return String(error);
}

export class CampusService {
  /**
   * Get all buildings
   */
  static async getBuildings(): Promise<Building[]> {
    logger.info("Campus: Fetching all buildings");

    const { data, error } = await supabase.from("buildings").select("*");

    if (error) {
      const errorMessage = getErrorMessage(error);
      logger.error(`Campus buildings error: ${errorMessage}`);
      if (isMissingTableError(error)) {
        logger.warn(
          "Campus buildings table is not ready yet; returning empty list.",
        );
        return [];
      }
      throw new Error(`Failed to fetch buildings: ${errorMessage}`);
    }

    return data || [];
  }

  /**
   * Get building by ID
   */
  static async getBuildingById(buildingId: string): Promise<Building | null> {
    logger.info(`Campus: Fetching building ${buildingId}`);

    const { data, error } = await supabase
      .from("buildings")
      .select("*")
      .eq("id", buildingId)
      .single();

    if (error) {
      if (isMissingTableError(error)) {
        logger.warn(
          "Campus buildings table is not ready yet; returning null for building lookup.",
        );
        return null;
      }
      const errorMessage = getErrorMessage(error);
      logger.warn(`Campus building not found: ${buildingId}`);
      return null;
    }

    return data;
  }

  /**
   * Get buildings by category
   */
  static async getBuildingsByCategory(
    category: "academic" | "service" | "residence" | "sport",
  ): Promise<Building[]> {
    logger.info(`Campus: Fetching buildings for category ${category}`);

    const { data, error } = await supabase
      .from("buildings")
      .select("*")
      .eq("category", category);

    if (error) {
      const errorMessage = getErrorMessage(error);
      logger.error(`Campus category error: ${errorMessage}`);
      if (isMissingTableError(error)) {
        logger.warn(
          "Campus buildings table is not ready yet; returning empty category list.",
        );
        return [];
      }
      throw new Error(`Failed to fetch buildings by category: ${errorMessage}`);
    }

    return data || [];
  }

  /**
   * Get all routes
   */
  static async getRoutes(): Promise<Route[]> {
    logger.info("Campus: Fetching all routes");

    const { data, error } = await supabase.from("routes").select("*");

    if (error) {
      const errorMessage = getErrorMessage(error);
      logger.error(`Campus routes error: ${errorMessage}`);
      if (isMissingTableError(error)) {
        logger.warn(
          "Campus routes table is not ready yet; returning empty list.",
        );
        return [];
      }
      throw new Error(`Failed to fetch routes: ${errorMessage}`);
    }

    return data || [];
  }

  /**
   * Get route between two buildings
   * Note: This is a simplified version. In production, use pathfinding algorithm (A*, Dijkstra)
   */
  static async getRouteBetweenBuildings(
    fromId: string,
    toId: string,
  ): Promise<Route | null> {
    logger.info(`Campus: Finding route from ${fromId} to ${toId}`);

    const { data, error } = await supabase
      .from("routes")
      .select("*")
      .or(
        `and(from_id.eq.${fromId},to_id.eq.${toId}),and(from_id.eq.${toId},to_id.eq.${fromId})`,
      )
      .single();

    if (error) {
      if (isMissingTableError(error)) {
        logger.warn(
          "Campus routes table is not ready yet; returning null for route lookup.",
        );
        return null;
      }
      logger.warn(`Campus route not found: ${fromId} -> ${toId}`);
      return null;
    }

    return data;
  }

  /**
   * Add bookmark for user
   */
  static async addBookmark(
    userId: string,
    buildingId: string,
  ): Promise<UserBookmark> {
    logger.info(`Campus: User ${userId} bookmarking building ${buildingId}`);

    const { data, error } = await supabase
      .from("user_bookmarks")
      .insert({
        user_id: userId,
        building_id: buildingId,
      })
      .select()
      .single();

    if (error) {
      const errorMessage = getErrorMessage(error);
      logger.error(`Campus bookmark error: ${errorMessage}`);
      throw new Error(`Failed to add bookmark: ${errorMessage}`);
    }

    if (!data) {
      throw new Error("Failed to add bookmark: No data returned");
    }

    return data;
  }

  /**
   * Remove bookmark for user
   */
  static async removeBookmark(
    userId: string,
    buildingId: string,
  ): Promise<void> {
    logger.info(
      `Campus: User ${userId} removing bookmark for building ${buildingId}`,
    );

    const { error } = await supabase
      .from("user_bookmarks")
      .delete()
      .eq("user_id", userId)
      .eq("building_id", buildingId);

    if (error) {
      const errorMessage = getErrorMessage(error);
      logger.error(`Campus unbookmark error: ${errorMessage}`);
      throw new Error(`Failed to remove bookmark: ${errorMessage}`);
    }
  }

  /**
   * Get user's bookmarks
   */
  static async getUserBookmarks(userId: string): Promise<Building[]> {
    logger.info(`Campus: Fetching bookmarks for user ${userId}`);

    const { data, error } = await supabase
      .from("user_bookmarks")
      .select("building_id")
      .eq("user_id", userId);

    if (error) {
      const errorMessage = getErrorMessage(error);
      logger.error(`Campus bookmarks error: ${errorMessage}`);
      throw new Error(`Failed to fetch bookmarks: ${errorMessage}`);
    }

    // Fetch full building details
    const buildingIds = (data || []).map((b) => b.building_id);
    if (buildingIds.length === 0) {
      return [];
    }

    const { data: buildings, error: buildingError } = await supabase
      .from("buildings")
      .select("*")
      .in("id", buildingIds);

    if (buildingError) {
      const errorMessage = getErrorMessage(buildingError);
      logger.error(`Campus building fetch error: ${errorMessage}`);
      throw new Error(`Failed to fetch bookmarked buildings: ${errorMessage}`);
    }

    return buildings || [];
  }

  /**
   * Get buildings near coordinates (simple distance-based)
   * In production, use PostGIS for better geospatial queries
   */
  static async getBuildingsNearby(
    latitude: number,
    longitude: number,
    radiusKm: number = 1,
  ): Promise<Building[]> {
    logger.info(`Campus: Finding buildings near (${latitude}, ${longitude})`);

    const { data, error } = await supabase.from("buildings").select("*");

    if (error) {
      const errorMessage = getErrorMessage(error);
      logger.error(`Campus nearby error: ${errorMessage}`);
      if (isMissingTableError(error)) {
        logger.warn(
          "Campus buildings table is not ready yet; returning empty nearby list.",
        );
        return [];
      }
      throw new Error(`Failed to fetch nearby buildings: ${errorMessage}`);
    }

    // Simple distance calculation (can be improved with PostGIS)
    const nearby = (data || [])
      .map((building) => ({
        building,
        distance: this.calculateDistance(
          latitude,
          longitude,
          building.latitude,
          building.longitude,
        ),
      }))
      .filter((item) => item.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .map((item) => item.building);

    return nearby;
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
