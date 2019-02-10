import { TmxJson, Layer, TsxJson, TileLayer, GroupLayer, ObjectLayer, ImageLayer } from './model/tiled';
import {
    isTileLayer,
    isGroupLayer,
    isObjectLayer,
    isImageLayer,
    isEllipse,
    isPoint,
    isPolygon,
    isPolyline,
    isRectangle,
    isText,
    isTilemapObject
} from './helpers';

import memoize from 'micro-memoize';

const getAnimatedTile = memoize(
    (animationTime: number, { tiles }: TsxJson) =>
        memoize(
            (tileIndex: number) => {
                const baseTileIndex = tileIndex & (0x0fffffff - 1);
                const rotation = tileIndex & 0xf0000000;

                if (!tiles || !tiles[baseTileIndex] || !tiles[baseTileIndex].animation) {
                    return tileIndex;
                }

                const animation = tiles[baseTileIndex].animation;
                const animationTotal = animation.reduce((sum, item) => sum + item.duration, 0);

                animationTime = animationTime % animationTotal;
                let time = 0;
                for (const frame of animation) {
                    time += frame.duration;
                    if (time >= animationTime) {
                        return (frame.tileid | rotation) + 1;
                    }
                }
                return tileIndex;
            },
            { maxSize: Number.POSITIVE_INFINITY }
        ),
    { maxSize: 2 } // for "last render" and "current render"
);

export interface DrawCanvasLayerArgs<LayerType extends Layer = Layer> {
    layer: LayerType;
    context: CanvasRenderingContext2D;
    tileSet: HTMLImageElement;
    tmxJson: TmxJson;
    tsxJson: TsxJson;
    animationTime?: number;
    /** if lastAnimationTime is set, only tiles that changed animation state between animationTime and lastAnimationTime will be drawn */
    lastAnimationTime?: number;
}

export function drawCanvasLayer(args: DrawCanvasLayerArgs) {
    const { layer } = args;
    if (isTileLayer(layer)) {
        drawTileLayer(args as DrawCanvasLayerArgs<TileLayer>);
    } else if (isGroupLayer(layer)) {
        drawGroupLayer(args as DrawCanvasLayerArgs<GroupLayer>);
    } else if (isObjectLayer(layer)) {
        drawObjectLayer(args as DrawCanvasLayerArgs<ObjectLayer>);
    } else if (isImageLayer(layer)) {
        drawImageLayer(args as DrawCanvasLayerArgs<ImageLayer>);
    }
}

function drawTileLayer(args: DrawCanvasLayerArgs<TileLayer>) {
    const {
        layer,
        context,
        tileSet,
        tmxJson: { width, height },
        tsxJson,
        animationTime = 0,
        lastAnimationTime
    } = args;

    if (!Array.isArray(layer.data)) {
        return;
    }

    const getTileIndex = getAnimatedTile(animationTime, tsxJson);
    const getLastTileIndex = lastAnimationTime ? getAnimatedTile(lastAnimationTime, tsxJson) : getTileIndex;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const gridIndex = y * width + x;
            if (layer.data[gridIndex] === 0) {
                continue;
            }
            const tileIndex = getTileIndex(layer.data[gridIndex]);
            if (lastAnimationTime) {
                const lastTileIndex = getLastTileIndex(layer.data[gridIndex]);
                if (lastTileIndex === tileIndex) {
                    continue;
                }
            }
            context.save();
            drawCanvasTile({ x, y, tileIndex, context, tileSet, layer, tsxJson });
            context.restore();
        }
    }
}

function drawGroupLayer(args: DrawCanvasLayerArgs<GroupLayer>) {
    const { layer } = args;

    if (!Array.isArray(layer.layers)) {
        return;
    }

    for (const subLayer of layer.layers) {
        // drawing Sublayer
        drawCanvasLayer({ ...args, layer: subLayer });
    }
}

function drawObjectLayer(args: DrawCanvasLayerArgs<ObjectLayer>) {
    const { layer, context: ctx } = args;

    if (!Array.isArray(layer.objects)) {
        return;
    }

    for (const obj of layer.objects) {
        ctx.save();
        ctx.translate(obj.x, obj.y);
        // TODO: take care of rotation
        if (isTilemapObject(obj)) {
            // no idea what this is
        } else if (isEllipse(obj)) {
            ctx.ellipse(obj.width / 2, obj.height / 2, obj.width / 2, obj.height / 2, 0, 0, 2 * Math.PI);
            ctx.stroke();
        } else if (isPoint(obj)) {
            ctx.rect(0, 0, 1, 1);
            ctx.stroke();
        } else if (isPolygon(obj)) {
            ctx.beginPath();
            const first = obj.polygon[0];
            if (first) {
                ctx.moveTo(first.x, first.y);
            }
            for (const { x, y } of obj.polygon) {
                ctx.lineTo(x, y);
            }
            if (first) {
                ctx.lineTo(first.x, first.y);
            }
            ctx.closePath();
            ctx.stroke();
        } else if (isPolyline(obj)) {
            ctx.beginPath();
            const first = obj.polyline[0];
            if (first) {
                ctx.moveTo(first.x, first.y);
            }
            for (const { x, y } of obj.polyline) {
                ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
        } else if (isText(obj)) {
            for (const value of Object.values(obj.text)) {
                ctx.fillText(value, 0, 0);
            }
        } /* isRectangle(obj) */ else {
            ctx.rect(0, 0, obj.width, obj.height);
            ctx.stroke();
        }
        ctx.fillText(obj.name, 0, -5);
        ctx.restore();
    }
}

function drawImageLayer(args: DrawCanvasLayerArgs<ImageLayer>) {
    throw 'drawing ImageLayers is not implemented yet!';
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
    const realTileIndex = (tileIndex & 0x0fffffff) - 1;

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
