# osx-provision-utils

Tools for listing and reading iOS/Mac provisioning profiles on OS X.

## Install

```
$ npm install moonbot/osx-provision-utils -g
```

## Command-Line Usage

To list all available iOS profiles:

```
$ profile-tool list
11111111-AAAA-2222-BBBB-333344445555 - 'My App Distribution'
```

To list all available Mac profiles:

```
$ profile-tool list --mac
11111111-AAAA-2222-BBBB-333344445555 - 'My App Distribution'
```

To see details of a profile names "My App Distribution":

```
$ profile-tool info "My App Distribution"
Name: My App Distribution
UUID: 11111111-AAAA-2222-BBBB-333344445555
Created On: Fri Jan 24 2014 12:01:46 GMT-0600 (CST)
```

To find the path of the profile:

```
$ profile-tool path "My App Distribution"
/Path/To/11111111-AAAA-2222-BBBB-333344445555.mobileprovision
```

More command options can be seen by running the tool with no arguments:

```
$ profile-tool
```

## Node Usage Example

``` js
var prov = require('osx-provision-utils');
var profile = prov.findProfileByName('My App Distribution');
console.log(profile.name);
```

## Why Node?

This tool was developed as part of a Node based build system, so here it is.

## License

MIT