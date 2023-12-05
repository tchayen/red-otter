import webpack from "next/dist/compiled/webpack/webpack.js";
import sources from "next/dist/compiled/webpack/sources.js";

/**
 * @typedef {Object} SearchData
 * @property {Object.<string, {data: Record<string, string>, title: string}>} [route]
 */

export class SearchWebpackPlugin {
  /**
   * @param {import("webpack").Compiler} compiler
   */
  apply(compiler) {
    const pluginName = this.constructor.name;
    console.log("SearchPlugin.apply", webpack.webpack.Compilation);

    compiler.hooks.make.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: pluginName,
          stage: webpack.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        (assets) => {
          /** @type {Record<string, SearchData>} */
          const indexFiles = {};

          for (const entry of compilation.entries.values()) {
            const entryDependency = entry.dependencies?.[0];

            // There are some Next.js refactors that might cause the MDX module to be a dependency
            // of the entry module, instead of the entry itself. This is a workaround to find the
            // loaded MDX module.
            let entryModule = compilation.moduleGraph.getResolvedModule(entryDependency);
            console.log({ entryModule });
            if (entryModule && !entryModule.buildInfo?.search) {
              for (const dependency of entryModule.dependencies) {
                const mod = compilation.moduleGraph.getResolvedModule(dependency);
                if (mod?.buildInfo?.search) {
                  entryModule = mod;
                }
              }
            }
            const search = entryModule?.buildInfo?.search;
            if (search) {
              const { title, data, indexKey, route } = search;
              const indexFilename = `search-data-${indexKey}.json`;
              indexFiles[indexFilename] ??= {};
              indexFiles[indexFilename][route] = { data, title };
            }
          }
          for (const [file, content] of Object.entries(indexFiles)) {
            console.log(`[search] emitting ${file}`);
            assets[
              `${process.env.NODE_ENV === "production" ? "../" : ""}../static/chunks/${file}`
            ] = new sources.RawSource(JSON.stringify(content));
          }
        },
      );
    });
  }
}
