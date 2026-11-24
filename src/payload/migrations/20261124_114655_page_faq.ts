import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb
  );
  
  CREATE TABLE "pages_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar
  );
  
  CREATE TABLE "_pages_v_version_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "pages_faq_items" ADD CONSTRAINT "pages_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_faq" ADD CONSTRAINT "pages_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_faq_items" ADD CONSTRAINT "_pages_v_version_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_version_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_faq" ADD CONSTRAINT "_pages_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_faq_items_order_idx" ON "pages_faq_items" USING btree ("_order");
  CREATE INDEX "pages_faq_items_parent_id_idx" ON "pages_faq_items" USING btree ("_parent_id");
  CREATE INDEX "pages_faq_items_locale_idx" ON "pages_faq_items" USING btree ("_locale");
  CREATE INDEX "pages_faq_order_idx" ON "pages_faq" USING btree ("_order");
  CREATE INDEX "pages_faq_parent_id_idx" ON "pages_faq" USING btree ("_parent_id");
  CREATE INDEX "pages_faq_locale_idx" ON "pages_faq" USING btree ("_locale");
  CREATE INDEX "_pages_v_version_faq_items_order_idx" ON "_pages_v_version_faq_items" USING btree ("_order");
  CREATE INDEX "_pages_v_version_faq_items_parent_id_idx" ON "_pages_v_version_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_faq_items_locale_idx" ON "_pages_v_version_faq_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_version_faq_order_idx" ON "_pages_v_version_faq" USING btree ("_order");
  CREATE INDEX "_pages_v_version_faq_parent_id_idx" ON "_pages_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_faq_locale_idx" ON "_pages_v_version_faq" USING btree ("_locale");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_faq_items" CASCADE;
  DROP TABLE "pages_faq" CASCADE;
  DROP TABLE "_pages_v_version_faq_items" CASCADE;
  DROP TABLE "_pages_v_version_faq" CASCADE;`)
}
