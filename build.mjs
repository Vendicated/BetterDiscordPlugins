import { context } from "esbuild";
import { readdirSync } from "fs";
import { open, readFile } from "fs/promises";
import { join } from "path";

const isDev = process.argv.includes("--dev");

const plugins = await Promise.all(
    readdirSync("./src/plugins").map(p =>
        context({
            entryPoints: [`./src/plugins/${p}`],
            outfile: `Plugins/${p}/${p}.plugin.js`,
            minify: false,
            bundle: true,
            format: "cjs",
            target: "esnext",
            treeShaking: true,
            jsxFactory: "BdApi.React.createElement",
            jsxFragment: "BdApi.React.Fragment",
            jsx: "transform",
            tsconfig: "./tsconfig.esbuild.json",
            logLevel: "info",
            plugins: [
                {
                    name: "manifest-banner",
                    async setup(build) {
                        build.initialOptions.banner = {
                            js: await readFile(`./src/plugins/${p}/meta.js`, "utf8")
                        };
                    }
                },
                {
                    name: "auto-deploy",
                    setup(build) {
                        build.onEnd(async result => {
                            if (!isDev) return;

                            if (result.errors.length) return;

                            const outFile = `${process.env.APPDATA}/BetterDiscord/plugins/${p}.plugin.js`;
                            const f = await open(outFile, "w");
                            try {
                                await f.write(await readFile(build.initialOptions.outfile));
                                console.info("Deployed", p);
                            } finally {
                                f.close();
                            }
                        });
                    }
                },
                {
                    name: "file-include-plugin",
                    setup: build => {
                        const filter = /^~fileContent\/.+$/;
                        build.onResolve({ filter }, args => ({
                            namespace: "include-file",
                            path: args.path,
                            pluginData: {
                                path: join(args.resolveDir, args.path.slice("include-file/".length))
                            }
                        }));
                        build.onLoad({ filter, namespace: "include-file" }, async ({ pluginData: { path } }) => {
                            const [name, format] = path.split(";");
                            let content = await readFile(name, format ?? "utf-8");
                            content = content.replace(/`/g, "\\`");
                            return {
                                contents: `export default \`${content}\``
                            };
                        });
                    }
                }
            ]
        })
    )
);

for (const p of plugins) {
    if (isDev) p.watch();
    else {
        p.rebuild();
        p.dispose();
    }
}
