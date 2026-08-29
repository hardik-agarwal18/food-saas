import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../shared/utils/CatchAsync.js";
import { getHealthStatus } from "../infrastructure/observability/health.service.js";

export class HealthController {
  constructor() {}

  live = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json({
      success: true,
      status: "alive",
      timestamp: new Date().toISOString(),
    });
  });

  health = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const services = await getHealthStatus();

      return res.status(200).json({
        success: true,
        status: "ready",
        services,
        timestamp: new Date().toISOString(),
      });
    },
  );
}
