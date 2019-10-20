import {ResizeSensor} from "css-element-queries";
import {ViewtronUpdateData} from "viewtron";
import {
    addColumnHandler,
    addRowHandler,
    addViewHandler,
    columnResizeHandler,
    initHandler,
    removeColumnHandler,
    removeRowHandler,
    removeViewHandler,
    viewResetHandler,
    viewsUpdatedHandler,
    viewtronAreaResizeHandler,
    rowResizeHandler,
} from "viewtron/dist/ipc-renderer";

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

    const appArea = document.getElementById("app-area");

    requestAnimationFrame(() => {
        initHandler(appArea);
    });
    // @ts-ignore
    new ResizeSensor(appArea, () => viewtronAreaResizeHandler(appArea.getBoundingClientRect().toJSON()));

    let lastViewUpdate: any[] = [];
    // @ts-ignore
    window.currentViews = [];
    viewsUpdatedHandler(({views, rows, columns}: ViewtronUpdateData) => {
        const isViewChange = views.length !== lastViewUpdate.length;

        lastViewUpdate = views;
        // @ts-ignore
        window.currentViews = views;

        document.getElementById("sidebar-list").innerHTML = `
            ${rows.map(({id}) => {
            const rowColumns = columns.filter(({rowId}) => rowId === id);

            return `
                <li>
                    Row ${id} <button data-row-id="${id}">-</button>
                    <ul>
                        ${rowColumns.map((column) => {
                const colViews = views.filter((view) => view.columnId === column.id);

                return `
                                <li>
                                    Column ${column.id} <button data-column-id="${column.id}">-</button>
                                    <ul>
                                        ${colViews.map(({id: viewId, url}) => `
                                            <li>${url} <button data-view-id="${viewId}">-</button></li>
                                        `).join("")}
                                    </ul>
                                </li>
                            `;
            }).join("")}
                    </ul>
                </li>
            `;
        }).join("")}
        `;

        if (!isViewChange) {
            let added = 0;
            Array.from(document.getElementsByClassName("resizeHandle")).forEach((el) => {
                // @ts-ignore
                const {viewId} = el.dataset;
                const view = lastViewUpdate.find(({id}) => viewId === id);

                if (!view) {
                    return;
                }

                const left: number = added + view.rect.width + 5;
                added = left;

                // @ts-ignore
                el.style.left = `${left}px`;
            });

            return;
        }

        let added = 0;
        document.getElementById("resizers").innerHTML = `
            ${views.map(({id, rect}) => {
            const left: number = added + rect.width + 5;
            added = left;

            return `
                        <div class="resizeHandle" draggable="true" data-view-id="${id}" style="left: ${left}px;"></div>
                    `;
        }).join("")}
        `;

    });

    document.getElementById("sidebar-list").addEventListener("click", (event: any) => {
        if (event.target.nodeName !== "BUTTON") {
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

    document.getElementById("add-app-form").addEventListener("submit", (event: any) => {
        event.preventDefault();

        const data = new FormData(event.target);
        const url = data.get("url") as string;
        const columnId = String(data.get("columnId"));

        addViewHandler({url, columnId});

        // @ts-ignore
        document.getElementById("add-app-url-input").value = "";
        // @ts-ignore
        document.getElementById("add-app-column-id-input").value = "";
    }, false);

    document.getElementById("add-column-form").addEventListener("submit", (event: any) => {
        event.preventDefault();

        const data = new FormData(event.target);
        const rowId = String(data.get("rowId"));

        addColumnHandler({rowId});

        // @ts-ignore
        document.getElementById("add-app-column-row-id-input").value = "";
    }, false);

    document.getElementById("reset-views").addEventListener("click", () => {
        viewResetHandler({});
    });

    document.getElementById("add-row").addEventListener("click", () => {
        addRowHandler({});
    });

    // @ts-ignore
    window.columnResize = columnResizeHandler;
    // @ts-ignore
    window.rowResize = rowResizeHandler;

    document.getElementById("controls-area").addEventListener("drag", (event: any) => {
        if (event.target.className !== "resizeHandle") {
            return;
        }

        const {clientX} = event;
        const {dataset: {viewId} = {viewId: ""}} = event.target;
        const view = lastViewUpdate.find(({id}) => id === viewId);

        if (!view) {
            return;
        }

        // @todo: this should not be bound to a view
        const {columnId, rect} = view;

        // just some arbitrary min-width
        const newWidth = clientX - rect.x;

        if (newWidth <= 50) {
            return;
        }

        columnResizeHandler({columnId, width: newWidth});
    });
});
