'use strict';

const Main = imports.ui.main;
const WorkspaceManager = global.workspace_manager;
const {Display} = imports.gi.Meta;
const {St} = imports.gi;

const getPrimaryMonitor = () => new Display().get_primary_monitor();
const getCurrentTime = () => global.get_current_time();
const getActiveWorkspace = () => WorkspaceManager.get_active_workspace();
const getWorkspacesQuantity = () => WorkspaceManager.get_n_workspaces();
const getWorkspaceByIndex = (index) => WorkspaceManager.get_workspace_by_index(index);

const hasWorkspaceWindows = (workspace) => {
    if (!workspace.n_windows) {
        return false;
    }

    const primaryMonitor = getPrimaryMonitor();
    const windows = workspace.list_windows();

    return windows.filter((window) => window.get_monitor() === primaryMonitor).length > 0;
};

class WorkspaceIndicator {
    constructor(workspace) {
        this._workspace = workspace;

        const workspaceLabel = `${this._workspace.index() + 1}`;
        this._indicatorWidget = St.Button.new_with_label(workspaceLabel);
        this._indicatorWidget.set_style_class_name('workspace-indicator');

        this._eventWindowAddedId = this._workspace.connect('window-added', () => this.updateState());
        this._eventWindowRemovedId = this._workspace.connect('window-removed', () => this.updateState());
        this._eventClickId = this._indicatorWidget.connect('clicked', () => this._workspace.activate(getCurrentTime()));

        this.updateState();
    }

    getWidget() {
        return this._indicatorWidget;
    }

    updateState() {
        const currentWorkspaceIndex = this._workspace.index();
        const activeWorkspaceIndex = getActiveWorkspace().index();

        if (currentWorkspaceIndex === activeWorkspaceIndex) {
            this._indicatorWidget.add_style_class_name('active');
            this._indicatorWidget.show();
        } else if (!hasWorkspaceWindows(this._workspace)) {
            this._indicatorWidget.hide();
        } else {
            this._indicatorWidget.remove_style_class_name('active');
        }
    }

    destroy() {
        this._workspace.disconnect(this._eventWindowAddedId);
        this._workspace.disconnect(this._eventWindowRemovedId);
        this._indicatorWidget.disconnect(this._eventClickId);

        this._indicatorWidget.destroy();
        this._indicatorWidget = null;
        this._workspace = null;
    }
}


class WorkspaceIndicatorsManager {
    constructor() {
        this._indicators = [];
    }

    create() {
        this._indicators = Array.from({length: getWorkspacesQuantity()}, (_, index) => {
            return new WorkspaceIndicator(getWorkspaceByIndex(index));
        });
        return this._indicators;
    }

    updateStates() {
        this._indicators.forEach((indicator) => indicator.updateState());
    }

    destroy() {
        this._indicators.forEach((indicator) => indicator.destroy());
        this._indicators = [];
    }

    recreate() {
        this.destroy();
        return this.create();
    }
}

class WorkspaceLayout {
    constructor(indicatorsManager) {
        this._indicatorsManager = indicatorsManager;

        this._layoutWidget = St.BoxLayout.new();
        this._layoutWidget.set_style_class_name('workspace-layout');

        // TODO: dirty hack for location
        Main.panel._leftBox.insert_child_at_index(this._layoutWidget, 0);

        this._eventWorkspaceAddedId = WorkspaceManager.connect('workspace-added', () => this._render());
        this._eventWorkspaceRemovedId = WorkspaceManager.connect('workspace-removed', () => this._render());
        this._eventWorkspaceSwitchedId = WorkspaceManager.connect('workspace-switched', () => this._render(false));

        this._render();
    }

    _render(forcibly = true) {
        if (forcibly) {
            this._indicatorsManager.recreate().forEach(indicator => this._layoutWidget.add_child(indicator.getWidget()));
        } else {
            this._indicatorsManager.updateStates();
        }
    }

    destroy() {
        WorkspaceManager.disconnect(this._eventWorkspaceAddedId);
        WorkspaceManager.disconnect(this._eventWorkspaceRemovedId);
        WorkspaceManager.disconnect(this._eventWorkspaceSwitchedId);

        this._indicatorsManager.destroy();
        this._indicatorsManager = null;

        // TODO: dirty hack for location
        Main.panel._leftBox.remove_child(this._layoutWidget);

        this._layoutWidget.destroy();
        this._layoutWidget = null;
    }
}

class Extension {
    enable() {
        const indicatorsManager = new WorkspaceIndicatorsManager();
        this._layout = new WorkspaceLayout(indicatorsManager);
    }

    disable() {
        this._layout.destroy();
        this._layout = null;
    }
}

function init() {
    return new Extension();
}
