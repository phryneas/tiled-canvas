import { TsxJson, TmxJson, Layer } from './model/tiled';

export interface MapData {
    tsxJson: TsxJson;
    tmxJson: TmxJson;
    tileSet: HTMLImageElement;
}

export async function loadMap(tmxJsonFilename: string, base: string): Promise<MapData> {
    const tmxJsonResult = await fetch(new URL(tmxJsonFilename, base).toString());
    const tmxJson = (await tmxJsonResult.json()) as TmxJson;

    const tsxJsonResult = await fetch(new URL(tmxJson.tilesets[0].source, base).toString());
    const tsxJson = (await tsxJsonResult.json()) as TsxJson;

    const tileSet = document.createElement('img');
    await new Promise(resolve => {
        tileSet.onload = resolve;
        tileSet.src = new URL(tsxJson.image, base).toString();
    });

    return { tmxJson, tsxJson, tileSet };
}
