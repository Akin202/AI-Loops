/**
 * Offline Write Queue and Connectivity Engine for AI Loops
 * Optimized for unreliable Lagos mobile data / dropped packets.
 */

export interface QueuedWrite {
  id: string;
  action: 'createEvent' | 'updateOrganisationStage' | 'logOrganisationInteraction' | 'addOrganisationContact';
  payload: any;
  timestamp: string;
  retries: number;
}

export type NetworkStatus = 'online' | 'offline' | 'syncing';

type Listener = (status: NetworkStatus, pendingCount: number) => void;

const QUEUE_STORAGE_KEY = 'loops_offline_write_queue';

class OfflineQueueEngine {
  private queue: QueuedWrite[] = [];
  private listeners: Set<Listener> = new Set();
  private status: NetworkStatus = typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'online';
  private isProcessing = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadQueue();
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));

      // Attempt initial flush if online and has pending items
      if (navigator.onLine && this.queue.length > 0) {
        setTimeout(() => this.flushQueue(), 1500);
      }
    }
  }

  private loadQueue() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch {
      this.queue = [];
    }
  }

  private persistQueue() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
      } catch (err) {
        console.warn('Could not persist offline queue:', err);
      }
    }
    this.notify();
  }

  private handleNetworkChange(isOnline: boolean) {
    if (isOnline) {
      this.status = this.queue.length > 0 ? 'syncing' : 'online';
      this.notify();
      if (this.queue.length > 0) {
        this.flushQueue();
      }
    } else {
      this.status = 'offline';
      this.notify();
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.status, this.queue.length);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    for (const listener of this.listeners) {
      listener(this.status, this.queue.length);
    }
  }

  public enqueue(action: QueuedWrite['action'], payload: any): string {
    const item: QueuedWrite = {
      id: `queue-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      action,
      payload,
      timestamp: new Date().toISOString(),
      retries: 0,
    };

    this.queue.push(item);
    this.persistQueue();

    if (this.status === 'online') {
      this.flushQueue();
    }

    return item.id;
  }

  public async flushQueue() {
    if (this.isProcessing || this.queue.length === 0 || !navigator.onLine) {
      return;
    }

    this.isProcessing = true;
    this.status = 'syncing';
    this.notify();

    // Lazy load data access functions to prevent circular dependencies
    const dataAccess = await import('./data-access.ts');

    const itemsToProcess = [...this.queue];

    for (const item of itemsToProcess) {
      try {
        if (item.action === 'createEvent') {
          await dataAccess.createEvent(item.payload);
        } else if (item.action === 'updateOrganisationStage') {
          await dataAccess.updateOrganisationStage(item.payload.id, item.payload.newStage, item.payload.reason);
        } else if (item.action === 'logOrganisationInteraction') {
          await dataAccess.logOrganisationInteraction(item.payload.orgId, item.payload.data);
        } else if (item.action === 'addOrganisationContact') {
          await dataAccess.addOrganisationContact(item.payload.orgId, item.payload.data);
        }

        // Successfully synced, remove from queue
        this.queue = this.queue.filter((q) => q.id !== item.id);
        this.persistQueue();
      } catch (err: any) {
        console.warn(`Sync failed for item ${item.id}:`, err);
        item.retries += 1;

        if (item.retries >= 5) {
          // Permanently failed, alert user loudly
          console.error(`PERMANENT SYNC FAILURE: Could not persist ${item.action}`, item);
          if (typeof window !== 'undefined') {
            alert(`Network synchronization failure: Could not save offline action (${item.action}). Please verify changes.`);
          }
          this.queue = this.queue.filter((q) => q.id !== item.id);
          this.persistQueue();
        }
      }
    }

    this.isProcessing = false;
    this.status = navigator.onLine ? 'online' : 'offline';
    this.notify();
  }

  public getStatus(): { status: NetworkStatus; pendingCount: number } {
    return {
      status: this.status,
      pendingCount: this.queue.length,
    };
  }
}

export const offlineQueue = new OfflineQueueEngine();
