import createCompress from "compress-brotli";
import zlib from "node:zlib";

const {
  constants: {
    BROTLI_PARAM_MODE,
    BROTLI_PARAM_QUALITY,
    // BROTLI_PARAM_LGWIN,
    BROTLI_MODE_GENERIC,
  },
} = zlib;
const options = {
  chunkSize: 4096,
  params: {
    [BROTLI_PARAM_MODE]: BROTLI_MODE_GENERIC,
    [BROTLI_PARAM_QUALITY]: 11,
    // [BROTLI_PARAM_LGWIN]: 22,
  },
};

export const brotli = createCompress({
  compressOptions: options,
  decompressOptions: options,
});
