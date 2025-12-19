import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class RealtimeNotifierService {
  private io: Server;

  setServer(server: Server) {
    this.io = server;
  }

  notifySyncStarted(configId: number) {
    if (this.io) {
      this.io.emit('sync:started', {
        configId,
        timestamp: new Date(),
        status: 'started'
      });
    }
  }

  notifySyncProgress(configId: number, progress: number, message: string) {
    if (this.io) {
      this.io.emit('sync:progress', {
        configId,
        progress,
        message,
        timestamp: new Date()
      });
    }
  }

  notifySyncCompleted(configId: number, stats: any) {
    if (this.io) {
      this.io.emit('sync:completed', {
        configId,
        stats,
        timestamp: new Date(),
        status: 'completed'
      });
    }
  }

  notifySyncFailed(configId: number, error: string) {
    if (this.io) {
      this.io.emit('sync:failed', {
        configId,
        error,
        timestamp: new Date(),
        status: 'failed'
      });
    }
  }

  notifyDataUpdated(configId: number, data: any) {
    if (this.io) {
      this.io.emit('data:updated', {
        configId,
        data,
        timestamp: new Date()
      });
    }
  }

  notifyConfigChanged(configId: number, action: 'created' | 'updated' | 'deleted') {
    if (this.io) {
      this.io.emit('config:changed', {
        configId,
        action,
        timestamp: new Date()
      });
    }
  }
}
