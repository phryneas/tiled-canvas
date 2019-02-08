import { loadMap, drawCanvasLayer } from 'tiled-canvas';

declare global {
    interface Window {
        example1(canvas: HTMLCanvasElement): void;
    }
}

const baseDir = `${window.location.origin}${window.location.pathname}`.replace(/^(.*?)(\/[^/]*\.[^/]*)?$/, '$1');

window.example1 = canvas => {
    const context = canvas.getContext('2d');
    if (!context) {
        throw new Error('could not get context');
    }

    loadMap('island.tmx.json', `${baseDir}/rpg/`).then(basicConfig => {
        for (const layer of basicConfig.tmxJson.layers) {
            const layerConfig = {
                ...basicConfig,
                context,
                layer
            };
            drawCanvasLayer(layerConfig);
        }
    });
};
