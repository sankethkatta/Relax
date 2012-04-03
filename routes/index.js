
/*
 * GET home page.
 */

exports.index =  function(req, res) {
	console.log(req.session.username);
	res.render('index.ejs', {user: req.session.username});
};
