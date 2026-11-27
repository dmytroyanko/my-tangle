import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_categories_product_info_specs_key" AS ENUM('animal', 'hairType', 'coat', 'use', 'teeth', 'size', 'finish', 'features', 'length', 'weight');
  CREATE TYPE "public"."enum_categories_nav_icon" AS ENUM('wet-detangler', 'carebrush', 'children-mini', 'compact-styler', 'easy-dry-go', 'ultimate-styler', 'back-combing', 'scalp', 'pet-teezer', 'invisibobble');
  CREATE TABLE "categories_product_info_specs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" "enum_categories_product_info_specs_key" NOT NULL
  );
  
  CREATE TABLE "categories_product_info_specs_locales" (
  	"value" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "categories_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar,
  	"locale" "_locales"
  );
  
  ALTER TABLE "products_variants" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_variants" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "products_variants" CASCADE;
  DROP TABLE "_products_v_version_variants" CASCADE;
  ALTER TABLE "products" ADD COLUMN "color_name" varchar;
  ALTER TABLE "products" ADD COLUMN "in_stock" boolean DEFAULT true;
  ALTER TABLE "products" ADD COLUMN "color" varchar;
  ALTER TABLE "products" ADD COLUMN "sku" varchar;
  ALTER TABLE "products_locales" ADD COLUMN "full_title" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version_color_name" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version_in_stock" boolean DEFAULT true;
  ALTER TABLE "_products_v" ADD COLUMN "version_color" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version_sku" varchar;
  ALTER TABLE "_products_v_locales" ADD COLUMN "version_full_title" varchar;
  ALTER TABLE "categories" ADD COLUMN "parent_id" integer;
  ALTER TABLE "categories" ADD COLUMN "series_name" varchar;
  ALTER TABLE "categories" ADD COLUMN "nav_icon" "enum_categories_nav_icon";
  ALTER TABLE "categories_locales" ADD COLUMN "product_info_description" jsonb;
  ALTER TABLE "categories_locales" ADD COLUMN "nav_title" varchar;
  ALTER TABLE "categories_product_info_specs" ADD CONSTRAINT "categories_product_info_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories_product_info_specs_locales" ADD CONSTRAINT "categories_product_info_specs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories_product_info_specs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories_texts" ADD CONSTRAINT "categories_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "categories_product_info_specs_order_idx" ON "categories_product_info_specs" USING btree ("_order");
  CREATE INDEX "categories_product_info_specs_parent_id_idx" ON "categories_product_info_specs" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "categories_product_info_specs_locales_locale_parent_id_uniqu" ON "categories_product_info_specs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "categories_product_info_specs_locales_parent_id_idx" ON "categories_product_info_specs_locales" USING btree ("_parent_id");
  CREATE INDEX "categories_texts_order_parent" ON "categories_texts" USING btree ("order","parent_id");
  CREATE INDEX "categories_texts_locale_parent" ON "categories_texts" USING btree ("locale","parent_id");
  ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");
  ALTER TABLE "products" DROP COLUMN "series";
  ALTER TABLE "_products_v" DROP COLUMN "version_series";
  ALTER TABLE "orders_items" DROP COLUMN "variant_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "products_variants" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"sku" varchar,
  	"color" varchar,
  	"full_price" numeric,
  	"discount_percent" numeric,
  	"price" numeric,
  	"in_stock" boolean DEFAULT true
  );
  
  CREATE TABLE "_products_v_version_variants" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"sku" varchar,
  	"color" varchar,
  	"full_price" numeric,
  	"discount_percent" numeric,
  	"price" numeric,
  	"in_stock" boolean DEFAULT true,
  	"_uuid" varchar
  );
  
  ALTER TABLE "categories_product_info_specs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "categories_product_info_specs_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "categories_texts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "categories_product_info_specs" CASCADE;
  DROP TABLE "categories_product_info_specs_locales" CASCADE;
  DROP TABLE "categories_texts" CASCADE;
  ALTER TABLE "categories" DROP CONSTRAINT "categories_parent_id_categories_id_fk";
  
  DROP INDEX "categories_parent_idx";
  ALTER TABLE "products" ADD COLUMN "series" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version_series" varchar;
  ALTER TABLE "orders_items" ADD COLUMN "variant_id" varchar;
  ALTER TABLE "products_variants" ADD CONSTRAINT "products_variants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_variants" ADD CONSTRAINT "_products_v_version_variants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_variants_order_idx" ON "products_variants" USING btree ("_order");
  CREATE INDEX "products_variants_parent_id_idx" ON "products_variants" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_variants_order_idx" ON "_products_v_version_variants" USING btree ("_order");
  CREATE INDEX "_products_v_version_variants_parent_id_idx" ON "_products_v_version_variants" USING btree ("_parent_id");
  ALTER TABLE "products" DROP COLUMN "color_name";
  ALTER TABLE "products" DROP COLUMN "in_stock";
  ALTER TABLE "products" DROP COLUMN "color";
  ALTER TABLE "products" DROP COLUMN "sku";
  ALTER TABLE "products_locales" DROP COLUMN "full_title";
  ALTER TABLE "_products_v" DROP COLUMN "version_color_name";
  ALTER TABLE "_products_v" DROP COLUMN "version_in_stock";
  ALTER TABLE "_products_v" DROP COLUMN "version_color";
  ALTER TABLE "_products_v" DROP COLUMN "version_sku";
  ALTER TABLE "_products_v_locales" DROP COLUMN "version_full_title";
  ALTER TABLE "categories" DROP COLUMN "parent_id";
  ALTER TABLE "categories" DROP COLUMN "series_name";
  ALTER TABLE "categories" DROP COLUMN "nav_icon";
  ALTER TABLE "categories_locales" DROP COLUMN "product_info_description";
  ALTER TABLE "categories_locales" DROP COLUMN "nav_title";
  DROP TYPE "public"."enum_categories_product_info_specs_key";
  DROP TYPE "public"."enum_categories_nav_icon";`)
}
