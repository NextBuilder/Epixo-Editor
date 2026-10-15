interface CloudflareEnv {
  DB: D1Database;
  MEDIA?: R2Bucket;
  MEDIA_KV?: KVNamespace;
  ASSETS: Fetcher;
  SITE_URL: string;
  AI_MODEL: string;
  FREE_AI_CREDITS: string;
  DEV_LOGIN?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  ANTHROPIC_API_KEY?: string;
  ADMIN_HANDLES?: string;
}
