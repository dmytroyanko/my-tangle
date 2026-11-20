import * as migration_20261119_143536_initial from './20261119_143536_initial';
import * as migration_20261120_181208_showcase_fields from './20261120_181208_showcase_fields';
import * as migration_20261120_214924_category_faq from './20261120_214924_category_faq';
import * as migration_20261120_220654_category_benefits from './20261120_220654_category_benefits';

export const migrations = [
  {
    up: migration_20261119_143536_initial.up,
    down: migration_20261119_143536_initial.down,
    name: '20261119_143536_initial',
  },
  {
    up: migration_20261120_181208_showcase_fields.up,
    down: migration_20261120_181208_showcase_fields.down,
    name: '20261120_181208_showcase_fields',
  },
  {
    up: migration_20261120_214924_category_faq.up,
    down: migration_20261120_214924_category_faq.down,
    name: '20261120_214924_category_faq',
  },
  {
    up: migration_20261120_220654_category_benefits.up,
    down: migration_20261120_220654_category_benefits.down,
    name: '20261120_220654_category_benefits'
  },
];
