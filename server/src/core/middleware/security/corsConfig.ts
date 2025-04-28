import cors from 'cors';
import { env } from '@core/config/environment';

export const corsConfig = cors({
  origin: env.allowedOrigins.split(','),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
});
