var Service, Characteristic;
var Linkshades = require('linkshades');

module.exports = function(homebridge) {
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	homebridge.registerAccessory("homebridge-linkshades", "Linkshades", LinkshadesAccessory);
};

function LinkshadesAccessory(log, config) {
	this.log = log
	this.log("entered new accessory");
	this.service = new Service.WindowCovering(this.name);
	this.log("created service");
	this.name = config.name || "Linkshade cover";
	this.id = config.id || 0;
	this.linkshade = new Linkshades(config.username, config.password, function() {this.loggedIn = true;});
	this.currentPosition = undefined;
	this.targetPosition = 100;

	this.positionState = Characteristic.PositionState.STOPPED;
	this.service.setCharacteristic(Characteristic.PositionState, Characteristic.PositionState.STOPPED);
	this.log("characteristic set");
	
}

LinkshadesAccessory.prototype = {
	identify: function(callback) {
		this.log("identify requested");
		callback(null);
	},
	getCurrentPosition: function(callback) {
		this.log("getCurrentPosition:", this.currentPosition);
		var error = null;
		callback(error, this.currentPosition);
	},
	getName: function(callback) {
		this.log("getName:", this.name);
		var error = null;
		callback(error, this.name);
	}, 
	getTargetPosition: function (callback) {
		this.log("getTargetPosition:", this.targetPosition);
		var error = null;
		callback(error, this.targetPosition);
	},
	setTargetPosition: function (value, callback) {
		this.log("setTargetPosition from %s to %s", this.targetPosition, value);
		this.targetPosition = value;
		this.currentPosition = this.targetPosition;
		this.service.setCharacteristic(Characteristic.CurrentPosition, this.currentPosition);
		this.linkshade.setShadeHeightAll(value, callback);
		callback(null);
	},
	getPositionState: function (callback) {
		this.log("getPositionState:", this.positionState);
		this.positionState = linkshade.getShadeHeight();
		var error = null;
		callback(error, this.positionState);
	}, 
	getServices: function() {
		var informationService = new Service.AccessoryInformation();
		informationService
			.setCharacteristic(Characteristic.Manufacturer, "Linkshades")
			.setCharacteristic(Characteristic.Model, "Test Model")
			.setCharacteristic(Characteristic.SerialNumber, "Test SerialNo");
		this.service
			.getCharacteristic(Characteristic.Name)
			.on('get', this.getName.bind(this));
		this.service
			.getCharacteristic(Characteristic.CurrentPosition)
			.on('get', this.getCurrentPosition.bind(this));
		this.service
			.getCharacteristic(Characteristic.TargetPosition)
			.on('get', this.getTargetPosition.bind(this))
			.on('set', this.setTargetPosition.bind(this))
		this.service
			.getCharacteristic(Characteristic.PositionState)
			.on('get', this.getPositionState.bind(this));
		return [informationService, this.service];
	}
};
