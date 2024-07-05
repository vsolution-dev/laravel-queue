import * as PHP from "./PhpSerializer";
import { LaravelJob } from "./LaravelJob";
import { Queue } from "./Queue";

import Redis, { RedisOptions } from "ioredis";

export class RedisQueue extends Queue {

  private readonly publisher: Redis;
  private readonly subscriber: Redis;

  constructor (options: RedisOptions) {
    super();

    this.publisher = new Redis(options);
    this.subscriber = new Redis(options);
  }

  public async size(queue: string) {
    try {
      return await this.subscriber.llen(this.getQueue(queue));
    } catch (error) {
      return 0;
    }
  }

  public async pop<Job extends LaravelJob>(queue: string): Promise<Job> {
    const element = await this.subscriber.lpop(this.getQueue(queue));
    if ( ! element) {
      return null;
    }

    const { data } = JSON.parse(element);
    return PHP.parse(data.command);
  }

  public async push<Job extends LaravelJob>(job: Job, queue: string) {
    const payload = JSON.stringify(this.createPayload(job));
    await this.publisher.rpush(this.getQueue(queue), payload);
  }
}
