import {ipcRendererHandlers} from 'viewtron';

declare global {
    interface Window {
        viewtronAPI: typeof ipcRendererHandlers
    }
}
