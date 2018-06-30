import { Storage } from '@ionic/storage';
import { IMap } from './maps';
import { IDName, IIDName, IIDNameReadonly } from './id-name';
import { Person, IPerson, IPersonReadonly } from './person';
import { PersonList, IPersonListReadonly } from './person-list';
import { Item, IItem, IItemReadonly } from './item';
import { ItemList, IItemListReadonly } from './item-list';
import { Orders, IOrders, IOrdersReadonly } from './orders';
import { IMath, IMathBasic, IMathAdvanced, IMathAdvancedFinancer, IMathAdvancedPerson, IMathAdvancedFinancerItem, IMathAdvancedPersonItem, IMathBasicFinancer } from './math';
import { ListHelpers } from './list-helpers';
import { ValidationHelpers } from './validation-helpers';

export enum SplitType {
	BASIC    = 'BASIC',
	ADVANCED = 'ADVANCED',
}
export enum SplitStage {
	BASIC    = 0x01,
	PERSONS  = 0x02,
	ITEMS    = 0x04,
	EXTRAS   = 0x08,
	REPORT   = 0x10,
	COMPLETE = 0x20,
}
export interface ISplitEntry extends IIDName {
	timestamp : number;
	type      : SplitType;
	stage     : SplitStage;
}

export interface ISplit extends ISplitEntry {
	personList : IPerson[];
	itemList   : IItem[];
	orders     : IOrders;
	billAmount : number;
	extras     : number;
	math       : IMath;
}
export interface ISplitReadonly extends IIDNameReadonly {

	readonly isDirty    : boolean;
	readonly isSaved    : boolean;
	readonly timestamp  : number;
	readonly type       : SplitType;
	readonly stage      : SplitStage;
	readonly personList : IPersonListReadonly;
	readonly itemList   : IItemListReadonly;
	readonly orders     : IOrdersReadonly;
	readonly billAmount : number;
	readonly extras     : number;
	readonly grandTotal : number;
	readonly change     : number;
	readonly math       : IMath;
	toJSON(): ISplit;
	hasStage(stage: SplitStage): boolean;

}

export class Split extends IDName implements ISplitReadonly {

	private _isDirty    : boolean    = false;
	private _isSaved    : boolean    = false;
	private _timestamp  : number     = Date.now();
	private _type       : SplitType  = SplitType.BASIC;
	private _stage      : SplitStage = SplitStage.BASIC;
	private _personList : PersonList = new PersonList();
	private _itemList   : ItemList   = new ItemList();
	private _orders     : Orders     = new Orders();
	private _billAmount : number     = 0;
	private _extras     : number     = 0;
	private _math       : IMath      = null;

	get isDirty() { return this._isDirty || this.personList.isDirty || this.itemList.isDirty || this.orders.isDirty }
	get isSaved() { return this._isSaved }
	get timestamp() { return this._timestamp }
	get type() { return this._type }
	get stage() { return this._stage }
	get personList(): IPersonListReadonly { return this._personList }
	get itemList(): IItemListReadonly { return this._itemList }
	get orders(): IOrdersReadonly { return this._orders }
	get billAmount() { return this._billAmount }
	get extras() { return this._extras }
	get grandTotal() { return this.extras + ((this.type === SplitType.BASIC) ? this.billAmount : this.itemList.totalAmount) }
	get change() { return this.personList.totalAmountPooled - this.grandTotal }
	get math() { return this._math }

	set type(value) {
		if (this.type === value) return;
		this._type = value;
		this._isDirty = true;
	}
	set stage(value) {
		if (this.stage === value) return;
		this._stage = value;
		this._isDirty = true;
	}
	setBillAmount(value): boolean {
		value = +value;
		if (!ValidationHelpers.isPositive(value, false)) return false;
		if (this.billAmount === value) return false;
		if (this.type !== SplitType.BASIC) return false;
		this._billAmount = value;
		this._isDirty = true;
		return true;
	}
	setExtras(value): boolean {
		value = +value;
		if (!ValidationHelpers.isZeroOrPositive(value, false)) return false;
		if (this.extras === value) return false;
		this._extras = value;
		this._isDirty = true;
		return true;
	}
	setNumPersons(value, nextName: () => string): boolean {
		value = +value;
		if (!ValidationHelpers.isZeroOrPositiveInteger(value, false)) return false;
		if (this.personList.numPersons === value) return false;
		while(this.personList.numPersons > value) {
			this._personList.remove(this._personList.persons[this.personList.numPersons - 1] as Person);
		}
		while(this.personList.numPersons < value) {
			let name = nextName();
			if (!this.personList.hasName(name)) {
				this._personList.add(name);
			}
		}
		return true;
	}

	toJSON(): ISplit {
		return {
			id         : this.id,
			name       : this.name,
			timestamp  : this.timestamp,
			type       : this.type,
			stage      : this.stage,
			personList : this.personList.toJSON(),
			itemList   : this.itemList.toJSON(),
			orders     : this.orders.toJSON(),
			billAmount : this.billAmount,
			extras     : this.extras,
			math       : this.math,
		}
	}
	static fromJSON(json: ISplit): Split {
		let ret = new Split(json.id);
		ret.name        = json.name;
		ret._timestamp  = json.timestamp;
		ret._type       = json.type;
		ret._stage      = json.stage;
		ret._personList = PersonList.fromJSON(json.personList);
		ret._itemList   = ItemList.fromJSON(json.itemList);
		ret._orders     = Orders.fromJSON(json.orders, ret.personList, ret.itemList);
		ret._billAmount = json.billAmount;
		ret._extras     = json.extras;
		ret._math       = json.math;
		return ret;
	}

	hasStage(stage: SplitStage): boolean { return (this.stage & stage) === stage }
	markDirty() { this._isDirty = true }
	markClean() { this._isDirty = false; this._personList.markClean(); this._itemList.markClean(); this._orders.markClean(); }

	personAdd(name: string): IPersonReadonly { return this._personList.add(name) }
	personSetName(person: IPersonReadonly, name: string) { return this._personList.setName(person as Person, name) }
	personSetPooledAmount(person: IPersonReadonly, value: number) { return this._personList.setPooledAmount(person as Person, value) }
	personRemove(person: IPersonReadonly) { return this._personList.remove(person as Person) && (this._orders.removePerson(person as Person) || true) }
	personMarkDependant(person: IPersonReadonly, dependant: IPersonReadonly, value: boolean) { return this._personList.markAsDependantFor(person as Person, dependant as Person, value) }
	personGetPossibleDependants(person: IPersonReadonly) { return this.personList.getPossibleDependantsFor(person) }
	personsSort() { this._personList.sort() }
	personsClear() { this._personList.clear(); this._orders.clear() }

	itemAdd(name: string, amount: number, quantity: number) { return this._itemList.add(name, amount, quantity) }
	itemSetName(item: IItemReadonly, name: string) { return this._itemList.setName(item as Item, name) }
	itemSetAmount(item: IItemReadonly, value) { return this._itemList.setAmount(item as Item, value) }
	itemSetQuantity(item: IItemReadonly, value) { return this._itemList.setQuantity(item as Item, value) }
	itemRemove(item: IItemReadonly) { return this._itemList.remove(item as Item) && this._orders.removeItem(item as Item) }
	itemsSort() { this._itemList.sort() }
	itemsClear() { this._itemList.clear(); this._orders.clear() }

	orderMark(person: IPersonReadonly, item: IItemReadonly, value: boolean) { return this._orders.markOrder(person, item, value) }
	ordersClear() { this._orders.clear() }

	private static async _loadEntries(storage: Storage, key: string): Promise<IMap<ISplitEntry>> {
		return await storage.get(key) || {};
	}
	private static async _saveEntries(storage: Storage, key: string, map: IMap<ISplitEntry>): Promise<void> {
		return await storage.set(key, map);
	}
	private static async _loadData(storage: Storage, key: string): Promise<ISplit> {
		return await storage.get(key) || null;
	}
	private static async _saveData(storage: Storage, key: string, data: ISplit): Promise<void> {
		return await storage.set(key, data);
	}
	private static async _removeData(storage: Storage, key: string): Promise<void> {
		return await storage.remove(key);
	}
	static loadEntries(storage: Storage, key: string): Promise<IMap<ISplitEntry>> {
		return Split._loadEntries(storage, key);
	}
	static async renameEntry(storage: Storage, key: string, id: string, name: string): Promise<void> {
		let map = await Split._loadEntries(storage, key);
		let json = await Split._loadData(storage, id);
		if (!map[id] || !json) return;
		map[id].timestamp = +Date.now();
		map[id].name      = name;
		json.name         = map[id].name;
		json.timestamp    = map[id].timestamp;
		await Split._saveEntries(storage, key, map);
		return await Split._saveData(storage, id, json);
	}
	static async load(storage: Storage, key: string): Promise<Split> {
		let json = await Split._loadData(storage, key);
		if (!json) return null;
		let ret = Split.fromJSON(json);
		ret._isSaved = true;
		return ret;
	}
	async save(storage: Storage, key: string): Promise<void> {
		this._isDirty = false;
		let timestamp = Date.now();
		let map = await Split._loadEntries(storage, key);
		this._timestamp = timestamp;
		map[this.id] = { id: this.id, name: this.name, timestamp: timestamp, type: this.type, stage: this.stage };
		await Split._saveEntries(storage, key, map);
		await Split._saveData(storage, this.id, this.toJSON());
		this._isSaved = true;
		this._isDirty = false;
		this._personList.markClean();
		this._itemList.markClean();
		this._orders.markClean();
	}
	static async remove(storage: Storage, key: string, id: string): Promise<void> {
		let map = await Split._loadEntries(storage, key);
		delete map[id];
		await Split._saveEntries(storage, key, map);
		return await Split._removeData(storage, id);
	}

	updateMath() {
		let grandTotal   = this.grandTotal;
		let amountPooled = this.personList.totalAmountPooled;
		let numFinancers = this.personList.numFinancers;
		let numPersons   = this.personList.numPersons;
		let mathBasic    : IMathBasic     = null;
		let mathAdvanced : IMathAdvanced  = null;

		if (this.type === SplitType.BASIC) {
			let perHead = grandTotal / numPersons;
			let financers: IMathBasicFinancer[] = this.personList.financers.map(f => {
					let dependantIDs = Object.keys(f.dependantsMap);
					let grandTotal   = perHead * (1 + dependantIDs.length);
					return {
						id           : f.id,
						dependantIDs : dependantIDs,
						amountPooled : f.amountPooled,
						grandTotal   : grandTotal,
						change       : f.amountPooled - grandTotal,
					}
				})
			mathBasic = {
				billAmount : this.billAmount,
				perHead    : perHead,
				financerIDs: this.personList.financers.map(f => f.id),
				financerMap: ListHelpers.toMap(financers),
			}
		}
		else {
			let itemsTotal = this.itemList.totalAmount;
			let itemOrdersMap  : IMap<string[]>          = {};
			let itemPerHeadMap : IMap<number>            = {};
			let financerMap    : IMap<IMathAdvancedFinancer> = {};
			let personMap      : IMap<IMathAdvancedPerson>   = {};
			Object.keys(this.itemList.itemsMap).forEach(itemID => {
				let item    = this.itemList.itemsMap[itemID];
				let persons = this.orders.getOrdersForItem(item);
				itemOrdersMap[itemID]  = persons.map(it => it.id);
				itemPerHeadMap[itemID] = item.total / persons.length;
			})
			Object.keys(this.personList.personsMap).forEach(personID => {
				let itemsSubTotal = 0;
				let itemsMap: IMap<IMathAdvancedPersonItem> = {};
				Object.keys(itemOrdersMap).forEach(itemID => {
					if (!itemOrdersMap[itemID]) return;
					if (itemOrdersMap[itemID].indexOf(personID) === -1) return;
					itemsMap[itemID] = {
						id       : itemID,
						sharedBy : itemOrdersMap[itemID],
						perHead  : itemPerHeadMap[itemID],
					}
					itemsSubTotal += itemPerHeadMap[itemID];
				})
				let extras = this.extras * itemsSubTotal / itemsTotal;
				personMap[personID] = {
					id         : personID,
					items      : ListHelpers.toList(itemsMap),
					itemsTotal : itemsSubTotal,
					extras     : extras,
					grandTotal : itemsSubTotal + extras,
				}
			})
			Object.keys(this.personList.financersMap).forEach(financerID => {
				let financer   = this.personList.financersMap[financerID];
				let dependants = financer.dependants;
				let team       = [financer].concat(financer.dependants);
				let teamIDs    = team.map(it => it.id);
				let itemsMap: IMap<IMathAdvancedFinancerItem> = {};
				Object.keys(itemOrdersMap).forEach(itemID => {
					let sharedBy   = itemOrdersMap[itemID];
					let sharedByUs = ListHelpers.listIntersect(sharedBy, teamIDs);
					if (sharedByUs.length === 0) return;
					let sharedByOthers = ListHelpers.listSubtract(sharedBy, teamIDs);
					itemsMap[itemID] = {
						id             : itemID,
						sharedBy       : sharedBy,
						sharedByUs     : sharedByUs,
						sharedByOthers : sharedByOthers,
						perHead        : itemPerHeadMap[itemID],
					}
				})
				let itemsSubTotal = teamIDs.map(it => personMap[it].itemsTotal).reduce((sum, value) => sum + value, 0);
				let extras = teamIDs.map(it => personMap[it].extras).reduce((sum, value) => sum + value, 0);
				financerMap[financerID] = {
					me           : personMap[financerID],
					dependants   : dependants.map(it => personMap[it.id]),
					amountPooled : financer.amountPooled,
					itemsTotal   : itemsSubTotal,
					extras       : extras,
					grandTotal   : itemsSubTotal + extras,
					change       : financer.amountPooled - itemsSubTotal - extras,
					items        : ListHelpers.toList(itemsMap),
				}
			})
			mathAdvanced = {
				itemsTotal  : itemsTotal,
				numItems    : this.itemList.items.length,
				financerIDs : Object.keys(financerMap),
				financerMap : financerMap,
			}
		}

		let oldMath = this.math;
		this._math = {
			type         : this.type,
			extras       : this.extras,
			grandTotal   : grandTotal,
			amountPooled : amountPooled,
			change       : amountPooled - grandTotal,
			numPersons   : numPersons,
			numFinancers : numFinancers,
			basic        : mathBasic,
			advanced     : mathAdvanced,
		}
		if (JSON.stringify(oldMath) !== JSON.stringify(this.math)) {
			this._isDirty = true;
		}
	}

}
