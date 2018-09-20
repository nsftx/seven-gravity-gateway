## 1.9.2 (2018-09-20)

####Fixed
- Fix wrong version log (T55128)

## 1.9.1 (2018-09-12)

####Added
- Enable cross context method execution (T51923) 

## 1.8.3 (2018-09-03)

####Fixed
- Prevent event listener duplication (T53843)

## 1.8.2 (2018-08-06)

- Bump version

## 1.8.1 (2018-08-06)

####Fixed
- Fix event handler reference (T52834)

## 1.8.0 (2018-07-27)

####Added
- Add option to toggle slave event dispatching (T52050)

## 1.7.1 (2018-06-11)

####Fixed
- Fix event wildcard propagation (4720189473c2)

## 1.7.0 (2018-06-11)

####Added
- Add wildcard to propagate all keyboard events (T49364)

## 1.6.0 (2018-05-04)

####Added
- Show info about version compatibility (T47385)

## 1.5.0 (2018-04-27)

####Added
- Make promise based communication easier (T47102)

## 1.4.5 (2018-04-26)

####Fixed
- Ignore spammy non gateway messages vol 2(d4bde4dc2b21)

## 1.4.4 (2018-04-04)

####Fixed
- Revert resize event handler (T46818)

## 1.4.3 (2018-04-04)

####Fixed
- Revert resize event handler (T46516)

## 1.4.2 (2018-03-30)

####Fixed
- Fix property (e22c227414dc)

## 1.4.1 (2018-03-30)

####Fixed
- Fix this context (9b85656a693e)

## 1.4.0 (2018-03-30)

####Added
- Add option to declare domain for msg exchange(be46f36a0a4b)

####Changed

- Ignore spammy non gateway messages (ddedbaf07dd6)

## 1.3.1 (2018-02-01)

####Fixed
- Fix event deduplication typo (T43667)

## 1.3.0 (2018-01-30)

####Added
- Add `getAll` and `sendToAll` to master API (66f5c3c089b1)
- Support `Slave.AddEvent` msg and add method for manual event extend (750243cc9c68)

## 1.2.6 (2018-01-29)

####Changed
- Bump version

## 1.2.5 (2018-01-29)

####Changed
- Bump version

## 1.2.4 (2018-01-29)

####Fixed

- Fix npmignore files (c68d29a9a2d8)

## 1.2.3 (2018-01-29)

####Fixed

- Fix `resetFrame` c/p error (T43347)

## 1.2.0 (2017-10-17)

####Fixed

- Fix exception when config is missing (T37777)

####Changed

- Remove resize event from list of listeners (d40d797d51e7)

####Added

- Add aliases for methods `subscribe`, `unsubscribe`, `sendMessage`, `sendMessageAsync` (T37777)
- Add support for async message exchange (T37777)

## 1.1.5 (2017-09-06)

####Fixed

- Fix module bundling for minified modules (18666b1001f8)

## 1.1.4 (2017-09-06)

####Fixed

- Fix autoResize property on master frame (5cc275c84591)

## 1.1.1 (2017-08-09)

####Added

- Add autoResize setting to master gateway(c52345ba5866)

####Changed

- Set slaves/products object as optional in master gateway(c52345ba5866)

## 1.1.0 (2017-08-08)

####Added

- Expose modules global reference(95165d9d05ba, b48249fd6564)
- Added option to add slaves on fly(9366ac2ac542)
- Added option to remove slaves on fly(938746164bc6)

####Changed

- Normalized master load callback(d94bafa9643a)

####Deprecated

- Deprecated embedded require function in favour of UMD(b48249fd6564)
