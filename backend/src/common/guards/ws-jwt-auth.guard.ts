import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {   
    try {
      const client: Socket = context.switchToWs().getClient();      
      
      const token = this.extractTokenFromHeader(client);
      
      if (!token) {
        throw new WsException('Access token not found');
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      // Attach user info to socket
      client.data.user = payload;
      client.data.userId = payload.id; // Use 'id' field instead of 'sub'

      return true;
    } catch (error) {
      throw new WsException('Invalid token');
    }
  }

  private extractTokenFromHeader(client: Socket): string | undefined {    
    // Try to get from headers first
    const authHeader = client.handshake.headers.authorization;
    if (authHeader) {
      const [type, token] = authHeader.split(' ');
      return type === 'Bearer' ? token : undefined;
    }
    
    // Try to get from auth object
    const authObject = client.handshake.auth;
    if (authObject && authObject.token) {
      const token = authObject.token;
      if (token.startsWith('Bearer ')) {
        return token.substring(7); // Remove 'Bearer ' prefix
      }
      return token;
    }
    
    return undefined;
  }
} 