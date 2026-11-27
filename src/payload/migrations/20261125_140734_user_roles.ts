import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor');
  ALTER TABLE "users" ADD COLUMN "name" varchar;
  ALTER TABLE "users" ADD COLUMN "role" "enum_users_role";
  ALTER TABLE "users" ADD COLUMN "view_orders" boolean DEFAULT false;
  ALTER TABLE "users" ADD COLUMN "receive_orders" boolean DEFAULT false;`)
  // Accounts created before roles had full access; they stay admins.
  await db.execute(sql`UPDATE "users" SET "role" = 'admin' WHERE "role" IS NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" DROP COLUMN "name";
  ALTER TABLE "users" DROP COLUMN "role";
  ALTER TABLE "users" DROP COLUMN "view_orders";
  ALTER TABLE "users" DROP COLUMN "receive_orders";
  DROP TYPE "public"."enum_users_role";`)
}
