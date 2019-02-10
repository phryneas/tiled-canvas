import { TmxJson, TileLayer, GroupLayer, Layer } from './model/tiled';
import { isTileLayer, isGroupLayer, isObjectLayer, isImageLayer } from './helpers';
import { Rectangle, GeometryObject } from './model/tiled-geometry-objects';

export function tileLayerToRectangles(layer: TileLayer, { tilewidth, tileheight }: TmxJson): Rectangle[] {
    const rectMap: Array<Array<Rectangle>> = [];
    const getRect = (x: number, y: number): Rectangle | undefined => (rectMap[y] || [])[x];
    const setRect = (x: number, y: number, rect: Rectangle) => {
        if (!rectMap[y]) {
            rectMap[y] = [];
        }
        rectMap[y][x] = rect;
    };

    const accumulateLayer = (layer: TileLayer) => {
        if (isTileLayer(layer) && layer.data) {
            for (let dy = 0; dy < layer.height; dy++) {
                for (let dx = 0; dx < layer.width; dx++) {
                    const x = layer.x + dx;
                    const y = layer.y + dy;
                    const idx = dy * layer.width + dx;
                    const value = layer.data[idx];

                    if (value) {
                        let rect: Rectangle = {
                            id: (layer.id || 0) * 10000 + idx,
                            name: '',
                            type: '',
                            x,
                            y,
                            width: 1,
                            height: 1,
                            visible: true
                        };
                        const left = getRect(x - 1, y);
                        if (left && left.height === 1) {
                            // grow right
                            left.width++;
                            rect = left;
                        }

                        const top = getRect(x, y - 1);
                        if (top && top.x == rect.x && top.width === rect.width) {
                            // grow bottom
                            for (let x1 = rect.x; x1 < rect.x + rect.width; x1++) {
                                setRect(x1, y, top);
                            }
                            top.height++;
                            rect = top;
                        }

                        setRect(x, y, rect);
                    }
                }
            }
        }

        const acc: Rectangle[] = [];
        for (const row of rectMap) {
            if (!row) {
                continue;
            }
            for (const rect of row) {
                if (rect && !acc.includes(rect)) {
                    acc.push(rect);
                }
            }
        }

        return acc;
    };

    return accumulateLayer(layer).map(rect => ({
        ...rect,
        x: rect.x * tilewidth,
        y: rect.y * tileheight,
        width: rect.width * tilewidth,
        height: rect.height * tileheight
    }));
}

export function layerToGeometryObjects(layer: Layer, tmxJson: TmxJson): Array<GeometryObject> {
    if (isTileLayer(layer)) {
        return tileLayerToRectangles(layer, tmxJson);
    }
    if (isObjectLayer(layer)) {
        return layer.objects;
    }
    if (isGroupLayer(layer)) {
        return layer.layers.reduce(
            (acc, subLayer) => (acc.push(...layerToGeometryObjects(subLayer, tmxJson)), acc),
            [] as Array<GeometryObject>
        );
    }
    if (isImageLayer(layer)) {
        return [];
    }
    return [];
}
