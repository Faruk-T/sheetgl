export interface GridCommand {
  description?: string;
  undo: () => void;
  redo: () => void;
}

export class HistoryManager {
  private undoStack: GridCommand[] = [];
  private redoStack: GridCommand[] = [];
  private maxHistory: number = 50;

  constructor(maxHistory: number = 50) {
    this.maxHistory = maxHistory;
  }

  public push(command: GridCommand): void {
    this.undoStack.push(command);
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }
    // Yeni bir işlem yapıldığında redo stack temizlenir
    this.redoStack = [];
  }

  public undo(): boolean {
    const cmd = this.undoStack.pop();
    if (!cmd) return false;
    cmd.undo();
    this.redoStack.push(cmd);
    return true;
  }

  public redo(): boolean {
    const cmd = this.redoStack.pop();
    if (!cmd) return false;
    cmd.redo();
    this.undoStack.push(cmd);
    return true;
  }

  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
}
