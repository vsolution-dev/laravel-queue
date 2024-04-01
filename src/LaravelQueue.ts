import { LaravelJob } from "./LaravelJob";
import * as PHP from "./PhpSerializer";
import * as crypto from 'crypto';
import Redis, { RedisOptions } from "ioredis";

export type LaravelQueueOptions = {
  redis: {
    host: string,
    port: number,
    options: RedisOptions,
  },
}

const uuid = () => {
  return [1e7]
    .concat(-1e3, -4e3, -8e3, -1e11).join('')
    .replace(/[018]/g, (character: string): string => {
      const value = crypto.getRandomValues(new Uint8Array(1))[0];
      return (Number(character) ^ value & 15 >> Number(character) / 4).toString(16);
    });
}

export const sleep = (milliseconds: number) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export class LaravelQueue {
  private readonly publisher: Redis;
  private readonly subscriber: Redis;

  constructor (
    private readonly queue: string, {
    redis,
  }: LaravelQueueOptions) {
    this.publisher = new Redis(redis.port, redis.host, redis.options);
    this.subscriber = new Redis(redis.port, redis.host, redis.options);
  }

  private getQueue(queue = null) {
    if (!queue) {
      queue = this.queue;
    }

    return `queues:${queue}`;
  }

  private createPayload<Job extends LaravelJob>(job: Job) {
    return {
      id: crypto.randomBytes(32).toString("hex"),
      uuid: uuid(),
      displayName: job['___PHP_CLASS___'],
      job: 'Illuminate\\Queue\\CallQueuedHandler@call',
      maxTries: null,
      maxExceptions: null,
      failOnTimeout: false,
      backoff: null,
      attempts: 0,
      data: {
        commandName: job['___PHP_CLASS___'],
        command: PHP.stringify(job),
      },
    };
  }

  public async pop<Job extends LaravelJob>(queue: string = null): Promise<Job> {
    do {
      const response = await this.subscriber.blpop(this.getQueue(queue), 1);
      if ( ! response) {
        await sleep(300);
        continue;
      }

      const { data } = JSON.parse(response[1]);

      return PHP.parse(data.command);
    } while (true);
  }

  public async push<Job extends LaravelJob>(job: Job, queue: string = null) {
    const payload = JSON.stringify(this.createPayload(job));
    await this.publisher.rpush(this.getQueue(queue), payload);
  }
}
