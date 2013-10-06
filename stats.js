/**
* postar stats, simple statistics tracker for postar
*/

function Constructor() {
	var gets = 0;
	var posts = 0;
	var since = new Date();

	this.onGet = function() {
		gets++;
	};
	this.onPost = function() {
		posts++;
	};
	this.getStats = function() {
		return {gets: gets, posts: posts, since: since};
	};
	return this;
}

exports.create = Constructor;
