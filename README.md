# provision-utils

Tools for listing and reading iOS/Mac provisioning profiles on OS X.

## Install

	npm install osx-provision-utils

## Command-Line Usage

To list all available iOS profiles:

	profile-tool list

To list all available Mac profiles:

	profile-tool list --mac

To see details of a profile names "My App Distribution":

	profile-tool info "My App Distribution"

More command options can be seen by running the tool with no arguments:

	profile-tool

## Node Usage Example

	var prov = require('osx-provision-utils');
	var profile = prov.findProfileByName('My App Distribution');
	console.log(profile.name);

## License

MIT