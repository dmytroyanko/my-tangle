import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "shop_settings" ADD COLUMN "bundle_discount_enabled" boolean DEFAULT false;
  ALTER TABLE "shop_settings" ADD COLUMN "bundle_discount_percent" numeric DEFAULT 7 NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "shop_settings" DROP COLUMN "bundle_discount_enabled";
  ALTER TABLE "shop_settings" DROP COLUMN "bundle_discount_percent";`)
}
