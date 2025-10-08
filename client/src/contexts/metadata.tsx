import { Title as T, Link as L, Meta as M } from "@solidjs/meta";
import { type JSX, createEffect, For, on } from "solid-js"
import { useConfig } from "@/contexts/config"
import { useLocation } from "@solidjs/router"
import Fragment from "@/lib/fragment"
import type { StaticRoute, MetaHttpEquivTag } from "@/types/static.route";

export const StaticMetadata = () => {
  const config = useConfig();
  const location = useLocation();

  createEffect(on(
    () => location.pathname,
    () => {
      document.querySelectorAll('head [id="__SERVER_PROPS__"]').forEach((el) => el.remove());
    }
  ));

  const defaultMeta = config.staticRoute.find(route => route.path === "*");
  const currentMeta =
    config.staticRoute.find(route => route.path === location.pathname) ??
    config.staticRoute.find(route => route.path === "#not_found");

  const mergedMeta = {
    title: currentMeta?.title,
    meta: [...(defaultMeta?.meta ?? []), ...(currentMeta?.meta ?? [])],
    link: [...(defaultMeta?.link ?? []), ...(currentMeta?.link ?? [])],
  };

  return (
    <Fragment>
      {mergedMeta.title && <T>{mergedMeta.title}</T>}

      {mergedMeta.meta?.map((meta) => {
        if ("charset" in meta) return <M charset={meta.charset} />;
        if ("name" in meta) return <M name={meta.name} content={meta.content} />;
        if ("property" in meta) return <M property={meta.property} content={meta.content} />;
        if ("http-equiv" in meta) return <M http-equiv={meta["http-equiv"] as MetaHttpEquivTag["http-equiv"]} content={meta.content} />;
        return null;
      })}

      <For each={mergedMeta.link}>
        {(link) => <L {...link as JSX.HTMLAttributes<HTMLLinkElement>} />}
      </For>
    </Fragment>
  );
};

export const DynamicMetadata = ({ currentMeta }: { currentMeta: StaticRoute }) => {
  const config = useConfig();

  createEffect(on(
    () => location.pathname,
    () => {
      document.querySelectorAll('head [id="__SERVER_PROPS__"]').forEach((el) => el.remove());
    }
  ));

  const defaultMeta = config.staticRoute.find(route => route.path === "*");

  const mergedMeta = {
    title: currentMeta?.title,
    meta: [...(defaultMeta?.meta ?? []), ...(currentMeta?.meta ?? [])],
    link: [...(defaultMeta?.link ?? []), ...(currentMeta?.link ?? [])],
  };

  return (
    <Fragment>
      {mergedMeta.title && <T>{mergedMeta.title}</T>}

      {mergedMeta.meta?.map((meta) => {
        if ("charset" in meta) return <M charset={meta.charset} />;
        if ("name" in meta) return <M name={meta.name} content={meta.content} />;
        if ("property" in meta) return <M property={meta.property} content={meta.content} />;
        if ("http-equiv" in meta) return <M http-equiv={meta["http-equiv"] as MetaHttpEquivTag["http-equiv"]} content={meta.content} />;
        return null;
      })}

      {mergedMeta.link?.map((link) => (
        <L  {...link as JSX.HTMLAttributes<HTMLLinkElement>} />
      ))}
    </Fragment>
  );
};

export const PathBasedMetadata = ({ paths }: { paths: Array<string> }) => {
  const config = useConfig();

  createEffect(on(
    () => location.pathname,
    () => {
      document.querySelectorAll('head [id="__SERVER_PROPS__"]').forEach((el) => el.remove());
    }
  ));

  // Only match explicitly passed paths — no default fallback
  const matchedRoutes = paths
    .map(path => config.staticRoute.find(route => route.path === path))
    .filter(Boolean);

  const mergedMeta = {
    title: matchedRoutes.find(r => r?.title)?.title,
    meta: matchedRoutes.flatMap(r => r?.meta ?? []),
    link: matchedRoutes.flatMap(r => r?.link ?? []),
  };

  return (
    <Fragment>
      {mergedMeta.title && <T>{mergedMeta.title}</T>}

      {mergedMeta.meta.map((meta) => {
        if ("charset" in meta) return <M charset={meta.charset} />;
        if ("name" in meta) return <M name={meta.name} content={meta.content} />;
        if ("property" in meta) return <M property={meta.property} content={meta.content} />;
        if ("http-equiv" in meta) return <M http-equiv={meta["http-equiv"] as MetaHttpEquivTag["http-equiv"]} content={meta.content} />;
        return null;
      })}

      {mergedMeta.link.map((link) => (
        <L {...link as JSX.HTMLAttributes<HTMLLinkElement>} />
      ))}
    </Fragment>
  );
};
