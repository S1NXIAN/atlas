import { describe, it, expect, vi, beforeEach } from 'vitest';

// Generic condition-based waiter
async function waitFor(
  condition: () => boolean | Promise<boolean>,
  options?: { timeout?: number; interval?: number }
): Promise<void> {
  const timeout = options?.timeout ?? 5000;
  const interval = options?.interval ?? 50;
  const start = Date.now();

  while (Date.now() - start < timeout) {
    if (await condition()) return;
    await new Promise(r => setTimeout(r, interval));
  }
  throw new Error(`Condition not met within ${timeout}ms`);
}

// Example classes
class AsyncProcessor {
  private status: 'idle' | 'processing' | 'completed' = 'idle';
  private result: string | null = null;

  async process(input: string): Promise<void> {
    this.status = 'processing';
    // Simulate async work
    await new Promise(r => setTimeout(r, 100));
    this.result = `processed:${input}`;
    this.status = 'completed';
  }

  getStatus() { return this.status; }
  getResult() { return this.result; }
}

class FileWatcher {
  private files: Set<string> = new Set();

  async createFile(path: string): Promise<void> {
    await new Promise(r => setTimeout(r, 50));
    this.files.add(path);
  }

  exists(path: string): boolean {
    return this.files.has(path);
  }
}

describe('condition-based-waiting examples', () => {
  describe('waitFor utility', () => {
    it('resolves when condition becomes true', async () => {
      let flag = false;
      setTimeout(() => { flag = true; }, 50);
      await expect(waitFor(() => flag, { timeout: 1000 })).resolves.toBeUndefined();
    });

    it('rejects when condition never becomes true', async () => {
      await expect(waitFor(() => false, { timeout: 100, interval: 10 }))
        .rejects.toThrow('Condition not met within 100ms');
    });
  });

  describe('AsyncProcessor with waitFor', () => {
    it('completes processing', async () => {
      const processor = new AsyncProcessor();
      const promise = processor.process('test');

      await waitFor(() => processor.getStatus() === 'completed');
      expect(processor.getResult()).toBe('processed:test');
      await promise;
    });
  });

  describe('FileWatcher with waitFor', () => {
    it('file appears after creation', async () => {
      const watcher = new FileWatcher();
      const promise = watcher.createFile('/tmp/test.txt');

      await waitFor(() => watcher.exists('/tmp/test.txt'));
      expect(watcher.exists('/tmp/test.txt')).toBe(true);
      await promise;
    });
  });
});
