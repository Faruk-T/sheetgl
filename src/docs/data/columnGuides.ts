import { ColumnGuideItem } from '../types';
import { TEXT_GUIDES } from './guidesText';
import { NUMERIC_GUIDES } from './guidesNumeric';
import { CHOICE_GUIDES } from './guidesChoice';
import { STRUCTURED_GUIDES } from './guidesStructured';
import { VISUAL_GUIDES } from './guidesVisual';

export const COLUMN_GUIDES: ColumnGuideItem[] = [
  ...TEXT_GUIDES,
  ...NUMERIC_GUIDES,
  ...CHOICE_GUIDES,
  ...STRUCTURED_GUIDES,
  ...VISUAL_GUIDES,
];
