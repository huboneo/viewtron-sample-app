import {ResizeSensor} from "css-element-queries";
import {ViewtronUpdateData} from "viewtron";
import {
    addColumnHandler,
    addRowHandler,
    addViewHandler,
    columnResetHandler,
    columnResizeHandler,
    viewtronInitHandler,
    removeColumnHandler,
    removeRowHandler,
    removeViewHandler,
    rowResetHandler,
    rowResizeHandler,
    viewResetHandler,
    viewtronResizeHandler,
    viewtronUpdateHandler,
    viewResizeHandler,
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

        document.getElementById("sidebar-list").innerHTML = `
            ${rows.map(({id}) => {
                const rowColumns = columns.filter(({rowId}) => rowId === id);

                return `
                    <li>
                        Row (${id}) <button data-row-id="${id}">-</button>
                        <ul>
                            ${rowColumns.map((column) => {
                                const colViews = views.filter((view) => view.columnId === column.id);

                                return `
                                    <li>
                                        Column (${column.id}) <button data-column-id="${column.id}">-</button>
                                        <ul>
                                            ${colViews.map(({id: viewId, url}) => `
                                                <li>${url} (${viewId}) <button data-view-id="${viewId}">-</button></li>
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

    document.getElementById("add-row").addEventListener("click", () => {
        addRowHandler({});
    });

    document.getElementById("add-column-form").addEventListener("submit", (event: any) => {
        event.preventDefault();

        const data = new FormData(event.target);
        const rowId = String(data.get("rowId"));

        addColumnHandler({rowId});

        // @ts-ignore
        document.getElementById("add-column-form-row-id-input").value = "";
    }, false);

    document.getElementById("add-view-form").addEventListener("submit", (event: any) => {
        event.preventDefault();

        const data = new FormData(event.target);
        const url = data.get("url") as string;
        const columnId = String(data.get("columnId"));

        addViewHandler({url, columnId});

        // @ts-ignore
        document.getElementById("add-view-form-url-input").value = "";
        // @ts-ignore
        document.getElementById("add-view-form-column-id-input").value = "";
    }, false);

    document.getElementById("row-height-form").addEventListener("submit", (event: any) => {
        event.preventDefault();

        const data = new FormData(event.target);
        const rowId = data.get("rowId") as string;
        const height = Number(data.get("height"));

        rowResizeHandler({rowId, height});

        // @ts-ignore
        document.getElementById("row-height-form-row-id-input").value = "";
        // @ts-ignore
        document.getElementById("row-height-form-row-height-input").value = "";
    }, false);

    document.getElementById("column-width-form").addEventListener("submit", (event: any) => {
        event.preventDefault();

        const data = new FormData(event.target);
        const columnId = data.get("columnId") as string;
        const width = Number(data.get("width"));

        columnResizeHandler({columnId, width});

        // @ts-ignore
        document.getElementById("column-width-form-column-id-input").value = "";
        // @ts-ignore
        document.getElementById("column-width-form-column-width-input").value = "";
    }, false);

    document.getElementById("view-height-form").addEventListener("submit", (event: any) => {
        event.preventDefault();

        const data = new FormData(event.target);
        const viewId = data.get("viewId") as string;
        const height = Number(data.get("height"));

        viewResizeHandler({viewId, height});

        // @ts-ignore
        document.getElementById("view-height-form-view-id-input").value = "";
        // @ts-ignore
        document.getElementById("view-height-form-view-height-input").value = "";
    }, false);

    document.getElementById("reset-views").addEventListener("click", () => {
        rowResetHandler({});
        columnResetHandler({});
        viewResetHandler({});
    });
});
