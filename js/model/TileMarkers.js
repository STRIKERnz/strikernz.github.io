'use strict';

import {Path} from './Path.js';

export class TileMarkers extends Path {

    constructor(map) {
        super(map);
        this.markers = [];
    }

    add(position, color, label) {
        if (this.contains(position)) {
            return false;
        }

        this.positions.push(position);
        var rectangle = position.toLeaflet(this.map, this._styleFromARGB(color));
        this.featureGroup.addLayer(rectangle);
        this.rectangles.push(rectangle);
        this.markers.push({
            color: color || '#FFFFFFFF',
            label: label || ''
        });

        return true;
    }

    removeLast() {
        if (this.positions.length > 0) this.positions.pop();
        if (this.rectangles.length > 0) this.featureGroup.removeLayer(this.rectangles.pop());
        if (this.markers.length > 0) this.markers.pop();
    }

    remove(position) {
        var index = this.indexOf(position);
        if (index === -1) {
            return false;
        }

        this.featureGroup.removeLayer(this.rectangles[index]);
        this.positions.splice(index, 1);
        this.rectangles.splice(index, 1);
        this.markers.splice(index, 1);
        return true;
    }

    removeAll() {
        while (this.positions.length > 0) this.positions.pop();
        while (this.rectangles.length > 0) this.featureGroup.removeLayer(this.rectangles.pop());
        this.markers = [];
    }

    contains(position) {
        return this.indexOf(position) !== -1;
    }

    indexOf(position) {
        for (var i = 0; i < this.positions.length; i++) {
            if (this.positions[i].equals(position)) {
                return i;
            }
        }

        return -1;
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
                opacity: 1,
                bubblingMouseEvents: false,
                interactive: true
            };
        }

        return {
            color: '#FFFFFF',
            fillColor: '#FFFFFF',
            fillOpacity: 1,
            opacity: 1,
            bubblingMouseEvents: false,
            interactive: true
        };
    }
}
