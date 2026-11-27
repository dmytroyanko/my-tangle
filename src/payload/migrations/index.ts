import * as migration_20261119_143536_initial from './20261119_143536_initial';
import * as migration_20261120_181208_showcase_fields from './20261120_181208_showcase_fields';
import * as migration_20261120_214924_category_faq from './20261120_214924_category_faq';
import * as migration_20261120_220654_category_benefits from './20261120_220654_category_benefits';
import * as migration_20261121_221448_product_specs from './20261121_221448_product_specs';
import * as migration_20261123_181611_sale_prices_home_categories from './20261123_181611_sale_prices_home_categories';
import * as migration_20261123_192748_pet_spec_keys from './20261123_192748_pet_spec_keys';
import * as migration_20261123_220805_category_brand from './20261123_220805_category_brand';
import * as migration_20261123_222456_variant_discount from './20261123_222456_variant_discount';
import * as migration_20261124_114655_page_faq from './20261124_114655_page_faq';
import * as migration_20261124_143720_bundle_discount_toggle from './20261124_143720_bundle_discount_toggle';
import * as migration_20261124_184911_page_footer from './20261124_184911_page_footer';
import * as migration_20261124_190452_checkout_orders from './20261124_190452_checkout_orders';
import * as migration_20261125_132103_no_sale_bundle_on from './20261125_132103_no_sale_bundle_on';
import * as migration_20261125_140734_user_roles from './20261125_140734_user_roles';
import * as migration_20261125_211957_service_pages_payments from './20261125_211957_service_pages_payments';
import * as migration_20261125_223903_category_product_views from './20261125_223903_category_product_views';
import * as migration_20261125_232342_home_page_faq from './20261125_232342_home_page_faq';
import * as migration_20261126_151135_catalog_hierarchy from './20261126_151135_catalog_hierarchy';

export const migrations = [
  {
    up: migration_20261119_143536_initial.up,
    down: migration_20261119_143536_initial.down,
    name: '20261119_143536_initial',
  },
  {
    up: migration_20261120_181208_showcase_fields.up,
    down: migration_20261120_181208_showcase_fields.down,
    name: '20261120_181208_showcase_fields',
  },
  {
    up: migration_20261120_214924_category_faq.up,
    down: migration_20261120_214924_category_faq.down,
    name: '20261120_214924_category_faq',
  },
  {
    up: migration_20261120_220654_category_benefits.up,
    down: migration_20261120_220654_category_benefits.down,
    name: '20261120_220654_category_benefits',
  },
  {
    up: migration_20261121_221448_product_specs.up,
    down: migration_20261121_221448_product_specs.down,
    name: '20261121_221448_product_specs',
  },
  {
    up: migration_20261123_181611_sale_prices_home_categories.up,
    down: migration_20261123_181611_sale_prices_home_categories.down,
    name: '20261123_181611_sale_prices_home_categories',
  },
  {
    up: migration_20261123_192748_pet_spec_keys.up,
    down: migration_20261123_192748_pet_spec_keys.down,
    name: '20261123_192748_pet_spec_keys',
  },
  {
    up: migration_20261123_220805_category_brand.up,
    down: migration_20261123_220805_category_brand.down,
    name: '20261123_220805_category_brand',
  },
  {
    up: migration_20261123_222456_variant_discount.up,
    down: migration_20261123_222456_variant_discount.down,
    name: '20261123_222456_variant_discount',
  },
  {
    up: migration_20261124_114655_page_faq.up,
    down: migration_20261124_114655_page_faq.down,
    name: '20261124_114655_page_faq',
  },
  {
    up: migration_20261124_143720_bundle_discount_toggle.up,
    down: migration_20261124_143720_bundle_discount_toggle.down,
    name: '20261124_143720_bundle_discount_toggle',
  },
  {
    up: migration_20261124_184911_page_footer.up,
    down: migration_20261124_184911_page_footer.down,
    name: '20261124_184911_page_footer',
  },
  {
    up: migration_20261124_190452_checkout_orders.up,
    down: migration_20261124_190452_checkout_orders.down,
    name: '20261124_190452_checkout_orders',
  },
  {
    up: migration_20261125_132103_no_sale_bundle_on.up,
    down: migration_20261125_132103_no_sale_bundle_on.down,
    name: '20261125_132103_no_sale_bundle_on',
  },
  {
    up: migration_20261125_140734_user_roles.up,
    down: migration_20261125_140734_user_roles.down,
    name: '20261125_140734_user_roles',
  },
  {
    up: migration_20261125_211957_service_pages_payments.up,
    down: migration_20261125_211957_service_pages_payments.down,
    name: '20261125_211957_service_pages_payments',
  },
  {
    up: migration_20261125_223903_category_product_views.up,
    down: migration_20261125_223903_category_product_views.down,
    name: '20261125_223903_category_product_views',
  },
  {
    up: migration_20261125_232342_home_page_faq.up,
    down: migration_20261125_232342_home_page_faq.down,
    name: '20261125_232342_home_page_faq',
  },
  {
    up: migration_20261126_151135_catalog_hierarchy.up,
    down: migration_20261126_151135_catalog_hierarchy.down,
    name: '20261126_151135_catalog_hierarchy'
  },
];
