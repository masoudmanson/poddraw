/**
 * Flow plugin.
 */
Draw.loadPlugin(function(ui) {
    // Adds resource for action
    mxResources.parse('toggleFlowLTR=Toggle Flow Left to Right...');
    mxResources.parse('toggleFlowRTL=Toggle Flow Right to Left...');

    // Max number of edges per page
    var pageSize = 20;

    var uiCreatePopupMenu = ui.menus.createPopupMenu;
    ui.menus.createPopupMenu = function(menu, cell, evt) {
        uiCreatePopupMenu.apply(this, arguments);

        var graph = ui.editor.graph;

        if (graph.model.isEdge(graph.getSelectionCell())) {
            this.addMenuItems(menu, ['-', 'toggleFlowLTR'], null, evt);
            this.addMenuItems(menu, ['', 'toggleFlowRTL'], null, evt);
        }
    };

    //
    // Main function
    //
    function toggleFlow(cells, type) {
        for (var i = 0; i < cells.length; i++) {
            if (ui.editor.graph.model.isEdge(cells[i])) {
                var state = ui.editor.graph.view.getState(cells[i]);
                var paths = state.shape.node.getElementsByTagName('path');

                if (paths.length > 1) {
                    if (type == 'rtl') {
                        if (paths[1].getAttribute('class') == 'mxEdgeFlowRTL') {
                            paths[1].removeAttribute('class');

                            if (mxUtils.getValue(state.style, mxConstants.STYLE_DASHED, '0') != '1') {
                                paths[1].removeAttribute('stroke-dasharray');
                            }
                        }
                        else {
                            paths[1].setAttribute('class', 'mxEdgeFlowRTL');

                            if (mxUtils.getValue(state.style, mxConstants.STYLE_DASHED, '0') != '1') {
                                paths[1].setAttribute('stroke-dasharray', '8');
                            }
                        }
                    }
                    else if (type == 'ltr') {
                        if (paths[1].getAttribute('class') == 'mxEdgeFlowLTR') {
                            paths[1].removeAttribute('class');

                            if (mxUtils.getValue(state.style, mxConstants.STYLE_DASHED, '0') != '1') {
                                paths[1].removeAttribute('stroke-dasharray');
                            }
                        }
                        else {
                            paths[1].setAttribute('class', 'mxEdgeFlowLTR');

                            if (mxUtils.getValue(state.style, mxConstants.STYLE_DASHED, '0') != '1') {
                                paths[1].setAttribute('stroke-dasharray', '8');
                            }
                        }
                    }
                }
            }
        }
    };

    // Adds action
    ui.actions.addAction('toggleFlowRTL', function() {
        var cell = ui.editor.graph.getSelectionCell();

        if (ui.editor.graph.model.isEdge(cell)) {
            toggleFlow(ui.editor.graph.getSelectionCells(), 'rtl');
        }
    });

    // Adds action
    ui.actions.addAction('toggleFlowLTR', function() {
        var cell = ui.editor.graph.getSelectionCell();

        if (ui.editor.graph.model.isEdge(cell)) {
            toggleFlow(ui.editor.graph.getSelectionCells(), 'ltr');
        }
    });

    // Click handler for chromeless mode
    if (ui.editor.isChromelessView()) {
        ui.editor.graph.click = function(me) {
            if (ui.editor.graph.model.isEdge(me.getCell())) {
                toggleFlow([me.getCell()]);
            }
        };
    }

    try {
        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = [
            '.mxEdgeFlowRTL {',
                'animation: mxEdgeFlowRTL 0.5s linear;',
                'animation-iteration-count: infinite;',
            '}',
            '@keyframes mxEdgeFlowRTL {',
                'to {',
                    'stroke-dashoffset: 16;',
                '}',
            '}',
            '.mxEdgeFlowLTR {',
                'animation: mxEdgeFlowLTR 0.5s linear;',
                'animation-iteration-count: infinite;',
            '}',
            '@keyframes mxEdgeFlowLTR {',
                'to {',
                    'stroke-dashoffset: -16;',
                '}',
            '}'
        ].join('\n');
        document.getElementsByTagName('head')[0].appendChild(style);
    }
    catch (e) {
        // ignore
    }
});
