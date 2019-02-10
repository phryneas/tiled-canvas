import { loadMap, drawCanvasLayer, tileLayerToRectangles, helpers } from 'tiled-canvas';

declare global {
    interface Window {
        example4(canvas: HTMLCanvasElement): void;
    }
}

const baseDir = `${window.location.origin}${window.location.pathname}`.replace(/^(.*?)(\/[^/]*\.[^/]*)?$/, '$1');

window.example4 = canvas => {
    const context = canvas.getContext('2d');
    if (!context) {
        throw new Error('could not get context');
    }

    loadMap('island.tmx.json', `${baseDir}/rpg/`).then(basicConfig => {
        for (const layer of basicConfig.tmxJson.layers.filter(
            /* just show tile layers in this example because the overlapping object layer is confusing */
            helpers.isTileLayer
        )) {
            const layerConfig = {
                ...basicConfig,
                context,
                layer
            };
            drawCanvasLayer(layerConfig);
        }
        const collisionLayer = basicConfig.tmxJson.layers.find(layer => layer.name === 'Fringe')!;
        const objects = tileLayerToRectangles(collisionLayer, basicConfig.tmxJson);
        const fakeLayer = {
            ...collisionLayer,
            type: 'objectgroup',
            objects
        };
        drawCanvasLayer({ ...basicConfig, context, layer: fakeLayer });
    });
};
