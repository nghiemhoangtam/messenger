import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import {
  Profile,
  Strategy,
  StrategyOptionsWithRequest,
} from 'passport-facebook';
import { AuthService } from '../auth.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    const facebookClientID: string | undefined =
      configService.get<string>('OAUTH_FACEBOOK_ID');
    const facebookClientSecret: string | undefined = configService.get<string>(
      'OAUTH_FACEBOOK_SECRET',
    );
    const facebookCallbackURL: string | undefined = configService.get<string>(
      'OAUTH_FACEBOOK_REDIRECT_URL',
    );
    if (!facebookClientID || !facebookClientSecret || !facebookCallbackURL) {
      throw new Error('Missing OAuth Facebook configuration');
    }

    super({
      clientID: facebookClientID,
      clientSecret: facebookClientSecret,
      callbackURL: facebookCallbackURL,
      scope: ['email', 'public_profile'],
      profileFields: ['id', 'displayName', 'photos', 'emails'],
    } as StrategyOptionsWithRequest);
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ) {
    const { id, provider, emails, displayName, photos } = profile;
    const email: string | null =
      emails && emails.length > 0 ? emails[0].value : null;
    if (!email) {
      return done(new Error('No email found in Facebook profile'), false);
    }
    const photo: string | null =
      photos && photos.length > 0 ? photos[0].value : null;
    done(null, {
      email,
      provider,
      provider_id: id,
      access_token: accessToken,
      refresh_token: refreshToken,
      display_name: displayName,
      avatar: photo,
    });
  }
}
