import { Module } from '@nestjs/common';
import { redisClient } from './redis.provider';

@Module({
  providers: [
    {
      provide: 'REDIS',
      useFactory: async () => {
        await redisClient.connect();
        return redisClient;
      },
    },
  ],
  exports: ['REDIS'],
})
export class RedisModule {}
