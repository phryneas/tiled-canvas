import { TsxJson, TmxJson, Layer } from './model/tiled';

export interface MapData {
    tsxJson: TsxJson;
    tmxJson: TmxJson;
    tileSet: HTMLImageElement;
}

export interface ExtraOptions {
    decompressZlib?: (base64string: string) => number[];
    decompressGzip?: (base64string: string) => number[];
}

export async function loadMap(tmxJsonFilename: string, base: string, options: ExtraOptions = {}): Promise<MapData> {
    const tmxJsonResult = await fetch(new URL(tmxJsonFilename, base).toString());
    const tmxJson = (await tmxJsonResult.json()) as TmxJson;

    tmxJson.layers = tmxJson.layers.map(normalizeLayer(options));

    const tsxJsonResult = await fetch(new URL(tmxJson.tilesets[0].source, base).toString());
    const tsxJson = (await tsxJsonResult.json()) as TsxJson;

    const tileSet = document.createElement('img');
    await new Promise(resolve => {
        tileSet.onload = resolve;
        tileSet.src = new URL(tsxJson.image, base).toString();
    });
    return { tmxJson, tsxJson, tileSet };
}

const normalizeLayer = (options: ExtraOptions) => (layer: Layer): Layer => {
    if (layer.encoding === 'base64' && layer.compression === 'zlib') {
        if (!options.decompressZlib) {
            throw new Error('encountered zlib compressed data, but no decompressZlib option was given!');
        }
        layer.data = options.decompressZlib((layer.data as any) as string);
        layer.encoding = 'csv';
        delete layer.compression;
    }
    if (layer.encoding === 'base64' && layer.compression === 'gzip') {
        if (!options.decompressGzip) {
            throw new Error('encountered zlib compressed data, but no decompressGzip option was given!');
        }
        layer.data = options.decompressGzip((layer.data as any) as string);
        layer.encoding = 'csv';
        delete layer.compression;
    }
    return layer;
};
