/* jslint node: true */
var website = {};

website.components = {};

(function (publics) {
	"use strict";

	website.components.socketio = require('../components/controllers/socket-io');
	website.components.editAtlas = require('../components/controllers/edit-atlas');

	publics.loadModules = function () {
		var NA = this;

		NA.modules.cookie = require('cookie');
		NA.modules.socketio = require('socket.io');
	};

	publics.setConfigurations = function (next) {
		var NA = this,
			socketio = NA.modules.socketio,
			params = {};

		website.components.socketio.initialisation.call(NA, socketio, function (socketio) {
			params.socketio = socketio;
			website.asynchrones.call(NA, params);
			next();
		});
	};

	publics.asynchrones = function (params) {
		var NA = this,
			socketio = params.socketio;

		socketio.sockets.on('connection', function (socket) {
			website.components.editAtlas.sockets.call(NA, socket, true, !NA.webconfig._modeDemo);

			socket.on('load-sections', function (dataEmit) {
		        var data = {},
	        		currentVariation = {};

        		/* Asynchrone render of template and variations */
				currentVariation = NA.addSpecificVariation(dataEmit.variation + ".json", dataEmit.lang, currentVariation);
		        currentVariation = NA.addCommonVariation(dataEmit.lang, currentVariation);

		        /* Asynchrone addon for editAtlas render */
				currentVariation.fs = dataEmit.lang + "/" + dataEmit.variation + ".json";
				currentVariation.fc = dataEmit.lang + "/" + NA.webconfig.commonVariation;
				currentVariation = website.components.editAtlas.setFilters.call(NA, currentVariation);

				/* Asynchrone Top Components */
		        data.topPart = {};
		        data.topPart.offers = NA.newRender("section-offers.htm", currentVariation);
		        data.topPart.offers = NA.newRender("section-offers.htm", currentVariation);
		        data.topPart.bepo = NA.newRender("section-bepo.htm", currentVariation);
		        data.topPart.book = NA.newRender("section-book.htm", currentVariation);
		        data.topPart.website = NA.newRender("section-website.htm", currentVariation);
		        data.topPart.blog = NA.newRender("section-blog.htm", currentVariation);
		        data.topPart["front-end"] = NA.newRender("section-front-end.htm", currentVariation);
		        data.topPart["unknown-top"] = NA.newRender("section-unknown-top.htm", currentVariation);

				/* Asynchrone Top Components */
				data.bottomPart = {};
		        data.bottomPart["unknown-bottom"] = NA.newRender("section-unknown-bottom.htm", currentVariation);
		        data.bottomPart.websites = NA.newRender("section-websites.htm", currentVariation);
		        data.bottomPart.skills = NA.newRender("section-skills.htm", currentVariation);
		        data.bottomPart['contact-me'] = NA.newRender("section-contact-me.htm", currentVariation);
		        data.bottomPart['about-me'] = NA.newRender("section-about-me.htm", currentVariation);
		        data.bottomPart.nodeatlas = NA.newRender("section-nodeatlas.htm", currentVariation);
		        data.bottomPart.games = NA.newRender("section-games.htm", currentVariation);

		        /* Load Components */
				socket.emit('load-sections', data);
			});
		});
	};

	publics.changeVariation = function (params, mainCallback) {
		var NA = this,
			variation = params.variation;

		// variation.fs = false;
		// variation.fc = false;
		/*if (session.hasPermissionForEdit) {*/
			// Le fichier spécifique utilisé pour générer cette vue.
			variation.fs = ((variation.languageCode) ? variation.languageCode + "/": "") + variation.currentRouteParameters.variation;
			// Le fichier commun utilisé pour générer cette vue.
			variation.fc = ((variation.languageCode) ? variation.languageCode + "/": "") + variation.webconfig.commonVariation;
		/*}*/

		variation = website.components.editAtlas.setFilters.call(NA, variation);

		mainCallback(variation);
	};

}(website));

exports.loadModules = website.loadModules;
exports.setConfigurations = website.setConfigurations;
exports.changeVariation = website.changeVariation;