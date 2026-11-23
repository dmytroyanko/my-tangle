import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_products_specs_key" ADD VALUE 'animal' BEFORE 'hairType';
  ALTER TYPE "public"."enum_products_specs_key" ADD VALUE 'coat' BEFORE 'use';
  ALTER TYPE "public"."enum__products_v_version_specs_key" ADD VALUE 'animal' BEFORE 'hairType';
  ALTER TYPE "public"."enum__products_v_version_specs_key" ADD VALUE 'coat' BEFORE 'use';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products_specs" ALTER COLUMN "key" SET DATA TYPE text;
  DROP TYPE "public"."enum_products_specs_key";
  CREATE TYPE "public"."enum_products_specs_key" AS ENUM('hairType', 'use', 'teeth', 'size', 'finish', 'features', 'length', 'weight');
  ALTER TABLE "products_specs" ALTER COLUMN "key" SET DATA TYPE "public"."enum_products_specs_key" USING "key"::"public"."enum_products_specs_key";
  ALTER TABLE "_products_v_version_specs" ALTER COLUMN "key" SET DATA TYPE text;
  DROP TYPE "public"."enum__products_v_version_specs_key";
  CREATE TYPE "public"."enum__products_v_version_specs_key" AS ENUM('hairType', 'use', 'teeth', 'size', 'finish', 'features', 'length', 'weight');
  ALTER TABLE "_products_v_version_specs" ALTER COLUMN "key" SET DATA TYPE "public"."enum__products_v_version_specs_key" USING "key"::"public"."enum__products_v_version_specs_key";`)
}
