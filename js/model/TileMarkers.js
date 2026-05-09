'use strict';

import {Path} from './Path.js';

export class TileMarkers extends Path {

    constructor(map) {
        super(map);
        this.markers = [];
    }

    add(position, color, label) {
        this.positions.push(position);
        var rectangle = position.toLeaflet(this.map);
        rectangle.setStyle(this._styleFromARGB(color));
        this.featureGroup.addLayer(rectangle);
        this.rectangles.push(rectangle);
        this.markers.push({
            color: color || '#FFFFFFFF',
            label: label || ''
        });
    }

    removeLast() {
        if (this.positions.length > 0) this.featureGroup.removeLayer(this.positions.pop());
        if (this.rectangles.length > 0) this.featureGroup.removeLayer(this.rectangles.pop());
        if (this.markers.length > 0) this.markers.pop();
    }

    removeAll() {
        while (this.positions.length > 0) this.featureGroup.removeLayer(this.positions.pop());
        while (this.rectangles.length > 0) this.featureGroup.removeLayer(this.rectangles.pop());
        this.markers = [];
    }

    _styleFromARGB(argb) {
        var raw = typeof argb === 'string' ? argb : '#FFFFFFFF';
        var value = raw.trim().toUpperCase();

        if (/^#[0-9A-F]{8}$/.test(value)) {
            var alpha = parseInt(value.substring(1, 3), 16) / 255;
            var rgb = `#${value.substring(3)}`;
            return {
                color: rgb,
                fillColor: rgb,
                fillOpacity: alpha,
                opacity: 1
            };
        }

        return {
            color: '#FFFFFF',
            fillColor: '#FFFFFF',
            fillOpacity: 1,
            opacity: 1
        };
    }
}
