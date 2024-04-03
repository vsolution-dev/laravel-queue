import { LaravelJob } from "@/LaravelJob";
import * as PHP from "@/PhpSerializer";

import crypto from "crypto";

const uuid = () => {
  return [1e7]
    .concat(-1e3, -4e3, -8e3, -1e11)
    .join('')
    .replace(/[018]/g, (character: string): string => {
      const value = crypto.getRandomValues(new Uint8Array(1))[0];
      return (Number(character) ^ value & 15 >> Number(character) / 4).toString(16);
    });
}

export abstract class Queue {

  getQueue(queue: string) {
    return `queues:${queue}`;
  }

  createPayload<Job extends LaravelJob>(job: Job) {
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

  abstract pop<Job extends LaravelJob>(queue: string): Promise<Job>;
  abstract push<Job extends LaravelJob>(job: Job, queue: string): Promise<void>;
}
