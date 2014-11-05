#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var prov = require('../lib/provisioning');

function printUsage() {
	console.log("profile-tool COMMAND [OPTIONS]\n");
	console.log("Commands:\n");
	console.log("\tlist\n\t\tLists all available profiles\n");
	console.log("\tinfo PROFILE\n\t\tOutputs info about the profile corresponding to the given name/UUID/path.\n");
	console.log("\tuuid PROFILE\n\t\tOutputs the UUID of the profile corresponding to the given name/path.\n");
	console.log("\tname PROFILE\n\t\tOutputs the name of the profile corresponding to the given UUID/path.\n");
	console.log("\tpath PROFILE\n\t\tOutputs the path of the profile corresponding to the given name/UUID.\n");
	console.log("Options:\n");
	console.log("\t--mac\n\t\tLook at only OS X provisioning profiles.\n");
	console.log("\t--ios\n\t\tLook at only iOS provisioning profiles (Default).\n");
	console.log("\t--dump, -D\n\t\tDump entire profile in JSON format when used with 'info' command\n");
	console.log("\t--root\n\t\tSet the root folder containing the profiles.  Defaults to the system location for the current user.\n");
}

function checkArgs(expr) {
	if(expr) {
		printUsage();
		process.exit(-1);
	}
}

function findProfile(specifier, profileRoot, profileType) {
	var profile;

	// Try by path
	try {
		profile = prov.readProfile(specifier, specifier.match(/\.provisionprofile$/) ? prov.MAC_PROFILE : prov.IOS_PROFILE);
	} catch (e) {}

	// Try by name
	if(!profile) {
		try {
			profile = prov.findProfileByName(specifier, profileType, profileRoot);
		} catch(e) {}
	}

	// Try by UDID
	if(!profile) {
		try {
			profile = prov.findProfileByUUID(specifier, profileType, profileRoot);
		} catch(e) {}	
	}

	if(!profile) {
		console.log("Couldn't find profile specified.");
		process.exit(-1);
	}

	return profile;
}

checkArgs(process.argv.length < 3);

var mode = process.argv[2];

var argv = require('minimist')(process.argv.slice(3), {boolean: ['ios', 'mac', 'dump', 'D'], string: ['root'], alias: {'D': 'dump'}});

var type = argv.mac ? prov.MAC_PROFILE : prov.IOS_PROFILE;

if(mode == 'list') {
	var profiles = prov.allProfiles(type, argv.root);
	profiles.sort(function(a,b) { return b.name.toLowerCase().localeCompare(a.name.toLowerCase()); });

	for (var i = profiles.length - 1; i >= 0; i--) {
		console.log(profiles[i].uuid + ' - \'' + profiles[i].name + '\'');
	}
} else if(mode == 'uuid') {
	checkArgs(!argv._ || argv._.length != 1);

	var profile = findProfile(argv._[0], argv.root, type);
	console.log(profile.uuid);
} else if(mode == 'name') {
	checkArgs(!argv._ || argv._.length != 1);

	var profile = findProfile(argv._[0], argv.root, type);
	console.log(profile.name);
} else if(mode == 'path') {
	checkArgs(!argv._ || argv._.length != 1);

	var profile = findProfile(argv._[0], argv.root, type);
	console.log(profile.path);
} else if(mode == 'info') {
	checkArgs(!argv._ || argv._.length != 1);

	var profile = findProfile(argv._[0], argv.root, type);

	if(!argv.dump) {
		console.log("Name: " + profile.name);
		console.log("UUID: " + profile.uuid);
		console.log("Created On: " + profile.creationDate);
	} else {
		delete profile.plist['DeveloperCertificates'];
		console.log(profile.plist);
	}
}
