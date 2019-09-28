/**
 * @copyright 2019 Asimovian LLC
 * @license MIT https://github.com/asimovian/plur/blob/master/LICENSE.txt
 * @module plur/PlurObject
 * @version 0.1.0
 */
'use strict';

import IPlurified from '../plur/IPlurified.mjs';

/**
 * Utility for prototype object construction.
 *
 * @implements {plur/IPlurified}
 * @final
 */
export default class PlurObject {
    /**
     * Determines whether the given object or class has been plurify()'d or not.
     *
     * @param {Object|Function} o The object or class object to review.
     * @returns {boolean} TRUE if plurified FALSE if not
     */
    static isPlurified(o) {
        return ( typeof o.implemented === 'Object' && typeof o.implemented['plur/IPlurified'] !== 'undefined');
    };

    /**
     * Determines whether the given class have been plurify()'d or not. FALSE on objects of a class.
     *
     * @param {Function} c The class object to review
     * @returns {boolean} TRUE if a plurified class FALSE if not
     */
    static isPlurifiedClass(c) {
        return ( typeof c.implemented === 'Object' && typeof c.implemented['plur/IPlurified'] !== 'undefined');
    };

    /**
     *
     * @param {plur/IPlurified} object
     * @param {function(new: plur/IPlurified)} interfaceConstructor
     * @returns {boolean}
     */
    static implementing(object, interfaceConstructor) {
        let constructor = Object.getPrototypeOf(object).constructor;
        if (typeof constructor.implemented === 'undefined') {
            return false;
        } else if (typeof interfaceConstructor === 'string') {
            return ( typeof constructor.implemented[interfaceConstructor] !== 'undefined' );
        } else {
            return ( typeof constructor.implemented[interfaceConstructor.namepath] !== 'undefined' );
        }
    };

    /**
     * Meant to be assigned to abstract prototype functions that require overriding in child classes.
     *
     * @throws Error
     */
    static abstractMethod() {
        throw new Error('plur: Cannot call abstract method.');
    };

    /**
     * Initializes a class as a Plur Object.
     *
     * Designed to be used from within a ES6+ class declaration. Always assigned to a static property "namepath".
     *
     *** Example usage:
     * class Foo {
     *   ...
     * };
     *
     * PlurObject.plurify('myproject/foobars/Foo', Foo);
     ***
     *
     * Sets the provided "namepath" property into the prototype of the provided constructor.
     *
     * Sets the "implemented" property into the constructor that maps implemented interface namepaths
     * to their constructors.
     *
     * @param {string} namepath The namepath to set both statically and on the prototype.
     * @param {!IPlurified} classObject The class to be plurified
     * @param {Array<IPlurified>=} ifaces Interfaces to be implemented.
     */
    static plurify(namepath, classObject, ifaces) {
        // inject namepath on the prototype.
        PlurObject.constProperty(classObject, 'namepath', namepath);
        PlurObject.constProperty(classObject.prototype, 'namepath', namepath);
        classObject.implemented = { 'plur/IPlurified' : IPlurified };

        // kept for runtime metrics
        PlurObject._plurified.push({ namepath: namepath, timestamp: Date.now() });

        if (typeof ifaces === 'undefined') { // all done then
            return namepath;
        }

        // implement interfaces
        if (!Array.isArray(ifaces)) {
            ifaces = [ifaces];
        }

        for (let i = 0; i < ifaces.length; ++i) {
            PlurObject.implement(classObject, ifaces[i]);
        }
    };

    /**
     * Define a subject constructor/prototype as implementing a given interface constructor.
     * Copies the interface prototype's abstract methods in to the subject prototype.
     * Adds the interface pathname to the subject constructor.implemented variable.
     *
     * @param {IPlurified} constructor
     * @param {IPlurified} interfaceConstructor
     * @throws {Error}
     */
    static implement(constructor, interfaceConstructor) {
        if (typeof constructor.implemented[interfaceConstructor.namepath] !== 'undefined') {
            throw new Error('Not a valid plur Object.');
        }

        let interfacePrototype = interfaceConstructor.prototype;
        let prototype = constructor.prototype;

        for (let propertyName in interfacePrototype) {
            // make sure that the interface property is assigned to PlurObject.abstractMethod
            if (interfacePrototype.hasOwnProperty(propertyName) && interfacePrototype[propertyName] === PlurObject.abstractMethod) {
                // set it if it's undefined. ignore if it exists and is already abstract. throw error otherwise.
                switch (typeof prototype[propertyName]) {
                    case 'undefined':
                        prototype[propertyName] = interfacePrototype[propertyName];
                        break;
                    default:
                        if (prototype[propertyName] === PlurObject.abstractMethod) {
                            throw new Error('Unimplemented method in ' + prototype.namepath + ' for ' +
                                interfaceConstructor.namepath + '.prototype.' + propertyName);
                        }
                }
            }
        }

        constructor.implemented[interfaceConstructor.namepath] = interfaceConstructor;
    };

    /**
     *
     * @param {Object} object
     * @returns {Object[]}
     */
    static values(object) {
        let values = [];
        for (let key in object) {
            if (object.hasOwnProperty(key)) {
                values.push(object[key]);
            }
        }

        return values;
    };

    static constProperty(object, key, value) {
        Object.defineProperty(object, key, { value: value, writable: false, enumerable: true, configurable: false });
    };

    /**
     * Returns an array of records { namepath: string, datetime: 'string' }.
     * @returns {!Array<!Object<string, string>>}
     */
    static getPlurified() {
        return PlurObject._plurified;
    };

    constructor() {
        throw new Error('Cannot instantiate private constructor of PlurObject');
    };
}

/** @type {!Array<!Object<string,string>>} Runtime information about each class that has been plurify()'d. **/
PlurObject._plurified = [];

PlurObject.plurify('plur/PlurObject', PlurObject);
