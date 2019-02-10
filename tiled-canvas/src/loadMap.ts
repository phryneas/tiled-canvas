import { TsxJson, TmxJson, Layer, TileLayer } from './model/tiled';
import { isTileLayer } from './helpers';

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

    tmxJson.layers = tmxJson.layers.map(layer => (isTileLayer(layer) ? normalizeLayer(options)(layer) : layer));

    const tsxJsonResult = await fetch(new URL(tmxJson.tilesets[0].source, base).toString());
    const tsxJson = (await tsxJsonResult.json()) as TsxJson;

    const tileSet = document.createElement('img');
    await new Promise(resolve => {
        tileSet.onload = resolve;
        tileSet.src = new URL(tsxJson.image, base).toString();
    });
    return { tmxJson, tsxJson, tileSet };
}

const normalizeLayer = (options: ExtraOptions) => (layer: TileLayer): TileLayer => {
    const normalizeWithDecompressionFn = (decompressionFn?: (_: string) => number[]) => {
        if (!decompressionFn) {
            throw new Error('encountered compressed data, but no correct decompression function was given!');
        }
        if (layer.data) {
            layer.data = decompressionFn((layer.data as any) as string);
        }
        if (layer.chunks) {
            layer.chunks.forEach(chunk => {
                if (typeof chunk.data === 'string') chunk.data = decompressionFn(chunk.data);
            });
        }
        layer.encoding = 'csv';
        delete layer.compression;
    };

    if (layer.encoding === 'base64' && layer.compression === 'zlib') {
        normalizeWithDecompressionFn(options.decompressZlib);
    }
    if (layer.encoding === 'base64' && layer.compression === 'gzip') {
        normalizeWithDecompressionFn(options.decompressGzip);
    }
    return layer;
};
