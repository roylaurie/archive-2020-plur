/**
 * @copyright 2019 Asimovian LLC
 * @license MIT https://github.com/asimovian/plur/blob/master/LICENSE.txt
 * @module plur/config/IConfigurable
 */
'use strict';

import PlurObject from 'plur/PlurObject.mjs';
import InterfaceError from 'plur/error/Interface';

/**
 * Implements a configurable class that uses plur/Config to maintain its configuration.
 * The implementing class must:
 *   - Maintain an immutable static plur/Config with a schema & default settings.
 *   - Maintain an immutable inherited (possibly modified) copy of the static plur/Config for each instance of the class.
 *   - Provide accessors for the static Config and the instance's Config->config()
 *
 * @interface
 * @implements {plur/IPlurified}
 * @final
 */
class IConfigurable {
    constructor() {
        throw new InterfaceError(this);
    };
}

PlurObject.plurify('plur/config/IConfigurable', IConfigurable);

/**
 * Returns an immutable copy of the configuration data as a primitive nested JS object.
 * @type {function}
 * @abstract
 * @returns {!Object<string,(number|string|Object|null)>}
 */
IConfigurable.prototype.config = PlurObject.abstractMethod;

/**
 * Returns the default configuration for the configured class.
 * @type {function}
 * @abstract
 * @returns {!plur/Config}
 */
IConfigurable.getDefaultConfig = PlurObject.abstractMethod;

export default IConfigurable;
