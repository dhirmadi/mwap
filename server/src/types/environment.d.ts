declare module './config/environment' {
  interface Environment {
    NODE_ENV: string;
    PORT: string;
    LOG_LEVEL: string;
    MONGO_URI: string;
    AUTH0_DOMAIN: string;
    AUTH0_AUDIENCE: string;
  }
  const environment: Environment;
  export default environment;
}