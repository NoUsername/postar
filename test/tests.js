var assert = require('assert');

describe("Test the stats module", function() {
	it("and show that stats can be incremented", function() {
		var stats = require('../stats').create();
		stats.onGet();
		stats.onGet();
		stats.onGet();
		stats.onPost();
		assert.equal(3, stats.getStats().gets);
		assert.equal(1, stats.getStats().posts);
	});

	it("and show that stats don't alter internal data", function() {
		var stats = require('../stats').create();
		stats.onGet();
		assert.equal(1, stats.getStats().gets);
		var statData = stats.getStats();
		statData.gets = 15;
		assert.equal(1, stats.getStats().gets);
		stats.onGet();
		assert.equal(2, stats.getStats().gets);
	});

});