import { LaravelJob } from "@/LaravelJob";
import * as PHP from "@/PhpSerializer";

import crypto from "crypto";

export abstract class Queue {
  getQueue(queue: string) {
    return `queues:${queue}`;
  }

  createPayload<Job extends LaravelJob>(job: Job) {
    return {
      id: crypto.randomBytes(32).toString("hex"),
      uuid: crypto.randomBytes(32).toString('hex'),
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

  abstract size(queue: string): Promise<number>;
  abstract pop<Job extends LaravelJob>(queue: string): Promise<Job>;
  abstract push<Job extends LaravelJob>(job: Job, queue: string): Promise<void>;
}
