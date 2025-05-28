import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected getTracker(req: Request): Promise<string> {
    if (req.ips && req.ips.length > 0) {
      return Promise.resolve(req.ips[0]); // First IP in the proxy chain
    }
    return Promise.resolve(req.ip || ''); // Fallback to req.ip
  }
}
