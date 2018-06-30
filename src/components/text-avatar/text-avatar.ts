import { Component, Input } from '@angular/core';

const COLORS = [
	'#4db6ac',
	'#64b5f6',
	'#ffb74d',
	'#f06292',
	'#ff8a65',
	'#90a4ae',
	'#7986cb',
	'#4fc3f7',
	'#a1887f',
	'#ba68c8',
	'#9575cd',
	'#4dd0e1',
	'#aed581',
	'#81c784',
	'#d4e157',
	'#673ab7',
	'#e57373'
];

@Component({
	selector    : '[text-avatar]',
	templateUrl : 'text-avatar.html'
})
export class TextAvatarComponent {

	private _shape      : 'CIRCLE' | 'SQUARE' = 'CIRCLE';
	private _size       : 'LARGE' | 'SMALL' = 'LARGE';
	private _text       : string;
	private _id         : string;
	private _color      : string;
	private _background : string;

	get shape()      { return this._shape }
	get size()       { return  this._size }
	get text()       { return this._text }
	get id()         { return this._id }
	get color()      { return this._color }
	get background() { return this._background }

	@Input() set shape(value) { this._shape = value }
	@Input() set size(value)  { this._size = value }
	@Input() set text(value)  { this._text = value }
	@Input() set id(value)    { this._id = value; this._makeBackground() }
	@Input() set color(value) { this._color = value; this._makeBackground() }

	private _makeBackground() {
		if (this.color) {
			this._background = this.color;
		}
		else {
			let hash = 0;
			for (let i=0; i<this.id.length; ++i) {
				hash = (hash << 5) - hash + this.id.charCodeAt(i);
			}
			this._background = COLORS[Math.abs(hash) % COLORS.length];
		}
	}

	constructor() {}

}
