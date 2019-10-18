import {ResizeSensor} from 'css-element-queries';
import {
    initHandler,
    appAreaResizeHandler,
    addViewHandler,
    removeViewHandler,
    viewsUpdatedHandler,
    viewResetHandler,
    viewResizeHandler
} from 'viewtron/dist/ipc-renderer';

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener("DOMContentLoaded", () => {
    const replaceText = (selector: string, text: string) => {
        const element = document.getElementById(selector);
        if (element) {
            element.innerText = text;
        }
    };

    for (const type of ["chrome", "node", "electron"]) {
        replaceText(`${type}-version`, (process.versions as any)[type]);
    }

    const appArea = document.getElementById('app-area');

    requestAnimationFrame(() => initHandler(appArea));
    new ResizeSensor(appArea, () => appAreaResizeHandler(appArea));

    let lastViewUpdate: any[] = [];
    // @ts-ignore
    window.currentViews = [];
    viewsUpdatedHandler((views: any[]) => {
        lastViewUpdate = views;
        // @ts-ignore
        window.currentViews = views;
        document.getElementById('sidebar-list').innerHTML = `
            ${views.map(({id, path}) => `
                <li>${path} <button data-view-id="${id}">-</button></li>
            `).join('')}
        `;

        let added = 0;
        document.getElementById('resizers').innerHTML = `
            ${views.map(({id, rectOverride, rect}) => {
            const rectToUse = rectOverride || rect;
            const left: number = added + rectToUse.width + 5;
            added = left;

            return `
                        <div class="resizeHandle" draggable="true" data-view-id="${id}" style="left: ${left}px;"></div>
                    `
        }).join('')}
        `;

    });

    document.getElementById('sidebar-list').addEventListener('click', (event: any) => {
        if (event.target.nodeName !== 'BUTTON') return;

        const {dataset: {viewId} = {viewId: ''}} = event.target;

        if (!viewId) return;

        removeViewHandler(viewId);
    });

    document.getElementById('add-app-form').addEventListener('submit', (event: any) => {
        event.preventDefault();

        const data = new FormData(event.target);

        // @ts-ignore
        addViewHandler(data.get('name'));

        // @ts-ignore
        document.getElementById('add-app-input').value = ''
    }, false);

    document.getElementById('reset-views').addEventListener('click', () => {
        viewResetHandler();
    });

    document.getElementById('controls-area').addEventListener('drag', (event: any) => {
        if (event.target.className !== 'resizeHandle') return;

        const {clientX} = event;
        const {dataset: {viewId} = {viewId: ''}} = event.target;
        const view = lastViewUpdate.find(({id}) => id === viewId);

        if (!view) return;

        const oldRect = view.rectOverride || view.rect;

        // just some arbitrary min-width
        const newWidth = clientX - oldRect.x;
        if (newWidth <=  50) return;

        const newRect = {
            width: newWidth
        };

        // @ts-ignore
        viewResizeHandler(viewId, newRect);
    });
});
