import { LaravelJob } from "@/LaravelJob";
import { Queue } from "@/Queue";

export const sleep = (milliseconds: number) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export class LaravelQueue {

  constructor (
    private readonly driver: Queue
  ) {
  }

  async pop<Job extends LaravelJob>(queue: string[]): Promise<Job> {
    do {
      for (let index = 0; index < queue.length; ++index) {
        const job = await this.driver.pop<Job>(queue[index]);
        if (job !== null) {
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
