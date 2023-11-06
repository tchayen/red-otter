export function createTextureFromImageBitmap(
  device: GPUDevice,
  imageBitmap: ImageBitmap
): GPUTexture {
  const size = { height: imageBitmap.height, width: imageBitmap.width };

  const texture = device.createTexture({
    format: "rgba8unorm",
    label: "image bitmap",
    size,
    usage:
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_DST |
      GPUTextureUsage.RENDER_ATTACHMENT,
  });

  device.queue.copyExternalImageToTexture({ source: imageBitmap }, { texture }, size);

  return texture;
}
