import { ColumnTypeRegistry } from './ColumnTypeRegistry';
import { TextColumnPlugin } from './types/TextColumn';
import { NumberColumnPlugin } from './types/NumberColumn';
import { CurrencyColumnPlugin } from './types/CurrencyColumn';
import { BooleanColumnPlugin } from './types/BooleanColumn';
import { SelectColumnPlugin } from './types/SelectColumn';
import { DateColumnPlugin } from './types/DateColumn';
import { RatingColumnPlugin } from './types/RatingColumn';
import { ProgressColumnPlugin } from './types/ProgressColumn';
import { SparklineColumnPlugin } from './types/SparklineColumn';
import { ActionColumnPlugin } from './types/ActionColumn';

let initialized = false;

export function initDefaultColumnPlugins(): void {
  if (initialized) return;

  ColumnTypeRegistry.register(TextColumnPlugin);
  ColumnTypeRegistry.register(NumberColumnPlugin);
  ColumnTypeRegistry.register(CurrencyColumnPlugin);
  ColumnTypeRegistry.register(BooleanColumnPlugin);
  ColumnTypeRegistry.register(SelectColumnPlugin);
  ColumnTypeRegistry.register(DateColumnPlugin);
  ColumnTypeRegistry.register(RatingColumnPlugin);
  ColumnTypeRegistry.register(ProgressColumnPlugin);
  ColumnTypeRegistry.register(SparklineColumnPlugin);
  ColumnTypeRegistry.register(ActionColumnPlugin);

  initialized = true;
}
