import * as PHP from "@/PhpSerializer";
import { LaravelJob } from "@/LaravelJob";
import { Queue } from "@/Queue";

import Redis, {
  Cluster,
  ClusterNode,
  RedisOptions
} from "ioredis";

export class RedisClusterQueue extends Queue {

  private readonly cluster: Cluster;

  constructor (nodes: ClusterNode[], options: RedisOptions) {
    super();

    this.cluster = new Redis.Cluster(nodes, options);
  }

  public async size(queue: string) {
    try {
      return await this.cluster.llen(this.getQueue(queue));
    } catch (error) {
      return 0;
    }
  }

  public async pop<Job extends LaravelJob>(queue: string): Promise<Job> {
    const element = await this.cluster.lpop(this.getQueue(queue));
    if ( ! element) {
      return null;
    }

    const { data } = JSON.parse(element);
    return PHP.parse(data.command);
  }

  public async push<Job extends LaravelJob>(job: Job, queue: string) {
    const payload = JSON.stringify(this.createPayload(job));
    await this.cluster.rpush(this.getQueue(queue), payload);
  }
}
