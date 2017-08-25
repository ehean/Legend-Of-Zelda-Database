var express = require('express')
var bodyParser = require('body-parser')
var multer = require('multer')
var upload = multer()

var app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
// for parsing multipart/form-data
app.use(upload.array())
app.use(express.static('public'))

var mysql = require('./dbcon.js')
var handlebars = require('express-handlebars').create({defaultLayout:'main'})


app.engine('handlebars', handlebars.engine)
app.set('view engine', 'handlebars')

app.set('port', process.argv[2])

function renderTables(req, res) {
	var context = {}
	mysql.pool.query("SELECT id, title, DATE_FORMAT(yearReleased, \'%m-%d-%Y\') AS yearReleased, sales FROM Games", function(err, rows, fields){
		if(err){
			return
		}
		context.gameResults = rows
		mysql.pool.query("SELECT id, name, DATE_FORMAT(yearReleased, \'%m-%d-%Y\') AS yearReleased, sales, handheld FROM Consoles", function(err, rows, fields){
			if(err){
				return
			}
			context.consoleResults = rows
				mysql.pool.query("SELECT id, name FROM Locations", function(err, rows, fields){
				if(err){
					return
				}
				context.locationResults = rows
				mysql.pool.query("SELECT id, name, locationID FROM Characters", function(err, rows, fields){
					if(err){
						return
					}
					context.characterResults = rows
					console.log("rendering tables")
					res.render('home', context)
				});
			});
		});
	});
}

app.get('/', function(req, res, next) {
	renderTables(req, res)
});

app.post('/', function(req,res,next){
	console.log(req.body.event)
	if (req.body.event == 'removeRelationship') {
		if (req.body.parentTable == 'Games') {
			mysql.pool.query("DELETE FROM Games_Characters WHERE (gameID=? AND characterID=?)", [req.body.parentID, req.body.childID], function (err, result) {
				if (err) {
					next(err)
					return
				}
				res.send(JSON.stringify(result))
			})
		}
		else if (req.body.parentTable == 'Consoles') {
			console.log("remove from consoles")
			mysql.pool.query("DELETE FROM Games_Consoles WHERE (consoleID=? and gameID=?)", [req.body.parentID, req.body.childID], function (err, result) {
				if (err) {
					next(err)
					return
				}
				res.send(JSON.stringify(result))
			})
		}
	}
	else if (req.body.event == 'changeRelationship') {
		console.log(req.body.id1)
		console.log(req.body.id2)
		if (req.body.relationship == 'Games_Consoles') {

			mysql.pool.query("INSERT INTO Games_Consoles SET consoleID=?, gameID=?", [req.body.id1, req.body.id2], function (err, result) {
				if (err) {
					next(err)
					return
				}
				res.send(JSON.stringify(result))
			})
		}
		else if (req.body.relationship == 'Games_Characters') {
			mysql.pool.query("INSERT INTO Games_Characters SET gameID=?, characterID=?", [req.body.id1, req.body.id2], function (err, result) {
				if (err) {
					next(err)
					return
				}
				res.send(JSON.stringify(result))
			})
		}
		else if (req.body.relationship == 'Homeworld') {
			mysql.pool.query("UPDATE Characters SET locationID=? WHERE id=?", [req.body.id1, req.body.id2], function (err, result) {
				if (err) {
					next(err)
					return
				}
				res.send(JSON.stringify(result))
			})
		}
	}
	else if (req.body.event == 'relationship') {
		if (req.body.entityName == 'Games') {
			console.log(req.body.id)
			results = []
			mysql.pool.query("SELECT id, title, DATE_FORMAT(yearReleased, \'%m-%d-%Y\') AS yearReleased, sales FROM Games WHERE id=?", [req.body.id], function(err, result) {
				if(err) {
					return
				}
				results.push({"Games": result})
				mysql.pool.query("SELECT c.id, c.name, DATE_FORMAT(c.yearReleased, \'%m-%d-%Y\') AS yearReleased, c.sales, c.handheld FROM Consoles c INNER JOIN Games_Consoles gc ON c.id = gc.consoleID INNER JOIN Games g ON g.id = gc.gameID WHERE g.id=?", 
				[req.body.id], function(err, result) {
					if(err) {
						return
					}
					results.push({"Consoles": result})
					mysql.pool.query('SELECT c.id, c.name FROM Characters c INNER JOIN Games_Characters gc ON c.id = gc.characterID INNER JOIN Games g ON g.id = gc.gameID WHERE g.id=?', 
					[req.body.id], function(err, result) {
						if(err) {
							return
						}
						results.push({"Characters": result})
						mysql.pool.query('SELECT DISTINCT l.id, l.name FROM Locations l INNER JOIN Characters c ON l.id = c.locationID INNER JOIN Games_Characters gc ON gc.characterID = c.id INNER JOIN Games g ON g.id = gc.gameID WHERE g.id=?', 
						[req.body.id], function(err, result) {
							if(err) {
								return
							}
							results.push({"Locations": result})
							console.log(results)
							res.send(JSON.stringify(results))
						})
					})
				})
			})
		}
		else if (req.body.entityName == 'Consoles') {
			console.log(req.body.id)
			results = []
			mysql.pool.query("SELECT id, name, DATE_FORMAT(yearReleased, \'%m-%d-%Y\') AS yearReleased, sales, handheld FROM Consoles WHERE id=?", [req.body.id], function(err, result) {
				if(err) {
					return
				}
				results.push({"Consoles": result})
				console.log(results)
				mysql.pool.query("SELECT g.id, g.title, DATE_FORMAT(g.yearReleased, \'%m-%d-%Y\') AS yearReleased, g.sales FROM Games g INNER JOIN Games_Consoles gc ON g.id = gc.gameID INNER JOIN Consoles c ON c.id = gc.consoleID WHERE c.id=?", 
				[req.body.id], function(err, result) {
					if(err) {
						return
					}
					results.push({"Games": result})
					console.log(results)
					mysql.pool.query('SELECT DISTINCT ch.id, ch.name FROM Characters ch INNER JOIN Games_Characters gch ON ch.id = gch.characterID INNER JOIN Games g ON g.id = gch.gameID INNER JOIN Games_Consoles gc ON gc.gameID = g.id INNER JOIN Consoles c ON c.id = gc.consoleID WHERE c.id=?', 
					[req.body.id], function(err, result) {
						if(err) {
							return
						}
						results.push({"Characters": result})
						console.log(results)
						mysql.pool.query('SELECT DISTINCT l.id, l.name FROM Locations l INNER JOIN Characters ch ON l.id = ch.locationID INNER JOIN Games_Characters gch ON gch.characterID = ch.id INNER JOIN Games g ON g.id = gch.gameID INNER JOIN Games_Consoles gc ON gc.gameID = g.id INNER JOIN Consoles c ON c.id = gc.consoleID WHERE c.id=?', 
						[req.body.id], function(err, result) {
							if(err) {
								return
							}
							results.push({"Locations": result})
							console.log(results)
							res.send(JSON.stringify(results))
						})
					})
				})
			})
		}
		else if (req.body.entityName == 'Characters') {
			console.log(req.body.id)
			results = []
			mysql.pool.query("SELECT id, name FROM Characters WHERE id=?", [req.body.id], function(err, result) {
				if(err) {
					return
				}
				results.push({"Characters": result})
				console.log(results)
				mysql.pool.query("SELECT DISTINCT g.id, g.title, DATE_FORMAT(g.yearReleased, \'%m-%d-%Y\') AS yearReleased, g.sales FROM Games g INNER JOIN Games_Characters gc ON g.id = gc.gameID INNER JOIN Characters c ON c.id = gc.characterID WHERE c.id=?", 
				[req.body.id], function(err, result) {
					if(err) {
						return
					}
					results.push({"Games": result})
					console.log(results)
					mysql.pool.query('SELECT DISTINCT c.id, c.name, DATE_FORMAT(c.yearReleased, \'%m-%d-%Y\') AS yearReleased, c.sales, c.handheld FROM Characters ch INNER JOIN Games_Characters gch ON ch.id = gch.characterID INNER JOIN Games g ON g.id = gch.gameID INNER JOIN Games_Consoles gc ON gc.gameID = g.id INNER JOIN Consoles c ON c.id = gc.consoleID WHERE ch.id=?', 
					[req.body.id], function(err, result) {
						if(err) {
							return
						}
						results.push({"Consoles": result})
						console.log(results)
						mysql.pool.query('SELECT DISTINCT l.id, l.name FROM Locations l INNER JOIN Characters ch ON l.id = ch.locationID WHERE ch.id=?', 
						[req.body.id], function(err, result) {
							if(err) {
								return
							}
							results.push({"Locations": result})
							console.log(results)
							res.send(JSON.stringify(results))
						})
					})
				})
			})
		}
		else if (req.body.entityName == 'Locations') {
			console.log(req.body.id)
			results = []
			mysql.pool.query("SELECT id, name FROM Locations WHERE id=?", [req.body.id], function(err, result) {
				if(err) {
					return
				}
				results.push({"Locations": result})
				console.log(results)
				mysql.pool.query("SELECT DISTINCT g.id, g.title, DATE_FORMAT(g.yearReleased, \'%m-%d-%Y\') AS yearReleased, g.sales FROM Games g INNER JOIN Games_Characters gc ON g.id = gc.gameID INNER JOIN Characters c ON c.id = gc.characterID INNER JOIN Locations l ON l.id = c.locationID WHERE l.id=?", 
				[req.body.id], function(err, result) {
					if(err) {
						return
					}
					results.push({"Games": result})
					console.log(results)
					mysql.pool.query('SELECT DISTINCT c.id, c.name, DATE_FORMAT(c.yearReleased, \'%m-%d-%Y\') AS yearReleased, c.sales, c.handheld FROM Locations l INNER JOIN Characters ch ON ch.locationID = l.id INNER JOIN Games_Characters gch ON ch.id = gch.characterID INNER JOIN Games g ON g.id = gch.gameID INNER JOIN Games_Consoles gc ON gc.gameID = g.id INNER JOIN Consoles c ON c.id = gc.consoleID WHERE l.id=?', 
					[req.body.id], function(err, result) {
						if(err) {
							return
						}
						results.push({"Consoles": result})
						console.log(results)
						mysql.pool.query('SELECT DISTINCT c.id, c.name FROM Locations l INNER JOIN Characters c ON l.id = c.locationID WHERE l.id=?', 
						[req.body.id], function(err, result) {
							if(err) {
								return
							}
							results.push({"Characters": result})
							console.log(results)
							res.send(JSON.stringify(results))
						})
					})
				})
			})
		}
	}
	else if (req.body.event == 'search') {
		console.log(req.body.searchTerm)
		var term = '%'.concat(req.body.searchTerm, '%')
		var results = []
		mysql.pool.query("SELECT title FROM Games WHERE title LIKE ?", [term], function(err, rows, result){
			if(err){
				return
			}
			console.log(rows)
			var Games = [rows]
			Games.unshift("Game")
			mysql.pool.query("SELECT name FROM Consoles WHERE name LIKE ?", [term], function(err, rows, result){
				if(err){
					return
				}
				console.log(rows)
				var Consoles = [rows]
				Consoles.unshift("Console")
				mysql.pool.query("SELECT name FROM Locations WHERE name LIKE ?", [term], function(err, rows, result){
					if(err){
						return
					}
					console.log(rows)
					var Locations = [rows]
					Locations.unshift("Locations")
					mysql.pool.query("SELECT name FROM Characters WHERE name LIKE ?", [term], function(err, rows, result){
						if(err){
							return
						}
						console.log(rows)
						var Characters = [rows]
						Characters.unshift("Characters")
						results = [Games, Consoles, Locations, Characters]
						console.log(results)
						res.send(JSON.stringify(results))
					})
				})
			})
		})
	}
	else if (req.body.event == 'delete') {
		if (req.body.table == 'Games') {
			mysql.pool.query("DELETE FROM Games WHERE id=? ", [req.body.id], function(err, result){
				if(err){
					next(err)
					return
				}
				else {
					res.send({"event":req.body.event, "table": req.body.table, "id": req.body.id})
				}     
			})
		}
		else if (req.body.table == 'Consoles') {
			mysql.pool.query("DELETE FROM Consoles WHERE id=? ", [req.body.id], function(err, result){
				if(err){
					next(err)
					return
				}
				else {
					res.send({"event":req.body.event, "table": req.body.table, "id": req.body.id})
				}     
			})
		}
		else if (req.body.table == 'Locations') {
			mysql.pool.query("DELETE FROM Locations WHERE id=? ", [req.body.id], function(err, result){
				if(err){
					next(err)
					return
				}
				else {
					res.send({"event":req.body.event, "table": req.body.table, "id": req.body.id})
				}     
			})
		}
		else if (req.body.table == 'Characters') {
			mysql.pool.query("DELETE FROM Characters WHERE id=? ", [req.body.id], function(err, result){
				if(err){
					next(err)
					return
				}
				else {
					res.send({"event":req.body.event, "table": req.body.table, "id": req.body.id})
				}     
			})
		}
	}
	else if (req.body.event == 'insert') {
		console.log(req.body.table)
		if (req.body.table == 'Games') {
			if (req.body.data[0] != '') {
				mysql.pool.query("INSERT INTO Games SET title=?, yearReleased=?, sales=?", [req.body.data[0], req.body.data[1], req.body.data[2]], function(err, result){
					if(err){
						next(err)
						return
					}
				});
				mysql.pool.query("SELECT id, title, DATE_FORMAT(yearReleased, \'%m-%d-%Y\') AS yearReleased, sales FROM Games ORDER BY id DESC LIMIT 1", function(err, result) {
					if(err) {
						next(err)
						return
					}
					else {
						res.send(JSON.stringify(result))
					}
				});
			}
		}
		else if (req.body.table == 'Consoles') {
			if (req.body.data[0] != '') {
				mysql.pool.query("INSERT INTO Consoles SET name=?, yearReleased=?, sales=?, handheld=?", [req.body.data[0], req.body.data[1], req.body.data[2], req.body.data[3]], function(err, result){
					if(err){
						next(err)
						return
					}
				});
				mysql.pool.query("SELECT id, name, DATE_FORMAT(yearReleased, \'%m-%d-%Y\') AS yearReleased, sales, handheld FROM Consoles ORDER BY id DESC LIMIT 1", function(err, result) {
					if(err) {
						next(err)
						return
					}
					else {
						res.send(JSON.stringify(result))
					}
				});
			}
		} 
		else if (req.body.table == 'Locations') {
			if (req.body.data[0] != '') {
				mysql.pool.query("INSERT INTO Locations SET name=?", [req.body.data[0]], function(err, result){
					if(err){
						next(err)
						return
					}
				});
				mysql.pool.query("SELECT id, name FROM Locations ORDER BY id DESC LIMIT 1", function(err, result) {
					if(err) {
						next(err)
						return
					}
					else {
						res.send(JSON.stringify(result))
					}
				});
			}
		} 
		else if (req.body.table == 'Characters') {
			if (req.body.data[0] != '') {
				mysql.pool.query("INSERT INTO Characters SET name=?, locationID=?", [req.body.data[0], req.body.data[1]], function(err, result){
					if(err){
						next(err)
						return
					}
				});
				mysql.pool.query("SELECT id, name, locationID FROM Characters ORDER BY id DESC LIMIT 1", function(err, result) {
					if(err) {
						next(err)
						return
					}
					else {
						res.send(JSON.stringify(result))
					}
				});
			} 
		}
	}
	else {
		renderTables(req, res)
	}
});


app.use(function(req,res){
  res.type('text/plain')
  res.status(404)
  res.send('404 - Not Found')
});

app.use(function(err, req, res, next){
  console.error(err.stack)
  res.type('application/json')
  //res.status(500)
  res.send(JSON.stringify(err))
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.')
});
