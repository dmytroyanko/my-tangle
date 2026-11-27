import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "shop_settings" ALTER COLUMN "discount_percent" SET DEFAULT 0;
  ALTER TABLE "shop_settings" ALTER COLUMN "bundle_discount_enabled" SET DEFAULT true;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "shop_settings" ALTER COLUMN "discount_percent" SET DEFAULT 20;
  ALTER TABLE "shop_settings" ALTER COLUMN "bundle_discount_enabled" SET DEFAULT false;`)
}
