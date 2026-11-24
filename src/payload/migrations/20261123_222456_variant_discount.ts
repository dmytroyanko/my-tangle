import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products_variants" ADD COLUMN "discount_percent" numeric;
  ALTER TABLE "_products_v_version_variants" ADD COLUMN "discount_percent" numeric;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products_variants" DROP COLUMN "discount_percent";
  ALTER TABLE "_products_v_version_variants" DROP COLUMN "discount_percent";`)
}
