import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import {
  Profile,
  Strategy,
  StrategyOptionsWithRequest,
  VerifyCallback,
} from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    const googleClientID: string | undefined =
      configService.get<string>('OAUTH_GOOGLE_ID');
    const googleClientSecret: string | undefined = configService.get<string>(
      'OAUTH_GOOGLE_SECRET',
    );
    const googleCallbackURL: string | undefined = configService.get<string>(
      'OAUTH_GOOGLE_REDIRECT_URL',
    );
    if (!googleClientID || !googleClientSecret || !googleCallbackURL) {
      throw new Error('Missing OAuth Google configuration');
    }
    super({
      clientID: googleClientID,
      clientSecret: googleClientSecret,
      callbackURL: googleCallbackURL,
      scope: ['email', 'profile'],
      passReqToCallback: true,
    } as StrategyOptionsWithRequest);
  }

  validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const { id: providerId, provider, emails, displayName } = profile;
    const email: string | null =
      emails && emails.length > 0 ? emails[0].value : null;
    if (!email) {
      return done(new Error('No email found in Google profile'), false);
    }
    done(null, {
      email,
      provider,
      provider_id: providerId,
      access_token: accessToken,
      refresh_token: refreshToken,
      display_name: displayName,
      avatar: profile._json.picture,
    });
  }
}
