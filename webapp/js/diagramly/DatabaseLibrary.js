/**
 * Copyright (c) 2006-2017, JGraph Ltd
 * Copyright (c) 2006-2017, Gaudenz Alder
 */
DatabaseLibrary = function(ui, data, meta)
{
	DatabaseFile.call(this, ui, data, meta);
};

//Extends mxEventSource
mxUtils.extend(DatabaseLibrary, DatabaseFile);

/**
 * Overridden to avoid updating data with current file.
 */
DatabaseLibrary.prototype.doSave = function(title, success, error)
{
	this.saveFile(title, false, success, error);
};

/**
 * Returns the location as a new object.
 * @type mx.Point
 */
DatabaseLibrary.prototype.open = function()
{
	// Do nothing - this should never be called
};
