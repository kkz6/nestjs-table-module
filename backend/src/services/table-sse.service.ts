import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';

interface ExportEvent {
  jobId: string;
  status: string;
  progress: number;
  downloadUrl?: string;
  error?: string;
}

@Injectable()
export class TableSseService {
  private events$ = new Subject<ExportEvent>();

  emit(event: ExportEvent): void {
    this.events$.next(event);
  }

  getStream(jobId: string): Observable<MessageEvent> {
    return this.events$.pipe(
      filter(e => e.jobId === jobId),
      map(e => ({
        data: JSON.stringify({
          status: e.status,
          progress: e.progress,
          downloadUrl: e.downloadUrl,
          error: e.error,
        }),
      }) as MessageEvent),
    );
  }
}
