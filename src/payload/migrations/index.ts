import * as migration_20261119_143536_initial from './20261119_143536_initial';
import * as migration_20261120_181208_showcase_fields from './20261120_181208_showcase_fields';

export const migrations = [
  {
    up: migration_20261119_143536_initial.up,
    down: migration_20261119_143536_initial.down,
    name: '20261119_143536_initial',
  },
  {
    up: migration_20261120_181208_showcase_fields.up,
    down: migration_20261120_181208_showcase_fields.down,
    name: '20261120_181208_showcase_fields'
  },
];
