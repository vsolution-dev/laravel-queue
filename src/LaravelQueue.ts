import { ClusterNode, RedisOptions } from "ioredis";

import { LaravelJob } from "./LaravelJob";
import { Queue } from "./Queue";
import { RedisQueue } from "./RedisQueue";
import { RedisClusterQueue } from "./RedisClusterQueue";

export const sleep = (milliseconds: number) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export class LaravelQueue {
  static redis(options: RedisOptions) {
    return new LaravelQueue(new RedisQueue(options));
  }

  static redisCluster(nodes: ClusterNode[], options: RedisOptions) {
    return new LaravelQueue(new RedisClusterQueue(nodes, options));
  }

  constructor (
    private readonly driver: Queue
  ) {
  }

  size(queue: string) {
    return this.driver.size(queue);
  }

  async pop<Job extends LaravelJob>(queue: string[]): Promise<Job> {
    do {
      for (let index = 0; index < queue.length; ++index) {
        const job = await this.driver.pop<Job>(queue[index]);
        if (job) {
          return job;
        }
      }

      await sleep(300);
    } while (true);
  }

  async push<Job extends LaravelJob>(job: Job, queue: string) {
    await this.driver.push(job, queue);
  }
}
