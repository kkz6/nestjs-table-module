import { TableSseService } from '../table-sse.service';
import { firstValueFrom, take, toArray } from 'rxjs';

describe('TableSseService', () => {
  let service: TableSseService;

  beforeEach(() => {
    service = new TableSseService();
  });

  it('receives emitted events via getStream', async () => {
    const stream = service.getStream('job-1');
    const eventPromise = firstValueFrom(stream);

    service.emit({ jobId: 'job-1', status: 'processing', progress: 50 });

    const event = await eventPromise;
    const data = JSON.parse(event.data as string);
    expect(data.status).toBe('processing');
    expect(data.progress).toBe(50);
  });

  it('getStream filters by jobId (only receives events for its jobId)', async () => {
    const stream1 = service.getStream('job-1');
    const eventPromise = firstValueFrom(stream1);

    // Emit for a different job first
    service.emit({ jobId: 'job-2', status: 'processing', progress: 25 });
    // Emit for the subscribed job
    service.emit({ jobId: 'job-1', status: 'completed', progress: 100 });

    const event = await eventPromise;
    const data = JSON.parse(event.data as string);
    expect(data.status).toBe('completed');
    expect(data.progress).toBe(100);
  });

  it('getStream maps events to MessageEvent format with JSON data', async () => {
    const stream = service.getStream('job-1');
    const eventPromise = firstValueFrom(stream);

    service.emit({
      jobId: 'job-1',
      status: 'completed',
      progress: 100,
      downloadUrl: '/downloads/file.csv',
    });

    const event = await eventPromise;
    expect(typeof event.data).toBe('string');
    const data = JSON.parse(event.data as string);
    expect(data).toEqual({
      status: 'completed',
      progress: 100,
      downloadUrl: '/downloads/file.csv',
      error: undefined,
    });
  });

  it('includes error field when present', async () => {
    const stream = service.getStream('job-1');
    const eventPromise = firstValueFrom(stream);

    service.emit({
      jobId: 'job-1',
      status: 'failed',
      progress: 0,
      error: 'Something went wrong',
    });

    const event = await eventPromise;
    const data = JSON.parse(event.data as string);
    expect(data.error).toBe('Something went wrong');
    expect(data.status).toBe('failed');
  });

  it('multiple streams for different jobIds work independently', async () => {
    const stream1 = service.getStream('job-1');
    const stream2 = service.getStream('job-2');

    const promise1 = firstValueFrom(stream1);
    const promise2 = firstValueFrom(stream2);

    service.emit({ jobId: 'job-1', status: 'processing', progress: 50 });
    service.emit({ jobId: 'job-2', status: 'completed', progress: 100 });

    const [event1, event2] = await Promise.all([promise1, promise2]);

    const data1 = JSON.parse(event1.data as string);
    const data2 = JSON.parse(event2.data as string);

    expect(data1.status).toBe('processing');
    expect(data1.progress).toBe(50);
    expect(data2.status).toBe('completed');
    expect(data2.progress).toBe(100);
  });

  it('collects multiple events for the same jobId', async () => {
    const stream = service.getStream('job-1');
    const eventsPromise = firstValueFrom(stream.pipe(take(3), toArray()));

    service.emit({ jobId: 'job-1', status: 'processing', progress: 25 });
    service.emit({ jobId: 'job-1', status: 'processing', progress: 50 });
    service.emit({ jobId: 'job-1', status: 'completed', progress: 100 });

    const events = await eventsPromise;
    expect(events).toHaveLength(3);

    const progresses = events.map((e) => JSON.parse(e.data as string).progress);
    expect(progresses).toEqual([25, 50, 100]);
  });

  it('events before subscription are not received (Subject behavior)', async () => {
    // Emit before subscribing
    service.emit({ jobId: 'job-1', status: 'processing', progress: 25 });

    // Now subscribe
    const stream = service.getStream('job-1');
    const eventPromise = firstValueFrom(stream);

    // Emit after subscribing
    service.emit({ jobId: 'job-1', status: 'completed', progress: 100 });

    const event = await eventPromise;
    const data = JSON.parse(event.data as string);
    // Should only get the event emitted after subscription
    expect(data.status).toBe('completed');
    expect(data.progress).toBe(100);
  });

  it('excludes jobId from the serialized data', async () => {
    const stream = service.getStream('job-1');
    const eventPromise = firstValueFrom(stream);

    service.emit({ jobId: 'job-1', status: 'processing', progress: 50 });

    const event = await eventPromise;
    const data = JSON.parse(event.data as string);
    expect(data.jobId).toBeUndefined();
  });
});
