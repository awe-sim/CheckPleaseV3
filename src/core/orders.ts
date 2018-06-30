import { IMap, IMapReadonly } from './maps';
import { IPersonReadonly } from './person';
import { IPersonListReadonly } from './person-list';
import { IItemReadonly } from './item';
import { IItemListReadonly } from './item-list';
import { IPersonAssignment } from './person-assignment';

export type IOrders = IMap<string[]>;
export interface IOrdersReadonly {
	readonly isDirty       : boolean;
	readonly personItemIDs : IMapReadonly<ReadonlyArray<string>>;
	toJSON(): IOrders;
	getPossibleOrdersFor(item: IItemReadonly, personList: IPersonListReadonly): IPersonAssignment[];
	getOrdersForPerson(person: IPersonReadonly, itemList: IItemListReadonly): IItemReadonly[];
	getOrdersForItems(item: IItemReadonly, personList: IPersonListReadonly): IPersonReadonly[];
	getOrphanItems(itemList: IItemListReadonly): IItemReadonly[];
}

export class Orders {

	private _isDirty       : boolean        = false;
	private _personItemIDs : IMap<string[]> = {};

	get isDirty() { return this._isDirty }
	get personItemIDs(): IMapReadonly<ReadonlyArray<string>> { return this._personItemIDs }

	toJSON(): IOrders {
		return this._personItemIDs;
	}
	static fromJSON(json: IOrders): Orders {
		let ret = new Orders();
		ret._personItemIDs = json;
		return ret;
	}

	markOrder(person: IPersonReadonly, item: IItemReadonly, value: boolean): boolean {
		if (value) {
			if ((this.personItemIDs[person.id] || []).indexOf(item.id) !== -1) return false;
			this._personItemIDs[person.id] = this._personItemIDs[person.id] || [];
			this._personItemIDs[person.id].push(item.id);
		}
		else {
			let index = (this.personItemIDs[person.id] || []).indexOf(item.id);
			if (index === -1) return false;
			this._personItemIDs[person.id].splice(index, 1);
			if (this.personItemIDs[person.id].length === 0) delete this._personItemIDs[person.id];
		}
		this._isDirty = true;
		return true;
	}
	removePerson(person: IPersonReadonly): boolean {
		if (!this.personItemIDs[person.id] || this.personItemIDs[person.id].length === 0) return false;
		delete this._personItemIDs[person.id];
		this._isDirty = true;
		return true;
	}
	removeItem(item: IItemReadonly): boolean {
		let done = false;
		Object.keys(this.personItemIDs).forEach(id => {
			let index = this.personItemIDs[id].indexOf(item.id);
			if (index === -1) return;
			this._personItemIDs[id].splice(index, 1);
			if (this.personItemIDs[id].length === 0) delete this._personItemIDs[id];
			done = true;
		})
		if (done) this._isDirty = true;
		return done;
	}
	clear() {
		this._personItemIDs = {};
		this._isDirty = true;
	}

	markClean() { this._isDirty = false }

	getPossibleOrdersFor(item: IItemReadonly, personList: IPersonListReadonly): IPersonAssignment[] {
		return personList.persons.map(person => {
			let isChecked = this.hasOrderFor(person, item);
			return {
				person     : person,
				wasChecked : isChecked,
				checked    : isChecked,
			}
		})
	}

	getOrdersForPerson(person: IPersonReadonly, itemList: IItemListReadonly): IItemReadonly[] {
		if (!this.personItemIDs[person.id] || this.personItemIDs[person.id].length === 0) return [];
		return itemList.items.filter(it => this.personItemIDs[person.id].indexOf(it.id) !== -1);
	}
	getOrdersForItems(item: IItemReadonly, personList: IPersonListReadonly): IPersonReadonly[] {
		return personList.persons.filter(it => (this.personItemIDs[it.id] || []).indexOf(item.id) !== -1);
	}
	hasOrderFor(person: IPersonReadonly, item: IItemReadonly): boolean {
		return (this.personItemIDs[person.id] || []).indexOf(item.id) !== -1;
	}
	getOrphanItems(itemList: IItemListReadonly): IItemReadonly[] {
		return itemList.items.filter(it => Object.keys(this.personItemIDs).every(id => this.personItemIDs[id].indexOf(it.id) === -1));
	}

}
