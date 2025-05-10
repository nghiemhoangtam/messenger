import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { AuthGuard } from '@nestjs/passport';
import { Model } from 'mongoose';
import { IJwtRequest } from 'src/apis/auth/common/interfaces';
import { User } from 'src/apis/user/schemas';
import { MessageCode } from '../messages/message.enum';
import { MessageService } from '../messages/message.service';

export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly messageService: MessageService,
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
        const msg = await this.messageService.get(
          MessageCode.TOKEN_NOT_PROVIDED,
        );
        throw new UnauthorizedException(msg);
      }
      const payload: { id: string; email: string } = this.jwtService.verify(
        token,
        {
          secret: this.configService.get<string>('JWT_SECRET'),
        },
      );
      const user = await this.userModel.findById(payload.id);
      if (!user) {
        const msg = await this.messageService.get(MessageCode.USER_NOT_FOUND);
        throw new UnauthorizedException(msg);
      }
      request.user = {
        id: user._id as string,
        email: user.email,
      };
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        const msg = await this.messageService.get(MessageCode.TOKEN_EXPIRED);
        throw new UnauthorizedException(msg);
      } else {
        const msg = await this.messageService.get(MessageCode.INVALID_TOKEN);
        throw new UnauthorizedException(msg);
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
