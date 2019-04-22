/**
 * Copyright (c) 2006-2017, JGraph Ltd
 * Copyright (c) 2006-2017, Gaudenz Alder
 */
DatabaseClient = function(editorUi) {
    var _this = this;
    DrawioClient.call(this, editorUi, 'database');

    /**
     * Create a new Async Instance with given parameters
     */
    this.asyncClient = new window.PodAsync(POD_CONFIG.SOCKET_PARAMS);

    /**
     * Whenever your Async connection gets asyncReady
     * you would be abale to send messages through
     */
    this.asyncClient.on('asyncReady', function() {
    });

    /**
     * Listening to messages come from async gate
     * @param   {string}    msg     Received Message From Async
     * @param   {function}  ack     Callback function responsible of returning acknowledgements
     */
    this.asyncClient.on('message', function(msg) {
        _this.asyncMessageHandler(msg);
    });

    /**
     * To show Async Status, we need to get state changes of
     * async connection and display the state on the page
     */
    this.asyncClient.on('stateChange', function(state) {
    });
};

// Extends DrawioClient
mxUtils.extend(DatabaseClient, DrawioClient);

DatabaseClient.prototype.eventCallbacks = {};

DatabaseClient.prototype.key = (window.location.hostname == 'test.draw.io') ? 'e73615c79cf7e381aef91c85936e9553' : 'e73615c79cf7e381aef91c85936e9553';

DatabaseClient.prototype.baseUrl = 'https://api.Database.com/1/';

DatabaseClient.prototype.SEPARATOR = '|$|';

/**
 * Maximum attachment size of Database.
 */
DatabaseClient.prototype.maxFileSize = 10000000 /*10MB*/;

/**
 * Default extension for new files.
 */
DatabaseClient.prototype.extension = '.xml'; //TODO export to png

DatabaseClient.prototype.sendAsyncMessage = function(msg, callback) {
    var uniqueId = this.asyncClient.generateUUID();

    msg.uniqueId = uniqueId;

    var asyncMessage = {
        type: 3,
        content: {
            peerName: POD_CONFIG.SOCKET_PARAMS.serverName,
            content: JSON.stringify(msg)
        }
    };

    this.eventCallbacks[uniqueId] = callback;

    this.asyncClient.send(asyncMessage);
};

DatabaseClient.prototype.asyncMessageHandler = function(msg) {
    var msgContent = JSON.parse(msg.content);
    var uniqueId = msgContent.uniqueId;
    if (this.eventCallbacks.hasOwnProperty(uniqueId)) {
        this.eventCallbacks[uniqueId](msgContent, this);
    }
};

/**
 * Authorizes the client, used with methods that can be called without a user click and popup blockers will interfere
 * Show the AuthDialog to work around the popup blockers if the file is opened directly
 */
DatabaseClient.prototype.authenticate = function(fn, error, force) {
    fn();
};

/**
 *
 */
DatabaseClient.prototype.getLibrary = function(id, success, error) {
    this.getFile(id, success, error, false, true);
};

/**
 *
 */
DatabaseClient.prototype.getFile = function(id, success, error, denyConvert, asLibrary) {
    //In getFile only, we
    asLibrary = (asLibrary != null) ? asLibrary : false;

    var callback = mxUtils.bind(this, function() {
        var ids = id.split(this.SEPARATOR);
        var acceptResponse = true;

        var timeoutThread = window.setTimeout(mxUtils.bind(this, function() {
            acceptResponse = false;
            error({code: App.ERROR_TIMEOUT, retry: callback});
        }), this.ui.timeout);

        Database.cards.get(ids[0] + '/attachments/' + ids[1], mxUtils.bind(this, function(meta) {
            window.clearTimeout(timeoutThread);

            if (acceptResponse) {
                var binary = /\.png$/i.test(meta.name);

                // TODO Database doesn't allow CORS requests to load attachments. Confirm that
                // and make sure that only a proxy technique can work!
                // Handles .vsdx, Gliffy and PNG+XML files by creating a temporary file
                if (/\.v(dx|sdx?)$/i.test(meta.name) || /\.gliffy$/i.test(meta.name) ||
                    (!this.ui.useCanvasForExport && binary)) {
                    this.ui.convertFile(PROXY_URL + '?url=' + encodeURIComponent(meta.url), meta.name, meta.mimeType,
                        this.extension, success, error);
                }
                else {
                    acceptResponse = true;

                    timeoutThread = window.setTimeout(mxUtils.bind(this, function() {
                        acceptResponse = false;
                        error({code: App.ERROR_TIMEOUT});
                    }), this.ui.timeout);

                    this.ui.loadUrl(PROXY_URL + '?url=' + encodeURIComponent(meta.url), mxUtils.bind(this, function(data) {
                        window.clearTimeout(timeoutThread);

                        if (acceptResponse) {
                            //keep our id which includes the cardId
                            meta.compoundId = id;

                            var index = (binary) ? data.lastIndexOf(',') : -1;

                            if (index > 0) {
                                var xml = this.ui.extractGraphModelFromPng(data.substring(index + 1));

                                if (xml != null && xml.length > 0) {
                                    data = xml;
                                }
                                else {
                                    // TODO: Import PNG
                                }
                            }

                            if (asLibrary) {
                                success(new DatabaseLibrary(this.ui, data, meta));
                            }
                            else {
                                success(new DatabaseFile(this.ui, data, meta));
                            }
                        }
                    }), mxUtils.bind(this, function(err, req) {
                        window.clearTimeout(timeoutThread);

                        if (acceptResponse) {
                            if (req.status == 401) {
                                this.authenticate(callback, error, true);
                            }
                            else {
                                error();
                            }
                        }
                    }), binary || (meta.mimeType != null &&
                        meta.mimeType.substring(0, 6) == 'image/'));
                }
            }
        }), mxUtils.bind(this, function(err) {
            window.clearTimeout(timeoutThread);

            if (acceptResponse) {
                if (err.status == 401) {
                    this.authenticate(callback, error, true);
                }
                else {
                    error();
                }
            }
        }));
    });

    this.authenticate(callback, error);
};

/**
 *
 */
DatabaseClient.prototype.insertLibrary = function(filename, data, success, error, cardId) {
    this.insertFile(filename, data, success, error, true, cardId);
};

/**
 *
 */
DatabaseClient.prototype.insertFile = function(filename, data, success, error, fileId) {
    // Map is already on database and we have to edit it
    if (fileId > 0) {
        var dataToInsert = {
            type: 4,
            content: JSON.stringify({
                name: filename,
                content: data,
                id: fileId
            })
        };

        this.sendAsyncMessage(dataToInsert, function(msg) {
            try {
                var result = JSON.parse(msg.content);
                if (result.errorCode <= 0) {
                    success();
                }
                else {
                    error();
                }
            }
            catch (e) {
                console.log(e);
                error();
            }
        });
    }
    else {
        var dataToInsert = {
            type: 3,
            content: JSON.stringify({
                name: filename,
                content: data
            })
        };

        this.sendAsyncMessage(dataToInsert, function(msg) {
            try {
                var result = JSON.parse(msg.content);
                if (result.errorCode <= 0) {
                    success();
                }
                else {
                    error();
                }
            }
            catch (e) {
                console.log(e);
                error();
            }
        });
    }
};

/**
 *
 */
DatabaseClient.prototype.saveFile = function(file, success, error) {
    // // write the file first (with the same name), then delete the old file
    // // so that nothing is lost if something goes wrong with deleting
    // var ids = file.meta.compoundId.split(this.SEPARATOR);
    //
    // var fn = mxUtils.bind(this, function(data)
    // {
    // 	this.writeFile(file.meta.name, data, ids[0], function(meta)
    // 	{
    // 		Database.del('cards/' + ids[0] + '/attachments/' + ids[1], mxUtils.bind(this, function()
    // 		{
    // 			success(meta);
    // 		}), mxUtils.bind(this, function(err)
    // 		{
    // 			if (err.status == 401)
    //     		{
    // 				// KNOWN: Does not wait for popup to close for callback
    //     			this.authenticate(callback, error, true);
    //     		}
    //     		else
    //     		{
    //     			error();
    //     		}
    // 		}));
    // 	}, error);
    // });
    //
    // var callback = mxUtils.bind(this, function()
    // {
    // 	if (this.ui.useCanvasForExport && /(\.png)$/i.test(file.meta.name))
    // 	{
    // 		this.ui.getEmbeddedPng(mxUtils.bind(this, function(data)
    // 		{
    // 			fn(this.ui.base64ToBlob(data, 'image/png'));
    // 		}), error, (this.ui.getCurrentFile() != file) ? file.getData() : null);
    // 	}
    // 	else
    // 	{
    // 		fn(file.getData());
    // 	}
    // });
    //
    // this.authenticate(callback, error);
};

/**
 *
 */
DatabaseClient.prototype.writeFile = function(filename, data, cardId, success, error) {
    if (filename != null && data != null) {
        if (data.length >= this.maxFileSize) {
            error({
                message: mxResources.get('drawingTooLarge') + ' (' +
                this.ui.formatFileSize(data.length) + ' / 10 MB)'
            });

            return;
        }

        var fn = mxUtils.bind(this, function() {
            var acceptResponse = true;

            var timeoutThread = window.setTimeout(mxUtils.bind(this, function() {
                acceptResponse = false;
                error({code: App.ERROR_TIMEOUT, retry: fn});
            }), this.ui.timeout);

            var formData = new FormData();
            formData.append('key', Database.key());
            formData.append('token', Database.token());
            formData.append('file', typeof data === 'string' ? new Blob([data]) : data, filename);
            formData.append('name', filename);

            var request = new XMLHttpRequest();
            request.responseType = 'json';

            request.onreadystatechange = mxUtils.bind(this, function() {
                if (request.readyState === 4) {
                    window.clearTimeout(timeoutThread);

                    if (acceptResponse) {
                        if (request.status == 200) {
                            var fileMeta = request.response;
                            fileMeta.compoundId = cardId + this.SEPARATOR + fileMeta.id;
                            success(fileMeta);
                        }
                        else if (request.status == 401) {
                            this.authenticate(fn, error, true);
                        }
                        else {
                            error();
                        }
                    }
                }
            });

            request.open('POST', this.baseUrl + 'cards/' + cardId + '/attachments');
            request.send(formData);
        });

        this.authenticate(fn, error);
    }
    else {
        error({message: mxResources.get('unknownError')});
    }
};

/**
 * Checks if the client is authorized and calls the next step.
 */
DatabaseClient.prototype.pickLibrary = function(fn) {
    this.pickFile(fn);
};

/**
 *
 */
DatabaseClient.prototype.pickFolder = function(fn) {
    fn();
};

/**
 * Checks if the client is authorized and calls the next step.
 */
DatabaseClient.prototype.pickFile = function(fn, returnObject) {
    fn = (fn != null) ? fn : mxUtils.bind(this, function(id) {
        this.ui.loadFile('T' + encodeURIComponent(id));
    });

    this.authenticate(mxUtils.bind(this, function() {
        // show file select
        this.showDatabaseDialog(true, fn);
    }), mxUtils.bind(this, function(e) {
        this.ui.showError(mxResources.get('error'), e, mxResources.get('ok'));
    }));
};

/**
 *
 */
DatabaseClient.prototype.showDatabaseDialog = function(showFiles, fn) {
    var cardId = null;
    var filter = '@me';
    var linkCounter = 0;

    var content = document.createElement('div');
    content.style.whiteSpace = 'nowrap';
    content.style.overflow = 'hidden';
    content.style.height = '224px';

    var hd = document.createElement('h3');
    mxUtils.write(hd, showFiles ? mxResources.get('selectFile') : mxResources.get('selectCard'));
    hd.style.cssText = 'width:100%;text-align:center;margin-top:0px;margin-bottom:12px';
    content.appendChild(hd);

    var div = document.createElement('div');
    div.style.whiteSpace = 'nowrap';
    div.style.overflow = 'auto';
    div.style.height = '194px';
    content.appendChild(div);

    var dlg = new CustomDialog(this.ui, content);
    this.ui.showDialog(dlg.container, 340, 270, true, true);

    dlg.okButton.parentNode.removeChild(dlg.okButton);

    var createLink = mxUtils.bind(this, function(label, fn, preview) {
        linkCounter++;
        var div = document.createElement('div');
        div.style = 'width:100%;text-overflow:ellipsis;overflow:hidden;vertical-align:middle;background:' + (linkCounter % 2 == 0 ? '#eee' : '#fff');
        var link = document.createElement('a');
        link.setAttribute('href', 'javascript:void(0);');

        if (preview != null) {
            var img = document.createElement('img');
            img.src = preview.url;
            img.width = preview.width;
            img.height = preview.height;
            img.style = 'border: 1px solid black;margin:5px;vertical-align:middle';
            link.appendChild(img);
        }

        mxUtils.write(link, label);
        mxEvent.addListener(link, 'click', fn);

        div.appendChild(link);

        return div;
    });

    var error = mxUtils.bind(this, function(err) {
        this.ui.handleError(err, null, mxUtils.bind(this, function() {
            this.ui.spinner.stop();
            this.ui.hideDialog();
        }));
    });

    var selectAtt = mxUtils.bind(this, function() {
        linkCounter = 0;
        div.innerHTML = '';
        this.ui.spinner.spin(div, mxResources.get('loading'));

        var callback = mxUtils.bind(this, function() {
            Database.cards.get(cardId + '/attachments', {fields: 'id,name,previews'}, mxUtils.bind(this, function(data) {
                    this.ui.spinner.stop();
                    var files = data;
                    div.appendChild(createLink('../ [Up]', mxUtils.bind(this, function() {
                        selectCard();
                    })));
                    mxUtils.br(div);

                    if (files == null || files.length == 0) {
                        mxUtils.write(div, mxResources.get('noFiles'));
                    }
                    else {
                        var listFiles = mxUtils.bind(this, function() {
                            for (var i = 0; i < files.length; i++) {
                                (mxUtils.bind(this, function(file) {
                                    div.appendChild(createLink(file.name, mxUtils.bind(this, function() {
                                        this.ui.hideDialog();
                                        fn(cardId + this.SEPARATOR + file.id);
                                    }), file.previews != null ? file.previews[0] : null));
                                }))(files[i]);
                            }
                        });

                        listFiles();
                    }
                }),
                mxUtils.bind(this, function(req) {
                    if (req.status == 401) {
                        this.authenticate(callback, error, true);
                    }
                    else if (error != null) {
                        error(req);
                    }
                }));
        });

        callback();
    });

    // Adds paging for cards (files limited to 1000 by API)
    var pageSize = 100;
    var nextPageDiv = null;
    var scrollFn = null;

    var selectCard = mxUtils.bind(this, function(page) {
        if (page == null) {
            linkCounter = 0;
            div.innerHTML = '';
            page = 1;
        }

        this.ui.spinner.spin(div, mxResources.get('loading'));

        if (nextPageDiv != null && nextPageDiv.parentNode != null) {
            nextPageDiv.parentNode.removeChild(nextPageDiv);
        }

        nextPageDiv = document.createElement('a');
        nextPageDiv.style.display = 'block';
        nextPageDiv.setAttribute('href', 'javascript:void(0);');
        mxUtils.write(nextPageDiv, mxResources.get('more') + '...');

        var nextPage = mxUtils.bind(this, function() {
            mxEvent.removeListener(div, 'scroll', scrollFn);
            selectCard(page + 1);
        });

        mxEvent.addListener(nextPageDiv, 'click', nextPage);

        var callback = mxUtils.bind(this, function() {
            Database.get('search', {
                    'query': (mxUtils.trim(filter) == '') ? 'is:open' : filter,
                    'cards_limit': pageSize,
                    'cards_page': page - 1
                },
                mxUtils.bind(this, function(data) {
                    this.ui.spinner.stop();
                    var cards = (data != null) ? data.cards : null;

                    if (cards == null || cards.length == 0) {
                        mxUtils.write(div, mxResources.get('noFiles'));
                    }
                    else {
                        if (page == 1) {
                            div.appendChild(createLink(mxResources.get('filterCards') + '...', mxUtils.bind(this, function() {
                                var dlg = new FilenameDialog(this.ui, filter, mxResources.get('ok'), mxUtils.bind(this, function(value) {
                                    if (value != null) {
                                        filter = value;
                                        selectCard();
                                    }
                                }), mxResources.get('filterCards'), null, null, 'http://help.Database.com/article/808-searching-for-cards-all-boards');
                                this.ui.showDialog(dlg.container, 300, 80, true, false);
                                dlg.init();
                            })));

                            mxUtils.br(div);
                        }

                        for (var i = 0; i < cards.length; i++) {
                            (mxUtils.bind(this, function(card) {
                                div.appendChild(createLink(card.name, mxUtils.bind(this, function() {
                                    if (showFiles) {
                                        cardId = card.id;
                                        selectAtt();
                                    }
                                    else {
                                        this.ui.hideDialog();
                                        fn(card.id);
                                    }
                                })));
                            }))(cards[i]);
                        }

                        if (cards.length == pageSize) {
                            div.appendChild(nextPageDiv);

                            scrollFn = function() {
                                if (div.scrollTop >= div.scrollHeight - div.offsetHeight) {
                                    nextPage();
                                }
                            };

                            mxEvent.addListener(div, 'scroll', scrollFn);
                        }
                    }
                }),
                mxUtils.bind(this, function(req) {
                    if (req.status == 401) {
                        this.authenticate(callback, error, true);
                    }
                    else if (error != null) {
                        error({message: req.responseText});
                    }
                }));
        });

        callback();
    });

    selectCard();
};

/**
 * Checks if the client is authorized
 */
DatabaseClient.prototype.isAuthorized = function() {
    return true;
    // //TODO this may break if Database client.js is changed
    // try
    // {
    // 	return localStorage['Database_token'] != null; //Database.authorized(); doesn't work unless authorize is called first
    // }
    // catch (e)
    // {
    // 	// ignores access denied
    // }
    //
    // return false;
};

/**
 * Logout and deauthorize the user.
 */
DatabaseClient.prototype.logout = function() {
    localStorage.removeItem('Database_token');
    Database.deauthorize();
};