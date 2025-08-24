export interface TokenResponse {
    access_token: string;
    refresh_token?: string;
    token_type: 'bearer' | string;
}