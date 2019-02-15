(function () {
    Sidebar.prototype.addBardsirPalette = function (expand) {
        var s = mxConstants.STYLE_VERTICAL_LABEL_POSITION + '=bottom;outlineConnect=0;align=center;dashed=0;html=1;' + mxConstants.STYLE_VERTICAL_ALIGN + '=top;' + mxConstants.STYLE_SHAPE + "=mxgraph.bardsir.";
        var s2 = mxConstants.STYLE_VERTICAL_LABEL_POSITION + '=bottom;outlineConnect=0;align=center;dashed=0;html=1;' + mxConstants.STYLE_VERTICAL_ALIGN + '=top;' + mxConstants.STYLE_SHAPE + "=mxgraph.bardsir.";
        var s3 = mxConstants.STYLE_VERTICAL_LABEL_POSITION + '=bottom;outlineConnect=0;align=center;dashed=0;html=1;' + mxConstants.STYLE_VERTICAL_ALIGN + '=top;' + mxConstants.STYLE_SHAPE + "=mxgraph.pid2";
        var gn = 'mxgraph.bardsir';
        var dt = 'process instrumentation ';

        this.addPaletteFunctions('bardsirMisc', 'Bardsir', expand,
            [
                this.createVertexTemplateEntry('rounded=1;whiteSpace=wrap;align=center;dashed=0;html=1;', 60, 150, '', 'Rounded Rectangle', null, null, 'rounded rect rectangle box'),
                this.createVertexTemplateEntry('shape=trapezoid;rounded=1;perimeter=trapezoidPerimeter;whiteSpace=wrap;html=1;', 160, 80, '', 'Trapezoid'),
                this.createVertexTemplateEntry(s3 + 'misc.conveyor',
                200, 50, '', 'Conveyor', null, null, this.getTagsForStencil(gn, 'conveyor', dt).join(' ')),
                this.createVertexTemplateEntry(s2 + 'blower;',
                    152, 138, '', 'Blower, Fan', null, null, this.getTagsForStencil(gn, 'blower', dt).join(' ')),
                this.createVertexTemplateEntry(s2 + 'pump;',
                    141, 145, '', 'Pump', null, null, this.getTagsForStencil(gn, 'blower', dt).join(' ')),
                this.createVertexTemplateEntry(s2 + 'tank;',
                    40, 120, '', 'Tank', null, null, this.getTagsForStencil(gn, 'tank', dt).join(' ')),
                this.createVertexTemplateEntry(s2 + 'tank_with_packing;',
                    40, 120, '', 'Tank With Packing', null, null, this.getTagsForStencil(gn, 'tank_with_packing', dt).join(' ')),
                this.createVertexTemplateEntry(s2 + 'tee_pipe;',
                    68, 88, '', 'Tee Pipe', null, null, this.getTagsForStencil(gn, 'tee_pipe', dt).join(' ')),
                this.createVertexTemplateEntry(s2 + 'tower;',
                    81.1, 570, '', 'Tower', null, null, this.getTagsForStencil(gn, 'tower', dt).join(' ')),
                this.createVertexTemplateEntry(s2 + 'gear;',
                    115, 115, '', 'Gear', null, null, this.getTagsForStencil(gn, 'gear', dt).join(' ')),
                this.createVertexTemplateEntry(s2 + 'stainer;',
                    100, 100, '', 'Stainer', null, null, this.getTagsForStencil(gn, 'stainer', dt).join(' ')),
                this.createVertexTemplateEntry(s2 + 'pump_stainer;',
                    100, 100, '', 'Pump Stainer', null, null, this.getTagsForStencil(gn, 'pump_stainer', dt).join(' ')),
                this.createVertexTemplateEntry(s2 + 'compressor;',
                    180, 60, '', 'Compressor', null, null, this.getTagsForStencil(gn, 'compressor', dt).join(' '))
            ]);
    };

})();
