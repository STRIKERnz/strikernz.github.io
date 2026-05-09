'use strict';

import {Converter} from '../converter.js';
import {Position} from '../../model/Position.js';
import {Region} from '../../model/Region.js';

export class RuneLiteTileMarkersConverter extends Converter {

    toJava(tileMarkers) {
        return this.toRaw(tileMarkers);
    }

    fromJava(text, tileMarkers) {
        tileMarkers.removeAll();

        var cleanedText = text
            .trim()
            .replace(/^`+/, '')
            .replace(/`+$/, '');

        var markers;
        try {
            markers = JSON.parse(cleanedText);
        } catch (e) {
            return;
        }

        if (!Array.isArray(markers)) {
            return;
        }

        for (var i = 0; i < markers.length; i++) {
            var marker = markers[i];
            if (marker === undefined || marker === null) {
                continue;
            }

            if (marker.regionId === undefined || marker.regionX === undefined || marker.regionY === undefined) {
                continue;
            }

            var basePosition = new Region(Number(marker.regionId)).toPosition();
            var z = marker.z === undefined ? 0 : Number(marker.z);
            var color = typeof marker.color === 'string' ? marker.color : '#FFFFFFFF';
            var label = typeof marker.label === 'string' ? marker.label : '';
            tileMarkers.add(new Position(basePosition.x + Number(marker.regionX), basePosition.y + Number(marker.regionY), z), color, label);
        }
    }

    toRaw(tileMarkers) {
        var markers = [];

        for (var i = 0; i < tileMarkers.positions.length; i++) {
            var position = tileMarkers.positions[i];
            var region = Region.fromPosition(position);
            var markerMeta = tileMarkers.markers !== undefined ? tileMarkers.markers[i] : undefined;

            markers.push({
                regionId: region.id,
                regionX: position.x & 63,
                regionY: position.y & 63,
                z: Number(position.z),
                color: markerMeta !== undefined && typeof markerMeta.color === 'string' ? markerMeta.color : '#FFFFFFFF',
                label: markerMeta !== undefined && typeof markerMeta.label === 'string' ? markerMeta.label : ''
            });
        }

        return JSON.stringify(markers, null, 2);
    }
}
