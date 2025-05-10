export interface SocialLogin {
  email: string;
  display_name: string;
  avatar?: string;
  provider: string;
  provider_id: string;
  access_token: string;
  refresh_token?: string;
  user_agent?: string;
  ip_address?: string;
}
