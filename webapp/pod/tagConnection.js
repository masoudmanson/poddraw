Draw.loadPodFunctions(function (editorUi) {
    var standAloneTagConfig = {
        text: {
            name: 'Text',
            value: {
                entityId: {
                    name: 'Entity ID',
                    default: null
                },
                unit: {
                    name: 'Unit',
                    default: ''
                },
                tooltip: {
                    name: 'Tooltip',
                    default: ''
                }
            }
        },
        progress_bar: {
            name: 'Progress Bar',
            value: {
                entityId: {
                    name: 'Entity ID',
                    default: null
                },
                minValue: {
                    name: 'Min Value',
                    default: 0
                },
                maxValue: {
                    name: 'Max Value',
                    default: null
                },
                orientation: {
                    name: 'Orientation',
                    type: 'list',
                    options: [{name: 'Vertical (Y Axis)', value: 'vertical'}, {name: 'Horizental (X Axis)', value: 'horizontal'}],
                    default: 'vertical'
                },
                breakPoints: {
                    name: 'Break Points',
                    default: null
                },
                tooltip: {
                    name: 'Tooltip',
                    default: 'Progress Bar'
                }
            }
        },
        speedometer: {
            name: 'Speedometer',
            value: {
                entityId: {
                    name: 'Entity ID',
                    default: null
                },
                minValue: {
                    name: 'Min Value',
                    default: null
                },
                maxValue: {
                    name: 'Max Value',
                    default: null
                },
                angel: {
                    name: 'Max Angel',
                    default: 180
                },
                step: {
                    name: 'Step',
                    default: 1
                },
                tooltip: {
                    name: 'Tooltip',
                    default: 'Speedometer'
                }
            }
        },
        led: {
            name: 'LED',
            value: {
                entityId: {
                    name: 'Entity ID',
                    default: null
                },
                breakPoints: {
                    name: 'Break Points',
                    default: null
                },
                tooltip: {
                    name: 'Tooltip',
                    default: 'LED'
                }
            }
        },
        visibility: {
            name: 'Visibility',
            value: {
                entityId: {
                    name: 'Entity ID',
                    default: null
                },
                breakPoints: {
                    name: 'Break Points',
                    default: null
                },
                tooltip: {
                    name: 'Tooltip',
                    default: 'LED'
                }
            }
        }
    };

    var multiTagDeviceConfig = {
        text: {
            name: 'Text',
            value: {
                entityId: {
                    name: 'Device ID',
                    default: null
                },
                sensor: {
                    name: "Sensor name",
                    default: ''
                },
                unit: {
                    name: 'Unit',
                    default: ''
                },
                tooltip: {
                    name: 'Tooltip',
                    default: ''
                }
            }
        },
        progress_bar: {
            name: 'Progress Bar',
            value: {
                entityId: {
                    name: 'Device ID',
                    default: null
                },
                sensor: {
                    name: "Sensor name",
                    default: ''
                },
                minValue: {
                    name: 'Min Value',
                    default: 0
                },
                maxValue: {
                    name: 'Max Value',
                    default: null
                },
                breakPoints: {
                    name: 'Break Points',
                    default: null
                },
                tooltip: {
                    name: 'Tooltip',
                    default: 'Progress Bar'
                }
            }
        },
        speedometer: {
            name: 'Speedometer',
            value: {
                entityId: {
                    name: 'Device ID',
                    default: null
                },
                sensor: {
                    name: "Sensor name",
                    default: ''
                },
                minValue: {
                    name: 'Min Value',
                    default: null
                },
                maxValue: {
                    name: 'Max Value',
                    default: null
                },
                angel: {
                    name: 'Max Angel',
                    default: 180
                },
                step: {
                    name: 'Step',
                    default: 1
                },
                tooltip: {
                    name: 'Tooltip',
                    default: 'Speedometer'
                }
            }
        },
        led: {
            name: 'LED',
            value: {
                entityId: {
                    name: 'Device ID',
                    default: null
                },
                sensor: {
                    name: "Sensor name",
                    default: ''
                },
                breakPoints: {
                    name: 'Break Points',
                    default: null
                },
                tooltip: {
                    name: 'Tooltip',
                    default: 'LED'
                }
            }
        },
        visibility: {
            name: 'Visibility',
            value: {
                entityId: {
                    name: 'Device ID',
                    default: null
                },
                sensor: {
                    name: "Sensor name",
                    default: ''
                },
                breakPoints: {
                    name: 'Break Points',
                    default: null
                },
                tooltip: {
                    name: 'Tooltip',
                    default: 'LED'
                }
            }
        }
    };

    var config = standAloneTagConfig;

    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `.miniColorValue {
        position: relative;
        display: inline-block;
        margin: 4px 5px 4px 0;
        border: solid 1px;
        border-left-width: 25px;
        font-weight: bold;
        padding: 6px 26px 6px 6px;
    }
    .opacityValue {
        position: relative;
        display: inline-block;
        margin: 4px 5px 4px 0;
        border: solid 1px #ddd;
        font-weight: bold;
        padding: 6px 26px 6px 6px;
    }`;
    document.getElementsByTagName('head')[0].appendChild(style);

    var uiCreatePopupMenu = editorUi.menus.createPopupMenu;
    editorUi.menus.createPopupMenu = function (menu, cell, evt) {
        uiCreatePopupMenu.apply(this, arguments);

        var graph = editorUi.editor.graph;

        this.addMenuItems(menu, ['-', 'tagConnection'], null, evt);
    };

    // Adds action
    editorUi.actions.addAction('tagConnection', function () {
        var cell = editorUi.editor.graph.getSelectionCell();

        var dlg = new EditTagDataDialog(editorUi, cell);
        editorUi.showDialog(dlg.container, 400, 420, true, false, null, false);
        dlg.init();
    });

    var EditTagDataDialog = function (ui, cell) {
        var div = document.createElement('div');
        var graph = ui.editor.graph;

        var h3 = document.createElement('h3');
        mxUtils.write(h3, mxResources.get('tagConnection'));
        div.appendChild(h3);

        var tcp = document.createElement('p');
        mxUtils.write(tcp, mxResources.get('tagConnectionSentence'));
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

        var addComboBox = function (type, title, name, value, options) {
            if (type == 'odata') {
                oDataRequest({
                    url: oDataConfig[APPLICATION_OWNER].url + oDataConfig[APPLICATION_OWNER].collections[name].service
                }, function (result) {
                    if (!result.hasError) {
                        names.push(name);
                        var tempText = form.addCombo(title + ':', false, 1);
                        tempText.style.width = '100%';
                        texts.push(tempText);

                        var tags = result.data.d.results;

                        for (var i = 0; i < tags.length; i++) {
                            form.addOption(tempText, tags[i].tagname, tags[i].tagname, ((tags[i].tagname == value) ? true : false));
                        }
                    }
                    else {
                        mxUtils.alert(result.errorMessage);
                    }
                });
            } else {
                names.push(name);
                var tempText = form.addCombo(title + ':', false, 1);
                tempText.style.width = 'calc(100% + 3px)';
                texts.push(tempText);

                for (var i = 0; i < options.length; i++) {
                    form.addOption(tempText, options[i].name, options[i].value, ((options[i].value == value) ? true : false));
                }
            }
        };

        var addColorValuePair = function (div, breakPoints) {
            div.innerHTML = '';
            for (var n in breakPoints) {
                var miniColorValue = document.createElement('div');
                miniColorValue.setAttribute('id', 'cv-' + n);
                miniColorValue.setAttribute('class', 'miniColorValue');
                miniColorValue.style.borderColor = breakPoints[n];
                miniColorValue.innerHTML = n;

                var removeBtn = mxUtils.button('×', function (e) {
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
                removeBtn.style.border = 'solid 1px';
                removeBtn.style.borderColor = breakPoints[n];

                miniColorValue.appendChild(removeBtn);
                div.appendChild(miniColorValue);
            }
        };

        var addOpacityValuePair = function (div, breakPoints) {
            div.innerHTML = '';
            for (var n in breakPoints) {
                var miniColorValue = document.createElement('div');
                miniColorValue.setAttribute('id', 'cv-' + n);
                miniColorValue.setAttribute('class', 'opacityValue');
                miniColorValue.innerHTML = n + " | " + breakPoints[n];

                var removeBtn = mxUtils.button('×', function (e) {
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

        var addColorValueSelection = function (title, name, breakPoints, type) {
            names.push(name);
            texts.push({});

            var div = document.createElement('div');
            var cvpDiv = document.createElement('div');
            cvpDiv.style.display = 'inline';

            if (type == 'led' || type == 'progress_bar') {
                var addBtn = mxUtils.button(mxResources.get('addNew') + ' +', function () {
                    var colorDlg = new ColorValueDialog(editorUi, 'FF0000', function (color, value) {
                        breakPoints[value] = color;
                        addColorValuePair(cvpDiv, breakPoints);
                    });

                    editorUi.showDialog(colorDlg.container, 240, 330, true, false, null, false);
                    colorDlg.init();
                });

                addBtn.style.marginRight = '5px';

                div.appendChild(addBtn);
                div.appendChild(cvpDiv);

                addColorValuePair(cvpDiv, breakPoints);

            } else if (type == 'visibility') {
                var addBtn = mxUtils.button(mxResources.get('addNew') + ' +', function () {
                    var opacityDlg = new opacityValueDialog(editorUi, function (value, opacity) {
                        breakPoints[value] = opacity;
                        addOpacityValuePair(cvpDiv, breakPoints);
                    });

                    editorUi.showDialog(opacityDlg.container, 240, 150, true, false, null, false);
                    opacityDlg.init();
                });

                addBtn.style.marginRight = '5px';

                div.appendChild(addBtn);
                div.appendChild(cvpDiv);

                addOpacityValuePair(cvpDiv, breakPoints);
            }

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

        if (elmAttrs.hasOwnProperty('sensorType') && elmAttrs.sensorType != null && elmAttrs.sensorType != 'null' && elmAttrs.sensorType != '') {
            var sensorTypeCombo = form.addCombo('Sensor Type' + ':', false, 1, 'calc(100% + 3px)', addSensorTypeOptions);
            form.addOption(sensorTypeCombo, 'Stand Alone Tag', 'standAloneSensor', elmAttrs.sensorType == 'standAloneSensor');
            form.addOption(sensorTypeCombo, 'Multi Tag Device', 'deviceSensor', elmAttrs.sensorType == 'deviceSensor');

            names.push('sensorType');
            texts.push({value: elmAttrs.sensorType});
        } else {
            var sensorTypeCombo = form.addCombo('Sensor Type' + ':', false, 1, 'calc(100% + 3px)', addSensorTypeOptions);
            form.addOption(sensorTypeCombo, 'Stand Alone Tag', 'standAloneSensor', true);
            form.addOption(sensorTypeCombo, 'Multi Tag Device', 'deviceSensor', false);

            names.push('sensorType');
            texts.push({value: 'standAloneSensor'});
            elmAttrs['sensorType'] = 'standAloneSensor';
        }

        function addSensorTypeOptions(e) {
            switch (e.target.value) {
                case 'standAloneSensor':
                    config = standAloneTagConfig;
                    break;

                case 'deviceSensor':
                    config = multiTagDeviceConfig;
                    break;
            }

            names = [];
            texts = [];

            names.push('sensorType');
            texts.push({value: e.target.value});
            elmAttrs['sensorType'] = e.target.value;

            names.push('type');
            texts.push({value: elmAttrs.type});

            /**
             * i = 0 is Sensor Type
             * i = 1 is Tag Type
             */
            for (var i = form.table.rows.length - 1; i > 1; i--) {
                form.table.deleteRow(i);
            }

            addObjectAttributesToTagList();
        };

        var addComboBoxOptionsAsInputs = function (e) {
            /**
             * i = 0 is Sensor Type
             * i = 1 is Tag Type
             */
            for (var i = form.table.rows.length - 1; i > 1; i--) {
                form.table.deleteRow(i);
            }

            names = [];
            texts = [];

            if (e != null) {
                var typeIndex = (e.target) ? e.target.value : e;
                elmAttrs['type'] = typeIndex;
                names.push('type');
                texts.push({value: typeIndex});

                names.push('sensorType');
                texts.push({value: elmAttrs['sensorType']});

                addObjectAttributesToTagList();
            }
        };

        var combo = form.addCombo('Tag Type' + ':', false, 1, 'calc(100% + 3px)', addComboBoxOptionsAsInputs);

        form.addOption(combo, '', '', false);

        for (var i in config) {
            form.addOption(combo, config[i].name, i, (i == elmAttrs.type));
        }

        var addObjectAttributesToTagList = function () {
            if (elmAttrs.hasOwnProperty('sensorType') && elmAttrs.sensorType != null && elmAttrs.sensorType != 'null' && elmAttrs.sensorType != '') {
                switch (elmAttrs.sensorType) {
                    case 'standAloneSensor':
                        config = standAloneTagConfig;
                        break;

                    case 'deviceSensor':
                        config = multiTagDeviceConfig;
                        break;
                }
            } else {
                config = standAloneTagConfig;
            }

            if (elmAttrs.hasOwnProperty('type') && elmAttrs.type != null && elmAttrs.type != 'null' && elmAttrs.type != '') {
                var tags = new Object();
                if (elmAttrs.hasOwnProperty('tagConnections')) {
                    try {
                        tags = JSON.parse(elmAttrs.tagConnections);
                    }
                    catch (e) {
                        console.error(e);
                        mxUtils.alert(e);
                    }
                }

                for (var attr in config[elmAttrs.type].value) {
                    var item = config[elmAttrs.type].value[attr];

                    if (attr == 'breakPoints') {
                        if (typeof tags[attr] == 'string' && tags[attr].length > 0) {
                            breakPoints = JSON.parse(tags[attr]);
                        }
                        else {
                            breakPoints = {};
                        }
                        addColorValueSelection(item.name, attr, breakPoints, elmAttrs.type);
                    }
                    else {
                        if (mxUtils.indexOf(reservedNames, attr) >= 0) {
                            addComboBox('odata', item.name, attr, (tags[attr]) ? tags[attr] : item.default, {});
                        }
                        else {
                            if (item.type == 'list') {
                                addComboBox(null, item.name, attr, (tags[attr]) ? tags[attr] : item.default, item.options);
                            }
                            else {
                                addTextArea(item.name, attr, (tags[attr]) ? tags[attr] : item.default);
                            }
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

                if (elmAttrs.type != null && elmAttrs.type != 'null' && elmAttrs.type != '') {
                    var tagConnections = new Object();
                    for (var i = 0; i < names.length; i++) {
                        if (texts[i] == null) {
                            value.removeAttribute(names[i]);
                        }
                        else {
                            if (names[i] == 'breakPoints') {
                                if (typeof breakPoints == 'object') {
                                    tagConnections[names[i]] = JSON.stringify(breakPoints);
                                }
                                else {
                                    tagConnections[names[i]] = breakPoints;
                                }
                            }
                            else {
                                if (names[i] == 'tooltip') {
                                    value.setAttribute(names[i], texts[i].value);
                                }

                                if (names[i] == 'entityId') {
                                    if (elmAttrs.sensorType == 'standAloneSensor') {
                                        value.removeAttribute('sensor');
                                    }

                                    value.setAttribute(names[i], texts[i].value);
                                }

                                tagConnections[names[i]] = texts[i].value;
                            }

                            removeLabel = removeLabel || (names[i] == 'placeholder' && value.getAttribute('placeholders') == '1');
                        }
                    }
                    tagConnections['type'] = elmAttrs.type;
                    value.setAttribute('type', elmAttrs.type);
                    value.setAttribute('sensorType', elmAttrs.sensorType);
                    value.setAttribute('tagConnections', JSON.stringify(tagConnections));
                }
                else {
                    value.removeAttribute('type');
                    value.removeAttribute('sensorType');
                    value.removeAttribute('tagConnections');
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
    EditTagDataDialog.getDisplayIdForCell = function (ui, cell) {
        var id = null;

        if (ui.editor.graph.getModel()
            .getParent(cell) != null) {
            id = cell.getId();
        }

        return id;
    };

    /**
     * Optional help link.
     */
    EditTagDataDialog.placeholderHelpLink = null;

    /**
     * Constructs a new color dialog.
     */
    var ColorValueDialog = function (editorUi, color, apply, cancelFn) {
        this.editorUi = editorUi;

        var input = document.createElement('input');
        input.style.marginBottom = '10px';
        input.style.width = 'calc(100% - 6px)';
        input.style.border = 'none';
        input.style.outline = 'none';

        // Required for picker to render in IE
        if (mxClient.IS_IE) {
            input.style.marginTop = '10px';
            document.body.appendChild(input);
        }

        this.init = function () {
            if (!mxClient.IS_TOUCH) {
                valueInput.focus();
            }
        };

        var picker = new jscolor.color(input);
        picker.pickerOnfocus = false;
        picker.showPicker();

        var div = document.createElement('div');

        var h3 = document.createElement('h3');
        mxUtils.write(h3, mxResources.get('colorValueSelection'));
        div.appendChild(h3);

        jscolor.picker.box.style.position = 'relative';
        jscolor.picker.box.style.width = '100%';
        jscolor.picker.box.style.height = '100px';
        jscolor.picker.box.style.paddingBottom = '10px';
        div.appendChild(jscolor.picker.box);

        var center = document.createElement('center');

        function createRecentColorTable() {
            var table = addPresets((ColorValueDialog.recentColors.length == 0) ? ['FFFFFF'] : ColorValueDialog.recentColors, 13, 'FFFFFF', true);
            table.style.marginBottom = '8px';

            return table;
        };

        function addPresets(presets, rowLength, defaultColor, addResetOption) {
            rowLength = (rowLength != null) ? rowLength : 14;
            var table = document.createElement('table');
            table.style.borderCollapse = 'collapse';
            table.setAttribute('cellspacing', '0');
            table.style.marginBottom = '20px';
            table.style.cellSpacing = '0px';
            var tbody = document.createElement('tbody');
            table.appendChild(tbody);

            var rows = presets.length / rowLength;

            for (var row = 0; row < rows; row++) {
                var tr = document.createElement('tr');

                for (var i = 0; i < rowLength; i++) {
                    (function (clr) {
                        var td = document.createElement('td');
                        td.style.border = '1px solid black';
                        td.style.padding = '0px';
                        td.style.width = '16px';
                        td.style.height = '16px';

                        if (clr == null) {
                            clr = defaultColor;
                        }

                        if (clr == 'none') {
                            td.style.background = 'url(\'' + Dialog.prototype.noColorImage + '\')';
                        }
                        else {
                            td.style.backgroundColor = '#' + clr;
                        }

                        tr.appendChild(td);

                        if (clr != null) {
                            td.style.cursor = 'pointer';

                            mxEvent.addListener(td, 'click', function () {
                                if (clr == 'none') {
                                    picker.fromString('ffffff');
                                    input.value = 'none';
                                }
                                else {
                                    picker.fromString(clr);
                                }
                            });
                        }
                    })(presets[row * rowLength + i]);
                }

                tbody.appendChild(tr);
            }

            if (addResetOption) {
                var td = document.createElement('td');
                td.setAttribute('title', mxResources.get('reset'));
                td.style.border = '1px solid black';
                td.style.padding = '0px';
                td.style.width = '16px';
                td.style.height = '16px';
                td.style.backgroundImage = 'url(\'' + Dialog.prototype.closeImage + '\')';
                td.style.backgroundPosition = 'center center';
                td.style.backgroundRepeat = 'no-repeat';
                td.style.cursor = 'pointer';

                tr.appendChild(td);

                mxEvent.addListener(td, 'click', function () {
                    ColorValueDialog.resetRecentColors();
                    table.parentNode.replaceChild(createRecentColorTable(), table);
                });
            }

            center.appendChild(table);

            return table;
        };

        // Adds recent colors
        createRecentColorTable();

        // Adds presets
        var table = addPresets(this.presetColors);
        table.style.marginBottom = '2px';

        div.appendChild(center);

        varcolorValueTable = document.createElement('table');
        varcolorValueTable.style.borderCollapse = 'collapse';
        varcolorValueTable.setAttribute('cellspacing', '0');
        varcolorValueTable.style.marginBottom = '0px';
        varcolorValueTable.style.cellSpacing = '0px';
        var varcolorValueTableBody = document.createElement('tbody');
        varcolorValueTable.appendChild(varcolorValueTableBody);
        var varcolorValueTableTr = document.createElement('tr');

        // Add Value Input
        var varcolorValueTableTd2 = document.createElement('td');
        varcolorValueTableTd2.style.margin = '0px';
        var valueh4 = document.createElement('h4');
        valueh4.style.marginBottom = '5px';
        mxUtils.write(valueh4, mxResources.get('tagValue'));
        varcolorValueTableTd2.appendChild(valueh4);

        var valueInput = document.createElement('input');
        valueInput.style.marginBottom = '10px';
        valueInput.style.width = '92%';
        valueInput.style.border = 'solid 1px #ddd';
        valueInput.style.outline = 'none';
        varcolorValueTableTd2.appendChild(valueInput);
        varcolorValueTableTr.appendChild(varcolorValueTableTd2);

        // Add Color Input
        var varcolorValueTableTd = document.createElement('td');
        var colorh4 = document.createElement('h4');
        colorh4.style.marginBottom = '5px';
        mxUtils.write(colorh4, mxResources.get('color'));
        varcolorValueTableTd.appendChild(colorh4);
        varcolorValueTableTd.appendChild(input);
        varcolorValueTableTr.appendChild(varcolorValueTableTd);

        varcolorValueTableBody.appendChild(varcolorValueTableTr);

        div.appendChild(varcolorValueTable);
        mxUtils.br(div);

        var buttons = document.createElement('div');
        buttons.style.textAlign = 'right';
        buttons.style.whiteSpace = 'nowrap';

        var cancelBtn = mxUtils.button(mxResources.get('cancel'), function () {
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

        var applyBtn = mxUtils.button(mxResources.get('apply'), function () {
            var color = input.value;
            var value = valueInput.value;
            ColorValueDialog.addRecentColor(color, 12);

            if (color != 'none' && color.charAt(0) != '#') {
                color = '#' + color;
            }

            if (value != '') {
                applyFunction(color, value);
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

        if (color != null) {
            if (color == 'none') {
                picker.fromString('ffffff');
                input.value = 'none';
            }
            else {
                picker.fromString(color);
            }
        }

        div.appendChild(buttons);
        this.picker = picker;
        this.colorInput = input;

        // LATER: Only fires if input if focused, should always
        // fire if this dialog is showing.
        mxEvent.addListener(div, 'keydown', function (e) {
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

    /**
     * Creates function to apply value
     */
    ColorValueDialog.prototype.presetColors = [
        'FFFF00',
        'FFEA32',
        'FF8000',
        'FFBB39',
        'FF8000',
        'FF2B64',
        'FF0000',
        'FF5B31',
        'FF110B',
        'D93854',
        'EB2F33',
        '800080',
        'C1486D',
        'B5125E',
        '8E5F92',
        '72669E',
        '007BA7',
        '59978F',
        '0000FF',
        '70E7FF',
        '8091FF',
        '007BA7',
        '079D43',
        '008000',
        '8DB600',
        '0ECC00',
        'BFCC0A',
        '00FF00'];

    /**
     *
     */
    ColorValueDialog.recentColors = [];

    /**
     * Adds recent color for later use.
     */
    ColorValueDialog.addRecentColor = function (color, max) {
        if (color != null) {
            mxUtils.remove(color, ColorValueDialog.recentColors);
            ColorValueDialog.recentColors.splice(0, 0, color);

            if (ColorValueDialog.recentColors.length >= max) {
                ColorValueDialog.recentColors.pop();
            }
        }
    };

    /**
     * Adds recent color for later use.
     */
    ColorValueDialog.resetRecentColors = function () {
        ColorValueDialog.recentColors = [];
    };

    /**
     * Constructs a new color dialog.
     */
    var opacityValueDialog = function (editorUi, apply, cancelFn) {
        this.editorUi = editorUi;

        this.init = function () {
            if (!mxClient.IS_TOUCH) {
                valueInput.focus();
            }
        };

        var div = document.createElement('div');

        var h3 = document.createElement('h3');
        mxUtils.write(h3, mxResources.get('opacityValue'));
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
        mxUtils.write(valueh4, mxResources.get('opacityValue'));
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

        var cancelBtn = mxUtils.button(mxResources.get('cancel'), function () {
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

        var applyBtn = mxUtils.button(mxResources.get('apply'), function () {
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
        mxEvent.addListener(div, 'keydown', function (e) {
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
