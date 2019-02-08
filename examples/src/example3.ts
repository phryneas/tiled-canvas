import {
    loadMap,
    drawCanvasLayer,
    DrawCanvasLayerArgs,
    drawAnimatedChanges,
    DrawAnimatedChangesArgs
} from 'tiled-canvas';

declare global {
    interface Window {
        example3(container: HTMLDivElement): void;
    }
}

const baseDir = `${window.location.origin}${window.location.pathname}`.replace(/^(.*?)(\/[^/]*\.[^/]*)?$/, '$1');

window.example3 = container => {
    container.style.position = 'relative';

    loadMap('island.tmx.json', `${baseDir}/rpg/`).then(basicConfig => {
        const contexts = [] as Array<CanvasRenderingContext2D>;
        let lastAnimationTime = Date.now();
        for (const [key, layer] of basicConfig.tmxJson.layers.entries()) {
            const canvas = document.createElement('canvas');
            canvas.width = basicConfig.tmxJson.width * basicConfig.tsxJson.tilewidth;
            canvas.height = basicConfig.tmxJson.height * basicConfig.tsxJson.tileheight;
            canvas.style.position = 'absolute';
            canvas.style.top = '0';
            canvas.style.left = '0';
            container.appendChild(canvas);

            const context = canvas.getContext('2d');
            if (!context) {
                throw new Error('could not get context');
            }

            contexts[key] = context;

            const layerConfig: DrawCanvasLayerArgs = {
                ...basicConfig,
                context,
                layer,
                animationTime: lastAnimationTime
            };
            drawCanvasLayer(layerConfig);
        }

        function drawFrame() {
            let animationTime = Date.now();
            requestAnimationFrame(drawFrame);
            if (animationTime - lastAnimationTime <= 67) {
                // 67 ms -> 15fps
                return;
            }

            // console.time('render example 3');

            for (const [key, layer] of basicConfig.tmxJson.layers.entries()) {
                const context = contexts[key];

                const layerConfig: DrawAnimatedChangesArgs = {
                    ...basicConfig,
                    context,
                    layer,
                    animationTime,
                    lastAnimationTime
                };
                drawAnimatedChanges(layerConfig);
            }
            lastAnimationTime = animationTime;

            // console.timeEnd('render example 3');
        }
        requestAnimationFrame(drawFrame);
    });
};
