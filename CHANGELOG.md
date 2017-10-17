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