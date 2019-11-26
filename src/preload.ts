import {ResizeSensor} from 'css-element-queries';
import {ViewtronUpdateData} from 'viewtron';
import {
    addColumnHandler,
    addRowHandler,
    addViewHandler,
    columnResetHandler,
    columnResizeHandler,
    columnVisibilityHandler,
    removeColumnHandler,
    removeRowHandler,
    removeViewHandler,
    reorderColumnHandler,
    reorderRowHandler,
    reorderViewHandler,
    rowResetHandler,
    rowResizeHandler,
    rowVisibilityHandler,
    viewResetHandler,
    viewResizeHandler,
    viewtronInitHandler,
    viewtronResizeHandler,
    viewtronUpdateHandler,
    viewVisibilityHandler,
} from 'viewtron/dist/ipc-renderer';

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector: string, text: string) => {
        const element = document.getElementById(selector);
        if (element) {
            element.innerText = text;
        }
    };

    for (const type of ['chrome', 'node', 'electron']) {
        replaceText(`${type}-version`, (process.versions as any)[type]);
    }

    const appArea = document.getElementById('app-area');

    requestAnimationFrame(() => {
        // @ts-ignore
        viewtronInitHandler(appArea.getBoundingClientRect().toJSON());
    });

    // @ts-ignore
    new ResizeSensor(appArea, () => viewtronResizeHandler(appArea.getBoundingClientRect().toJSON()));

    // @ts-ignore
    window.currentViews = [];
    viewtronUpdateHandler(({views, rows, columns}: ViewtronUpdateData) => {
        // @ts-ignore
        window.currentViews = views;

        document.getElementById('sidebar-list').innerHTML = `
            ${rows.map(({id}) => {
            const rowColumns = columns.filter(({rowId}) => rowId === id);

            return `
                    <li>
                        Row (<span class='value'>${id}</span>) <button data-row-id='${id}'>-</button>
                        <ul>
                            ${rowColumns.map((column) => {
                const colViews = views.filter((view) => view.columnId === column.id);

                return `
                                    <li>
                                        Column (<span class='value'>${column.id}</span>) <button data-column-id='${column.id}'>-</button>
                                        <ul>
                                            ${colViews.map(({id: viewId, url}) => `
                                                <li><span class='value'>${url}</span> (<span class='value'>${viewId}</span>) <button data-view-id='${viewId}'>-</button></li>
                                            `).join('')}
                                        </ul>
                                    </li>
                                `;
            }).join('')}
                        </ul>
                    </li>
                `;
        }).join('')}
        `;
    });

    document.getElementById('sidebar-list').addEventListener('click', (event: any) => {
        if (event.target.nodeName !== 'BUTTON') {
            return;
        }

        const {dataset: {viewId, columnId, rowId}} = event.target;

        if (viewId) {
            removeViewHandler({viewId});
        }

        if (columnId) {
            removeColumnHandler({
                columnId,
            });
        }

        if (rowId) {
            removeRowHandler({rowId});
        }
    });

    document.getElementById('add-row').addEventListener('click', () => {
        addRowHandler({});
    });

    document.getElementById('add-column-form').addEventListener('submit', (event: any) => {
        event.preventDefault();

        const data = new FormData(event.target);
        const rowId = String(data.get('rowId'));

        addColumnHandler({rowId});

        // @ts-ignore
        document.getElementById('add-column-form-row-id-input').value = '';
    }, false);

    document.getElementById('add-view-form').addEventListener('submit', (event: any) => {
        event.preventDefault();

        const data = new FormData(event.target);
        const url = data.get('url') as string;
        const columnId = String(data.get('columnId'));

        addViewHandler({url, columnId});

        // @ts-ignore
        document.getElementById('add-view-form-url-input').value = '';
        // @ts-ignore
        document.getElementById('add-view-form-column-id-input').value = '';
    }, false);

    document.getElementById('row-height-form').addEventListener('submit', (event: any) => {
        event.preventDefault();

        const data = new FormData(event.target);
        const rowId = data.get('rowId') as string;
        const height = Number(data.get('height'));

        rowResizeHandler({rowId, height});

        // @ts-ignore
        document.getElementById('row-height-form-row-id-input').value = '';
        // @ts-ignore
        document.getElementById('row-height-form-row-height-input').value = '';
    }, false);

    document.getElementById('column-width-form').addEventListener('submit', (event: any) => {
        event.preventDefault();

        const data = new FormData(event.target);
        const columnId = data.get('columnId') as string;
        const width = Number(data.get('width'));

        columnResizeHandler({columnId, width});

        // @ts-ignore
        document.getElementById('column-width-form-column-id-input').value = '';
        // @ts-ignore
        document.getElementById('column-width-form-column-width-input').value = '';
    }, false);

    document.getElementById('view-height-form').addEventListener('submit', (event: any) => {
        event.preventDefault();

        const data = new FormData(event.target);
        const viewId = data.get('viewId') as string;
        const height = Number(data.get('height'));

        viewResizeHandler({viewId, height});

        // @ts-ignore
        document.getElementById('view-height-form-view-id-input').value = '';
        // @ts-ignore
        document.getElementById('view-height-form-view-height-input').value = '';
    }, false);

    // @ts-ignore
    document.querySelector('#row-visibility-form .default').checked = 'checked';
    document.getElementById('row-visibility-form').addEventListener('submit', (event: any) => {
        event.preventDefault();

        const data = new FormData(event.target);
        const rowId = data.get('rowId') as string;
        const visible = data.get('visibility') === 'visible';

        rowVisibilityHandler({rowId, visible});

        // @ts-ignore
        document.getElementById('row-visibility-form-row-id-input').value = '';
        // @ts-ignore
        document.querySelector('#row-visibility-form .default').checked = 'checked';
    }, false);

    // @ts-ignore
    document.querySelector('#column-visibility-form .default').checked = 'checked';
    document.getElementById('column-visibility-form').addEventListener('submit', (event: any) => {
        event.preventDefault();

        const data = new FormData(event.target);
        const columnId = data.get('columnId') as string;
        const visible = data.get('visibility') === 'visible';

        columnVisibilityHandler({columnId, visible});

        // @ts-ignore
        document.getElementById('column-visibility-form-column-id-input').value = '';
        // @ts-ignore
        document.querySelector('#column-visibility-form .default').checked = 'checked';
    }, false);

    // @ts-ignore
    document.querySelector('#view-visibility-form .default').checked = 'checked';
    document.getElementById('view-visibility-form').addEventListener('submit', (event: any) => {
        event.preventDefault();

        const data = new FormData(event.target);
        const viewId = data.get('viewId') as string;
        const visible = data.get('visibility') === 'visible';

        viewVisibilityHandler({viewId, visible});

        // @ts-ignore
        document.getElementById('view-visibility-form-view-id-input').value = '';
        // @ts-ignore
        document.querySelector('#view-visibility-form .default').checked = 'checked';
    }, false);

    document.getElementById('row-move-form').addEventListener('submit', (event: any) => {
        event.preventDefault();

        const data = new FormData(event.target);
        const rowId = data.get('rowId') as string;
        const newIndex = Number(data.get('newIndex'));

        reorderRowHandler({rowId, newIndex});

        // @ts-ignore
        document.getElementById('row-move-form-row-id-input').value = '';
        // @ts-ignore
        document.getElementById('row-move-form-row-new-index-input').value = '';
    }, false);

    document.getElementById('column-move-form').addEventListener('submit', (event: any) => {
        event.preventDefault();

        const data = new FormData(event.target);
        const columnId = data.get('columnId') as string;
        const newIndex = Number(data.get('newIndex'));

        reorderColumnHandler({columnId, newIndex});

        // @ts-ignore
        document.getElementById('column-move-form-column-id-input').value = '';
        // @ts-ignore
        document.getElementById('column-move-form-column-new-index-input').value = '';
    }, false);

    document.getElementById('view-move-form').addEventListener('submit', (event: any) => {
        event.preventDefault();

        const data = new FormData(event.target);
        const viewId = data.get('viewId') as string;
        const newIndex = Number(data.get('newIndex'));

        reorderViewHandler({viewId, newIndex});

        // @ts-ignore
        document.getElementById('view-move-form-view-id-input').value = '';
        // @ts-ignore
        document.getElementById('view-move-form-view-new-index-input').value = '';
    }, false);

    document.getElementById('reset-views').addEventListener('click', () => {
        rowResetHandler({});
        columnResetHandler({});
        viewResetHandler({});
    });
});
