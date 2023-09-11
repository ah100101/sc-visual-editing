import { useEffect } from "react";
import { GetStaticPaths, GetStaticProps } from "next";
import NotFound from "src/NotFound";
import Layout from "src/Layout";
import {
  RenderingType,
  SitecoreContext,
  ComponentPropsContext,
  handleEditorFastRefresh,
  EditingComponentPlaceholder,
  StaticPath,
} from "@sitecore-jss/sitecore-jss-nextjs";
import { SitecorePageProps } from "lib/page-props";
import { sitecorePagePropsFactory } from "lib/page-props-factory";
// different componentFactory method will be used based on whether page is being edited
import {
  componentFactory,
  editingComponentFactory,
} from "temp/componentFactory";
import { sitemapFetcher } from "lib/sitemap-fetcher";
// import { vercelStegaCombine } from "@vercel/stega";

// type SitecorePageData = {
//   name: string;
//   site: string | undefined;
//   itemId: string | undefined;
//   templateName: string | undefined;
//   templateId: string | undefined;
//   layoutId: string | undefined;
//   itemLanguage: string | undefined;
//   tenant: string;
//   organization: string;
// };

// function getPageData(layoutData: any): SitecorePageData | null {
//   if (!layoutData || !layoutData.sitecore || !layoutData.sitecore.route)
//     return null;

//   return {
//     name: layoutData.sitecore.route.name,
//     site: layoutData.sitecore.context.site.name,
//     itemId: layoutData.sitecore.route.itemId,
//     templateName: layoutData.sitecore.route.templateName,
//     templateId: layoutData.sitecore.route.templateId,
//     layoutId: layoutData.sitecore.route.layoutId,
//     itemLanguage: layoutData.sitecore.route.itemLanguage,
//     // TODO: will need to be set via env vars
//     tenant: "vercel-partnerdemo01-production",
//     // TODO: will need to be set via env vars
//     organization: "org_0Rd0qFSPesWP6WLA",
//   };
// }

// function encodeLayoutData(layoutData: any, pageData: SitecorePageData): void {
//   // Base case: if the object is null or undefined, return it as is
//   if (!layoutData) return layoutData;

//   // Check if the current object has a "value" property and if its value is a string
//   if (
//     layoutData.hasOwnProperty("value") &&
//     typeof layoutData.value === "string"
//   ) {
//     if (!pageData.itemId) return;
//     layoutData.value = encodeEditInfo(layoutData.value, pageData);
//   }

//   // Iterate over the properties of the object
//   for (let key in layoutData) {
//     if (typeof layoutData[key] === "object") {
//       // If the property is an object or array
//       encodeLayoutData(layoutData[key], pageData);
//     }
//   }
// }

// function encodeEditInfo(value: string, pageData: SitecorePageData) {
//   return vercelStegaCombine(value, {
//     origin: "pages.sitecorecloud.io",
//     href: `https://pages.sitecorecloud.io/composer/pages/editor?tenantName=${pageData.tenant}&organization=${pageData.organization}&sc_itemid=${pageData.itemId}&sc_lang=${pageData.itemLanguage}&sc_site=${pageData.site}&sc_version=1`,
//     data: {},
//   });
// }

const SitecorePage = ({
  notFound,
  componentProps,
  layoutData,
}: SitecorePageProps): JSX.Element => {
  useEffect(() => {
    // Since Sitecore editors do not support Fast Refresh, need to refresh editor chromes after Fast Refresh finished
    handleEditorFastRefresh();
  }, []);

  if (notFound || !layoutData.sitecore.route) {
    // Shouldn't hit this (as long as 'notFound' is being returned below), but just to be safe
    return <NotFound />;
  }

  const isEditing = layoutData.sitecore.context.pageEditing;
  const isComponentRendering =
    layoutData.sitecore.context.renderingType === RenderingType.Component;

  // const pageData = getPageData(layoutData);
  // if (pageData) {
  //   encodeLayoutData(layoutData, pageData);
  // }

  return (
    <ComponentPropsContext value={componentProps}>
      <SitecoreContext
        componentFactory={
          isEditing ? editingComponentFactory : componentFactory
        }
        layoutData={layoutData}
      >
        {/*
          Sitecore Pages supports component rendering to avoid refreshing the entire page during component editing.
          If you are using Experience Editor only, this logic can be removed, Layout can be left.
        */}
        {isComponentRendering ? (
          <EditingComponentPlaceholder rendering={layoutData.sitecore.route} />
        ) : (
          <Layout layoutData={layoutData} />
        )}
      </SitecoreContext>
    </ComponentPropsContext>
  );
};

// This function gets called at build and export time to determine
// pages for SSG ("paths", as tokenized array).
export const getStaticPaths: GetStaticPaths = async (context) => {
  // Fallback, along with revalidate in getStaticProps (below),
  // enables Incremental Static Regeneration. This allows us to
  // leave certain (or all) paths empty if desired and static pages
  // will be generated on request (development mode in this example).
  // Alternatively, the entire sitemap could be pre-rendered
  // ahead of time (non-development mode in this example).
  // See https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration

  let paths: StaticPath[] = [];
  let fallback: boolean | "blocking" = "blocking";

  if (
    process.env.NODE_ENV !== "development" &&
    !process.env.DISABLE_SSG_FETCH
  ) {
    try {
      // Note: Next.js runs export in production mode
      paths = await sitemapFetcher.fetch(context);
    } catch (error) {
      console.log("Error occurred while fetching static paths");
      console.log(error);
    }

    fallback = process.env.EXPORT_MODE ? false : fallback;
  }

  return {
    paths,
    fallback,
  };
};

// This function gets called at build time on server-side.
// It may be called again, on a serverless function, if
// revalidation (or fallback) is enabled and a new request comes in.
export const getStaticProps: GetStaticProps = async (context) => {
  const props = await sitecorePagePropsFactory.create(context);

  return {
    props,
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 5 seconds
    revalidate: 5, // In seconds
    notFound: props.notFound, // Returns custom 404 page with a status code of 404 when true
  };
};

export default SitecorePage;
