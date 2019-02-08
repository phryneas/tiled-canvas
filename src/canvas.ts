import { TmxJson, Layer, TsxJson } from './model/tiled';

export interface DrawCanvasLayerArgs {
    layer: Layer;
    context: CanvasRenderingContext2D;
    tileSet: HTMLImageElement;
    tmxJson: TmxJson;
    tsxJson: TsxJson;
}

export function drawCanvasLayer({
    layer,
    context,
    tileSet,
    tmxJson,
    tmxJson: { width, height },
    tsxJson
}: DrawCanvasLayerArgs) {
    if (layer.data) {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const gridIndex = y * width + x;
                if (layer.data[gridIndex] === 0) {
                    continue;
                }
                context.save();
                drawCanvasTile({ x, y, tileIndex: layer.data[gridIndex], context, tileSet, layer, tsxJson });
                context.restore();
            }
        }
    }
    for (const subLayer of layer.layers || []) {
        // drawing Sublayer
        drawCanvasLayer({ layer, context, tileSet, tmxJson, tsxJson });
    }
}

export interface DrawCanvasTileArgs {
    x: number;
    y: number;
    tileIndex: number;
    context: CanvasRenderingContext2D;
    tileSet: HTMLImageElement;
    layer: Layer;
    tsxJson: TsxJson;
}

function drawCanvasTile({
    x,
    y,
    tileIndex,
    context,
    tileSet,
    layer,
    tsxJson: { columns: cols, tileheight, tilewidth, spacing }
}: DrawCanvasTileArgs) {
    const flip_horiz = 0x80000000 & tileIndex;
    const flip_vert = 0x40000000 & tileIndex;
    const flip_diag = 0x20000000 & tileIndex;
    const realTileIndex = (tileIndex & 0x1fffffff) - 1;

    const tileX = realTileIndex % cols;
    const tileY = Math.floor(realTileIndex / cols);

    const posX = x * tilewidth;
    const posY = y * tileheight;

    let left = (layer.x + tileX) * (tilewidth + spacing);
    let top = (layer.y + tileY) * (tileheight + spacing);

    context.translate(posX, posY);

    if (flip_horiz) {
        context.translate(tilewidth, 0);
        context.scale(-1, 1);
    }
    if (flip_vert) {
        context.translate(0, tileheight);
        context.scale(1, -1);
    }
    if (flip_diag) {
        context.rotate(Math.PI / 2);
        context.scale(1, -1);
    }

    context.drawImage(tileSet, left, top, tilewidth, tileheight, 0, 0, tilewidth, tileheight);
}
