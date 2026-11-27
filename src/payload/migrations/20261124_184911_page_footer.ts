import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" ADD COLUMN "show_in_footer" boolean DEFAULT false;
  ALTER TABLE "pages" ADD COLUMN "footer_order" numeric DEFAULT 0;
  ALTER TABLE "pages_locales" ADD COLUMN "nav_title" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_show_in_footer" boolean DEFAULT false;
  ALTER TABLE "_pages_v" ADD COLUMN "version_footer_order" numeric DEFAULT 0;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_nav_title" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" DROP COLUMN "show_in_footer";
  ALTER TABLE "pages" DROP COLUMN "footer_order";
  ALTER TABLE "pages_locales" DROP COLUMN "nav_title";
  ALTER TABLE "_pages_v" DROP COLUMN "version_show_in_footer";
  ALTER TABLE "_pages_v" DROP COLUMN "version_footer_order";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_nav_title";`)
}
