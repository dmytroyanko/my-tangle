import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_service_role" AS ENUM('offer', 'privacy');
  CREATE TYPE "public"."enum__pages_v_version_service_role" AS ENUM('offer', 'privacy');
  ALTER TABLE "orders" ALTER COLUMN "payment" SET DATA TYPE text;
  ALTER TABLE "orders" ALTER COLUMN "payment" SET DEFAULT 'cod'::text;
  -- "Card online" was never offered at the checkout; any such order counts as cash on delivery.
  UPDATE "orders" SET "payment" = 'cod' WHERE "payment" NOT IN ('wallet', 'card', 'cod');
  DROP TYPE "public"."enum_orders_payment";
  CREATE TYPE "public"."enum_orders_payment" AS ENUM('wallet', 'card', 'cod');
  ALTER TABLE "orders" ALTER COLUMN "payment" SET DEFAULT 'cod'::"public"."enum_orders_payment";
  ALTER TABLE "orders" ALTER COLUMN "payment" SET DATA TYPE "public"."enum_orders_payment" USING "payment"::"public"."enum_orders_payment";
  ALTER TABLE "pages" ADD COLUMN "service_role" "enum_pages_service_role";
  ALTER TABLE "_pages_v" ADD COLUMN "version_service_role" "enum__pages_v_version_service_role";
  CREATE INDEX "pages_service_role_idx" ON "pages" USING btree ("service_role");
  CREATE INDEX "_pages_v_version_version_service_role_idx" ON "_pages_v" USING btree ("version_service_role");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "orders" ALTER COLUMN "payment" SET DATA TYPE text;
  ALTER TABLE "orders" ALTER COLUMN "payment" SET DEFAULT 'cod'::text;
  -- The old list has no Apple Pay / Google Pay or card by bank details: those orders become "card online".
  UPDATE "orders" SET "payment" = 'online' WHERE "payment" IN ('wallet', 'card');
  DROP TYPE "public"."enum_orders_payment";
  CREATE TYPE "public"."enum_orders_payment" AS ENUM('cod', 'online');
  ALTER TABLE "orders" ALTER COLUMN "payment" SET DEFAULT 'cod'::"public"."enum_orders_payment";
  ALTER TABLE "orders" ALTER COLUMN "payment" SET DATA TYPE "public"."enum_orders_payment" USING "payment"::"public"."enum_orders_payment";
  DROP INDEX "pages_service_role_idx";
  DROP INDEX "_pages_v_version_version_service_role_idx";
  ALTER TABLE "pages" DROP COLUMN "service_role";
  ALTER TABLE "_pages_v" DROP COLUMN "version_service_role";
  DROP TYPE "public"."enum_pages_service_role";
  DROP TYPE "public"."enum__pages_v_version_service_role";`)
}
