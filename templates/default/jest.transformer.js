const { transformSync } = require("esbuild");

const transformer = {
  createTransformer() {
    return {
      process(sourceText, sourcePath) {
        const options = {
          format: "cjs",
          sourcemap: false,
          target: "node18",
          sourcefile: sourcePath,
          loader: "jsx",
        };
        const { code, map } = transformSync(sourceText, options);
        return { code, map };
      },
    };
  },
};

module.exports = transformer;
