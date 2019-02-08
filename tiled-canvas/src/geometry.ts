import { Layer, TmxJson } from './model/tiled';

interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}

export function layerToRectangles(layer: Layer, { tilewidth, tileheight }: TmxJson): Rectangle[] {
    const rectMap: Array<Array<Rectangle>> = [];
    const getRect = (x: number, y: number): Rectangle | undefined => (rectMap[y] || [])[x];
    const setRect = (x: number, y: number, rect: Rectangle) => {
        if (!rectMap[y]) {
            rectMap[y] = [];
        }
        rectMap[y][x] = rect;
    };

    const accumulateLayer = (layer: Layer) => {
        if (layer.data) {
            for (let dy = 0; dy < layer.height; dy++) {
                for (let dx = 0; dx < layer.width; dx++) {
                    const x = layer.x + dx;
                    const y = layer.y + dy;
                    const value = layer.data[dy * layer.width + dx];

                    if (value) {
                        let rect = { x, y, width: 1, height: 1 };
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

        for (const subLayer of layer.layers || []) {
            acc.push(...accumulateLayer(subLayer));
        }

        return acc;
    };

    return accumulateLayer(layer).map(({ x, y, width, height }) => ({
        x: x * tilewidth,
        y: y * tileheight,
        width: width * tilewidth,
        height: height * tileheight
    }));
}
