import { IMapReadonly } from './maps';
import { IIDReadonly } from './id-name';
import { SplitType } from './split';

export interface IMath {
	readonly type         : SplitType;
	readonly extras       : number;
	readonly grandTotal   : number;
	readonly amountPooled : number;
	readonly change       : number;
	readonly numPersons   : number;
	readonly numFinancers : number;
	readonly basic        : IMathBasic;
	readonly advanced     : IMathAdvanced;
}
export interface IMathBasic {
	readonly billAmount  : number;
	readonly perHead     : number;
	readonly financerIDs : ReadonlyArray<string>;
	readonly financerMap : IMapReadonly<IMathBasicFinancer>;
}
export interface IMathAdvanced {
	readonly itemsTotal  : number;
	readonly numItems    : number;
	readonly financerIDs : ReadonlyArray<string>;
	readonly financerMap : IMapReadonly<IMathAdvancedFinancer>;
}
export interface IMathBasicFinancer extends IIDReadonly {
	readonly dependantIDs : ReadonlyArray<string>;
	readonly amountPooled : number;
	readonly grandTotal   : number;
	readonly change       : number;
}
export interface IMathAdvancedFinancer {
	readonly me           : IMathAdvancedPerson;
	readonly dependants   : ReadonlyArray<IMathAdvancedPerson>;
	readonly amountPooled : number;
	readonly itemsTotal   : number;
	readonly extras       : number;
	readonly grandTotal   : number;
	readonly change       : number;
	readonly items        : ReadonlyArray<IMathAdvancedFinancerItem>;
}
export interface IMathAdvancedPerson extends IIDReadonly {
	readonly items      : ReadonlyArray<IMathAdvancedPersonItem>;
	readonly itemsTotal : number;
	readonly extras     : number;
	readonly grandTotal : number;
}
export interface IMathAdvancedPersonItem extends IIDReadonly {
	readonly sharedBy : ReadonlyArray<string>;
	readonly perHead  : number;
}
export interface IMathAdvancedFinancerItem extends IMathAdvancedPersonItem {
	readonly sharedByUs     : ReadonlyArray<string>;
	readonly sharedByOthers : ReadonlyArray<string>;
	readonly total          : number;
}
