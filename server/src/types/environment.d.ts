declare module './config/environment' {
  interface Environment {
    server: {
      port: number;
      host?: string;
    };
    nodeEnv: string;
    mongoUri: string;
    auth0: {
      audience: string;
      domain: string;
    };
    security: {
      corsOrigin: string;
    };
  }
  const environment: Environment;
  export default environment;
}