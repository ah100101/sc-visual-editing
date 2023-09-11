import {
  SitecoreContextValue,
  useSitecoreContext,
} from "@sitecore-jss/sitecore-jss-nextjs";
import { vercelStegaCombine } from "@vercel/stega";

type SitecoreVisualEditingParams = {
  origin: string;
  tenant?: string;
  organization?: string;
  language: string;
  itemId: string;
  site: string;
};

export function useVercelPreviewLink(text: string): string {
  const { sitecoreContext } = useSitecoreContext();
  if (visualEditingIsEnabled()) {
    return encodeVisualEditingInfo(text, sitecoreContext);
  }
  return text;
}

function stegaCombine(
  str: string,
  params: SitecoreVisualEditingParams
): string {
  return vercelStegaCombine(str, {
    origin: params.origin,
    href: `https://${params.origin}/composer/pages/editor?sc_itemid=${params.itemId}&sc_lang=${params.language}&sc_site=${params.site}&sc_version=1`,
  });
}

function encodeVisualEditingInfo(
  str: string,
  context: SitecoreContextValue
): string {
  if (!context?.itemId || !context?.site?.name || !context?.language) {
    warnAboutMissingContext(context);
    return str;
  }

  const params: SitecoreVisualEditingParams = {
    origin: process.env.VISUAL_EDITING_ORIGIN ?? "pages.sitecorecloud.io",
    tenant: process.env.VISUAL_EDITING_TENANT,
    organization: process.env.VISUAL_EDITING_ORGANIZATION,
    itemId: context.itemId,
    site: context.site.name,
    language: context.language,
  };

  return stegaCombine(str, params);
}

function visualEditingIsEnabled(): boolean {
  if (process.env.VERCEL_ENV === "production") {
    return false;
  }

  if (process.env.VISUAL_EDITING_ENABLED && process.env.VISUAL_EDITING_ORIGIN) {
    return true;
  }

  if (!process.env.VISUAL_EDITING_ORIGIN) {
    console.warn(
      "The VISUAL_EDITING_ORIGIN environment variable must be set to enable visual editing"
    );
  }

  return false;
}

function warnAboutMissingContext(context?: SitecoreContextValue): void {
  if (!context?.itemId) {
    console.warn(
      "Unable to encode visual editing info, context.itemId is undefined"
    );
  }
  if (!context?.site?.name) {
    console.warn(
      "Unable to encode visual editing info, context.site.name is undefined"
    );
  }
  if (!context?.language) {
    console.warn(
      "Unable to encode visual editing info, context.language is undefined"
    );
  }
}
