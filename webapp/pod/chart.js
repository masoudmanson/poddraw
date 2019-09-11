Draw.loadPodFunctions(function (editorUi) {
    var config = {
        line: {
            name: 'Line Chart',
            value: {
                entityId: {
                    name: 'Entity ID',
                    default: null
                },
                maxStackSize: {
                    name: 'Max Chart Nodes',
                    default: 20
                },
                title: {
                    name: 'Line Chart',
                    default: 'Title'
                }
            }
        },
        bar: {
            name: 'Bar Chart',
            value: {
                entityId: {
                    name: 'Entity ID',
                    default: null
                },
                maxStackSize: {
                    name: 'Max Chart Nodes',
                    default: 20
                },
                title: {
                    name: 'Bar Chart',
                    default: 'Title'
                }
            }
        }
    };

    var uiCreatePopupMenu = editorUi.menus.createPopupMenu;
    editorUi.menus.createPopupMenu = function (menu, cell, evt) {
        uiCreatePopupMenu.apply(this, arguments);
        this.addMenuItems(menu, ['addChart'], null, evt);
    };

    // Adds action
    editorUi.actions.addAction('addChart', function () {
        var cell = editorUi.editor.graph.getSelectionCell();

        var dlg = new addChartDialog(editorUi, cell);
        editorUi.showDialog(dlg.container, 400, 350, true, false, null, false);
        dlg.init();
    });

    var addChartDialog = function (ui, cell) {
        var div = document.createElement('div');
        var graph = ui.editor.graph;

        var h3 = document.createElement('h3');
        mxUtils.write(h3, mxResources.get('addChart'));
        div.appendChild(h3);

        var tcp = document.createElement('p');
        mxUtils.write(tcp, mxResources.get('addChartSentence'));
        div.appendChild(tcp);

        var value = graph.getModel()
            .getValue(cell);

        if (!mxUtils.isNode(value)) {
            var doc = mxUtils.createXmlDocument();
            var obj = doc.createElement('object');
            obj.setAttribute('label', value || '');
            value = obj;
        }

        // Creates the dialog contents
        var form = new mxForm('properties');
        form.table.style.width = '100%';

        var attrs = value.attributes;
        var names = [];
        var texts = [];
        var breakPoints = {};

        var addTextArea = function (title, name, value) {
            names.push(name);
            var tempText = form.addTextarea(title + ':', value, 2);
            tempText.style.width = 'calc(100% - 5px)';
            texts.push(tempText);
        };

        var addComboBox = function (title, name, value, options) {
            names.push(name);
            var tempText = form.addCombo(title + ':', false, 1);
            tempText.style.width = 'calc(100% + 3px)';
            texts.push(tempText);

            for (var i = 0; i < options.length; i++) {
                form.addOption(tempText, options[i].name, options[i].value, ((options[i].name == value) ? true : false));
            }
        };

        var elmAttrs = new Object();
        var isLayer = graph.getModel()
            .getParent(cell) == graph.getModel()
            .getRoot();

        for (var i = 0; i < attrs.length; i++) {
            if ((isLayer || attrs[i].nodeName != 'label') && attrs[i].nodeName != 'placeholders') {
                elmAttrs[attrs[i].nodeName] = attrs[i].nodeValue;
            }
        }

        var addComboBoxOptionsAsInputs = function (chartType) {
            for (var i = form.table.rows.length - 1; i > 0; i--) {
                form.table.deleteRow(i);
            }

            names = [];
            texts = [];

            if (chartType != null && chartType != undefined) {
                var typeIndex = (chartType.target) ? chartType.target.value : chartType;
                elmAttrs['chart'] = typeIndex;
                names.push('chart');
                texts.push({value: typeIndex});
                console.log("names, texts", names, texts);
                addObjectAttributesToTagList();
            }
        };

        var combo = form.addCombo(mxResources.get('chartType') + ':', false, 1, 'calc(100% + 3px)', addComboBoxOptionsAsInputs);

        form.addOption(combo, '', '', false);

        for (var i in config) {
            form.addOption(combo, config[i].name, i, (i == elmAttrs.chart));
        }

        var addObjectAttributesToTagList = function () {
            if (elmAttrs.hasOwnProperty('chart') && elmAttrs.chart != null && elmAttrs.chart != 'null' && elmAttrs.chart != '') {
                var tags = new Object();
                if (elmAttrs.hasOwnProperty('tagChart')) {
                    try {
                        tags = JSON.parse(elmAttrs.tagChart);
                    }
                    catch (e) {
                        console.error(e);
                        mxUtils.alert(e);
                    }
                }

                for (var attr in config[elmAttrs.chart].value) {
                    var item = config[elmAttrs.chart].value[attr];

                    if (item.type == 'list') {
                        addComboBox(item.name, attr, (tags[attr]) ? tags[attr] : item.default, item.options);
                    }
                    else {
                        addTextArea(item.name, attr, (tags[attr]) ? tags[attr] : item.default);
                    }
                }
            }
        };

        addObjectAttributesToTagList();

        var top = document.createElement('div');
        top.style.cssText = 'position:absolute;left:30px;right:30px;overflow-y:auto;top:115px;bottom:80px;';
        top.appendChild(form.table);
        div.appendChild(top);

        this.init = function () {
        };

        var cancelBtn = mxUtils.button(mxResources.get('cancel'), function () {
            ui.hideDialog.apply(ui, arguments);
        });

        cancelBtn.className = 'geBtn';

        var applyBtn = mxUtils.button(mxResources.get('apply'), function () {
            try {
                ui.hideDialog.apply(ui, arguments);

                // Clones and updates the value
                value = value.cloneNode(true);
                var removeLabel = false;
                if (elmAttrs.chart != null && elmAttrs.chart != 'null' && elmAttrs.chart != '') {
                    var tagChart = new Object();
                    for (var i = 0; i < names.length; i++) {
                        if (names[i] == 'tooltip') {
                            value.setAttribute(names[i], texts[i].value);
                        }
                        tagChart[names[i]] = texts[i].value;

                        removeLabel = removeLabel || (names[i] == 'placeholder' && value.getAttribute('placeholders') == '1');
                    }
                    tagChart['chart'] = elmAttrs.chart;
                    value.setAttribute('chart', elmAttrs.chart);
                    value.setAttribute('tagChart', JSON.stringify(tagChart));

                }
                else {
                    value.removeAttribute('chart');
                    value.removeAttribute('tagChart');
                }

                // Removes label if placeholder is assigned
                if (removeLabel) {
                    value.removeAttribute('label');
                }

                // Updates the value of the cell (undoable)
                graph.getModel()
                    .setValue(cell, value);
            }
            catch (e) {
                console.error(e);
                mxUtils.alert(e);
            }
        });
        applyBtn.className = 'geBtn gePrimaryBtn';

        var buttons = document.createElement('div');
        buttons.style.cssText = 'position:absolute;left:30px;right:30px;text-align:right;bottom:30px;height:40px;';

        if (ui.editor.cancelFirst) {
            buttons.appendChild(cancelBtn);
            buttons.appendChild(applyBtn);
        }
        else {
            buttons.appendChild(applyBtn);
            buttons.appendChild(cancelBtn);
        }

        div.appendChild(buttons);
        this.container = div;
    };

    /**
     * Optional help link.
     */
    addChartDialog.placeholderHelpLink = null;
});
