/**
 * Copyright (c) 2006-2017, JGraph Ltd
 * Copyright (c) 2006-2017, Gaudenz Alder
 */
DrawioFile = function(ui, data)
{
	mxEventSource.call(this);
	
	/**
	 * Holds the x-coordinate of the point.
	 * @type number
	 * @default 0
	 */
	this.ui = ui;
	
	/**
	 * Holds the x-coordinate of the point.
	 * @type number
	 * @default 0
	 */
	this.data = data || '';
	this.shadowData = this.data;
};

/**
 * Global switch for realtime collaboration type to use sync URL parameter
 * with the following possible values:
 * 
 * - none: overwrite
 * - manual: manual sync
 * - auto: automatic sync
 */
DrawioFile.SYNC = urlParams['sync'] || 'none';

/**
 * Specifies if last write wins should be used for values and styles.
 */
DrawioFile.LAST_WRITE_WINS = true;

// Extends mxEventSource
mxUtils.extend(DrawioFile, mxEventSource);

/**
 * Delay for last save in ms.
 */
DrawioFile.prototype.allChangesSavedKey = 'allChangesSaved';

/**
 * Specifies the delay between the last change and the autosave.
 */
DrawioFile.prototype.autosaveDelay = 1500;

/**
 * Specifies the maximum delay before an autosave is forced even if the graph
 * is being changed.
 */
DrawioFile.prototype.maxAutosaveDelay = 30000;

/**
 * Contains the thread for the next autosave.
 */
DrawioFile.prototype.autosaveThread = null;

/**
 * Stores the timestamp for hte last autosave.
 */
DrawioFile.prototype.lastAutosave = null;

/**
 * Stores the modified state.
 */
DrawioFile.prototype.modified = false;

/**
 * Holds a copy of the current file data.
 */
DrawioFile.prototype.data = null;

/**
 * Holds a copy of the last saved file data.
 */
DrawioFile.prototype.shadowData = null;

/**
 * Holds a copy of the parsed last saved file data.
 */
DrawioFile.prototype.shadowPages = null;

/**
 * Specifies if the graph change listener is enabled. Default is true.
 */
DrawioFile.prototype.changeListenerEnabled = true;

/**
 * Sets the delay for autosave in milliseconds. Default is 1500.
 */
DrawioFile.prototype.lastAutosaveRevision = null;

/**
 * Sets the delay for autosave in milliseconds. Default is 1000.
 */
DrawioFile.prototype.maxAutosaveRevisionDelay = 1800000;

/**
 * Specifies if notify events should be ignored.
 */
DrawioFile.prototype.inConflictState = false;

/**
 * Specifies if notify events should be ignored.
 */
DrawioFile.prototype.invalidChecksum = false;

/**
 * Specifies if notify events should be ignored.
 */
DrawioFile.prototype.getSize = function()
{
	return (this.data != null) ? this.data.length : 0;
};

/**
 * Adds the listener for automatically saving the diagram for local changes.
 */
DrawioFile.prototype.synchronizeFile = function(success, error)
{
	if (this.savingFile)
	{
		if (error != null)
		{
			error({message: mxResources.get('busy')});
		}
	}
	else
	{
		if (this.sync != null)
		{
			this.sync.fileChanged(success, error);
		}
		else
		{
			this.updateFile(success, error);
		}
	}
};

/**
* Adds the listener for automatically saving the diagram for local changes.
*/
DrawioFile.prototype.updateFile = function(success, error, abort)
{
	this.getLatestVersion(mxUtils.bind(this, function(latestFile)
	{
		try
		{
			if (abort == null || !abort())
			{
				if (latestFile != null)
				{
					this.mergeFile(latestFile, success, error);
				}
				else
				{
					this.reloadFile(success);
				}
			}
		}
		catch (e)
		{
			if (error != null)
			{
				error(e);
			}
		}
	}), error);
};

/**
 * Adds the listener for automatically saving the diagram for local changes.
 */
DrawioFile.prototype.mergeFile = function(file, success, error)
{
	try
	{
		// Takes copy of current shadow document
		var shadow = (this.shadowPages != null) ? this.shadowPages :
			this.ui.getPagesForNode(mxUtils.parseXml(
			this.shadowData).documentElement);
	
		// Loads new document as shadow document
		this.shadowPages = this.ui.getPagesForNode(mxUtils.parseXml(
			file.data).documentElement)
					
		// Creates a patch for backup if the checksum fails
		this.backupPatch = (this.isModified()) ? this.ui.diffPages(
			shadow, this.ui.pages) : null;
		
		// Patches the current document
		var patch = this.ui.diffPages(shadow, this.shadowPages);
		this.patch([patch], (DrawioFile.LAST_WRITE_WINS &&
			this.isEditable() && this.isModified()) ? shadow : null);
		
		// Patching previous shadow to verify checksum
		var patchedShadow = this.ui.patchPages(shadow, patch);
		var checksum = this.ui.getHashValueForPages(patchedShadow);
		var current = this.ui.getHashValueForPages(this.shadowPages);
		
		EditorUi.debug('File.mergeFile', [this], 'patch', patch, 'checksum', current, checksum);
		
		if (checksum != current)
		{
			this.checksumError(error, 'mergeFile');
		}
		else
		{
			this.backupPatch = null;
			this.invalidChecksum = false;
			this.inConflictState = false;
			
			this.setDescriptor(file.getDescriptor());
			this.descriptorChanged();
			
			if (success != null)
			{
				success();
			}
		}
	}
	catch (e)
	{
		if (window.console != null && urlParams['test'] == '1')
		{
			console.log(e);
		}

		if (error != null)
		{
			error(e);
		}

		// Reports errors during beta phase
		this.ui.sendReport('Error in mergeFile:\n' +
			new Date().toISOString() + '\n' +
			'Sync=' + DrawioFile.SYNC + '\n' +
			'Id=' + this.getId() + '\n' +
			'Mode=' + this.getMode() + '\n' +
			'Size=' + this.getSize() + '\n' +
			'Stack:\n' + e.stack);
	}
};

/**
 * Adds the listener for automatically saving the diagram for local changes.
 */
DrawioFile.prototype.checksumError = function(error, source)
{
	this.inConflictState = true;
	this.invalidChecksum = true;

	// Checksum error makes the file read-only
	if (this.sync != null)
	{
		this.sync.ignoreDescriptorChanged = true;
	}
	
	this.descriptorChanged();
	
	if (this.sync != null)
	{
		this.sync.ignoreDescriptorChanged = true;
	}
	
	if (error != null)
	{
		error();
	}
	
	// Reports checksum errors during beta phase
	this.ui.sendReport('Checksum error in ' + source + ':\n' +
		new Date().toISOString() + '\n' +
		'Sync=' + DrawioFile.SYNC + '\n' +
		'Id=' + this.getId() + '\n' +
		'Mode=' + this.getMode() + '\n' +
		'Size=' + this.getSize());
};

/**
 * Adds the listener for automatically saving the diagram for local changes.
 */
DrawioFile.prototype.reloadFile = function(success)
{
	this.ui.spinner.stop();
	
	var fn = mxUtils.bind(this, function()
	{
		this.setModified(false);
		var page = this.ui.currentPage;
		var viewState = this.ui.editor.graph.getViewState();
		var selection = this.ui.editor.graph.getSelectionCells();
		
		this.ui.loadFile(this.getHash(), true, null, mxUtils.bind(this, function()
		{
			this.ui.restoreViewState(page, viewState, selection);
			
			if (this.backupPatch != null)
			{
				this.patch([this.backupPatch]);
			}
			
			if (success != null)
			{
				success();
			}
		}));
	});

	if (this.isModified() && this.backupPatch == null)
	{
		this.ui.confirm(mxResources.get('allChangesLost'), mxUtils.bind(this, function()
		{
			this.handleFileSuccess(DrawioFile.SYNC == 'manual');
		}), fn, mxResources.get('cancel'), mxResources.get('discardChanges'));
	}
	else
	{
		fn();
	}
};

/**
 * Shows a conflict dialog to the user.
 */
DrawioFile.prototype.copyFile = function(success, error)
{
	if (this.constructor == DriveFile && !this.isRestricted())
	{
		this.makeCopy(mxUtils.bind(this, function()
		{
			if (this.ui.spinner.spin(document.body, mxResources.get('saving')))
			{
				try
				{
					this.save(true, success, error)
				}
				catch (e)
				{
					error(e);
				}
			}
		}), error, true);
	}
	else
	{
		this.ui.editor.editAsNew(this.ui.getFileData(true),
			this.ui.getCopyFilename(this));
	}	
};

/**
 * Returns true if all given patches are empty.
 */
DrawioFile.prototype.ignorePatches = function(patches)
{
	var ignore = true;
	
	for (var i = 0; i < patches.length && ignore; i++)
	{
		ignore = ignore && Object.keys(patches[i]).length == 0;
	}
	
	return ignore;
};

/**
 * Applies the given patches to the file.
 */
DrawioFile.prototype.patch = function(patches, shadow)
{
	if (!this.ignorePatches(patches))
	{
		// Saves state of undo history
		var undoMgr = this.ui.editor.undoManager;
		var history = undoMgr.history.slice();
		var nextAdd = undoMgr.indexOfNextAdd;
		
		// Hides graph during updates
		var graph = this.ui.editor.graph;
		graph.container.style.visibility = 'hidden';
	
		// Ignores change events
		var prev = this.changeListenerEnabled;
		this.changeListenerEnabled = false;
		
		// Math changes require special handling
		var math = graph.mathEnabled;
		
		// Updates text editor if cell changes during validation
		var redraw = graph.cellRenderer.redraw;
	
		graph.cellRenderer.redraw = function(state)
	    {
	        if (state.view.graph.isEditing(state.cell))
	        {
	            state.view.graph.scrollCellToVisible(state.cell);
	        	state.view.graph.cellEditor.resize();
	        }
	        
	        redraw.apply(this, arguments);
	    };
	
	    // Applies patches
		graph.model.beginUpdate();
		try
		{
			for (var i = 0; i < patches.length; i++)
			{
				this.ui.pages = this.ui.patchPages(this.ui.pages,
					patches[i], true, shadow);
			}
		}
		finally
		{
			graph.model.endUpdate();
		}
	
		// Checks if current page was removed
		if (this.ui.pages.length > 0 && mxUtils.indexOf(
			this.ui.pages, this.ui.currentPage) < 0)
		{
			this.ui.selectPage(this.ui.pages[0], true);
		}
	
		// Restores previous state
		graph.cellRenderer.redraw = redraw;
		this.changeListenerEnabled = prev;
		graph.container.style.visibility = '';
	
		// Restores history state
		undoMgr.history = history;
		undoMgr.indexOfNextAdd = nextAdd;
		undoMgr.fireEvent(new mxEventObject(mxEvent.CLEAR));
		
		// Updates the graph and background
		if (math != graph.mathEnabled)
		{
			this.ui.editor.updateGraphComponents();
			graph.refresh();
		}
		else
		{
			graph.view.validate();
		}
		
		graph.sizeDidChange();
		this.ui.updateTabContainer();
		
		// Updates view state in format panel if nothing is selected
		if (this.ui.format != null && graph.isSelectionEmpty())
		{
			this.ui.format.refresh();
		}
	}
};

/**
 * Adds the listener for automatically saving the diagram for local changes.
 */
DrawioFile.prototype.save = function(revision, success, error, unloading, overwrite, manual)
{
	if (!this.isEditable())
	{
		throw new Error(mxResources.get('readOnly'));
	}
	else if (this.invalidChecksum)
	{
		throw new Error(mxResources.get('checksum'));
	}
	else
	{
		this.updateFileData();
		this.clearAutosave();
	}
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
DrawioFile.prototype.updateFileData = function()
{
	this.setData(this.ui.getFileData(null, null, null, null, null, null, null, null, this));
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
DrawioFile.prototype.saveAs = function(filename, success, error) { };

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
DrawioFile.prototype.saveFile = function(title, revision, success, error) { };

/**
 * Returns true if copy, export and print are not allowed for this file.
 */
DrawioFile.prototype.getPublicUrl = function(fn)
{
	fn(null);
};

/**
 * Returns true if copy, export and print are not allowed for this file.
 */
DrawioFile.prototype.isRestricted = function()
{
	return false;
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
DrawioFile.prototype.isModified = function()
{
	return this.modified;
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
DrawioFile.prototype.setModified = function(value)
{
	this.modified = value;
};

/**
 * Specifies if the autosave checkbox should be shown in the document
 * properties dialog. Default is false.
 */
DrawioFile.prototype.isAutosaveOptional = function()
{
	return false;
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
DrawioFile.prototype.isAutosave = function()
{
	return !this.inConflictState && this.ui.editor.autosave;
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
DrawioFile.prototype.isRenamable = function()
{
	return false;
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
DrawioFile.prototype.rename = function(title, success, error) { };

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
DrawioFile.prototype.isMovable = function()
{
	return false;
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
DrawioFile.prototype.move = function(folderId, success, error) { };

/**
 * Returns the hash of the file which consists of a prefix for the storage
 * type and the ID of the file.
 */
DrawioFile.prototype.getHash = function()
{
	return '';
};

/**
 * Returns the ID of the file.
 */
DrawioFile.prototype.getId = function()
{
	return '';
};

/**
 * Returns true if the file is editable.
 */
DrawioFile.prototype.isEditable = function()
{
	return !this.ui.editor.isChromelessView() || this.ui.editor.editable;
};

/**
 * Returns the location as a new object.
 * @type mx.Point
 */
DrawioFile.prototype.getUi = function()
{
	return this.ui;
};

/**
 * Returns the current title of the file.
 */
DrawioFile.prototype.getTitle = function()
{
	return '';
};

/**
 * Sets the current data of the file.
 */
DrawioFile.prototype.setData = function(data)
{
	this.data = data;
};

/**
 * Returns the current data of the file.
 */
DrawioFile.prototype.getData = function()
{
	return this.data;
};

/**
 * Opens this file in the editor.
 */
DrawioFile.prototype.open = function()
{
	var data = this.getData();
	
	if (data != null)
	{
		this.ui.setFileData(data);
		
		// Updates shadow in case any page IDs have been updated
		this.shadowData = mxUtils.getXml(this.ui.getXmlFileData());
	}

	this.installListeners();
	
	if (this.isSyncSupported())
	{
		this.startSync();
	}
};

/**
 * Hook for subclassers.
 */
DrawioFile.prototype.isSyncSupported = function()
{
	return false;
};

/**
 * Hook for subclassers.
 */
DrawioFile.prototype.isRevisionHistorySupported = function()
{
	return false;
};

/**
 * Hook for subclassers.
 */
DrawioFile.prototype.getRevisions = function(success, error)
{
	success(null);
};

/**
 * Hook for subclassers to get the latest descriptor of this file
 * and return it in the success handler.
 */
DrawioFile.prototype.loadDescriptor = function(success, error)
{
	success(null);
};

/**
 * Hook for subclassers to get the latest etag of this file
 * and return it in the success handler.
 */
DrawioFile.prototype.loadPatchDescriptor = function(success, error)
{
	this.loadDescriptor(mxUtils.bind(this, function(desc)
	{
		success(desc);
	}), error);
};

/**
 * Creates a starts the synchronization.
 */
DrawioFile.prototype.startSync = function()
{
	if (DrawioFile.SYNC == 'auto' && urlParams['stealth'] != '1')
	{
		this.sync = new DrawioFileSync(this);
		this.sync.start();
	}
};

/**
 * Hook for subclassers to check if an error is a conflict.
 */
DrawioFile.prototype.isConflict = function()
{
	return false;
};

/**
 * Gets the channel ID for sync messages.
 */
DrawioFile.prototype.getChannelId = function()
{
	return this.ui.editor.graph.compress(this.getHash()).replace(/\//g, '-').replace(/ /g, '_');
};

/**
 * Gets the channel ID from the given descriptor.
 */
DrawioFile.prototype.getChannelKey = function(desc)
{
	return null;
};

/**
 * Returns the current etag.
 */
DrawioFile.prototype.getCurrentUser = function()
{
	return null;
};

/**
 * Hook for subclassers to get the latest version of this file
 * and return it in the success handler.
 */
DrawioFile.prototype.getLatestVersion = function(success, error)
{
	success(null);
};

/**
 * Returns the last modified date of this file.
 */
DrawioFile.prototype.getLastModifiedDate = function()
{
	return new Date();
};

/**
 * Sets the current etag.
 */
DrawioFile.prototype.setCurrentEtag = function(etag)
{
	this.setDescriptorEtag(this.getDescriptor(), etag);
};

/**
 * Returns the current etag.
 */
DrawioFile.prototype.getCurrentEtag = function()
{
	return this.getDescriptorEtag(this.getDescriptor());
};

/**
 * Returns the descriptor from this file.
 */
DrawioFile.prototype.getDescriptor = function()
{
	return null;
};

/**
 * Sets the descriptor for this file.
 */
DrawioFile.prototype.setDescriptor = function() { };

/**
 * Updates the etag on the given descriptor.
 */
DrawioFile.prototype.setDescriptorEtag = function(desc, etag) { };

/**
 * Returns the etag from the given descriptor.
 */
DrawioFile.prototype.getDescriptorEtag = function(desc)
{
	return null;
};

/**
 * Returns the secret from the given descriptor.
 */
DrawioFile.prototype.getDescriptorSecret = function(desc)
{
	return null;
};

/**
 * Installs the change listener.
 */
DrawioFile.prototype.installListeners = function()
{
	if (this.changeListener == null)
	{
		this.changeListener = mxUtils.bind(this, function(sender, eventObject)
		{
			var edit = (eventObject != null) ? eventObject.getProperty('edit') : null;
			
			if (this.changeListenerEnabled && this.isEditable() && (edit == null || !edit.ignoreEdit))
			{
				this.fileChanged();
			}
		});
		
		this.ui.editor.graph.model.addListener(mxEvent.CHANGE, this.changeListener);
	
		// Some options trigger autosave
		this.ui.editor.graph.addListener('gridSizeChanged', this.changeListener);
		this.ui.editor.graph.addListener('shadowVisibleChanged', this.changeListener);
		this.ui.addListener('pageFormatChanged', this.changeListener);
		this.ui.addListener('pageScaleChanged', this.changeListener);
		this.ui.addListener('backgroundColorChanged', this.changeListener);
		this.ui.addListener('backgroundImageChanged', this.changeListener);
		this.ui.addListener('foldingEnabledChanged', this.changeListener);
		this.ui.addListener('mathEnabledChanged', this.changeListener);
		this.ui.addListener('gridEnabledChanged', this.changeListener);
		this.ui.addListener('guidesEnabledChanged', this.changeListener);
		this.ui.addListener('pageViewChanged', this.changeListener);
	}
};

/**
 * Returns the location as a new object.
 * @type mx.Point
 */
DrawioFile.prototype.addAllSavedStatus = function()
{
	if (this.ui.statusContainer != null)
	{
		if (this.constructor == DriveFile || this.constructor == DropboxFile)
		{
			this.ui.editor.setStatus('<div title="'+ mxUtils.htmlEntities(mxResources.get('revisionHistory')) +
				'" style="text-decoration:underline;cursor:pointer;">' +
				mxUtils.htmlEntities(mxResources.get(this.allChangesSavedKey)) + '</div>');
			var links = this.ui.statusContainer.getElementsByTagName('div');
			
			if (links.length > 0)
			{
				mxEvent.addListener(links[0], 'click', mxUtils.bind(this, function()
				{
					this.ui.actions.get('revisionHistory').funct();
				}));
			}
		}
		else
		{
			this.ui.editor.setStatus(mxUtils.htmlEntities(mxResources.get(this.allChangesSavedKey)));
		}
	}
};

/**
 * Adds the listener for automatically saving the diagram for local changes.
 */
DrawioFile.prototype.addUnsavedStatus = function(err)
{
	if (!this.inConflictState && this.ui.statusContainer != null)
	{
		if (err instanceof Error && err.message != null)
		{
			this.ui.editor.setStatus('<div class="geStatusAlert" style="overflow:hidden;">' +
				mxUtils.htmlEntities(mxResources.get('unsavedChanges')) +
				' (' + mxUtils.htmlEntities(err.message) + ')</div>');
		}
		else
		{
			// FIXME: Handle multiple tabs
	//		if (this.ui.mode == null && urlParams['splash'] == '0')
	//		{
	//			try
	//			{
	//				this.ui.updateDraft();
	//				this.setModified(false);
	//			}
	//			catch (e)
	//			{
	//				// Keeps modified flag unchanged
	//			}
	//		}
			var msg = this.getErrorMessage(err);
			
			if (msg != null && msg.length > 60)
			{
				msg = msg.substring(0, 60) + '...';
			}
			
			this.ui.editor.setStatus('<div class="geStatusAlert" style="cursor:pointer;overflow:hidden;">' +
				mxUtils.htmlEntities(mxResources.get('unsavedChangesClickHereToSave')) +
				((msg != null) ? ' (' + mxUtils.htmlEntities(msg) + ')' : '') + '</div>');
			
			// Installs click handler for saving
			var links = this.ui.statusContainer.getElementsByTagName('div');
			
			if (links != null && links.length > 0)
			{
				mxEvent.addListener(links[0], 'click', mxUtils.bind(this, function()
				{
					this.ui.actions.get((this.ui.mode == null || !this.isEditable()) ?
						'saveAs' : 'save').funct();
				}));
			}
			else
			{
				this.ui.editor.setStatus('<div class="geStatusAlert" style="overflow:hidden;">' +
					mxUtils.htmlEntities(mxResources.get('unsavedChanges')) + '</div>');
			}
		}
	}
};

/**
 * Halts all timers and shows a conflict status message. The optional error
 * handler is invoked first.
 */
DrawioFile.prototype.addConflictStatus = function(fn, message)
{
	if (this.invalidChecksum)
	{
		this.setConflictStatus(mxUtils.htmlEntities(mxResources.get('error')) +
			': ' + mxResources.get('checksum') + ' (' +
			mxResources.get('disconnected') + ')');
	}
	else
	{
		this.setConflictStatus(mxUtils.htmlEntities(mxResources.get('fileChangedSync')) +
			((message != null && message != '') ? ' (' + mxUtils.htmlEntities(message) + ')' : ''));
	}

	this.ui.spinner.stop();
	this.clearAutosave();

	var links = (this.ui.statusContainer != null) ? this.ui.statusContainer.getElementsByTagName('div') : null;
	
	if (links != null && links.length > 0)
	{
		mxEvent.addListener(links[0], 'click', mxUtils.bind(this, function(evt)
		{
			if (mxEvent.getSource(evt).nodeName != 'IMG')
			{
				fn();
			}
		}));
	}
	else
	{
		fn()
	}
};

/**
 * Halts all timers and shows a conflict status message. The optional error
 * handler is invoked first.
 */
DrawioFile.prototype.setConflictStatus = function(message)
{
	this.ui.editor.setStatus('<div class="geStatusAlert geBlink" style="cursor:pointer;overflow:hidden;">' + message +
		' <a href="https://desk.draw.io/support/solutions/articles/16000087947" target="_blank"><img border="0" ' +
		'title="' + mxUtils.htmlEntities(mxResources.get('help')) + '" style="margin-left:2px;cursor:help;' +
		'opacity:0.5;width:16px;height:16px;" valign="bottom" src="' + Editor.helpImage + '" style=""/></a></div>');
};

/**
 * Shows a conflict dialog to the user.
 */
DrawioFile.prototype.showRefreshDialog = function(success, error)
{
	// Allows for escape key to be pressed while dialog is showing
	this.addConflictStatus(mxUtils.bind(this, function()
	{
		this.showRefreshDialog(success, error);
	}));
	
	this.ui.showError(mxResources.get('error'),
		mxResources.get('checksum'),
		mxResources.get('makeCopy'), mxUtils.bind(this, function()
	{
		this.copyFile(success, error);
	}), null, mxResources.get('refresh'), mxUtils.bind(this, function()
	{
		this.reloadFile(success);
	}), mxResources.get('cancel'), mxUtils.bind(this, function()
	{
		this.ui.hideDialog();
	}), 360, 150);
};

/**
 * Shows a dialog with no synchronize option.
 */
DrawioFile.prototype.showCopyDialog = function(success, error, overwrite)
{
	this.inConflictState = false;
	this.addUnsavedStatus();
	
	this.ui.showError(mxResources.get('externalChanges'),
		mxResources.get('fileChangedOverwriteDialog'),
		mxResources.get('makeCopy'), mxUtils.bind(this, function()
		{
			this.copyFile(success, error);
		}), null, mxResources.get('overwrite'), overwrite,
		mxResources.get('cancel'), mxUtils.bind(this, function()
	{
		this.ui.hideDialog();
	}), 360, (this.constructor == DriveFile) ? 180 : 150);
	
	// Adds important notice to dialog
	if (this.ui.dialog != null && this.ui.dialog.container != null &&
		this.constructor == DriveFile)
	{
		var alert = this.ui.createRealtimeNotice();
		alert.style.left = '0';
		alert.style.right = '0';
		alert.style.borderRadius = '0';
		alert.style.borderLeftStyle = 'none';
		alert.style.borderRightStyle = 'none';
		alert.style.marginBottom = '26px';
		alert.style.padding = '8px 0 8px 0';

		this.ui.dialog.container.appendChild(alert);
	}
};

/**
 * Shows a conflict dialog to the user.
 */
DrawioFile.prototype.showConflictDialog = function(overwrite, synchronize)
{
	this.ui.showError(mxResources.get('externalChanges'),
		mxResources.get('fileChangedSyncDialog'),
		mxResources.get('overwrite'), overwrite, null,
		mxResources.get('synchronize'), synchronize,
		mxResources.get('cancel'), mxUtils.bind(this, function()
	{
		this.ui.hideDialog();
		this.handleFileError(null, false);
	}), 340, 150);
};

/**
 * Checks if the client is authorized and calls the next step.
 */
DrawioFile.prototype.redirectToNewApp = function(error)
{
	this.ui.spinner.stop();
	
	if (!this.redirectDialogShowing)
	{
		this.redirectDialogShowing = true;
		
		var url = window.location.protocol + '//' + window.location.host + '/' + this.ui.getSearch(
			['create', 'title', 'mode', 'url', 'drive', 'splash', 'state']) + '#' + this.getHash();
		
		var redirect = mxUtils.bind(this, function()
		{
			this.ui.spinner.spin(document.body, mxResources.get('loading'));
			this.redirectDialogShowing = false;
			
			if (window.location.href == url)
			{
				window.location.reload();
			}
			else
			{
				window.location.href = url;
			}
		});
		
		if (error != null)
		{
			this.ui.confirm(mxResources.get('redirectToNewApp'), redirect, mxUtils.bind(this, function()
			{
				this.redirectDialogShowing = false;
				
				if (error != null)
				{
					error();
				}
			}));
		}
		else
		{
			this.ui.alert(mxResources.get('redirectToNewApp'), redirect);
		}
	}
};

/**
 * Adds the listener for automatically saving the diagram for local changes.
 */
DrawioFile.prototype.handleFileSuccess = function(saved)
{
	this.ui.spinner.stop();
	
	if (this.ui.getCurrentFile() == this)
	{
		if (this.isModified())
		{
			this.fileChanged();
		}
		else if (this.sync != null)
		{
			this.sync.updateStatus();
			
			if (this.sync.remoteFileChanged)
			{
				this.sync.remoteFileChanged = false;
				this.sync.fileChangedNotify();
			}
		}
		else if (saved)
		{
			this.addAllSavedStatus();
		}
		else
		{
			this.ui.editor.setStatus('');
		}
	}
};

/**
 * Adds the listener for automatically saving the diagram for local changes.
 */
DrawioFile.prototype.handleFileError = function(err, manual)
{
	this.ui.spinner.stop();
	
	if (this.ui.getCurrentFile() == this)
	{
		if (this.inConflictState)
		{
			this.handleConflictError(err, manual);
		}
		else
		{
			if (this.isModified())
			{
				this.addUnsavedStatus(err);
			}
			
			if (manual)
			{
				this.ui.handleError(err, (err != null) ? mxResources.get('errorSavingFile') : null);
			}
			else if (!this.isModified())
			{
				var msg = (err != null) ? ((err.error != null) ? err.error.message : err.message) : null;
				
				if (msg != null && msg.length > 60)
				{
					msg = msg.substring(0, 60) + '...';
				}
				
				this.ui.editor.setStatus('<div class="geStatusAlert" style="cursor:pointer;overflow:hidden;">' +
					mxUtils.htmlEntities(mxResources.get('error')) +
					((msg != null) ? ' (' + mxUtils.htmlEntities(msg) + ')' : '') + '</div>');
			}
		}
	}
};

/**
 * Adds the listener for automatically saving the diagram for local changes.
 */
DrawioFile.prototype.handleConflictError = function(err, manual)
{
	var success = mxUtils.bind(this, function()
	{
		this.handleFileSuccess(true);
	});
	
	var error = mxUtils.bind(this, function(err2)
	{
		this.handleFileError(err2, true);
	});
		
	var overwrite = mxUtils.bind(this, function()
	{
		if (this.ui.spinner.spin(document.body, mxResources.get('saving')))
		{
			this.ui.editor.setStatus('');
			this.save(true, success, error, null, true, (this.constructor ==
				GitHubFile && err != null) ? err.commitMessage : null)
		}
	});

	var synchronize = mxUtils.bind(this, function()
	{
		if (this.ui.spinner.spin(document.body, mxResources.get('updatingDocument')))
		{
			this.synchronizeFile(mxUtils.bind(this, function()
			{
				this.ui.spinner.stop();
				
				if (this.ui.spinner.spin(document.body, mxResources.get('saving')))
				{
					this.save(true, success, error, null, null, (this.constructor ==
						GitHubFile && err != null) ? err.commitMessage : null)
				}
			}), error);
		}
	})
	
	if (DrawioFile.SYNC == 'none')
	{
		this.showCopyDialog(success, error, overwrite);
	}
	else if (this.invalidChecksum)
	{
		this.showRefreshDialog(success, error);
	}
	else if (manual)
	{
		this.showConflictDialog(overwrite, synchronize);
	}
	else
	{
		this.addConflictStatus(mxUtils.bind(this, function()
		{
			this.ui.editor.setStatus(mxUtils.htmlEntities(
				mxResources.get('updatingDocument')));
			this.synchronizeFile(success, error);
		}), this.getErrorMessage(err));
	}
};

/**
 * Adds the listener for automatically saving the diagram for local changes.
 */
DrawioFile.prototype.getErrorMessage = function(err)
{
	return (err != null) ? ((err.error != null) ? err.error.message : err.message) : null
};

/**
 * Adds the listener for automatically saving the diagram for local changes.
 */
DrawioFile.prototype.fileChanged = function()
{
	this.setModified(true);
	
	if (this.isAutosave())
	{
		this.ui.editor.setStatus(mxUtils.htmlEntities(mxResources.get('saving')) + '...');
		
		this.autosave(this.autosaveDelay, this.maxAutosaveDelay, mxUtils.bind(this, function(resp)
		{
			// Does not update status if another autosave was scheduled
			if (this.autosaveThread == null)
			{
				this.handleFileSuccess(true);
			}
		}), mxUtils.bind(this, function(err)
		{
			this.handleFileError(err);
		}));
	}
	else if ((!this.isAutosaveOptional() || !this.ui.editor.autosave) &&
		!this.inConflictState)
	{
		this.addUnsavedStatus();
	}
};

/**
 * Invokes sync and updates shadow document.
 */
DrawioFile.prototype.fileSaved = function(savedData, lastDesc)
{
	this.inConflictState = false;
	
	if (this.sync == null)
	{
		this.shadowData = savedData;
		this.shadowPages = null;
	}
	else
	{
		var savedPages = this.ui.getPagesForNode(
			mxUtils.parseXml(savedData).documentElement);
		this.sync.fileSaved(savedPages, lastDesc);
		this.shadowPages = savedPages;
	}
};

/**
 * Adds the listener for automatically saving the diagram for local changes.
 */
DrawioFile.prototype.autosave = function(delay, maxDelay, success, error)
{
	if (this.lastAutosave == null)
	{
		this.lastAutosave = new Date().getTime();
	}
	
	var tmp = (new Date().getTime() - this.lastAutosave < maxDelay) ? delay : 0;
	this.clearAutosave();
	
	// Starts new timer or executes immediately if not unsaved for maxDelay
	var thread = window.setTimeout(mxUtils.bind(this, function()
	{
		this.lastAutosave = null;
		
		if (this.autosaveThread == thread)
		{
			this.autosaveThread = null;
		}
		
		// Workaround for duplicate save if UI is blocking
		// after save while pending autosave triggers
		if (this.isModified() && this.isAutosaveNow())
		{
			var rev = this.isAutosaveRevision();
			
			if (rev)
			{
				this.lastAutosaveRevision = new Date().getTime();
			}
			
			this.save(rev, mxUtils.bind(this, function(resp)
			{
				this.autosaveCompleted();
				
				if (success != null)
				{
					success(resp);
				}
			}), mxUtils.bind(this, function(resp)
			{
				if (error != null)
				{
					error(resp);
				}
			}));
		}
		else
		{
			if (!this.isModified())
			{
				this.ui.editor.setStatus('');
			}
			
			if (success != null)
			{
				success(null);
			}
		}
	}), tmp);

	this.autosaveThread = thread;
};

/**
 * Returns true if an autosave is required at the time of execution.
 * This implementation returns true.
 */
DrawioFile.prototype.isAutosaveNow = function()
{
	return true;
};

/**
 * Hooks for subclassers after the autosave has completed.
 */
DrawioFile.prototype.autosaveCompleted = function() { };

/**
 * Adds the listener for automatically saving the diagram for local changes.
 */
DrawioFile.prototype.clearAutosave = function()
{
	if (this.autosaveThread != null)
	{
		window.clearTimeout(this.autosaveThread);
		this.autosaveThread = null;
	}
};

/**
 * Returns the location as a new object.
 * @type mx.Point
 */
DrawioFile.prototype.isAutosaveRevision = function()
{
	var now = new Date().getTime();
	
	return (this.lastAutosaveRevision == null) || (now - this.lastAutosaveRevision) > this.maxAutosaveRevisionDelay;
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
DrawioFile.prototype.descriptorChanged = function()
{
	this.fireEvent(new mxEventObject('descriptorChanged'));
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
DrawioFile.prototype.contentChanged = function()
{
	this.fireEvent(new mxEventObject('contentChanged'));
};

/**
 * Returns the location as a new object.
 */
DrawioFile.prototype.close = function(unloading)
{
	if (this.isAutosave() && this.isModified())
	{
		this.save(this.isAutosaveRevision(), null, null, unloading);
	}

	this.destroy();
};

/**
 * Returns the location as a new object.
 */
DrawioFile.prototype.hasSameExtension = function(title, newTitle)
{
	if (title != null && newTitle != null)
	{
		var dot = title.lastIndexOf('.');
		var ext = (dot > 0) ? title.substring(dot) : '';
		dot = newTitle.lastIndexOf('.');

		return ext === ((dot > 0) ? newTitle.substring(dot) : '');
	}
	
	return title == newTitle;
};

/**
 * Removes the change listener.
 */
DrawioFile.prototype.removeListeners = function()
{
	if (this.changeListener != null)
	{
		this.ui.editor.graph.model.removeListener(this.changeListener);
		this.ui.editor.graph.removeListener(this.changeListener);
		this.ui.removeListener(this.changeListener);
		this.changeListener = null;
	}
};

/**
 * Stops any pending autosaves and removes all listeners.
 */
DrawioFile.prototype.destroy = function()
{
	this.clearAutosave();
	this.removeListeners();

	if (this.sync != null)
	{
		this.sync.destroy();
		this.sync = null;
	}
};
