import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_categories_product_view" AS ENUM('groups', 'grid');
  CREATE TYPE "public"."enum_categories_home_product_view" AS ENUM('groups', 'grid');
  ALTER TABLE "categories" ADD COLUMN "product_view" "enum_categories_product_view" DEFAULT 'groups';
  ALTER TABLE "categories" ADD COLUMN "home_product_view" "enum_categories_home_product_view" DEFAULT 'groups';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "categories" DROP COLUMN "product_view";
  ALTER TABLE "categories" DROP COLUMN "home_product_view";
  DROP TYPE "public"."enum_categories_product_view";
  DROP TYPE "public"."enum_categories_home_product_view";`)
}
