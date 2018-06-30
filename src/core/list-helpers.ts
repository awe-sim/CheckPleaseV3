import { IMap, IMapReadonly } from './maps';
import { IIDReadonly, IIDNameReadonly} from './id-name';
import { IPersonListReadonly } from './person-list';

export class ListHelpers {
	private static _collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
	static sortFunc<T extends IIDNameReadonly>(a: T, b: T) {
		return ListHelpers._collator.compare(a.name, b.name);
	}
	static toMap<T extends IIDReadonly>(list: ReadonlyArray<T>): IMap<T> {
		let ret: IMap<T> = {};
		list.forEach(it => ret[it.id] = it);
		return ret;
	}
	static toList<T>(map: IMapReadonly<T>): T[] {
		return Object.keys(map)
			.map(key => map[key]);
	}
	static transformMap<T, U>(map: IMapReadonly<T>, fnTransform: (value: T) => U): IMap<U> {
		let ret: IMap<U> = {};
		Object.keys(map).forEach(key => ret[key] = fnTransform(map[key]));
		return ret;
	}
	static listIntersect<T>(listA: T[], listB: T[]): T[] {
		return listA.filter(it => listB.indexOf(it) !== -1);
	}
	static listSubtract<T>(listA: T[], listB: T[]): T[] {
		return listA.filter(it => listB.indexOf(it) === -1);
	}
	static names<T extends IIDNameReadonly>(list: ReadonlyArray<T>, personList: IPersonListReadonly, namedCount: number = -1, strAll: string = 'everyone', strNone: string = 'no one'): string {
		if (list.length === 0) return strNone;
		if (list.length === personList.numPersons) return strAll;
		if (namedCount < 0) namedCount = list.length;
		if (namedCount === 0) {
			if (list.length === 1) return '1 other';
			return `${list.length} others`;
		}
		let names = list.map(it => it.name);
		if (names.length === 0) return '';
		if (names.length === 1) return names[0];
		let othersCount = list.length - namedCount;
		if (namedCount && othersCount > 0) {
			names.splice(namedCount);
			names.push(`${othersCount} other${othersCount > 1 ? 's' : ''}`);
		}
		let lastName = names.pop();
		return names.join(', ') + ' and ' + lastName;
	}
}
