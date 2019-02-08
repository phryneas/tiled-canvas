import { loadMap, drawCanvasLayer } from 'tiled-canvas';
import pako from 'pako';

declare global {
    interface Window {
        example2(canvas: HTMLCanvasElement): void;
    }
}

const baseDir = `${window.location.origin}${window.location.pathname}`.replace(/^(.*?)(\/[^/]*\.[^/]*)?$/, '$1');

function decompressZlib(base64String: string): number[] {
    try {
        const from: Uint8Array = pako.inflate(atob(base64String));
        const to = new Uint32Array(from.length / 4);
        for (let pos = 0; pos < from.length; pos += 4) {
            to[pos / 4] = from[pos] + (from[pos + 1] << 8) + (from[pos + 2] << 16) + (from[pos + 3] << 24);
        }
        return Array.from(to);
    } catch (e) {
        console.log(e);
        throw e;
    }
}

window.example2 = canvas => {
    const context = canvas.getContext('2d');
    if (!context) {
        throw new Error('could not get context');
    }

    loadMap('island.tmx.json_zlib', `${baseDir}/rpg/`, { decompressZlib }).then(basicConfig => {
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
