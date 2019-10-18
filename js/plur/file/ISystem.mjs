/**
 * @copyright 2019 Asimovian LLC
 * @license MIT https://github.com/asimovian/plur/blob/master/LICENSE.txt
 * @module plur/file/ISystem
 */
'use strict';

import PlurObject from "../../plur/Class.mjs";
import InterfaceError from "../../plur/error/Interface.mjs";

/**
 * The interface that all file system prototypes must provide.
 *
 * @interface
 * @implements {IPlurified}
 */
export default class IFileSystem {
    constructor() {
        throw new InterfaceError(this);
    }
};

PlurObject.plurify('plur/file/ISystem', IFileSystem);

/**
 * Combines the provided paths together into one path.
 *
 * @type {Function}
 * @abstract
 * @param ... string[] paths
 * @returns string
 */
IFileSystem.prototype.joinPaths = PlurObject.abstractMethod;

/**
 * Retrieves the home path for all available packages, including plur sdk. Appends var args to the end.
 * Typeically, this is the parent directory of plur.git.
 *
 * @type {Function}
 * @abstract
 * @param ... string[] paths
 * @returns string
 */
IFileSystem.prototype.getHomePath = PlurObject.abstractMethod;

/**
 * Retrieves the config path for this node instance, appending all provided paths.
 *
 * @type {Function}
 * @abstract
 * @param ... string[] paths
 * @returns string
 */
IFileSystem.prototype.getConfigPath = PlurObject.abstractMethod;

/**
 * Retrieves the bin path for the Plur software appending all provided paths.
 *
 * @type {Function}
 * @abstract
 * @param ... string[] paths
 * @returns string
 */
IFileSystem.prototype.getBinPath = PlurObject.abstractMethod;

/**
 * Retrieves only the last portion of a path.
 *
 * @type {Function}
 * @abstract
 * @param {string} filepath
 * @returns {Promise}
 */
IFileSystem.prototype.basename = PlurObject.abstractMethod;

/**
 * Globs a path for a pattern, returning paths that match.
 *
 * @type {Function}
 * @abstract
 * @param {string} dir
 * @param {!RegExp} pattern
 * @returns {Promise}
 */
IFileSystem.prototype.find = PlurObject.abstractMethod;
