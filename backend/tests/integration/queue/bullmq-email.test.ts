import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { container } from 'tsyringe';
import { Queue, Worker, Job } from 'bullmq';
import { redisConnection } from '../../../src/config/redis.js';
import { BullMQEmailJobQueue } from '../../../src/infrastructure/queue/queues/bullmq-email-job.queue.js';
import { InfrastructureTokens } from '../../../src/infrastructure/container/tokens/infrastructure.tokens.js';
import type { EmailService } from '../../../src/infrastructure/email/email.service.js';
import { EmailJobName } from '../../../src/infrastructure/queue/types/email.job.types.js';

const mockSendVerificationEmail = vi.fn().mockResolvedValue(undefined);
const mockSendResetPasswordEmail = vi.fn().mockResolvedValue(undefined);

vi.mock('../../../src/infrastructure/email/email.service.js', () => {
  return {
    EmailService: vi.fn().mockImplementation(() => ({
      sendVerificationEmail: mockSendVerificationEmail,
      sendResetPasswordEmail: mockSendResetPasswordEmail,
    })),
  };
});

describe('BullMQ Email Queue Integration', () => {
  let emailJobQueue: BullMQEmailJobQueue;
  let mockEmailService: any;
  let emailWorker: Worker;
  let emailQueue: Queue;

  beforeAll(async () => {
    console.log('beforeAll started');
    // Create a mock email service to inject
    mockEmailService = {
      sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
      sendResetPasswordEmail: vi.fn().mockResolvedValue(undefined),
    };

    console.log('registering mock service');
    // Replace the real EmailService with our mock in the container
    container.register(InfrastructureTokens.EmailService, {
      useValue: mockEmailService,
    });

    console.log('importing queue');
    // Now dynamically import the queues and workers so they resolve the mock from the container
    const queueModule = await import('../../../src/infrastructure/queue/queues/email.queue.js');
    emailQueue = queueModule.emailQueue;
    
    console.log('importing worker');
    const workerModule = await import('../../../src/infrastructure/queue/workers/email.worker.js');
    emailWorker = workerModule.emailWorker;

    console.log('obliterating queue');
    // Clear the queue before tests
    await emailQueue.obliterate({ force: true });
    console.log('beforeAll completed');
  });

  afterAll(async () => {
    console.log('afterAll started');
    // Clean up connections
    await emailWorker.close();
    await emailQueue.close();
    console.log('afterAll completed');
  });

  beforeEach(async () => {
    // Clear the mocks
    mockSendVerificationEmail.mockClear();
    mockSendResetPasswordEmail.mockClear();
    mockEmailService.sendVerificationEmail.mockClear();
    mockEmailService.sendResetPasswordEmail.mockClear();

    // Create the queue producer
    emailJobQueue = new BullMQEmailJobQueue();

    // Clear any jobs
    await emailQueue.drain();
  });

  it('should successfully enqueue and process a verification email job', async () => {
    const testData = {
      userId: 'user-123',
      email: 'test@example.com',
      verificationUrl: 'http://localhost/verify?token=abc',
    };

    console.log('waiting for job');
    // 2. Wait for the job to complete (setup listener BEFORE enqueueing)
    const completedJobPromise = new Promise<Job>((resolve, reject) => {
      const onCompleted = (job: Job) => {
        console.log('job completed', job.name);
        if (job.name === EmailJobName.SEND_VERIFICATION_EMAIL) {
          emailWorker.off('completed', onCompleted);
          emailWorker.off('failed', onFailed);
          resolve(job);
        }
      };

      const onFailed = (job: Job | undefined, err: Error) => {
        console.log('job failed', err);
        if (job?.name === EmailJobName.SEND_VERIFICATION_EMAIL) {
          emailWorker.off('completed', onCompleted);
          emailWorker.off('failed', onFailed);
          reject(err);
        }
      };

      emailWorker.on('completed', onCompleted);
      emailWorker.on('failed', onFailed);
    });

    console.log('enqueueing job');
    // 1. Enqueue the job using the producer
    await emailJobQueue.enqueueVerificationEmail(testData);

    const completedJob = await completedJobPromise;
    console.log('job received in test');

    // 3. Assertions
    expect(completedJob).toBeDefined();
    expect(completedJob.data.email).toBe(testData.email);
    expect(completedJob.data.verificationUrl).toBe(testData.verificationUrl);

    // Verify the processor called the email service
    expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
    expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledWith(
      testData.email,
      testData.verificationUrl,
    );
  });

  it('should successfully enqueue and process a reset password email job', async () => {
    const testData = {
      userId: 'user-456',
      email: 'reset@example.com',
      resetPasswordUrl: 'http://localhost/reset?token=xyz',
    };

    // 2. Wait for completion
    const completedJobPromise = new Promise<Job>((resolve, reject) => {
      const onCompleted = (job: Job) => {
        if (job.name === EmailJobName.SEND_RESET_PASSWORD_EMAIL) {
          emailWorker.off('completed', onCompleted);
          emailWorker.off('failed', onFailed);
          resolve(job);
        }
      };

      const onFailed = (job: Job | undefined, err: Error) => {
        if (job?.name === EmailJobName.SEND_RESET_PASSWORD_EMAIL) {
          emailWorker.off('completed', onCompleted);
          emailWorker.off('failed', onFailed);
          reject(err);
        }
      };

      emailWorker.on('completed', onCompleted);
      emailWorker.on('failed', onFailed);
    });

    // 1. Enqueue the job
    await emailJobQueue.enqueueResetPasswordEmail(testData);

    const completedJob = await completedJobPromise;

    // 3. Assertions
    expect(completedJob).toBeDefined();
    expect(mockEmailService.sendResetPasswordEmail).toHaveBeenCalledTimes(1);
    expect(mockEmailService.sendResetPasswordEmail).toHaveBeenCalledWith(
      testData.email,
      testData.resetPasswordUrl,
    );
  });
});
