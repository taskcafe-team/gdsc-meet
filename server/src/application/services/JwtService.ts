import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Cache } from "cache-manager";

@Injectable()
export class CustomJwtService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly cacheManager: Cache,
  ) {}

  async generateTokens(userId: string) {
    const accessToken = this.jwtService.sign({ userId });
    const refreshToken = this.jwtService.sign({ userId }, { expiresIn: "7d" }); // Refresh token with longer expiry

    // Store the refresh token in cache
    await this.cacheManager.set(userId, refreshToken);

    return { accessToken, refreshToken };
  }

  async refreshToken(oldRefreshToken: string) {
    try {
      const { userId } = this.jwtService.verify(oldRefreshToken);

      // Check if the refresh token is in cache
      const storedRefreshToken = await this.cacheManager.get(userId);
      if (storedRefreshToken !== oldRefreshToken) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      // Generate new tokens
      const newTokens = await this.generateTokens(userId);

      return newTokens;
    } catch (error) {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }
}
