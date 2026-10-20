import { IColumnTypePlugin } from './IColumnTypePlugin';

export class ColumnTypeRegistry {
  private static plugins: Map<string, IColumnTypePlugin> = new Map();

  public static register(plugin: IColumnTypePlugin): void {
    this.plugins.set(plugin.type, plugin);
  }

  public static get(type: string): IColumnTypePlugin {
    const plugin = this.plugins.get(type);
    if (!plugin) {
      // Bulunamadıysa text eklentisine geri dön
      return this.plugins.get('text')!;
    }
    return plugin;
  }

  public static has(type: string): boolean {
    return this.plugins.has(type);
  }

  public static getAll(): IColumnTypePlugin[] {
    return Array.from(this.plugins.values());
  }
}
