import { IMap, IMapReadonly, IMap2D, IMap2DReadonly } from './maps';
import { IPersonReadonly } from './person';
import { IPersonListReadonly } from './person-list';
import { IItemReadonly } from './item';
import { IItemListReadonly } from './item-list';
import { IPersonAssignment } from './person-assignment';

export type IOrders = {
	personItemIDs : IMap2D<boolean>;
	itemPersonIDs : IMap2D<boolean>;
}
export interface IOrdersReadonly {
	readonly isDirty       : boolean;
	readonly personItemIDs : IMap2DReadonly<boolean>;
	readonly itemPersonIDs : IMap2DReadonly<boolean>;
	readonly personItems   : IMapReadonly<ReadonlyArray<IItemReadonly>>;
	readonly itemPersons   : IMapReadonly<ReadonlyArray<IPersonReadonly>>;
	toJSON(): IOrders;
	getPossibleOrdersFor(item: IItemReadonly, personList: IPersonListReadonly): IPersonAssignment[];
	getOrdersForPerson(person: IPersonReadonly): ReadonlyArray<IItemReadonly>;
	getOrdersForItem(item: IItemReadonly): ReadonlyArray<IPersonReadonly>;
	getOrphanItems(itemList: IItemListReadonly): ReadonlyArray<IItemReadonly>;
}

export class Orders {

	private _isDirty       : boolean                 = false;
	private _personItemIDs : IMap2D<boolean>         = {};
	private _itemPersonIDs : IMap2D<boolean>         = {};
	private _personItems   : IMap<IItemReadonly[]>   = {};
	private _itemPersons   : IMap<IPersonReadonly[]> = {};

	get isDirty() { return this._isDirty }
	get personItemIDs(): IMap2DReadonly<boolean> { return this._personItemIDs }
	get itemPersonIDs(): IMap2DReadonly<boolean> { return this._itemPersonIDs }
	get personItems(): IMapReadonly<ReadonlyArray<IItemReadonly>> { return this._personItems }
	get itemPersons(): IMapReadonly<ReadonlyArray<IPersonReadonly>> { return this._itemPersons }

	toJSON(): IOrders {
		return {
			personItemIDs : this._personItemIDs,
			itemPersonIDs : this._itemPersonIDs,
		}
	}
	static fromJSON(json: IOrders, personList: IPersonListReadonly, itemList: IItemListReadonly): Orders {
		let ret = new Orders();
		ret._personItemIDs = json.personItemIDs;
		ret._itemPersonIDs = json.itemPersonIDs;
		Object.keys(ret.personItemIDs).forEach(pID => {
			ret._personItems[pID] = [];
			Object.keys(ret.personItemIDs[pID]).forEach(iID => {
				ret._personItems[pID].push(itemList.itemsMap[iID]);
			})
		})
		Object.keys(ret.itemPersonIDs).forEach(iID => {
			ret._itemPersons[iID] = [];
			Object.keys(ret.itemPersonIDs[iID]).forEach(pID => {
				ret._itemPersons[iID].push(personList.personsMap[pID]);
			})
		})
		return ret;
	}

	markOrder(person: IPersonReadonly, item: IItemReadonly, value: boolean): boolean {
		if (value) {
			if (this.personItemIDs[person.id] && this.personItemIDs[person.id][item.id]) return false;
			this._personItemIDs[person.id] = this._personItemIDs[person.id] || {};
			this._personItemIDs[person.id][item.id] = true;
			this._personItems[person.id] = this._personItems[person.id] || [];
			this._personItems[person.id].push(item);
			this._itemPersonIDs[item.id] = this._itemPersonIDs[item.id] || {};
			this._itemPersonIDs[item.id][person.id] = true;
			this._itemPersons[item.id] = this._itemPersons[item.id] || [];
			this._itemPersons[item.id].push(person);
		}
		else {
			if (!this.personItemIDs[person.id] || !this.personItemIDs[person.id][item.id]) return false;
			delete this._personItemIDs[person.id][item.id];
			if (Object.keys(this._personItemIDs[person.id]).length) delete this._personItemIDs[person.id];
			this._personItems[person.id].splice(this._personItems[person.id].indexOf(item), 1);
			if (this._personItems[person.id].length === 0) delete this._personItems[person.id];
			delete this._itemPersonIDs[item.id][person.id];
			if (Object.keys(this._itemPersonIDs[item.id]).length) delete this._itemPersonIDs[item.id];
			this._itemPersons[item.id].splice(this._itemPersons[item.id].indexOf(person), 1);
			if (this._itemPersons[item.id].length === 0) delete this._itemPersons[item.id];
		}
		this._isDirty = true;
		return true;
	}
	removePerson(person: IPersonReadonly): boolean {
		if (!this._personItemIDs[person.id]) return false;
		delete this._personItemIDs[person.id];
		delete this._personItems[person.id];
		Object.keys(this._itemPersonIDs).forEach(iID => {
			delete this._itemPersonIDs[iID][person.id];
			this._itemPersons[iID].splice(this._itemPersons[iID].indexOf(person), 1);
			if (Object.keys(this._itemPersonIDs[iID]).length === 0) {
				delete this._itemPersonIDs[iID];
				delete this._itemPersons[iID];
			}
		})
		this._isDirty = true;
		return true;
	}
	removeItem(item: IItemReadonly): boolean {
		if (!this._itemPersonIDs[item.id]) return false;
		delete this._itemPersonIDs[item.id];
		delete this._itemPersons[item.id];
		Object.keys(this._personItemIDs).forEach(pID => {
			delete this._personItemIDs[pID][item.id];
			this._personItems[pID].splice(this._personItems[pID].indexOf(item), 1);
			if (Object.keys(this._personItemIDs[pID]).length === 0) {
				delete this._personItemIDs[pID];
				delete this._personItems[pID];
			}
		})
		this._isDirty = true;
		return true;
	}
	clear() {
		this._personItemIDs = {};
		this._personItems   = {};
		this._itemPersonIDs = {};
		this._itemPersons   = {};
		this._isDirty       = true;
	}

	markClean() { this._isDirty = false }

	getPossibleOrdersFor(item: IItemReadonly, personList: IPersonListReadonly): IPersonAssignment[] {
		return personList.persons.map(person => {
			let isChecked = this.itemPersonIDs[item.id] && this.itemPersonIDs[item.id][person.id];
			return {
				person     : person,
				wasChecked : isChecked,
				checked    : isChecked,
			}
		})
	}

	getOrdersForPerson(person: IPersonReadonly): ReadonlyArray<IItemReadonly> {
		return this._personItems[person.id] || [];
	}
	getOrdersForItem(item: IItemReadonly): ReadonlyArray<IPersonReadonly> {
		return this._itemPersons[item.id] || [];
	}
	hasOrderFor(person: IPersonReadonly, item: IItemReadonly): boolean {
		return this.personItemIDs[person.id] && this.personItemIDs[person.id][item.id];
	}
	getOrphanItems(itemList: IItemListReadonly): ReadonlyArray<IItemReadonly> {
		return itemList.items.filter(it => !this.itemPersonIDs[it.id]);
	}

}
