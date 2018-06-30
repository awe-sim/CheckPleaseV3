export class ValidationHelpers {
	static isPositive(value: number, throwError: boolean) {
		if (+value > 0) return true;
		if (throwError) throw 'E_POSITIVE';
		return false;
	}
	static isZeroOrPositive(value: number, throwError: boolean) {
		if (+value >= 0) return true;
		if (throwError) throw 'E_ZERO_POSITIVE';
		return false;
	}
	static isInteger(value: number, throwError: boolean) {
		if (+value % 1 === 0) return true;
		if (throwError) throw 'E_INTEGER';
		return false;
	}
	static isPositiveInteger(value: number, throwError: boolean) {
		try {
			if (!ValidationHelpers.isInteger(value, throwError)) return false;
			if (!ValidationHelpers.isPositive(value, throwError)) return false;
			return true;
		}
		catch {
			if (throwError) throw 'E_POSITIVE_INTEGER';
			return false;
		}
	}
	static isZeroOrPositiveInteger(value: number, throwError: boolean) {
		try {
			if (!ValidationHelpers.isInteger(value, throwError)) return false;
			if (!ValidationHelpers.isZeroOrPositive(value, throwError)) return false;
			return true;
		}
		catch {
			if (throwError) throw 'E_ZERO_POSITIVE_INTEGER';
			return false;
		}
	}
}
