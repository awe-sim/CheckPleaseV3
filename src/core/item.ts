import { IDName, IIDName, IIDNameReadonly } from './id-name';

export interface IItem extends IIDName {
	amount   : number;
	quantity : number;
}
export interface IItemReadonly extends IIDNameReadonly {
	readonly amount   : number;
	readonly quantity : number;
	readonly total    : number;
	toJSON(): IItem;
}

export class Item extends IDName implements IItemReadonly {

	amount   : number = 0;
	quantity : number = 1;

	constructor(id?: string) {
		super(id);
	}

	get total() { return this.amount * this.quantity }

	toJSON(): IItem {
		return {
			id       : this.id,
			name     : this.name,
			amount   : this.amount,
			quantity : this.quantity,
		}
	}
	static fromJSON(json: IItem): Item {
		let ret = new Item(json.id);
		ret.name     = json.name;
		ret.amount   = json.amount;
		ret.quantity = json.quantity;
		return ret;
	}

}
