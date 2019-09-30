/**
 * @copyright 2019 Asimovian LLC
 * @license MIT https://github.com/asimovian/plur/blob/master/LICENSE.txt
 * @module plur/test/Tester
 */
'use strict';

import PlurObject from '../../plur/PlurObject.mjs';
import PlurError from '../../plur/error/Error.mjs';
import {singleton as SystemLog} from '../../plur/log/System.mjs';

/**
 *
 */
export default class Tester {
	constructor(testTargets) {
        this._log = SystemLog.get();
        this._testTargets = testTargets;
        this._testTargetIndex = -1;
        this._testTarget = null;
        this._promise = null;
        this._promiseResolve = null;
        this._promiseReject = null;
    };
}

PlurObject.plurify('plur/test/Tester', Tester);

Tester._TEST_CONSTRUCTOR = /^[a-zA-Z0-9_\-\/]+$/;

Tester.prototype.test = function() {
    var self = this;

    // pass a noop function that writes the resolve and reject methods to state for use by test callbacks
    this._promise = new Promise(function(resolve, reject) {
        self._promiseResolve = resolve;
        self._promiseReject = reject;
    });

    if (this._testTargets.length === 0) {
        this._promiseResolve();
    } else {
        this._testNextTarget();
    }

    return this._promise;
};

Tester.prototype._rejected = function(error) {
    this._log.error('Test failed: ' + this._testTarget + ': ' + error);
    this._promiseReject(error);
};

Tester.prototype._resolved = function() {
    this._log.info('Tests passed: ' + this._testTarget);
    this._promiseResolve();
};

Tester.prototype._testNextTarget = function() {
    var self = this;

    // if this was the last target prototype, resolve to pass the test entirely
    if (this._testTargetIndex+1 === this._testTargets.length) {
        this._resolved();
        return;
    }

    this._testTarget = this._testTargets[++this._testTargetIndex];

    if (!this._testTarget.match(Tester._TEST_CONSTRUCTOR)) {
        throw new PlurError('Invalid test target', { target: testTarget });
    }

    this._log.info('Testing with: ' + this._testTarget + ' ...');

    var targetPromise = new Promise(function(targetPromiseResolve, targetPromiseReject) {
        import('../../' + [self._testTarget] + '.mjs').then(function(module) {
            const testClass = module.default;
            const testMethodNames = [];
            let methodPromiseResolve = null;

            const methodPromise = new Promise(function(resolve, reject) {
                methodPromiseResolve = resolve;
            });

            const properties = Object.getOwnPropertyNames(testClass.prototype);
            for (let i = 0; i < properties.length; ++i) {
                const property = properties[i];
                if (!/^test_/.test(property) || typeof testClass.prototype[property] !== 'function') {
                    continue;
                }

                testMethodNames.push(property);
            }

            if (testMethodNames.length > 0) {
                const test = new testClass();
                self._testNextMethod(methodPromise, test, 0, testMethodNames, targetPromiseResolve, targetPromiseReject);
            } else {
                self._log.warn('Test ' + self._testTarget + ' does not provide any test methods.');
            }

            methodPromiseResolve();
        });
    });

    targetPromise.then(function() { self._testNextTarget() }, function(errors) { self._rejected(errors); });
};

Tester.prototype._testNextMethod = function(prevMethodPromise, test, testMethodIndex, testMethodNames, targetPromiseResolve, targetPromiseReject) {
    if (testMethodNames.length === 0) {
        return;
    }

    var self = this;

    prevMethodPromise.then(
        function() {
            var methodPromise = self._testMethod(test, testMethodNames[testMethodIndex]);
            methodPromise.then(
                function() {
                    self._log.info('Test passed: ' + test.namepath + '.prototype.' + testMethodNames[testMethodIndex] + '()');

                    if (++testMethodIndex < testMethodNames.length) {
                            self._testNextMethod(methodPromise, test, testMethodIndex, testMethodNames, targetPromiseResolve, targetPromiseReject);
                    } else {
                        targetPromiseResolve();
                    }
                },
                targetPromiseReject
            );
        },
        targetPromiseReject
    );
};

Tester.prototype._testMethod = function(test, methodName) {
    var self = this;

    var methodTestPromise = new Promise(function(resolve, reject) {
        self._log.info('Testing method: ' + test.namepath + '.prototype.' + methodName + '()');
        test[methodName]();
        resolve();

        /*var promises = test.popPromises();
        if (promises.length === 0)  {
            if (targetPromiseResolve !== null) {
                targetPromiseResolve();
            } else {
                resolve();
            }
        } else {
            promises = promises.concat(new PlurPromise(Tester._timeoutPromiseExecutor));
            PlurPromise.all(promises, ( targetResolve !== null ? targetResolve : methodResolve ), reject);
        }*/
    });

    return methodTestPromise;
};

Tester._timeoutPromiseExecutor = function(resolve, reject) {
    setTimeout(2000, function(resolve, reject) {
        reject('Test timed out after 2000 ms');
    });
};
