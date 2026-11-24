import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "shop_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"discount_percent" numeric DEFAULT 20 NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "products_variants" ADD COLUMN "full_price" numeric;
  ALTER TABLE "products" ADD COLUMN "full_price" numeric;
  ALTER TABLE "products" ADD COLUMN "discount_percent" numeric;
  ALTER TABLE "_products_v_version_variants" ADD COLUMN "full_price" numeric;
  ALTER TABLE "_products_v" ADD COLUMN "version_full_price" numeric;
  ALTER TABLE "_products_v" ADD COLUMN "version_discount_percent" numeric;
  ALTER TABLE "categories" ADD COLUMN "show_on_home" boolean DEFAULT false;
  ALTER TABLE "products" DROP COLUMN "compare_at_price";
  ALTER TABLE "_products_v" DROP COLUMN "version_compare_at_price";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "shop_settings" CASCADE;
  ALTER TABLE "products" ADD COLUMN "compare_at_price" numeric;
  ALTER TABLE "_products_v" ADD COLUMN "version_compare_at_price" numeric;
  ALTER TABLE "products_variants" DROP COLUMN "full_price";
  ALTER TABLE "products" DROP COLUMN "full_price";
  ALTER TABLE "products" DROP COLUMN "discount_percent";
  ALTER TABLE "_products_v_version_variants" DROP COLUMN "full_price";
  ALTER TABLE "_products_v" DROP COLUMN "version_full_price";
  ALTER TABLE "_products_v" DROP COLUMN "version_discount_percent";
  ALTER TABLE "categories" DROP COLUMN "show_on_home";`)
}
