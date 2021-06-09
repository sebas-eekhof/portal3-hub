/*
 *  Copyright 2016 Adobe Systems Incorporated. All rights reserved.
 *  This file is licensed to you under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License. You may obtain a copy
 *  of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software distributed under
 *  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 *  OF ANY KIND, either express or implied. See the License for the specific language
 *  governing permissions and limitations under the License.
 */

var testcommon = require('../../test-common');
var requestqueue = testcommon.require(__dirname, '../../../../lib/backends/rq/requestqueue');
var Path = require('path');

describe('RequestQueue', function () {
  var rq, common = null;
  var testName = 'file';
  var testDestName = 'file2';
  var testDestPath = '/queue2';
  var testPath = '/queue';
  var testFullPath = testPath + '/' + testName;
  var testFullDestPath = testDestPath + '/' + testDestName;
  var testLocalPrefix = '.';
  var testRemotePrefix = 'http://localhost:4502/api/assets';
  var testLocal = testLocalPrefix + testPath + '/' + testName;
  var testRemoteParent = testRemotePrefix + testPath;
  var testRemote = testRemoteParent + '/' + testName;
  var testDestLocal = testLocalPrefix + testDestPath + '/' + testDestName;
  var testDestRemote = testRemotePrefix + testDestPath + '/' + testDestName;

  var addRequestOptions = function (method, path, name, localPrefix, remotePrefix) {
    common.db.insert({
      method: method,
      path: path,
      name: name,
      localPrefix: localPrefix,
      remotePrefix: remotePrefix,
      timestamp: 12345,
      retries: 0
    });
  };

  var addRequest = function (method) {
    addRequestOptions(method, testPath, testName, testLocalPrefix, testRemotePrefix);
  };

  var addDestRequest = function (method) {
    addRequestOptions(method, testDestPath, testDestName, testLocalPrefix, testRemotePrefix);
  };

  var queueAndVerifyOptions = function (options, callback) {
    rq.queueRequest(options, function (err) {
      expect(err).toBeFalsy();
      common.db.find({}, function (e, results) {
        expect(e).toBeFalsy();
        callback(results);
      });
    });
  };

  var queueAndVerify = function (method, callback) {
    queueAndVerifyOptions({
      method: method,
      path: testFullPath,
      localPrefix: testLocalPrefix,
      remotePrefix: testRemotePrefix,
      destPath: testFullDestPath
    }, callback);
  };

  var queueAndVerifyReplace = function (oldMethod, newMethod, callback) {
    queueAndVerifyMethod(oldMethod, newMethod, newMethod, callback);
  };

  var queueAndVerifyNoReplace = function (oldMethod, newMethod, callback) {
    queueAndVerifyMethod(oldMethod, newMethod, oldMethod, callback, true);
  };

  var queueAndVerifyMethod = function (oldMethod, newMethod, resultMethod, callback, sameTimestamp) {
    queueAndVerify(oldMethod, function (oldResults) {
      setTimeout(function () {
        queueAndVerify(newMethod, function (results) {
          var resultStamp = false;
          for (var i = 0; i < results.length; i++) {
            if (results[i].method == resultMethod) {
              resultStamp = results[i].timestamp;
              break;
            }
          }
          if (!sameTimestamp) {
            for (var i = 0; i < oldResults.length; i++) {
              if (oldResults[i].method == oldMethod) {
                expect(oldResults[i].timestamp).not.toEqual(resultStamp);
                break;
              }
            }
          }
          expect(resultStamp).toBeTruthy();
          callback(results);
        });
      }, 5);
    });
  };

  var getDocPaths = function (doc, callback) {
    var localPath = doc.localPrefix + doc.path + '/' + doc.name;
    var remoteUrl = doc.remotePrefix + doc.path + '/' + doc.name;
    var localDestPath = null;
    var remoteDestUrl = null;
    if (doc.destPath) {
      localDestPath = doc.localPrefix + doc.destPath + '/' + doc.destName;
      remoteDestUrl = doc.remotePrefix + doc.destPath + '/' + doc.destName;
    }
    callback(localPath, remoteUrl, localDestPath, remoteDestUrl);
  };

  var expectEventEmitted = function (eventName, eventValue, notCalled) {
    var verified = false;
    var expected = true;
    if (notCalled) {
      expected = false;
    }
    if (rq.emit.calls) {
      for (var i = 0; i < rq.emit.calls.length; i++) {
        if (rq.emit.calls[i].args) {
          if (rq.emit.calls[i].args.length == 2) {
            if (rq.emit.calls[i].args[0] == eventName &&
              rq.emit.calls[i].args[1] == eventValue) {
              verified = true;
              break;
            }
          }
        }
      }
    }
    expect(verified).toEqual(expected);
  };

  var expectQueueChangedEmitted = function (notCalled) {
    var verified = false;
    var expected = true;
    if (notCalled) {
      expected = false;
    }
    if (rq.emit.calls) {
      for (var i = 0; i < rq.emit.calls.length; i++) {
        if (rq.emit.calls[i].args) {
          if (rq.emit.calls[i].args[0] == 'queuechanged') {
            verified = true;
            break;
          }
        }
      }
    }
    expect(verified).toEqual(expected);
  };

  beforeEach(function () {
    common = new testcommon();

    rq = new requestqueue({path: '/test'});

    common['db'] = rq.db;

    spyOn(rq, 'emit').andCallThrough();
    spyOn(common.db, 'find').andCallThrough();
  });

  describe('GetRequests', function () {
    var testGetRequests = function (path, done) {
      addRequest('PUT');
      addDestRequest('POST');

      rq.getRequests(path, function (err, lookup) {
        expect(err).toBeUndefined();
        expect(common.db.find).toHaveBeenCalled();

        expect(lookup['file']).toEqual('PUT');

        done();
      });
    };

    it('testGetRequests', function (done) {
      testGetRequests(testPath, done);
    });

    it('testGetRequestsError', function (done) {
      common.db.find = function (options, callback) {
        callback('error!');
      };

      rq.getRequests(testPath, function (err, lookup) {
        expect(err).toEqual('error!');
        expect(lookup).toBeUndefined();
        done();
      });
    });
  });

  describe('IncrementRetryCount', function () {
    it('testIncrementRetryCount', function (done) {
      addRequest('PUT');
      rq.getProcessRequest(0, 3, function (err, req) {
        expect(err).toBeFalsy();
        var currRetries = req.retries;
        var currTimestamp = req.timestamp;
        rq.incrementRetryCount(req.path, req.name, 0, function (err) {
          expect(err).toBeFalsy();

          rq.getProcessRequest(0, 3, function (err, req) {
            expect(err).toBeFalsy();
            expect(req.retries).toEqual(currRetries + 1);
            expect(req.timestamp).not.toEqual(currTimestamp)
            done();
          });
        });
      });
    });
  });

  describe('PurgeFailedRequests', function () {
    it('testPurgeFailedRequests', function (done) {
      addRequest('PUT');
      addRequestOptions('PUT', testPath, testDestName, testLocalPrefix, testRemotePrefix);
      rq.purgeFailedRequests(0, function (err, purged) {
        expect(err).toBeFalsy();
        expect(purged.length).toEqual(2);
        var tempPath = testPath + '/' + testDestName;
        expect(purged[0] == tempPath || purged[0] == testFullPath).toEqual(true);
        expect(purged[1] == tempPath || purged[1] == testFullPath).toEqual(true);

        rq.getRequests(testPath, function (err, lookup) {
          expect(err).toBeFalsy();
          expect(lookup[testName]).toBeFalsy();
          expect(lookup[testDestName]).toBeFalsy();
          done();
        });
      });
    });
  });

  describe('RemoveRequest', function () {
    it('testRemoveRequest', function (done) {
      addRequest('PUT');
      rq.removeRequest(testPath, testName, function (err) {
        expect(err).toBeFalsy();
        expectEventEmitted('itemupdated', Path.join(testPath, testName));
        expectQueueChangedEmitted();
        done();
      });
    });

    it('testRemoveRequestError', function (done) {
      rq.removeRequest(testPath, testName, function (err) {
        expect(err).toBeTruthy();
        expectEventEmitted('itemupdated', Path.join(testPath, testName), true);
        expectQueueChangedEmitted(true);
        done();
      });
    });
  });

  describe('GetProcessRequest', function () {
    it('testGetProcessRequest', function (done) {
      addRequest('PUT');
      rq.getProcessRequest(0, 3, function (err, req) {
        expect(err).toBeFalsy();
        expect(req).toBeDefined();
        expect(req.method).toEqual('PUT');
        done();
      });
    });

    it('testGetProcessRequestUnexpired', function (done) {
      addRequest('PUT');
      rq.getProcessRequest(new Date().getTime(), 3, function (err, req) {
        expect(err).toBeFalsy();
        expect(req).toBeFalsy();
        done();
      });
    });

    it('testGetProcessRequestMaxRetries', function (done) {
      addRequest('PUT');
      rq.getProcessRequest(0, 0, function (err, req) {
        expect(err).toBeFalsy();
        expect(req).toBeFalsy();
        done();
      });
    });
  });

  describe('UpdatePath', function () {
    it('testUpdatePath', function (done) {
      addRequest('PUT');
      addRequestOptions('DELETE', testPath, testDestName, testLocalPrefix, testRemotePrefix);
      rq.updatePath(testPath, testDestPath, function (err) {
        expect(err).toBeFalsy();
        rq.getRequests(testDestPath, function (err, lookup) {
          expect(err).toBeFalsy();
          expect(lookup[testName]).toEqual('PUT');
          expect(lookup[testDestName]).toEqual('DELETE');
          expectEventEmitted('pathupdated', testPath);
          expectQueueChangedEmitted();
          done();
        });
      });
    });

    it('testUpdatePathSub', function (done) {
      addRequestOptions('DELETE', testPath + '/sub', testName, testLocalPrefix, testRemotePrefix);
      rq.updatePath(testPath, testDestPath, function (err) {
        expect(err).toBeFalsy();
        rq.getRequests(testDestPath + '/sub', function (err, lookup) {
          expect(err).toBeFalsy();
          expect(lookup[testName]).toEqual('DELETE');
          expectEventEmitted('pathupdated', testPath);
          expectQueueChangedEmitted();
          done();
        });
      });
    });
  });

  describe('RemovePath', function () {
    it('testRemovePath', function (done) {
      addRequest('PUT');
      addRequest('DELETE', testPath, testDestName, testLocalPrefix, testRemotePrefix);
      rq.removePath(testPath, function (err) {
        expect(err).toBeFalsy();
        rq.getRequests(testPath, function (err, lookup) {
          expect(err).toBeFalsy();
          expect(lookup[testName]).toBeFalsy();
          expect(lookup[testDestName]).toBeFalsy();
          expectEventEmitted('pathupdated', testPath);
          expectQueueChangedEmitted();
          done();
        });
      });
    });

    it('testRemovePathSub', function (done) {
      addRequestOptions('DELETE', testPath + '/sub', testName, testLocalPrefix, testRemotePrefix);
      rq.removePath(testPath, function (err) {
        expect(err).toBeFalsy();
        rq.getRequests(testPath + '/sub', function (err, lookup) {
          expect(err).toBeFalsy();
          expect(lookup[testName]).toBeFalsy();
          expectEventEmitted('pathupdated', testPath);
          expectQueueChangedEmitted();
          done();
        });
      });
    });

    it('testRemovePathRoot', function (done) {
      addRequest('PUT');
      rq.removePath('/', function (err) {
        expect(err).toBeFalsy();
        rq.getRequests(testPath, function (err, lookup) {
          expect(err).toBeFalsy();
          expect(lookup[testName]).toBeFalsy();
          expectEventEmitted('pathupdated', '/');
          expectQueueChangedEmitted();
          done();
        });
      });
    });
  });

  describe('CopyPath', function () {
    it('testCopyPath', function (done) {
      addRequest('PUT');
      addRequestOptions('DELETE', testPath, testDestName, testLocalPrefix, testRemotePrefix);
      rq.copyPath(testPath, testDestPath, function (err) {
        expect(err).toBeFalsy();
        rq.getRequests(testPath, function (err, lookup) {
          expect(err).toBeFalsy();
          expect(lookup[testName]).toEqual('PUT');
          rq.getRequests(testDestPath, function (err, lookup) {
            expect(err).toBeFalsy();
            expect(lookup[testName]).toEqual('PUT');
            expect(lookup[testDestName]).toEqual('DELETE');
            expectEventEmitted('pathupdated', testPath, true);
            expectQueueChangedEmitted();
            done();
          });
        });
      });
    });

    it('testCopyPathSub', function (done) {
      addRequestOptions('PUT', testPath + '/sub', testName, testLocalPrefix, testRemotePrefix);
      rq.copyPath(testPath, testDestPath, function (err) {
        expect(err).toBeFalsy();
        rq.getRequests(testDestPath + '/sub', function (err, lookup) {
          expect(err).toBeFalsy();
          expect(lookup[testName]).toEqual('PUT');
          rq.getRequests(testPath + '/sub', function (err, lookup) {
            expect(err).toBeFalsy();
            expect(lookup[testName]).toEqual('PUT');
            expectEventEmitted('pathupdated', testPath, true);
            expectQueueChangedEmitted();
            done();
          });
        });
      });
    });
  });

  describe('QueueRequest', function () {
    it('testQueueRequestDelete', function (done) {
      queueAndVerify('DELETE', function (results) {
        expect(results.length).toEqual(1);
        expect(results[0].method).toEqual('DELETE');
        expect(results[0].name).toEqual(testName);
        expect(results[0].path).toEqual(testPath);
        expect(results[0].timestamp).not.toBeUndefined();
        expect(results[0].localPrefix).toEqual(testLocalPrefix);
        expect(results[0].remotePrefix).toEqual(testRemotePrefix);
        expectEventEmitted('itemupdated', testFullPath, true);
        expectQueueChangedEmitted();
        done();
      });
    });

    it('testQueueRequestDeletePut', function (done) {
      addRequest('PUT');
      queueAndVerify('DELETE', function (results) {
        expect(results.length).toEqual(0);
        expectEventEmitted('itemupdated', testFullPath);
        expectQueueChangedEmitted();
        done();
      });
    });

    it('testQueueRequestDeletePost', function (done) {
      queueAndVerifyReplace('POST', 'DELETE', function (results) {
        expectEventEmitted('itemupdated', testFullPath);
        expectQueueChangedEmitted();
        done();
      });
    });

    it('testQueueRequestDeleteMove', function (done) {
      queueAndVerifyReplace('MOVE', 'DELETE', function (results) {
        var valid = false;
        for (var i = 0; i < results.length; i++) {
          if (results[i].method == 'DELETE') {
            valid = (results[i].path == testPath && results[i].name == testName);
            break;
          }
        }
        expect(valid).toEqual(true);
        expectEventEmitted('itemupdated', testFullPath, true);
        expectEventEmitted('itemupdated', testFullDestPath, true);
        expectQueueChangedEmitted();
        done();
      });
    });

    it('testQueueRequestDeleteCopy', function (done) {
      queueAndVerifyReplace('COPY', 'DELETE', function (results) {
        expect(results.length).toEqual(2);
        var put = 0;
        var del = 1;
        if (results[1].method == 'PUT') {
          put = 1;
          del = 0;
        }
        expect(results[put].method).toEqual('PUT');
        expect(results[put].path).toEqual(testDestPath);
        expect(results[put].name).toEqual(testDestName);
        expect(results[del].method).toEqual('DELETE');
        expect(results[del].path).toEqual(testPath);
        expect(results[del].name).toEqual(testName);
        expectEventEmitted('itemupdated', testFullPath, true);
        expectEventEmitted('itemupdated', testFullDestPath, true);
        expectQueueChangedEmitted();
        done();
      });
    });

    it('testQueueRequestDeleteDelete', function (done) {
      queueAndVerifyReplace('DELETE', 'DELETE', function (results) {
        expectEventEmitted('itemupdated', testFullPath, true);
        expectQueueChangedEmitted();
        done();
      });
    });

    it('testQueueRequestPut', function (done) {
      queueAndVerify('PUT', function (results) {
        expectEventEmitted('itemupdated', testFullPath, true);
        expectQueueChangedEmitted();
        done();
      });
    });

    it('testQueueRequestPutPut', function (done) {
      queueAndVerifyReplace('PUT', 'PUT', function (results) {
        expectEventEmitted('itemupdated', testFullPath);
        expectQueueChangedEmitted();
        done();
      });
    });

    it('testQueueRequestPutPost', function (done) {
      queueAndVerifyNoReplace('POST', 'PUT', function (results) {
        expectEventEmitted('itemupdated', testFullPath);
        expectQueueChangedEmitted();
        done();
      });
    });

    it('testQueueRequestPutMove', function (done) {
      // move was previously queued. should result in an update of the
      // original asset (which would have been deleted otherwise) and
      // a PUT to the new location
      queueAndVerifyMethod('MOVE', 'PUT', 'POST', function (docs) {
        var verified = false;
        for (var i = 0; i < docs.length; i++) {
          if (docs[i].path == testDestPath && docs[i].name == testDestName) {
            expect(docs[i].method).toEqual('PUT');
            verified = true;
          }
        }
        expectEventEmitted('itemupdated', testFullPath, true);
        expectEventEmitted('itemupdated', testFullDestPath, true);
        expectQueueChangedEmitted();
        expect(verified).toEqual(true);
        done();
      });
    });

    it('testQueueRequestPutCopy', function (done) {
      // this should actually probably result in some sort of error state.
      // if a file was copied previously, then there shouldn't be a PUT
      // as a valid next request. However, verify the case anyway
      queueAndVerifyMethod('COPY', 'PUT', 'PUT', function (docs) {
        var verified = false;
        for (var i = 0; i < docs.length; i++) {
          if (docs[i].path == testDestPath && docs[i].name == testDestName) {
            expect(docs[i].method).toEqual('PUT');
            verified = true;
          }
        }
        expect(verified).toEqual(true);
        expectEventEmitted('itemupdated', testFullPath, true);
        expectEventEmitted('itemupdated', testFullDestPath, true);
        expectQueueChangedEmitted();
        done();
      });
    });

    it('testQueueRequestPutDelete', function (done) {
      queueAndVerifyReplace('DELETE', 'POST', function (results) {
        expectEventEmitted('itemupdated', testFullPath, true);
        expectQueueChangedEmitted();
        done();
      });
    });

    it('testQueueRequestPost', function (done) {
      queueAndVerify('POST', function (results) {
        expectEventEmitted('itemupdated', testFullPath, true);
        expectQueueChangedEmitted();
        done();
      });
    });

    it('testQueueRequestPostPut', function (done) {
      queueAndVerifyNoReplace('PUT', 'POST', function (results) {
        expectEventEmitted('itemupdated', testFullPath);
        expectQueueChangedEmitted();
        done();
      });
    });

    it('testQueueRequestPostPost', function (done) {
      queueAndVerifyReplace('POST', 'POST', function (results) {
        expectEventEmitted('itemupdated', testFullPath);
        expectQueueChangedEmitted();
        done();
      });
    });

    it('testQueueRequestPostMove', function (done) {
      queueAndVerifyMethod('MOVE', 'POST', 'POST', function (results) {
        expectEventEmitted('itemupdated', testFullPath, true);
        expectEventEmitted('itemupdated', testFullDestPath, true);
        expectQueueChangedEmitted();
        done();
      });
    });

    it('testQueueRequestPostCopy', function (done) {
      queueAndVerifyMethod('COPY', 'POST', 'POST', function (results) {
        expectEventEmitted('itemupdated', testFullPath, true);
        expectEventEmitted('itemupdated', testFullDestPath, true);
        expectQueueChangedEmitted();
        done();
      });
    });

    it('testQueueRequestPostDelete', function (done) {
      queueAndVerifyReplace('DELETE', 'POST', function (results) {
        expectEventEmitted('itemupdated', testFullPath, true);
        expectQueueChangedEmitted();
        done();
      });
    });

    it('testQueueRequestMove', function (done) {
      queueAndVerify('MOVE', function (docs) {
        expect(docs.length).toEqual(2);
        var put = docs[0];
        var del = docs[1];

        if (put.method == 'DELETE') {
          put = docs[1];
          del = docs[0];
        }
        expect(put.method).toEqual('PUT');
        expect(put.path).toEqual(testDestPath);
        expect(put.name).toEqual(testDestName);
        expect(put.timestamp).not.toBeUndefined();

        expect(del.method).toEqual('DELETE');
        expect(del.path).toEqual(testPath);
        expect(del.name).toEqual(testName);
        expect(put.timestamp).not.toBeUndefined();

        expectEventEmitted('itemupdated', testFullPath, true);
        expectEventEmitted('itemupdated', testFullDestPath, true);
        expectQueueChangedEmitted();
        done();
      });
    });

    it('testQueueRequestMovePut', function (done) {
      queueAndVerifyMethod('MOVE', 'PUT', 'POST', function (docs) {
        expect(docs.length).toEqual(2);
        var verified = false;
        for (var i = 0; i < docs.length; i++) {
          if (docs[i].path == testDestPath && docs[i].name == testDestName) {
            expect(docs[i].method).toEqual('PUT');
            verified = true;
          }
        }
        expect(verified).toEqual(true);
        expectEventEmitted('itemupdated', testFullPath, true);
        expectEventEmitted('itemupdated', testFullDestPath, true);
        expectQueueChangedEmitted();
        done();
      });
    });

    it('testQueueRequestMovePost', function (done) {
      queueAndVerifyReplace('MOVE', 'POST', function (docs) {
        expect(docs.length).toEqual(2);
        expectEventEmitted('itemupdated', testFullPath, true);
        expectEventEmitted('itemupdated', testFullDestPath, true);
        expectQueueChangedEmitted();
        done();
      });
    });

    it('testQueueRequestMoveMove', function (done) {
      queueAndVerifyMethod('MOVE', 'MOVE', 'DELETE', function (docs) {
        expect(docs.length).toEqual(2);
        expectEventEmitted('itemupdated', testFullPath, true);
        expectEventEmitted('itemupdated', testFullDestPath);
        expectQueueChangedEmitted();
        done();
      });
    });

    it('testQueueRequestMoveCopy', function (done) {
      queueAndVerifyMethod('COPY', 'MOVE', 'DELETE', function (docs) {
        expect(docs.length).toEqual(2);
        expectEventEmitted('itemupdated', testFullPath, true);
        expectEventEmitted('itemupdated', testFullDestPath);
        expectQueueChangedEmitted();
        done();
      });
    });

    it('testQueueRequestMoveDelete', function (done) {
      queueAndVerifyMethod('DELETE', 'MOVE', 'DELETE', function (docs) {
        expect(docs.length).toEqual(2);
        expectEventEmitted('itemupdated', testFullPath, true);
        expectEventEmitted('itemupdated', testFullDestPath, true);
        expectQueueChangedEmitted();
        done();
      });
    });

    it('testQueueRequestCopy', function (done) {
      queueAndVerify('COPY', function (docs) {
        expect(docs.length).toEqual(1);
        expect(docs[0].method).toEqual('PUT');
        expect(docs[0].path).toEqual(testDestPath);
        expect(docs[0].name).toEqual(testDestName);
        expect(docs[0].timestamp).not.toBeUndefined();
        expectEventEmitted('itemupdated', testFullPath, true);
        expectEventEmitted('itemupdated', testFullDestPath, true);
        expectQueueChangedEmitted();
        done();
      });
    });

    it('testQueueRequestCopyPut', function (done) {
      queueAndVerifyNoReplace('PUT', 'COPY', function (docs) {
        expect(docs.length).toEqual(2);
        var local = false;
        var dest = false;
        for (var i = 0; i < docs.length; i++) {
          if (docs[i].path == testDestPath && docs[i].name == testDestName) {
            dest = true;
          } else if (docs[i].path == testPath && docs[i].name == testName) {
            local = true;
          }
        }
        expect(dest).toEqual(true);
        expect(local).toEqual(true);
        expectEventEmitted('itemupdated', testFullPath, true);
        expectEventEmitted('itemupdated', testFullDestPath, true);
        expectQueueChangedEmitted();
        done();
      });
    });

    it('testQueueRequestCopyPost', function (done) {
      queueAndVerifyNoReplace('POST', 'COPY', function (docs) {
        expect(docs.length).toEqual(2);
        getDocPaths(docs[0], function (localPath1, remoteUrl1) {
          getDocPaths(docs[1], function (localPath2, remoteUrl2) {
            var method1 = docs[0].method;
            var method2 = docs[1].method;
            if (docs[0].method == 'POST') {
              var tmp = localPath1;
              localPath1 = localPath2;
              localPath2 = tmp;
              tmp = remoteUrl1;
              remoteUrl1 = remoteUrl2;
              remoteUrl2 = tmp;
              tmp = method1;
              method1 = method2;
              method2 = tmp;
            }
            expect(method1).toEqual('PUT');
            expect(method2).toEqual('POST');
            expect(localPath1).toEqual(testDestLocal);
            expect(remoteUrl1).toEqual(testDestRemote);
            expect(localPath2).toEqual(testLocal);
            expect(remoteUrl2).toEqual(testRemote);
            expectEventEmitted('itemupdated', testFullPath, true);
            expectEventEmitted('itemupdated', testFullDestPath, true);
            expectQueueChangedEmitted();
            done();
          });
        });
      });
    });

    it('testQueueRequestCopyMove', function (done) {
      // technically this should never happen, but if it did it would
      // result in no change to the move
      queueAndVerifyMethod('MOVE', 'COPY', 'DELETE', function (docs) {
        expect(docs.length).toEqual(2);
        expectEventEmitted('itemupdated', testFullPath, true);
        expectEventEmitted('itemupdated', testFullDestPath);
        expectQueueChangedEmitted();
        done();
      });
    });

    it('testQueueRequestCopyCopy', function (done) {
      queueAndVerify('COPY', function (docs) {
        queueAndVerify('COPY', function (docs) {
          expect(docs.length).toEqual(1);
          expect(docs[0].method).toEqual('PUT');
          getDocPaths(docs[0], function (localPath, remoteUrl) {
            expect(localPath).toEqual(testDestLocal);
            expect(remoteUrl).toEqual(testDestRemote);
            expectEventEmitted('itemupdated', testFullPath, true);
            expectEventEmitted('itemupdated', testFullDestPath);
            expectQueueChangedEmitted();
            done();
          });
        });
      });
    });

    it('testQueueRequestCopyDelete', function (done) {
      // technically this should never happen, but it would end up
      // as a move
      queueAndVerifyNoReplace('DELETE', 'COPY', function (docs) {
        expect(docs.length).toEqual(2);
        expectEventEmitted('itemupdated', testFullPath, true);
        expectEventEmitted('itemupdated', testFullDestPath, true);
        expectQueueChangedEmitted();
        done();
      });
    });

    it('testQueueRequestDotFile', function (done) {
      rq.queueRequest({
        method: 'DELETE',
        path: '/.badfile',
        localPrefix: './localdir',
        remotePrefix: 'http://localhost'
      }, function (err) {
        expect(err).toBeTruthy();
        common.db.find({}, function (e, results) {
          expect(e).toBeFalsy();
          expect(results.length).toEqual(0);
          done();
        });
      });
    });

    it('testQueueRequestDotFolder', function (done) {
      rq.queueRequest({
        method: 'DELETE',
        path: '/.badfolder/validfile',
        localPrefix: './localdir',
        remotePrefix: 'http://localhost'
      }, function (err) {
        expect(err).toBeTruthy();
        common.db.find({}, function (e, results) {
          expect(e).toBeFalsy();
          expect(results.length).toEqual(0);
          done();
        });
      });
    });
  });
});
 