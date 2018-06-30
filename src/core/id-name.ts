import * as _ from 'lodash-uuid';

export interface IIDReadonly {
	readonly id: string;
}
export interface IIDName extends IIDReadonly {
	name: string;
}
export interface IIDNameReadonly extends IIDReadonly {
	readonly name     : string;
	readonly initials : string;
}

export class IDName implements IIDNameReadonly {

	readonly id       : string;
	private _name     : string;
	private _initials : string;

	get name() { return this._name }
	get initials() { return this._initials }

	constructor(id?: string) {
		this.id        = id || _.uuid();
		this._name     = '';
		this._initials = '';
	}

	set name(value) {
		this._name = (value || '').trim();
		let initials = this.name
			.toUpperCase()
			.split(/\W+/)
			.map(it => it.charAt(0));
		initials.splice(2);
		this._initials = initials.join('');
	}

}
