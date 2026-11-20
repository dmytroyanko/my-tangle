import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "products_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar,
  	"locale" "_locales"
  );
  
  CREATE TABLE "_products_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar,
  	"locale" "_locales"
  );
  
  ALTER TABLE "products_variants" ADD COLUMN "color" varchar;
  ALTER TABLE "products" ADD COLUMN "order" numeric DEFAULT 0;
  ALTER TABLE "_products_v_version_variants" ADD COLUMN "color" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version_order" numeric DEFAULT 0;
  ALTER TABLE "categories_locales" ADD COLUMN "heading" varchar;
  ALTER TABLE "categories_locales" ADD COLUMN "subtitle" varchar;
  ALTER TABLE "products_texts" ADD CONSTRAINT "products_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_texts" ADD CONSTRAINT "_products_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_texts_order_parent" ON "products_texts" USING btree ("order","parent_id");
  CREATE INDEX "products_texts_locale_parent" ON "products_texts" USING btree ("locale","parent_id");
  CREATE INDEX "_products_v_texts_order_parent" ON "_products_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "_products_v_texts_locale_parent" ON "_products_v_texts" USING btree ("locale","parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "products_texts" CASCADE;
  DROP TABLE "_products_v_texts" CASCADE;
  ALTER TABLE "products_variants" DROP COLUMN "color";
  ALTER TABLE "products" DROP COLUMN "order";
  ALTER TABLE "_products_v_version_variants" DROP COLUMN "color";
  ALTER TABLE "_products_v" DROP COLUMN "version_order";
  ALTER TABLE "categories_locales" DROP COLUMN "heading";
  ALTER TABLE "categories_locales" DROP COLUMN "subtitle";`)
}
