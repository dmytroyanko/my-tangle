import * as migration_20261119_100325_initial from './20261119_100325_initial';

export const migrations = [
  {
    up: migration_20261119_100325_initial.up,
    down: migration_20261119_100325_initial.down,
    name: '20261119_100325_initial'
  },
];
