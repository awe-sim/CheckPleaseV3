import { IPersonReadonly } from './person';

export interface IPersonAssignment {
	readonly person     : IPersonReadonly;
	readonly wasChecked : boolean;
	         checked    : boolean;
}
