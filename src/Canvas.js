'use strict';
/* globals document */

export default class Canvas {
    constructor(id, parent, width, height) {
        this.id = id;

        var canvas = document.createElement('canvas');
        this.W = canvas.width = width;
        this.H = canvas.height = height;

        if (parent === 'body') {
            document.body.appendChild(canvas);
        } else {
            document.getElementById(parent).appendChild(canvas);
        }


        this.ctx = canvas.getContext('webgl');
    }
}
