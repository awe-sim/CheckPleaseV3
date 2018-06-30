import { IMap, IMapReadonly } from './maps';
import { IDName, IIDName, IIDNameReadonly } from './id-name';
import { ListHelpers } from './list-helpers';

export interface IPerson extends IIDName {
	amountPooled : number;
	dependants   : IPerson[];
}
export interface IPersonReadonly extends IIDNameReadonly {
	readonly amountPooled  : number;
	readonly financer      : IPersonReadonly;
	readonly dependants    : ReadonlyArray<IPersonReadonly>;
	readonly dependantsMap : IMapReadonly<IPersonReadonly>;
	readonly isDependant   : boolean
	readonly numDependants : number;
	toJSON(): IPerson;
	hasDependant(person: IPersonReadonly): boolean
}

export class Person extends IDName implements IPersonReadonly {

	amountPooled           : number       = 0;
	private _financer      : Person       = null;
	private _dependants    : Person[]     = [];
	private _dependantsMap : IMap<Person> = {};

	constructor(id?: string) {
		super(id);
	}

	get financer(): IPersonReadonly { return this._financer }
	get isDependant() { return !!this.financer }
	get dependants(): ReadonlyArray<IPersonReadonly> { return this._dependants }
	get dependantsMap(): IMapReadonly<IPersonReadonly> { return this._dependantsMap }
	get numDependants() { return this.dependants.length }

	toJSON(): IPerson {
		return {
			id           : this.id,
			name         : this.name,
			amountPooled : this.amountPooled,
			dependants   : this.dependants.map(it => it.toJSON()),
		}
	}
	static fromJSON(json: IPerson, financer?: Person): Person {
		let ret = new Person(json.id);
		ret.name           = json.name;
		ret.amountPooled   = json.amountPooled;
		ret._financer      = financer || null;
		ret._dependants    = json.dependants.map(it => Person.fromJSON(it, ret));
		ret._dependantsMap = ListHelpers.toMap(ret._dependants);
		return ret;
	}

	hasDependant(person: IPersonReadonly): boolean {
		return !!this.dependantsMap[person.id];
	}
	addDependant(person: Person): boolean {
		if (this.dependantsMap[person.id]) return false;
		if (person.isDependant) return false;
		if (person.numDependants !== 0) return false;
		person.amountPooled = 0;
		person._financer = this;
		this._dependants.push(person);
		this._dependantsMap[person.id] = person;
		return true;
	}
	removeDependant(person: Person): boolean {
		if (!this.hasDependant(person)) return false;
		person._financer = null;
		this._dependants.splice(this.dependants.indexOf(person), 1);
		delete this._dependantsMap[person.id];
		return true;
	}
	sortDependants() {
		this._dependants.sort(ListHelpers.sortFunc);
	}

}
