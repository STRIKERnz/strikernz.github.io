'use strict';

import {Position} from '../model/Position.js';
import {TileMarkers} from '../model/TileMarkers.js';

import {RuneLiteTileMarkersConverter} from '../bot_api_converters/runelite/runelite_tile_markers_converter.js';

const converter = new RuneLiteTileMarkersConverter();
const DEFAULT_TILE_MARKER_COLOR = '#FFFF00';

export var CollectionControl = L.Control.extend({
    options: {
        position: 'topleft'
    },

    onAdd: function (map) {
        this._tileMarkers = new TileMarkers(map);

        this._currentDrawable = undefined;
        this._editing = false;

        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control noselect');
        container.classList.add('tile-marker-toolbar');
        container.style.height = 'auto';
        this._toolbarContainer = container;

        this._createControl('<i class="fa fa-copy"></i>', container, function() {
            this._copyCodeToClipboard();
        });

        this._createControl('<i class="fa fa-crosshairs" aria-hidden="true"></i>', container, function() {
            this._focusCurrentDrawable();
        });

        this._createControl('<i class="fa fa-cog"></i>', container, function() {
            if ($("#settings-panel").is(":visible")) {
                $("#settings-panel").hide("slide", {direction: "right"}, 300);
            } else {
                if (this._currentDrawable !== undefined) {
                    this._toggleCollectionMode();
                }

                $("#settings-panel").css('display', 'flex').hide();
                $("#settings-panel").show("slide", {direction: "right"}, 300);
            }
        });

        this._createControl('<img src="css/images/marker-icon-red.png" onerror="this.onerror=null;this.src=\'public/css/images/marker-icon-red.png\';" alt="Tile Markers" title="RuneLite Tile Markers" height="25" width="20">', container, function(e) {
            this._toggleCollectionMode(this._tileMarkers, e.target);
        });

        this._createMarkerEditor(container);

        this._createControl('<i class="fa fa-undo" aria-hidden="true"></i>', container, function() {
            if (this._currentDrawable !== undefined) {
                this._currentDrawable.removeLast();
                this._outputCode();
            }
        });

        this._createControl('<i class="fa fa-trash" aria-hidden="true"></i>', container, function() {
            if (this._currentDrawable !== undefined) {
                this._currentDrawable.removeAll();
                this._outputCode();
            }
        });

        L.DomEvent.disableClickPropagation(container);

        map.on('click', this._addPosition, this);

        var context = this;
        $("#code-output").on('input propertychange paste', () => context._loadFromText());

        return container;
    },

    _createControl: function(html, container, onClick) {
        var control = L.DomUtil.create('a', 'leaflet-bar leaflet-control leaflet-control-custom', container);
        control.innerHTML = html;
        L.DomEvent.on(control, 'click', onClick, this);
    },

    _createMarkerEditor: function(container) {
        var editor = L.DomUtil.create('div', 'tile-marker-editor', container);

        this._tileMarkerColorInput = L.DomUtil.create('input', 'tile-marker-editor-color', editor);
        this._tileMarkerColorInput.type = 'color';
        this._tileMarkerColorInput.value = DEFAULT_TILE_MARKER_COLOR;
        this._tileMarkerColorInput.title = 'Tile marker color';

        this._tileMarkerLabelInput = L.DomUtil.create('input', 'tile-marker-editor-label', editor);
        this._tileMarkerLabelInput.type = 'text';
        this._tileMarkerLabelInput.value = '';
        this._tileMarkerLabelInput.maxLength = 40;
        this._tileMarkerLabelInput.placeholder = 'Label';
        this._tileMarkerLabelInput.title = 'Tile marker label';

        L.DomEvent.disableClickPropagation(editor);
    },

    _addPosition: function(e) {
        if (!this._editing || this._currentDrawable === undefined) {
            return;
        }

        var position = Position.fromLatLng(this._map, e.latlng, this._map.plane);
        if (this._currentDrawable.contains(position)) {
            this._currentDrawable.remove(position);
            this._outputCode();
            return;
        }

        if (this._currentDrawable.add(position, this._selectedTileMarkerColor(), this._selectedTileMarkerLabel())) {
            this._outputCode();
        }
    },

    _toggleCollectionMode: function(drawable, element) {
        $("a.leaflet-control-custom.active").removeClass("active");

        if (this._currentDrawable === drawable || drawable === undefined) {
            this._editing = false;
            this._toolbarContainer.classList.remove('tile-marker-toolbar-active');
            this._restoreDoubleClickZoom();

            $("#code-output-panel").hide("slide", {direction: "right"}, 300);

            if (this._currentDrawable !== undefined) {
                this._map.removeLayer(this._currentDrawable.featureGroup);
            }

            this._currentDrawable = undefined;

            this._outputCode();
            return;
        }

        if ($("#settings-panel").is(":visible")) {
            $("#settings-panel").hide("slide", {direction: "right"}, 300);
        }

        this._editing = true;
        this._toolbarContainer.classList.add('tile-marker-toolbar-active');
        this._disableDoubleClickZoom();
        $(element).closest("a.leaflet-control-custom").addClass("active");

        $("#code-output-panel").show("slide", {direction: "right"}, 300);

        if (this._currentDrawable !== undefined) {
            this._map.removeLayer(this._currentDrawable.featureGroup);
        }

        this._currentDrawable = drawable;

        if (this._currentDrawable !== undefined) {
            this._map.addLayer(this._currentDrawable.featureGroup);
        }

        this._outputCode();
    },

    _disableDoubleClickZoom: function() {
        if (this._map.doubleClickZoom === undefined || !this._map.doubleClickZoom.enabled()) {
            this._restoreDoubleClickZoomOnExit = false;
            return;
        }

        this._restoreDoubleClickZoomOnExit = true;
        this._map.doubleClickZoom.disable();
    },

    _restoreDoubleClickZoom: function() {
        if (this._restoreDoubleClickZoomOnExit && this._map.doubleClickZoom !== undefined) {
            this._map.doubleClickZoom.enable();
        }

        this._restoreDoubleClickZoomOnExit = false;
    },

    _outputCode: function() {
        var output = "";

        if (this._currentDrawable !== undefined) {
            output = converter.toJava(this._currentDrawable);
        }

        $("#code-output").html(output);
    },

    _loadFromText: function() {
        if (this._currentDrawable !== undefined) {
            converter.fromJava($("#code-output").text(), this._currentDrawable);
            if ($("#auto-jump-on-import").is(":checked")) {
                this._fitToCurrentDrawable();
            }
        }
    },

    _copyCodeToClipboard: function() {
        var $temp = $("<textarea>");
        $("body").append($temp);
        $temp.val($("#code-output").text()).select();
        document.execCommand("copy");
        $temp.remove();

        Swal({
            position: 'top',
            type: 'success',
            title: 'Copied to clipboard',
            showConfirmButton: false,
            timer: 6000,
            toast: true,
        });
    },

    _focusCurrentDrawable: function() {
        if (this._currentDrawable === undefined) {
            return;
        }

        this._loadFromText();
        this._fitToCurrentDrawable();
    },

    _fitToCurrentDrawable: function() {
        var bounds = this._currentDrawable.featureGroup !== undefined ? this._currentDrawable.featureGroup.getBounds() : undefined;

        if ((bounds === undefined || !bounds.isValid()) && this._currentDrawable.positions !== undefined && this._currentDrawable.positions.length > 0) {
            var latLngs = [];
            for (var i = 0; i < this._currentDrawable.positions.length; i++) {
                latLngs.push(this._currentDrawable.positions[i].toCentreLatLng(this._map));
            }
            bounds = L.latLngBounds(latLngs);
        }

        if (bounds === undefined || !bounds.isValid()) {
            return;
        }

        this._map.fitBounds(bounds.pad(0.5), {maxZoom: 11});
    },

    _selectedTileMarkerColor: function() {
        var rgb = this._tileMarkerColorInput !== undefined ? this._tileMarkerColorInput.value : $("#tile-marker-color").val();
        if (typeof rgb !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(rgb)) {
            return '#FFFFFFFF';
        }

        return `#FF${rgb.substring(1).toUpperCase()}`;
    },

    _selectedTileMarkerLabel: function() {
        var label = this._tileMarkerLabelInput !== undefined ? this._tileMarkerLabelInput.value : $("#tile-marker-label").val();
        return typeof label === 'string' ? label : '';
    }
});
