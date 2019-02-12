/**
 * $Id: mxBardsirMisc.js,v 1.4 2013/11/22 10:46:56 mate Exp $
 * Copyright (c) 2006-2013, JGraph Ltd
 */

//**********************************************************************************************************************************************************
//Conveyor
//**********************************************************************************************************************************************************
/**
 * Extends mxShape.
 */
function mxShapeBardsirConveyor(bounds, fill, stroke, strokewidth) {
    mxShape.call(this);
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};

/**
 * Extends mxShape.
 */
mxUtils.extend(mxShapeBardsirConveyor, mxShape);

mxShapeBardsirConveyor.prototype.cst = {
    SHAPE_CONVEYOR: 'mxgraph.bardsir.conveyor'
};

/**
 * Function: paintVertexShape
 *
 * Paints the vertex shape.
 */
mxShapeBardsirConveyor.prototype.paintVertexShape = function (c, x, y, w, h) {
    c.translate(x, y);
    this.background(c, x, y, w, h);
    c.setShadow(false);
};

mxShapeBardsirConveyor.prototype.background = function (c, x, y, w, h) {
    var wheelSize = Math.min(h, w * 0.5);

    c.begin();
    c.moveTo(wheelSize * 0.5, 0);
    c.lineTo(w - wheelSize * 0.5, 0);
    c.stroke();

    c.ellipse(0, 0, wheelSize, wheelSize);
    c.fillAndStroke();
    c.ellipse(w - wheelSize, 0, wheelSize, wheelSize);
    c.fillAndStroke();

    c.begin();
    c.moveTo(wheelSize * 0.5, wheelSize);
    c.lineTo(w - wheelSize * 0.5, wheelSize);
    c.stroke();

    //holders

    var dist = w - wheelSize * 1.8;
    var startX = wheelSize * 0.9;
    var step = wheelSize * 0.7;

    for (var i = 0; i < dist; i = i + step) {
        c.rect(startX + i, 0, wheelSize * 0.2, wheelSize * 0.1);
        c.fillAndStroke();
        c.rect(startX + i, wheelSize * 0.9, wheelSize * 0.2, wheelSize * 0.1);
        c.fillAndStroke();
    }

};

mxCellRenderer.registerShape(mxShapeBardsirConveyor.prototype.cst.SHAPE_CONVEYOR, mxShapeBardsirConveyor);
