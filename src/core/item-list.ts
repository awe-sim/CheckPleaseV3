import { IMap, IMapReadonly } from './maps';
import { Item, IItem, IItemReadonly } from './item';
import { ListHelpers } from './list-helpers';
import { ValidationHelpers } from './validation-helpers';

export interface IItemListReadonly {
	readonly isDirty     : boolean;
	readonly items       : ReadonlyArray<IItemReadonly>;
	readonly itemsMap    : IMapReadonly<IItemReadonly>;
	readonly numItems    : number;
	readonly totalAmount : number;
	toJSON(): IItem[];
}

export class ItemList implements IItemListReadonly {

	private _isDirty  : boolean    = false;
	private _items    : Item[]     = [];
	private _itemsMap : IMap<Item> = {};

	get isDirty() { return this._isDirty }
	get items(): ReadonlyArray<Item> { return this._items }
	get itemsMap(): IMapReadonly<Item> { return this._itemsMap }
	get numItems() { return this.items.length }
	get totalAmount() { return this.items.map(it => it.total).reduce((sum, value) => sum + value, 0) }

	toJSON(): IItem[] {
		return this.items.map(it => it.toJSON());
	}
	static fromJSON(json: IItem[]): ItemList {
		let ret = new ItemList();
		json.forEach(it => {
			let i = Item.fromJSON(it);
			ret._items.push(i);
			ret._itemsMap[i.id] = i;
		})
		return ret;
	}

	markClean() { this._isDirty = false }
	add(name: string, amount: number, quantity: number): IItemReadonly {
		let item = new Item();
		item.name = name;
		item.amount = amount;
		item.quantity = quantity;
		this._items.push(item);
		this._itemsMap[item.id] = item;
		this._isDirty = true;
		return item;
	}
	remove(item: Item): boolean {
		if (!this.itemsMap[item.id]) return false;
		this._items.splice(this.items.indexOf(item), 1);
		delete this._itemsMap[item.id];
		this._isDirty = true;
		return true;
	}
	setAmount(item: Item, value: number): boolean {
		value = +value;
		if (item.amount === value) return false;
		if (!ValidationHelpers.isPositive(value, false)) return false;
		item.amount = value;
		this._isDirty = true;
		return true;
	}
	setQuantity(item: Item, value: number): boolean {
		value = +value;
		if (item.quantity === value) return false;
		if (!ValidationHelpers.isPositiveInteger(value, false)) return false;
		item.quantity = value;
		this._isDirty = true;
		return true;
	}
	sort() {
		this._items.sort(ListHelpers.sortFunc);
		this._isDirty = true;
	}
	clear() {
		this._items    = [];
		this._itemsMap = {};
		this._isDirty  = true;
	}
}
