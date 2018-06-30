export interface IMap<T> {
	[guid: string]: T;
}
export interface IMapReadonly<T> {
	readonly [guid: string]: Readonly<T>;
}

export interface IMap2D<T> {
	[guid: string]: IMap<T>;
}
export interface IMap2DReadonly<T> {
	readonly [guid: string]: IMapReadonly<T>;
}
