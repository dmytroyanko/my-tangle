import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_categories_brand" AS ENUM('tangle-teezer', 'invisibobble');
  ALTER TABLE "categories" ADD COLUMN "brand" "enum_categories_brand" DEFAULT 'tangle-teezer';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "categories" DROP COLUMN "brand";
  DROP TYPE "public"."enum_categories_brand";`)
}
