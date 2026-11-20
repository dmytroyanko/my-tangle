import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_categories_benefits_icon" AS ENUM('droplets', 'layers', 'hand', 'shower', 'sparkles', 'luggage', 'baby', 'gift', 'shield', 'leaf');
  CREATE TABLE "categories_benefits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_categories_benefits_icon" NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar
  );
  
  ALTER TABLE "categories_benefits" ADD CONSTRAINT "categories_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "categories_benefits_order_idx" ON "categories_benefits" USING btree ("_order");
  CREATE INDEX "categories_benefits_parent_id_idx" ON "categories_benefits" USING btree ("_parent_id");
  CREATE INDEX "categories_benefits_locale_idx" ON "categories_benefits" USING btree ("_locale");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "categories_benefits" CASCADE;
  DROP TYPE "public"."enum_categories_benefits_icon";`)
}
