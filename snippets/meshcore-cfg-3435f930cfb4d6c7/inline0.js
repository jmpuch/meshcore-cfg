
export async function esp_flash(port, data, eraseAll, onStage, onProgress) {
  const esptool = await import(new URL('esptool.js', document.baseURI).href);
  const transport = new esptool.Transport(port, false);
  const terminal = { clean() {}, writeLine() {}, write() {} };
  const loader = new esptool.ESPLoader({ transport, baudrate: 460800, romBaudrate: 115200, terminal });
  try {
    onStage('connect', '');
    const chip = await loader.main();
    onStage('chip', chip);
    if (eraseAll) onStage('erase', '');
    onStage('write', '');
    await loader.writeFlash({
      fileArray: [{ data, address: 0 }],
      flashMode: 'keep', flashFreq: 'keep', flashSize: 'keep',
      eraseAll, compress: true,
      reportProgress: (_file, written, total) => onProgress(written, total),
    });
    await loader.after('hard_reset');
    return chip;
  } finally {
    try { await transport.disconnect(); } catch (_) {}
  }
}
