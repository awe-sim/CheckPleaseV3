import { Component, ElementRef, HostListener, Renderer, ViewEncapsulation } from '@angular/core';
import { Config } from '../../config/config';
import { NON_TEXT_INPUT_REGEX } from '../../util/dom';
import { BLOCK_ALL, GestureController } from '../../gestures/gesture-controller';
import { isPresent } from '../../util/util';
import { KEY_ENTER, KEY_ESCAPE } from '../../platform/key';
import { NavParams } from '../../navigation/nav-params';
import { Platform } from '../../platform/platform';
import { ViewController } from '../../navigation/view-controller';
/**
 * @hidden
 */
var AlertCmp = (function () {
    function AlertCmp(_viewCtrl, _elementRef, config, gestureCtrl, params, _renderer, _plt) {
        this._viewCtrl = _viewCtrl;
        this._elementRef = _elementRef;
        this._renderer = _renderer;
        this._plt = _plt;
        // gesture blocker is used to disable gestures dynamically
        this.gestureBlocker = gestureCtrl.createBlocker(BLOCK_ALL);
        this.d = params.data;
        this.mode = this.d.mode || config.get('mode');
        this.keyboardResizes = config.getBoolean('keyboardResizes', false);
        _renderer.setElementClass(_elementRef.nativeElement, "alert-" + this.mode, true);
        if (this.d.cssClass) {
            this.d.cssClass.split(' ').forEach(function (cssClass) {
                // Make sure the class isn't whitespace, otherwise it throws exceptions
                if (cssClass.trim() !== '')
                    _renderer.setElementClass(_elementRef.nativeElement, cssClass, true);
            });
        }
        this.id = (++alertIds);
        this.descId = '';
        this.hdrId = 'alert-hdr-' + this.id;
        this.subHdrId = 'alert-subhdr-' + this.id;
        this.msgId = 'alert-msg-' + this.id;
        this.activeId = '';
        this.lastClick = 0;
        if (this.d.message) {
            this.descId = this.msgId;
        }
        else if (this.d.subTitle) {
            this.descId = this.subHdrId;
        }
        if (!this.d.message) {
            this.d.message = '';
        }
    }
    AlertCmp.prototype.ionViewDidLoad = function () {
        var _this = this;
        // normalize the data
        var data = this.d;
        data.buttons = data.buttons.map(function (button) {
            if (typeof button === 'string') {
                return { text: button };
            }
            return button;
        });
        data.inputs = data.inputs.map(function (input, index) {
            var r = {
                type: input.type || 'text',
                name: isPresent(input.name) ? input.name : index + '',
                placeholder: isPresent(input.placeholder) ? input.placeholder : '',
                value: isPresent(input.value) ? input.value : '',
                label: input.label,
                checked: !!input.checked,
                disabled: !!input.disabled,
                id: isPresent(input.id) ? input.id : "alert-input-" + _this.id + "-" + index,
                handler: isPresent(input.handler) ? input.handler : null,
                min: isPresent(input.min) ? input.min : null,
                max: isPresent(input.max) ? input.max : null
            };
            return r;
        });
        // An alert can be created with several different inputs. Radios,
        // checkboxes and inputs are all accepted, but they cannot be mixed.
        var inputTypes = [];
        data.inputs.forEach(function (input) {
            if (inputTypes.indexOf(input.type) < 0) {
                inputTypes.push(input.type);
            }
        });
        if (inputTypes.length > 1 && (inputTypes.indexOf('checkbox') > -1 || inputTypes.indexOf('radio') > -1)) {
            console.warn("Alert cannot mix input types: " + (inputTypes.join('/')) + ". Please see alert docs for more info.");
        }
        this.inputType = inputTypes.length ? inputTypes[0] : null;
        var checkedInput = this.d.inputs.find(function (input) { return input.checked; });
        if (checkedInput) {
            this.activeId = checkedInput.id;
        }
        var hasTextInput = (this.d.inputs.length && this.d.inputs.some(function (i) { return !(NON_TEXT_INPUT_REGEX.test(i.type)); }));
        if (!this.keyboardResizes && hasTextInput && this._plt.is('mobile')) {
            // this alert has a text input and it's on a mobile device so we should align
            // the alert up high because we need to leave space for the virtual keboard
            // this also helps prevent the layout getting all messed up from
            // the browser trying to scroll the input into a safe area
            this._renderer.setElementClass(this._elementRef.nativeElement, 'alert-top', true);
        }
    };
    AlertCmp.prototype.ionViewWillEnter = function () {
        this.gestureBlocker.block();
    };
    AlertCmp.prototype.ionViewDidLeave = function () {
        this.gestureBlocker.unblock();
    };
    AlertCmp.prototype.ionViewDidEnter = function () {
        // set focus on the first input or button in the alert
        // note that this does not always work and bring up the keyboard on
        // devices since the focus command must come from the user's touch event
        // and ionViewDidEnter is not in the same callstack as the touch event :(
        var focusableEle = this._elementRef.nativeElement.querySelector('input,button');
        if (focusableEle) {
            setTimeout(function () { return focusableEle.focus(); });
        }
        this.enabled = true;
    };
    AlertCmp.prototype.keyUp = function (ev) {
        if (this.enabled && this._viewCtrl.isLast()) {
            if (ev.keyCode === KEY_ENTER) {
                if (this.lastClick + 1000 < Date.now()) {
                    // do not fire this click if there recently was already a click
                    // this can happen when the button has focus and used the enter
                    // key to click the button. However, both the click handler and
                    // this keyup event will fire, so only allow one of them to go.
                    (void 0) /* console.debug */;
                    var button = this.d.buttons[this.d.buttons.length - 1];
                    this.btnClick(button);
                }
            }
            else if (ev.keyCode === KEY_ESCAPE) {
                (void 0) /* console.debug */;
                this.bdClick();
            }
        }
    };
    AlertCmp.prototype.btnClick = function (button) {
        if (!this.enabled) {
            return;
        }
        // keep the time of the most recent button click
        this.lastClick = Date.now();
        var shouldDismiss = true;
        if (button.handler) {
            // a handler has been provided, execute it
            // pass the handler the values from the inputs
            if (button.handler(this.getValues()) === false) {
                // if the return value of the handler is false then do not dismiss
                shouldDismiss = false;
            }
        }
        if (shouldDismiss) {
            this.dismiss(button.role);
        }
    };
    AlertCmp.prototype.rbClick = function (checkedInput) {
        if (this.enabled) {
            this.d.inputs.forEach(function (input) {
                input.checked = (checkedInput === input);
            });
            this.activeId = checkedInput.id;
            if (checkedInput.handler) {
                checkedInput.handler(checkedInput);
            }
        }
    };
    AlertCmp.prototype.cbClick = function (checkedInput) {
        if (this.enabled) {
            checkedInput.checked = !checkedInput.checked;
            if (checkedInput.handler) {
                checkedInput.handler(checkedInput);
            }
        }
    };
    AlertCmp.prototype.bdClick = function () {
        if (this.enabled && this.d.enableBackdropDismiss) {
            var cancelBtn = this.d.buttons.find(function (b) { return b.role === 'cancel'; });
            if (cancelBtn) {
                this.btnClick(cancelBtn);
            }
            else {
                this.dismiss('backdrop');
            }
        }
    };
    AlertCmp.prototype.dismiss = function (role) {
        var opts = {
            minClickBlockDuration: 400
        };
        return this._viewCtrl.dismiss(this.getValues(), role, opts);
    };
    AlertCmp.prototype.getValues = function () {
        if (this.inputType === 'radio') {
            // this is an alert with radio buttons (single value select)
            // return the one value which is checked, otherwise undefined
            var checkedInput = this.d.inputs.find(function (i) { return i.checked; });
            return checkedInput ? checkedInput.value : undefined;
        }
        if (this.inputType === 'checkbox') {
            // this is an alert with checkboxes (multiple value select)
            // return an array of all the checked values
            return this.d.inputs.filter(function (i) { return i.checked; }).map(function (i) { return i.value; });
        }
        if (this.d.inputs.length === 0) {
            // this is an alert without any options/inputs at all
            return undefined;
        }
        // this is an alert with text inputs
        // return an object of all the values with the input name as the key
        var values = {};
        this.d.inputs.forEach(function (i) {
            values[i.name] = i.value;
        });
        return values;
    };
    AlertCmp.prototype.ngOnDestroy = function () {
        (void 0) /* assert */;
        this.gestureBlocker.destroy();
    };
    AlertCmp.decorators = [
        { type: Component, args: [{
                    selector: 'ion-alert',
                    template: '<ion-backdrop (click)="bdClick()" [class.backdrop-no-tappable]="!d.enableBackdropDismiss"></ion-backdrop>' +
                        '<div class="alert-wrapper">' +
                        '<div class="alert-head">' +
                        '<h2 id="{{hdrId}}" class="alert-title" *ngIf="d.title" [innerHTML]="d.title"></h2>' +
                        '<h3 id="{{subHdrId}}" class="alert-sub-title" *ngIf="d.subTitle" [innerHTML]="d.subTitle"></h3>' +
                        '</div>' +
                        '<div id="{{msgId}}" class="alert-message" [innerHTML]="d.message"></div>' +
                        '<div *ngIf="d.inputs.length" [ngSwitch]="inputType">' +
                        '<ng-template ngSwitchCase="radio">' +
                        '<div class="alert-radio-group" role="radiogroup" [attr.aria-labelledby]="hdrId" [attr.aria-activedescendant]="activeId">' +
                        '<button ion-button="alert-radio-button" *ngFor="let i of d.inputs" (click)="rbClick(i)" [attr.aria-checked]="i.checked" [disabled]="i.disabled" [attr.id]="i.id" class="alert-tappable alert-radio" role="radio">' +
                        '<div class="alert-radio-icon"><div class="alert-radio-inner"></div></div>' +
                        '<div class="alert-radio-label">' +
                        '{{i.label}}' +
                        '</div>' +
                        '</button>' +
                        '</div>' +
                        '</ng-template>' +
                        '<ng-template ngSwitchCase="checkbox">' +
                        '<div class="alert-checkbox-group">' +
                        '<button ion-button="alert-checkbox-button" *ngFor="let i of d.inputs" (click)="cbClick(i)" [attr.aria-checked]="i.checked" [attr.id]="i.id" [disabled]="i.disabled" class="alert-tappable alert-checkbox" role="checkbox">' +
                        '<div class="alert-checkbox-icon"><div class="alert-checkbox-inner"></div></div>' +
                        '<div class="alert-checkbox-label">' +
                        '{{i.label}}' +
                        '</div>' +
                        '</button>' +
                        '</div>' +
                        '</ng-template>' +
                        '<ng-template ngSwitchDefault>' +
                        '<div class="alert-input-group">' +
                        '<form>' +
                        '<div *ngFor="let i of d.inputs" class="alert-input-wrapper">' +
                        '<input [placeholder]="i.placeholder" [(ngModel)]="i.value" [ngModelOptions]="{standalone: true}" [type]="i.type" dir="auto" [min]="i.min" [max]="i.max" [attr.id]="i.id" class="alert-input">' +
                        '</div>' +
                        '</form>' +
                        '</div>' +
                        '</ng-template>' +
                        '</div>' +
                        '<div class="alert-button-group" [ngClass]="{\'alert-button-group-vertical\':d.buttons.length>2}">' +
                        '<button ion-button="alert-button" *ngFor="let b of d.buttons" (click)="btnClick(b)" [ngClass]="b.cssClass">' +
                        '{{b.text}}' +
                        '</button>' +
                        '</div>' +
                        '</div>',
                    host: {
                        'role': 'dialog',
                        '[attr.aria-labelledby]': 'hdrId',
                        '[attr.aria-describedby]': 'descId'
                    },
                    encapsulation: ViewEncapsulation.None,
                },] },
    ];
    /** @nocollapse */
    AlertCmp.ctorParameters = function () { return [
        { type: ViewController, },
        { type: ElementRef, },
        { type: Config, },
        { type: GestureController, },
        { type: NavParams, },
        { type: Renderer, },
        { type: Platform, },
    ]; };
    AlertCmp.propDecorators = {
        'keyUp': [{ type: HostListener, args: ['body:keyup', ['$event'],] },],
    };
    return AlertCmp;
}());
export { AlertCmp };
var alertIds = -1;
//# sourceMappingURL=alert-component.js.map
