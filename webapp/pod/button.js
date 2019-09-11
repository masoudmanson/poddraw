Draw.loadPodFunctions(function (editorUi) {
    var config = {
        simplePushButton: {
            name: 'Simple Push Button',
            value: {
                entityId: {
                    name: 'Entity ID',
                    default: null
                },
                title: {
                    name: 'Button Title',
                    default: 'Title'
                },
                action: {
                    name: 'Button Action',
                    default: 'Write your JS code here ....'
                },
                tooltip: {
                    name: 'Tooltip',
                    default: 'Action Button'
                }
            }
        },
        toggleButton: {
            name: 'Toggle Button',
            value: {
                entityId: {
                    name: 'Entity ID',
                    default: null
                },
                stateOneTitle: {
                    name: '1st Title',
                    default: 'Initial State Title'
                },
                stateOneAction: {
                    name: '1st Action',
                    default: 'Initial State JS code ....'
                },
                stateTwoTitle: {
                    name: '2nd Title',
                    default: 'Secondary State Title'
                },
                stateTwoAction: {
                    name: '2nd Action',
                    default: 'Secondary State JS code ....'
                },
                tooltip: {
                    name: 'Tooltip',
                    default: 'Toggle Button'
                }
            }
        }
    };

    var uiCreatePopupMenu = editorUi.menus.createPopupMenu;
    editorUi.menus.createPopupMenu = function (menu, cell, evt) {
        uiCreatePopupMenu.apply(this, arguments);
        this.addMenuItems(menu, ['addButton'], null, evt);
    };

    // Adds action
    editorUi.actions.addAction('addButton', function () {
        var cell = editorUi.editor.graph.getSelectionCell();

        var dlg = new addButtonDialog(editorUi, cell);
        editorUi.showDialog(dlg.container, 400, 350, true, false, null, false);
        dlg.init();
    });

    var addButtonDialog = function (ui, cell) {
        var div = document.createElement('div');
        var graph = ui.editor.graph;

        var h3 = document.createElement('h3');
        mxUtils.write(h3, mxResources.get('addButton'));
        div.appendChild(h3);

        var tcp = document.createElement('p');
        mxUtils.write(tcp, mxResources.get('addButtonSentence'));
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

        var addComboBoxOptionsAsInputs = function (buttonType) {
            for (var i = form.table.rows.length - 1; i > 0; i--) {
                form.table.deleteRow(i);
            }

            names = [];
            texts = [];

            if (buttonType != null) {
                var typeIndex = (buttonType.target) ? buttonType.target.value : buttonType;
                elmAttrs['button'] = typeIndex;
                names.push('button');
                texts.push({value: typeIndex});
                addObjectAttributesToTagList();
            }
        };

        var combo = form.addCombo(mxResources.get('buttonType') + ':', false, 1, 'calc(100% + 3px)', addComboBoxOptionsAsInputs);

        form.addOption(combo, '', '', false);

        for (var i in config) {
            form.addOption(combo, config[i].name, i, (i == elmAttrs.button));
        }

        var addObjectAttributesToTagList = function () {
            if (elmAttrs.hasOwnProperty('button') && elmAttrs.button != null && elmAttrs.button != 'null' && elmAttrs.button != '') {
                var tags = new Object();
                if (elmAttrs.hasOwnProperty('tagButtons')) {
                    try {
                        tags = JSON.parse(elmAttrs.tagButtons);
                    }
                    catch (e) {
                        console.error(e);
                        mxUtils.alert(e);
                    }
                }

                for (var attr in config[elmAttrs.button].value) {
                    var item = config[elmAttrs.button].value[attr];

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
                if (elmAttrs.button != null && elmAttrs.button != 'null' && elmAttrs.button != '') {
                    var tagButtons = new Object();
                    for (var i = 0; i < names.length; i++) {
                        if (names[i] == 'tooltip') {
                            value.setAttribute(names[i], texts[i].value);
                        }
                        tagButtons[names[i]] = texts[i].value;

                        removeLabel = removeLabel || (names[i] == 'placeholder' && value.getAttribute('placeholders') == '1');
                    }
                    tagButtons['button'] = elmAttrs.button;
                    value.setAttribute('button', elmAttrs.button);
                    value.setAttribute('tagButtons', JSON.stringify(tagButtons));

                }
                else {
                    value.removeAttribute('button');
                    value.removeAttribute('tagButtons');
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
    addButtonDialog.placeholderHelpLink = null;
});
