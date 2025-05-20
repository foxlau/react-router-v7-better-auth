import {
  type InitOptions,
  type Module,
  type NewableModule,
  createInstance,
  type i18n,
} from "i18next";
import {
  type unstable_MiddlewareFunction,
  type unstable_RouterContextProvider,
  unstable_createContext,
} from "react-router";
import { detect } from "./detector";

export function unstable_createI18nextMiddleware({
  options,
  plugins = [],
}: unstable_createI18nextMiddleware.Params): unstable_createI18nextMiddleware.ReturnType {
  const localeContext = unstable_createContext<string>();
  const i18nextContext = unstable_createContext<i18n>();

  return [
    async function i18nextMiddleware({ request, context }, next) {
      const lng = await detect(request, "cookie");
      context.set(localeContext, lng);

      const instance = createInstance(options);
      for (const plugin of plugins ?? []) instance.use(plugin);
      await instance.init({ lng });
      context.set(i18nextContext, instance);

      return await next();
    },
    (context) => context.get(localeContext),
    (context) => context.get(i18nextContext),
  ];
}

export namespace unstable_createI18nextMiddleware {
  export interface Params {
    /**
     * The i18next options used to initialize the internal i18next instance.
     */
    options: InitOptions;
    /**
     * The i18next plugins used to extend the internal i18next instance
     * when creating a new TFunction.
     */
    plugins?: NewableModule<Module>[] | Module[];
  }

  export type ReturnType = [
    unstable_MiddlewareFunction<Response>,
    (context: unstable_RouterContextProvider) => string,
    (context: unstable_RouterContextProvider) => i18n,
  ];
}
