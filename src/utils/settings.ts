import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable()
export class SettingsCtrl {

	private _key      : string;
	private _defaults : any;
	private _settings : any;

	get settings(): Readonly<any> { return this._settings }

	constructor(public storage: Storage, key: string, defaults: any) {
		this._key      = key;
		this._defaults = defaults;
	}

	load() {
		return this.storage.get(this._key).then(value => {
			if (value) {
				this._settings = value;
				return this._mergeDefaults(this._defaults);
			}
			else {
				return this.setAll(this._defaults).then(value => {
					this._settings = value;
				})
			}
		})
	}

	private _mergeDefaults(defaults: any) {
		for (let k in defaults) {
			if (!(k in this.settings)) {
				this._settings[k] = defaults[k];
			}
		}
		return this.setAll(this.settings);
	}

	merge(settings: any) {
		for (let k in settings) {
			this._settings[k] = settings[k];
		}
		return this.save();
	}

	set(key: string, value: any) {
		this._settings[key] = value;
		return this.storage.set(this._key, this.settings);
	}

	setAll(value: any) {
		return this.storage.set(this._key, value);
	}

	get<T>(key: string): Promise<T> {
		return this.storage.get(this._key)
			.then(settings => {
				return settings[key];
			});
	}

	save() {
		return this.setAll(this.settings);
	}

}
