import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_tracking_tags_type" AS ENUM('gtm', 'gtag', 'meta');
  CREATE TABLE "payment_methods" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payment_methods_locales" (
  	"title" varchar NOT NULL,
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "tracking_tags" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"type" "enum_tracking_tags_type" NOT NULL,
  	"tag_id" varchar NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "orders" ALTER COLUMN "payment" DROP DEFAULT;
  -- Orders keep the method's name instead of a fixed code (edited by hand: the generator drops the data).
  ALTER TABLE "orders" ALTER COLUMN "payment" SET DATA TYPE varchar USING (CASE "payment"::text
    WHEN 'wallet' THEN 'Apple Pay / Google Pay'
    WHEN 'card' THEN 'Карткою за реквізитами'
    WHEN 'cod' THEN 'Післяплата' END);
  ALTER TABLE "orders" ADD COLUMN "payment_method_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "payment_methods_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "tracking_tags_id" integer;
  ALTER TABLE "payment_methods_locales" ADD CONSTRAINT "payment_methods_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payment_methods"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payment_methods_updated_at_idx" ON "payment_methods" USING btree ("updated_at");
  CREATE INDEX "payment_methods_created_at_idx" ON "payment_methods" USING btree ("created_at");
  CREATE UNIQUE INDEX "payment_methods_locales_locale_parent_id_unique" ON "payment_methods_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "payment_methods_locales_parent_id_idx" ON "payment_methods_locales" USING btree ("_parent_id");
  CREATE INDEX "tracking_tags_updated_at_idx" ON "tracking_tags" USING btree ("updated_at");
  CREATE INDEX "tracking_tags_created_at_idx" ON "tracking_tags" USING btree ("created_at");
  ALTER TABLE "orders" ADD CONSTRAINT "orders_payment_method_id_payment_methods_id_fk" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payment_methods_fk" FOREIGN KEY ("payment_methods_id") REFERENCES "public"."payment_methods"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tracking_tags_fk" FOREIGN KEY ("tracking_tags_id") REFERENCES "public"."tracking_tags"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "orders_payment_method_idx" ON "orders" USING btree ("payment_method_id");
  CREATE INDEX "payload_locked_documents_rels_payment_methods_id_idx" ON "payload_locked_documents_rels" USING btree ("payment_methods_id");
  CREATE INDEX "payload_locked_documents_rels_tracking_tags_id_idx" ON "payload_locked_documents_rels" USING btree ("tracking_tags_id");
  DROP TYPE "public"."enum_orders_payment";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_orders_payment" AS ENUM('wallet', 'card', 'cod');
  ALTER TABLE "payment_methods" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payment_methods_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "tracking_tags" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "payment_methods" CASCADE;
  DROP TABLE "payment_methods_locales" CASCADE;
  DROP TABLE "tracking_tags" CASCADE;
  -- CASCADE above also dropped the foreign keys to these tables (orders, payload_locked_documents_rels).
  DROP INDEX "orders_payment_method_idx";
  DROP INDEX "payload_locked_documents_rels_payment_methods_id_idx";
  DROP INDEX "payload_locked_documents_rels_tracking_tags_id_idx";
  ALTER TABLE "orders" ALTER COLUMN "payment" SET DATA TYPE "public"."enum_orders_payment" USING (CASE "payment"
    WHEN 'Apple Pay / Google Pay' THEN 'wallet'
    WHEN 'Карткою за реквізитами' THEN 'card'
    WHEN 'Післяплата' THEN 'cod' END)::"public"."enum_orders_payment";
  ALTER TABLE "orders" ALTER COLUMN "payment" SET DEFAULT 'cod'::"public"."enum_orders_payment";
  ALTER TABLE "orders" DROP COLUMN "payment_method_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "payment_methods_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "tracking_tags_id";
  DROP TYPE "public"."enum_tracking_tags_type";`)
}
