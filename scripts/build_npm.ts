// ex. scripts/build_npm.ts
import { build, emptyDir } from "@deno/dnt";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  shims: {
    // see JS docs for overview and more options
    deno: true,
  },
  package: {
    // package.json properties
    name: "Pricing4TS",
    version: Deno.args[0],
    description: "Pricing4TS is a TypeScript-based toolkit designed to enhance the server-side functionality of a pricing-driven SaaS by enabling the seamless integration of pricing plans into the application logic. The package provides a suite of components that are predicated on the Pricing2Yaml syntax, a specification that facilitates the definition of system's pricing and its features alongside their respective evaluation expressions, grouping them within plans and add-ons, as well as establishing usage limits.",
    license: "MIT",
    repository: {
      type: "git",
      url: "https://github.com/Alex-GF/Pricing4TS",
    },
    bugs: {
      url: "https://github.com/Alex-GF/Pricing4TS",
    },
  },
  postBuild() {
    // steps to run after building and before running the tests
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
});