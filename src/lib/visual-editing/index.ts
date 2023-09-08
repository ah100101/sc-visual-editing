import { SitecoreContextValue } from "@sitecore-jss/sitecore-jss-nextjs";
import { vercelStegaCombine } from "@vercel/stega";

export type SitecoreVisualEditingParams = {
  origin: string;
  tenant: string | undefined;
  organization: string | undefined;
  language: string;
  itemId: string;
  site: string;
};

function stegaCombine(
  str: string,
  params: SitecoreVisualEditingParams
): string {
  return vercelStegaCombine(str, {
    origin: params.origin,
    href: `https://${params.origin}/composer/pages/editor?tenantName=${params.tenant}&organization=${params.organization}&sc_itemid=${params.itemId}&sc_lang=${params.language}&sc_site=${params.site}&sc_version=1`,
    data: {},
  });
}

export function encodeVisualEditingInfo(
  str: string,
  context: SitecoreContextValue
): string {
  if (!context?.itemId) {
    console.warn(
      "Unable to encode visual editing info, context.itemId is undefined"
    );
    return str;
  }
  if (!context?.site?.name) {
    console.warn(
      "Unable to encode visual editing info, context.itemId is undefined"
    );
    return str;
  }

  if (!context?.language) {
    console.warn(
      "Unable to encode visual editing info, context.language is undefined"
    );
    return str;
  }

  const params: SitecoreVisualEditingParams = {
    // todo: what happens if there is no tenant or organization?
    origin: process.env.VISUAL_EDITING_ORIGIN || "pages.sitecorecloud.io",
    tenant: process.env.VISUAL_EDITING_TENANT,
    organization: process.env.VISUAL_EDITING_ORGANIZATION,
    itemId: context.itemId,
    site: context.site.name,
    language: context.language,
  };

  return stegaCombine(str, params);
}

export function visualEditingEnabled(): boolean {
  // todo, check env vars for Vercel
  if (process.env.VISUAL_EDITING_ENABLED === "true") {
    if (!process.env.VISUAL_EDITING_ORIGIN) {
      console.warn(
        "The VISUAL_EDITING_ORIGIN environment variable must be set to enable visual editing"
      );
      return false;
    }
    if (!process.env.VISUAL_EDITING_TENANT) {
      console.warn(
        "The VISUAL_EDITING_TENANT environment variable must be set to enable visual editing"
      );
      return false;
    }
    if (!process.env.VISUAL_EDITING_ORGANIZATION) {
      console.warn(
        "The VISUAL_EDITING_ORGANIZATION environment variable must be set to enable visual editing"
      );
    }
    return true;
  }
  return false;
}
