import { loadMap, drawCanvasLayer } from 'tiled-canvas';

const baseDir = `${window.location.origin}${window.location.pathname}`.replace(/^(.*?)(\/[^/]*\.[^/]*)?$/, '$1');

const canvas1 = document.getElementById('example-canvas-1') as HTMLCanvasElement;
const context = canvas1.getContext('2d');
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
