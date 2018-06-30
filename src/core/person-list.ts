import { IMap, IMapReadonly } from './maps';
import { Person, IPerson, IPersonReadonly } from './person';
import { ListHelpers } from './list-helpers';
import { ValidationHelpers } from './validation-helpers';
import { IPersonAssignment } from './person-assignment';

export interface IPersonListReadonly {
	readonly isDirty           : boolean;
	readonly financers         : ReadonlyArray<IPersonReadonly>;
	readonly financersMap      : IMapReadonly<IPersonReadonly>;
	readonly persons           : ReadonlyArray<IPersonReadonly>;
	readonly personsMap        : IMapReadonly<IPersonReadonly>;
	readonly namesMap          : IMapReadonly<number>;
	readonly numFinancers      : number;
	readonly numPersons        : number;
	readonly totalAmountPooled : number;
	toJSON(): IPerson[];
	hasName(name: string): boolean;
	getPossibleDependantsFor(person: IPersonReadonly): IPersonAssignment[];
}

export class PersonList implements IPersonListReadonly {

	private _isDirty      : boolean      = false;
	private _financers    : Person[]     = [];
	private _financersMap : IMap<Person> = {};
	private _persons      : Person[]     = [];
	private _personsMap   : IMap<Person> = {};
	private _namesMap     : IMap<number> = {};

	get isDirty() { return this._isDirty }
	get financers(): ReadonlyArray<IPersonReadonly> { return this._financers }
	get financersMap(): IMapReadonly<IPersonReadonly> { return this._financersMap }
	get persons(): ReadonlyArray<IPersonReadonly> { return this._persons }
	get personsMap(): IMapReadonly<IPersonReadonly> { return this._personsMap }
	get namesMap():IMapReadonly<number> { return this._namesMap }
	get numFinancers() { return this.financers.length }
	get numPersons() { return this.persons.length }
	get totalAmountPooled() { return this.financers.map(it => it.amountPooled).reduce((sum, value) => sum + value, 0) }

	toJSON(): IPerson[] {
		return this.financers.map(it => it.toJSON());
	}
	static fromJSON(json: IPerson[]): PersonList {
		let ret = new PersonList();
		json.forEach(it => {
			let f = Person.fromJSON(it);
			ret._financers.push(f);
			ret._financersMap[f.id] = f;
			[f as IPersonReadonly].concat(f.dependants).forEach(p => {
				ret._persons.push(p as Person);
				ret._personsMap[p.id] = p as Person;
				ret._namesMap[p.name] = (ret.namesMap[p.name] || 0) + 1;
			})
		})
		return ret;
	}

	hasName(name: string) {
		return (this.namesMap[name] || 0) !== 0;
	}
	getPossibleDependantsFor(person: IPersonReadonly): IPersonAssignment[] {
		if (person.isDependant) return [];
		let ret: IPersonAssignment[] = [];
		person.dependants.forEach(d => {
			ret.push({ person: d, wasChecked: true, checked: true });
		})
		this.financers.forEach(f => {
			if (f === person) return;
			if (f.numDependants !== 0) return;
			ret.push({ person: f, wasChecked: false, checked: false });
		})
		return ret;
	}

	markClean() { this._isDirty = false }
	add(name: string): Person {
		let person = new Person();
		person.name = name;
		this._financers.push(person);
		this._financersMap[person.id] = person;
		this._persons.push(person);
		this._personsMap[person.id] = person;
		this._namesMap[person.name] = (this.namesMap[person.name] || 0) + 1;
		this._isDirty = true;
		return person;
	}
	addBatch(count: number, nextName: () => string): number {
		let countCreated = 0;
		for (let i=0; i<count; ++i) {
			let name = nextName();
			if (!name) break;
			if (this.add(name)) ++countCreated;
		}
		return countCreated;
	}
	setName(person: Person, name: string): boolean {
		if (person.name === name) return false;
		this._namesMap[person.name] -= 1;
		if (!this.namesMap[person.name]) delete this._namesMap[person.name];
		person.name = name;
		this._namesMap[person.name] = (this.namesMap[person.name] || 0) + 1;
		this._isDirty = true;
		return true;
	}
	setPooledAmount(person: Person, value: number): boolean {
		value = +value;
		if (person.amountPooled === value) return false;
		if (!ValidationHelpers.isPositive(value, false)) return false;
		person.amountPooled = value;
		this._isDirty = true;
		return true;
	}
	remove(person: Person): boolean {
		if (!this.personsMap[person.id]) return false;
		let done = false;
		if (this.financersMap[person.id]) {
			this._financers.splice(this.financers.indexOf(person), 1);
			delete this._financersMap[person.id];
			[].concat(person.dependants).forEach(d => {
				person.removeDependant(d);
				this._financers.push(d);
				this._financersMap[d.id] = d;
			})
			done = true;
		}
		else {
			this._financers.forEach(f => {
				if (f.hasDependant(person)) {
					f.removeDependant(person);
					done = true;
				}
			})
		}
		this._persons.splice(this.persons.indexOf(person), 1);
		delete this._personsMap[person.id];
		this._namesMap[person.name] -= 1;
		if (!this.namesMap[person.name]) delete this._namesMap[person.name];
		if (done) this._isDirty = true;
		return done;
	}
	markAsDependantFor(person: Person, dependant: Person, value: boolean): boolean {
		if (value) {
			if (dependant.isDependant) return false;
			if (dependant.numDependants !== 0) return false;
			person.addDependant(dependant);
			this._financers.splice(this.financers.indexOf(dependant), 1);
			delete this._financersMap[dependant.id];
		}
		else {
			if (!person.hasDependant(dependant)) return false;
			person.removeDependant(dependant);
			this._financers.push(dependant);
			this._financersMap[dependant.id] = dependant;
		}
		this._isDirty = true;
		return true;
	}
	sort() {
		this._financers.sort(ListHelpers.sortFunc);
		this._persons.sort(ListHelpers.sortFunc);
		this._financers.forEach(f => f.sortDependants());
		this._isDirty = true;
	}
	clear() {
		this._financers    = [];
		this._financersMap = {};
		this._persons      = [];
		this._personsMap   = {};
		this._namesMap     = {};
		this._isDirty      = true;
	}

}
