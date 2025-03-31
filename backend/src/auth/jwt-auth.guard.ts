import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";


export class JwtAuthGuard extends AuthGuard('jwt'){
    canActivate(context: ExecutionContext) {
       return super.canActivate(context);
    }

    handleRequest(err: any,user: any) {
        if (err || !user){
            throw new UnauthorizedException();
        }
        return user;
    }
}