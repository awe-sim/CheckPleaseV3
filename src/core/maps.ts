export interface IMap<T> {
	[guid: string]: T;
}
export interface IMapReadonly<T> {
	readonly [guid: string]: Readonly<T>;
}
