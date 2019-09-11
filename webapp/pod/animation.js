Draw.loadPodFunctions(function(editorUi) {
    var config = {
        rotate: {
            name: 'Rotate',
            value: {
                rotateDirection: {
                    name: 'Rotation Direction',
                    type: 'list',
                    options: [{name:'Clock Wise', value: 'cw'}, {name:'Counter Clock Wise', value: 'ccw'}],
                    default: 'cw'
                },
                rotateBreakPoints: {
                    name: 'Rotation Speed',
                    default: ''
                }
            }
        }
    };

    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `.animationSpeed {
        position: relative;
        display: inline-block;
        margin: 4px 5px 4px 0;
        border: solid 1px #ddd;
        font-weight: bold;
        padding: 6px 26px 6px 6px;
    }`;
    document.getElementsByTagName('head')[0].appendChild(style);

    var uiCreatePopupMenu = editorUi.menus.createPopupMenu;
    editorUi.menus.createPopupMenu = function(menu, cell, evt) {
        uiCreatePopupMenu.apply(this, arguments);
        this.addMenuItems(menu, ['tagAnimation'], null, evt);
    };

    // Adds action
    editorUi.actions.addAction('tagAnimation', function() {
        var cell = editorUi.editor.graph.getSelectionCell();

        var dlg = new EditTagAnimationDialog(editorUi, cell);
        editorUi.showDialog(dlg.container, 400, 400, true, false, null, false);
        dlg.init();
    });

    var EditTagAnimationDialog = function(ui, cell) {
        var div = document.createElement('div');
        var graph = ui.editor.graph;

        var h3 = document.createElement('h3');
        mxUtils.write(h3, mxResources.get('tagAnimation'));
        div.appendChild(h3);

        var tcp = document.createElement('p');
        mxUtils.write(tcp, mxResources.get('tagAnimationSentence'));
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

        var addTextArea = function(title, name, value) {
            names.push(name);
            var tempText = form.addTextarea(title + ':', value, 2);
            tempText.style.width = 'calc(100% - 5px)';
            texts.push(tempText);
        };

        var addComboBox = function(title, name, value, options) {
            names.push(name);
            var tempText = form.addCombo(title + ':', false, 1);
            tempText.style.width = 'calc(100% + 3px)';
            texts.push(tempText);

            for (var i = 0; i < options.length; i++) {
                form.addOption(tempText, options[i].name, options[i].value, ((options[i].value == value) ? true : false));
            }
        };

        var addColorValuePair = function(div, breakPoints) {
            div.innerHTML = '';
            for (var n in breakPoints) {
                var miniColorValue = document.createElement('div');
                miniColorValue.setAttribute('id', 'cv-' + n);
                miniColorValue.setAttribute('class', 'animationSpeed');
                miniColorValue.innerHTML = n + " | " + breakPoints[n];

                var removeBtn = mxUtils.button('×', function(e) {
                    var cvpId = e.target.parentNode.id;
                    var cvpNode = document.getElementById(cvpId);
                    delete breakPoints[cvpId.split('-')[1]];
                    cvpNode.parentNode.removeChild(cvpNode);
                });

                removeBtn.style.position = 'absolute';
                removeBtn.style.top = '-1px';
                removeBtn.style.right = '-1px';
                removeBtn.style.height = '27px';
                removeBtn.style.width = '20px';
                removeBtn.style.fontSize = '18px';
                removeBtn.style.border = 'solid 1px #ddd';

                miniColorValue.appendChild(removeBtn);
                div.appendChild(miniColorValue);
            }
        };

        var addColorValueSelection = function(title, name, breakPoints) {
            names.push(name);
            texts.push({});

            var div = document.createElement('div');
            var cvpDiv = document.createElement('div');
            cvpDiv.style.display = 'inline';

            var addBtn = mxUtils.button(mxResources.get('addNew') + ' +', function() {
                var colorDlg = new animationSpeedDialog(editorUi, function(value, speed) {
                    breakPoints[value] = speed;
                    addColorValuePair(cvpDiv, breakPoints);
                });

                editorUi.showDialog(colorDlg.container, 240, 150, true, false, null, false);
                colorDlg.init();
            });

            addBtn.style.marginRight = '5px';

            div.appendChild(addBtn);
            div.appendChild(cvpDiv);

            addColorValuePair(cvpDiv, breakPoints);

            form.addField(title, div);
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

        var addComboBoxOptionsAsInputs = function(animationType) {
            for (var i = form.table.rows.length - 1; i > 0; i--) {
                form.table.deleteRow(i);
            }

            names = [];
            texts = [];

            if (animationType != null) {
                var typeIndex = (animationType.target) ? animationType.target.value : animationType;
                elmAttrs['animation'] = typeIndex;
                names.push('animation');
                texts.push({value: typeIndex});
                addObjectAttributesToTagList();
            }
        };

        var combo = form.addCombo('Aniamtion Type' + ':', false, 1, 'calc(100% + 3px)', addComboBoxOptionsAsInputs);

        form.addOption(combo, '', '', false);

        for (var i in config) {
            form.addOption(combo, config[i].name, i, (i == elmAttrs.animation));
        }

        var addObjectAttributesToTagList = function() {
            if (elmAttrs.hasOwnProperty('animation') && elmAttrs.animation != null && elmAttrs.animation != 'null' && elmAttrs.animation != '') {
                var tags = new Object();
                if (elmAttrs.hasOwnProperty('tagAnimations')) {
                    try {
                        tags = JSON.parse(elmAttrs.tagAnimations);
                    }
                    catch (e) {
                        console.error(e);
                        mxUtils.alert(e);
                    }
                }

                for (var attr in config[elmAttrs.animation].value) {
                    var item = config[elmAttrs.animation].value[attr];

                    if (attr == 'rotateBreakPoints') {
                        if (typeof tags[attr] == 'string' && tags[attr].length > 0) {
                            breakPoints = JSON.parse(tags[attr]);
                        }
                        else {
                            breakPoints = {};
                        }
                        addColorValueSelection(item.name, attr, breakPoints);
                    }
                    else {
                        if (item.type == 'list') {
                            addComboBox(item.name, attr, (tags[attr]) ? tags[attr] : item.default, item.options);
                        }
                        else {
                            addTextArea(item.name, attr, (tags[attr]) ? tags[attr] : item.default);
                        }
                    }
                }
            }
        };

        addObjectAttributesToTagList();

        var top = document.createElement('div');
        top.style.cssText = 'position:absolute;left:30px;right:30px;overflow-y:auto;top:115px;bottom:80px;';
        top.appendChild(form.table);
        div.appendChild(top);

        this.init = function() {
        };

        var cancelBtn = mxUtils.button(mxResources.get('cancel'), function() {
            ui.hideDialog.apply(ui, arguments);
        });

        cancelBtn.className = 'geBtn';

        var applyBtn = mxUtils.button(mxResources.get('apply'), function() {
            try {
                ui.hideDialog.apply(ui, arguments);

                // Clones and updates the value
                value = value.cloneNode(true);
                var removeLabel = false;
                if (elmAttrs.animation != null && elmAttrs.animation != 'null' && elmAttrs.animation != '') {
                    var tagAnimations = new Object();
                    for (var i = 0; i < names.length; i++) {
                            if (names[i] == 'rotateBreakPoints') {
                                if (typeof breakPoints == 'object') {
                                    tagAnimations[names[i]] = JSON.stringify(breakPoints);
                                }
                                else {
                                    tagAnimations[names[i]] = breakPoints;
                                }
                            }
                            else {
                                if (names[i] == 'tooltip') {
                                    value.setAttribute(names[i], texts[i].value);
                                }
                                tagAnimations[names[i]] = texts[i].value;
                            }

                            removeLabel = removeLabel || (names[i] == 'placeholder' && value.getAttribute('placeholders') == '1');
                    }
                    tagAnimations['animation'] = elmAttrs.animation;
                    value.setAttribute('animation', elmAttrs.animation);
                    value.setAttribute('tagAnimations', JSON.stringify(tagAnimations));

                }
                else {
                    value.removeAttribute('animation');
                    value.removeAttribute('tagAnimations');
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
    EditTagAnimationDialog.placeholderHelpLink = null;

    /**
     * Constructs a new color dialog.
     */
    var animationSpeedDialog = function(editorUi, apply, cancelFn) {
        this.editorUi = editorUi;

        this.init = function() {
            if (!mxClient.IS_TOUCH) {
                valueInput.focus();
            }
        };

        var div = document.createElement('div');

        var h3 = document.createElement('h3');
        mxUtils.write(h3, mxResources.get('rotationSpeed'));
        div.appendChild(h3);

        varcolorValueTable = document.createElement('table');
        varcolorValueTable.style.borderCollapse = 'collapse';
        varcolorValueTable.setAttribute('cellspacing', '0');
        varcolorValueTable.style.marginBottom = '0px';
        varcolorValueTable.style.cellSpacing = '0px';
        var varcolorValueTableBody = document.createElement('tbody');
        varcolorValueTable.appendChild(varcolorValueTableBody);
        var varcolorValueTableTr = document.createElement('tr');

        // Add Value Input
        var varcolorValueTableTd = document.createElement('td');
        varcolorValueTableTd.style.margin = '0px';
        var valueh4 = document.createElement('h4');
        valueh4.style.marginBottom = '5px';
        mxUtils.write(valueh4, mxResources.get('tagValue'));
        varcolorValueTableTd.appendChild(valueh4);

        var valueInput = document.createElement('input');
        valueInput.style.marginBottom = '10px';
        valueInput.style.width = '92%';
        valueInput.style.border = 'solid 1px #ddd';
        valueInput.style.outline = 'none';
        varcolorValueTableTd.appendChild(valueInput);
        varcolorValueTableTr.appendChild(varcolorValueTableTd);

        // Add Speed Input
        var varcolorValueTableTd2 = document.createElement('td');
        varcolorValueTableTd2.style.margin = '0px';
        var valueh4 = document.createElement('h4');
        valueh4.style.marginBottom = '5px';
        mxUtils.write(valueh4, mxResources.get('rotationSpeed'));
        varcolorValueTableTd2.appendChild(valueh4);

        var speedInput = document.createElement('input');
        speedInput.style.marginBottom = '10px';
        speedInput.style.width = '92%';
        speedInput.style.border = 'solid 1px #ddd';
        speedInput.style.outline = 'none';
        varcolorValueTableTd2.appendChild(speedInput);
        varcolorValueTableTr.appendChild(varcolorValueTableTd2);

        varcolorValueTableBody.appendChild(varcolorValueTableTr);

        div.appendChild(varcolorValueTable);
        mxUtils.br(div);

        var buttons = document.createElement('div');
        buttons.style.textAlign = 'right';
        buttons.style.whiteSpace = 'nowrap';

        var cancelBtn = mxUtils.button(mxResources.get('cancel'), function() {
            editorUi.hideDialog();

            if (cancelFn != null) {
                cancelFn();
            }
        });
        cancelBtn.className = 'geBtn';

        if (editorUi.editor.cancelFirst) {
            buttons.appendChild(cancelBtn);
        }

        var applyFunction = (apply != null) ? apply : this.createApplyFunction();

        var applyBtn = mxUtils.button(mxResources.get('apply'), function() {
            var speed = parseFloat(speedInput.value);
            var value = parseFloat(valueInput.value);

            if (typeof value == 'number' && typeof speed == 'number') {
                applyFunction(value, speed);
                editorUi.hideDialog();
            }
            else {
                mxUtils.alert('Enter a Value!');
            }
        });
        applyBtn.className = 'geBtn gePrimaryBtn';
        buttons.appendChild(applyBtn);

        if (!editorUi.editor.cancelFirst) {
            buttons.appendChild(cancelBtn);
        }

        div.appendChild(buttons);

        // LATER: Only fires if input if focused, should always
        // fire if this dialog is showing.
        mxEvent.addListener(div, 'keydown', function(e) {
            if (e.keyCode == 27) {
                editorUi.hideDialog();

                if (cancelFn != null) {
                    cancelFn();
                }

                mxEvent.consume(e);
            }
        });

        this.container = div;
    };
});
