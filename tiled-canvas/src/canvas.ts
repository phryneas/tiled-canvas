import { TmxJson, Layer, TsxJson } from './model/tiled';
import { isTileLayer, isGroupLayer } from './helpers';

let memoizedAnimatedTiles: { [memoTime: number]: { [tileIndex: number]: number } } = {};

function getAnimatedTile({
    tsxJson: { tiles },
    animationTime,
    tileIndex
}: {
    tsxJson: TsxJson;
    animationTime: number;
    tileIndex: number;
}): number {
    const baseTileIndex = tileIndex & (0x0fffffff - 1);
    const rotation = tileIndex & 0xf0000000;

    if (!tiles || !tiles[baseTileIndex] || !tiles[baseTileIndex].animation) {
        return tileIndex;
    }

    if (!memoizedAnimatedTiles[animationTime]) {
        while (Object.keys(memoizedAnimatedTiles).length > 1) {
            delete memoizedAnimatedTiles[(Object.keys(memoizedAnimatedTiles).sort()[0] as any) as number];
        }
        memoizedAnimatedTiles[animationTime] = [];
    }
    const memoized = memoizedAnimatedTiles[animationTime];

    if (memoized[tileIndex]) {
        return memoized[tileIndex];
    }

    const animation = tiles[baseTileIndex].animation;
    const animationTotal = animation.reduce((sum, item) => sum + item.duration, 0);

    animationTime = animationTime % animationTotal;
    let time = 0;
    let returnValue = tileIndex;
    for (const frame of animation) {
        time += frame.duration;
        if (time >= animationTime) {
            returnValue = (frame.tileid | rotation) + 1;
            break;
        }
    }

    memoized[tileIndex] = returnValue;
    return returnValue;
}

export interface DrawCanvasLayerArgs {
    layer: Layer;
    context: CanvasRenderingContext2D;
    tileSet: HTMLImageElement;
    tmxJson: TmxJson;
    tsxJson: TsxJson;
    animationTime?: number;
}

export function drawCanvasLayer({
    layer,
    context,
    tileSet,
    tmxJson,
    tmxJson: { width, height },
    tsxJson,
    animationTime = 0
}: DrawCanvasLayerArgs) {
    if (isTileLayer(layer) && Array.isArray(layer.data)) {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const gridIndex = y * width + x;
                if (layer.data[gridIndex] === 0) {
                    continue;
                }
                const tileIndex = getAnimatedTile({ tsxJson, animationTime, tileIndex: layer.data[gridIndex] });
                context.save();
                drawCanvasTile({ x, y, tileIndex, context, tileSet, layer, tsxJson });
                context.restore();
            }
        }
    }
    if (isGroupLayer(layer) && Array.isArray(layer.layers)) {
        for (const subLayer of layer.layers) {
            // drawing Sublayer
            drawCanvasLayer({ layer: subLayer, context, tileSet, tmxJson, tsxJson });
        }
    }
}

export interface DrawAnimatedChangesArgs extends DrawCanvasLayerArgs {
    lastAnimationTime: number;
    animationTime: number;
}

export function drawAnimatedChanges({
    layer,
    context,
    tileSet,
    tmxJson,
    tmxJson: { width, height },
    tsxJson,
    animationTime,
    lastAnimationTime
}: DrawAnimatedChangesArgs) {
    if (isTileLayer(layer) && Array.isArray(layer.data)) {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const gridIndex = y * width + x;
                if (layer.data[gridIndex] === 0) {
                    continue;
                }
                const lastTileIndex = getAnimatedTile({
                    tsxJson,
                    animationTime: lastAnimationTime,
                    tileIndex: layer.data[gridIndex]
                });
                const tileIndex = getAnimatedTile({ tsxJson, animationTime, tileIndex: layer.data[gridIndex] });
                if (lastTileIndex === tileIndex) {
                    continue;
                }

                context.save();
                drawCanvasTile({ x, y, tileIndex, context, tileSet, layer, tsxJson });
                context.restore();
            }
        }
    }
    if (isGroupLayer(layer) && Array.isArray(layer.layers)) {
        for (const subLayer of layer.layers) {
            // drawing Sublayer
            drawAnimatedChanges({
                layer: subLayer,
                context,
                tileSet,
                tmxJson,
                tsxJson,
                animationTime,
                lastAnimationTime
            });
        }
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
