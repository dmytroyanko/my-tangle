import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_orders_locale" AS ENUM('uk', 'ru');
  ALTER TABLE "orders" ALTER COLUMN "delivery_method" SET DATA TYPE text;
  ALTER TABLE "orders" ALTER COLUMN "delivery_method" SET DEFAULT 'nova-poshta'::text;
  DROP TYPE "public"."enum_orders_delivery_method";
  CREATE TYPE "public"."enum_orders_delivery_method" AS ENUM('nova-poshta');
  ALTER TABLE "orders" ALTER COLUMN "delivery_method" SET DEFAULT 'nova-poshta'::"public"."enum_orders_delivery_method";
  ALTER TABLE "orders" ALTER COLUMN "delivery_method" SET DATA TYPE "public"."enum_orders_delivery_method" USING "delivery_method"::"public"."enum_orders_delivery_method";
  ALTER TABLE "orders_items" ADD COLUMN "title" varchar;
  ALTER TABLE "orders_items" ADD COLUMN "variant_id" varchar;
  ALTER TABLE "orders_items" ADD COLUMN "full_price" numeric;
  ALTER TABLE "orders" ADD COLUMN "locale" "enum_orders_locale";
  ALTER TABLE "orders" ADD COLUMN "last_name" varchar;
  ALTER TABLE "orders" ADD COLUMN "first_name" varchar;
  ALTER TABLE "orders" ADD COLUMN "phone_normalized" varchar;
  ALTER TABLE "orders" ADD COLUMN "full_total" numeric;
  ALTER TABLE "orders" ADD COLUMN "discount" numeric;
  ALTER TABLE "orders" ADD COLUMN "delivery_city_ref" varchar;
  ALTER TABLE "orders" ADD COLUMN "delivery_warehouse_ref" varchar;
  CREATE INDEX "orders_phone_normalized_idx" ON "orders" USING btree ("phone_normalized");
  ALTER TABLE "orders" DROP COLUMN "customer_name";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_orders_delivery_method" ADD VALUE 'pickup';
  DROP INDEX "orders_phone_normalized_idx";
  ALTER TABLE "orders" ADD COLUMN "customer_name" varchar NOT NULL;
  ALTER TABLE "orders_items" DROP COLUMN "title";
  ALTER TABLE "orders_items" DROP COLUMN "variant_id";
  ALTER TABLE "orders_items" DROP COLUMN "full_price";
  ALTER TABLE "orders" DROP COLUMN "locale";
  ALTER TABLE "orders" DROP COLUMN "last_name";
  ALTER TABLE "orders" DROP COLUMN "first_name";
  ALTER TABLE "orders" DROP COLUMN "phone_normalized";
  ALTER TABLE "orders" DROP COLUMN "full_total";
  ALTER TABLE "orders" DROP COLUMN "discount";
  ALTER TABLE "orders" DROP COLUMN "delivery_city_ref";
  ALTER TABLE "orders" DROP COLUMN "delivery_warehouse_ref";
  DROP TYPE "public"."enum_orders_locale";`)
}
