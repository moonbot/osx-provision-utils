var fs = require('fs');
var path = require('path');
var plist = require('simple-plist');
var execSync = require('execSync').exec;

var MAC_PROFILE = 'mac';
var IOS_PROFILE = 'ios';

function extractPlistXML(data) {
	var start = data.indexOf("<plist");
	var end = data.indexOf("</plist>") + 8;
	var xml = data.substring(start, end);
	return xml;
}


exports.readProfile = function(filePath, type) {
	type = typeof type !== 'undefined' ? type : IOS_PROFILE;

	var xml;

	if(type == IOS_PROFILE) {
		var rawProfile = fs.readFileSync(filePath, 'utf8');

		xml = extractPlistXML(rawProfile);
	} else if (type == MAC_PROFILE) {
		var result = execSync('security cms -D -i "' + filePath + '"');
		if(result.code == 0) {
			xml = result.stdout;
		} else {
			console.log("Couldn't read Mac profile at path " + filePath);
			return null;
		}
	}

	var profile = plist.parse(xml);

	return {
		name: profile['Name'],
		expirationDate: profile['ExpirationDate'],
		creationDate: profile['CreationDate'],
		provisionedDevices: profile['ProvisionedDevices'],
		uuid: profile['UUID'].toUpperCase(),
		path: filePath,
		plist: profile
	};
};

exports.allProfiles = function(type, profileRoot) {
	type = typeof type !== 'undefined' ? type : IOS_PROFILE;
	if(!profileRoot)
		profileRoot = path.resolve(process.env.HOME + '/Library/MobileDevice/Provisioning Profiles');

	var profilePaths = fs.readdirSync(profileRoot);
	var profiles = [];

	for(var i = 0; i < profilePaths.length; i++) {
		if(type == IOS_PROFILE) {
			if(path.extname(profilePaths[i]) === '.mobileprovision') {
				var profile = exports.readProfile(path.join(profileRoot, profilePaths[i]), type);
				profiles.push(profile);
			}
		} else if(type == MAC_PROFILE) {
			if(path.extname(profilePaths[i]) === '.provisionprofile') {
				var profile = exports.readProfile(path.join(profileRoot, profilePaths[i]), type);
				profiles.push(profile);
			}
		}
	}

	return profiles;
}

exports.findProfileByName = function(profileName, type, profileRoot) {
	type = typeof type !== 'undefined' ? type : IOS_PROFILE;
	var profiles = exports.allProfiles(type, profileRoot);

	var match = null;

	for(var i = 0; i < profiles.length; i++) {
		var profile = profiles[i];
		if(profile.name == profileName) {
			if(!match) {
				match = profile;
			} else if(new Date(match.creationDate) > new Date(profile.creationDate)) {
				match = profile;
			}
		}
	}

	return match;
}

exports.findProfileByUUID = function(uuid, type, profileRoot) {
	type = typeof type !== 'undefined' ? type : IOS_PROFILE;
	var profiles = exports.allProfiles(type, profileRoot);

	for(var i = 0; i < profiles.length; i++) {
		var profile = profiles[i];
		if(profile.uuid.toLowerCase() === uuid.toLowerCase()) {
			return profile;
		}
	}

	return null;
}

exports.IOS_PROFILE = IOS_PROFILE;
exports.MAC_PROFILE = MAC_PROFILE;


