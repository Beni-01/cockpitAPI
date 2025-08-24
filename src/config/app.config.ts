import { registerAs } from '@nestjs/config';

export default registerAs('config', () => ({
  port: 5004,
  nodenv: process.env.NODE_ENV,
}));


