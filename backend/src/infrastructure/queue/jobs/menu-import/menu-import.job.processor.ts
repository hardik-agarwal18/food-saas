import { injectable, inject } from 'tsyringe';
import { Job } from 'bullmq';
import { MenuImportJobName, type ProcessMenuImportJob } from '../../types/menu-import.job.types.js';
import { MenuTokens } from '../../../../modules/menu/infrastructure/persistence/tokens/menu.tokens.js';
import type { ProcessMenuImportUseCase } from '../../../../modules/menu/application/use-cases/process-menu-import/process-menu-import.use-case.js';
import { InfrastructureTokens } from '../../../container/tokens/infrastructure.tokens.js';
import type { ILogger } from '../../../../shared/logger/logger.interface.js';

@injectable()
export class MenuImportJobProcessor {
  private readonly logger: ILogger;

  constructor(
    @inject(MenuTokens.ProcessMenuImportUseCase)
    private readonly processMenuImportUseCase: ProcessMenuImportUseCase,
    @inject(InfrastructureTokens.Logger) baseLogger: ILogger,
  ) {
    this.logger = baseLogger.child({ component: 'MenuImportJobProcessor' });
  }

  async process(job: Job): Promise<void> {
    this.logger.info(`Processing job ${job.id} (${job.name})`);

    switch (job.name) {
      case MenuImportJobName.PROCESS_MENU_IMPORT:
        await this.handleProcessMenuImport(job as Job<ProcessMenuImportJob>);
        break;
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  private async handleProcessMenuImport(job: Job<ProcessMenuImportJob>): Promise<void> {
    const { importId } = job.data;
    await this.processMenuImportUseCase.execute({ importId });
  }
}
