import { Injectable, signal, computed } from '@angular/core';
import { CanvasNode, CanvasConnection } from '../../../core/models/canvas.models';

export interface CanvasSnapshot {
  nodes: CanvasNode[];
  connections: CanvasConnection[];
  architectureName: string;
  architectureRegion: string;
  architectureDescription: string;
}

@Injectable({
  providedIn: 'root'
})
export class CanvasHistoryService {
  private readonly maxHistory = 50;
  private readonly past = signal<CanvasSnapshot[]>([]);
  private readonly future = signal<CanvasSnapshot[]>([]);

  readonly canUndo = computed(() => this.past().length > 0);
  readonly canRedo = computed(() => this.future().length > 0);

  pushSnapshot(current: CanvasSnapshot) {
    // Clone snapshot deeply to prevent reference mutation
    const clone: CanvasSnapshot = JSON.parse(JSON.stringify(current));
    this.past.update(stack => {
      const updated = [...stack, clone];
      if (updated.length > this.maxHistory) {
        updated.shift();
      }
      return updated;
    });
    // Clear redo history when a new state is pushed
    this.future.set([]);
  }

  undo(current: CanvasSnapshot): CanvasSnapshot | null {
    const pastStack = this.past();
    if (pastStack.length === 0) return null;

    const previous = pastStack[pastStack.length - 1];
    const newPast = pastStack.slice(0, -1);

    this.past.set(newPast);
    this.future.update(stack => [JSON.parse(JSON.stringify(current)), ...stack]);

    return JSON.parse(JSON.stringify(previous));
  }

  redo(current: CanvasSnapshot): CanvasSnapshot | null {
    const futureStack = this.future();
    if (futureStack.length === 0) return null;

    const next = futureStack[0];
    const newFuture = futureStack.slice(1);

    this.future.set(newFuture);
    this.past.update(stack => [...stack, JSON.parse(JSON.stringify(current))]);

    return JSON.parse(JSON.stringify(next));
  }

  clear() {
    this.past.set([]);
    this.future.set([]);
  }
}
