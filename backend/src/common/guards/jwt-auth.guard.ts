import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { AuthGuard } from '@nestjs/passport';
import { Model } from 'mongoose';
import { IJwtRequest } from 'src/apis/auth/common/interfaces';
import { User } from 'src/apis/user/schemas';
import { MessageCode } from '../messages/message.enum';

export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: IJwtRequest = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    try {
      if (!token) {
        throw new UnauthorizedException(MessageCode.TOKEN_NOT_PROVIDED);
      }
      const payload: { id: string; email: string } = this.jwtService.verify(
        token,
        {
          secret: this.configService.get<string>('JWT_SECRET'),
        },
      );
      const user = await this.userModel.findById(payload.id);
      if (!user) {
        throw new UnauthorizedException(MessageCode.USER_NOT_FOUND);
      }
      request.user = {
        id: user._id as string,
        email: user.email,
      };
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException(MessageCode.TOKEN_EXPIRED);
      } else {
        throw new UnauthorizedException(MessageCode.INVALID_TOKEN);
      }
    }
    return true;
  }

  private extractTokenFromHeader(request: IJwtRequest): string | null {
    const authHeader = request.headers['authorization'];
    if (!authHeader) return null;

    const [bearer, token] = authHeader.split(' ');
    return bearer === 'Bearer' && token ? token : null;
  }
}
